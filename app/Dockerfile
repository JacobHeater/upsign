# 1. Build Stage
FROM node:20-alpine AS builder
RUN apk add --no-cache libc6-compat
WORKDIR /base

# [cite_start]Copy the monorepo structure [cite: 1]
COPY ./common ./common
COPY ./app ./app

# [cite_start]Build common first [cite: 1]
RUN cd ./common && npm ci && npm run build

# [cite_start]Build the main application [cite: 1]
WORKDIR /base/app
RUN npm ci
ENV NEXT_TELEMETRY_DISABLED 1
ENV NODE_ENV production
RUN npm run build

# 2. Production Runner
FROM node:20-alpine AS runner
WORKDIR /base
ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# [cite_start]Copy the standalone output into /base [cite: 1]
COPY --from=builder --chown=nextjs:nodejs /base/app/.next/standalone ./

# [cite_start]Copy static assets into the nested app folder [cite: 1]
COPY --from=builder --chown=nextjs:nodejs /base/app/.next/static ./app/.next/static
COPY --from=builder --chown=nextjs:nodejs /base/app/public ./app/public

# [cite_start]Set WORKDIR to .next inside the app folder [cite: 1]
WORKDIR /base/app/.next

# --- THE FIX ---
# 1. Move server.js here so 'node server.js' works.
RUN cp ../server.js ./server.js
# 2. Create a symlink so that Next.js finds its required files at './.next'
RUN ln -s . ./.next

USER nextjs

EXPOSE 3000
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# Now running from /base/app/.next
CMD ["node", "server.js"]