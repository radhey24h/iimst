'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { api, type Student } from '@/lib/api';

export default function IdCardPage() {
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
    <div className="max-w-md mx-auto">
      <h1 className="text-xl font-bold text-gray-900 mb-6">Student ID Card</h1>
      <div className="bg-white rounded-2xl border-2 border-iimst-orange shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-iimst-orange to-iimst-orange-dark text-white p-4 text-center">
          <p className="text-sm font-medium opacity-90">Infinity Institute of Management Science & Technology</p>
          <p className="text-lg font-bold">IIMST</p>
        </div>
        <div className="p-6 flex gap-4">
          <div className="flex-shrink-0">
            {student.photoUrl ? (
              <img src={student.photoUrl} alt="" className="w-24 h-24 rounded-lg object-cover" />
            ) : (
              <div className="w-24 h-24 rounded-lg bg-gray-200 flex items-center justify-center text-3xl text-gray-400">👤</div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-gray-900 text-lg">{student.fullName}</p>
            <p className="text-sm text-gray-600">Enrollment: {student.enrollmentNo}</p>
            {student.program && <p className="text-sm text-gray-600">{student.program}</p>}
            {student.branch && <p className="text-sm text-gray-600">{student.branch}</p>}
            {student.currentSemester && <p className="text-sm text-gray-600">Semester: {student.currentSemester}</p>}
          </div>
        </div>
        <div className="px-6 pb-6 flex justify-between items-center">
          <Image src="/iimst_logo.jpg" alt="IIMST" width={48} height={48} className="rounded-full object-cover" />
          <p className="text-xs text-gray-500">iimst.co.in</p>
        </div>
      </div>
    </div>
  );
}
