'use client';

import { useEffect, useState } from 'react';
import { api, type Enquiry } from '@/lib/api';

function formatDate(createdAt: string) {
  try {
    return new Date(createdAt).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return createdAt;
  }
}

export default function AdminEnquiriesPage() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api<Enquiry[]>('/enquiries')
      .then(setEnquiries)
      .catch((e) => {
        setError(e instanceof Error ? e.message : 'Failed to load enquiries');
        setEnquiries([]);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-12">Loading...</div>;
  if (error) return <div className="text-center py-12 text-red-600">{error}</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Enquiries</h1>
      <p className="text-gray-600 mb-6">
        Enquiries submitted by students or visitors from the home page and contact form.
      </p>
      {enquiries.length === 0 ? (
        <p className="text-gray-500">No enquiries yet.</p>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
          <table className="w-full text-left min-w-[640px]">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-4 py-3 font-medium text-gray-700">Date</th>
                <th className="px-4 py-3 font-medium text-gray-700">Name</th>
                <th className="px-4 py-3 font-medium text-gray-700">Email</th>
                <th className="px-4 py-3 font-medium text-gray-700">Phone</th>
                <th className="px-4 py-3 font-medium text-gray-700">Course interest</th>
                <th className="px-4 py-3 font-medium text-gray-700">Message</th>
              </tr>
            </thead>
            <tbody>
              {enquiries.map((e) => (
                <tr key={e.id} className="border-b border-gray-100">
                  <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{formatDate(e.createdAt)}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{e.name}</td>
                  <td className="px-4 py-3">
                    <a href={`mailto:${e.email}`} className="text-iimst-orange hover:underline">
                      {e.email}
                    </a>
                  </td>
                  <td className="px-4 py-3">{e.phone || '—'}</td>
                  <td className="px-4 py-3">{e.courseInterest || '—'}</td>
                  <td className="px-4 py-3 text-gray-700 max-w-xs truncate" title={e.message || ''}>
                    {e.message || '—'}
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
