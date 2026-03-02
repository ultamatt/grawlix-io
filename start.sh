#!/bin/bash
set -euo pipefail

require_env() {
  local name="$1"
  if [ -z "${!name:-}" ]; then
    echo "[start] Missing required environment variable: ${name}"
    exit 1
  fi
}

resolve_cms_db_path() {
  local configured_path="$1"
  if [[ "$configured_path" = /* ]]; then
    echo "$configured_path"
  else
    echo "/app/apps/cms/$configured_path"
  fi
}

# WEB_PORT is the public nginx port. DO App Platform injects it as PORT;
# we honour that as a fallback so either name works.
export WEB_PORT="${WEB_PORT:-${PORT:-8080}}"
export STRAPI_PORT="${STRAPI_PORT:-1337}"
export DATABASE_FILENAME="${DATABASE_FILENAME:-.tmp/data.db}"
export ALLOWED_HOSTS="${ALLOWED_HOSTS:-grawlix.io,www.grawlix.io,localhost,127.0.0.1}"
LITESTREAM_DB_PATH="$(resolve_cms_db_path "$DATABASE_FILENAME")"

require_env "AWS_S3_BUCKET"
require_env "AWS_ACCESS_KEY_ID"
require_env "AWS_SECRET_ACCESS_KEY"

echo "[start] WEB_PORT=${WEB_PORT}  STRAPI_PORT=${STRAPI_PORT}"
echo "[start] DATABASE_FILENAME=${DATABASE_FILENAME}  LITESTREAM_DB_PATH=${LITESTREAM_DB_PATH}"

# Substitute WEB_PORT and STRAPI_PORT into the nginx template.
envsubst '${WEB_PORT} ${STRAPI_PORT}' \
  < /etc/nginx/templates/default.conf.template \
  > /etc/nginx/conf.d/default.conf

LITESTREAM_PID=""
LITESTREAM_EFFECTIVE_REPLICA_URL="s3://${AWS_S3_BUCKET}/strapi/data"
echo "[litestream] Derived replica URL from AWS_S3_BUCKET: ${LITESTREAM_EFFECTIVE_REPLICA_URL}"

if [ -n "${AWS_S3_ENDPOINT:-}" ] && [[ "${LITESTREAM_EFFECTIVE_REPLICA_URL}" != *"endpoint="* ]]; then
  if [[ "${LITESTREAM_EFFECTIVE_REPLICA_URL}" == *"?"* ]]; then
    LITESTREAM_EFFECTIVE_REPLICA_URL="${LITESTREAM_EFFECTIVE_REPLICA_URL}&endpoint=${AWS_S3_ENDPOINT}"
  else
    LITESTREAM_EFFECTIVE_REPLICA_URL="${LITESTREAM_EFFECTIVE_REPLICA_URL}?endpoint=${AWS_S3_ENDPOINT}"
  fi
  echo "[litestream] Using custom S3 endpoint: ${AWS_S3_ENDPOINT}"
fi

mkdir -p "$(dirname "$LITESTREAM_DB_PATH")"
echo "[litestream] Restoring database (if replica exists): ${LITESTREAM_EFFECTIVE_REPLICA_URL}"
litestream restore -if-db-not-exists -if-replica-exists -o "$LITESTREAM_DB_PATH" "$LITESTREAM_EFFECTIVE_REPLICA_URL"

# Ensure the DB file exists so replicate can start before first write.
if [ ! -f "$LITESTREAM_DB_PATH" ]; then
  touch "$LITESTREAM_DB_PATH"
fi

litestream replicate "$LITESTREAM_DB_PATH" "$LITESTREAM_EFFECTIVE_REPLICA_URL" &
LITESTREAM_PID=$!
echo "[litestream] Replication started (pid ${LITESTREAM_PID})"

# Start app & reverse proxy in the background.
pnpm start &
APP_PID=$!

nginx -g 'daemon off;' &
NGINX_PID=$!

PIDS=("$APP_PID" "$NGINX_PID")
PIDS+=("$LITESTREAM_PID")

shutdown_children() {
  kill "${PIDS[@]}" 2>/dev/null || true
  wait "${PIDS[@]}" 2>/dev/null || true
}

# Forward SIGTERM/SIGINT: kill children, wait for them to finish, then exit.
trap 'shutdown_children; exit 0' TERM INT

# wait -n: returns when the FIRST background job exits (bash 4.3+).
# wait -p: captures which PID exited (bash 5.1+; bookworm ships 5.2).
# Temporarily disable errexit so a non-zero exit from a child does not
# prevent us from running the shutdown and diagnostics logic below.
EXITED_PID=""
set +e
wait -n -p EXITED_PID "${PIDS[@]}" 2>/dev/null
EXIT_CODE=$?
set -e

if [ "$EXITED_PID" = "$APP_PID" ]; then
  echo "[start] App exited (code ${EXIT_CODE}) — stopping remaining services"
elif [ "$EXITED_PID" = "$NGINX_PID" ]; then
  echo "[start] nginx exited (code ${EXIT_CODE}) — stopping remaining services"
elif [ "$EXITED_PID" = "$LITESTREAM_PID" ]; then
  echo "[start] litestream exited (code ${EXIT_CODE}) — stopping remaining services"
else
  echo "[start] Unknown process exited (code ${EXIT_CODE}) — stopping remaining services"
fi

shutdown_children
exit "$EXIT_CODE"
