'use client';

import { useCallback, useEffect, useState } from 'react';
import { api, getStudentsPaginated, type Student, type Course } from '@/lib/api';

const PAGE_SIZE = 20;

function openEntryInNewWindow(studentId: string) {
  const url = `${typeof window !== 'undefined' ? window.location.origin : ''}/admin/results/entry?studentId=${encodeURIComponent(studentId)}`;
  window.open(url, '_blank', 'noopener,noreferrer');
}

export default function AdminResultsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [courseFilter, setCourseFilter] = useState('');

  const loadPage = useCallback(async (pageNum: number, searchTerm: string, courseId: string) => {
    setLoading(true);
    try {
      const { students: list, total: totalCount } = await getStudentsPaginated(
        pageNum,
        PAGE_SIZE,
        searchTerm || undefined,
        courseId || undefined
      );
      setStudents(list);
      setTotal(totalCount);
    } catch {
      setStudents([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setPage(1);
    loadPage(1, search, courseFilter);
  }, [courseFilter]);

  useEffect(() => {
    api<Course[]>('/courses')
      .then(setCourses)
      .catch(() => setCourses([]));
  }, []);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);

  const handleSearch = () => {
    setPage(1);
    loadPage(1, search, courseFilter);
  };

  const handlePageChange = (newPage: number) => {
    const p = Math.max(1, Math.min(newPage, totalPages));
    setPage(p);
    loadPage(p, search, courseFilter);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h1 className="text-2xl font-bold text-gray-900">Results</h1>
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-iimst-orange focus:border-transparent text-sm"
          >
            <option value="">All courses</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <div className="min-w-[200px] max-w-xs flex-1 flex gap-2">
            <label htmlFor="results-search" className="sr-only">Search students</label>
            <input
              id="results-search"
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Name or enrollment..."
              className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-iimst-orange focus:border-transparent text-sm"
            />
            <button
              type="button"
              onClick={handleSearch}
              className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium text-gray-700 text-sm"
            >
              Search
            </button>
          </div>
        </div>
      </div>

      <section>
        <p className="text-sm text-gray-500 mb-4">
          Click a row to open <strong>Enter / update results</strong> in a new window. This keeps the list manageable when many students are present.
        </p>
        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading...</div>
        ) : students.length === 0 ? (
          <p className="text-gray-500">No students found.</p>
        ) : (
          <>
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
              <table className="w-full text-left min-w-[500px]">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50/80">
                    <th className="px-5 py-3.5 font-medium text-gray-700">Enrollment</th>
                    <th className="px-5 py-3.5 font-medium text-gray-700">Name</th>
                    <th className="px-5 py-3.5 font-medium text-gray-700">Course</th>
                    <th className="px-5 py-3.5 font-medium text-gray-700">Branch</th>
                    <th className="px-5 py-3.5 font-medium text-gray-700 w-20 text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((s) => (
                    <tr
                      key={s.id}
                      onClick={() => openEntryInNewWindow(s.id)}
                      className="border-b border-gray-100 transition-colors cursor-pointer hover:bg-gray-50"
                    >
                      <td className="px-5 py-3.5">{s.enrollmentNo}</td>
                      <td className="px-5 py-3.5 font-medium text-gray-900">{s.fullName}</td>
                      <td className="px-5 py-3.5 text-gray-600">{s.courseName || '—'}</td>
                      <td className="px-5 py-3.5 text-gray-600">{s.branchName || '—'}</td>
                      <td className="px-5 py-3.5 text-center">
                        <span className="text-iimst-orange text-sm font-medium">Open →</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 px-1">
                <p className="text-sm text-gray-500">
                  Showing {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, total)} of {total}
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage <= 1}
                    className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  <span className="px-3 py-1.5 text-sm text-gray-600">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    type="button"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages}
                    className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
