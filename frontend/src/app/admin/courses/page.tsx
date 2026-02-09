'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api, type Course } from '@/lib/api';

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<Course[]>('/courses')
      .then(setCourses)
      .catch(() => setCourses([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Courses</h1>
        <Link href="/admin/courses/new" className="bg-iimst-orange hover:bg-iimst-orange-dark text-white px-4 py-2 rounded-lg font-medium">
          Add Course
        </Link>
      </div>
      {loading ? (
        <div className="text-center py-12">Loading...</div>
      ) : courses.length === 0 ? (
        <p className="text-gray-500">No courses yet. Add a course (e.g. Bachelor Programme, Diploma) then assign to students and subjects.</p>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-4 py-3 font-medium text-gray-700">Name</th>
                <th className="px-4 py-3 font-medium text-gray-700">Max semester</th>
                <th className="px-4 py-3 font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((c) => (
                <tr key={c.id} className="border-b border-gray-100">
                  <td className="px-4 py-3">{c.name}</td>
                  <td className="px-4 py-3">{c.maxSemester} (Diploma: 6, Bachelor: 8)</td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/courses/${c.id}`} className="text-iimst-orange hover:underline">Edit</Link>
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
