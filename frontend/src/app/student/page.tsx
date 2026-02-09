'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api, type Student } from '@/lib/api';

export default function StudentDashboard() {
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  useEffect(() => {
    api<Student>('/students/by-user')
      .then(setStudent)
      .catch((e) => setErr(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-12">Loading...</div>;
  if (err || !student) return <div className="text-center py-12 text-red-600">{err || 'Student profile not found.'}</div>;

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      <div className="grid md:grid-cols-3 gap-6">
        <Link
          href="/student/id-card"
          className="bg-white rounded-xl border border-gray-200 p-6 hover:border-iimst-orange hover:shadow-md transition"
        >
          <span className="text-3xl">🪪</span>
          <h2 className="font-semibold text-gray-900 mt-2">ID Card</h2>
          <p className="text-sm text-gray-500">View your student ID card</p>
        </Link>
        <Link
          href="/student/results"
          className="bg-white rounded-xl border border-gray-200 p-6 hover:border-iimst-orange hover:shadow-md transition"
        >
          <span className="text-3xl">📋</span>
          <h2 className="font-semibold text-gray-900 mt-2">Results</h2>
          <p className="text-sm text-gray-500">Semester-wise results</p>
        </Link>
        <Link
          href="/student/exams"
          className="bg-white rounded-xl border border-gray-200 p-6 hover:border-iimst-orange hover:shadow-md transition"
        >
          <span className="text-3xl">📝</span>
          <h2 className="font-semibold text-gray-900 mt-2">Exams</h2>
          <p className="text-sm text-gray-500">Subject-wise exams</p>
        </Link>
      </div>
    </div>
  );
}
