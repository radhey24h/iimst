'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api, getSubjectsForResult, bulkInsertResults, hasResultsForSemester } from '@/lib/api';
import { toRoman } from '@/lib/roman';
import type { Course, Student, SubjectForResult } from '@/lib/api';

export default function AdminResultsNewPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<SubjectForResult[]>([]);
  const [marks, setMarks] = useState<Record<string, string>>({});
  const [step1CourseId, setStep1CourseId] = useState('');
  const [step2Student, setStep2Student] = useState<Student | null>(null);
  const [step3Semester, setStep3Semester] = useState(1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [subjectsLoaded, setSubjectsLoaded] = useState(false);
  const [hasExistingResults, setHasExistingResults] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api<Course[]>('/courses')
      .then(setCourses)
      .catch(() => setCourses([]));
  }, []);

  useEffect(() => {
    if (!step1CourseId) {
      setStudents([]);
      setStep2Student(null);
      return;
    }
    setLoading(true);
    api<Student[]>(`/students/by-course?courseId=${encodeURIComponent(step1CourseId)}`)
      .then(setStudents)
      .catch(() => setStudents([]))
      .finally(() => setLoading(false));
  }, [step1CourseId]);

  useEffect(() => {
    setStep2Student(null);
    setStep3Semester(1);
    setSubjects([]);
    setMarks({});
    setSubjectsLoaded(false);
    setHasExistingResults(false);
  }, [step1CourseId]);

  useEffect(() => {
    setSubjects([]);
    setMarks({});
    setSubjectsLoaded(false);
    setHasExistingResults(false);
  }, [step2Student, step3Semester]);

  async function loadSubjects() {
    if (!step2Student?.courseId || !step2Student?.branchId) {
      setError('Student must have Course and Branch assigned.');
      return;
    }
    setError('');
    setLoadingSubjects(true);
    try {
      const list = await getSubjectsForResult(step2Student.courseId, step2Student.branchId, step3Semester);
      setSubjects(list);
      setMarks(list.reduce((acc, s) => ({ ...acc, [s.subjectId]: '' }), {}));
      setSubjectsLoaded(true);
      const { hasResults } = await hasResultsForSemester(step2Student.id, step3Semester);
      setHasExistingResults(hasResults);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load subjects');
      setSubjects([]);
    } finally {
      setLoadingSubjects(false);
    }
  }

  function setMark(subjectId: string, value: string) {
    setMarks((m) => ({ ...m, [subjectId]: value }));
  }

  const allMarksFilled = subjects.length > 0 && subjects.every((s) => {
    const v = marks[s.subjectId];
    return v !== '' && v !== undefined && !Number.isNaN(Number(v));
  });

  const anyMarksExceedMax = subjects.some((s) => {
    const v = Number(marks[s.subjectId]);
    return !Number.isNaN(v) && v > s.maxMarks;
  });

  const canSave = allMarksFilled && !anyMarksExceedMax && !hasExistingResults && !saving;

  async function handleSave() {
    if (!step2Student || !canSave) return;
    setError('');
    setSaving(true);
    try {
      await bulkInsertResults({
        studentId: step2Student.id,
        semester: step3Semester,
        year,
        marks: subjects.map((s) => ({
          subjectId: s.subjectId,
          marksObtained: Number(marks[s.subjectId]),
        })),
      });
      setSuccess(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save results');
    } finally {
      setSaving(false);
    }
  }

  if (success) {
    return (
      <div className="max-w-md mx-auto text-center py-12">
        <p className="text-green-600 font-medium mb-4">Results saved successfully.</p>
        <Link href="/admin/results" className="text-iimst-orange hover:underline">Back to Results</Link>
        <span className="mx-2">|</span>
        <button type="button" onClick={() => { setSuccess(false); setSubjects([]); setMarks({}); setSubjectsLoaded(false); }} className="text-iimst-orange hover:underline">
          Add more
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/results" className="text-gray-600 hover:text-gray-900">← Results</Link>
        <h1 className="text-2xl font-bold text-gray-900">New Result Entry</h1>
      </div>

      <div className="space-y-6 max-w-2xl">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Step 1: Select Course</label>
          <select
            value={step1CourseId}
            onChange={(e) => setStep1CourseId(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-iimst-orange"
          >
            <option value="">Select course</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Step 2: Select Student</label>
          <select
            value={step2Student?.id ?? ''}
            onChange={(e) => {
              const s = students.find((x) => x.id === e.target.value) ?? null;
              setStep2Student(s);
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-iimst-orange"
            disabled={!step1CourseId || loading}
          >
            <option value="">Select student</option>
            {students.map((s) => (
              <option key={s.id} value={s.id}>{s.enrollmentNo} — {s.fullName}{s.branchName ? ` (${s.branchName})` : ''}</option>
            ))}
          </select>
          {loading && <p className="text-sm text-gray-500 mt-1">Loading students...</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Step 3: Select Semester</label>
          <select
            value={step3Semester}
            onChange={(e) => setStep3Semester(Number(e.target.value))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-iimst-orange"
          >
            {(() => {
              const selectedCourse = courses.find((c) => c.id === step1CourseId);
              const maxSem = selectedCourse?.maxSemester ?? 8;
              return Array.from({ length: maxSem }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>Semester {toRoman(n)}</option>
              ));
            })()}
          </select>
          {step1CourseId && (
            <p className="text-xs text-gray-500 mt-1">
              {courses.find((c) => c.id === step1CourseId)?.name ?? 'Course'} has {courses.find((c) => c.id === step1CourseId)?.maxSemester ?? 8} semesters
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
          <input
            type="number"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            min={2000}
            max={2100}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-iimst-orange"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Step 4: Load Subjects</label>
          <button
            type="button"
            onClick={loadSubjects}
            disabled={!step2Student?.branchId || loadingSubjects}
            className="bg-iimst-orange hover:bg-iimst-orange-dark text-white px-4 py-2 rounded-lg font-medium disabled:opacity-50"
          >
            {loadingSubjects ? 'Loading...' : 'Load Subjects'}
          </button>
          {!step2Student?.branchId && step2Student && (
            <p className="text-amber-600 text-sm mt-1">Assign a branch to this student first.</p>
          )}
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}
        {hasExistingResults && <p className="text-amber-600 text-sm">Results already exist for this student and semester. Save is disabled.</p>}

        {subjectsLoaded && subjects.length > 0 && (
          <>
            <div>
              <h2 className="font-semibold text-gray-900 mb-2">Step 5 & 6: Enter marks and save</h2>
              <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
                <table className="w-full text-left min-w-[500px]">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="px-4 py-3 font-medium text-gray-700">Subject Code</th>
                      <th className="px-4 py-3 font-medium text-gray-700">Subject Name</th>
                      <th className="px-4 py-3 font-medium text-gray-700 w-20 text-right">Max</th>
                      <th className="px-4 py-3 font-medium text-gray-700 w-20 text-right">Min</th>
                      <th className="px-4 py-3 font-medium text-gray-700 w-32">Marks Obtained</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subjects.map((s) => (
                      <tr key={s.subjectId} className="border-b border-gray-100">
                        <td className="px-4 py-3">{s.code}</td>
                        <td className="px-4 py-3">{s.name}</td>
                        <td className="px-4 py-3 text-right">{s.maxMarks}</td>
                        <td className="px-4 py-3 text-right">{s.minPassMarks}</td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            min={0}
                            max={s.maxMarks}
                            step={0.01}
                            value={marks[s.subjectId] ?? ''}
                            onChange={(e) => setMark(s.subjectId, e.target.value)}
                            className="w-full px-3 py-1.5 border border-gray-300 rounded focus:ring-2 focus:ring-iimst-orange"
                          />
                          {Number(marks[s.subjectId]) > s.maxMarks && (
                            <p className="text-red-600 text-xs mt-0.5">Cannot exceed {s.maxMarks}</p>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleSave}
                disabled={!canSave}
                className="bg-iimst-orange hover:bg-iimst-orange-dark text-white px-4 py-2 rounded-lg font-medium disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Results'}
              </button>
              {!allMarksFilled && subjects.length > 0 && (
                <p className="text-gray-500 text-sm self-center">Fill all marks to save.</p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
