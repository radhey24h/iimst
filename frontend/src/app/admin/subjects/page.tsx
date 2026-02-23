'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api, type Subject } from '@/lib/api';

export default function AdminSubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<Subject[]>('/subjects')
      .then(setSubjects)
      .catch(() => setSubjects([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Subjects</h1>
        <Link href="/admin/subjects/new" className="bg-iimst-orange hover:bg-iimst-orange-dark text-white px-4 py-2 rounded-lg font-medium">
          Add Subject
        </Link>
      </div>
      {loading ? (
        <div className="text-center py-12">Loading...</div>
      ) : subjects.length === 0 ? (
        <p className="text-gray-500">No subjects yet.</p>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-4 py-3 font-medium text-gray-700">Course</th>
                <th className="px-4 py-3 font-medium text-gray-700">Branch</th>
                <th className="px-4 py-3 font-medium text-gray-700">Code</th>
                <th className="px-4 py-3 font-medium text-gray-700">Name</th>
                <th className="px-4 py-3 font-medium text-gray-700">Sem</th>
                <th className="px-4 py-3 font-medium text-gray-700">Pass / Max</th>
                <th className="px-4 py-3 font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {subjects.map((s) => (
                <tr key={s.id} className="border-b border-gray-100">
                  <td className="px-4 py-3">{s.courseName || '-'}</td>
                  <td className="px-4 py-3">{s.branchName || '-'}</td>
                  <td className="px-4 py-3">{s.code}</td>
                  <td className="px-4 py-3">{s.name}</td>
                  <td className="px-4 py-3">{s.semester ?? '-'}</td>
                  <td className="px-4 py-3">{s.minPassMarks} / {s.maxMarks}</td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/subjects/${s.id}`} className="text-iimst-orange hover:underline">Edit</Link>
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
