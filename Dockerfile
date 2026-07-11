# Camera Angle Guide Pro — Next.js 15 standalone image. Three.js editor + localStorage,
# with a Convex Cloud backend for @convex-dev/auth + per-user cloud project sync. Only the
# public deployment URL is baked at build time (NEXT_PUBLIC_CONVEX_URL buildArg).
FROM node:22-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app

FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

FROM base AS builder
ARG NEXT_PUBLIC_CONVEX_URL
ENV NEXT_PUBLIC_CONVEX_URL=$NEXT_PUBLIC_CONVEX_URL
ENV NEXT_TELEMETRY_DISABLED=1
# Fail loud if the deploy forgot the buildArg — otherwise `undefined` bakes into the client
# and ConvexReactClient throws at module eval → every route 500s on an otherwise-green build.
RUN test -n "$NEXT_PUBLIC_CONVEX_URL" || (echo "ERROR: NEXT_PUBLIC_CONVEX_URL build arg required" >&2; exit 1)
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN mkdir -p public && npm run build

FROM base AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
