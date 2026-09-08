# syntax=docker/dockerfile:1

# ---- Stage 1: dependencies -------------------------------------------------
# Installs ONLY production dependencies so the final image stays small
# and contains no lint/test tooling.
FROM node:20-alpine AS deps

WORKDIR /app

# Copy only manifests first so this layer is cached unless deps change.
COPY package.json package-lock.json ./

RUN npm ci --omit=dev


# ---- Stage 2: runtime ------------------------------------------------------
FROM node:20-alpine AS runtime

ENV NODE_ENV=production
ENV PORT=3000

WORKDIR /app

# Bring in pruned production node_modules from the deps stage.
COPY --from=deps /app/node_modules ./node_modules

# Application source.
COPY package.json ./
COPY src ./src

# Run as an unprivileged user. The `node` user ships with the official image.
USER node

EXPOSE 3000

# Container-native health check hitting the app's own /health endpoint.
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://127.0.0.1:'+(process.env.PORT||3000)+'/health',r=>process.exit(r.statusCode===200?0:1)).on('error',()=>process.exit(1))"

# Start the app.
CMD ["node", "src/index.js"]
