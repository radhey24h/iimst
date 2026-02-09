'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api, type Course } from '@/lib/api';

export default function NewStudentPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [form, setForm] = useState({
    enrollmentNo: '',
    fullName: '',
    fatherName: '',
    motherName: '',
    dateOfBirth: '',
    email: '',
    courseId: '',
    program: '',
    branch: '',
    currentSemester: '',
    phone: '',
    address: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api<Course[]>('/courses').then(setCourses).catch(() => setCourses([]));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api('/students', {
        method: 'POST',
        body: JSON.stringify({
          enrollmentNo: form.enrollmentNo.trim() || undefined,
          fullName: form.fullName.trim(),
          fatherName: form.fatherName.trim() || undefined,
          motherName: form.motherName.trim() || undefined,
          dateOfBirth: form.dateOfBirth || undefined,
          email: form.email.trim() || undefined,
          courseId: form.courseId || undefined,
          program: form.program.trim() || undefined,
          branch: form.branch.trim() || undefined,
          currentSemester: form.currentSemester ? parseInt(form.currentSemester, 10) : undefined,
          phone: form.phone.trim() || undefined,
          address: form.address.trim() || undefined,
        }),
      });
      router.push('/admin/students');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Add Student</h1>
      <p className="text-gray-600 mb-4">
        Login: <strong>User ID = Enrollment number</strong>, <strong>Password = Enrollment number</strong>. Leave Enrollment No blank to auto-generate (YYYYMMDD + 3 digits).
      </p>
      <form onSubmit={handleSubmit} className="max-w-md space-y-4 bg-white p-6 rounded-xl border border-gray-200">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Enrollment No (optional — auto-generated if blank)</label>
          <input
            value={form.enrollmentNo}
            onChange={(e) => setForm((f) => ({ ...f, enrollmentNo: e.target.value }))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            placeholder="Leave blank to auto-generate"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Full name</label>
          <input
            value={form.fullName}
            onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Father&apos;s name</label>
          <input
            value={form.fatherName}
            onChange={(e) => setForm((f) => ({ ...f, fatherName: e.target.value }))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Mother&apos;s name</label>
          <input
            value={form.motherName}
            onChange={(e) => setForm((f) => ({ ...f, motherName: e.target.value }))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date of birth</label>
          <input
            type="date"
            value={form.dateOfBirth}
            onChange={(e) => setForm((f) => ({ ...f, dateOfBirth: e.target.value }))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
        </div>
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
          <label className="block text-sm font-medium text-gray-700 mb-1">Program</label>
          <input
            value={form.program}
            onChange={(e) => setForm((f) => ({ ...f, program: e.target.value }))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Branch</label>
          <input
            value={form.branch}
            onChange={(e) => setForm((f) => ({ ...f, branch: e.target.value }))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Current semester</label>
          <input
            type="number"
            min={1}
            value={form.currentSemester}
            onChange={(e) => setForm((f) => ({ ...f, currentSemester: e.target.value }))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
          <input
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
          <textarea
            value={form.address}
            onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            rows={2}
          />
        </div>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <div className="flex gap-2">
          <button type="submit" disabled={loading} className="bg-iimst-orange text-white px-4 py-2 rounded-lg font-medium disabled:opacity-50">
            Add Student
          </button>
          <Link href="/admin/students" className="border border-gray-300 px-4 py-2 rounded-lg font-medium">Cancel</Link>
        </div>
      </form>
    </div>
  );
}
