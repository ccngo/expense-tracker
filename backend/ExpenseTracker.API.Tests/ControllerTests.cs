using Microsoft.EntityFrameworkCore;
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

public class ExpensesControllerTests
{
    [Fact]
    public async Task Create_ValidExpense_ReturnsCreatedAtAction()
    {
        var db = TestDbContext.CreateInMemoryContext();
        var controller = new ExpensesController(db);

        var expense = new Expense
        {
            Title = "Test Expense",
            Amount = 50,
            Category = Category.Food,
            Date = DateOnly.FromDateTime(DateTime.Today)
        };

        var result = await controller.Create(expense);

        var createdResult = Assert.IsType<CreatedAtActionResult>(result);
        Assert.Equal(nameof(ExpensesController.GetById), createdResult.ActionName);
        Assert.Equal(1, ((Expense)createdResult.Value!).Id);
    }

    [Fact]
    public async Task GetById_ExistingExpense_ReturnsOk()
    {
        var db = TestDbContext.CreateInMemoryContext();
        db.Expenses.Add(new Expense
        {
            Title = "Test",
            Amount = 50,
            Category = Category.Food,
            Date = DateOnly.FromDateTime(DateTime.Today)
        });
        await db.SaveChangesAsync();

        var controller = new ExpensesController(db);
        var result = await controller.GetById(1);

        var okResult = Assert.IsType<OkObjectResult>(result);
        var returnedExpense = Assert.IsType<Expense>(okResult.Value);
        Assert.Equal("Test", returnedExpense.Title);
    }

    [Fact]
    public async Task GetById_NonExistentExpense_ReturnsNotFound()
    {
        var db = TestDbContext.CreateInMemoryContext();
        var controller = new ExpensesController(db);

        var result = await controller.GetById(999);

        Assert.IsType<NotFoundResult>(result);
    }

    [Fact]
    public async Task Delete_ExistingExpense_ReturnsNoContent()
    {
        var db = TestDbContext.CreateInMemoryContext();
        db.Expenses.Add(new Expense
        {
            Title = "Test",
            Amount = 50,
            Category = Category.Food,
            Date = DateOnly.FromDateTime(DateTime.Today)
        });
        await db.SaveChangesAsync();

        var controller = new ExpensesController(db);
        var result = await controller.Delete(1);

        Assert.IsType<NoContentResult>(result);
        Assert.Equal(0, await db.Expenses.CountAsync());
    }

    [Fact]
    public async Task Update_ExistingExpense_ReturnsNoContent()
    {
        var db = TestDbContext.CreateInMemoryContext();
        db.Expenses.Add(new Expense
        {
            Title = "Original",
            Amount = 50,
            Category = Category.Food,
            Date = DateOnly.FromDateTime(DateTime.Today)
        });
        await db.SaveChangesAsync();

        var updated = new Expense
        {
            Title = "Updated",
            Amount = 100,
            Category = Category.Transport,
            Date = DateOnly.FromDateTime(DateTime.Today)
        };

        var controller = new ExpensesController(db);
        var result = await controller.Update(1, updated);

        Assert.IsType<NoContentResult>(result);
        var expense = await db.Expenses.FirstAsync();
        Assert.Equal("Updated", expense.Title);
        Assert.Equal(100, expense.Amount);
    }
}

public class BudgetsControllerTests
{
    [Fact]
    public async Task Create_NewBudgetPlan_ReturnsCreatedAtAction()
    {
        var db = TestDbContext.CreateInMemoryContext();
        var controller = new BudgetsController(db);

        var plan = new BudgetPlan
        {
            Type = BudgetType.Overall,
            Period = BudgetPeriod.Monthly,
            Limit = 1000
        };

        var result = await controller.Create(plan);

        var createdResult = Assert.IsType<CreatedAtActionResult>(result);
        Assert.NotNull(createdResult.Value);
    }

