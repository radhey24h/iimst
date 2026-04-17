# Build stage
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY Iimst.Api.csproj ./
RUN dotnet restore

COPY . ./
RUN dotnet publish -c Release -o /app/publish --no-restore

# Tools stage: install mongodump/mongorestore from the MongoDB APT repo (already in mongo image)
FROM mongo:8.0 AS tools
RUN rm -f /etc/apt/sources.list; \
    find /etc/apt/sources.list.d/ -type f ! -name '*mongo*' -delete 2>/dev/null; \
    apt-get update \
    && apt-get install -y --no-install-recommends mongodb-database-tools \
    && rm -rf /var/lib/apt/lists/*

# Run stage
FROM mcr.microsoft.com/dotnet/aspnet:10.0
WORKDIR /app
EXPOSE 5000

COPY --from=tools /usr/bin/mongodump /usr/local/bin/mongodump
COPY --from=tools /usr/bin/mongorestore /usr/local/bin/mongorestore

COPY --from=build /app/publish ./
COPY scripts ./scripts
RUN chmod +x ./scripts/*.sh

# Default env (overridden by docker-compose file)
ENV ASPNETCORE_URLS=http://+:5000
ENTRYPOINT ["dotnet", "Iimst.Api.dll"]
