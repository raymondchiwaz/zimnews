FROM node:18-alpine

WORKDIR /app

# Install system dependencies
RUN apk add --no-cache openssl

# Copy package files
COPY package*.json ./

# Install all dependencies with npm configuration for better reliability
RUN npm config set fetch-retry-maxtimeout 600000 && \
    npm config set fetch-timeout 600000 && \
    npm install --no-audit --no-fund

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate || echo "Prisma generate skipped"

# Build the application
RUN npm run build

# Expose port
EXPOSE 8001

# Lightweight Node-based health check (no curl dependency)
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD ["node","-e","const http=require('http');const t=setTimeout(()=>process.exit(1),2500);http.get('http://localhost:8001/health',r=>{if(r.statusCode!==200){process.exit(1);}r.on('data',()=>{});r.on('end',()=>{clearTimeout(t);process.exit(0);});}).on('error',()=>{clearTimeout(t);process.exit(1);});"]

# Start the application
CMD ["npm", "start"]