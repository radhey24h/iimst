'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  api,
  getSubjectsForResult,
  bulkInsertResults,
  hasResultsForSemester,
  getResultsByStudentAndSemester,
  type Student,
  type Course,
  type SubjectForResult,
} from '@/lib/api';
import { toRoman } from '@/lib/roman';

export default function AdminResultsEntryPage() {
  const searchParams = useSearchParams();
  const studentId = searchParams.get('studentId') ?? '';

  const [student, setStudent] = useState<Student | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [semester, setSemester] = useState(1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [subjects, setSubjects] = useState<SubjectForResult[]>([]);
  const [marks, setMarks] = useState<Record<string, string>>({});
  const [subjectsLoading, setSubjectsLoading] = useState(false);
  const [hasExistingResults, setHasExistingResults] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');

  const selectedCourse = student ? courses.find((c) => c.id === student.courseId) : null;
  const maxSemester = selectedCourse?.maxSemester ?? 8;

  useEffect(() => {
    if (!studentId) {
      setLoading(false);
      return;
    }
    Promise.all([
      api<Student>(`/students/${encodeURIComponent(studentId)}`),
      api<Course[]>('/courses'),
    ])
      .then(([s, c]) => {
        setStudent(s);
        setCourses(c);
      })
      .catch(() => setStudent(null))
      .finally(() => setLoading(false));
  }, [studentId]);

  useEffect(() => {
    if (!student?.courseId || !student?.branchId || !semester) {
      setSubjects([]);
      setMarks({});
      setHasExistingResults(false);
      return;
    }
    setSubjectsLoading(true);
    setError('');
    Promise.all([
      getSubjectsForResult(student.courseId, student.branchId, semester),
      hasResultsForSemester(student.id, semester),
      getResultsByStudentAndSemester(student.id, semester),
    ])
      .then(([list, { hasResults }, existingResults]) => {
        setSubjects(list);
        const initial: Record<string, string> = {};
        list.forEach((s) => {
          const existing = existingResults.find((r) => r.subjectId === s.subjectId);
          initial[s.subjectId] = existing != null ? String(existing.marksObtained) : '';
        });
        setMarks(initial);
        setHasExistingResults(hasResults);
        // Set year from existing results if available
        if (existingResults.length > 0 && existingResults[0].year) {
          setYear(existingResults[0].year);
        }
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Failed to load subjects');
        setSubjects([]);
      })
      .finally(() => setSubjectsLoading(false));
  }, [student?.id, student?.courseId, student?.branchId, semester]);

  const allMarksFilled =
    subjects.length > 0 &&
    subjects.every((s) => {
      const v = marks[s.subjectId];
      return v !== '' && v !== undefined && !Number.isNaN(Number(v));
    });
  const anyMarksExceedMax = subjects.some((s) => {
    const v = Number(marks[s.subjectId]);
    return !Number.isNaN(v) && v > s.maxMarks;
  });
  const canSave =
    student &&
    allMarksFilled &&
    !anyMarksExceedMax &&
    !saving &&
    !!student.branchId;

  const handleSaveResults = useCallback(async () => {
    if (!student || !canSave) return;
    setError('');
    setSaving(true);
    try {
      await bulkInsertResults({
        studentId: student.id,
        semester,
        year,
        marks: subjects.map((s) => ({
          subjectId: s.subjectId,
          marksObtained: Number(marks[s.subjectId]),
        })),
      });
      setSuccessMessage(`Results saved for ${student.fullName}, Semester ${toRoman(semester)}.`);
      setHasExistingResults(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save results');
    } finally {
      setSaving(false);
    }
  }, [student, semester, year, subjects, marks, canSave]);

  if (!studentId) {
    return (
      <div className="p-6">
        <p className="text-red-600">Missing student. Open from Results list.</p>
        <Link href="/admin/results" className="text-iimst-orange hover:underline mt-2 inline-block">
          ← Back to Results
        </Link>
      </div>
    );
  }

  if (loading) return <div className="p-6 text-center text-gray-500">Loading...</div>;
  if (!student) {
    return (
      <div className="p-6">
        <p className="text-red-600">Student not found.</p>
        <Link href="/admin/results" className="text-iimst-orange hover:underline mt-2 inline-block">
          ← Back to Results
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <Link
          href="/admin/results"
          className="text-gray-600 hover:text-gray-900 text-sm"
          target="_self"
          rel="noopener"
        >
          ← Back to list
        </Link>
        <h1 className="text-lg font-bold text-gray-900">Enter / update results</h1>
      </div>

      <div className="rounded-lg bg-gray-50 border border-gray-200 px-3 py-2">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-1 text-sm">
          <div><span className="text-gray-500">Name</span> <span className="font-medium text-gray-900">{student.fullName}</span></div>
          <div><span className="text-gray-500">Enrollment</span> <span className="font-medium text-gray-900">{student.enrollmentNo}</span></div>
          <div><span className="text-gray-500">Course</span> <span className="font-medium text-gray-900">{student.courseName ?? '—'}</span></div>
          <div><span className="text-gray-500">Branch</span> <span className="font-medium text-gray-900">{student.branchName ?? '—'}</span></div>
        </div>
      </div>

      {!student.branchId && (
        <p className="text-amber-700 bg-amber-50 border border-amber-200 rounded px-3 py-2 text-sm">
          Assign a branch to this student (Students → Edit) before entering results.
        </p>
      )}

      {student.branchId && (
        <>
          <div className="flex items-center gap-3 flex-wrap">
            <label className="text-sm font-medium text-gray-700">Semester</label>
            <select
              value={semester}
              onChange={(e) => setSemester(Number(e.target.value))}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-iimst-orange focus:border-transparent min-w-[140px]"
            >
              {Array.from({ length: maxSemester }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>Semester {toRoman(n)}</option>
              ))}
            </select>
            
            <label className="text-sm font-medium text-gray-700 ml-3">Year</label>
            <input
              type="number"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              min={2000}
              max={2100}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-iimst-orange focus:border-transparent w-24"
            />
          </div>

          {successMessage && (
            <p className="text-green-700 bg-green-50 border border-green-200 rounded px-3 py-2 text-sm">
              {successMessage}
            </p>
          )}
          {error && (
            <p className="text-red-700 bg-red-50 border border-red-200 rounded px-3 py-2 text-sm">
              {error}
            </p>
          )}

          {subjectsLoading && <p className="text-gray-500 text-sm">Loading subjects...</p>}

          {!subjectsLoading && subjects.length > 0 && (
            <>
              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="w-full text-left min-w-[520px] text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="px-3 py-2 font-medium text-gray-700">Code</th>
                      <th className="px-3 py-2 font-medium text-gray-700">Subject</th>
                      <th className="px-3 py-2 font-medium text-gray-700 w-14 text-right">Max</th>
                      <th className="px-3 py-2 font-medium text-gray-700 w-14 text-right">Min</th>
                      <th className="px-3 py-2 font-medium text-gray-700 w-32">Marks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subjects.map((s) => (
                      <tr key={s.subjectId} className="border-b border-gray-100 hover:bg-gray-50/50">
                        <td className="px-3 py-1.5 font-mono text-gray-700">{s.code}</td>
                        <td className="px-3 py-1.5 text-gray-900">{s.name}</td>
                        <td className="px-3 py-1.5 text-right text-gray-600">{s.maxMarks}</td>
                        <td className="px-3 py-1.5 text-right text-gray-600">{s.minPassMarks}</td>
                        <td className="px-3 py-1.5">
                          <input
                            type="number"
                            min={0}
                            max={s.maxMarks}
                            step={0.01}
                            value={marks[s.subjectId] ?? ''}
                            onChange={(e) => setMarks((m) => ({ ...m, [s.subjectId]: e.target.value }))}
                            className="w-20 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-iimst-orange focus:border-transparent text-sm"
                            placeholder="0"
                          />
                          {Number(marks[s.subjectId]) > s.maxMarks && (
                            <span className="text-red-600 text-xs ml-1">Max {s.maxMarks}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleSaveResults}
                  disabled={!canSave}
                  className="bg-iimst-orange hover:bg-iimst-orange-dark text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {saving ? 'Saving...' : 'Save results'}
                </button>
                {!allMarksFilled && subjects.length > 0 && (
                  <span className="text-gray-500 text-xs">Fill all marks to save.</span>
                )}
              </div>
            </>
          )}

          {student.branchId && !subjectsLoading && subjects.length === 0 && semester >= 1 && (
            <p className="text-gray-500 text-sm">
              No subjects for this course, branch and semester. Add subjects under Subjects first.
            </p>
          )}
        </>
      )}
    </div>
  );
}
