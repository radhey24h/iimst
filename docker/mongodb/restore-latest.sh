#!/usr/bin/env bash
set -Eeuo pipefail

log() {
  printf '[mongo-restore] %s\n' "$*"
}

MONGO_HOST="${MONGO_HOST:-localhost}"
MONGO_PORT="${MONGO_PORT:-27017}"
MONGO_USERNAME="${MONGO_INITDB_ROOT_USERNAME:-${MONGO_USERNAME:-root}}"
MONGO_PASSWORD="${MONGO_INITDB_ROOT_PASSWORD:-${MONGO_PASSWORD:-example}}"
MONGO_AUTH_DB="${MONGO_AUTH_DB:-admin}"
MONGO_DB_NAME="${MONGO_DB_NAME:-${MONGO_INITDB_DATABASE:-iimst}}"
BACKUP_ROOT="${BACKUP_ROOT:-/backup}"

log "Checking whether restore is needed for '${MONGO_DB_NAME}'."

collections_count="$(
  mongosh --quiet \
    --host "${MONGO_HOST}" \
    --port "${MONGO_PORT}" \
    --username "${MONGO_USERNAME}" \
    --password "${MONGO_PASSWORD}" \
    --authenticationDatabase "${MONGO_AUTH_DB}" \
    --eval "db.getSiblingDB('${MONGO_DB_NAME}').getCollectionNames().length" \
    2>/dev/null || echo "0"
)"

if [[ "${collections_count}" =~ ^[0-9]+$ ]] && (( collections_count > 0 )); then
  log "Database is not empty (${collections_count} collections). Skipping restore."
  exit 0
fi

if [[ ! -d "${BACKUP_ROOT}" ]]; then
  log "Backup root '${BACKUP_ROOT}' does not exist. Nothing to restore."
  exit 0
fi

latest_backup="$(ls -1d "${BACKUP_ROOT}"/backup-* 2>/dev/null | sort | tail -n 1 || true)"
if [[ -z "${latest_backup}" ]]; then
  log "No backup directories found in '${BACKUP_ROOT}'."
  exit 0
fi

if [[ ! -d "${latest_backup}/${MONGO_DB_NAME}" ]]; then
  log "Latest backup '${latest_backup}' does not contain database folder '${MONGO_DB_NAME}'."
  exit 0
fi

start_epoch="$(date +%s)"
backup_size="$(du -sh "${latest_backup}" | awk '{print $1}')"

log "Restoring from: ${latest_backup}"
log "Backup size: ${backup_size}"

mongorestore \
  --host "${MONGO_HOST}" \
  --port "${MONGO_PORT}" \
  --username "${MONGO_USERNAME}" \
  --password "${MONGO_PASSWORD}" \
  --authenticationDatabase "${MONGO_AUTH_DB}" \
  --db "${MONGO_DB_NAME}" \
  --drop \
  "${latest_backup}/${MONGO_DB_NAME}"

end_epoch="$(date +%s)"
duration_sec="$((end_epoch - start_epoch))"
log "Restore completed in ${duration_sec}s."
