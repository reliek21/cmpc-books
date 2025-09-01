# Multi-stage build for production
FROM node:20-alpine AS base

# Install pnpm
RUN npm install -g pnpm

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files for workspace
COPY package*.json pnpm-lock.yaml* pnpm-workspace.yaml ./
COPY apps/web/package*.json ./apps/web/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package.json ./package.json
COPY --from=deps /app/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY apps/web ./apps/web

# Build application
WORKDIR /app/apps/web
RUN pnpm next build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Don't run production as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy the entire workspace
COPY --from=deps --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=deps --chown=nextjs:nodejs /app/package.json ./package.json
COPY --from=deps --chown=nextjs:nodejs /app/pnpm-workspace.yaml ./pnpm-workspace.yaml

# Copy the built application
COPY --from=builder --chown=nextjs:nodejs /app/apps/web ./apps/web

# Copy environment files
COPY --chown=nextjs:nodejs apps/web/.env.local ./apps/web/.env.local

USER nextjs

EXPOSE 3000

ENV PORT=3000

WORKDIR /app/apps/web
CMD ["pnpm", "start"]
