'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api, getBranchesByCourse, type Branch, type Course } from '@/lib/api';

export default function NewStudentPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [form, setForm] = useState({
    enrollmentNo: '',
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
  const currentYear = new Date().getFullYear();
  const fieldClass = 'w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm md:text-base text-slate-900 placeholder:text-slate-400 focus:border-iimst-orange focus:ring-2 focus:ring-iimst-orange/20 focus:outline-none transition';

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
          enrollmentNo: form.enrollmentNo.trim() || undefined,
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
    <div className="min-h-screen bg-slate-50/80 px-4 py-8 lg:px-10">
      <div className="mx-auto w-full max-w-6xl space-y-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">Student Management</p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-900">Add Student</h1>
            <p className="mt-2 max-w-3xl text-base text-slate-600">
              Capture the student profile in one go. Provide an enrollment number if you already have one or leave the field blank to let the system generate a unique value automatically.
            </p>
          </div>
          <Link href="/admin/students" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:text-slate-900">
            ← Back to students
          </Link>
        </div>

        <div className="grid gap-6 xl:grid-cols-[2fr,1fr]">
          <form onSubmit={handleSubmit} className="space-y-8 rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-lg shadow-slate-200/60 backdrop-blur">
            <section className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-lg font-semibold text-slate-900">Identity & Enrollment</h2>
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">Step 1</span>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="mb-1 block text-sm font-medium text-slate-700">Enrollment number <span className="text-slate-400">(optional)</span></label>
                  <input
                    value={form.enrollmentNo}
                    onChange={(e) => setForm((f) => ({ ...f, enrollmentNo: e.target.value }))}
                    className={fieldClass}
                    placeholder="Leave blank to auto-generate"
                    autoComplete="off"
                  />
                  <p className="mt-1 text-xs text-slate-500">Accepted characters: letters, numbers, and hyphen. Leave empty to generate automatically.</p>
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1 block text-sm font-medium text-slate-700">Full name</label>
                  <input
                    value={form.fullName}
                    onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
                    className={fieldClass}
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Father&apos;s name</label>
                  <input
                    value={form.fatherName}
                    onChange={(e) => setForm((f) => ({ ...f, fatherName: e.target.value }))}
                    className={fieldClass}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Date of birth</label>
                  <input
                    type="date"
                    value={form.dateOfBirth}
                    onChange={(e) => setForm((f) => ({ ...f, dateOfBirth: e.target.value }))}
                    className={fieldClass}
                  />
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-lg font-semibold text-slate-900">Academic details</h2>
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">Step 2</span>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Course</label>
                  <select
                    value={form.courseId}
                    onChange={(e) => setForm((f) => ({ ...f, courseId: e.target.value, branchId: '' }))}
                    className={`${fieldClass} bg-white`}
                  >
                    <option value="">Select course</option>
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Branch</label>
                  <select
                    value={form.branchId}
                    onChange={(e) => setForm((f) => ({ ...f, branchId: e.target.value }))}
                    className={`${fieldClass} bg-white`}
                    disabled={!form.courseId}
                  >
                    <option value="">
                      {!form.courseId ? 'Select course first' : branches.length === 0 ? 'No branches found' : 'Select branch'}
                    </option>
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>{b.name} ({b.code})</option>
                    ))}
                  </select>
                  {form.courseId && branches.length === 0 && (
                    <p className="mt-1 text-xs text-amber-600">Add branches for this course under Admin → Branches, then reload.</p>
                  )}
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Admission year</label>
                  <input
                    type="number"
                    min={2000}
                    max={currentYear + 1}
                    value={form.admissionYear}
                    onChange={(e) => setForm((f) => ({ ...f, admissionYear: e.target.value }))}
                    className={fieldClass}
                    placeholder="YYYY"
                  />
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-lg font-semibold text-slate-900">Contact & address</h2>
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">Step 3</span>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    className={fieldClass}
                    placeholder="optional@example.com"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Phone</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                    className={fieldClass}
                    placeholder="9876543210"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1 block text-sm font-medium text-slate-700">Address</label>
                  <textarea
                    value={form.address}
                    onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                    className={`${fieldClass} min-h-[96px]`}
                    rows={3}
                  />
                </div>
              </div>
            </section>

            {error && <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>}

            <div className="flex flex-wrap items-center gap-3 border-t border-slate-100 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center rounded-xl bg-iimst-orange px-6 py-2.5 text-base font-semibold text-white shadow-sm transition disabled:opacity-60"
              >
                {loading ? 'Saving…' : 'Create student'}
              </button>
              <Link href="/admin/students" className="inline-flex items-center justify-center rounded-xl border border-slate-300 px-5 py-2.5 text-base font-semibold text-slate-700 transition hover:border-slate-400">
                Cancel
              </Link>
            </div>
          </form>

          <aside className="space-y-6 rounded-3xl border border-slate-200 bg-white/70 p-6 shadow-sm">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-500">Workflow tips</p>
              <h3 className="mt-2 text-xl font-semibold text-slate-900">Enrollment logic</h3>
              <p className="mt-2 text-sm text-slate-600">
                When you skip the enrollment number, the system generates a date-based unique value. Provide your own number only if it is confirmed in your offline records.
              </p>
            </div>
            <div className="space-y-2 rounded-2xl bg-slate-900 p-5 text-slate-100">
              <p className="text-sm font-semibold uppercase tracking-wide text-white/70">Default student login</p>
              <p className="text-2xl font-semibold text-white">User ID = Enrollment No</p>
              <p className="text-base text-white/80">Password = Enrollment No</p>
              <p className="text-xs text-white/70">Share credentials securely after creation.</p>
            </div>
            <ul className="space-y-2 text-sm text-slate-600">
              <li>• Keep contact information updated for result notifications.</li>
              <li>• Branches can be managed under Admin → Branches.</li>
              <li>• You can edit the profile later from the student list.</li>
            </ul>
          </aside>
        </div>
      </div>
    </div>
  );
}
