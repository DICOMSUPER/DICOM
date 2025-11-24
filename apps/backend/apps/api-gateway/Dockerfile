# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app

# Copy root files
COPY package*.json tsconfig.base.json tsconfig.build.json nx.json eslint.config.mjs ./

# Copy source code
COPY apps/api-gateway ./apps/api-gateway
COPY apps ./apps
COPY libs ./libs
COPY entities ./entities

# Install all dependencies (dev + prod) để build
RUN npm ci

# Build tất cả TypeScript projects (libs + apps)
RUN npx tsc -b tsconfig.build.json

# Stage 2: Production
FROM node:20-alpine
WORKDIR /app

# Copy built files của API Gateway (không copy toàn bộ source)
COPY --from=builder /app/apps/api-gateway/dist ./ 

# Copy chỉ production dependencies, bỏ devDependencies
RUN npm ci --omit=dev --production

# Expose port
EXPOSE 5000

# Run main file
CMD ["node", "main.js"]
