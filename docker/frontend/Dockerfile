# Stage 1: Dependencies — install node_modules
FROM node:20-alpine AS deps

WORKDIR /app

COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci

# Stage 2: Build — compile Next.js application
FROM node:20-alpine AS build

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY frontend .

ARG NEXT_PUBLIC_API_URL=http://localhost:8000
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

RUN mkdir -p public && npm run build

# Stage 3: Runtime — minimal production image
FROM node:20-alpine AS runtime

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

WORKDIR /app

# Copy standalone output and static assets
COPY --from=build --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=build --chown=nextjs:nodejs /app/public ./public

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
