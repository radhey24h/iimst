'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api, getBranchesByCourse, type Course, type Branch } from '@/lib/api';

export default function NewStudentPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [form, setForm] = useState({
    fullName: '',
    fatherName: '',
    dateOfBirth: '',
    email: '',
    courseId: '',
    branchId: '',
    admissionYear: '',
    phone: '',
    address: '',
  });
  const [loading, setLoading] = useState(false);
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api('/students', {
        method: 'POST',
        body: JSON.stringify({
          fullName: form.fullName.trim(),
          fatherName: form.fatherName.trim() || undefined,
          dob: form.dateOfBirth || undefined,
          emailId: form.email.trim() || undefined,
          courseId: form.courseId || undefined,
          branchId: form.branchId || undefined,
          admissionYear: form.admissionYear ? parseInt(form.admissionYear, 10) : undefined,
          phoneNumber: form.phone.trim() || undefined,
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
        Enrollment number is auto-generated. Login for the student: <strong>User ID = Enrollment No</strong>, <strong>Password = Enrollment No</strong> (share after student is created).
      </p>
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
            onChange={(e) => setForm((f) => ({ ...f, courseId: e.target.value, branchId: '' }))}
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
            disabled={!form.courseId}
          >
            <option value="">
              {!form.courseId ? 'Select course first' : branches.length === 0 ? 'No branches — add under Branches' : 'Select'}
            </option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>{b.name} ({b.code})</option>
            ))}
          </select>
          {form.courseId && branches.length === 0 && (
            <p className="text-amber-600 text-xs mt-1">Add branches for this course under Admin → Branches, then try again.</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Admission year</label>
          <input
            type="number"
            min={2000}
            max={2030}
            value={form.admissionYear}
            onChange={(e) => setForm((f) => ({ ...f, admissionYear: e.target.value }))}
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
