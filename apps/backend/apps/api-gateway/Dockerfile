# Stage 1 – build with Nx
FROM node:20-alpine AS builder
WORKDIR /workspace

# copy only what the build needs
COPY package*.json nx.json tsconfig*.json eslint.config.mjs ./
COPY apps ./apps
COPY libs ./libs

RUN npm ci

# sync root files (like .env) if any changes, not fail when errors
RUN npx nx sync || true


RUN npx nx build api-gateway

# Stage 2 – runtime image
FROM node:20-alpine
WORKDIR /app


# Set production environment
ENV NODE_ENV=production

# install runtime deps (root package.json is enough)
COPY package*.json ./
RUN npm ci --omit=dev


# sync root files (like .env) if any changes, not fail when errors
RUN npx nx sync || true

# copy compiled service from Nx dist folder
COPY --from=builder /workspace/apps/api-gateway/dist ./

EXPOSE 5000
CMD ["node", "main.js"]