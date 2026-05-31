using Microsoft.EntityFrameworkCore;
using System.Text;
using System.Text.Json.Serialization;
using ExpenseTracker.API.Data;
using ExpenseTracker.API.Models;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();
builder.Services.ConfigureHttpJsonOptions(options =>
    options.SerializerOptions.Converters.Add(new JsonStringEnumConverter()));
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));

var app = builder.Build();

if (app.Environment.IsDevelopment())
    app.MapOpenApi();

app.UseHttpsRedirection();

using (var scope = app.Services.CreateScope())
    scope.ServiceProvider.GetRequiredService<AppDbContext>().Database.Migrate();

app.MapGet("/api/expenses", async (
    AppDbContext db,
    string? search,
    string? category,
    string? paymentMethod,
    DateOnly? from,
    DateOnly? to,
    string? sortBy,
    string? sortDir,
    int page = 1,
    int pageSize = 10) =>
{
    var query = db.Expenses.AsQueryable();

    if (!string.IsNullOrWhiteSpace(search))
        query = query.Where(e => e.Title.Contains(search));

    if (!string.IsNullOrWhiteSpace(category) && Enum.TryParse<Category>(category, out var cat))
        query = query.Where(e => e.Category == cat);

    if (!string.IsNullOrWhiteSpace(paymentMethod) && Enum.TryParse<PaymentMethod>(paymentMethod, out var pm))
        query = query.Where(e => e.PaymentMethod == pm);

    if (from.HasValue) query = query.Where(e => e.Date >= from.Value);
    if (to.HasValue) query = query.Where(e => e.Date <= to.Value);

    query = (sortBy?.ToLower(), sortDir?.ToLower() == "asc") switch
    {
        ("amount", true)   => query.OrderBy(e => e.Amount),
        ("amount", false)  => query.OrderByDescending(e => e.Amount),
        ("category", true) => query.OrderBy(e => e.Category),
        ("category", false)=> query.OrderByDescending(e => e.Category),
        ("title", true)    => query.OrderBy(e => e.Title),
        ("title", false)   => query.OrderByDescending(e => e.Title),
        (_, true)          => query.OrderBy(e => e.Date),
        _                  => query.OrderByDescending(e => e.Date),
    };

    var total = await query.CountAsync();
    var items = await query.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();

    return Results.Ok(new { items, total, page, pageSize });
});

app.MapGet("/api/expenses/export", async (
    AppDbContext db,
    string? search,
    string? category,
    string? paymentMethod,
    DateOnly? from,
    DateOnly? to) =>
{
    var query = db.Expenses.AsQueryable();

    if (!string.IsNullOrWhiteSpace(search))
        query = query.Where(e => e.Title.Contains(search));
    if (!string.IsNullOrWhiteSpace(category) && Enum.TryParse<Category>(category, out var cat))
        query = query.Where(e => e.Category == cat);
    if (!string.IsNullOrWhiteSpace(paymentMethod) && Enum.TryParse<PaymentMethod>(paymentMethod, out var pm))
        query = query.Where(e => e.PaymentMethod == pm);
    if (from.HasValue) query = query.Where(e => e.Date >= from.Value);
    if (to.HasValue)   query = query.Where(e => e.Date <= to.Value);

    var expenses = await query.OrderByDescending(e => e.Date).ToListAsync();

    static string CsvField(string? value)
    {
        if (string.IsNullOrEmpty(value)) return "";
        return value.Contains(',') || value.Contains('"') || value.Contains('\n')
            ? $"\"{value.Replace("\"", "\"\"")}\""
            : value;
    }

    var sb = new StringBuilder();
    sb.AppendLine("Id,Title,Amount,Category,Date,Payment Method,Notes");
    foreach (var e in expenses)
        sb.AppendLine($"{e.Id},{CsvField(e.Title)},{e.Amount},{e.Category},{e.Date},{CsvField(e.PaymentMethod?.ToString())},{CsvField(e.Notes)}");

    var bytes = Encoding.UTF8.GetBytes(sb.ToString());
    return Results.File(bytes, "text/csv", "expenses.csv");
});

app.MapGet("/api/expenses/{id}", async (int id, AppDbContext db) =>
    await db.Expenses.FindAsync(id) is Expense expense ? Results.Ok(expense) : Results.NotFound());

app.MapPost("/api/expenses", async (Expense expense, AppDbContext db) =>
{
    db.Expenses.Add(expense);
    await db.SaveChangesAsync();
    return Results.Created($"/api/expenses/{expense.Id}", expense);
});

app.MapPut("/api/expenses/{id}", async (int id, Expense updated, AppDbContext db) =>
{
    var expense = await db.Expenses.FindAsync(id);
    if (expense is null) return Results.NotFound();
    expense.Title = updated.Title;
    expense.Amount = updated.Amount;
    expense.Category = updated.Category;
    expense.Date = updated.Date;
    expense.Notes = updated.Notes;
    expense.PaymentMethod = updated.PaymentMethod;
    await db.SaveChangesAsync();
    return Results.NoContent();
});

