using ExpenseTracker.API.Models;

namespace ExpenseTracker.API.Data;

public static class DbSeeder
{
    public static async Task SeedAsync(AppDbContext db)
    {
        if (!db.AppSettings.Any())
        {
            db.AppSettings.Add(new AppSettings());
        }

        if (db.Expenses.Any())
        {
            await db.SaveChangesAsync();
            return;
        }

        var today = DateOnly.FromDateTime(DateTime.Today);

        var expenses = new List<Expense>
        {
            new() { Title = "Coffee", Amount = 5.50m, Category = Category.Food, Date = today, PaymentMethod = PaymentMethod.CreditCard },
            new() { Title = "Grocery Shopping", Amount = 85.00m, Category = Category.Food, Date = today.AddDays(-1), PaymentMethod = PaymentMethod.DebitCard },
        };

        db.Expenses.AddRange(expenses);
        await db.SaveChangesAsync();
    }
}
