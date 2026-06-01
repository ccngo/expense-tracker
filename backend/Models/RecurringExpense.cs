namespace ExpenseTracker.API.Models;

public enum RecurringFrequency { Daily, Weekly, Monthly, Yearly }

public class RecurringExpense
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public Category Category { get; set; }
    public PaymentMethod? PaymentMethod { get; set; }
    public RecurringFrequency Frequency { get; set; }
    public DateOnly StartDate { get; set; }
    public DateOnly? EndDate { get; set; }
    public DateOnly? LastExecutedDate { get; set; }
}
