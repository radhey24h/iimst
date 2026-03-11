'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api, getBranchesByCourse, type Student, type Course, type Branch } from '@/lib/api';
import { resizeImageToDataUrl } from '@/lib/imageUtils';

export default function EditStudentClient() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [student, setStudent] = useState<Student | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [photoUrl, setPhotoUrl] = useState<string>('');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoMessage, setPhotoMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
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
    api<Student>(`/students/${id}`)
      .then((s) => {
        setStudent(s);
        setPhotoUrl(s.photoUrl || '');
        const dob = s.dob ?? s.dateOfBirth;
        setForm({
          fullName: s.fullName,
          fatherName: s.fatherName || '',
          dateOfBirth: dob ? (typeof dob === 'string' ? dob.slice(0, 10) : new Date(dob).toISOString().slice(0, 10)) : '',
          email: s.email ?? s.emailId ?? '',
          courseId: s.courseId || '',
          branchId: s.branchId || '',
          admissionYear: s.admissionYear?.toString() || '',
          phone: s.phone ?? s.phoneNumber ?? '',
          address: s.address || '',
        });
      })
      .catch(() => setStudent(null))
      .finally(() => setLoading(false));
  }, [id]);

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setPhotoMessage({ type: 'error', text: 'Please choose an image file (JPG, PNG, WEBP).' });
      return;
    }
    setPhotoMessage(null);
    setUploadingPhoto(true);
    try {
      const dataUrl = await resizeImageToDataUrl(file);
      await api(`/students/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ photoUrl: dataUrl }),
      });
      setPhotoUrl(dataUrl);
      setPhotoMessage({ type: 'success', text: 'Photo uploaded successfully!' });
    } catch (err) {
      setPhotoMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to upload photo.',
      });
    } finally {
      setUploadingPhoto(false);
      e.target.value = '';
    }
  }

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
          dob: form.dateOfBirth || undefined,
          emailId: form.email || undefined,
          courseId: form.courseId || undefined,
          branchId: form.branchId || undefined,
          admissionYear: form.admissionYear ? parseInt(form.admissionYear, 10) : undefined,
          phoneNumber: form.phone || undefined,
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
    <div className="max-w-7xl">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/students" className="text-gray-600 hover:text-gray-900">← Back to Students</Link>
        <h1 className="text-3xl font-bold text-gray-900">Edit Student — {student.enrollmentNo}</h1>
      </div>
      
      {/* Photo Upload Section */}
      <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm mb-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-xl">📸</span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Student Photo</h2>
            <p className="text-sm text-gray-500">Upload a clear, recent photo for the student's ID card</p>
          </div>
        </div>
        <div className="flex flex-wrap items-start gap-8">
          <div className="flex-shrink-0">
            {photoUrl ? (
              <img
                src={photoUrl}
                alt="Student"
                className="w-40 h-40 rounded-2xl object-cover border-2 border-gray-200 shadow-lg"
              />
            ) : (
              <div className="w-40 h-40 rounded-2xl bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-6xl text-gray-400 shadow-lg border-2 border-gray-200">
                👤
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0 pt-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handlePhotoChange}
              className="hidden"
              aria-label="Upload student photo"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingPhoto}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md hover:shadow-lg"
            >
              {uploadingPhoto ? 'Uploading...' : photoUrl ? 'Change Photo' : 'Upload Photo'}
            </button>
            {photoMessage && (
              <p
                className={`mt-4 text-sm font-medium ${photoMessage.type === 'success' ? 'text-green-700' : 'text-red-600'}`}
              >
                {photoMessage.text}
              </p>
            )}
            <p className="text-sm text-gray-500 mt-3">
              💡 <strong>Tip:</strong> Use a clear headshot with good lighting. Image will be resized to 400x400px.
            </p>
          </div>
        </div>
      </div>

      {/* Student Details Form - Two Sections */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Personal Information Section */}
          <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-xl">👤</span>
              </div>
              <h2 className="text-xl font-bold text-gray-900">Personal Information</h2>
            </div>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name *</label>
                <input
                  value={form.fullName}
                  onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder="Enter full name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Father's Name</label>
                <input
                  value={form.fatherName}
                  onChange={(e) => setForm((f) => ({ ...f, fatherName: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder="Enter father's name"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Date of Birth</label>
                <input
                  type="date"
                  value={form.dateOfBirth}
                  onChange={(e) => setForm((f) => ({ ...f, dateOfBirth: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder="student@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Phone</label>
                <input
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder="+91 XXXXXXXXXX"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Address</label>
                <textarea
                  value={form.address}
                  onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  rows={3}
                  placeholder="Enter full address"
                />
              </div>
            </div>
          </div>

          {/* Academic Information Section */}
          <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                <span className="text-xl">🎓</span>
              </div>
              <h2 className="text-xl font-bold text-gray-900">Academic Information</h2>
            </div>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Course</label>
                <select
                  value={form.courseId}
                  onChange={(e) => setForm((f) => ({ ...f, courseId: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                >
                  <option value="">Select Course</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Branch</label>
                <select
                  value={form.branchId}
                  onChange={(e) => setForm((f) => ({ ...f, branchId: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                >
                  <option value="">Select Branch</option>
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>{b.name} ({b.code})</option>
                  ))}
                </select>
                {!form.courseId && (
                  <p className="text-xs text-gray-500 mt-2">ℹ️ Select a course first to see available branches</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Admission Year</label>
                <input
                  type="number"
                  min={2000}
                  max={2030}
                  value={form.admissionYear}
                  onChange={(e) => setForm((f) => ({ ...f, admissionYear: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                  placeholder="e.g., 2024"
                />
              </div>
              
              {/* Summary Info Box */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Student Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Enrollment No:</span>
                    <span className="font-semibold text-gray-900">{student.enrollmentNo}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className={`font-semibold ${student.status?.toLowerCase() === 'active' ? 'text-green-600' : 'text-gray-500'}`}>
                      {student.status || 'Active'}
                    </span>
                  </div>
                  {student.createdAt && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Created:</span>
                      <span className="text-gray-900">{new Date(student.createdAt).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm font-medium">⚠️ {error}</p>
            </div>
          )}
          <div className="flex items-center gap-4">
            <button 
              type="submit" 
              disabled={saving} 
              className="bg-iimst-orange hover:bg-iimst-orange-dark text-white px-8 py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
            >
              {saving ? 'Saving Changes...' : 'Save Changes'}
            </button>
            <Link 
              href="/admin/students" 
              className="border-2 border-gray-300 hover:border-gray-400 px-8 py-3 rounded-lg font-semibold text-gray-700 hover:text-gray-900 transition-all"
            >
              Cancel
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
}