app.MapDelete("/api/expenses/{id}", async (int id, AppDbContext db) =>
{
    var expense = await db.Expenses.FindAsync(id);
    if (expense is null) return Results.NotFound();
    db.Expenses.Remove(expense);
    await db.SaveChangesAsync();
    return Results.NoContent();
});

// Budget Plans
app.MapGet("/api/budgets", async (AppDbContext db) =>
    await db.BudgetPlans.ToListAsync());

app.MapPost("/api/budgets", async (BudgetPlan plan, AppDbContext db) =>
{
    var existing = await db.BudgetPlans.FirstOrDefaultAsync(b => b.Type == plan.Type && b.Period == plan.Period);
    if (existing is not null)
    {
        existing.Limit = plan.Limit;
        await db.SaveChangesAsync();
        return Results.Ok(new { existing.Id, existing.Type, existing.Period, existing.Limit, replaced = true });
    }
    db.BudgetPlans.Add(plan);
    await db.SaveChangesAsync();
    return Results.Created($"/api/budgets/{plan.Id}", new { plan.Id, plan.Type, plan.Period, plan.Limit, replaced = false });
});

app.MapPut("/api/budgets/{id}", async (int id, BudgetPlan updated, AppDbContext db) =>
{
    var plan = await db.BudgetPlans.FindAsync(id);
    if (plan is null) return Results.NotFound();
    plan.Type = updated.Type;
    plan.Period = updated.Period;
    plan.Limit = updated.Limit;
    await db.SaveChangesAsync();
    return Results.NoContent();
});

app.MapDelete("/api/budgets/{id}", async (int id, AppDbContext db) =>
{
    var plan = await db.BudgetPlans.FindAsync(id);
    if (plan is null) return Results.NotFound();
    db.BudgetPlans.Remove(plan);
    await db.SaveChangesAsync();
    return Results.NoContent();
});

// Budget Summary
app.MapGet("/api/budgets/summary", async (AppDbContext db) =>
{
    var today = DateOnly.FromDateTime(DateTime.Today);
    var dayOfWeek = (int)DateTime.Today.DayOfWeek;
    var daysFromMonday = (dayOfWeek == 0 ? 6 : dayOfWeek - 1);
    var weekStart = today.AddDays(-daysFromMonday);
    var monthStart = new DateOnly(today.Year, today.Month, 1);

    var expenses = await db.Expenses.ToListAsync();
    var plans = await db.BudgetPlans.ToListAsync();

    var summary = plans.Select(plan =>
    {
        var periodStart = plan.Period == BudgetPeriod.Weekly ? weekStart : monthStart;
        var filtered = expenses.Where(e => e.Date >= periodStart);

        if (plan.Type == BudgetType.CreditCard)
            filtered = filtered.Where(e => e.PaymentMethod == PaymentMethod.CreditCard);
        else if (plan.Type != BudgetType.Overall && Enum.TryParse<Category>(plan.Type.ToString(), out var cat))
            filtered = filtered.Where(e => e.Category == cat);

        var spent = filtered.Sum(e => e.Amount);
        return new
        {
            plan.Id,
            plan.Type,
            plan.Period,
            plan.Limit,
            Spent = spent,
            Percentage = plan.Limit > 0 ? Math.Round(spent / plan.Limit * 100, 1) : 0
        };
    });

    return Results.Ok(summary);
});

// Favorites
app.MapGet("/api/favorites", async (AppDbContext db) =>
    await db.FavoriteExpenses.ToListAsync());

app.MapPost("/api/favorites", async (FavoriteExpense fav, AppDbContext db) =>
{
    db.FavoriteExpenses.Add(fav);
    await db.SaveChangesAsync();
    return Results.Created($"/api/favorites/{fav.Id}", fav);
});

app.MapPut("/api/favorites/{id}", async (int id, FavoriteExpense updated, AppDbContext db) =>
{
    var fav = await db.FavoriteExpenses.FindAsync(id);
    if (fav is null) return Results.NotFound();
    fav.Title = updated.Title;
    fav.Amount = updated.Amount;
    fav.Category = updated.Category;
    fav.PaymentMethod = updated.PaymentMethod;
    await db.SaveChangesAsync();
    return Results.NoContent();
});

app.MapDelete("/api/favorites/{id}", async (int id, AppDbContext db) =>
{
    var fav = await db.FavoriteExpenses.FindAsync(id);
    if (fav is null) return Results.NotFound();
    db.FavoriteExpenses.Remove(fav);
    await db.SaveChangesAsync();
    return Results.NoContent();
});

app.Run();
