FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat curl
WORKDIR /app

# Copy package files and root .env
COPY package*.json ./
COPY ../.env .env

RUN npm install --legacy-peer-deps

# Rebuild source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.js automatically loads .env during build

# Build application
RUN npm run build

# Production image, copy all files and run as app
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

# Install curl for healthchecks
RUN apk add --no-cache curl

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Copy public folder (now exists in repo with .gitkeep)
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Set permissions
USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
