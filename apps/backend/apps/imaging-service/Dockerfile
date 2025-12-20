# Stage 1 – build with Nx
FROM node:20-alpine AS builder
WORKDIR /workspace

# copy only what the build needs
COPY package*.json nx.json tsconfig*.json eslint.config.mjs ./
COPY apps ./apps
COPY libs ./libs

RUN npm ci
RUN npx nx build imaging-service

# Stage 2 – runtime image
FROM node:20-alpine
WORKDIR /app

# Set production environment
ENV NODE_ENV=production

# Install dumb-init for proper signal handling
RUN apk update && apk add --no-cache dumb-init

# install runtime deps (root package.json is enough)
COPY package*.json ./
RUN npm ci --omit=dev

# copy compiled service from Nx dist folder
COPY --from=builder /workspace/apps/imaging-service/dist ./

EXPOSE 5003
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "main.js"]