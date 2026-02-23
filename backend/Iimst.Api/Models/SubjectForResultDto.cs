namespace Iimst.Api.Models;

public class SubjectForResultDto
{
    public string SubjectId { get; set; } = "";
    public string Code { get; set; } = "";
    public string Name { get; set; } = "";
    public int Semester { get; set; }
    public string SemesterRoman { get; set; } = "";
    public decimal MaxMarks { get; set; }
    public decimal MinPassMarks { get; set; }
}
