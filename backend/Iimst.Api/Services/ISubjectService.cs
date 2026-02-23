using Iimst.Api.Models;

namespace Iimst.Api.Services;

public interface ISubjectService
{
    Task<List<SubjectForResultDto>> GetByCourseBranchSemesterAsync(string courseId, string branchId, int semester);
}
