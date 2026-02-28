#!/bin/bash
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

# Forward SIGTERM/SIGINT: kill children, wait for them to finish, then exit.
trap 'kill $APP_PID $NGINX_PID 2>/dev/null; wait $APP_PID $NGINX_PID 2>/dev/null; exit 0' TERM INT

# wait -n: returns when the FIRST background job exits (bash 4.3+).
# wait -p: captures which PID exited (bash 5.1+; bookworm ships 5.2).
EXITED_PID=""
wait -n -p EXITED_PID "$APP_PID" "$NGINX_PID" 2>/dev/null
EXIT_CODE=$?

if [ "$EXITED_PID" = "$APP_PID" ]; then
    echo "[start] App exited (code ${EXIT_CODE}) — stopping nginx"
    kill "$NGINX_PID" 2>/dev/null || true
    wait "$NGINX_PID" 2>/dev/null || true
elif [ "$EXITED_PID" = "$NGINX_PID" ]; then
    echo "[start] nginx exited (code ${EXIT_CODE}) — stopping app"
    kill "$APP_PID" 2>/dev/null || true
    wait "$APP_PID" 2>/dev/null || true
else
    echo "[start] Unknown process exited (code ${EXIT_CODE}) — shutting down"
    kill "$APP_PID" "$NGINX_PID" 2>/dev/null || true
    wait 2>/dev/null || true
fi

exit "$EXIT_CODE"
