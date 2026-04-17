#!/usr/bin/env bash
set -Eeuo pipefail

log() {
  printf '[mongo-entrypoint] %s\n' "$*"
}

cleanup() {
  if [[ -n "${MONGO_CHILD_PID:-}" ]] && kill -0 "${MONGO_CHILD_PID}" >/dev/null 2>&1; then
    log "Stopping mongod child process (${MONGO_CHILD_PID})."
    kill -TERM "${MONGO_CHILD_PID}" >/dev/null 2>&1 || true
    wait "${MONGO_CHILD_PID}" || true
  fi
}

trap cleanup SIGINT SIGTERM

log "Starting MongoDB with official entrypoint."
/usr/local/bin/docker-entrypoint.sh "$@" &
MONGO_CHILD_PID="$!"

log "Waiting for MongoDB readiness."
for i in {1..60}; do
  if mongosh --quiet "mongodb://${MONGO_INITDB_ROOT_USERNAME:-root}:${MONGO_INITDB_ROOT_PASSWORD:-example}@localhost:27017/admin" --eval "db.adminCommand('ping').ok" >/dev/null 2>&1; then
    log "MongoDB is ready."
    break
  fi
  sleep 2
done

if ! mongosh --quiet "mongodb://${MONGO_INITDB_ROOT_USERNAME:-root}:${MONGO_INITDB_ROOT_PASSWORD:-example}@localhost:27017/admin" --eval "db.adminCommand('ping').ok" >/dev/null 2>&1; then
  log "MongoDB did not become ready in time."
  wait "${MONGO_CHILD_PID}"
  exit 1
fi

/usr/local/bin/restore-latest.sh || log "Restore script exited with non-zero status; continuing startup."

wait "${MONGO_CHILD_PID}"
