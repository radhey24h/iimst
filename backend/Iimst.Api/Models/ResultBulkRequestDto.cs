namespace Iimst.Api.Models;

public class ResultBulkRequestDto
{
    public string StudentId { get; set; } = "";
    public int Semester { get; set; }
    public List<ResultBulkItemDto> Marks { get; set; } = new();
}

public class ResultBulkItemDto
{
    public string SubjectId { get; set; } = "";
    public decimal MarksObtained { get; set; }
}
