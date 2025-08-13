# Stage 1: deps
FROM node:18-alpine AS deps

WORKDIR /app

# Copy package files first
COPY --chown=node:node package*.json ./

# Install dependencies
RUN npm ci --no-audit --no-fund

# Stage 2: dev runtime
FROM node:18-alpine

WORKDIR /app

ENV NODE_ENV=development

USER node

# Copy installed deps
COPY --from=deps /app/node_modules ./node_modules

# Copy source (everything else)
COPY --chown=node:node . .

# Dev entrypoint to reinstall deps if bind mount overwrote node_modules
COPY --chown=node:node <<'EOF' /entrypoint.sh
#!/bin/sh
set -e
if [ ! -f node_modules/.bin/next ]; then
  echo "[entrypoint] Installing dependencies (node_modules missing)..."
  npm ci --no-audit --no-fund
fi
exec "$@"
EOF
RUN chmod +x /entrypoint.sh

EXPOSE 3000

ENTRYPOINT ["/entrypoint.sh"]
CMD ["npm", "run", "dev"]