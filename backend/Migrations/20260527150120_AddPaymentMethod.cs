using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ExpenseTracker.API.Migrations
{
    /// <inheritdoc />
    public partial class AddPaymentMethod : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<int>(
                name: "Category",
                table: "Expenses",
                type: "INTEGER",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "TEXT");

            migrationBuilder.AddColumn<int>(
                name: "PaymentMethod",
                table: "Expenses",
                type: "INTEGER",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PaymentMethod",
                table: "Expenses");

            migrationBuilder.AlterColumn<string>(
                name: "Category",
                table: "Expenses",
                type: "TEXT",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "INTEGER");
        }
    }
}
