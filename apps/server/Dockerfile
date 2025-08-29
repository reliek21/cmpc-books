# Multi-stage build for production
FROM node:20-alpine AS base

# Install pnpm
RUN npm install -g pnpm

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Copy package files
COPY package*.json pnpm-lock.yaml* ./
COPY apps/server/package*.json ./apps/server/

# Install dependencies
RUN pnpm install --frozen-lockfile --prod=false

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/server/node_modules ./apps/server/node_modules
COPY apps/server ./apps/server

# Build application
WORKDIR /app/apps/server
RUN pnpm build

# Production image, copy all the files and run nest
FROM base AS runner
WORKDIR /app

# Don't run production as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs

# Copy built application
COPY --from=builder --chown=nestjs:nodejs /app/apps/server/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/apps/server/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/apps/server/package.json ./package.json

# Create uploads directory
RUN mkdir -p /app/uploads && chown nestjs:nodejs /app/uploads

USER nestjs

EXPOSE 3001

ENV NODE_ENV=production
ENV PORT=3001

CMD ["node", "dist/main"]
