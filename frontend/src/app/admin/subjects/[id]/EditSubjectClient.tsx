'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api, getBranchesByCourse, type Subject, type Course, type Branch } from '@/lib/api';

export default function EditSubjectClient() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [subject, setSubject] = useState<Subject | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [form, setForm] = useState({
    courseId: '',
    branchId: '',
    code: '',
    name: '',
    semester: '1',
    minPassMarks: '40',
    maxMarks: '100',
    examLink: '',
    isActive: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api<Course[]>('/courses').then(setCourses).catch(() => setCourses([]));
  }, []);

  useEffect(() => {
    if (!form.courseId) {
      setBranches([]);
      return;
    }
    getBranchesByCourse(form.courseId).then(setBranches).catch(() => setBranches([]));
  }, [form.courseId]);

  useEffect(() => {
    api<Subject>(`/subjects/${id}`)
      .then((s) => {
        setSubject(s);
        setForm({
          courseId: s.courseId || '',
          branchId: s.branchId || '',
          code: s.code || '',
          name: s.name,
          semester: s.semester?.toString() ?? '1',
          minPassMarks: s.minPassMarks?.toString() ?? '40',
          maxMarks: s.maxMarks?.toString() ?? '100',
          examLink: s.examLink || '',
          isActive: s.isActive ?? true,
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
          branchId: form.branchId || undefined,
          code: form.code.trim() || undefined,
          name: form.name.trim(),
          semester: form.semester ? parseInt(form.semester, 10) : 1,
          minPassMarks: parseFloat(form.minPassMarks) || 40,
          maxMarks: parseFloat(form.maxMarks) || 100,
          examLink: form.examLink.trim() || undefined,
          isActive: form.isActive,
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
          <label className="block text-sm font-medium text-gray-700 mb-1">Branch</label>
          <select
            value={form.branchId}
            onChange={(e) => setForm((f) => ({ ...f, branchId: e.target.value }))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          >
            <option value="">Select</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>{b.name} ({b.code})</option>
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
            max={courses.find((c) => c.id === form.courseId)?.maxSemester ?? 8}
            value={form.semester}
            onChange={(e) => setForm((f) => ({ ...f, semester: e.target.value }))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
          {form.courseId && (
            <p className="text-xs text-gray-500 mt-1">
              1 to {courses.find((c) => c.id === form.courseId)?.maxSemester ?? 8} for this course
            </p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Exam link (URL)</label>
          <input
            type="url"
            value={form.examLink}
            onChange={(e) => setForm((f) => ({ ...f, examLink: e.target.value }))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            placeholder="https://..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Min passing marks</label>
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
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="isActive"
            checked={form.isActive}
            onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
            className="rounded border-gray-300"
          />
          <label htmlFor="isActive" className="text-sm font-medium text-gray-700">Active</label>
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
