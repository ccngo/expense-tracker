using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ExpenseTracker.API.Data;
using ExpenseTracker.API.Models;

namespace ExpenseTracker.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class FavoritesController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var favorites = await db.FavoriteExpenses.ToListAsync();
        return Ok(favorites);
    }

    [HttpPost]
    public async Task<IActionResult> Create(FavoriteExpense fav)
    {
        db.FavoriteExpenses.Add(fav);
        await db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = fav.Id }, fav);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var fav = await db.FavoriteExpenses.FindAsync(id);
        return fav is null ? NotFound() : Ok(fav);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, FavoriteExpense updated)
    {
        var fav = await db.FavoriteExpenses.FindAsync(id);
        if (fav is null) return NotFound();
        fav.Title = updated.Title;
        fav.Amount = updated.Amount;
        fav.Category = updated.Category;
        fav.PaymentMethod = updated.PaymentMethod;
        await db.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var fav = await db.FavoriteExpenses.FindAsync(id);
        if (fav is null) return NotFound();
        db.FavoriteExpenses.Remove(fav);
        await db.SaveChangesAsync();
        return NoContent();
    }
}
