namespace ExpenseTracker.API.Models;

public class AppSettings
{
    public int Id { get; set; } = 1;
    public string PasswordHash { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
