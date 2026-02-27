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

# PUBLIC_CMS_URL is embedded in the Astro static build at compile time.
# Pass it as a build arg: docker build --build-arg PUBLIC_CMS_URL=https://example.com:1337
ARG PUBLIC_CMS_URL=http://localhost:1337
ENV PUBLIC_CMS_URL=$PUBLIC_CMS_URL

RUN PUBLIC_CMS_URL=$PUBLIC_CMS_URL pnpm --filter @grawlix/web build && \
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

# 3000 → Astro static preview (web frontend)
# 1337 → Strapi API / Admin
EXPOSE 3000 1337

CMD ["pnpm", "start"]
