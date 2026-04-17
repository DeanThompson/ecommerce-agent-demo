FROM node:20-alpine AS builder
WORKDIR /app

ARG NPM_REGISTRY=https://registry.npmmirror.com
ARG PNPM_VERSION=10.29.3

RUN npm config set registry ${NPM_REGISTRY} \
  && npm install -g pnpm@${PNPM_VERSION}

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY backend/package.json backend/package.json
COPY frontend/package.json frontend/package.json

RUN pnpm config set registry ${NPM_REGISTRY}
RUN pnpm install --frozen-lockfile --filter frontend...

COPY frontend ./frontend

RUN pnpm --filter frontend build

FROM nginx:1.27-alpine

RUN apk add --no-cache openssl

COPY deploy/nginx/default.conf /etc/nginx/conf.d/default.conf
COPY deploy/web-entrypoint.sh /entrypoint.sh
COPY --from=builder /app/frontend/dist /usr/share/nginx/html

RUN chmod +x /entrypoint.sh

EXPOSE 80

CMD ["/entrypoint.sh"]
