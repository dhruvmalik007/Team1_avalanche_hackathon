# syntax=docker/dockerfile:1
FROM node:20-alpine AS base
WORKDIR /app

# Install deps only when needed
FROM base AS deps
COPY package.json package-lock.json* yarn.lock* pnpm-lock.yaml* ./
RUN if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
    elif [ -f package-lock.json ]; then npm ci; \
    elif [ -f pnpm-lock.yaml ]; then npm i -g pnpm && pnpm i --frozen-lockfile; \
    else npm i; fi

FROM deps AS build
COPY tsconfig.json ./
COPY src ./src
RUN npm run build || yarn build || pnpm build

FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
# Entrypoint is defined by ECS task command override (node /app/dist/index.js)
CMD ["node", "/app/dist/index.js"]
