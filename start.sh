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

# Start both services in the background.
pnpm start &
APP_PID=$!

nginx -g 'daemon off;' &
NGINX_PID=$!

# If nginx exits for any reason, kill the app so the container stops and can restart.
{
    wait $NGINX_PID 2>/dev/null || true
    echo "[start] nginx exited — stopping app"
    kill $APP_PID 2>/dev/null || true
} &

# Forward SIGTERM/SIGINT to both children for clean shutdown.
trap 'kill $APP_PID $NGINX_PID 2>/dev/null; exit 0' TERM INT

# Block until the app process exits, then stop nginx.
wait $APP_PID
echo "[start] App process exited — stopping nginx"
kill $NGINX_PID 2>/dev/null || true
wait
