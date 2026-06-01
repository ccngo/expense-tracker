FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY ["ExpenseTracker.API.csproj", "."]
RUN dotnet restore "ExpenseTracker.API.csproj"
COPY . .
RUN dotnet build "ExpenseTracker.API.csproj" -c Release -o /app/build

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
COPY --from=build /app/build .
EXPOSE 5000
ENV ASPNETCORE_URLS=http://+:5000
CMD ["dotnet", "ExpenseTracker.API.dll"]
