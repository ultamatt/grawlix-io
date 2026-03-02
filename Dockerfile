FROM node:22-bookworm-slim

ARG LITESTREAM_VERSION=0.5.9
ARG TARGETARCH

RUN apt-get update && apt-get install -y --no-install-recommends nginx gettext-base curl ca-certificates && rm -rf /var/lib/apt/lists/*

RUN set -eux; \
    TARGET_ARCH="${TARGETARCH:-}"; \
    if [ -z "${TARGET_ARCH}" ]; then \
      TARGET_ARCH="$(dpkg --print-architecture)"; \
    fi; \
    case "${TARGET_ARCH}" in \
      amd64|x86_64)  LITESTREAM_ARCH="x86_64"; LITESTREAM_SHA256="2a9caa9373c0b577ebddbadfad8e27ac906378760f5afcfba2f0a37983429e18" ;; \
      arm64|aarch64) LITESTREAM_ARCH="arm64";  LITESTREAM_SHA256="ca5c2c83975ab7500c2e0057a01ef4d42b822d00ab8ebfe9fb59c0a4d9a33c65" ;; \
      *) echo "Unsupported TARGETARCH: ${TARGET_ARCH}"; exit 1 ;; \
    esac; \
    curl -fsSL -o /tmp/litestream.deb "https://github.com/benbjohnson/litestream/releases/download/v${LITESTREAM_VERSION}/litestream-${LITESTREAM_VERSION}-linux-${LITESTREAM_ARCH}.deb"; \
    echo "${LITESTREAM_SHA256}  /tmp/litestream.deb" | sha256sum -c -; \
    dpkg -i /tmp/litestream.deb; \
    rm -f /tmp/litestream.deb

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
  APP_SECRET="build-app-secret" \
  DATABASE_FILENAME=".tmp/data.db" \
  pnpm --filter @grawlix/cms build

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV STRAPI_PORT=1337

# WEB_PORT is intentionally not set here — DO App Platform injects it as PORT
# at runtime and start.sh maps PORT→WEB_PORT. Default in start.sh is 8080.

# Only the public nginx port is exposed — internal Astro (3000) and Strapi (STRAPI_PORT)
# ports are not published. Expose both canonical values so either WEB_PORT works.
EXPOSE 8080 80

CMD ["/start.sh"]
