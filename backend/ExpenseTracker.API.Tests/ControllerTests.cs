using System.Collections.Generic;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Xunit;
using ExpenseTracker.API.Controllers;
using ExpenseTracker.API.Data;
using ExpenseTracker.API.Models;

namespace ExpenseTracker.API.Tests;

public class TestDbContext
{
    public static AppDbContext CreateInMemoryContext()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        return new AppDbContext(options);
    }
}

// ---- EXPENSES ----

public class ExpensesControllerTests
{
    private static Expense Sample(string title = "Test", decimal amount = 50, Category category = Category.Food,
        DateOnly? date = null) => new()
    {
        Title = title,
        Amount = amount,
        Category = category,
        Date = date ?? DateOnly.FromDateTime(DateTime.Today),
    };

    [Fact]
    public async Task Create_ValidExpense_ReturnsCreatedAtAction()
    {
        var db = TestDbContext.CreateInMemoryContext();
        var result = await new ExpensesController(db).Create(Sample("Test Expense"));

        var created = Assert.IsType<CreatedAtActionResult>(result);
        Assert.Equal(nameof(ExpensesController.GetById), created.ActionName);
        Assert.Equal(1, ((Expense)created.Value!).Id);
    }

    [Fact]
    public async Task GetById_ExistingExpense_ReturnsOk()
    {
        var db = TestDbContext.CreateInMemoryContext();
        db.Expenses.Add(Sample("Test"));
        await db.SaveChangesAsync();

        var result = await new ExpensesController(db).GetById(1);

        var ok = Assert.IsType<OkObjectResult>(result);
        Assert.Equal("Test", ((Expense)ok.Value!).Title);
    }

    [Fact]
    public async Task GetById_NonExistentExpense_ReturnsNotFound()
    {
        var db = TestDbContext.CreateInMemoryContext();
        Assert.IsType<NotFoundResult>(await new ExpensesController(db).GetById(999));
    }

    [Fact]
    public async Task Delete_ExistingExpense_ReturnsNoContent()
    {
        var db = TestDbContext.CreateInMemoryContext();
        db.Expenses.Add(Sample());
        await db.SaveChangesAsync();

        var result = await new ExpensesController(db).Delete(1);

        Assert.IsType<NoContentResult>(result);
        Assert.Equal(0, await db.Expenses.CountAsync());
    }

    [Fact]
    public async Task Delete_NonExistentExpense_ReturnsNotFound()
    {
        var db = TestDbContext.CreateInMemoryContext();
        Assert.IsType<NotFoundResult>(await new ExpensesController(db).Delete(999));
    }

    [Fact]
    public async Task Update_ExistingExpense_ReturnsNoContent()
    {
        var db = TestDbContext.CreateInMemoryContext();
        db.Expenses.Add(Sample("Original", 50));
        await db.SaveChangesAsync();

        var result = await new ExpensesController(db).Update(1, Sample("Updated", 100, Category.Transport));

        Assert.IsType<NoContentResult>(result);
        var expense = await db.Expenses.FirstAsync();
        Assert.Equal("Updated", expense.Title);
        Assert.Equal(100, expense.Amount);
    }

    [Fact]
    public async Task Update_NonExistentExpense_ReturnsNotFound()
    {
        var db = TestDbContext.CreateInMemoryContext();
        Assert.IsType<NotFoundResult>(await new ExpensesController(db).Update(999, Sample()));
    }

    [Fact]
    public async Task GetAll_NoFilter_ReturnsTotalCount()
    {
        var db = TestDbContext.CreateInMemoryContext();
        db.Expenses.AddRange(Sample("A"), Sample("B"));
        await db.SaveChangesAsync();

        var result = await new ExpensesController(db).GetAll(null, null, null, null, null, null, null);

        dynamic obj = ((OkObjectResult)result).Value!;
        Assert.Equal(2, (int)obj.total);
    }

    [Fact]
    public async Task GetAll_WithSearch_FiltersByTitle()
    {
        var db = TestDbContext.CreateInMemoryContext();
        db.Expenses.AddRange(Sample("Coffee"), Sample("Netflix"));
        await db.SaveChangesAsync();

        var result = await new ExpensesController(db).GetAll("Coffee", null, null, null, null, null, null);

        dynamic obj = ((OkObjectResult)result).Value!;
        Assert.Equal(1, (int)obj.total);
        Assert.Equal("Coffee", ((List<Expense>)obj.items)[0].Title);
    }

    [Fact]
    public async Task GetAll_WithCategoryFilter_ReturnsMatchingExpenses()
    {
        var db = TestDbContext.CreateInMemoryContext();
        db.Expenses.AddRange(Sample("Food item", 10, Category.Food), Sample("Uber", 20, Category.Transport));
        await db.SaveChangesAsync();

        var result = await new ExpensesController(db).GetAll(null, "Transport", null, null, null, null, null);

        dynamic obj = ((OkObjectResult)result).Value!;
        Assert.Equal(1, (int)obj.total);
    }

