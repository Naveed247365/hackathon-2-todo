# Multi-stage Dockerfile for Next.js Frontend
# Stage 1: Dependencies - Install production dependencies
FROM node:18-alpine AS deps

WORKDIR /app

# Copy package files
COPY phase-2/frontend/package*.json ./

# Install dependencies
RUN npm ci --only=production

# Stage 2: Builder - Build Next.js application
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY phase-2/frontend/package*.json ./

# Install all dependencies (including dev dependencies for build)
RUN npm ci

# Copy application source
COPY phase-2/frontend/ .

# Build arguments for Next.js public environment variables
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_MCP_SERVER_URL

# Set environment variables for build time
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NEXT_PUBLIC_MCP_SERVER_URL=${NEXT_PUBLIC_MCP_SERVER_URL}

# Build Next.js application
RUN npm run build

# Stage 3: Runtime - Minimal production image
FROM node:18-alpine AS runner

WORKDIR /app

# Set production environment
ENV NODE_ENV production

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001 && \
    chown -R nextjs:nodejs /app

# Copy build artifacts from builder
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/package*.json ./

# Copy production dependencies from deps stage
COPY --from=deps --chown=nextjs:nodejs /app/node_modules ./node_modules

# Expose frontend port
EXPOSE 3000

# Switch to non-root user
USER nextjs

# Start Next.js server
CMD ["npm", "start"]
