'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api, type Student } from '@/lib/api';

export default function StudentProfilePage() {
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<Student>('/students/by-user')
      .then(setStudent)
      .catch(() => setStudent(null))
      .finally(() => setLoading(false));
  }, []);

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
            This photo is used on your student ID card. Contact admin if you need to update your photo.
          </p>
          <div className="flex items-center gap-6">
            <div className="flex-shrink-0">
              {student.photoUrl ? (
                <img
                  src={student.photoUrl}
                  alt="Profile"
                  className="w-32 h-32 rounded-xl object-cover border-2 border-gray-200 shadow-md"
                />
              ) : (
                <div className="w-32 h-32 rounded-xl bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-5xl text-gray-400 shadow-md">
                  👤
                </div>
              )}
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-600">
                {student.photoUrl 
                  ? 'Your photo has been uploaded by the administrator.' 
                  : 'No photo uploaded yet. Please contact the administrator to upload your photo.'}
              </p>
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
