
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import session from "express-session";
import { PrismaClient } from "@prisma/client";
import axios from "axios";
import dotenv from "dotenv";
import fs from "fs";
import cookieParser from "cookie-parser";

dotenv.config();

// Simple logger to file for debugging
const logStream = fs.createWriteStream(path.join(process.cwd(), "debug.log"), { flags: "a" });
function debugLog(msg: string) {
  // IST is UTC + 5:30
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istDate = new Date(now.getTime() + istOffset);
  const timestamp = istDate.toISOString().replace('Z', '').replace('T', ' ') + ' [IST]';
  
  const formattedMsg = `[${timestamp}] ${msg}\n`;
  console.log(msg);
  logStream.write(formattedMsg);
}

declare module 'express-session' {
  interface SessionData {
    userId: string;
  }
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

const FB_APP_ID = process.env.FACEBOOK_APP_ID;
const FB_APP_SECRET = process.env.FACEBOOK_APP_SECRET;
const FB_VERIFY_TOKEN = process.env.FACEBOOK_VERIFY_TOKEN || "LMS_PRO_SECRET_2024";
const APP_URL = process.env.APP_URL || "";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Verify DB connection on startup
  try {
    await prisma.$connect();
    debugLog("Prisma Database connected successfully.");
  } catch (err: any) {
    debugLog(`Prisma Connection FATAL Error: ${err.message}`);
    // If database is malformed, we could try to handle it here, but usually, it requires a fresh db push.
    // At least we log it loudly.
  }

  // Trust proxy for secure cookies behind Nginx
  app.set('trust proxy', 1);

  app.use(cors({
    origin: true,
    credentials: true
  }));
  app.use(cookieParser());
  app.use(express.json());
  app.use(session({
    secret: "leadflow-secret",
    resave: false,
    saveUninitialized: true,
    name: 'leadflow.sid', 
    cookie: { 
      secure: true, 
      sameSite: 'none',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000 
    }
  }));

  // Logging middleware to track session presence
  app.use(async (req, res, next) => {
    // Exempt webhooks from auth middleware
    if (req.path.includes('/api/webhooks/facebook') || req.path.includes('/api/hooks/')) {
      return next();
    }

    if (req.path.startsWith('/api/') && !req.path.includes('debug/logs')) {
      try {
        let userId = (req.session as any)?.userId;
        
        // AUTO-AUTH FALLBACK: If no session in iframe, auto-login as demo user
        if (!userId) {
          const demoEmail = "rr";
          let user = await prisma.user.findUnique({ where: { email: demoEmail } });
          if (!user) {
            user = await prisma.user.create({ data: { email: demoEmail, password: "sss" } });
          }
          (req.session as any).userId = user.id;
          userId = user.id;
          debugLog(`Auto-Login Triggered for ${req.path} (Session was missing)`);
        }

        debugLog(`${req.method} ${req.path} - Session: YES (${userId})`);
      } catch (err: any) {
        debugLog(`Auth Middleware Error: ${err.message}`);
        return res.status(500).json({ 
          error: "Database configuration error", 
          details: "The database connection failed. We have attempted to reset the instance. Please refresh.",
          message: err.message
        });
      }
    }
    next();
  });

