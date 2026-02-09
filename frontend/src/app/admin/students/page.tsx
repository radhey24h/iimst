'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api, type Student, type User } from '@/lib/api';

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<Student[]>('/students?page=1&pageSize=100')
      .then(setStudents)
      .catch(() => setStudents([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Students</h1>
        <Link
          href="/admin/students/new"
          className="bg-iimst-orange hover:bg-iimst-orange-dark text-white px-4 py-2 rounded-lg font-medium"
        >
          Add Student
        </Link>
      </div>
      {loading ? (
        <div className="text-center py-12">Loading...</div>
      ) : students.length === 0 ? (
        <p className="text-gray-500">No students yet. Add a student to create their login (enrollment number = user ID and initial password).</p>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-4 py-3 font-medium text-gray-700">Enrollment</th>
                <th className="px-4 py-3 font-medium text-gray-700">Name</th>
                <th className="px-4 py-3 font-medium text-gray-700">Program</th>
                <th className="px-4 py-3 font-medium text-gray-700">Sem</th>
                <th className="px-4 py-3 font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s.id} className="border-b border-gray-100">
                  <td className="px-4 py-3">{s.enrollmentNo}</td>
                  <td className="px-4 py-3">{s.fullName}</td>
                  <td className="px-4 py-3">{s.program || '-'}</td>
                  <td className="px-4 py-3">{s.currentSemester ?? '-'}</td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/students/${s.id}`} className="text-iimst-orange hover:underline mr-2">
                      Edit
                    </Link>
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
