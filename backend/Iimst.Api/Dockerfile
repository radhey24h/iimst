# Build stage
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY Iimst.Api.csproj ./
RUN dotnet restore

COPY . ./
RUN dotnet publish -c Release -o /app/publish --no-restore

# Tools stage: download mongodump/mongorestore (distro-agnostic, arch-aware)
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

# Run stage
FROM mcr.microsoft.com/dotnet/aspnet:10.0
WORKDIR /app
EXPOSE 5000

COPY --from=tools /usr/local/bin/mongodump /usr/local/bin/mongodump
COPY --from=tools /usr/local/bin/mongorestore /usr/local/bin/mongorestore

COPY --from=build /app/publish ./
COPY scripts ./scripts
RUN chmod +x ./scripts/*.sh

# Default env (overridden by docker-compose file)
ENV ASPNETCORE_URLS=http://+:5000
ENTRYPOINT ["dotnet", "Iimst.Api.dll"]
