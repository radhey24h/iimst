FROM mongo:7.0

COPY docker/mongodb/mongo-entrypoint.sh /usr/local/bin/mongo-entrypoint.sh
COPY docker/mongodb/restore-latest.sh /usr/local/bin/restore-latest.sh

RUN chmod +x /usr/local/bin/mongo-entrypoint.sh /usr/local/bin/restore-latest.sh

ENTRYPOINT ["/usr/local/bin/mongo-entrypoint.sh"]
CMD ["mongod"]
