using Microsoft.AspNetCore.Mvc;
using ExpenseTracker.API.Data;
using ExpenseTracker.API.Models;

namespace ExpenseTracker.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SettingsController(AppDbContext db) : ControllerBase
{
    [HttpGet("has-password")]
    public async Task<IActionResult> HasPassword()
    {
        var settings = await db.AppSettings.FindAsync(1);
        var hasPassword = !string.IsNullOrEmpty(settings?.PasswordHash);
        return Ok(new { hasPassword });
    }

    [HttpPost("password")]
    public async Task<IActionResult> SetPassword([FromBody] SetPasswordRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Password))
            return BadRequest("Password cannot be empty");

        var settings = await db.AppSettings.FindAsync(1);
        if (settings == null)
        {
            settings = new AppSettings();
            db.AppSettings.Add(settings);
        }

        settings.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);
        settings.UpdatedAt = DateTime.UtcNow;

        await db.SaveChangesAsync();
        return Ok();
    }
}

public class SetPasswordRequest
{
    public required string Password { get; set; }
}
