'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api, type SubjectExam, type Subject } from '@/lib/api';

export default function AdminExamsPage() {
  const [exams, setExams] = useState<SubjectExam[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ subjectId: '', examLink: '', minPassingMarks: '', maxMarks: '100', isActive: true });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      api<SubjectExam[]>('/subjectexams'),
      api<Subject[]>('/subjects'),
    ])
      .then(([e, s]) => {
        setExams(e);
        setSubjects(s);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await api('/subjectexams', {
        method: 'POST',
        body: JSON.stringify({
          subjectId: form.subjectId || undefined,
          examLink: form.examLink,
          minPassingMarks: parseFloat(form.minPassingMarks),
          maxMarks: parseFloat(form.maxMarks),
          isActive: form.isActive,
        }),
      });
      const list = await api<SubjectExam[]>('/subjectexams');
      setExams(list);
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
        <h1 className="text-2xl font-bold text-gray-900">Exam Links</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-iimst-orange hover:bg-iimst-orange-dark text-white px-4 py-2 rounded-lg font-medium"
        >
          Add Exam Link
        </button>
      </div>
      <p className="text-gray-600 mb-4">Set exam link and minimum passing marks for each subject. Students see these on the Student Portal.</p>
      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 p-6 bg-white rounded-xl border border-gray-200 max-w-md space-y-4">
          <h2 className="font-semibold">New exam</h2>
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
                <option key={s.id} value={s.id}>{s.code} — {s.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Exam link (URL)</label>
            <input
              type="url"
              value={form.examLink}
              onChange={(e) => setForm((f) => ({ ...f, examLink: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              placeholder="https://..."
              required
            />
          </div>
          <div className="flex gap-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Min passing marks</label>
              <input
                type="number"
                step="0.01"
                value={form.minPassingMarks}
                onChange={(e) => setForm((f) => ({ ...f, minPassingMarks: e.target.value }))}
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
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              checked={form.isActive}
              onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
              className="rounded border-gray-300"
            />
            <label htmlFor="isActive" className="text-sm text-gray-700">Active (visible to students)</label>
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
      ) : exams.length === 0 ? (
        <p className="text-gray-500">No exam links yet.</p>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-4 py-3 font-medium text-gray-700">Subject</th>
                <th className="px-4 py-3 font-medium text-gray-700">Exam link</th>
                <th className="px-4 py-3 font-medium text-gray-700">Min pass</th>
                <th className="px-4 py-3 font-medium text-gray-700">Max</th>
                <th className="px-4 py-3 font-medium text-gray-700">Active</th>
              </tr>
            </thead>
            <tbody>
              {exams.map((e) => (
                <tr key={e.id} className="border-b border-gray-100">
                  <td className="px-4 py-3">{e.subjectCode} — {e.subjectName}</td>
                  <td className="px-4 py-3">
                    <a href={e.examLink} target="_blank" rel="noopener noreferrer" className="text-iimst-orange hover:underline truncate block max-w-xs">
                      {e.examLink}
                    </a>
                  </td>
                  <td className="px-4 py-3">{e.minPassingMarks}</td>
                  <td className="px-4 py-3">{e.maxMarks}</td>
                  <td className="px-4 py-3">{e.isActive ? 'Yes' : 'No'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
