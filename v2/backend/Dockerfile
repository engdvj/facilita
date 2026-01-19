# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/
COPY prisma.config.ts ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Generate Prisma Client (dummy URL for build time only)
ENV DATABASE_URL="postgresql://postgres:postgres@localhost:5432/facilita_v2?schema=public"
RUN npm run prisma:generate

# Build application
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Install curl for healthcheck
RUN apk add --no-cache curl

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/
COPY prisma.config.ts ./

# Install production dependencies only
RUN npm ci --only=production

# Copy built application from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Create directories for uploads and backups
RUN mkdir -p uploads/images uploads/documents backups

# Expose port
EXPOSE 3001

# Start application
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/src/main.js"]
