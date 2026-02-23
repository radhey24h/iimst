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

COPY --from=build /app/publish ./

# Default env (overridden by docker-compose)
ENV ASPNETCORE_URLS=http://+:5000
ENTRYPOINT ["dotnet", "Iimst.Api.dll"]
