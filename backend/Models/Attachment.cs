namespace ExpenseTracker.API.Models;

public class Attachment
{
    public int Id { get; set; }
    public int ExpenseId { get; set; }
    public string StoredName { get; set; } = string.Empty;
    public string OriginalName { get; set; } = string.Empty;
    public string ContentType { get; set; } = string.Empty;
    public long Size { get; set; }
}
