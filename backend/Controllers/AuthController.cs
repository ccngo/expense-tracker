using Microsoft.AspNetCore.Mvc;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.IdentityModel.Tokens;
using ExpenseTracker.API.Data;

namespace ExpenseTracker.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController(AppDbContext db) : ControllerBase
{
    private const string JwtSecret = "ExpenseTrackerSecretKeyFor24HourJWTTokens12345";

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Password))
            return BadRequest("Password is required");

        var settings = await db.AppSettings.FindAsync(1);
        if (settings?.PasswordHash == null || string.IsNullOrEmpty(settings.PasswordHash))
            return Unauthorized("No password set");

        if (!BCrypt.Net.BCrypt.Verify(request.Password, settings.PasswordHash))
            return Unauthorized("Invalid password");

        var token = GenerateJwtToken();
        var expiresAt = DateTime.UtcNow.AddHours(24);

        return Ok(new { token, expiresAt });
    }

    [HttpGet("verify")]
    public IActionResult Verify()
    {
        return Ok(new { isValid = true });
    }

    private string GenerateJwtToken()
    {
        var key = System.Text.Encoding.ASCII.GetBytes(JwtSecret);
        var handler = new JwtSecurityTokenHandler();

        var descriptor = new SecurityTokenDescriptor
        {
            Expires = DateTime.UtcNow.AddHours(24),
            SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
        };

        var token = handler.CreateToken(descriptor);
        return handler.WriteToken(token);
    }
}

public class LoginRequest
{
    public required string Password { get; set; }
}
