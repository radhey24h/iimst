'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api, type Result, type Student, type Subject } from '@/lib/api';

export default function AdminResultsPage() {
  const [results, setResults] = useState<Result[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ studentId: '', subjectId: '', semester: 1, marksObtained: '', maxMarks: '100', grade: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      api<Result[]>('/results'),
      api<Student[]>('/students?page=1&pageSize=500'),
      api<Subject[]>('/subjects'),
    ])
      .then(([r, s, sub]) => {
        setResults(r);
        setStudents(s);
        setSubjects(sub);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await api('/results', {
        method: 'POST',
        body: JSON.stringify({
          studentId: form.studentId || undefined,
          subjectId: form.subjectId || undefined,
          semester: form.semester,
          marksObtained: parseFloat(form.marksObtained),
          maxMarks: parseFloat(form.maxMarks),
          grade: form.grade || undefined,
        }),
      });
      const list = await api<Result[]>('/results');
      setResults(list);
      setShowForm(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Results</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-iimst-orange hover:bg-iimst-orange-dark text-white px-4 py-2 rounded-lg font-medium"
        >
          Add Result
        </button>
      </div>
      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 p-6 bg-white rounded-xl border border-gray-200 max-w-md space-y-4">
          <h2 className="font-semibold">New result</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Student</label>
            <select
              value={form.studentId}
              onChange={(e) => setForm((f) => ({ ...f, studentId: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              required
            >
              <option value="">Select</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>{s.enrollmentNo} — {s.fullName}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
            <select
              value={form.subjectId}
              onChange={(e) => setForm((f) => ({ ...f, subjectId: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              required
            >
              <option value="">Select</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>{s.name} ({s.minPassMarks}/{s.maxMarks})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
            <input
              type="number"
              min={1}
              value={form.semester}
              onChange={(e) => setForm((f) => ({ ...f, semester: parseInt(e.target.value, 10) }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div className="flex gap-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Marks obtained</label>
              <input
                type="number"
                step="0.01"
                value={form.marksObtained}
                onChange={(e) => setForm((f) => ({ ...f, marksObtained: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max marks</label>
              <input
                type="number"
                step="0.01"
                value={form.maxMarks}
                onChange={(e) => setForm((f) => ({ ...f, maxMarks: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Grade (optional)</label>
            <input
              value={form.grade}
              onChange={(e) => setForm((f) => ({ ...f, grade: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <div className="flex gap-2">
            <button type="submit" disabled={saving} className="bg-iimst-orange text-white px-4 py-2 rounded-lg font-medium disabled:opacity-50">
              Save
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="border border-gray-300 px-4 py-2 rounded-lg font-medium">
              Cancel
            </button>
          </div>
        </form>
      )}
      {loading ? (
        <div className="text-center py-12">Loading...</div>
      ) : results.length === 0 ? (
        <p className="text-gray-500">No results yet.</p>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
          <table className="w-full text-left min-w-[600px]">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-4 py-3 font-medium text-gray-700">Student</th>
                <th className="px-4 py-3 font-medium text-gray-700">Subject</th>
                <th className="px-4 py-3 font-medium text-gray-700">Sem</th>
                <th className="px-4 py-3 font-medium text-gray-700">Marks</th>
                <th className="px-4 py-3 font-medium text-gray-700">Grade</th>
                <th className="px-4 py-3 font-medium text-gray-700">Pass</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r) => (
                <tr key={r.id} className="border-b border-gray-100">
                  <td className="px-4 py-3">{r.enrollmentNo} — {r.studentName}</td>
                  <td className="px-4 py-3">{r.subjectCode} {r.subjectName}</td>
                  <td className="px-4 py-3">{r.semesterRoman || r.semester}</td>
                  <td className="px-4 py-3">{r.marksObtained} / {r.maxMarks}</td>
                  <td className="px-4 py-3">{r.grade || '-'}</td>
                  <td className="px-4 py-3">{r.isPassed ? 'Yes' : 'No'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
