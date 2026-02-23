'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { api, updateStudent, type Student } from '@/lib/api';
import { resizeImageToDataUrl } from '@/lib/imageUtils';

export default function StudentProfilePage() {
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    api<Student>('/students/by-user')
      .then(setStudent)
      .catch(() => setStudent(null))
      .finally(() => setLoading(false));
  }, []);

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !student) return;
    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'Please choose an image file (e.g. JPG, PNG).' });
      return;
    }
    setMessage(null);
    setUploading(true);
    try {
      const dataUrl = await resizeImageToDataUrl(file);
      const updated = await updateStudent(student.id, { photoUrl: dataUrl });
      setStudent(updated);
      setMessage({ type: 'success', text: 'Photo updated. It will appear on your ID card too.' });
    } catch (err) {
      setMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to update photo.',
      });
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }

  if (loading) return <div className="text-center py-12">Loading...</div>;
  if (!student) return <div className="text-center py-12 text-red-600">Could not load profile.</div>;

  return (
    <div className="max-w-2xl space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/student" className="text-gray-600 hover:text-gray-900">← Dashboard</Link>
        <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Profile photo</h2>
          <p className="text-sm text-gray-500 mb-4">
            This photo is used on your student ID card. Upload a clear, recent photo.
          </p>
          <div className="flex flex-wrap items-start gap-6">
            <div className="flex-shrink-0">
              {student.photoUrl ? (
                <img
                  src={student.photoUrl}
                  alt=""
                  className="w-28 h-28 rounded-xl object-cover border border-gray-200"
                />
              ) : (
                <div className="w-28 h-28 rounded-xl bg-gray-200 flex items-center justify-center text-4xl text-gray-400">
                  👤
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handlePhotoChange}
                className="hidden"
                aria-label="Upload photo"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="bg-iimst-orange hover:bg-iimst-orange-dark text-white px-4 py-2.5 rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {uploading ? 'Uploading...' : student.photoUrl ? 'Change photo' : 'Upload photo'}
              </button>
              {message && (
                <p
                  className={`mt-3 text-sm ${message.type === 'success' ? 'text-green-700' : 'text-red-600'}`}
                >
                  {message.text}
                </p>
              )}
            </div>
          </div>
        </div>
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 text-sm text-gray-600">
          <p className="font-medium text-gray-700 mb-1">Other details</p>
          <p><span className="text-gray-500">Name:</span> {student.fullName}</p>
          <p><span className="text-gray-500">Enrollment:</span> {student.enrollmentNo}</p>
          {student.courseName && <p><span className="text-gray-500">Course:</span> {student.courseName}</p>}
          {student.branchName && <p><span className="text-gray-500">Branch:</span> {student.branchName}</p>}
        </div>
      </div>

      <p className="text-sm text-gray-500">
        <Link href="/student/id-card" className="text-iimst-orange hover:underline">View / download your ID card</Link> to see your photo on the card.
      </p>
    </div>
  );
}
