'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api, type Student, type Course } from '@/lib/api';

export default function EditStudentPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [student, setStudent] = useState<Student | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [form, setForm] = useState({
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
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api<Course[]>('/courses').then(setCourses).catch(() => setCourses([]));
  }, []);

  useEffect(() => {
    api<Student>(`/students/${id}`)
      .then((s) => {
        setStudent(s);
        setForm({
          fullName: s.fullName,
          fatherName: s.fatherName || '',
          motherName: s.motherName || '',
          dateOfBirth: s.dateOfBirth ? s.dateOfBirth.slice(0, 10) : '',
          email: s.email || '',
          courseId: s.courseId || '',
          program: s.program || '',
          branch: s.branch || '',
          currentSemester: s.currentSemester?.toString() || '',
          phone: s.phone || '',
          address: s.address || '',
        });
      })
      .catch(() => setStudent(null))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await api(`/students/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
          fullName: form.fullName,
          fatherName: form.fatherName || undefined,
          motherName: form.motherName || undefined,
          dateOfBirth: form.dateOfBirth || undefined,
          email: form.email || undefined,
          courseId: form.courseId || undefined,
          program: form.program || undefined,
          branch: form.branch || undefined,
          currentSemester: form.currentSemester ? parseInt(form.currentSemester, 10) : undefined,
          phone: form.phone || undefined,
          address: form.address || undefined,
        }),
      });
      router.push('/admin/students');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="py-12">Loading...</div>;
  if (!student) return <div className="py-12 text-red-600">Student not found.</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Student — {student.enrollmentNo}</h1>
      <form onSubmit={handleSubmit} className="max-w-md space-y-4 bg-white p-6 rounded-xl border border-gray-200">
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
          <button type="submit" disabled={saving} className="bg-iimst-orange text-white px-4 py-2 rounded-lg font-medium disabled:opacity-50">
            Save
          </button>
          <Link href="/admin/students" className="border border-gray-300 px-4 py-2 rounded-lg font-medium">Cancel</Link>
        </div>
      </form>
    </div>
  );
}
