using Microsoft.EntityFrameworkCore;
using ExpenseTracker.API.Models;

namespace ExpenseTracker.API.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<Expense> Expenses => Set<Expense>();
    public DbSet<BudgetPlan> BudgetPlans => Set<BudgetPlan>();
    public DbSet<FavoriteExpense> FavoriteExpenses => Set<FavoriteExpense>();
    public DbSet<RecurringExpense> RecurringExpenses => Set<RecurringExpense>();
}
