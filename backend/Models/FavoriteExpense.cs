using ExpenseTracker.API.Models;

namespace ExpenseTracker.API.Models;

public class FavoriteExpense
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public Category Category { get; set; }
    public PaymentMethod? PaymentMethod { get; set; }
}
