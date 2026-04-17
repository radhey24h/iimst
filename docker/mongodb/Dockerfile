FROM mongo:latest

# Install MongoDB database tools (mongodump/mongorestore) from the MongoDB APT repo
# already configured in this image. The '|| true' after update tolerates unreachable Ubuntu repos.
RUN (apt-get update || true) \
    && apt-get install -y --no-install-recommends mongodb-database-tools \
    && rm -rf /var/lib/apt/lists/*

# Auto-restore on first run via official init mechanism
COPY docker/mongodb/restore-init.sh /docker-entrypoint-initdb.d/99-restore.sh
RUN chmod +x /docker-entrypoint-initdb.d/99-restore.sh
