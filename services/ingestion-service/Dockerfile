FROM node:18-alpine
WORKDIR /app

RUN apk add --no-cache su-exec

COPY services/ingestion-service/package.json ./package.json

# Improved entrypoint: always ensure node_modules writable; install if missing
RUN printf '#!/bin/sh\nset -e\nif [ ! -d node_modules ] || [ ! -x node_modules/.bin/ts-node-dev ]; then\n  echo "[ingestion-entrypoint] Installing deps...";\n  npm install --no-audit --no-fund;\nfi\n# If running as root, drop to node user\nif [ "$(id -u)" = "0" ]; then\n  exec su-exec node "$@"\nelse\n  exec "$@"\nfi\n' > /entrypoint.sh && chmod +x /entrypoint.sh

COPY services/ingestion-service/tsconfig.json ./tsconfig.json
COPY services/ingestion-service/src ./src

EXPOSE 8004
ENTRYPOINT ["/entrypoint.sh"]
CMD ["npm","run","dev"]
