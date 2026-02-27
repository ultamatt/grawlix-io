FROM node:22-bookworm-slim

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps/web/package.json apps/web/package.json
COPY apps/cms/package.json apps/cms/package.json

RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm --filter @grawlix/web build && \
  APP_KEYS="build-key-1,build-key-2,build-key-3,build-key-4" \
  API_TOKEN_SALT="build-api-token-salt" \
  ADMIN_JWT_SECRET="build-admin-jwt-secret" \
  TRANSFER_TOKEN_SALT="build-transfer-token-salt" \
  JWT_SECRET="build-jwt-secret" \
  DATABASE_FILENAME=".tmp/data.db" \
  pnpm --filter @grawlix/cms build

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=1337

EXPOSE 3000 1337

CMD ["pnpm", "start"]
