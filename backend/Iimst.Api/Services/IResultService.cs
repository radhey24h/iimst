using Iimst.Api.Models;

namespace Iimst.Api.Services;

public interface IResultService
{
    Task<List<ResultDto>> BulkInsertResultsAsync(string studentId, int semester, List<(string SubjectId, decimal MarksObtained)> marksList);
}