    [Fact]
    public async Task Create_DuplicateBudgetType_ReturnsOkWithReplaced()
    {
        var db = TestDbContext.CreateInMemoryContext();
        db.BudgetPlans.Add(new BudgetPlan
        {
            Type = BudgetType.Overall,
            Period = BudgetPeriod.Monthly,
            Limit = 1000
        });
        await db.SaveChangesAsync();

        var controller = new BudgetsController(db);
        var updated = new BudgetPlan
        {
            Type = BudgetType.Overall,
            Period = BudgetPeriod.Monthly,
            Limit = 2000
        };

        var result = await controller.Create(updated);

        var okResult = Assert.IsType<OkObjectResult>(result);
        dynamic obj = okResult.Value!;
        Assert.True(obj.replaced);
        Assert.Equal(2000, (decimal)obj.limit);
    }

    [Fact]
    public async Task GetAll_ReturnsBudgetPlans()
    {
        var db = TestDbContext.CreateInMemoryContext();
        db.BudgetPlans.Add(new BudgetPlan { Type = BudgetType.Overall, Period = BudgetPeriod.Monthly, Limit = 1000 });
        await db.SaveChangesAsync();

        var controller = new BudgetsController(db);
        var result = await controller.GetAll();

        var okResult = Assert.IsType<OkObjectResult>(result);
        var plans = Assert.IsType<List<BudgetPlan>>(okResult.Value);
        Assert.Single(plans);
    }
}

public class FavoritesControllerTests
{
    [Fact]
    public async Task Create_ValidFavorite_ReturnsCreatedAtAction()
    {
        var db = TestDbContext.CreateInMemoryContext();
        var controller = new FavoritesController(db);

        var fav = new FavoriteExpense
        {
            Title = "Coffee",
            Amount = 5,
            Category = Category.Food
        };

        var result = await controller.Create(fav);

        var createdResult = Assert.IsType<CreatedAtActionResult>(result);
        Assert.Equal(1, ((FavoriteExpense)createdResult.Value!).Id);
    }

    [Fact]
    public async Task Delete_ExistingFavorite_ReturnsNoContent()
    {
        var db = TestDbContext.CreateInMemoryContext();
        db.FavoriteExpenses.Add(new FavoriteExpense { Title = "Test", Amount = 5, Category = Category.Food });
        await db.SaveChangesAsync();

        var controller = new FavoritesController(db);
        var result = await controller.Delete(1);

        Assert.IsType<NoContentResult>(result);
        Assert.Equal(0, await db.FavoriteExpenses.CountAsync());
    }
}

public class RecurringControllerTests
{
    [Fact]
    public async Task Create_ValidRecurring_ReturnsCreatedAtAction()
    {
        var db = TestDbContext.CreateInMemoryContext();
        var controller = new RecurringController(db);

        var recurring = new RecurringExpense
        {
            Title = "Netflix",
            Amount = 15,
            Category = Category.Entertainment,
            Frequency = RecurringFrequency.Monthly,
            StartDate = DateOnly.FromDateTime(DateTime.Today)
        };

        var result = await controller.Create(recurring);

        var createdResult = Assert.IsType<CreatedAtActionResult>(result);
        Assert.NotNull(createdResult.Value);
    }

    [Fact]
    public async Task Delete_ExistingRecurring_ReturnsNoContent()
    {
        var db = TestDbContext.CreateInMemoryContext();
        db.RecurringExpenses.Add(new RecurringExpense
        {
            Title = "Test",
            Amount = 10,
            Category = Category.Other,
            Frequency = RecurringFrequency.Monthly,
            StartDate = DateOnly.FromDateTime(DateTime.Today)
        });
        await db.SaveChangesAsync();

        var controller = new RecurringController(db);
        var result = await controller.Delete(1);

        Assert.IsType<NoContentResult>(result);
        Assert.Equal(0, await db.RecurringExpenses.CountAsync());
    }
}
