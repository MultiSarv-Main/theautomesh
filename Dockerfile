# ── Stage 1: Build ──────────────────────────────────────────────────────────
FROM node:20-slim AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Generate Prisma client for the target platform
RUN npx prisma generate

# Build frontend (Vite) + backend (esbuild)
RUN npm run build

# ── Stage 2: Production image ─────────────────────────────────────────────
FROM node:20-slim AS runner

# Required for Prisma on Debian (openssl 3.x)
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy only production dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy built assets and Prisma schema
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

ENV NODE_ENV=production
ENV PORT=8080

EXPOSE 8080

# Run DB migrations then start server
CMD ["sh", "-c", "npx prisma db push --skip-generate && node dist/server.cjs"]
