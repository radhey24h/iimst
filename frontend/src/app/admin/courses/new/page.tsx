'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';

export default function NewCoursePage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', maxSemester: 8 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api('/courses', {
        method: 'POST',
        body: JSON.stringify({ name: form.name.trim(), maxSemester: form.maxSemester }),
      });
      router.push('/admin/courses');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Add Course</h1>
      <form onSubmit={handleSubmit} className="max-w-md space-y-4 bg-white p-6 rounded-xl border border-gray-200">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Course name</label>
          <input
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            placeholder="e.g. Bachelor Programme in Business Administration"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Max semester</label>
          <select
            value={form.maxSemester}
            onChange={(e) => setForm((f) => ({ ...f, maxSemester: parseInt(e.target.value, 10) }))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          >
            <option value={6}>6 (Diploma)</option>
            <option value={8}>8 (Bachelor)</option>
          </select>
        </div>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <div className="flex gap-2">
          <button type="submit" disabled={loading} className="bg-iimst-orange text-white px-4 py-2 rounded-lg font-medium disabled:opacity-50">
            Save
          </button>
          <Link href="/admin/courses" className="border border-gray-300 px-4 py-2 rounded-lg font-medium">Cancel</Link>
        </div>
      </form>
    </div>
  );
}
