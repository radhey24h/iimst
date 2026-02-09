'use client';

import { useEffect, useState } from 'react';
import { api, type Student, type SubjectExam, type ExamAttempt } from '@/lib/api';

export default function StudentExamsPage() {
  const [student, setStudent] = useState<Student | null>(null);
  const [exams, setExams] = useState<SubjectExam[]>([]);
  const [attempts, setAttempts] = useState<ExamAttempt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<Student>('/students/by-user')
      .then((s) => {
        setStudent(s);
        return Promise.all([
          api<SubjectExam[]>('/subjectexams?activeOnly=true'),
          api<ExamAttempt[]>(`/examattempts/student/${s.id}`),
        ]);
      })
      .then(([ex, at]) => {
        setExams(ex);
        setAttempts(at);
      })
      .catch(() => setStudent(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-12">Loading...</div>;
  if (!student) return <div className="text-center py-12 text-red-600">Could not load data.</div>;

  const lastAttemptByExamId = attempts.reduce<Record<string, ExamAttempt>>((acc, a) => {
    const existing = acc[a.subjectExamId];
    if (!existing || new Date(a.attemptedAt) > new Date(existing.attemptedAt)) acc[a.subjectExamId] = a;
    return acc;
  }, {});

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Subject-wise Exams</h1>
      <p className="text-gray-600 mb-6">
        Each subject has an exam link. Minimum passing marks are shown. After attempting, submit your marks to record the result.
      </p>
      {exams.length === 0 ? (
        <p className="text-gray-500">No exams available at the moment.</p>
      ) : (
        <div className="space-y-4">
          {exams.map((exam) => {
            const last = lastAttemptByExamId[exam.id];
            return (
              <div
                key={exam.id}
                className="bg-white rounded-xl border border-gray-200 p-4 flex flex-wrap items-center justify-between gap-4"
              >
                <div>
                  <h3 className="font-semibold text-gray-900">{exam.subjectName || exam.subjectCode}</h3>
                  <p className="text-sm text-gray-500">
                    Min passing: {exam.minPassingMarks} / Max: {exam.maxMarks}
                  </p>
                  {last && (
                    <p className="text-sm mt-1">
                      Last attempt: {last.marksObtained} — {last.isPassed ? 'Passed' : 'Not passed'}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {exam.examLink && (
                    <a
                      href={exam.examLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-iimst-orange hover:bg-iimst-orange-dark text-white px-4 py-2 rounded-lg text-sm font-medium"
                    >
                      Open Exam
                    </a>
                  )}
                  <Link
                    href={`/student/exams/${exam.id}/submit`}
                    className="border border-iimst-orange text-iimst-orange hover:bg-iimst-orange-50 px-4 py-2 rounded-lg text-sm font-medium"
                  >
                    Submit Marks
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
