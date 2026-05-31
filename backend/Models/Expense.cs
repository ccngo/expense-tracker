namespace ExpenseTracker.API.Models;

public class Expense
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public Category Category { get; set; }
    public DateOnly Date { get; set; }
    public string? Notes { get; set; }
    public PaymentMethod? PaymentMethod { get; set; }
}
