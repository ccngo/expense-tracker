using Microsoft.EntityFrameworkCore;
using ExpenseTracker.API.Models;
using ExpenseTracker.API.Data;

namespace ExpenseTracker.API.Services;

public class RecurringExpenseService(AppDbContext db) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        using var timer = new PeriodicTimer(TimeSpan.FromMinutes(1));
        while (await timer.WaitForNextTickAsync(stoppingToken))
        {
            try
            {
                await ProcessRecurringExpenses();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error processing recurring expenses: {ex.Message}");
            }
        }
    }

    private async Task ProcessRecurringExpenses()
    {
        var today = DateOnly.FromDateTime(DateTime.Today);
        var recurring = await db.RecurringExpenses
            .Where(r => r.StartDate <= today && (r.EndDate == null || r.EndDate >= today))
            .ToListAsync();

        foreach (var r in recurring)
        {
            var shouldExecute = false;
            var nextExecuteDate = r.LastExecutedDate ?? r.StartDate;

            switch (r.Frequency)
            {
                case RecurringFrequency.Daily:
                    shouldExecute = nextExecuteDate < today;
                    break;
                case RecurringFrequency.Weekly:
                    shouldExecute = nextExecuteDate.AddDays(7) <= today;
                    break;
                case RecurringFrequency.Monthly:
                    shouldExecute = nextExecuteDate.AddMonths(1) <= today;
                    break;
                case RecurringFrequency.Yearly:
                    shouldExecute = nextExecuteDate.AddYears(1) <= today;
                    break;
            }

            if (shouldExecute)
            {
                var expense = new Expense
                {
                    Title = r.Title,
                    Amount = r.Amount,
                    Category = r.Category,
                    PaymentMethod = r.PaymentMethod,
                    Date = today,
                    Notes = $"Recurring: {r.Title}"
                };
                db.Expenses.Add(expense);
                r.LastExecutedDate = today;
            }
        }

        await db.SaveChangesAsync();
    }
}
