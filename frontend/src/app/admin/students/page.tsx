'use client';

import { useCallback, useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { api, updateStudentStatus, deleteStudent, type Student } from '@/lib/api';

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadStudents = useCallback(() => {
    api<Student[]>('/students?page=1&pageSize=1000')
      .then(setStudents)
      .catch(() => setStudents([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  const filteredStudents = useMemo(() => {
    if (!search.trim()) return students;
    const q = search.trim().toLowerCase();
    return students.filter(
      (s) =>
        s.fullName?.toLowerCase().includes(q) ||
        s.enrollmentNo?.toLowerCase().includes(q) ||
        s.courseName?.toLowerCase().includes(q) ||
        s.branchName?.toLowerCase().includes(q) ||
        s.fatherName?.toLowerCase().includes(q)
    );
  }, [students, search]);

  async function handleToggleStatus(s: Student) {
    const newStatus = (s.status ?? 'Active').toLowerCase() === 'active' ? 'Inactive' : 'Active';
    setUpdatingId(s.id);
    try {
      await updateStudentStatus(s.id, newStatus);
      setStudents((prev) => prev.map((x) => (x.id === s.id ? { ...x, status: newStatus } : x)));
    } catch {
      // keep list as is
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleDelete(s: Student) {
    if (!confirm(`Delete student "${s.fullName}" (${s.enrollmentNo})? This will also delete all their results. This cannot be undone.`)) return;
    setDeletingId(s.id);
    try {
      await deleteStudent(s.id);
      setStudents((prev) => prev.filter((x) => x.id !== s.id));
    } catch {
      // keep list
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
        <h1 className="text-2xl font-bold text-gray-900">Students</h1>
        <div className="flex items-center gap-2 min-w-[200px] max-w-md flex-1">
          <label htmlFor="students-search" className="sr-only">Search students</label>
          <input
            id="students-search"
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, enrollment, course, branch..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-iimst-orange focus:border-transparent"
          />
        </div>
        <Link
          href="/admin/students/new"
          className="bg-iimst-orange hover:bg-iimst-orange-dark text-white px-4 py-2 rounded-lg font-medium whitespace-nowrap"
        >
          Add Student
        </Link>
      </div>
      {loading ? (
        <div className="text-center py-12">Loading...</div>
      ) : students.length === 0 ? (
        <p className="text-gray-500">No students yet. Add a student to create their login (enrollment number = user ID and initial password).</p>
      ) : filteredStudents.length === 0 ? (
        <p className="text-gray-500">No students match your search.</p>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-4 py-3 font-medium text-gray-700">Enrollment</th>
                <th className="px-4 py-3 font-medium text-gray-700">Name</th>
                <th className="px-4 py-3 font-medium text-gray-700">Course</th>
                <th className="px-4 py-3 font-medium text-gray-700">Branch</th>
                <th className="px-4 py-3 font-medium text-gray-700 w-24">Status</th>
                <th className="px-4 py-3 font-medium text-gray-700 whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((s) => {
                const isActive = (s.status ?? 'Active').toLowerCase() === 'active';
                return (
                  <tr key={s.id} className="border-b border-gray-100">
                    <td className="px-4 py-3">{s.enrollmentNo}</td>
                    <td className="px-4 py-3">{s.fullName}</td>
                    <td className="px-4 py-3">{s.courseName || '-'}</td>
                    <td className="px-4 py-3">{s.branchName || '-'}</td>
                    <td className="px-4 py-3">
                      <span className={isActive ? 'text-green-600 font-medium' : 'text-gray-500'}>{isActive ? 'Active' : 'Inactive'}</span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <Link href={`/admin/students/${s.id}`} className="inline-flex p-1.5 text-iimst-orange hover:bg-orange-50 rounded" title="Edit" aria-label="Edit">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(s)}
                        disabled={updatingId === s.id}
                        className="inline-flex p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded disabled:opacity-50"
                        title={isActive ? 'Deactivate' : 'Activate'}
                        aria-label={isActive ? 'Deactivate' : 'Activate'}
                      >
                        {updatingId === s.id ? (
                          <span className="w-5 h-5 flex items-center justify-center text-xs">…</span>
                        ) : isActive ? (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(s)}
                        disabled={deletingId === s.id}
                        className="inline-flex p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded disabled:opacity-50"
                        title="Delete"
                        aria-label="Delete"
                      >
                        {deletingId === s.id ? (
                          <span className="w-5 h-5 flex items-center justify-center text-xs">…</span>
                        ) : (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        )}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
