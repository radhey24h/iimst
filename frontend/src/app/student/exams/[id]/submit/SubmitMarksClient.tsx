'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api, type SubjectExam } from '@/lib/api';

export default function SubmitMarksClient() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [exam, setExam] = useState<SubjectExam | null>(null);
  const [marks, setMarks] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    api<SubjectExam>(`/subjectexams/${id}`)
      .then(setExam)
      .catch(() => setExam(null))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const m = parseFloat(marks);
    if (!exam || isNaN(m) || m < 0 || m > exam.maxMarks) {
      setMessage('Enter valid marks (0 to ' + exam?.maxMarks + ')');
      return;
    }
    setSubmitting(true);
    setMessage('');
    try {
      await api('/examattempts/submit', {
        method: 'POST',
        body: JSON.stringify({ subjectExamId: exam.id, marksObtained: m }),
      });
      router.push('/student/exams');
    } catch (err: unknown) {
      setMessage(err instanceof Error ? err.message : 'Failed to submit');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <div className="text-center py-12">Loading...</div>;
  if (!exam) return <div className="text-center py-12 text-red-600">Exam not found.</div>;

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-xl font-bold text-gray-900 mb-2">Submit Marks</h1>
      <p className="text-gray-600 mb-6">
        {exam.subjectName || exam.subjectCode} — Min passing: {exam.minPassingMarks} / Max: {exam.maxMarks}
      </p>
      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Marks obtained</label>
          <input
            type="number"
            step="0.01"
            min={0}
            max={exam.maxMarks}
            value={marks}
            onChange={(e) => setMarks(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            required
          />
        </div>
        {message && <p className="text-red-600 text-sm">{message}</p>}
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={submitting}
            className="bg-iimst-orange hover:bg-iimst-orange-dark text-white px-4 py-2 rounded-lg font-medium disabled:opacity-50"
          >
            {submitting ? 'Submitting...' : 'Submit'}
          </button>
          <Link href="/student/exams" className="border border-gray-300 px-4 py-2 rounded-lg font-medium">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
