# Stage 1: download mongodump/mongorestore (distro-agnostic, arch-aware)
FROM alpine:latest AS tools
RUN apk add --no-cache wget tar \
    && ARCH=$(uname -m) \
    && if [ "$ARCH" = "aarch64" ]; then ARCH="arm64"; fi \
    && wget -qO /tmp/tools.tgz \
       "https://fastdl.mongodb.org/tools/db/mongodb-database-tools-linux-${ARCH}-100.16.0.tgz" \
    && tar -xzf /tmp/tools.tgz -C /tmp \
    && mv /tmp/mongodb-database-tools-*/bin/mongodump /usr/local/bin/ \
    && mv /tmp/mongodb-database-tools-*/bin/mongorestore /usr/local/bin/ \
    && rm -rf /tmp/*

# Stage 2: final image — works on any mongo base regardless of distro
FROM mongo:8.0

COPY --from=tools /usr/local/bin/mongodump /usr/local/bin/mongodump
COPY --from=tools /usr/local/bin/mongorestore /usr/local/bin/mongorestore

# Auto-restore on first run via official init mechanism
COPY docker/mongodb/restore-init.sh /docker-entrypoint-initdb.d/99-restore.sh
RUN chmod +x /docker-entrypoint-initdb.d/99-restore.sh
