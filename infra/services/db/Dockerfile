FROM postgres:16-alpine3.22

# Docker will automatically look inside this folder when starting the container,
# so we know for sure that this will be executed
COPY ./init.sql /docker-entrypoint-initdb.d/init.sql

EXPOSE 5432