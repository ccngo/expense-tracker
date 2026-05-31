namespace ExpenseTracker.API.Models;

public enum BudgetType { Overall, CreditCard, Food, Transport, Housing, Health, Entertainment, Other }
public enum BudgetPeriod { Weekly, Monthly }

public class BudgetPlan
{
    public int Id { get; set; }
    public BudgetType Type { get; set; }
    public BudgetPeriod Period { get; set; }
    public decimal Limit { get; set; }
}
