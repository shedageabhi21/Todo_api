# ---- Stage 1: install production dependencies ----
FROM node:24-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

# ---- Stage 2: minimal runtime image ----
FROM node:24-alpine
ENV NODE_ENV=production PORT=3000
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY package.json ./
COPY src ./src
COPY public ./public

# Run as the unprivileged "node" user that ships with the image
USER node
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s \
  CMD wget -qO- http://localhost:3000/health || exit 1

CMD ["node", "src/server.js"]
