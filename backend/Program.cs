using Microsoft.EntityFrameworkCore;
using System.Text.Json.Serialization;
using ExpenseTracker.API.Data;
using ExpenseTracker.API.Services;

[assembly: System.Runtime.CompilerServices.InternalsVisibleTo("ExpenseTracker.API.Tests")]

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();
builder.Services.AddControllers().AddJsonOptions(options =>
    options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter()));
builder.Services.ConfigureHttpJsonOptions(options =>
    options.SerializerOptions.Converters.Add(new JsonStringEnumConverter()));
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));
builder.Services.AddHostedService<RecurringExpenseService>();

var app = builder.Build();

if (app.Environment.IsDevelopment())
    app.MapOpenApi();

app.UseHttpsRedirection();
app.MapGet("/health", () => Results.Ok("OK"));
app.MapControllers();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.Migrate();
    DbSeeder.SeedAsync(db).GetAwaiter().GetResult();
}

app.Run();