    [Fact]
    public async Task GetAll_WithDateRange_ReturnsMatchingExpenses()
    {
        var jan = new DateOnly(2024, 1, 15);
        var jun = new DateOnly(2024, 6, 15);
        var db = TestDbContext.CreateInMemoryContext();
        db.Expenses.AddRange(Sample("Jan", date: jan), Sample("Jun", date: jun));
        await db.SaveChangesAsync();

        var result = await new ExpensesController(db).GetAll(null, null, null, jan, jan, null, null);

        dynamic obj = ((OkObjectResult)result).Value!;
        Assert.Equal(1, (int)obj.total);
        Assert.Equal("Jan", ((List<Expense>)obj.items)[0].Title);
    }

    [Fact]
    public async Task GetAll_Pagination_ReturnsCorrectPage()
    {
        var db = TestDbContext.CreateInMemoryContext();
        for (var i = 1; i <= 3; i++)
            db.Expenses.Add(new Expense { Title = $"E{i}", Amount = i, Category = Category.Food, Date = new DateOnly(2024, 1, i) });
        await db.SaveChangesAsync();

        var result = await new ExpensesController(db)
            .GetAll(null, null, null, null, null, null, null, page: 2, pageSize: 2);

        dynamic obj = ((OkObjectResult)result).Value!;
        Assert.Equal(3, (int)obj.total);
        Assert.Single((List<Expense>)obj.items);
    }

    [Fact]
    public async Task GetAll_SortByAmountDesc_OrdersResults()
    {
        var db = TestDbContext.CreateInMemoryContext();
        db.Expenses.AddRange(Sample("Cheap", 10), Sample("Expensive", 100));
        await db.SaveChangesAsync();

        var result = await new ExpensesController(db).GetAll(null, null, null, null, null, "amount", "desc");

        var items = (List<Expense>)((dynamic)((OkObjectResult)result).Value!).items;
        Assert.Equal(100, items[0].Amount);
        Assert.Equal(10, items[1].Amount);
    }

    [Fact]
    public async Task Export_ReturnsCSVFileWithData()
    {
        var db = TestDbContext.CreateInMemoryContext();
        db.Expenses.Add(Sample("Coffee", 5));
        await db.SaveChangesAsync();

        var result = await new ExpensesController(db).Export(null, null, null, null, null);

        var file = Assert.IsType<FileContentResult>(result);
        Assert.Equal("text/csv", file.ContentType);
        Assert.Equal("expenses.csv", file.FileDownloadName);
        var csv = System.Text.Encoding.UTF8.GetString(file.FileContents);
        Assert.Contains("Id,Title,Amount", csv);
        Assert.Contains("Coffee", csv);
    }
}

// ---- BUDGETS ----

public class BudgetsControllerTests
{
    [Fact]
    public async Task Create_NewBudgetPlan_ReturnsCreatedAtAction()
    {
        var db = TestDbContext.CreateInMemoryContext();
        var plan = new BudgetPlan { Type = BudgetType.Overall, Period = BudgetPeriod.Monthly, Limit = 1000 };

        var result = await new BudgetsController(db).Create(plan);

        var created = Assert.IsType<CreatedAtActionResult>(result);
        Assert.NotNull(created.Value);
    }

    [Fact]
    public async Task Create_DuplicateBudgetType_ReturnsOkWithReplaced()
    {
        var db = TestDbContext.CreateInMemoryContext();
        db.BudgetPlans.Add(new BudgetPlan { Type = BudgetType.Overall, Period = BudgetPeriod.Monthly, Limit = 1000 });
        await db.SaveChangesAsync();

        var result = await new BudgetsController(db).Create(
            new BudgetPlan { Type = BudgetType.Overall, Period = BudgetPeriod.Monthly, Limit = 2000 });

        dynamic obj = ((OkObjectResult)result).Value!;
        Assert.True(obj.replaced);
        Assert.Equal(2000, (decimal)obj.Limit);
    }

    [Fact]
    public async Task GetAll_ReturnsBudgetPlans()
    {
        var db = TestDbContext.CreateInMemoryContext();
        db.BudgetPlans.Add(new BudgetPlan { Type = BudgetType.Overall, Period = BudgetPeriod.Monthly, Limit = 1000 });
        await db.SaveChangesAsync();

        var result = await new BudgetsController(db).GetAll();

        var ok = Assert.IsType<OkObjectResult>(result);
        Assert.Single(Assert.IsType<List<BudgetPlan>>(ok.Value));
    }

    [Fact]
    public async Task GetById_ExistingPlan_ReturnsOk()
    {
        var db = TestDbContext.CreateInMemoryContext();
        db.BudgetPlans.Add(new BudgetPlan { Type = BudgetType.Overall, Period = BudgetPeriod.Monthly, Limit = 500 });
        await db.SaveChangesAsync();

        var result = await new BudgetsController(db).GetById(1);

        var ok = Assert.IsType<OkObjectResult>(result);
        Assert.Equal(500, ((BudgetPlan)ok.Value!).Limit);
    }

    [Fact]
    public async Task GetById_NonExistentPlan_ReturnsNotFound()
    {
        var db = TestDbContext.CreateInMemoryContext();
        Assert.IsType<NotFoundResult>(await new BudgetsController(db).GetById(999));
    }

