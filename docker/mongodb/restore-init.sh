#!/usr/bin/env bash
set -euo pipefail

# This script runs via /docker-entrypoint-initdb.d/ on FIRST MongoDB initialization only.
# At this stage MongoDB is running locally without auth enforcement.

MONGO_DB_NAME="${MONGO_DB_NAME:-${MONGO_INITDB_DATABASE:-iimst}}"
BACKUP_ROOT="${BACKUP_ROOT:-/backup}"

echo "[restore-init] Checking for backups to restore for '${MONGO_DB_NAME}'."

if [[ ! -d "${BACKUP_ROOT}" ]]; then
  echo "[restore-init] Backup root '${BACKUP_ROOT}' does not exist. Skipping restore."
  exit 0
fi

latest_backup="$(ls -1d "${BACKUP_ROOT}"/backup-* 2>/dev/null | sort | tail -n 1 || true)"
if [[ -z "${latest_backup}" ]]; then
  echo "[restore-init] No backup directories found in '${BACKUP_ROOT}'. Skipping restore."
  exit 0
fi

if [[ ! -d "${latest_backup}/${MONGO_DB_NAME}" ]]; then
  echo "[restore-init] Latest backup '${latest_backup}' has no '${MONGO_DB_NAME}' folder. Skipping."
  exit 0
fi

echo "[restore-init] Restoring from: ${latest_backup}/${MONGO_DB_NAME}"
mongorestore --db "${MONGO_DB_NAME}" --drop "${latest_backup}/${MONGO_DB_NAME}"
echo "[restore-init] Restore complete."
