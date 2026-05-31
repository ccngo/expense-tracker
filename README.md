# Expense Tracker

Personal expense tracking app — .NET 10 backend + Angular 21 frontend + SQLite.

## Prerequisites

- [.NET 10 SDK](https://dotnet.microsoft.com/download)
- [Node.js 22+](https://nodejs.org)

## Run

```
dev.bat
```

Double-click `dev.bat` or run it from a terminal. It will:
1. Install frontend dependencies if missing
2. Start the backend (`localhost:5000`)
3. Start the frontend (`localhost:4200`)
4. Open the browser automatically

## Manual start

```bash
# backend
cd backend && dotnet run

# frontend (separate terminal)
cd frontend && npm install && ng serve
```
