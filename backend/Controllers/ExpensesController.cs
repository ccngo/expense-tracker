using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ExpenseTracker.API.Data;
using ExpenseTracker.API.Models;

namespace ExpenseTracker.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ExpensesController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll(
        string? search,
        string? category,
        string? paymentMethod,
        DateOnly? from,
        DateOnly? to,
        string? sortBy,
        string? sortDir,
        int page = 1,
        int pageSize = 10)
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

        return Ok(new { items, total, page, pageSize });
    }

    [HttpGet("export")]
    public async Task<IActionResult> Export(
        string? search,
        string? category,
        string? paymentMethod,
        DateOnly? from,
        DateOnly? to)
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

        var sb = new System.Text.StringBuilder();
        sb.AppendLine("Id,Title,Amount,Category,Date,Payment Method,Notes");
        foreach (var e in expenses)
            sb.AppendLine($"{e.Id},{CsvField(e.Title)},{e.Amount},{e.Category},{e.Date},{CsvField(e.PaymentMethod?.ToString())},{CsvField(e.Notes)}");

        var bytes = System.Text.Encoding.UTF8.GetBytes(sb.ToString());
        return File(bytes, "text/csv", "expenses.csv");
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var expense = await db.Expenses.FindAsync(id);
        return expense is null ? NotFound() : Ok(expense);
    }

    [HttpPost]
    public async Task<IActionResult> Create(Expense expense)
    {
        db.Expenses.Add(expense);
        await db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = expense.Id }, expense);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, Expense updated)
    {
        var expense = await db.Expenses.FindAsync(id);
        if (expense is null) return NotFound();
        expense.Title = updated.Title;
        expense.Amount = updated.Amount;
        expense.Category = updated.Category;
        expense.Date = updated.Date;
        expense.Notes = updated.Notes;
        expense.PaymentMethod = updated.PaymentMethod;
        await db.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var expense = await db.Expenses.FindAsync(id);
        if (expense is null) return NotFound();
        db.Expenses.Remove(expense);
        await db.SaveChangesAsync();
        return NoContent();
    }
}