    [Fact]
    public async Task Delete_ExistingPlan_ReturnsNoContent()
    {
        var db = TestDbContext.CreateInMemoryContext();
        db.BudgetPlans.Add(new BudgetPlan { Type = BudgetType.Overall, Period = BudgetPeriod.Monthly, Limit = 1000 });
        await db.SaveChangesAsync();

        var result = await new BudgetsController(db).Delete(1);

        Assert.IsType<NoContentResult>(result);
        Assert.Equal(0, await db.BudgetPlans.CountAsync());
    }

    [Fact]
    public async Task Update_ExistingPlan_ReturnsNoContent()
    {
        var db = TestDbContext.CreateInMemoryContext();
        db.BudgetPlans.Add(new BudgetPlan { Type = BudgetType.Overall, Period = BudgetPeriod.Monthly, Limit = 1000 });
        await db.SaveChangesAsync();

        var result = await new BudgetsController(db).Update(1,
            new BudgetPlan { Type = BudgetType.Overall, Period = BudgetPeriod.Monthly, Limit = 1500 });

        Assert.IsType<NoContentResult>(result);
        Assert.Equal(1500, (await db.BudgetPlans.FirstAsync()).Limit);
    }

    [Fact]
    public async Task GetSummary_CalculatesSpentForPlan()
    {
        var db = TestDbContext.CreateInMemoryContext();
        var today = DateOnly.FromDateTime(DateTime.Today);
        db.BudgetPlans.Add(new BudgetPlan { Type = BudgetType.Overall, Period = BudgetPeriod.Monthly, Limit = 500 });
        db.Expenses.Add(new Expense { Title = "Groceries", Amount = 75, Category = Category.Food, Date = today });
        await db.SaveChangesAsync();

        var result = await new BudgetsController(db).GetSummary();

        var ok = Assert.IsType<OkObjectResult>(result);
        var summaryList = ((System.Collections.IEnumerable)ok.Value!).Cast<dynamic>().ToList();
        Assert.Single(summaryList);
        Assert.Equal(75m, (decimal)summaryList[0].Spent);
    }
}

// ---- FAVORITES ----

public class FavoritesControllerTests
{
    [Fact]
    public async Task GetAll_ReturnsFavorites()
    {
        var db = TestDbContext.CreateInMemoryContext();
        db.FavoriteExpenses.Add(new FavoriteExpense { Title = "Coffee", Amount = 5, Category = Category.Food });
        await db.SaveChangesAsync();

        var result = await new FavoritesController(db).GetAll();

        var ok = Assert.IsType<OkObjectResult>(result);
        Assert.Single(Assert.IsType<List<FavoriteExpense>>(ok.Value));
    }

    [Fact]
    public async Task Create_ValidFavorite_ReturnsCreatedAtAction()
    {
        var db = TestDbContext.CreateInMemoryContext();
        var fav = new FavoriteExpense { Title = "Coffee", Amount = 5, Category = Category.Food };

        var result = await new FavoritesController(db).Create(fav);

        var created = Assert.IsType<CreatedAtActionResult>(result);
        Assert.Equal(1, ((FavoriteExpense)created.Value!).Id);
    }

    [Fact]
    public async Task Delete_ExistingFavorite_ReturnsNoContent()
    {
        var db = TestDbContext.CreateInMemoryContext();
        db.FavoriteExpenses.Add(new FavoriteExpense { Title = "Test", Amount = 5, Category = Category.Food });
        await db.SaveChangesAsync();

        var result = await new FavoritesController(db).Delete(1);

        Assert.IsType<NoContentResult>(result);
        Assert.Equal(0, await db.FavoriteExpenses.CountAsync());
    }
}

// ---- RECURRING ----

public class RecurringControllerTests
{
    private static RecurringExpense Sample(string title = "Netflix") => new()
    {
        Title = title,
        Amount = 15,
        Category = Category.Entertainment,
        Frequency = RecurringFrequency.Monthly,
        StartDate = DateOnly.FromDateTime(DateTime.Today),
    };

    [Fact]
    public async Task GetAll_ReturnsRecurring()
    {
        var db = TestDbContext.CreateInMemoryContext();
        db.RecurringExpenses.Add(Sample());
        await db.SaveChangesAsync();

        var result = await new RecurringController(db).GetAll();

        var ok = Assert.IsType<OkObjectResult>(result);
        Assert.Single(Assert.IsType<List<RecurringExpense>>(ok.Value));
    }

    [Fact]
    public async Task Create_ValidRecurring_ReturnsCreatedAtAction()
    {
        var db = TestDbContext.CreateInMemoryContext();
        var result = await new RecurringController(db).Create(Sample());
        Assert.IsType<CreatedAtActionResult>(result);
    }

    [Fact]
    public async Task Delete_ExistingRecurring_ReturnsNoContent()
    {
        var db = TestDbContext.CreateInMemoryContext();
        db.RecurringExpenses.Add(Sample());
        await db.SaveChangesAsync();

        var result = await new RecurringController(db).Delete(1);

        Assert.IsType<NoContentResult>(result);
        Assert.Equal(0, await db.RecurringExpenses.CountAsync());
    }
}
