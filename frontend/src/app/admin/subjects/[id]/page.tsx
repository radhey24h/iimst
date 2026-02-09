'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api, type Subject, type Course } from '@/lib/api';

export default function EditSubjectPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [subject, setSubject] = useState<Subject | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [form, setForm] = useState({ courseId: '', code: '', name: '', semester: '', program: '', minPassMarks: '40', maxMarks: '100', examLink: '', credits: '4' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api<Course[]>('/courses').then(setCourses).catch(() => setCourses([]));
  }, []);

  useEffect(() => {
    api<Subject>(`/subjects/${id}`)
      .then((s) => {
        setSubject(s);
        setForm({
          courseId: s.courseId || '',
          code: s.code || '',
          name: s.name,
          semester: s.semester?.toString() || '',
          program: s.program || '',
          minPassMarks: s.minPassMarks?.toString() || '40',
          maxMarks: s.maxMarks?.toString() || '100',
          examLink: s.examLink || '',
          credits: s.credits?.toString() || '4',
        });
      })
      .catch(() => setSubject(null))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await api(`/subjects/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
          courseId: form.courseId || undefined,
          code: form.code.trim() || undefined,
          name: form.name.trim(),
          semester: form.semester ? parseInt(form.semester, 10) : undefined,
          program: form.program.trim() || undefined,
          minPassMarks: parseFloat(form.minPassMarks) || 40,
          maxMarks: parseFloat(form.maxMarks) || 100,
          examLink: form.examLink.trim() || undefined,
          credits: parseInt(form.credits, 10) || 4,
        }),
      });
      router.push('/admin/subjects');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="py-12">Loading...</div>;
  if (!subject) return <div className="py-12 text-red-600">Subject not found.</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Subject</h1>
      <form onSubmit={handleSubmit} className="max-w-md space-y-4 bg-white p-6 rounded-xl border border-gray-200">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
          <select
            value={form.courseId}
            onChange={(e) => setForm((f) => ({ ...f, courseId: e.target.value }))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          >
            <option value="">Select</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Code</label>
          <input
            value={form.code}
            onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Subject name</label>
          <input
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
          <input
            type="number"
            min={1}
            max={8}
            value={form.semester}
            onChange={(e) => setForm((f) => ({ ...f, semester: e.target.value }))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Program</label>
          <input
            value={form.program}
            onChange={(e) => setForm((f) => ({ ...f, program: e.target.value }))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
        </div>
        <div className="flex gap-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Min pass marks</label>
            <input
              type="number"
              min={0}
              value={form.minPassMarks}
              onChange={(e) => setForm((f) => ({ ...f, minPassMarks: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Max marks</label>
            <input
              type="number"
              min={1}
              value={form.maxMarks}
              onChange={(e) => setForm((f) => ({ ...f, maxMarks: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Exam link (URL)</label>
          <input
            type="url"
            value={form.examLink}
            onChange={(e) => setForm((f) => ({ ...f, examLink: e.target.value }))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Credits</label>
          <input
            type="number"
            min={1}
            value={form.credits}
            onChange={(e) => setForm((f) => ({ ...f, credits: e.target.value }))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
        </div>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <div className="flex gap-2">
          <button type="submit" disabled={saving} className="bg-iimst-orange text-white px-4 py-2 rounded-lg font-medium disabled:opacity-50">
            Save
          </button>
          <Link href="/admin/subjects" className="border border-gray-300 px-4 py-2 rounded-lg font-medium">Cancel</Link>
        </div>
      </form>
    </div>
  );
}
