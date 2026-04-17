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

# Download MongoDB tools without apt-get (avoids archive.ubuntu.com connectivity issues)
ADD https://fastdl.mongodb.org/tools/db/mongodb-database-tools-ubuntu2404-x86_64-100.16.0.tgz /tmp/mongodb-tools.tgz
RUN tar -xzf /tmp/mongodb-tools.tgz -C /tmp \
    && cp /tmp/mongodb-database-tools-*/bin/mongodump /usr/local/bin/mongodump \
    && cp /tmp/mongodb-database-tools-*/bin/mongorestore /usr/local/bin/mongorestore \
    && rm -rf /tmp/mongodb-*

COPY --from=build /app/publish ./
COPY scripts ./scripts
RUN chmod +x ./scripts/*.sh

# Default env (overridden by docker-compose file)
ENV ASPNETCORE_URLS=http://+:5000
ENTRYPOINT ["dotnet", "Iimst.Api.dll"]
