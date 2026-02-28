#!/bin/sh
set -e

# WEB_PORT is the public nginx port. DO App Platform injects it as PORT;
# we honour that as a fallback so either name works.
export WEB_PORT="${WEB_PORT:-${PORT:-8080}}"
export STRAPI_PORT="${STRAPI_PORT:-1337}"

echo "[start] WEB_PORT=${WEB_PORT}  STRAPI_PORT=${STRAPI_PORT}"

# Substitute WEB_PORT and STRAPI_PORT into the nginx template.
envsubst '${WEB_PORT} ${STRAPI_PORT}' \
  < /etc/nginx/templates/default.conf.template \
  > /etc/nginx/conf.d/default.conf

# Start Strapi + Astro in the background via turbo.
pnpm start &

# Run nginx in the foreground so the container stays alive.
exec nginx -g 'daemon off;'
