# Stage 1: Build stage
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files first (to optimize caching)
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy application code AFTER installing dependencies
COPY . .

# Stage 2: Production stage
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Set environment variables
ENV NODE_ENV=production

# Create non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Set ownership in the build stage
RUN mkdir -p /app/uploads && chown -R appuser:appgroup /app/uploads

# Copy necessary files from the builder stage
COPY --from=builder --chown=appuser:appgroup /app /app

# Clean up unnecessary files
RUN yarn cache clean && rm -rf /app/node_modules/.cache

# Set correct permissions for uploads directory
RUN chmod -R 755 /app/uploads

# Expose the port
EXPOSE 5000

# Use the non-root user
USER appuser

# Set the entry point
ENTRYPOINT ["node", "index.js"]



