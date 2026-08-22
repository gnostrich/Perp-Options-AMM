# Stage 1: Dependencies
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
RUN \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm i --frozen-lockfile; \
  else echo "Lockfile not found." && exit 1; \
  fi

# Stage 2: Builder
FROM node:20-alpine AS builder

# Accept build arguments. NEXT_PUBLIC_* is baked at `next build` — a var absent
# here never reaches the bundle no matter what the service env says.
ARG NEXT_PUBLIC_API_URL=/api/proxy
ARG NEXT_PUBLIC_TEMPORAL_WALLET_LONG
ARG NEXT_PUBLIC_TEMPORAL_WALLET_SHORT
ARG NEXT_PUBLIC_EXECUTION_MODE=paper
ARG NEXT_PUBLIC_V3_BOOK

# Set them as environment variables for Next.js build
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_TEMPORAL_WALLET_LONG=$NEXT_PUBLIC_TEMPORAL_WALLET_LONG
ENV NEXT_PUBLIC_TEMPORAL_WALLET_SHORT=$NEXT_PUBLIC_TEMPORAL_WALLET_SHORT
ENV NEXT_PUBLIC_EXECUTION_MODE=$NEXT_PUBLIC_EXECUTION_MODE
ENV NEXT_PUBLIC_V3_BOOK=$NEXT_PUBLIC_V3_BOOK

WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Increase Node.js memory for build
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_OPTIONS="--max-old-space-size=4096"
RUN \
  if [ -f yarn.lock ]; then yarn build; \
  elif [ -f package-lock.json ]; then npm run build; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm build; \
  else echo "Lockfile not found." && exit 1; \
  fi

# Stage 3: Runner (Final Production Image)
FROM node:20-alpine AS runner
WORKDIR /app

# Install AWS CLI and jq for Parameter Store
RUN apk add --no-cache aws-cli jq

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy necessary files from builder
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json

# Copy entrypoint script
COPY --chown=nextjs:nodejs entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

USER nextjs

EXPOSE 3000

ENTRYPOINT ["/app/entrypoint.sh"]
