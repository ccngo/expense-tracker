using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ExpenseTracker.API.Data;
using ExpenseTracker.API.Models;

namespace ExpenseTracker.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class RecurringController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var recurring = await db.RecurringExpenses.OrderBy(r => r.StartDate).ToListAsync();
        return Ok(recurring);
    }

    [HttpPost]
    public async Task<IActionResult> Create(RecurringExpense recurring)
    {
        db.RecurringExpenses.Add(recurring);
        await db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = recurring.Id }, recurring);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var recurring = await db.RecurringExpenses.FindAsync(id);
        return recurring is null ? NotFound() : Ok(recurring);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, RecurringExpense updated)
    {
        var recurring = await db.RecurringExpenses.FindAsync(id);
        if (recurring is null) return NotFound();
        recurring.Title = updated.Title;
        recurring.Amount = updated.Amount;
        recurring.Category = updated.Category;
        recurring.PaymentMethod = updated.PaymentMethod;
        recurring.Frequency = updated.Frequency;
        recurring.StartDate = updated.StartDate;
        recurring.EndDate = updated.EndDate;
        await db.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var recurring = await db.RecurringExpenses.FindAsync(id);
        if (recurring is null) return NotFound();
        db.RecurringExpenses.Remove(recurring);
        await db.SaveChangesAsync();
        return NoContent();
    }
}
