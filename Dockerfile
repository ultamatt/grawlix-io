FROM node:22-bookworm-slim

RUN apt-get update && apt-get install -y --no-install-recommends nginx gettext-base && rm -rf /var/lib/apt/lists/*

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps/web/package.json apps/web/package.json
COPY apps/cms/package.json apps/cms/package.json

RUN pnpm install --frozen-lockfile

COPY . .

# nginx reverse-proxy config (envsubst is applied at container start).
COPY nginx/default.conf.template /etc/nginx/templates/default.conf.template
# Remove the default nginx site so only our template is active.
RUN rm -f /etc/nginx/sites-enabled/default

# Startup script: substitutes env vars into nginx config, then launches everything.
COPY start.sh /start.sh
RUN chmod +x /start.sh

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
ENV STRAPI_PORT=1337

# WEB_PORT is intentionally not set here — DO App Platform injects it as PORT
# at runtime and start.sh maps PORT→WEB_PORT. Default in start.sh is 8080.

# 3000 → Astro (internal)
# STRAPI_PORT → Strapi (internal)
# PORT → nginx (public, set by DO)
EXPOSE 3000 1337 8080

CMD ["/start.sh"]
