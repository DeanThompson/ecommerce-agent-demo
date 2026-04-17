FROM node:20-slim
WORKDIR /app

ARG NPM_REGISTRY=https://registry.npmmirror.com
ARG PNPM_VERSION=10.29.3

# Use Aliyun mirror for Debian apt sources on CN-friendly networks.
RUN if [ -f /etc/apt/sources.list.d/debian.sources ]; then \
    sed -i 's|http://deb.debian.org/debian|https://mirrors.aliyun.com/debian|g; s|http://deb.debian.org/debian-security|https://mirrors.aliyun.com/debian-security|g' /etc/apt/sources.list.d/debian.sources; \
  fi

RUN npm config set registry ${NPM_REGISTRY} \
  && npm install -g pnpm@${PNPM_VERSION}

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY backend/package.json backend/package.json
COPY frontend/package.json frontend/package.json

RUN pnpm config set registry ${NPM_REGISTRY}
RUN pnpm install --frozen-lockfile --filter backend...

COPY backend ./backend

RUN pnpm --filter backend build

ENV NODE_ENV=production
ENV PORT=3001

EXPOSE 3001

CMD ["pnpm", "--filter", "backend", "start"]
