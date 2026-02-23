'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api, type Course } from '@/lib/api';

export default function EditCourseClient() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [course, setCourse] = useState<Course | null>(null);
  const [form, setForm] = useState({ name: '', maxSemester: 8 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api<Course>(`/courses/${id}`)
      .then((c) => {
        setCourse(c);
        setForm({ name: c.name, maxSemester: c.maxSemester });
      })
      .catch(() => setCourse(null))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await api(`/courses/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ name: form.name.trim(), maxSemester: form.maxSemester }),
      });
      router.push('/admin/courses');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="py-12">Loading...</div>;
  if (!course) return <div className="py-12 text-red-600">Course not found.</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Course</h1>
      <form onSubmit={handleSubmit} className="max-w-md space-y-4 bg-white p-6 rounded-xl border border-gray-200">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Course name</label>
          <input
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Number of semesters</label>
          <input
            type="number"
            min={1}
            max={20}
            value={form.maxSemester}
            onChange={(e) => setForm((f) => ({ ...f, maxSemester: parseInt(e.target.value, 10) || 1 }))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
          <p className="text-xs text-gray-500 mt-1">e.g. 4 (MBA), 6 (Diploma), 8 (BBA/Bachelor). Any value 1–20.</p>
        </div>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <div className="flex gap-2">
          <button type="submit" disabled={saving} className="bg-iimst-orange text-white px-4 py-2 rounded-lg font-medium disabled:opacity-50">
            Save
          </button>
          <Link href="/admin/courses" className="border border-gray-300 px-4 py-2 rounded-lg font-medium">Cancel</Link>
        </div>
      </form>
    </div>
  );
}
