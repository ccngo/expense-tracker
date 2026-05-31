# Expense Tracker

A full-stack personal finance app for tracking expenses, managing budgets, and visualising spending habits.

![.NET](https://img.shields.io/badge/.NET_10-512BD4?style=flat&logo=dotnet&logoColor=white)
![Angular](https://img.shields.io/badge/Angular_21-DD0031?style=flat&logo=angular&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-003B57?style=flat&logo=sqlite&logoColor=white)
![Angular Material](https://img.shields.io/badge/Angular_Material-757575?style=flat&logo=material-design&logoColor=white)

## Features

- **Expense management** — add, edit, delete expenses with title, amount, category, date, payment method and notes
- **Dashboard** — spending overview with doughnut (by category) and bar (monthly trend) charts; filterable by This Month / Last 3 Months / This Year / All Time
- **Budget plans** — set weekly or monthly limits by overall spend, credit card, or per category (Food, Transport, Housing, etc.) with live progress bars and warnings at 80% and 100%
- **Favourites** — save recurring expense templates for one-click quick fill on the add form
- **CSV export** — exports the current filtered view with a smart filename (e.g. `expenses-food-2026-05-01-to-2026-05-31.csv`)
- **Filtering & sorting** — search, category, payment method, date range, column sort and pagination on the expenses list

## Tech Stack

| Layer | Technology |
|---|---|
| Backend API | ASP.NET Core 10 Minimal API |
| Database | SQLite via Entity Framework Core 10 |
| Frontend | Angular 21 (standalone components, signals) |
| UI | Angular Material 21 |
| Charts | Chart.js 4 + ng2-charts |

## Getting Started

### Prerequisites

- [.NET 10 SDK](https://dotnet.microsoft.com/download)
- [Node.js 22+](https://nodejs.org)

### Run

**Windows — double-click `dev.bat`** or from a terminal:

```bat
dev.bat
```

This will:
1. Install frontend dependencies if missing (`npm install`)
2. Start the backend at `http://localhost:5000`
3. Start the frontend at `http://localhost:4200`
4. Open the browser automatically

### Manual start

```bash
# Terminal 1 — backend
cd backend
dotnet run

# Terminal 2 — frontend
cd frontend
npm install
ng serve
```

## Project Structure

```
expense-tracker/
├── backend/                  # ASP.NET Core Minimal API
│   ├── Models/               # Expense, BudgetPlan, FavoriteExpense
│   ├── Data/                 # EF Core DbContext
│   ├── Migrations/           # EF Core migrations
│   └── Program.cs            # All API endpoints
├── frontend/                 # Angular 21 app
│   └── src/app/
│       ├── pages/            # Dashboard, Expenses, Budget, Favourites, Add/Edit
│       ├── services/         # HTTP service layer
│       ├── models/           # TypeScript interfaces
│       ├── components/       # Shared components
│       └── pipes/            # Enum label pipe
└── dev.bat                   # One-click dev startup
```
