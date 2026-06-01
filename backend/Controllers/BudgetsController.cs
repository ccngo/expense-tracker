using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ExpenseTracker.API.Data;
using ExpenseTracker.API.Models;

namespace ExpenseTracker.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BudgetsController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var plans = await db.BudgetPlans.ToListAsync();
        return Ok(plans);
    }

    [HttpPost]
    public async Task<IActionResult> Create(BudgetPlan plan)
    {
        var existing = await db.BudgetPlans.FirstOrDefaultAsync(b => b.Type == plan.Type && b.Period == plan.Period);
        if (existing is not null)
        {
            existing.Limit = plan.Limit;
            await db.SaveChangesAsync();
            return Ok(new { existing.Id, existing.Type, existing.Period, existing.Limit, replaced = true });
        }
        db.BudgetPlans.Add(plan);
        await db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = plan.Id }, new { plan.Id, plan.Type, plan.Period, plan.Limit, replaced = false });
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var plan = await db.BudgetPlans.FindAsync(id);
        return plan is null ? NotFound() : Ok(plan);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, BudgetPlan updated)
    {
        var plan = await db.BudgetPlans.FindAsync(id);
        if (plan is null) return NotFound();
        plan.Type = updated.Type;
        plan.Period = updated.Period;
        plan.Limit = updated.Limit;
        await db.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var plan = await db.BudgetPlans.FindAsync(id);
        if (plan is null) return NotFound();
        db.BudgetPlans.Remove(plan);
        await db.SaveChangesAsync();
        return NoContent();
    }

    [HttpGet("summary")]
    public async Task<IActionResult> GetSummary()
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

        return Ok(summary);
    }
}
