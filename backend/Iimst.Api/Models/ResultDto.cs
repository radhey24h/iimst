namespace Iimst.Api.Models;

public class ResultDto
{
    public string SubjectId { get; set; } = "";
    public string SubjectName { get; set; } = "";
    public int Semester { get; set; }
    public string SemesterRoman { get; set; } = "";
    public decimal MarksObtained { get; set; }
    public string? Grade { get; set; }
    public bool IsPassed { get; set; }
}
