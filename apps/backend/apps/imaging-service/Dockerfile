# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json tsconfig.base.json tsconfig.build.json nx.json eslint.config.mjs ./
COPY apps/imaging-service ./apps/imaging-service
COPY apps ./apps
COPY libs ./libs
COPY entities ./entities

RUN npm ci
RUN npx tsc -b tsconfig.build.json

# Stage 2: Production
FROM node:20-alpine
WORKDIR /app

COPY --from=builder /app/apps/imaging-service/dist ./
RUN npm ci --omit=dev --production

EXPOSE 5004
CMD ["node", "main.js"]
