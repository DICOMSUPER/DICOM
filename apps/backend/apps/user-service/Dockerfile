# Stage 1 – build with Nx
FROM node:20-alpine AS builder
WORKDIR /workspace

# copy only what the build needs
COPY package*.json nx.json tsconfig*.json eslint.config.mjs ./
COPY apps ./apps
COPY libs ./libs
COPY entities ./entities

RUN npm ci
RUN npx nx build user-service

# Stage 2 – runtime image
FROM node:20-alpine
WORKDIR /app

# install runtime deps (root package.json is enough)
COPY package*.json ./
RUN npm ci --omit=dev

# copy compiled service from Nx dist folder
COPY --from=builder /workspace/apps/user-service/dist ./

EXPOSE 5002
CMD ["node", "main.js"]