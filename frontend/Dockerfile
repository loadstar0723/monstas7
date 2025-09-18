# Build stage
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy all files
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:18-alpine

# Install PM2 globally
RUN npm install -g pm2

# Create non-root user
RUN addgroup -g 1000 -S app && \
    adduser -u 1000 -S app -G app

# Set working directory
WORKDIR /app

# Copy built application from builder
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules

# Create PM2 ecosystem file
RUN echo "module.exports = { \
  apps: [{ \
    name: 'monstas7-frontend', \
    script: 'node_modules/.bin/next', \
    args: 'start', \
    instances: 'max', \
    exec_mode: 'cluster', \
    autorestart: true, \
    watch: false, \
    max_memory_restart: '1G', \
    env: { \
      NODE_ENV: 'production', \
      PORT: 3000 \
    } \
  }] \
}" > ecosystem.config.js

# Change ownership
RUN chown -R app:app /app

# Use non-root user
USER app

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {r.statusCode === 200 ? process.exit(0) : process.exit(1)})"

# Start the application with PM2
CMD ["pm2-runtime", "start", "ecosystem.config.js"]