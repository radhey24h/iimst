# Build stage
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY Iimst.Api.csproj ./
RUN dotnet restore

COPY . ./
RUN dotnet publish -c Release -o /app/publish --no-restore

# Run stage
FROM mcr.microsoft.com/dotnet/aspnet:10.0
WORKDIR /app
EXPOSE 5000

RUN apt-get update \
    && apt-get install -y --no-install-recommends bash wget ca-certificates tar \
    && wget -qO- https://fastdl.mongodb.org/tools/db/mongodb-database-tools-debian12-x86_64-100.13.0.tgz \
        | tar -xz -C /tmp \
    && cp /tmp/mongodb-database-tools-*/bin/mongodump /usr/local/bin/mongodump \
    && cp /tmp/mongodb-database-tools-*/bin/mongorestore /usr/local/bin/mongorestore \
    && rm -rf /var/lib/apt/lists/* /tmp/mongodb-database-tools-*

COPY --from=build /app/publish ./
COPY scripts ./scripts
RUN chmod +x ./scripts/*.sh

# Default env (overridden by docker-compose)
ENV ASPNETCORE_URLS=http://+:5000
ENTRYPOINT ["dotnet", "Iimst.Api.dll"]
