#!/usr/bin/env bash
set -Eeuo pipefail

log() {
  printf '[backup] %s\n' "$*"
}

required_vars=(
  MONGO_HOST
  MONGO_PORT
  MONGO_USERNAME
  MONGO_PASSWORD
  MONGO_AUTH_DB
  MONGO_DB_NAME
  BACKUP_ROOT
)

for var_name in "${required_vars[@]}"; do
  if [[ -z "${!var_name:-}" ]]; then
    log "Missing required env var: ${var_name}"
    exit 1
  fi
done

mkdir -p "${BACKUP_ROOT}"

timestamp="$(date '+%Y-%m-%d-%H-%M')"
backup_dir="${BACKUP_ROOT}/backup-${timestamp}"
start_epoch="$(date +%s)"

log "Starting MongoDB backup for database '${MONGO_DB_NAME}'."
log "Backup target: ${backup_dir}"

mkdir -p "${backup_dir}"

mongodump \
  --host "${MONGO_HOST}" \
  --port "${MONGO_PORT}" \
  --username "${MONGO_USERNAME}" \
  --password "${MONGO_PASSWORD}" \
  --authenticationDatabase "${MONGO_AUTH_DB}" \
  --db "${MONGO_DB_NAME}" \
  --out "${backup_dir}"

end_epoch="$(date +%s)"
duration_sec="$((end_epoch - start_epoch))"
size_human="$(du -sh "${backup_dir}" | awk '{print $1}')"

log "Backup completed successfully."
log "Duration: ${duration_sec}s"
log "Size: ${size_human}"

printf 'BACKUP_DIR=%s\n' "${backup_dir}"
printf 'DURATION_SECONDS=%s\n' "${duration_sec}"
printf 'BACKUP_SIZE=%s\n' "${size_human}"
