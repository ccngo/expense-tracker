using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ExpenseTracker.API.Migrations
{
    /// <inheritdoc />
    public partial class AddFavoriteExpense : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "FavoriteExpenses",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Title = table.Column<string>(type: "TEXT", nullable: false),
                    Amount = table.Column<decimal>(type: "TEXT", nullable: false),
                    Category = table.Column<int>(type: "INTEGER", nullable: false),
                    PaymentMethod = table.Column<int>(type: "INTEGER", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FavoriteExpenses", x => x.Id);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "FavoriteExpenses");
        }
    }
}