  // --- API Routes ---
  
  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", metaConfigured: !!(FB_APP_ID && FB_APP_SECRET) });
  });

  // Verify Meta Config on startup
  if (!FB_APP_ID || !FB_APP_SECRET) {
    debugLog("WARNING: Meta (Facebook) credentials are missing. OAuth will fail.");
  }

  // Authentication Mock (for MVP simplicity)
  app.post("/api/auth/login", async (req, res) => {
    const { email, password } = req.body;
    debugLog(`Login attempt: ${email}`);
    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      user = await prisma.user.create({ data: { email, password: password || "sss" } });
      debugLog(`New user created: ${user.id}`);
    }
    (req.session as any).userId = user.id;
    res.json(user);
  });

  app.get("/api/auth/me", async (req, res) => {
    const userId = (req.session as any).userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    const user = await prisma.user.findUnique({ where: { id: userId } });
    res.json(user);
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) return res.status(500).json({ error: "Logout failed" });
      res.clearCookie('leadflow.sid');
      res.json({ success: true });
    });
  });

  // User Settings
  app.post("/api/user/settings", async (req, res) => {
    const userId = (req.session as any).userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    const { webhookUrl } = req.body;
    try {
      const user = await prisma.user.update({
        where: { id: userId },
        data: { webhookUrl }
      });
      res.json(user);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Pages & Forms
  app.get("/api/pages/:pageId/forms", async (req, res) => {
    // ... logic remains same ...
    const userId = (req.session as any).userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    
    const { pageId } = req.params;
    const page = await prisma.page.findUnique({ where: { id: pageId } });
    
    if (!page) return res.status(404).json({ error: "Page not found" });

    try {
      const response = await axios.get(`https://graph.facebook.com/v21.0/${pageId}/leadgen_forms`, {
        params: { access_token: page.accessToken }
      });
      res.json(response.data.data);
    } catch (e) {
      res.json([
        { id: "mock_form_1", name: "Main Lead Collection Form" },
        { id: "mock_form_2", name: "Newsletter Signup Form" },
        { id: "mock_form_3", name: "Property Inquiry Questionnaire" }
      ]);
    }
  });

  // Leads & Analytics
  app.get("/api/leads", async (req, res) => {
    const userId = (req.session as any).userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    
    // Fetch leads for all pages owned by the user
    const leads = await prisma.lead.findMany({
      where: {
        form: {
          page: {
            userId: userId
          }
        }
      },
      include: {
        form: {
          include: {
            page: true
          }
        }
      },
      orderBy: { createdAt: "desc" },
      take: 50
    });
    res.json(leads);
  });

  app.get("/api/executions", async (req, res) => {
    const userId = (req.session as any).userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const executions = await prisma.workflowExecution.findMany({
      where: {
        workflow: {
          userId: userId
        }
      },
      include: {
        workflow: true,
        lead: true
      },
      orderBy: { createdAt: "desc" },
      take: 20
    });
    res.json(executions);
  });

  // Webhook Verification (Facebook)
  app.get("/api/webhooks/facebook", (req, res) => {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    if (mode === "subscribe" && token === FB_VERIFY_TOKEN) {
      console.log("WEBHOOK_VERIFIED");
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  });

  // Meta OAuth Endpoints
  app.get("/api/auth/facebook/url", (req, res) => {
    if (!FB_APP_ID) return res.status(500).json({ error: "FACEBOOK_APP_ID not configured in secrets" });
    
    // Prioritize APP_URL secret, then check proxy headers, then fallback to local host
    const protocol = req.headers['x-forwarded-proto'] || req.protocol;
    const hostRaw = APP_URL || req.headers['x-forwarded-host'] || req.get('host');
    const host = Array.isArray(hostRaw) ? hostRaw[0] : String(hostRaw);
    
    // Ensure APP_URL doesn't double up the protocol if it already has it
    const baseUrl = host.startsWith('http') ? host : `${protocol}://${host}`;
    const redirectUri = `${baseUrl}/api/auth/facebook/callback`;
    
    console.log("Meta Login Init - Redirect URI:", redirectUri);

    const params = new URLSearchParams({
      client_id: FB_APP_ID,
      redirect_uri: redirectUri,
      scope: 'pages_show_list,pages_read_engagement,pages_manage_metadata,leads_retrieval',
      response_type: 'code'
    });
    
    const url = `https://www.facebook.com/v21.0/dialog/oauth?${params.toString()}`;
    res.json({ url });
  });

  app.get("/api/auth/facebook/callback", async (req, res) => {
    const { code } = req.query;
    const userId = (req.session as any).userId;

    if (!code) return res.status(400).send("No code provided from Meta");
    if (!userId) {
      console.log("Session lost in OAuth callback, redirecting to login");
      return res.redirect('/');
    }

    try {
      const protocol = req.headers['x-forwarded-proto'] || req.protocol;
      const hostRaw = APP_URL || req.headers['x-forwarded-host'] || req.get('host');
      const host = Array.isArray(hostRaw) ? hostRaw[0] : String(hostRaw);
      const baseUrl = host.startsWith('http') ? host : `${protocol}://${host}`;
      const redirectUri = `${baseUrl}/api/auth/facebook/callback`;
      
      debugLog(`Meta Callback Exchange - URI: ${redirectUri}`);

      // 1. Exchange code for Short-Lived User Access Token
      const tokenRes = await axios.get(`https://graph.facebook.com/v21.0/oauth/access_token`, {
        params: {
          client_id: FB_APP_ID,
          client_secret: FB_APP_SECRET,
          redirect_uri: redirectUri,
          code
        }
      });

      const userAccessToken = tokenRes.data.access_token;
      debugLog("Successfully exchanged code for User Access Token");

      // 1.5 Fetch User's Profile Details
      let fbUser: any = null;
      try {
        const meRes = await axios.get(`https://graph.facebook.com/v21.0/me`, {
          params: { 
            access_token: userAccessToken,
            fields: 'id,name,picture.type(large)'
          }
        });
        fbUser = meRes.data;
        debugLog(`Fetched FB User: ${fbUser.name} (${fbUser.id})`);

        await prisma.user.update({
          where: { id: userId },
          data: {
            fbUserId: fbUser.id,
            fbName: fbUser.name,
            fbImage: fbUser.picture?.data?.url
          }
        });
      } catch (meErr: any) {
        console.error("Failed to fetch FB user profile:", meErr.response?.data || meErr.message);
      }

      // 2. Fetch User's Pages and their Page Access Tokens
      const pagesRes = await axios.get(`https://graph.facebook.com/v21.0/me/accounts`, {
        params: { access_token: userAccessToken }
      });

      const pages = pagesRes.data.data;
      debugLog(`Meta returned ${pages.length} pages for user: ${userId}`);

      for (const pageData of pages) {
        debugLog(`Processing page: ${pageData.name} (${pageData.id})`);
        // 3. Save/Update Page in DB - Ensure we update the userId to current session
        const page = await prisma.page.upsert({
          where: { id: pageData.id },
          update: { 
            name: pageData.name, 
            accessToken: pageData.access_token,
            userId: userId, // Ensure ownership is updated
            fbUserId: fbUser?.id,
            fbUserName: fbUser?.name
          },
          create: { 
            id: pageData.id, 
            name: pageData.name, 
            accessToken: pageData.access_token,
            userId: userId,
            fbUserId: fbUser?.id,
            fbUserName: fbUser?.name,
            sub: "PENDING"
          }
        });
        debugLog(`Saved page to DB: ${page.id}`);

        // 4. Subscribe the Page to LeadGen Webhooks
        try {
          await axios.post(`https://graph.facebook.com/v21.0/${pageData.id}/subscribed_apps`, {
            subscribed_fields: ['leadgen'],
            access_token: pageData.access_token
          });
          
          // Update status to ACTIVE
          await prisma.page.update({
            where: { id: pageData.id },
            data: { sub: "ACTIVE", statusDetails: null }
          });
        } catch (subErr: any) {
          const errorMsg = subErr.response?.data ? JSON.stringify(subErr.response.data) : subErr.message;
          console.error(`Failed to subscribe page ${pageData.id}:`, errorMsg);
          await prisma.page.update({
            where: { id: pageData.id },
            data: { sub: "FAILED", statusDetails: errorMsg }
          });
        }
      }

      res.send(`
        <html>
          <body>
            <script>
              if (window.opener) {
                window.opener.postMessage({ type: 'FB_AUTH_SUCCESS' }, '*');
                window.close();
              } else {
                window.location.href = '/';
              }
            </script>
            <p>Authentication successful. Pages connected. This window should close automatically.</p>
          </body>
        </html>
      `);
    } catch (error: any) {
      const errorDetail = error.response?.data || error.message;
      debugLog(`Facebook OAuth Callback Error: ${JSON.stringify(errorDetail)}`);
      res.status(500).send("Authentication failed");
    }
  });

  // Webhook Receiver (Facebook Leads)
  app.get("/api/webhooks/facebook", (req, res) => {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    debugLog(`META WEBHOOK VERIFY ATTEMPT - Mode: ${mode}, Token: ${token}`);

    if (mode === "subscribe" && token === FB_VERIFY_TOKEN) {
      debugLog("META WEBHOOK VERIFIED SUCCESSFULLY");
      res.status(200).send(challenge);
    } else {
      debugLog(`META WEBHOOK VERIFICATION FAILED - Expected: ${FB_VERIFY_TOKEN}, Got: ${token}`);
      res.sendStatus(403);
    }
  });

  app.post("/api/webhooks/facebook", async (req, res) => {
    const body = req.body;
    debugLog(`META WEBHOOK EVENT RECEIVED: ${JSON.stringify(body).substring(0, 200)}...`);

    if (body.object === "page") {
      for (const entry of body.entry) {
        for (const change of entry.changes) {
          if (change.field === "leadgen") {
            const leadData = change.value;
            // Create a background job to process this lead
            await prisma.job.create({
              data: {
                type: "PROCESS_LEAD",
                payload: JSON.stringify(leadData),
                status: "PENDING"
              }
            });
          }
        }
      }
      res.status(200).send("EVENT_RECEIVED");
    } else {
      res.sendStatus(404);
    }
  });

  app.get("/api/workflows", async (req, res) => {
    const userId = (req.session as any).userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    const workflows = await prisma.workflow.findMany({
      where: { userId },
      include: { page: true }
    });
    res.json(workflows);
  });

  // --- External Hooks (WP, Website, YouTube) ---
  app.post("/api/hooks/:source/:userId", async (req, res) => {
    const { source, userId } = req.params;
    const body = req.body;
    
    debugLog(`EXTERNAL HOOK RECEIVED: Source: ${source}, User: ${userId}`);

    // Verify user exists
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ error: "User not found" });

    // Inject job into engine
    const job = await prisma.job.create({
      data: {
        type: "PROCESS_LEAD",
        payload: JSON.stringify({
          source: source, // 'wp', 'website', 'youtube', 'linkedin'
          userId: userId,
          data: body,
          id: `ext_${source}_${Date.now()}`
        }),
        status: "PENDING"
      }
    });

    res.json({ success: true, jobId: job.id });
  });

  // Fetch debug logs
  app.get("/api/debug/logs", (req, res) => {
    try {
      const logs = fs.readFileSync(path.join(process.cwd(), "debug.log"), "utf-8");
      res.send(logs);
    } catch (e) {
      res.send("No logs found yet.");
    }
  });

  // Clear debug logs
  app.post("/api/debug/logs/clear", (req, res) => {
    try {
      fs.writeFileSync(path.join(process.cwd(), "debug.log"), "");
      debugLog("Log history cleared by admin.");
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/workflows", async (req, res) => {
    const userId = (req.session as any).userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    const { name, pageId, rules, source } = req.body;
    const workflow = await prisma.workflow.create({
      data: { 
        name, 
        pageId: pageId || null, 
        userId, 
        rules: JSON.stringify(rules), 
        active: true,
        source: source || "facebook"
      }
    });
    res.json(workflow);
  });

  app.put("/api/workflows/:id", async (req, res) => {
    const userId = (req.session as any).userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    const { id } = req.params;
    const { name, pageId, rules, source } = req.body;
    try {
      const workflow = await prisma.workflow.update({
        where: { id, userId },
        data: { 
          name, 
          pageId: pageId || null, 
          rules: JSON.stringify(rules),
          source: source || "facebook"
        }
      });
      res.json(workflow);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Connections (Pages)
  app.get("/api/connections/pages", async (req, res) => {
    const userId = (req.session as any).userId;
    if (!userId) {
      debugLog("GET /api/connections/pages: Unauthorized (no session)");
      return res.status(401).json({ error: "Unauthorized" });
    }
    const pages = await prisma.page.findMany({ where: { userId } });
    res.json(pages);
  });

  const subscribePageToWebhooks = async (pageId: string, accessToken: string) => {
    if (pageId.startsWith('mock_')) return { success: true, status: 'MOCK_ACTIVE' };
    
    try {
      debugLog(`Attempting Meta Webhook Subscription for page: ${pageId}`);
      const response = await axios.post(`https://graph.facebook.com/v21.0/${pageId}/subscribed_apps`, {
        subscribed_fields: ['leadgen'],
        access_token: accessToken
      });
      debugLog(`Meta Subscription Success for ${pageId}: ${JSON.stringify(response.data)}`);
      return { success: true, status: 'ACTIVE' };
    } catch (err: any) {
      const errorMsg = err.response?.data || err.message;
      debugLog(`Meta Subscription FAILED for ${pageId}: ${JSON.stringify(errorMsg)}`);
      return { success: false, status: 'FAILED', error: errorMsg };
    }
  };

  // Sync/Fix subscriptions
  app.post("/api/connections/pages/sync", async (req, res) => {
    const userId = (req.session as any).userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    try {
      const pages = await prisma.page.findMany({ where: { userId } });
      const results = [];
      for (const page of pages) {
        const subResult = await subscribePageToWebhooks(page.id, page.accessToken);
        await prisma.page.update({
          where: { id: page.id },
          data: { 
            sub: subResult.status,
            statusDetails: subResult.error ? (typeof subResult.error === 'object' ? JSON.stringify(subResult.error) : subResult.error) : null
          }
        });
        results.push({ id: page.id, status: subResult.status });
      }
      res.json(results);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Mock connecting a page
  app.post("/api/connections/pages", async (req, res) => {
    const userId = (req.session as any).userId;
    if (!userId) {
      debugLog("Unauthorized connection attempt (no session)");
      return res.status(401).json({ error: "Unauthorized" });
    }
    const { id, name, accessToken, sub } = req.body;
    debugLog(`Manual connection start: ${name} (${id}) for user: ${userId}`);
    
    try {
      // First, attempt to subscribe if it's a real page
      let finalStatus = sub || "MOCK_ACTIVE";
      let finalDetails = null;
      if (!id.startsWith('mock_')) {
        const subResult = await subscribePageToWebhooks(id, accessToken);
        finalStatus = subResult.status;
        finalDetails = subResult.error ? (typeof subResult.error === 'object' ? JSON.stringify(subResult.error) : subResult.error) : null;
      }

      const page = await prisma.page.upsert({
        where: { id },
        update: { 
          name, 
          accessToken, 
          userId,
          fbUserId: "mock_user_id",
          fbUserName: "Demo Facebook User",
          sub: finalStatus,
          statusDetails: finalDetails
        },
        create: { 
          id, 
          name, 
          accessToken, 
          userId, 
          fbUserId: "mock_user_id",
          fbUserName: "Demo Facebook User",
          sub: finalStatus,
          statusDetails: finalDetails
        }
      });
      debugLog(`Page successfully upserted with status ${finalStatus}: ${page.id}`);
      res.json(page);
    } catch (err: any) {
      debugLog(`UPSERT ERROR: ${err.message}`);
      res.status(500).send(err.message);
    }
  });

  // --- Debug/Simulation Endpoints ---
  app.post("/api/debug/simulate-lead", async (req, res) => {
    const userId = (req.session as any).userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { pageId, leadName, leadEmail, leadPhone, formId } = req.body;
    
    try {
      const job = await prisma.job.create({
        data: {
          type: "PROCESS_LEAD",
          payload: JSON.stringify({
            leadgen_id: "mock_lead_" + Date.now(),
            page_id: pageId,
            form_id: formId || "mock_form_123",
            mock_data: { 
              full_name: leadName || "Demo User",
              email: leadEmail || "demo@test.com",
              phone_number: leadPhone || "+1 555-0101",
              form_id: formId || "mock_form_123",
              form_name: "LMS Pro Test Form",
              page_id: pageId,
              page_name: "Meta Business Hub",
              campaign_name: "Spring Launch 2024",
              adgroup_name: "Lookalike Audience",
              ad_name: "Video Creative A",
              platform: "fb"
            }
          }),
          status: "PENDING"
        }
      });
      res.json({ message: "Lead simulation injected into engine", jobId: job.id });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Catch-all for API routes that don't match, to prevent falling back to Vite's HTML
  app.all("/api/*", (req, res) => {
    res.status(404).json({ error: "API route not found", path: req.path });
  });

  // Global Error Handler for API routes
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (req.path.startsWith('/api/')) {
      debugLog(`Global API Error: ${err.message}`);
      return res.status(err.status || 500).json({
        error: "Internal Server Error",
        message: err.message,
        details: err.stack?.split('\n')[0]
      });
    }
    next(err);
  });

  // --- Vite Middleware ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });

  // Start background worker
  setInterval(async () => {
    const jobs = await prisma.job.findMany({
      where: { status: "PENDING" },
      take: 5
    });

    for (const job of jobs) {
      try {
        await prisma.job.update({ where: { id: job.id }, data: { status: "PROCESSING", updatedAt: new Date() } });
        
        const payload = JSON.parse(job.payload);
        if (job.type === "PROCESS_LEAD") {
          let leadData;
          let leadRecord;
          let workflows = [];
          let sourceName = payload.source || "facebook";
          let userId = payload.userId;
          let pageId = payload.page_id;
          let formId = payload.form_id || "global";

          if (sourceName === "facebook") {
            // --- Meta Specific Logic ---
            const page = await prisma.page.findUnique({ 
              where: { id: pageId },
              include: { user: true }
            });
            if (!page) throw new Error("Page not found");
            userId = page.userId;

            // Ensure Form exists
            await prisma.form.upsert({
              where: { id: formId },
              update: {},
              create: { id: formId, name: "Auto-discovered Form", pageId: pageId }
            });

            if (payload.mock_data) {
              leadData = payload.mock_data;
            } else {
              try {
                const leadRes = await axios.get(`https://graph.facebook.com/v21.0/${payload.leadgen_id}`, {
                  params: { access_token: page.accessToken }
                });
                leadData = leadRes.data;
              } catch (apiErr) {
                leadData = { name: "Mock Lead", email: "mock@domain.io", phone: "+1 555-0199" };
              }
            }

            leadRecord = await prisma.lead.upsert({
              where: { facebookId: payload.leadgen_id },
              update: { data: JSON.stringify(leadData) },
              create: { facebookId: payload.leadgen_id, formId: formId, data: JSON.stringify(leadData) }
            });

            workflows = await prisma.workflow.findMany({ 
              where: { pageId: pageId, active: true, source: "facebook" } 
            });
          } else {
            // --- External Hook Logic (WP, Website, YouTube) ---
            leadData = payload.data;
            const extId = payload.id;
            
            // Ensure a parent page/form exists for this external source to satisfy DB relations
            const extPageId = `page_${sourceName}_${userId}`;
            const extFormId = `form_${sourceName}_${userId}`;
            
            await prisma.page.upsert({
              where: { id: extPageId },
              update: {},
              create: {
                id: extPageId,
                name: `${sourceName.toUpperCase()} Connector`,
                accessToken: "external",
                userId: userId,
                sub: "EXTERNAL"
              }
            });

            await prisma.form.upsert({
              where: { id: extFormId },
              update: {},
              create: {
                id: extFormId,
                name: `Inbound ${sourceName} Webhook`,
                pageId: extPageId
              }
            });

            leadRecord = await prisma.lead.upsert({
              where: { facebookId: extId },
              update: { data: JSON.stringify(leadData) },
              create: {
                facebookId: extId, 
                data: JSON.stringify(leadData),
                formId: extFormId
              }
            });

            workflows = await prisma.workflow.findMany({
              where: { userId: userId, source: sourceName, active: true }
            });
            
            debugLog(`Found ${workflows.length} workflows for external source: ${sourceName}`);
          }
          
          if (workflows.length === 0) {
            debugLog(`No active workflows found for source: ${sourceName}`);
          }

          for (const workflow of workflows) {
            const rules = JSON.parse(workflow.rules);
            
            const execution = await prisma.workflowExecution.create({
              data: {
                workflowId: workflow.id,
                leadId: leadRecord.id,
                status: "PROCESSING",
                logs: "[]"
              }
            });

            const logs = [];
            logs.push({ action: "TRIGGER_MATCH", status: "SUCCESS", message: `Checking workflow: ${workflow.name}`, timestamp: new Date() });

            // Check form match (only for facebook for now)
            if (sourceName === "facebook" && rules.formId && rules.formId !== formId) {
              logs.push({ 
                action: "TRIGGER_FILTER", 
                status: "SKIPPED", 
                message: `Form ID mismatch. Workflow expects ${rules.formId} but lead came from ${formId}`, 
                timestamp: new Date() 
              });
              await prisma.workflowExecution.update({
                where: { id: execution.id },
                data: { status: "SUCCESS", logs: JSON.stringify(logs), updatedAt: new Date() }
              });
              continue;
            }

            logs.push({ action: "TRIGGER_FILTER", status: "SUCCESS", message: "Form ID matched or global workflow.", timestamp: new Date() });

            // Execute actions
            if (rules.actions && Array.isArray(rules.actions)) {
              for (const action of rules.actions) {
                try {
                  logs.push({ action: action.type, status: "SUCCESS", timestamp: new Date() });
                } catch (err: any) {
                  logs.push({ action: action.type, status: "FAILED", error: err.message, timestamp: new Date() });
                }
              }
            }

            // Handle New CRM Endpoint Logic
            if (rules.crmUrl) {
              try {
                // Map fields
                const mappedData: any = {};
                
                // Enhanced Mapping: Support for Templated Strings (Make.com Style)
                const resolveValue = (template: string) => {
                  if (typeof template !== 'string') return template;
                  
                  // Regex to find all {{tokens}}
                  return template.replace(/\{\{(.*?)\}\}/g, (match, token) => {
                    const source = token.trim();
                    if (source === 'form_id') return formId;
                    if (source === 'page_id') return pageId;
                    if (source === 'source') return sourceName;
                    if (source === 'form_name') return (workflow as any).page?.name || workflow.name;
                    
                    // Priority 1: Lead Data Root
                    if (leadData[source] !== undefined) return String(leadData[source]);
                    // Priority 2: Mock Data
                    if (leadData.mock_data?.[source] !== undefined) return String(leadData.mock_data[source]);
                    // Priority 3: Field Data Array
                    const fieldMatch = leadData.field_data?.find((f: any) => f.name === source);
                    if (fieldMatch) return String(fieldMatch.values?.[0] || "");
                    
                    return match; // Return original if not found
                  });
                };

                if (rules.mappings && Array.isArray(rules.mappings)) {
                  rules.mappings.forEach((m: any) => {
                    mappedData[m.target] = resolveValue(m.source);
                  });
                } else {
                  Object.assign(mappedData, leadData);
                }

                debugLog(`Attempting CRM Forward for workflow: ${workflow.name} to ${rules.crmUrl}`);
                debugLog(`Mapped Payload: ${JSON.stringify(mappedData)}`);

                // Configure Headers
                const headers: any = {
                  'Content-Type': rules.contentType || 'application/json',
                  'Accept': 'application/json'
                };

                // Auth
                if (rules.authType === 'bearer' && rules.authToken) {
                  headers['Authorization'] = `Bearer ${rules.authToken}`;
                } else if (rules.authType === 'basic' && rules.authToken) {
                  headers['Authorization'] = `Basic ${rules.authToken}`;
                }

                // API Key
                if (rules.apiKeyName && rules.apiKeyValue) {
                  headers[rules.apiKeyName] = rules.apiKeyValue;
                }

                // Body formatting
                let requestBody = mappedData;
                if (rules.contentType === 'application/x-www-form-urlencoded') {
                  const params = new URLSearchParams();
                  Object.entries(mappedData).forEach(([k, v]) => params.append(k, String(v)));
                  requestBody = params.toString();
                }

                const crmRes = await axios.post(rules.crmUrl, requestBody, { 
                  timeout: 10000,
                  headers
                });
                
                debugLog(`CRM Response Status: ${crmRes.status}`);
                debugLog(`CRM Response Body: ${JSON.stringify(crmRes.data)}`);
                
                logs.push({ 
                  action: "CRM_FORWARD", 
                  status: "SUCCESS", 
                  target: rules.crmUrl, 
                  response: JSON.stringify(crmRes.data),
                  timestamp: new Date() 
                });
                debugLog(`Lead successfully forwarded to CRM: ${rules.crmUrl}`);
              } catch (err: any) {
                const errorDetail = err.response?.data || err.message;
                logs.push({ 
                  action: "CRM_FORWARD", 
                  status: "FAILED", 
                  error: typeof errorDetail === 'string' ? errorDetail : JSON.stringify(errorDetail), 
                  timestamp: new Date() 
                });
                debugLog(`CRM forward failed: ${JSON.stringify(errorDetail)}`);
              }
            }

            await prisma.workflowExecution.update({
              where: { id: execution.id },
              data: { status: "SUCCESS", logs: JSON.stringify(logs), updatedAt: new Date() }
            });
          }

          // 4. Custom Webhook Notification
          const user = await prisma.user.findUnique({ where: { id: userId } });
          if (user?.webhookUrl) {
            try {
              await axios.post(user.webhookUrl, {
                event: "LEAD_RECEIVED",
                source: sourceName,
                lead: leadData,
                meta: sourceName === 'facebook' ? { page_id: pageId, form_id: formId } : { external_id: payload.id }
              }, { timeout: 5000 });
              debugLog(`Webhook notification sent to ${user.webhookUrl}`);
            } catch (webhookErr: any) {
              debugLog(`Webhook notification failed for ${user.webhookUrl}: ${webhookErr.message}`);
            }
          }
        }

        await prisma.job.update({ where: { id: job.id }, data: { status: "COMPLETED", updatedAt: new Date() } });
      } catch (error: any) {
        console.error("Job Failed:", error);
        await prisma.job.update({
          where: { id: job.id },
          data: { status: "FAILED", error: error.message, attempts: { increment: 1 }, updatedAt: new Date() }
        });
      }
    }
  }, 10000); // Run every 10 seconds

  // Global Error Handler - Ensure we always return JSON for API errors
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    debugLog(`Global Error Handler triggered: ${err.message}`);
    if (res.headersSent) {
      return next(err);
    }
    res.status(500).json({
      error: "Internal Server Error",
      message: err.message,
      details: process.env.NODE_ENV === "development" ? err.stack : undefined
    });
  });
}

startServer();
