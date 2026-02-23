'use client';

import { useEffect, useState } from 'react';
import { api, getBranchesByCourse, type Branch, type Course } from '@/lib/api';

export default function AdminBranchesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [branchLoading, setBranchLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ courseId: '', name: '', code: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api<Course[]>('/courses')
      .then(setCourses)
      .catch(() => setCourses([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedCourseId) {
      setBranches([]);
      return;
    }
    setBranchLoading(true);
    getBranchesByCourse(selectedCourseId)
      .then(setBranches)
      .catch(() => setBranches([]))
      .finally(() => setBranchLoading(false));
  }, [selectedCourseId]);

  function openAdd() {
    const courseId = selectedCourseId || (courses[0]?.id ?? '');
    setForm({ courseId, name: '', code: '' });
    setEditingId(null);
    setShowForm(true);
    setError('');
  }

  function openEdit(b: Branch) {
    setForm({ courseId: b.courseId, name: b.name, code: b.code });
    setEditingId(b.id);
    setShowForm(true);
    setError('');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!form.courseId?.trim()) {
      setError('Please select a course.');
      return;
    }
    setSaving(true);
    try {
      if (editingId) {
        await api(`/branches/${editingId}`, {
          method: 'PUT',
          body: JSON.stringify({ courseId: form.courseId.trim(), name: form.name.trim(), code: form.code.trim() }),
        });
      } else {
        await api('/branches', {
          method: 'POST',
          body: JSON.stringify({ courseId: form.courseId.trim(), name: form.name.trim(), code: form.code.trim() }),
        });
      }
      setShowForm(false);
      if (selectedCourseId) {
        const list = await getBranchesByCourse(selectedCourseId);
        setBranches(list);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save';
      setError(msg === 'Request failed' ? 'Could not save branch. Check you are logged in as Admin.' : msg);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this branch?')) return;
    try {
      await api(`/branches/${id}`, { method: 'DELETE' });
      if (selectedCourseId) {
        const list = await getBranchesByCourse(selectedCourseId);
        setBranches(list);
      }
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Delete failed');
    }
  }

  if (loading) return <div className="text-center py-12">Loading...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Branches</h1>
        <button
          type="button"
          onClick={openAdd}
          className="bg-iimst-orange hover:bg-iimst-orange-dark text-white px-4 py-2 rounded-lg font-medium"
        >
          Add Branch
        </button>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
        <select
          value={selectedCourseId}
          onChange={(e) => setSelectedCourseId(e.target.value)}
          className="w-full max-w-xs px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-iimst-orange focus:border-transparent"
        >
          <option value="">Select course</option>
          {courses.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 p-6 bg-white rounded-xl border border-gray-200 max-w-md space-y-4">
          <h2 className="font-semibold text-gray-900">{editingId ? 'Edit Branch' : 'New Branch'}</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
            <select
              value={form.courseId}
              onChange={(e) => setForm((f) => ({ ...f, courseId: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              required
              disabled={!!editingId}
            >
              <option value="">Select</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Code</label>
            <input
              type="text"
              value={form.code}
              onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              required
            />
          </div>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <div className="flex gap-2">
            <button type="submit" disabled={saving} className="bg-iimst-orange text-white px-4 py-2 rounded-lg font-medium disabled:opacity-50">
              {saving ? 'Saving...' : 'Save'}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="border border-gray-300 px-4 py-2 rounded-lg font-medium">
              Cancel
            </button>
          </div>
        </form>
      )}

      {!selectedCourseId ? (
        <p className="text-gray-500">Select a course above to view or add branches.</p>
      ) : branchLoading ? (
        <div className="text-center py-12">Loading branches...</div>
      ) : branches.length === 0 ? (
        <p className="text-gray-500">
          No branches for this course yet. Click &quot;Add Branch&quot; to create one (Name and Code, e.g. DM).
        </p>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
          <table className="w-full text-left min-w-[400px]">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-4 py-3 font-medium text-gray-700">Code</th>
                <th className="px-4 py-3 font-medium text-gray-700">Name</th>
                <th className="px-4 py-3 font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {branches.map((b) => (
                <tr key={b.id} className="border-b border-gray-100">
                  <td className="px-4 py-3">{b.code}</td>
                  <td className="px-4 py-3">{b.name}</td>
                  <td className="px-4 py-3">
                    <button type="button" onClick={() => openEdit(b)} className="text-iimst-orange hover:underline mr-3">Edit</button>
                    <button type="button" onClick={() => handleDelete(b.id)} className="text-red-600 hover:underline">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
