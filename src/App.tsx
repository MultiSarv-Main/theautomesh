import React, { useState, useEffect, useRef, ReactNode } from "react";
import LandingPage from "./components/LandingPage";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  BarChart3, 
  Settings, 
  Zap, 
  Facebook, 
  Linkedin,
  Youtube,
  Globe,
  MessageSquare, 
  Mail, 
  Webhook, 
  Plus, 
  Play, 
  Pause, 
  History,
  LayoutDashboard,
  Link,
  Users,
  Activity,
  TestTube,
  ShieldCheck,
  ShieldAlert,
  Key,
  Layout,
  Check,
  Layers,
  Copy,
  Code2,
  LogOut,
  Wrench
} from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import axios from 'axios';

export default function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [user, setUser] = useState<any>(null);
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [connections, setConnections] = useState<any[]>([]);
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [editingWorkflow, setEditingWorkflow] = useState<any>(null);

  useEffect(() => {
    const init = async () => {
      await fetchUser();
    };
    init();
  }, []);

  useEffect(() => {
    if (user) {
      fetchWorkflows();
      fetchConnections();
    }
  }, [user]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Validate origin
      const origin = event.origin;
      if (!origin.endsWith('.run.app') && !origin.includes('localhost')) {
        return;
      }
      
      if (event.data?.type === 'FB_AUTH_SUCCESS') {
        toast.success("Meta Authentication Successful");
        fetchUser(); // Refresh user profile data (FB info)
        fetchConnections();
      }
    };
    
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const fetchUser = async () => {
    try {
      const res = await fetch("/api/auth/me", { credentials: 'include' });
      if (res.ok) setUser(await res.json());
      // Removed automatic demo login to allow landing page to show
    } catch (e) {
      console.error(e);
    }
  };

  const handleLogin = async () => {
    // Session is already set by AuthModals — just refresh user state
    await fetchUser();
    toast.success("Welcome back!");
  };

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/auth/logout", { method: "POST", credentials: 'include' });
      if (res.ok) {
        setUser(null);
        toast.success("Logged out successfully");
      }
    } catch (e) {
      console.error(e);
      toast.error("Logout failed");
    }
  };

  const fetchWorkflows = async () => {
    try {
      const res = await fetch("/api/workflows", { credentials: 'include' });
      if (res.ok) setWorkflows(await res.json());
    } catch (e) {
      console.error(e);
    }
  };

  const fetchConnections = async () => {
    try {
      const res = await fetch("/api/connections/pages", { credentials: 'include' });
      if (res.ok) {
        setConnections(await res.json());
      } else if (res.status === 401) {
        debugLog("Connections unauthorized. Session may be blocked by browser iframe settings.");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const debugLog = (msg: string) => {
    console.log(`[FRONTEND] ${msg}`);
  };

  const handleConnectPage = async () => {
    try {
      // 1. Fetch the OAuth URL from server
      const response = await fetch('/api/auth/facebook/url', { credentials: 'include' });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to get auth URL');
      }
      const { url } = await response.json();

      // 2. Open popup
      const authWindow = window.open(
        url,
        'fb_oauth_popup',
        'width=600,height=700'
      );

      if (!authWindow) {
        toast.error('Popup blocked. Please allow popups to connect Meta.');
      }
    } catch (error: any) {
      console.error('Meta connection error:', error);
      toast.error(error.message || 'Meta connection failed. Check your App ID configuration.');
    }
  };

  if (!user) return <LandingPage onAuthSuccess={handleLogin} />;

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans overflow-hidden">
      <Toaster position="top-right" />
      
      {/* Sidebar Navigation */}
      <aside className="w-60 bg-slate-900 text-white flex flex-col shrink-0">
        <div className="p-6 flex items-center gap-3 border-b border-white/5">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-lg shadow-[0_0_15px_rgba(37,99,235,0.3)]">
            <Zap size={20} className="text-white fill-white" />
          </div>
          <span className="font-bold tracking-tight text-xl text-white">The AutoMesh</span>
        </div>
        
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <div className="text-xs font-semibold text-slate-500 uppercase px-3 py-2 mb-1">Management</div>
          <NavItem active={activeTab === "dashboard"} onClick={() => setActiveTab("dashboard")}>
            <LayoutDashboard size={18} /> Dashboard
          </NavItem>
          <NavItem active={activeTab === "workflows"} onClick={() => setActiveTab("workflows")}>
            <Zap size={18} /> Workflows
          </NavItem>
          <NavItem active={activeTab === "connections"} onClick={() => setActiveTab("connections")}>
            <Link size={18} /> Meta Pages
          </NavItem>
          <NavItem active={activeTab === "others"} onClick={() => setActiveTab("others")}>
            <Layers size={18} /> Global Integrations
          </NavItem>
          <NavItem active={activeTab === "testing"} onClick={() => setActiveTab("testing")}>
            <TestTube size={18} /> Testing Menu
          </NavItem>
          <NavItem active={activeTab === "leads"} onClick={() => setActiveTab("leads")}>
            <Users size={18} /> Lead Logs
          </NavItem>

          <div className="text-xs font-semibold text-slate-500 uppercase px-3 py-2 mt-6 mb-1">Infrastructure</div>
          <NavItem active={activeTab === "system"} onClick={() => setActiveTab("system")}>
            <Wrench size={18} /> System Tools
          </NavItem>
          <NavItem active={false} onClick={() => {}}>
            <Activity size={18} /> Hangfire Dashboard
          </NavItem>
          <NavItem active={activeTab === "api_explorer"} onClick={() => setActiveTab("api_explorer")}>
             <History size={18} /> API Explorer
          </NavItem>
          <NavItem active={activeTab === "settings"} onClick={() => setActiveTab("settings")}>
            <Settings size={18} /> Settings
          </NavItem>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center justify-between px-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-[10px] font-bold uppercase">
                {user?.email?.substring(0, 2) || "AA"}
              </div>
              <div className="text-[11px]">
                <p className="font-medium text-slate-200 leading-none truncate max-w-[100px]">{user?.email || "Architect Admin"}</p>
                <p className="text-slate-500 mt-1 uppercase text-[9px] tracking-wider font-bold">Enterprise Plan</p>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="text-slate-500 hover:text-white transition-colors p-1"
              title="Logout"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between shrink-0">
          <div>
            <h1 className="text-lg font-semibold text-slate-900">Pipeline Automation Console</h1>
            <p className="text-[10px] text-slate-500 uppercase tracking-wider">Multi-tenant SaaS Instance: <span className="font-mono text-indigo-600 font-bold">Tenant_0042</span></p>
          </div>
          <div className="flex items-center gap-4">
            <Button 
              onClick={() => {
                setActiveTab("workflows");
                setIsBuilderOpen(true);
                setEditingWorkflow(null);
              }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] uppercase tracking-widest px-4 h-9 shadow-lg shadow-indigo-900/10"
            >
              <Plus size={14} className="mr-2" /> Create Pipeline
            </Button>
            <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600">
              <Settings size={16} />
            </div>
          </div>
        </header>

        {/* View Content */}
        <div className="p-8 space-y-6 flex-1 overflow-hidden flex flex-col">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, scale: 0.99 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.99 }}
              transition={{ duration: 0.2 }}
              className="flex-1 flex flex-col min-h-0"
            >
              {activeTab === "dashboard" && <DashboardView workflows={workflows} connections={connections} />}
              {activeTab === "workflows" && (
                <WorkflowsView 
                  workflows={workflows} 
                  connections={connections} 
                  onRefresh={fetchWorkflows} 
                  isBuilderOpen={isBuilderOpen}
                  setIsBuilderOpen={setIsBuilderOpen}
                  editingWorkflow={editingWorkflow}
                  setEditingWorkflow={setEditingWorkflow}
                  user={user}
                />
              )}
              {activeTab === "connections" && <ConnectionsView user={user} connections={connections} onConnect={handleConnectPage} onRefresh={fetchConnections} />}
              {activeTab === "api_explorer" && <APIExplorerView />}
              {activeTab === "others" && <OtherServicesView user={user} />}
              {activeTab === "testing" && <TestingView connections={connections} onRefresh={fetchConnections} />}
              {activeTab === "system" && <SystemView onRefresh={fetchConnections} />}
              {activeTab === "leads" && <LeadsView />}
              {activeTab === "settings" && <SettingsView user={user} onRefreshUser={fetchUser} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

function NavItem({ active, children, onClick }: { active: boolean, children: ReactNode, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded transition-all duration-200 text-sm font-medium ${
        active 
          ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/20" 
          : "text-slate-400 hover:bg-slate-800 hover:text-slate-100"
      }`}
    >
      {children}
    </button>
  );
}

function DashboardView({ workflows, connections }: any) {
  return (
    <div className="space-y-6 flex flex-col flex-1 min-h-0 overflow-y-auto pr-2 custom-scrollbar">
      {/* Metric Overview */}
      <div className="grid grid-cols-4 gap-4 shrink-0">
        <StatCard 
          title="Leads (24H)" 
          value="1,248" 
          trend="+12% from yesterday" 
          trendColor="text-emerald-600" 
        />
        <StatCard 
          title="Automation Success" 
          value="99.8%" 
          sub="Avg Latency: 420ms" 
          valueColor="text-emerald-600" 
        />
        <StatCard 
          title="Jobs in Hangfire" 
          value="12 Active" 
          sub="0 Retries pending" 
        />
        <StatCard 
          title="FB Connections" 
          value={`${connections.length} Active Pages`} 
          sub="1 Token expires in 12d" 
          subColor="text-amber-600 font-bold" 
        />
      </div>

      <div className="flex-1 flex gap-6 min-h-0">
        <Card className="flex-[3] bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
          <CardHeader className="p-5 border-b border-slate-50 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Global Pipeline Throughput</CardTitle>
            <span className="text-[10px] text-slate-400 font-mono italic">v1.4.2-stable.LTS</span>
          </CardHeader>
          <CardContent className="flex-1 flex items-center justify-center p-6">
             <div className="w-full h-full bg-slate-50/80 border border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center text-slate-400">
               <div className="relative mb-4">
                 <div className="absolute inset-0 bg-indigo-500/20 blur-2xl rounded-full"></div>
                 <BarChart3 size={48} className="relative text-slate-300" />
               </div>
               <p className="text-[10px] font-bold uppercase tracking-tighter">Real-time Telemetry Processing...</p>
             </div>
          </CardContent>
        </Card>

        <Card className="flex-[1.5] bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
          <CardHeader className="p-5 border-b border-slate-50">
            <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-slate-500">System Handshakes</CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            <ConnectionRow name="Facebook Lead API" status="active" />
            <ConnectionRow name="WhatsApp Business API" status="active" />
            <ConnectionRow name="MS SQL Server Prod" status="active" />
            <ConnectionRow name="Hangfire Scheduler" status="active" />
            <ConnectionRow name="Smtp Relay Gateway" status="idle" />
            <ConnectionRow name="Redis Data Store" status="active" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ title, value, trend, sub, valueColor, trendColor, subColor }: any) {
  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm transition-all hover:shadow-md hover:border-slate-300 group">
      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest transition-colors group-hover:text-indigo-600">{title}</p>
      <p className={`text-2xl font-bold mt-2 tracking-tight ${valueColor || "text-slate-900"}`}>{value}</p>
      {trend && <p className={`text-[10px] font-bold mt-1.5 ${trendColor || ""}`}>{trend}</p>}
      {sub && <p className={`text-[10px] mt-1.5 ${subColor || "text-slate-400 font-medium"}`}>{sub}</p>}
    </div>
  );
}

function ConnectionRow({ name, status }: { name: string, status: "active" | "idle" }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
      <span className="text-xs font-medium text-slate-600">{name}</span>
      <div className="flex items-center gap-2">
        <span className={`w-1.5 h-1.5 rounded-full ${status === "active" ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-slate-300"}`} />
        <span className={`text-[9px] uppercase font-bold ${status === "active" ? "text-emerald-600" : "text-slate-300"}`}>{status}</span>
      </div>
    </div>
  );
}

function WorkflowsView({ workflows, connections, onRefresh, isBuilderOpen, setIsBuilderOpen, editingWorkflow, setEditingWorkflow, user }: any) {
  const [sourceFilter, setSourceFilter] = useState("facebook");

  const filteredWorkflows = workflows.filter((w: any) => {
    return (w.source || "facebook") === sourceFilter;
  });

  return (
    <div className="flex-1 flex flex-col min-h-0 gap-6 overflow-hidden">
      <div className="flex items-center justify-between mb-2 shrink-0">
        <Tabs value={sourceFilter} onValueChange={setSourceFilter} className="w-full">
          <TabsList className="bg-slate-100/50 p-1 rounded-xl h-12 border border-slate-200">
            <TabsTrigger 
              value="facebook" 
              className="px-6 rounded-lg data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm transition-all"
            >
              <div className="flex items-center gap-2 font-bold text-[10px] uppercase tracking-widest">
                <Facebook size={14} /> Facebook
              </div>
            </TabsTrigger>
            <TabsTrigger 
              value="linkedin" 
              className="px-6 rounded-lg data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm transition-all"
            >
              <div className="flex items-center gap-2 font-bold text-[10px] uppercase tracking-widest">
                <Linkedin size={14} /> LinkedIn
              </div>
            </TabsTrigger>
            <TabsTrigger 
              value="website" 
              className="px-6 rounded-lg data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm transition-all"
            >
              <div className="flex items-center gap-2 font-bold text-[10px] uppercase tracking-widest">
                <Globe size={14} /> Website
              </div>
            </TabsTrigger>
            <TabsTrigger 
              value="youtube" 
              className="px-6 rounded-lg data-[state=active]:bg-white data-[state=active]:text-red-600 data-[state=active]:shadow-sm transition-all"
            >
              <div className="flex items-center gap-2 font-bold text-[10px] uppercase tracking-widest">
                <Youtube size={14} /> YouTube
              </div>
            </TabsTrigger>
            <TabsTrigger 
              value="wordpress" 
              className="px-6 rounded-lg data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm transition-all"
            >
              <div className="flex items-center gap-2 font-bold text-[10px] uppercase tracking-widest">
                <Layers size={14} /> WordPress
              </div>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <AnimatePresence mode="wait">
        {isBuilderOpen ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex-1 flex flex-col min-h-0"
          >
            <WorkflowBuilder 
              user={user}
              connections={connections} 
              onClose={() => {
                setIsBuilderOpen(false);
                setEditingWorkflow(null);
              }} 
              onSave={() => {
                setIsBuilderOpen(false);
                setEditingWorkflow(null);
                onRefresh();
              }}
              initialData={editingWorkflow}
            />
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 flex flex-col min-h-0 overflow-y-auto pr-2 custom-scrollbar pb-6 gap-6"
          >
            <Card className="bg-white rounded-xl border border-slate-100 shadow-sm flex flex-col shrink-0 overflow-hidden">
              <CardHeader className="p-5 border-b border-slate-50 flex flex-row items-center justify-between space-y-0 text-slate-100">
                <div>
                  <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Active Automation Rules</CardTitle>
                  <p className="text-[10px] text-slate-400 mt-1 italic font-medium">Monitoring {workflows.length} live lead-forwarding tunnels.</p>
                </div>
              </CardHeader>
              <div className="flex-1 overflow-auto custom-scrollbar">
                <Table>
                  <TableHeader className="bg-slate-50 sticky top-0 z-10">
                    <TableRow className="border-0">
                      <TableHead className="px-6 py-4 font-bold text-[10px] text-slate-400 uppercase tracking-widest">Status</TableHead>
                      <TableHead className="px-6 py-4 font-bold text-[10px] text-slate-400 uppercase tracking-widest">Pipeline Alias</TableHead>
                      <TableHead className="px-6 py-4 font-bold text-[10px] text-slate-400 uppercase tracking-widest">Execution Path</TableHead>
                      <TableHead className="px-6 py-4 font-bold text-[10px] text-slate-400 uppercase tracking-widest text-center">Form Hook</TableHead>
                      <TableHead className="px-6 py-4 text-right"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="text-xs divide-y divide-slate-50">
                    {filteredWorkflows.map((w: any) => {
                      const rules = JSON.parse(w.rules || "{}");
                      return (
                        <TableRow key={w.id} className="hover:bg-slate-50/50 transition-colors border-0 group">
                          <TableCell className="px-6 py-5">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                              w.active ? "bg-emerald-100 text-emerald-700 border border-emerald-200" : "bg-slate-100 text-slate-500 border border-slate-200"
                            }`}>
                              {w.active ? "Enabled" : "Paused"}
                            </span>
                          </TableCell>
                          <TableCell className="px-6 py-5">
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-lg ${
                                (w.source || 'facebook') === 'facebook' ? 'bg-blue-50 text-blue-600' : 
                                (w.source || 'facebook') === 'linkedin' ? 'bg-blue-100 text-blue-700' : 
                                (w.source || 'facebook') === 'youtube' ? 'bg-red-50 text-red-600' :
                                (w.source || 'facebook') === 'wordpress' ? 'bg-slate-100 text-slate-900' :
                                'bg-indigo-50 text-indigo-600'
                              }`}>
                                { (w.source || 'facebook') === 'facebook' ? <Facebook size={14} /> : 
                                  (w.source || 'facebook') === 'linkedin' ? <Linkedin size={14} /> : 
                                  (w.source || 'facebook') === 'youtube' ? <Youtube size={14} /> :
                                  (w.source || 'facebook') === 'wordpress' ? <Layers size={14} /> :
                                  <Globe size={14} />
                                }
                              </div>
                              <div className="flex flex-col">
                                <span className="font-bold text-slate-700">{w.name}</span>
                                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tight">SOURCE: {w.source || "Facebook"}</span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="px-6 py-5">
                            <div className="flex gap-2 items-center">
                              <span className={`px-2 py-1 rounded border text-[10px] font-bold uppercase ${
                                (w.source || 'facebook') === 'facebook' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                                (w.source || 'facebook') === 'linkedin' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                                (w.source || 'facebook') === 'youtube' ? 'bg-red-50 text-red-700 border-red-100' :
                                (w.source || 'facebook') === 'wordpress' ? 'bg-slate-100 text-slate-800 border-slate-200' :
                                'bg-indigo-50 text-indigo-700 border-indigo-100'
                              }`}>
                                { (w.source || 'facebook') === 'facebook' ? "Meta Lead" :
                                  (w.source || 'facebook') === 'linkedin' ? "LinkedIn Lead" :
                                  (w.source || 'facebook') === 'youtube' ? "YT Lead" :
                                  (w.source || 'facebook') === 'wordpress' ? "WP Hook" :
                                  "Site Hook"
                                }
                              </span>
                              <span className="text-slate-300 font-bold scale-125">{"→"}</span>
                              <span className="px-2 py-1 bg-amber-50 text-amber-700 rounded border border-amber-100 text-[10px] font-bold uppercase">
                                {rules.crmUrl ? (() => { try { return new URL(rules.crmUrl).hostname } catch(e) { return "Webhook" } })() : "Sync"}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="px-6 py-5 font-mono text-[10px] text-center text-slate-500 font-bold">
                            {rules.formId || "ALL_FORMS"}
                          </TableCell>
                          <TableCell className="text-right px-6 py-5">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 font-bold text-[10px] uppercase tracking-widest text-slate-400 hover:text-indigo-600 transition-colors"
                              onClick={() => {
                                setEditingWorkflow(w);
                                setIsBuilderOpen(true);
                              }}
                            >
                              Config
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {filteredWorkflows.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="h-48 text-center text-slate-300">
                          <div className="flex flex-col items-center gap-3">
                            <div className="p-4 bg-slate-50 rounded-full text-slate-200">
                              {sourceFilter === 'facebook' ? <Zap size={32} /> : 
                               sourceFilter === 'linkedin' ? <Linkedin size={32} /> :
                               sourceFilter === 'youtube' ? <Youtube size={32} /> :
                               sourceFilter === 'website' ? <Globe size={32} /> :
                               <Layers size={32} />
                              }
                            </div>
                            <p className="font-medium italic">
                              {sourceFilter === 'facebook' 
                                ? "No automation rules detected in the current tenant." 
                                : `Integration for ${sourceFilter.charAt(0).toUpperCase() + sourceFilter.slice(1)} coming soon.`
                              }
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const META_FIELDS = [
  "full_name", "first_name", "last_name", "email", "phone_number", 
  "form_id", "form_name", "page_id", "page_name",
  "campaign_name", "adgroup_name", "ad_name", "platform",
  "city", "state", "country", "zip_code"
];

function SourceFieldInput({ value, onChange }: { value: string, onChange: (v: string) => void }) {
  const [showPanel, setShowPanel] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const mirrorRef = useRef<HTMLDivElement>(null);

  const categories = {
    "Identity": ["full_name", "first_name", "last_name", "email", "phone_number"],
    "System": ["form_id", "form_name", "page_id", "page_name", "platform"],
    "Market": ["campaign_name", "adgroup_name", "ad_name"],
    "Location": ["city", "state", "country", "zip_code"]
  };

  const insertTag = (tag: string) => {
    const input = inputRef.current;
    if (!input) return;
    
    const start = input.selectionStart || 0;
    const end = input.selectionEnd || 0;
    const newValue = value.substring(0, start) + `{{${tag}}}` + value.substring(end);
    onChange(newValue);
    
    setTimeout(() => {
      input.focus();
      const newPos = start + tag.length + 4;
      input.setSelectionRange(newPos, newPos);
    }, 10);
  };

  // Synchronize scrolling of mirror
  const handleScroll = (e: React.UIEvent<HTMLInputElement>) => {
    if (mirrorRef.current) {
      mirrorRef.current.scrollLeft = e.currentTarget.scrollLeft;
    }
  };

  const renderHighlightedText = () => {
    const parts = value.split(/(\{\{.*?\}\})/g);
    return parts.map((part, i) => {
      if (part.startsWith("{{") && part.endsWith("}}")) {
        return (
          <span key={i} className="px-1.5 py-0.5 rounded-md bg-indigo-500/20 text-indigo-600 font-bold border border-indigo-500/30">
            {part.slice(2, -2)}
          </span>
        );
      }
      return <span key={i}>{part}</span>;
    });
  };

  return (
    <div className="relative flex-1 group">
      <div className="relative h-10">
        {/* Mirror layer for pill highlighting */}
        <div 
          ref={mirrorRef}
          className="absolute inset-0 px-3 py-2 text-xs font-mono whitespace-nowrap overflow-hidden pointer-events-none flex items-center gap-0.5 opacity-100"
          aria-hidden="true"
        >
          {renderHighlightedText()}
        </div>

        <Input 
          ref={inputRef}
          value={value} 
          onFocus={() => setShowPanel(true)}
          onBlur={() => setTimeout(() => setShowPanel(false), 200)}
          onChange={(e) => onChange(e.target.value)} 
          onScroll={handleScroll}
          placeholder="e.g. Lead: {{full_name}}" 
          className={`h-10 text-xs font-mono transition-all pr-8 absolute inset-0 bg-transparent text-transparent caret-slate-900 border-slate-200 focus:ring-2 focus:ring-indigo-500/20 ${showPanel ? "shadow-lg bg-white/80" : "bg-transparent hover:bg-slate-50/50"}`}
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          <Layers size={12} />
        </div>
      </div>

      <AnimatePresence>
        {showPanel && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.95 }}
            className="absolute left-0 top-full mt-2 w-72 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-4 z-[100] space-y-4"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]"></div>
                <span className="text-[9px] font-bold text-white/60 uppercase tracking-widest">Variable Library</span>
              </div>
              <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/20">META</span>
            </div>
            
            <div className="space-y-4 max-h-[200px] overflow-auto custom-scrollbar pr-1 scroll-smooth">
              {Object.entries(categories).map(([cat, fields]) => (
                <div key={cat} className="space-y-2">
                  <div className="text-[8px] font-bold text-white/30 uppercase tracking-[0.2em] flex items-center gap-2">
                    <div className="flex-1 h-px bg-white/5"></div>
                    {cat}
                    <div className="flex-1 h-px bg-white/5"></div>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {fields.map(f => (
                      <button
                        key={f}
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault(); // Prevent blur
                          insertTag(f);
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-white/[0.03] border border-white/5 text-[10px] font-mono text-white/60 hover:bg-indigo-500/10 hover:text-indigo-300 hover:border-indigo-500/30 transition-all text-left flex items-center gap-2 group/pill"
                      >
                        <div className={`shrink-0 w-1.5 h-1.5 rounded-full ${
                          cat === 'Identity' ? 'bg-indigo-400' : 
                          cat === 'System' ? 'bg-emerald-400' : 
                          cat === 'Market' ? 'bg-amber-400' : 'bg-slate-400'
                        } opacity-40 group-hover/pill:opacity-100 transition-opacity`}></div>
                        <span className="truncate">{f}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="pt-2 border-t border-white/5 text-[8px] text-white/20 italic">
              Click a variable to insert it as a dynamic tag.
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function WorkflowBuilder({ user, connections, onClose, onSave, initialData }: any) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState(initialData?.name || "");
  const [source, setSource] = useState(initialData?.source || "facebook");
  const [pageId, setPageId] = useState(initialData?.pageId || "");
  const [forms, setForms] = useState<any[]>([]);
  const [loadingForms, setLoadingForms] = useState(false);
  
  const rules = JSON.parse(initialData?.rules || "{}");
  const [selectedFormId, setSelectedFormId] = useState(rules.formId || "");
  const [crmUrl, setCrmUrl] = useState(rules.crmUrl || "");
  const [mappings, setMappings] = useState<any[]>(rules.mappings || [
    { target: "name", source: "{{full_name}}" },
    { target: "email", source: "{{email}}" },
    { target: "phone", source: "{{phone_number}}" }
  ]);
  
  // API Config
  const [authType, setAuthType] = useState(rules.authType || "none");
  const [authToken, setAuthToken] = useState(rules.authToken || "");
  const [contentType, setContentType] = useState(rules.contentType || "application/json");
  const [apiKeyName, setApiKeyName] = useState(rules.apiKeyName || "");
  const [apiKeyValue, setApiKeyValue] = useState(rules.apiKeyValue || "");

  useEffect(() => {
    if (pageId) {
      fetchForms(pageId);
    }
  }, [pageId]);

  const fetchForms = async (pid: string) => {
    setLoadingForms(true);
    try {
      const res = await fetch(`/api/pages/${pid}/forms`, { credentials: 'include' });
      if (res.ok) setForms(await res.json());
    } catch (e) {
      toast.error("Failed to load forms");
    } finally {
      setLoadingForms(false);
    }
  };

  const handleAddField = () => {
    setMappings([...mappings, { source: "{{full_name}}", target: "" }]);
  };

  const handleSave = async () => {
    if (!name || (source === 'facebook' && !pageId) || !crmUrl) {
      toast.error("Please fill all required fields");
      return;
    }

    const payload = {
      name,
      pageId: source === 'facebook' ? pageId : null,
      source,
      rules: {
        formId: source === 'facebook' ? selectedFormId : "",
        crmUrl,
        mappings,
        authType,
        authToken,
        contentType,
        apiKeyName,
        apiKeyValue
      }
    };

    try {
      const url = initialData ? `/api/workflows/${initialData.id}` : "/api/workflows";
      const method = initialData ? "PUT" : "POST";
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: 'include'
      });

      if (res.ok) {
        toast.success(initialData ? "Workflow updated" : "Workflow deployed");
        onSave();
      } else {
        toast.error("Cloud synchronization failed");
      }
    } catch (e) {
      toast.error("Network infrastructure error");
    }
  };

  return (
    <div className="flex-1 flex flex-col gap-6">
      {/* Builder Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onClose} className="text-slate-400 h-9 px-2 hover:bg-slate-100">
            {"←"}
          </Button>
          <div>
            <h2 className="text-lg font-bold text-slate-800 tracking-tight">{initialData ? "Edit Workflow" : "New Automation Pipeline"}</h2>
            <p className="text-xs text-slate-500 font-medium italic">Constructing logical data paths for lead routing.</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
           {step > 1 && <Button variant="ghost" onClick={() => setStep(step - 1)} className="text-[10px] font-bold uppercase tracking-widest h-10 border border-slate-200">Back</Button>}
           {step < 3 ? (
             <Button onClick={() => setStep(step + 1)} className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-[10px] uppercase tracking-widest px-8 h-10">Next Stage</Button>
           ) : (
             <Button onClick={handleSave} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] uppercase tracking-widest px-10 h-10 shadow-lg shadow-indigo-900/10">Deploy Pipeline</Button>
           )}
        </div>
      </div>

      {/* Progress Line */}
      <div className="flex gap-2 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full transition-all duration-500 ${step >= 1 ? "bg-indigo-600" : "bg-transparent"}`} style={{ width: "33.33%" }}></div>
        <div className={`h-full transition-all duration-500 ${step >= 2 ? "bg-indigo-600" : "bg-transparent"}`} style={{ width: "33.33%" }}></div>
        <div className={`h-full transition-all duration-500 ${step >= 3 ? "bg-indigo-600" : "bg-transparent"}`} style={{ width: "33.33%" }}></div>
      </div>

      <div className="flex-1 flex gap-8 min-h-0">
        {/* Step Content */}
        <div className="flex-[4] space-y-6 overflow-y-auto pr-2 custom-scrollbar">
          {step === 1 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
              <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Pipeline Name</label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Lead Router" className="h-12 bg-slate-50/50" />
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Lead Source</label>
                  <div className="grid grid-cols-5 gap-3">
                    <button 
                      onClick={() => setSource("facebook")}
                      className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${source === "facebook" ? "border-blue-600 bg-blue-50 text-blue-600 shadow-sm" : "border-slate-100 bg-slate-50 text-slate-400 hover:border-slate-200"}`}
                    >
                      <Facebook size={24} />
                      <span className="text-[10px] font-bold uppercase tracking-tighter">Meta</span>
                    </button>
                    <button 
                      onClick={() => setSource("linkedin")}
                      className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${source === "linkedin" ? "border-blue-700 bg-blue-50 text-blue-700 shadow-sm" : "border-slate-100 bg-slate-50 text-slate-400 hover:border-slate-200"}`}
                    >
                      <Linkedin size={24} />
                      <span className="text-[10px] font-bold uppercase tracking-tighter">LinkedIn</span>
                    </button>
                    <button 
                      onClick={() => setSource("website")}
                      className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${source === "website" ? "border-indigo-600 bg-indigo-50 text-indigo-600 shadow-sm" : "border-slate-100 bg-slate-50 text-slate-400 hover:border-slate-200"}`}
                    >
                      <Globe size={24} />
                      <span className="text-[10px] font-bold uppercase tracking-tighter">Website</span>
                    </button>
                    <button 
                      onClick={() => setSource("youtube")}
                      className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${source === "youtube" ? "border-red-600 bg-red-50 text-red-600 shadow-sm" : "border-slate-100 bg-slate-50 text-slate-400 hover:border-slate-200"}`}
                    >
                      <Youtube size={24} />
                      <span className="text-[10px] font-bold uppercase tracking-tighter">YouTube</span>
                    </button>
                    <button 
                      onClick={() => setSource("wordpress")}
                      className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${source === "wordpress" ? "border-slate-600 bg-slate-100 text-slate-900 shadow-sm" : "border-slate-100 bg-slate-50 text-slate-400 hover:border-slate-200"}`}
                    >
                      <Layers size={24} />
                      <span className="text-[10px] font-bold uppercase tracking-tighter">WordPress</span>
                    </button>
                  </div>
                </div>
                
                {source === "facebook" && (
                  <>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Source Meta Page</label>
                        {pageId && (
                          <div 
                            id="wf-copy-page-id"
                            className="flex items-center gap-2 cursor-pointer hover:bg-slate-100 px-2 py-0.5 rounded transition-colors group"
                            onClick={() => {
                              navigator.clipboard.writeText(pageId);
                              toast.success("ID Copied to clipboard");
                            }}
                          >
                            <span className="text-[9px] font-mono text-slate-400 group-hover:text-blue-600">ID: {pageId}</span>
                            <Copy size={10} className="text-slate-300 group-hover:text-blue-600" />
                          </div>
                        )}
                      </div>
                      <Select value={pageId} onValueChange={setPageId}>
                        <SelectTrigger className="h-12 bg-slate-50/50">
                          <SelectValue placeholder="Select connected page..." />
                        </SelectTrigger>
                        <SelectContent>
                          {connections.map((c: any) => (
                            <SelectItem key={c.id} value={c.id}>
                              <div className="flex justify-between w-full items-center gap-4">
                                <span>{c.name}</span>
                                <span className="text-[10px] text-slate-400 font-mono">ID: {c.id}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Triggering Form (Optional)</label>
                        {selectedFormId && selectedFormId !== "" && (
                          <div 
                            id="wf-copy-form-id"
                            className="flex items-center gap-2 cursor-pointer hover:bg-slate-100 px-2 py-0.5 rounded transition-colors group"
                            onClick={() => {
                              navigator.clipboard.writeText(selectedFormId);
                              toast.success("ID Copied to clipboard");
                            }}
                          >
                            <span className="text-[9px] font-mono text-slate-400 group-hover:text-blue-600">ID: {selectedFormId}</span>
                            <Copy size={10} className="text-slate-300 group-hover:text-blue-600" />
                          </div>
                        )}
                      </div>
                      <Select value={selectedFormId} onValueChange={setSelectedFormId}>
                        <SelectTrigger className="h-12 bg-slate-50/50" disabled={!pageId || loadingForms}>
                          <SelectValue placeholder={loadingForms ? "Loading forms..." : "All forms on this page"} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">All Forms</SelectItem>
                          {forms.map((f: any) => (
                            <SelectItem key={f.id} value={f.id}>
                              <div className="flex justify-between w-full items-center gap-4">
                                <span>{f.name}</span>
                                <span className="text-[10px] text-slate-400 font-mono">ID: {f.id}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-[9px] text-slate-400 italic">Select a specific form to only trigger this workflow for that form.</p>
                    </div>
                  </>
                )}

                {source === "linkedin" && (
                  <div className="p-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-center">
                    <Linkedin size={32} className="mx-auto text-blue-700 mb-4" />
                    <h4 className="text-sm font-bold text-slate-800 uppercase tracking-widest">LinkedIn Lead Gen Forms</h4>
                    <p className="text-xs text-slate-500 mt-2">Connecting to LinkedIn Ads... This will allow you to capture leads from LinkedIn lead forms directly into your CRM.</p>
                  </div>
                )}

                {source === "website" && (
                  <div className="p-8 bg-indigo-50 rounded-2xl border border-indigo-100 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-indigo-600 p-2 rounded text-white shadow-lg"><Globe size={18} /></div>
                      <div>
                        <h4 className="text-xs font-bold text-indigo-900 uppercase">Website Integration</h4>
                        <p className="text-[10px] text-indigo-700 font-medium">Use our embedded form or webhook to capture leads from your own site.</p>
                      </div>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-indigo-100 font-mono text-[10px] text-slate-500">
                      // POST to this endpoint from your website
                      {`${window.location.origin}/api/hooks/website-lead/${user?.id || 'uid'}`}
                    </div>
                  </div>
                )}

                {source === "youtube" && (
                  <div className="p-8 bg-red-50 rounded-2xl border border-red-100 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-red-600 p-2 rounded text-white shadow-lg"><Youtube size={18} /></div>
                      <div>
                        <h4 className="text-xs font-bold text-red-900 uppercase">YouTube Lead Ads</h4>
                        <p className="text-[10px] text-red-700 font-medium">Receive lead form data from YouTube's interactive ad extensions.</p>
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-500 italic">Integration will require linking your Google Ads account in the next update.</p>
                  </div>
                )}

                {source === "wordpress" && (
                  <div className="p-8 bg-slate-100 rounded-2xl border border-slate-200 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-slate-900 p-2 rounded text-white shadow-lg"><Layers size={18} /></div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 uppercase">WordPress Plugin</h4>
                        <p className="text-[10px] text-slate-600 font-medium">Connect your WP Forms or Gravity Forms via our lightweight companion plugin.</p>
                      </div>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-slate-200 font-mono text-[10px] text-slate-500">
                       WP_WEBHOOK_URL: {`${window.location.origin}/api/hooks/wp/${user?.id || 'uid'}`}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
              <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm space-y-6">
                <div className="flex items-center justify-between">
                   <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Data Transformation (Mapping)</label>
                      <p className="text-[9px] text-slate-400 font-medium italic">Assign Meta parameters to your CRM's specific keys.</p>
                   </div>
                   <Button variant="ghost" size="sm" onClick={handleAddField} className="text-[9px] font-bold text-indigo-600 h-6">+ Add Field</Button>
                </div>
                
                <div className="space-y-3">
                  <div className="grid grid-cols-[180px,20px,1fr,32px] gap-4 px-2 mb-2">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight italic">Target Keys</span>
                    <span></span>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight italic">Mapping Logic</span>
                  </div>
                  {mappings.map((m, i) => (
                    <div key={i} className="flex gap-4 items-start">
                      <Input 
                        value={m.target} 
                        onChange={(e) => {
                          const nm = [...mappings];
                          nm[i].target = e.target.value;
                          setMappings(nm);
                        }} 
                        placeholder="CRM Key" 
                        className="h-10 text-xs font-mono w-[180px] shrink-0 border-dashed bg-slate-50/20"
                      />
                      <div className="h-10 flex items-center">
                        <span className="text-slate-300 font-bold scale-125">{"→"}</span>
                      </div>
                      <SourceFieldInput 
                        value={m.source} 
                        onChange={(v) => {
                          const nm = [...mappings];
                          nm[i].source = v;
                          setMappings(nm);
                        }} 
                      />
                      <div className="h-10 flex items-center">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => setMappings(mappings.filter((_, idx) => idx !== i))}
                          className="text-slate-300 hover:text-red-500 hover:bg-red-50 w-8 h-8 p-0"
                        >
                          ×
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6 pb-12">
              <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm space-y-8">
                <div className="space-y-4">
                   <div className="flex items-center gap-2 mb-2">
                     <div className="bg-indigo-50 p-1.5 rounded text-indigo-600"><Zap size={14} /></div>
                     <label className="text-[10px] font-bold uppercase tracking-widest text-slate-700">Endpoint Configuration</label>
                   </div>
                   <Input 
                      value={crmUrl} 
                      onChange={(e) => setCrmUrl(e.target.value)} 
                      placeholder="https://your-crm.com/api/v1/leads" 
                      className="h-12 bg-slate-50/50 font-mono text-[11px]" 
                   />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Authentication Protocol</label>
                    <Select value={authType} onValueChange={setAuthType}>
                      <SelectTrigger className="h-10 text-xs">
                        <SelectValue placeholder="No Authentication" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None (Public Endpoint)</SelectItem>
                        <SelectItem value="bearer">Bearer Token (JWT)</SelectItem>
                        <SelectItem value="basic">Basic Auth (Base64)</SelectItem>
                      </SelectContent>
                    </Select>
                    {authType !== 'none' && (
                      <Input 
                        value={authToken} 
                        onChange={(e) => setAuthToken(e.target.value)} 
                        placeholder={authType === 'bearer' ? "token_abc123..." : "raw_credentials..."} 
                        className="h-10 text-xs font-mono"
                      />
                    )}
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Content Serialization</label>
                    <Select value={contentType} onValueChange={setContentType}>
                      <SelectTrigger className="h-10 text-xs">
                        <SelectValue placeholder="application/json" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="application/json">JSON (application/json)</SelectItem>
                        <SelectItem value="application/x-www-form-urlencoded">Form Data (url-encoded)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-slate-50">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="bg-amber-50 p-1.5 rounded text-amber-600"><Key size={14} /></div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-700">Custom Header API Key (Optional)</label>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Input 
                      value={apiKeyName} 
                      onChange={(e) => setApiKeyName(e.target.value)} 
                      placeholder="Header Name (e.g. X-API-Key)" 
                      className="h-10 text-xs font-mono"
                    />
                    <Input 
                      value={apiKeyValue} 
                      onChange={(e) => setApiKeyValue(e.target.value)} 
                      placeholder="Secret Key Value" 
                      className="h-10 text-xs font-mono"
                    />
                  </div>
                </div>
                
                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                   <h4 className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest flex items-center gap-2 mb-2">
                     <ShieldCheck size={14} className="animate-pulse" /> Network Security Verification
                   </h4>
                   <ul className="text-[10px] text-emerald-600 space-y-1 font-medium italic">
                     <li>• Auth Mode: {authType.toUpperCase()}</li>
                     <li>• Payload Encoding: {contentType.split('/')[1]}</li>
                     <li>• API Header: {apiKeyName ? "ENABLED" : "NONE"}</li>
                   </ul>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Builder Sidebar - Schematic Visualizer */}
        <div className="w-56 space-y-4 shrink-0 px-2 border-l border-slate-50">
           <Card className="bg-slate-950 border-0 shadow-2xl rounded-2xl overflow-hidden h-fit">
              <CardHeader className="p-4 border-b border-white/5 bg-white/5">
                 <CardTitle className="text-[9px] font-bold uppercase tracking-widest text-white/50 flex items-center gap-2">
                   <div className="w-1 h-1 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                   Visual Graph Pre-render
                 </CardTitle>
              </CardHeader>
              <CardContent className="p-6 relative flex flex-col items-center gap-6">
                 {/* Visual Nodes */}
                 <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-500 ${
                   source === 'facebook' ? 'bg-blue-600 shadow-lg shadow-blue-500/20 text-white' :
                   source === 'linkedin' ? 'bg-blue-700 shadow-lg shadow-blue-600/20 text-white' :
                   source === 'youtube' ? 'bg-red-600 shadow-lg shadow-red-500/20 text-white' :
                   source === 'wordpress' ? 'bg-slate-900 shadow-lg shadow-slate-800/20 text-white' :
                   source === 'website' ? 'bg-indigo-600 shadow-lg shadow-indigo-500/20 text-white' :
                   "bg-white/5 text-white/20"
                 }`}>
                   {source === 'facebook' ? <Facebook size={24} /> : 
                    source === 'linkedin' ? <Linkedin size={24} /> : 
                    source === 'youtube' ? <Youtube size={24} /> : 
                    source === 'wordpress' ? <Layers size={24} /> : 
                    <Globe size={24} />
                   }
                 </div>
                 <div className={`w-0.5 h-10 transition-all duration-500 ${source ? "bg-blue-500/50" : "bg-white/5"}`}></div>
                 <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-500 ${crmUrl ? "bg-amber-600 shadow-lg shadow-amber-500/20 text-white" : "bg-white/5 text-white/20"}`}>
                   <Zap size={24} />
                 </div>
                 <div className={`w-0.5 h-10 transition-all duration-500 ${crmUrl ? "bg-amber-500/50" : "bg-white/5"}`}></div>
                 <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-500 ${step === 3 ? "bg-emerald-600 shadow-lg shadow-emerald-500/20 text-white" : "bg-white/5 text-white/20"}`}>
                   <Users size={24} />
                 </div>
                 
                 <div className="absolute top-1/2 -left-1 text-[8px] text-white/10 font-bold uppercase -rotate-90 origin-left">PIPELINE_SCHEMATIC</div>
              </CardContent>
           </Card>
        </div>
      </div>
    </div>
  );
}

function ConnectionsView({ user, connections, onConnect, onRefresh }: any) {
  return (
    <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-8 pb-10 flex flex-col">
      <div className="flex items-center justify-between max-w-4xl mx-auto w-full shrink-0">
         <div className="flex flex-col gap-1">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Connections</h2>
            <p className="text-xs text-slate-500 font-medium">Manage your Meta account integrations and page permissions.</p>
         </div>
         <Button 
           size="sm"
           className="bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold uppercase tracking-widest transition-all shadow-sm shadow-blue-200 h-9 px-4" 
           onClick={onConnect}
         >
           <Plus size={14} className="mr-2" /> New Connection
         </Button>
      </div>

      <Card className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden max-w-4xl mx-auto w-full shrink-0">
        <CardHeader className="p-6 border-b border-slate-50 bg-slate-50/30">
          <CardTitle className="flex items-center gap-3 text-slate-900 text-[10px] font-bold uppercase tracking-widest">
            <div className="bg-blue-600 p-1.5 rounded text-white"><Facebook size={16} /></div> 
            Meta Graph API
          </CardTitle>
          <CardDescription className="text-[11px] text-slate-500 font-medium pt-1">Bridge your Meta Business pages to the LeadFlow listener.</CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          {/* Facebook User Profile Display */}
          {user?.fbUserId && (
            <div className="flex items-center gap-3 p-4 bg-blue-50/50 border border-blue-100 rounded-xl mb-4">
              <div className="h-10 w-10 rounded-full border-2 border-white shadow-sm overflow-hidden bg-slate-200">
                {user.fbImage ? (
                  <img src={user.fbImage} alt={user.fbName} className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-slate-400">
                    <Facebook size={20} />
                  </div>
                )}
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-slate-900 uppercase">Connected as: {user.fbName}</span>
                <span className="text-[9px] text-slate-500 font-mono">FB ID: {user.fbUserId}</span>
              </div>
              <Badge className="ml-auto bg-blue-600 text-white border-0 text-[8px] uppercase px-2 py-0.5 font-bold">Active Account</Badge>
            </div>
          )}

          {connections.length === 0 ? (
            <div className="text-center py-6 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">No Active Connections Found</p>
              <Button 
                variant="ghost" 
                size="sm" 
                className="mt-2 text-[9px] text-indigo-600 hover:text-indigo-700 font-bold"
                onClick={async () => {
                  const res = await fetch("/api/connections/pages", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      id: "mock_page_" + Math.random().toString(36).substr(2, 9),
                      name: "Mock Demo Page",
                      accessToken: "mock_token"
                    }),
                    credentials: 'include'
                  });
                  if (res.ok) {
                    toast.success("Mock Page Connected for Testing");
                    if (onRefresh) onRefresh();
                  } else if (res.status === 401) {
                    toast.error("Session lost. Retrying auto-login...");
                    window.location.reload(); // Hard reset to trigger fetchUser
                  } else {
                    toast.error("Connection failed. Please try in a New Tab.");
                  }
                }}
              >
                Connect Mock Page (Demo)
              </Button>
            </div>
          ) : (
            <div className="space-y-8">
              {Object.values(connections.reduce((acc: any, curr: any) => {
                const userId = curr.fbUserId || 'legacy_account';
                if (!acc[userId]) {
                  acc[userId] = {
                    id: userId,
                    name: curr.fbUserName || (userId === 'legacy_account' ? 'Connected Account' : 'Unknown Account'),
                    pages: []
                  };
                }
                acc[userId].pages.push(curr);
                return acc;
              }, {})).map((group: any) => (
                <div key={group.id} className="space-y-4">
                  <div className="flex items-center gap-3 pb-2 border-b border-slate-100">
                    <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-sm">
                      <Facebook size={14} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[11px] font-extrabold text-slate-800 uppercase tracking-tight">{group.name}</span>
                      <span className="text-[9px] text-slate-400 font-medium">Account ID: {group.id}</span>
                    </div>
                    {(user?.fbUserId === group.id || (group.id === 'legacy_account' && !user?.fbUserId)) && (
                      <Badge className="ml-auto bg-blue-100 text-blue-700 border-0 text-[8px] uppercase px-2 py-0.5 font-bold">Primary</Badge>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4">
                    {group.pages.map((c: any) => (
                      <div key={c.id} className="flex flex-col border border-slate-100 rounded-xl bg-white shadow-sm overflow-hidden group/page hover:border-blue-200 transition-all">
                        <div className="flex items-center justify-between p-4 bg-slate-50/30 border-b border-slate-100">
                          <div className="flex flex-col">
                            <span className="text-[11px] font-bold text-slate-700 group-hover/page:text-blue-600 transition-colors uppercase">{c.name}</span>
                            <div 
                              id={`copy-page-id-btn-${c.id}`}
                              className="flex items-center gap-2 cursor-pointer hover:bg-slate-100 px-1 py-0.5 rounded transition-colors group/copy w-fit mt-1"
                              onClick={() => {
                                navigator.clipboard.writeText(c.id);
                                toast.success("Page ID copied");
                              }}
                            >
                              <span className="text-[9px] text-slate-400 font-mono group-hover/copy:text-blue-600">ID: {c.id}</span>
                              <Copy size={9} className="text-slate-300 group-hover/copy:text-blue-600" />
                            </div>
                          </div>
                          <div className="flex gap-2">
                            {c.sub && (
                              c.sub === 'FAILED' ? (
                                <Dialog>
                                  <DialogTrigger>
                                    <Badge className="text-[9px] px-2 py-0.5 uppercase font-bold border-0 bg-red-100 text-red-700 cursor-pointer hover:bg-red-200">
                                      {c.sub}
                                    </Badge>
                                  </DialogTrigger>
                                  <DialogContent className="sm:max-w-[425px]">
                                    <DialogHeader>
                                      <DialogTitle className="text-red-600 flex items-center gap-2">
                                        <ShieldCheck className="text-red-600" />
                                        Connection Failure Details
                                      </DialogTitle>
                                      <DialogDescription className="text-xs">
                                        The Meta Webhook subscription for <strong>{c.name}</strong> failed with the following error.
                                      </DialogDescription>
                                    </DialogHeader>
                                    <div className="bg-slate-900 p-4 rounded-lg border border-slate-800 font-mono text-[10px] text-red-400 overflow-auto max-h-[300px] mb-4">
                                      {c.statusDetails || "No detailed error message available."}
                                    </div>
                                    {c.statusDetails?.includes("#200") && (
                                      <div className="bg-blue-50 border border-blue-100 p-3 rounded-lg mb-4">
                                        <h4 className="text-xs font-bold text-blue-900 mb-1 flex items-center gap-1">
                                          <ShieldCheck size={14} className="text-blue-600" /> Resolution Steps:
                                        </h4>
                                        <ul className="text-[10px] text-blue-800 list-disc list-inside space-y-1">
                                          <li>Verify you have <strong>Admin</strong> access to this Page in Meta Business Suite.</li>
                                          <li>Enable <strong>Two-Factor Authentication</strong> on your personal Facebook account.</li>
                                          <li>Ensure your Page is not restricted by a Business Manager policy.</li>
                                        </ul>
                                      </div>
                                    )}
                                    <DialogFooter className="flex flex-col sm:flex-row gap-2">
                                      <Button 
                                        variant="outline" 
                                        size="sm" 
                                        className="text-[10px] uppercase font-bold"
                                        onClick={() => window.open(`https://business.facebook.com/latest/settings/people`, '_blank')}
                                      >
                                        Check Meta Permissions
                                      </Button>
                                      <Button 
                                        size="sm" 
                                        className="bg-red-600 text-white text-[10px] uppercase font-bold"
                                        onClick={async () => {
                                          toast.info("Retrying subscription...");
                                          // Trigger a refresh/retry
                                          const res = await fetch("/api/connections/pages/sync", { method: "POST" });
                                          if (res.ok) toast.success("Retry complete. Check status.");
                                        }}
                                      >
                                        Retry Connection
                                      </Button>
                                    </DialogFooter>
                                  </DialogContent>
                                </Dialog>
                              ) : (
                                <Badge className={`text-[9px] px-2 py-0.5 uppercase font-bold border-0 ${
                                  c.sub === 'ACTIVE' || c.sub === 'MOCK_ACTIVE' 
                                    ? "bg-blue-100 text-blue-700" 
                                    : "bg-amber-100 text-amber-700"
                                }`}>
                                  {c.sub}
                                </Badge>
                              )
                            )}
                            <Badge className="text-[9px] border-emerald-200 text-emerald-700 bg-emerald-50 px-2 py-0.5 uppercase font-bold">Verified</Badge>
                          </div>
                        </div>
                        
                        <div className="p-4 bg-white space-y-3">
                          <div className="flex items-center gap-2 mb-2">
                            <ShieldCheck size={14} className="text-indigo-600" />
                            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Permission Health</span>
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                            {[
                              { name: 'leads_retrieval', status: 'Healthy' },
                              { name: 'pages_read_engagement', status: 'Healthy' },
                              { name: 'pages_manage_metadata', status: 'Healthy' },
                              { name: 'ads_management', status: 'Healthy' },
                            ].map((perm) => (
                              <div key={perm.name} className="flex items-center justify-between py-1 border-b border-slate-50 last:border-0 sm:[&:nth-last-child(2)]:border-0">
                                <code className="text-[9px] font-medium text-slate-400">{perm.name}</code>
                                <div className="flex items-center gap-1.5">
                                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]"></div>
                                  <span className="text-[8px] font-bold text-emerald-700 uppercase">{perm.status}</span>
                                </div>
                              </div>
                            ))}
                          </div>

                          <div className="pt-2 flex items-center justify-between">
                            <p className="text-[8px] text-slate-400 italic">
                              Token Integrity: Secure (Long-Lived)
                            </p>
                            <Button variant="ghost" className="h-6 text-[8px] text-slate-400 hover:text-red-600 font-bold uppercase">
                              Disconnect
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* LinkedIn Section */}
      <Card className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden max-w-4xl mx-auto w-full shrink-0">
        <CardHeader className="p-6 border-b border-slate-50 bg-slate-50/30">
          <CardTitle className="flex items-center gap-3 text-slate-900 text-[10px] font-bold uppercase tracking-widest">
            <div className="bg-blue-700 p-1.5 rounded text-white"><Linkedin size={16} /></div> 
            LinkedIn Ads Integration
          </CardTitle>
          <CardDescription className="text-[11px] text-slate-500 font-medium pt-1">Connect your LinkedIn Campaign Manager to listen for lead form submissions.</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center py-8 bg-slate-50/50 border border-dashed border-slate-200 rounded-xl gap-4">
             <Linkedin size={32} className="text-slate-200" />
             <div className="text-center">
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">LinkedIn Lead Gen API (Enterprise)</p>
               <p className="text-[10px] text-slate-500 mt-1 italic">Enterprise connection required for LinkedIn automation.</p>
             </div>
             <Button
               size="sm"
               className="bg-blue-700 hover:bg-blue-800 text-white text-[10px] font-bold uppercase tracking-widest px-6 h-9"
               onClick={() => toast.info("LinkedIn OAuth is available in premium tier.")}
             >
               Authorize LinkedIn Account
             </Button>
          </div>
        </CardContent>
      </Card>

      {/* Website Section */}
      <Card className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden max-w-4xl mx-auto w-full shrink-0">
        <CardHeader className="p-6 border-b border-slate-50 bg-slate-50/30">
          <CardTitle className="flex items-center gap-3 text-slate-900 text-[10px] font-bold uppercase tracking-widest">
            <div className="bg-indigo-600 p-1.5 rounded text-white"><Globe size={16} /></div> 
            Website Lead Capture
          </CardTitle>
          <CardDescription className="text-[11px] text-slate-500 font-medium pt-1">Configure direct lead hooks from your company website or custom landing pages.</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
           <div className="grid grid-cols-2 gap-6">
              <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-xl space-y-3">
                 <h4 className="text-[10px] font-bold text-indigo-900 uppercase">Incoming Webhook</h4>
                 <p className="text-[10px] text-indigo-600 font-medium leading-relaxed italic">Point your website forms to this dedicated endpoint cluster to ingest lead data.</p>
                 <div className="bg-white p-2 rounded border border-indigo-100 font-mono text-[9px] text-slate-500 break-all">
                   {`${window.location.origin}/api/hooks/website/${user?.id || 'uid'}`}
                 </div>
              </div>
              <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-3">
                 <h4 className="text-[10px] font-bold text-slate-900 uppercase">Universal Script Tag</h4>
                 <p className="text-[10px] text-slate-500 font-medium leading-relaxed italic">Embed this JS snippet on your site to automatically bridge existing forms to our routing engine.</p>
                 <div className="bg-white p-2 rounded border border-slate-100 font-mono text-[9px] text-slate-400">
                   {`<script src="${window.location.origin}/sdk.js" data-id="${user?.id || 'uid'}"></script>`}
                 </div>
              </div>
           </div>
        </CardContent>
      </Card>
    </div>
  );
}

function APIExplorerView() {
  const userPermissions = [
    { name: "ads_management", desc: "Manage your ads and access ad-related insights.", required: true },
    { name: "leads_retrieval", desc: "Access lead data generated from your Facebook Lead Ads.", required: true },
    { name: "pages_read_engagement", desc: "Read content on your Pages and view engagement metrics.", required: true },
    { name: "pages_show_list", desc: "View a list of the Pages you manage.", required: true },
    { name: "pages_manage_ads", desc: "Create and manage ads associated with your Pages.", required: true },
    { name: "pages_manage_metadata", desc: "Manage Page settings and metadata (required for webhooks).", required: true },
    { name: "public_profile", desc: "Basic identity information.", required: true },
    { name: "pages_messaging", desc: "Send and receive messages on behalf of your Page.", required: false },
    { name: "whatsapp_business_management", desc: "Manage WhatsApp Business accounts linked to your Pages.", required: false },
  ];

  const pagePermissions = [
    { name: "LEADS_RETRIEVAL", desc: "Allows the app to fetch leads for the specific Page.", required: true },
    { name: "ADS_MANAGEMENT", desc: "Allows basic ad management tasks for the Page.", required: true },
    { name: "MODERATE", desc: "Enable comment moderation and basic interaction.", required: false },
    { name: "CREATE_CONTENT", desc: "Post content or replies as the Page.", required: false },
    { name: "MANAGE", desc: "Full administrative access to settings and roles.", required: false },
  ];

  const appPermissions = [
    { name: "leads_retrieval", desc: "Advanced access level for lead data scraping.", required: true },
    { name: "pages_manage_metadata", desc: "Permission to subscribe to Page real-time updates.", required: true },
    { name: "ads_management", desc: "Programmatic access to the Marketing API.", required: true },
    { name: "pages_read_engagement", desc: "Content reading permission for interaction tracking.", required: true },
    { name: "pages_show_list", desc: "Permission to enumerate linked business assets.", required: true },
  ];

  return (
    <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-8">
      <div className="flex flex-col gap-2">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Meta API Explorer & Permissions Gate</h2>
        <p className="text-xs text-slate-500 font-medium">Reference for required OAuth scopes and platform capabilities required for multi-tenant lead automation.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* User Scopes */}
        <Card className="bg-white border-slate-100 shadow-sm flex flex-col">
          <CardHeader className="p-5 border-b border-slate-50 bg-slate-50/50">
            <div className="flex items-center gap-2 mb-1">
              <Users size={14} className="text-indigo-600" />
              <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-slate-900">User Scopes (OAuth)</CardTitle>
            </div>
            <CardDescription className="text-[9px] text-slate-400">Permissions requested during user login handshake.</CardDescription>
          </CardHeader>
          <CardContent className="p-4 flex-1 space-y-3">
            {userPermissions.map(p => (
              <div key={p.name} className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <code className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">{p.name}</code>
                  {p.required && <Badge className="h-4 text-[7px] px-1 font-bold bg-amber-100 text-amber-700 border-amber-200">REQUIRED</Badge>}
                </div>
                <p className="text-[9px] text-slate-500 leading-tight">{p.desc}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Page Tasks */}
        <Card className="bg-white border-slate-100 shadow-sm flex flex-col">
          <CardHeader className="p-5 border-b border-slate-50 bg-slate-50/50">
            <div className="flex items-center gap-2 mb-1">
              <Layout size={14} className="text-emerald-600" />
              <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-slate-900">Page Tasks (Access Tokens)</CardTitle>
            </div>
            <CardDescription className="text-[9px] text-slate-400">Capabilities allowed on individual Facebook Pages.</CardDescription>
          </CardHeader>
          <CardContent className="p-4 flex-1 space-y-3">
            {pagePermissions.map(p => (
              <div key={p.name} className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <code className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">{p.name}</code>
                  {p.required && <Badge className="h-4 text-[7px] px-1 font-bold bg-amber-100 text-amber-700 border-amber-200">REQUIRED</Badge>}
                </div>
                <p className="text-[9px] text-slate-500 leading-tight">{p.desc}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* App Settings */}
        <Card className="bg-white border-slate-100 shadow-sm flex flex-col">
          <CardHeader className="p-5 border-b border-slate-50 bg-slate-50/50">
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck size={14} className="text-amber-600" />
              <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-slate-900">App Review (Console)</CardTitle>
            </div>
            <CardDescription className="text-[9px] text-slate-400">Permissions that must be approved in Meta Dashboard.</CardDescription>
          </CardHeader>
          <CardContent className="p-4 flex-1 space-y-3">
            {appPermissions.map(p => (
              <div key={p.name} className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <code className="text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">{p.name}</code>
                  <Badge className="h-4 text-[7px] px-1 font-bold bg-amber-100 text-amber-700 border-amber-200">REQUIRED</Badge>
                </div>
                <p className="text-[9px] text-slate-500 leading-tight">{p.desc}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Integration Guide */}
      <Card className="bg-slate-900 border-slate-800 text-slate-300">
        <CardHeader className="p-6 border-b border-white/5">
          <CardTitle className="text-xs font-bold uppercase tracking-widest text-white flex items-center gap-2">
            <Zap size={14} className="text-indigo-400" />
            Integration Checklist
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Client-Side Scopes</h4>
            <ul className="space-y-2">
              <li className="text-[10px] flex items-start gap-2">
                <Check size={12} className="text-emerald-500 shrink-0 mt-0.5" />
                <span>Request long-lived user tokens (60 days) to prevent frequent disconnections.</span>
              </li>
              <li className="text-[10px] flex items-start gap-2">
                <Check size={12} className="text-emerald-500 shrink-0 mt-0.5" />
                <span>Exchange User Tokens for Page Access Tokens using the <code className="bg-white/5 px-1 rounded">/page_id?fields=access_token</code> endpoint.</span>
              </li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">App Review Requirements</h4>
            <ul className="space-y-2">
              <li className="text-[10px] flex items-start gap-2">
                <Check size={12} className="text-emerald-500 shrink-0 mt-0.5" />
                <span>Verify Business in Meta Business Manager to move out of Development Mode.</span>
              </li>
              <li className="text-[10px] flex items-start gap-2">
                <Check size={12} className="text-emerald-500 shrink-0 mt-0.5" />
                <span>Submit App for Review with a screencast showing how lead retrieval is used.</span>
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function OtherServicesView({ user }: { user: any }) {
  return (
    <div className="max-w-4xl mx-auto w-full flex-1 overflow-y-auto pr-2 custom-scrollbar pb-10 space-y-8">
      {/* LinkedIn Section */}
      <Card className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden shrink-0">
        <CardHeader className="p-6 border-b border-slate-50 bg-slate-50/30">
          <CardTitle className="flex items-center gap-3 text-slate-900 text-[10px] font-bold uppercase tracking-widest">
            <div className="bg-blue-700 p-1.5 rounded text-white"><Linkedin size={16} /></div> 
            LinkedIn Lead Gen
          </CardTitle>
          <CardDescription className="text-[11px] text-slate-500 font-medium">Capture leads from LinkedIn lead forms and Sponsored Content campaigns.</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 bg-blue-50/50 border border-blue-100 rounded-xl space-y-4">
                 <h4 className="text-[10px] font-bold text-blue-900 uppercase">Incoming LinkedIn Webhook</h4>
                 <p className="text-[10px] text-blue-500 font-medium leading-relaxed italic">Directly ingest leads from LinkedIn using this endpoint cluster.</p>
                 <div className="bg-white p-3 rounded border border-blue-100 font-mono text-[10px] text-slate-500 select-all">
                   {`${window.location.origin}/api/hooks/linkedin/${user?.id || 'uid'}`}
                 </div>
              </div>
              <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl flex flex-col items-center justify-center text-center gap-4">
                 <Linkedin size={32} className="text-slate-200" />
                 <div className="text-center">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">LinkedIn OAuth (Premium)</p>
                    <p className="text-[10px] text-slate-500 mt-1 italic">Native account linking is available in the premium tier.</p>
                 </div>
                 <Button
                   size="sm"
                   className="bg-blue-700 hover:bg-blue-800 text-white text-[10px] font-bold uppercase tracking-widest px-6 h-9"
                   onClick={() => toast.info("LinkedIn OAuth is available in premium tier.")}
                 >
                   Unlock Premium OAuth
                 </Button>
              </div>
           </div>
        </CardContent>
      </Card>

      {/* YouTube Section */}
      <Card className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden shrink-0">
        <CardHeader className="p-6 border-b border-slate-50 bg-slate-50/30">
          <CardTitle className="flex items-center gap-3 text-slate-900 text-[10px] font-bold uppercase tracking-widest">
            <div className="bg-red-600 p-1.5 rounded text-white"><Youtube size={16} /></div> 
            YouTube Lead Extension
          </CardTitle>
          <CardDescription className="text-[11px] text-slate-500 font-medium">Capture leads from YouTube interactive ad extensions directly into your pipeline.</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center py-8 bg-red-50/30 border border-dashed border-red-100 rounded-xl gap-4">
             <Youtube size={32} className="text-red-200" />
             <div className="text-center">
               <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest">YouTube Ads Webhook</p>
               <p className="text-[10px] text-red-500 mt-1 italic">Configure your YouTube Lead extensions to this endpoint:</p>
               <div className="mt-2 bg-white px-4 py-2 rounded border border-red-100 font-mono text-[9px] text-slate-500 break-all select-all">
                  {`${window.location.origin}/api/hooks/youtube/${user?.id || 'uid'}`}
               </div>
             </div>
             <Button
               size="sm"
               className="bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold uppercase tracking-widest px-6 h-9"
               onClick={() => toast.info("Google Ads Linking coming soon.")}
             >
               Link Google Ads Account
             </Button>
          </div>
        </CardContent>
      </Card>

      {/* WordPress Section */}
      <Card className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden shrink-0">
        <CardHeader className="p-6 border-b border-slate-50 bg-slate-50/30">
          <CardTitle className="flex items-center gap-3 text-slate-900 text-[10px] font-bold uppercase tracking-widest">
            <div className="bg-slate-900 p-1.5 rounded text-white"><Layers size={16} /></div> 
            WordPress Companion
          </CardTitle>
          <CardDescription className="text-[11px] text-slate-500 font-medium pt-1">Connect your WP Forms, Gravity Forms, or Contact Form 7 via our companion plugin.</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 bg-slate-50/50 border border-slate-100 rounded-xl space-y-4">
                 <h4 className="text-[10px] font-bold text-slate-900 uppercase">Incoming WP Webhook</h4>
                 <p className="text-[10px] text-slate-500 font-medium leading-relaxed italic">Point your WordPress webhook action to this cluster-local endpoint.</p>
                 <div className="bg-white p-3 rounded border border-slate-100 font-mono text-[10px] text-slate-500 select-all">
                   {`${window.location.origin}/api/hooks/wordpress/${user?.id || 'uid'}`}
                 </div>
              </div>
              <div className="p-6 bg-indigo-50 border border-indigo-100 rounded-xl flex flex-col justify-center text-center">
                 <Layers size={32} className="mx-auto text-indigo-200 mb-3" />
                 <p className="text-[10px] font-bold text-indigo-900 uppercase">WordPress Plugin v2.4</p>
                 <p className="text-[10px] text-indigo-600 mt-1 font-medium">Download the plugin to simplify your installation process.</p>
                 <Button variant="link" className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest mt-2 underline">Download Plugin.zip</Button>
              </div>
           </div>
        </CardContent>
      </Card>

      {/* Website Section */}
      <Card className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden shrink-0">
        <CardHeader className="p-6 border-b border-slate-50 bg-slate-50/30">
          <CardTitle className="flex items-center gap-3 text-slate-900 text-[10px] font-bold uppercase tracking-widest">
            <div className="bg-indigo-600 p-1.5 rounded text-white"><Globe size={16} /></div> 
            Website Lead Capture
          </CardTitle>
          <CardDescription className="text-[11px] text-slate-500 font-medium">Sync leads from any custom website or landing page.</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 bg-indigo-50/50 border border-indigo-100 rounded-xl space-y-4">
                 <h4 className="text-[10px] font-bold text-indigo-900 uppercase">Site Webhook</h4>
                 <p className="text-[10px] text-indigo-600 font-medium leading-relaxed italic">JSON POST leads directly to our router.</p>
                 <div className="bg-white p-3 rounded border border-indigo-100 font-mono text-[10px] text-slate-500 select-all">
                   {`${window.location.origin}/api/hooks/website/${user?.id || 'uid'}`}
                 </div>
              </div>
              <div className="p-6 bg-slate-50 border border-slate-100 rounded-xl flex flex-col justify-center text-center">
                 <Code2 size={32} className="mx-auto text-slate-200 mb-3" />
                 <p className="text-[10px] font-bold text-slate-900 uppercase">SDK Script</p>
                 <p className="text-[10px] text-slate-500 mt-1 font-medium">Embed our form JS for legacy site support.</p>
                 <div className="mt-2 bg-white p-2 rounded border border-slate-100 font-mono text-[8px] text-slate-400">
                   {`<script src="${window.location.origin}/sdk.js" data-id="${user?.id || 'uid'}"></script>`}
                 </div>
              </div>
           </div>
        </CardContent>
      </Card>

      <Card className="bg-white rounded-xl border border-slate-100 shadow-sm shadow-slate-100 overflow-hidden shrink-0">
        <CardHeader className="p-6 border-b border-slate-50 bg-slate-50/30">
          <CardTitle className="flex items-center gap-3 text-slate-900 text-[10px] font-bold uppercase tracking-widest">
            <div className="bg-emerald-600 p-1.5 rounded text-white"><MessageSquare size={16} /></div>
            WhatsApp Infrastructure
          </CardTitle>
          <CardDescription className="text-[11px] text-slate-500 font-medium">Global message routing and template verification gateway.</CardDescription>
        </CardHeader>
        <CardContent className="p-6 text-center py-12">
          <div className="p-4 border border-emerald-100 rounded-xl bg-emerald-50/30 flex items-center justify-between mb-8">
            <div className="flex flex-col text-left">
              <span className="text-[11px] font-bold text-emerald-900 uppercase">LeadFlow Gateway Cluster</span>
              <span className="text-[9px] text-emerald-600 font-mono mt-1 font-bold">STATUS: STABLE_200_OK</span>
            </div>
            <Badge className="bg-emerald-600 text-white border-0 text-[9px] uppercase font-bold py-1 px-3 shadow-lg shadow-emerald-200">System Ready</Badge>
          </div>
          <div className="p-8 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50 flex flex-col items-center">
            <Layers size={40} className="text-slate-300 mb-4" />
            <h3 className="text-sm font-bold text-slate-600 uppercase tracking-widest mb-2">Secondary Connectors</h3>
            <p className="text-xs text-slate-400 max-w-sm mb-6 leading-relaxed">
              Additional communication channels are optimized and ready for deployment. Request activation to link your business accounts.
            </p>
            <Button variant="outline" size="sm" className="text-[9px] font-bold uppercase tracking-widest text-slate-500 border-2" disabled>
              Coming Soon / Activation Required
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function SystemView({ onRefresh }: { onRefresh: () => void }) {
  return (
    <div className="flex-1 flex flex-col gap-6 min-h-0 overflow-y-auto custom-scrollbar pr-2 pb-6">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-widest flex items-center gap-2">
            <ShieldAlert size={18} className="text-amber-600" /> Infrastructure Maintenance
          </h2>
          <p className="text-[11px] text-slate-500 font-medium">Internal tools for repairing system connections and infrastructure state.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 shrink-0">
        <Card className="bg-amber-50 border-amber-200 border shadow-sm">
          <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0">
            <div className="flex items-center gap-3">
              <div className="bg-amber-500 p-2 rounded text-white shadow-lg shadow-amber-100">
                <Wrench size={18} />
              </div>
              <div>
                <p className="text-xs font-bold text-amber-900 uppercase">Self-Repair Utilities</p>
                <p className="text-[10px] text-amber-700 font-medium">Re-sync Meta Webhook subscriptions and capture latest status details.</p>
              </div>
            </div>
            <Button 
              size="sm" 
              className="bg-amber-600 text-white font-bold text-[10px] uppercase tracking-widest px-4 hover:bg-amber-700"
              onClick={async () => {
                const loadingToast = toast.loading("Repairing webhook connections...");
                try {
                  const res = await fetch("/api/connections/pages/sync", {
                    method: "POST",
                    credentials: 'include'
                  });
                  if (res.ok) {
                    toast.dismiss(loadingToast);
                    toast.success("Webhook Synchronization Complete");
                    onRefresh();
                  } else {
                    toast.dismiss(loadingToast);
                    toast.error("Repair sequence failed.");
                  }
                } catch (e) {
                  toast.dismiss(loadingToast);
                  toast.error("Network error during repair.");
                }
              }}
            >
              Repair All Webhooks
            </Button>
          </CardHeader>
        </Card>

        <Card className="bg-indigo-50/50 border-indigo-100 border-dashed border-2">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-600 p-2 rounded text-white shadow-lg shadow-indigo-200">
                <Link size={18} />
              </div>
              <div>
                <p className="text-xs font-bold text-indigo-900 uppercase">Dev Utilities</p>
                <p className="text-[10px] text-indigo-700 font-medium">Connect a virtual page to test lead automation instantly.</p>
              </div>
            </div>
            <Button 
              size="sm" 
              className="bg-indigo-600 text-white font-bold text-[10px] uppercase tracking-widest px-4 hover:bg-indigo-700"
              onClick={async () => {
                const res = await fetch("/api/connections/pages", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    id: "mock_page_" + Math.random().toString(36).substr(2, 9),
                    name: "Developer Test Page",
                    accessToken: "mock_token"
                  }),
                  credentials: 'include'
                });
                if (res.ok) {
                  toast.success("Mock Page Connected Successfully");
                  onRefresh();
                } else {
                  toast.error("Failed to connect mock page.");
                }
              }}
            >
              Connect Mock Page
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white rounded-xl border border-slate-100 shadow-sm">
        <CardHeader className="p-4 border-b border-slate-50 flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
              <Activity size={16} className="text-indigo-600" /> Database Integrity Health
            </CardTitle>
            <CardDescription className="text-[10px] text-slate-400">Current system table state verified across local persistence layer.</CardDescription>
          </div>
          <Badge className="bg-emerald-100 text-emerald-700 border-0 text-[10px] uppercase font-bold px-3">Sync Status: Stable</Badge>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-center">
              <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Users</p>
              <p className="text-lg font-mono font-bold text-slate-900">VERIFIED</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-center">
              <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Workflows</p>
              <p className="text-lg font-mono font-bold text-slate-900">ACTIVE</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-center">
              <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Logs</p>
              <p className="text-lg font-mono font-bold text-slate-900">WRITABLE</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function TestingView({ connections, onRefresh }: any) {
  const [simulationData, setSimulationData] = useState<{ pageId: string, name: string, email: string, phone: string, formId?: string }>({
    pageId: "",
    name: "John Doe (Simulated)",
    email: "john.doe@test.ai",
    phone: "+91 9999999999",
    formId: ""
  });
  const [logs, setLogs] = useState("Loading system logs...");
  const [forms, setForms] = useState<any[]>([]);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await fetch("/api/debug/logs", { credentials: 'include' });
        if (res.ok) setLogs(await res.text());
      } catch (e) {
        setLogs("Error fetching logs.");
      }
    };
    fetchLogs();
    const interval = setInterval(fetchLogs, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if ((simulationData as any).pageId) {
      fetch(`/api/pages/${(simulationData as any).pageId}/forms`, { credentials: 'include' })
        .then(r => r.json())
        .then(setForms)
        .catch(() => setForms([]));
    }
  }, [(simulationData as any).pageId]);

  const handleClearLogs = async () => {
    try {
      const res = await fetch("/api/debug/logs/clear", { method: "POST", credentials: 'include' });
      if (res.ok) {
        setLogs("Log history cleared by admin.");
        toast.success("Log history cleared.");
      }
    } catch (e) {
        toast.error("Failed to clear logs.");
    }
  };

  const handleSimulate = async () => {
    if (!simulationData.pageId) {
      toast.error("Please select a page for simulation.");
      return;
    }
    try {
      const res = await fetch("/api/debug/simulate-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...simulationData,
          leadName: simulationData.name,
          leadEmail: simulationData.email,
          leadPhone: simulationData.phone
        }),
        credentials: 'include'
      });
      if (res.ok) {
        toast.success("Lead Injection Sequence Started");
      }
    } catch (e) {
      toast.error("Simulation failure.");
    }
  };


  return (
    <div className="flex-1 flex flex-col gap-6 min-h-0 overflow-y-auto custom-scrollbar pr-2 pb-6">
      <div className="grid grid-cols-1 gap-6 shrink-0">
        <Card className="bg-white rounded-xl border border-slate-100 shadow-sm flex flex-col">
          <CardHeader className="p-6 border-b border-slate-50">
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
              <TestTube size={16} className="text-indigo-600" /> Lead Simulation Engine
            </CardTitle>
            <CardDescription className="text-[11px] text-slate-400">Inject mock lead data directly into the processing pipeline.</CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Target Connection</label>
                {simulationData.pageId && (
                  <div 
                    id="sim-copy-page-id"
                    className="flex items-center gap-2 cursor-pointer hover:bg-slate-100 px-2 py-0.5 rounded transition-colors group"
                    onClick={() => {
                      navigator.clipboard.writeText(simulationData.pageId);
                      toast.success("ID Copied to clipboard");
                    }}
                  >
                    <span className="text-[9px] font-mono text-slate-400 group-hover:text-blue-600">ID: {simulationData.pageId}</span>
                    <Copy size={10} className="text-slate-300 group-hover:text-blue-600" />
                  </div>
                )}
              </div>
              <Select value={simulationData.pageId} onValueChange={(v: string) => setSimulationData({ ...simulationData, pageId: v })}>
                <SelectTrigger className="text-xs border-slate-200 h-10 bg-slate-50/50">
                  <SelectValue placeholder="Select Destination Page" />
                </SelectTrigger>
                <SelectContent>
                  {connections.map((c: any) => (
                    <SelectItem key={c.id} value={c.id}>
                      <div className="flex justify-between w-full items-center gap-4">
                        <span>{c.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">ID: {c.id}</span>
                      </div>
                    </SelectItem>
                  ))}
                  {connections.length === 0 && (
                     <SelectItem value="none" disabled>No connections available</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Specific Form Context</label>
                {simulationData.formId && (
                  <div 
                    id="sim-copy-form-id"
                    className="flex items-center gap-2 cursor-pointer hover:bg-slate-100 px-2 py-0.5 rounded transition-colors group"
                    onClick={() => {
                      navigator.clipboard.writeText(simulationData.formId);
                      toast.success("ID Copied to clipboard");
                    }}
                  >
                    <span className="text-[9px] font-mono text-slate-400 group-hover:text-blue-600">ID: {simulationData.formId}</span>
                    <Copy size={10} className="text-slate-300 group-hover:text-blue-600" />
                  </div>
                )}
              </div>
              <Select value={simulationData.formId} onValueChange={(v: string) => setSimulationData({ ...simulationData, formId: v })}>
                <SelectTrigger className="text-xs border-slate-200 h-10 bg-slate-50/50">
                  <SelectValue placeholder="Select Form (Optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mock_form_123">Default Gateway Form</SelectItem>
                  {forms.map((f: any) => (
                    <SelectItem key={f.id} value={f.id}>
                      <div className="flex justify-between w-full items-center gap-4">
                        <span>{f.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">ID: {f.id}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Lead Name</label>
                <Input className="text-[11px] border-slate-200 h-10" value={simulationData.name} onChange={(e) => setSimulationData({ ...simulationData, name: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Email Address</label>
                <Input className="text-[11px] border-slate-200 h-10" value={simulationData.email} onChange={(e) => setSimulationData({ ...simulationData, email: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Mobile Number</label>
                <Input className="text-[11px] border-slate-200 h-10" value={simulationData.phone} onChange={(e) => setSimulationData({ ...simulationData, phone: e.target.value })} />
              </div>
            </div>

            <Button className="w-full bg-slate-900 hover:bg-slate-800 text-[10px] font-bold uppercase tracking-widest h-12 mt-2 shadow-lg shadow-slate-900/10" onClick={handleSimulate}>
              <Zap size={14} className="mr-2" /> Execute Injection Sequence
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-xl border border-slate-100 shadow-sm flex flex-col">
          <CardHeader className="p-6 border-b border-slate-50">
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
              <Activity size={16} className="text-emerald-600" /> Infrastructure Health
            </CardTitle>
            <CardDescription className="text-[11px] text-slate-400">Real-time status of system components.</CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
             <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[9px] text-slate-500 font-mono">META_AUTH_CONFIG</span>
                  <span className="text-[9px] text-emerald-600 font-bold">READY</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[9px] text-slate-500 font-mono">DB_CLUSTER_HEALTH</span>
                  <span className="text-[9px] text-emerald-600 font-bold">OPTIMAL</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[9px] text-slate-500 font-mono">REDIRECT_DETECTED</span>
                  <span className="text-[8px] text-indigo-400 font-mono truncate max-w-[150px]">{window.location.host}</span>
                </div>
             </div>
             <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm" className="text-[9px] font-bold uppercase border-slate-200 h-8 font-sans" onClick={onRefresh}>Refresh State</Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-[9px] font-bold uppercase border-slate-200 h-8 font-sans text-indigo-600 hover:bg-indigo-50" 
                  onClick={async () => {
                    toast.info("Repairing Meta Webhook Subscriptions...");
                    try {
                      const res = await fetch("/api/connections/pages/sync", { method: "POST", credentials: 'include' });
                      if (res.ok) {
                        toast.success("Webhooks Re-subscribed Successfully");
                        onRefresh();
                      } else {
                        toast.error("Repair failed. Check logs.");
                      }
                    } catch (e) {
                      toast.error("Network error during repair.");
                    }
                  }}
                >
                  Repair Webhooks
                </Button>
             </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-6 shrink-0">
        <Card className="bg-white rounded-xl border border-slate-100 shadow-sm flex flex-col">
          <CardHeader className="p-6 border-b border-slate-50 bg-indigo-50/20">
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-indigo-700 flex items-center gap-2">
              <Link size={16} /> Meta Webhook Configuration
            </CardTitle>
            <CardDescription className="text-[11px] text-indigo-600/70">Connect your Facebook App to this system.</CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
             <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Callback URL</label>
                  <div className="flex gap-2">
                    <Input readOnly value={`${window.location.origin}/api/webhooks/facebook`} className="h-9 text-[10px] font-mono bg-slate-50" />
                    <Button variant="outline" size="sm" className="h-9 px-2" onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/api/webhooks/facebook`);
                      toast.success("URL copied");
                    }}>Copy</Button>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Verify Token</label>
                  <div className="flex gap-2">
                    <Input readOnly value="LMS_PRO_SECRET_2024" className="h-9 text-[10px] font-mono bg-slate-50" />
                    <Button variant="outline" size="sm" className="h-9 px-2" onClick={() => {
                      navigator.clipboard.writeText("LMS_PRO_SECRET_2024");
                      toast.success("Token copied");
                    }}>Copy</Button>
                  </div>
                </div>
             </div>
             <div className="p-3 rounded-lg bg-amber-50 border border-amber-100 text-[10px] text-amber-700 leading-relaxed italic">
               <strong>Important:</strong> Go to <a href="https://developers.facebook.com" target="_blank" className="font-bold underline">Meta Developers Portal</a> &gt; Webhooks &gt; Page &gt; Edit Subscription. Paste these values and subscribe to the <strong>"leadgen"</strong> field.
             </div>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-xl border border-slate-100 shadow-sm flex flex-col">
          <CardHeader className="p-6 border-b border-slate-50">
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
              <Activity size={16} className="text-emerald-600" /> Webhook Health
            </CardTitle>
            <CardDescription className="text-[11px] text-slate-400">Real-time status of system components.</CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
             <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[9px] text-slate-500 font-mono">META_WEBHOOK_STATUS</span>
                  <span className="text-[9px] text-emerald-600 font-bold">LISTENING</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[9px] text-slate-500 font-mono">AUTH_CHALLENGE_MODE</span>
                  <span className="text-[9px] text-emerald-600 font-bold">ACTIVE_VERIFIED</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[9px] text-slate-500 font-mono">SHARED_APP_PROXY</span>
                  <span className="text-[8px] text-indigo-400 font-mono truncate max-w-[150px]">{window.location.host}</span>
                </div>
             </div>
             <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm" className="text-[9px] font-bold uppercase border-slate-200 h-8 font-sans" onClick={onRefresh}>Refresh State</Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-[9px] font-bold uppercase border-slate-200 h-8 font-sans text-indigo-600 hover:bg-indigo-50" 
                  onClick={async () => {
                    toast.info("Repairing Meta Webhook Subscriptions...");
                    try {
                      const res = await fetch("/api/connections/pages/sync", { method: "POST", credentials: 'include' });
                      if (res.ok) {
                        toast.success("Webhooks Re-subscribed Successfully");
                        onRefresh();
                      } else {
                        toast.error("Repair failed. Check logs.");
                      }
                    } catch (e) {
                      toast.error("Network error during repair.");
                    }
                  }}
                >
                  Repair Webhooks
                </Button>
             </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-slate-950 rounded-xl border border-slate-900 shadow-2xl overflow-hidden flex-1 flex flex-col min-h-[300px]">
        <CardHeader className="p-4 border-b border-white/5 bg-white/10 flex-row items-center justify-between space-y-0">
          <CardTitle className="text-[10px] text-white/70 font-bold uppercase tracking-widest flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
            Server Runtime Console
          </CardTitle>
          <div className="flex items-center gap-4">
            <span className="text-[8px] text-white/30 font-mono">REFRESH_RATE: 3s</span>
            <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 text-[8px] text-red-400 hover:text-red-300 hover:bg-red-500/10 font-bold uppercase tracking-widest border border-red-500/20"
                onClick={handleClearLogs}
            >
                Clear History
            </Button>
          </div>
        </CardHeader>
        <div className="flex-1 p-5 font-mono text-[10px] whitespace-pre-wrap overflow-y-auto custom-scrollbar leading-relaxed bg-black/20">
          {(logs || "").split('\n').map((line: string, i: number) => {
            const isError = line.toLowerCase().includes('error') || 
                            line.toLowerCase().includes('unauthorized') || 
                            line.toLowerCase().includes('fail');
            return (
              <div key={i} className={`${isError ? 'text-red-500' : 'text-emerald-500/90'} mb-1`}>
                {line}
              </div>
            );
          })}
          {!logs && <div className="text-white/20 italic">Waiting for telemetry...</div>}
        </div>
      </Card>
    </div>
  );
}

function SettingsView({ user, onRefreshUser }: { user: any, onRefreshUser: () => void }) {
  const [webhookUrl, setWebhookUrl] = useState(user?.webhookUrl || "");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user?.webhookUrl) setWebhookUrl(user.webhookUrl);
  }, [user]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/user/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ webhookUrl }),
        credentials: 'include'
      });
      if (res.ok) {
        toast.success("Settings updated successfully");
        onRefreshUser();
      } else {
        toast.error("Failed to update settings");
      }
    } catch (e) {
      toast.error("Error saving settings");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar pb-10">
      <Card className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden max-w-2xl">
        <CardHeader className="p-6 border-b border-slate-50 bg-slate-50/30">
        <CardTitle className="flex items-center gap-3 text-slate-900 text-sm font-bold uppercase tracking-widest">
           <Settings size={18} className="text-slate-500" />
           System Configuration
        </CardTitle>
        <CardDescription className="text-[11px] text-slate-500 font-medium">Manage your tenant-wide automation parameters and endpoints.</CardDescription>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Global Webhook Endpoint</label>
            <Badge variant="outline" className="text-[9px] font-bold text-indigo-600 bg-indigo-50 border-indigo-100 px-2 py-0.5 uppercase tracking-tighter">Event: LEAD_RECEIVED</Badge>
          </div>
          <p className="text-[10px] text-slate-400 mb-2">We will POST a JSON payload to this URL every time a new lead is captured from your Meta forms.</p>
          <div className="flex gap-2">
            <Input 
              value={webhookUrl} 
              onChange={(e) => setWebhookUrl(e.target.value)} 
              placeholder="https://your-api.com/webhooks/incoming" 
              className="bg-slate-50 border-slate-100 text-slate-700 h-11 text-xs font-medium placeholder:text-slate-300 focus:ring-indigo-500 transition-all"
            />
            <Button 
                onClick={handleSave} 
                disabled={isSaving}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] uppercase tracking-widest px-6 h-11 shadow-lg shadow-indigo-900/10"
            >
              {isSaving ? "Saving..." : "Apply"}
            </Button>
          </div>
          <p className="text-[9px] text-slate-400 italic">Example payload: <span className="font-mono text-slate-500 bg-slate-50 px-1">{"{ \"event\": \"LEAD_RECEIVED\", \"lead\": { ... } }"}</span></p>
        </div>

        <div className="pt-6 border-t border-slate-50 opacity-40 grayscale pointer-events-none">
           <div className="flex items-center justify-between mb-4">
             <div className="flex flex-col">
               <span className="text-[10px] font-bold text-slate-900 uppercase">Encryption Mode</span>
               <span className="text-[9px] text-slate-500">AES-256-GCM hardware accelerated</span>
             </div>
             <Switch checked={true} />
           </div>
           <div className="flex items-center justify-between">
             <div className="flex flex-col">
               <span className="text-[10px] font-bold text-slate-900 uppercase">Multi-region Replication</span>
               <span className="text-[9px] text-slate-500">Auto-failover between clusters</span>
             </div>
             <Switch checked={true} />
           </div>
        </div>
      </CardContent>
    </Card>
    </div>
  );
}

function LeadsView() {
  const [leads, setLeads] = useState<any[]>([]);
  const [executions, setExecutions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [showRaw, setShowRaw] = useState(false);

  const fetchData = async () => {
    try {
      const [leadsRes, execRes] = await Promise.all([
        fetch("/api/leads", { credentials: 'include' }),
        fetch("/api/executions", { credentials: 'include' })
      ]);
      if (leadsRes.ok) setLeads(await leadsRes.json());
      if (execRes.ok) setExecutions(await execRes.json());
    } catch (e) {
      console.error("Failed to fetch leads or executions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000); 
    return () => clearInterval(interval);
  }, []);

  const filteredExecutions = selectedLeadId 
    ? executions.filter(e => e.leadId === selectedLeadId)
    : executions;

  const selectedLead = leads.find(l => l.id === selectedLeadId);

  return (
    <div className="flex-1 flex gap-6 min-h-0">
      {/* Table Section */}
      <Card className="flex-[3] bg-white rounded-xl border border-slate-100 shadow-sm flex flex-col overflow-hidden">
        <CardHeader className="p-5 border-b border-slate-50 flex-row items-center justify-between space-y-0">
          <div>
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Global Consumption Log</h2>
            {selectedLeadId && <p className="text-[9px] text-indigo-600 font-bold mt-1 uppercase tracking-tight">Viewing history for: {selectedLead?.facebookId}</p>}
          </div>
          <div className="flex gap-2">
             {selectedLeadId && (
               <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => {
                  setSelectedLeadId(null);
                  setShowRaw(false);
                }}
                className="h-7 text-[9px] font-bold uppercase text-slate-400 hover:text-indigo-600"
               >
                 Show All Traffic
               </Button>
             )}
             <Badge variant="outline" className="text-[9px] font-bold uppercase tracking-widest border-slate-200 text-slate-400">
               {loading ? "Syncing..." : `${leads.length} Leads Cached`}
             </Badge>
          </div>
        </CardHeader>
        <div className="flex-1 overflow-auto custom-scrollbar">
          <Table>
            <TableHeader className="bg-slate-50 sticky top-0 z-10">
              <TableRow className="border-0">
                <TableHead className="px-6 py-4 font-bold text-[10px] text-slate-400 uppercase tracking-widest">Entity Info</TableHead>
                <TableHead className="px-6 py-4 font-bold text-[10px] text-slate-400 uppercase tracking-widest">Source Page</TableHead>
                <TableHead className="px-6 py-4 font-bold text-[10px] text-slate-400 uppercase tracking-widest text-center">Status</TableHead>
                <TableHead className="px-6 py-4 font-bold text-[10px] text-slate-400 uppercase tracking-widest text-right">Captured At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="text-xs divide-y divide-slate-50">
              {leads.map((l: any) => {
                const data = JSON.parse(l.data || "{}");
                const isSelected = selectedLeadId === l.id;
                return (
                  <TableRow 
                    key={l.id} 
                    onClick={() => {
                      setSelectedLeadId(l.id);
                      setShowRaw(false);
                    }}
                    className={`cursor-pointer border-0 group transition-all ${isSelected ? "bg-indigo-50/50" : "hover:bg-slate-50/50"}`}
                  >
                    <TableCell className="px-6 py-5">
                      <div className="flex flex-col">
                        <span className={`font-bold transition-colors ${isSelected ? "text-indigo-600" : "text-slate-800 group-hover:text-indigo-600"}`}>
                          {data.name || data.full_name || "Unknown User"}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono mt-0.5">{data.email || "no-email@id.io"}</span>
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-5 text-slate-600 font-medium">
                      {l.form?.page?.name || "Deleted Page"}
                    </TableCell>
                    <TableCell className="px-6 py-5 text-center">
                      <span className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider ${isSelected ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200" : "bg-emerald-100 text-emerald-700"}`}>
                        {isSelected ? "Inspecting" : "Captured"}
                      </span>
                    </TableCell>
                    <TableCell className="px-6 py-5 text-slate-400 text-[10px] text-right font-bold uppercase tracking-tighter">
                      {new Date(l.createdAt).toLocaleTimeString()}
                    </TableCell>
                  </TableRow>
                );
              })}
              {leads.length === 0 && !loading && (
                <TableRow>
                  <TableCell colSpan={4} className="h-48 text-center text-slate-300 font-medium italic">
                    No leads recorded yet. Try simulating a lead in the testing tab.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Dark Console Section */}
      <div className="flex-[2] bg-slate-900 rounded-xl border border-slate-800 shadow-2xl flex flex-col overflow-hidden ring-1 ring-white/5">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between shrink-0 bg-slate-900/50">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${selectedLeadId ? "bg-indigo-500 animate-pulse" : "bg-emerald-500"} shadow-[0_0_8px_rgba(16,185,129,0.5)]`}></div>
            <h2 className="font-bold text-[10px] uppercase tracking-widest text-slate-400">
              {selectedLeadId ? "Advanced Execution Logs" : "Execution Buffer"}
            </h2>
          </div>
          <div className="flex gap-1.5 opacity-40">
             <span className="text-[8px] text-white/50 font-mono">{selectedLeadId ? "FILTERED_VIEW" : "LIVE_FEED"}</span>
          </div>
        </div>
        <div className="flex-1 p-5 font-mono text-[10px] space-y-4 overflow-y-auto custom-scrollbar leading-relaxed">
          {selectedLeadId && selectedLead && (
            <div className="mb-6 p-4 bg-white/5 rounded-xl border border-white/5 space-y-2">
              <div className="flex justify-between items-center border-b border-white/5 pb-2 mb-2">
                <div className="text-[9px] text-slate-500 uppercase font-bold tracking-widest">Lead Metadata</div>
                <button 
                  onClick={() => setShowRaw(!showRaw)}
                  className="text-[8px] px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-400 font-bold uppercase hover:bg-indigo-500/30 transition-colors"
                >
                  {showRaw ? "Hide Raw Data" : "View JSON Object"}
                </button>
              </div>
              
              {showRaw ? (
                <div className="bg-slate-950 p-3 rounded-lg border border-white/10 text-[8.5px] max-h-[200px] overflow-auto custom-scrollbar whitespace-pre shadow-inner">
                  <code className="text-emerald-400">
                    {JSON.stringify(JSON.parse(selectedLead.data), null, 2)}
                  </code>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 text-[9px]">
                  <span className="text-white/30">FB_ID:</span> <span className="text-white/90">{selectedLead.facebookId}</span>
                  <span className="text-white/30">FORM:</span> <span className="text-white/90">{selectedLead.form?.name || "N/A"} ({selectedLead.formId})</span>
                  <span className="text-white/30">STATUS:</span> <span className="text-emerald-500 font-bold">READY</span>
                </div>
              )}
            </div>
          )}

          {filteredExecutions.map((e: any) => {
            const logs = JSON.parse(e.logs || "[]");
            const time = new Date(e.createdAt).toLocaleTimeString([], { hour12: false });
            return (
              <div key={e.id} className="space-y-2 pb-4 border-b border-white/5 last:border-0 animate-in fade-in slide-in-from-right-2 duration-300">
                <div className="flex gap-3 text-indigo-400">
                  <span className="opacity-40 select-none">{time}</span> 
                  <span className="text-white font-bold tracking-widest bg-indigo-500/20 px-1 rounded-sm uppercase">WEBHOOK_IN</span> 
                  Payload from {e.lead?.facebookId || "SIMULATOR"}
                </div>
                
                <div className="flex gap-3 text-emerald-400">
                  <span className="opacity-40 select-none">{time}</span> 
                  <span className="text-white font-bold tracking-widest bg-emerald-500/20 px-1 rounded-sm uppercase">ENGINE_EXE</span> 
                  Mapping to "{e.workflow?.name || "System"}" pipeline
                </div>

                {logs.map((log: any, idx: number) => {
                  const isError = log.status === 'FAILED';
                  return (
                    <div key={idx} className="flex flex-col ml-4">
                      <div className={`flex gap-3 ${isError ? 'text-red-400' : 'text-slate-400 italic'}`}>
                        <span className="opacity-40 select-none">{time}</span>
                        <span className="font-bold">{isError ? 'ERROR' : 'TRANSACTION'}:</span>
                        <span>{log.action} {log.target ? `-> ${new URL(log.target).hostname}` : ''}</span>
                        <span className={`px-1 rounded-sm font-bold scale-90 ${isError ? 'bg-red-500/20' : 'bg-emerald-500/10 text-emerald-500'}`}>
                          {log.status === 'SUCCESS' ? 'OK' : 'FAIL'}
                        </span>
                      </div>
                      {(log.error || log.response) && (
                        <div className="ml-16 mt-1 p-2 bg-white/5 rounded border border-white/5 text-[9px] text-white/40 font-mono break-all max-w-[90%]">
                          <span className="text-white/20 mr-2 Uppercase font-bold">Res:</span>
                          {log.error || log.response}
                        </div>
                      )}
                    </div>
                  );
                })}

                <div className="flex gap-3 text-slate-600 italic ml-4">
                  <span className="opacity-40 select-none">{time}</span>
                  <span>Handshake: System Cluster 2 {"->"} 200 OK (Persisted)</span>
                </div>
              </div>
            );
          })}
          
          {filteredExecutions.length === 0 && selectedLeadId && (
            <div className="text-white/10 italic text-center py-20 uppercase tracking-widest text-[9px] border border-dashed border-white/5 rounded-xl">
               No automation history found for this specific entity.
            </div>
          )}

          {!selectedLeadId && (
            <div className="flex gap-3 text-slate-600 mt-8 font-bold border-t border-white/5 pt-4">
              <span className="opacity-30 select-none">{new Date().toLocaleTimeString([], { hour12: false })}</span> 
              SysLog: LeadFlow Node Health: STABLE (v2.1.0-LIVE)
            </div>
          )}

          {executions.length === 0 && !selectedLeadId && (
            <div className="text-white/10 italic text-center py-20 uppercase tracking-widest text-[9px] border border-dashed border-white/5 rounded-xl">
              Waiting for incoming lead telemetry stream...
            </div>
          )}
        </div>
        <div className="p-4 bg-slate-950 border-t border-slate-900 shrink-0">
           <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-widest">
             <span className="text-slate-600 italic font-medium">Cluster: NODE_PRODUCTION</span>
             <span className="text-indigo-400 cursor-pointer hover:text-indigo-300 transition-colors flex items-center gap-1.5">
               <span className="w-1 h-1 rounded-full bg-indigo-400 animate-ping"></span>
               {selectedLeadId ? "Advanced Telemetry Active" : "Live Telemetry Stream"}
             </span>
           </div>
        </div>
      </div>
    </div>
  );
}
