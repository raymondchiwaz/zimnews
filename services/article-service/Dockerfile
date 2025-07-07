FROM node:18-alpine

WORKDIR /app

# Install all dependencies with npm configuration for better reliability
COPY package*.json ./
RUN npm config set fetch-retry-maxtimeout 600000 && \
    npm config set fetch-timeout 600000 && \
    npm install --no-audit --no-fund

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

EXPOSE 8002

CMD ["npm", "run", "dev"] 