# Stage 1: install mongodump/mongorestore from the MongoDB APT repo (already in mongo image)
FROM mongo:8.0 AS tools
RUN rm -f /etc/apt/sources.list; \
    find /etc/apt/sources.list.d/ -type f ! -name '*mongo*' -delete 2>/dev/null; \
    apt-get update \
    && apt-get install -y --no-install-recommends mongodb-database-tools \
    && rm -rf /var/lib/apt/lists/*

# Stage 2: final image
FROM mongo:8.0

COPY --from=tools /usr/bin/mongodump /usr/local/bin/mongodump
COPY --from=tools /usr/bin/mongorestore /usr/local/bin/mongorestore

# Auto-restore on first run via official init mechanism
COPY docker/mongodb/restore-init.sh /docker-entrypoint-initdb.d/99-restore.sh
RUN chmod +x /docker-entrypoint-initdb.d/99-restore.sh
