'use client';

import { useEffect, useState } from 'react';
import { api, type Student, type Result, type MarksCard } from '@/lib/api';

function MarksCardView({ card }: { card: MarksCard }) {
  const dob = card.dateOfBirth ? new Date(card.dateOfBirth).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '';

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm print:shadow-none">
      <div className="p-6 border-b border-gray-100">
        <h2 className="text-center font-bold text-gray-900 text-lg">Infinity Institute Of Management Science & Technology</h2>
        <p className="text-center text-gray-600 text-sm mt-1">Result-cum-Detailed Marks Card</p>
      </div>
      <div className="px-6 py-4 grid grid-cols-2 gap-x-8 gap-y-1 text-sm">
        <div><span className="text-gray-500">Student Name:</span> <span className="font-medium">{card.studentName}</span></div>
        <div><span className="text-gray-500">Enrollment No.:</span> <span className="font-medium">{card.enrollmentNo}</span></div>
        {card.fatherName && <div><span className="text-gray-500">Father&apos;s / Husband&apos;s Name:</span> <span className="font-medium">{card.fatherName}</span></div>}
        {dob && <div><span className="text-gray-500">Date of Birth:</span> <span className="font-medium">{dob}</span></div>}
        <div className="col-span-2"><span className="text-gray-500">Name of Examination (Course):</span> <span className="font-medium">{card.courseName || '—'}</span></div>
        <div><span className="text-gray-500">Semester:</span> <span className="font-medium">{card.semesterRoman}</span></div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-y border-gray-200 bg-gray-50">
              <th className="px-4 py-2 font-medium text-gray-700 w-12">S. No.</th>
              <th className="px-4 py-2 font-medium text-gray-700">Subject</th>
              <th className="px-4 py-2 font-medium text-gray-700 w-24 text-right">Maximum Marks</th>
              <th className="px-4 py-2 font-medium text-gray-700 w-24 text-right">Pass Marks</th>
              <th className="px-4 py-2 font-medium text-gray-700 w-28 text-right">Marks Secured</th>
            </tr>
          </thead>
          <tbody>
            {card.rows.map((row, idx) => (
              <tr key={idx} className="border-b border-gray-100">
                <td className="px-4 py-2">{idx + 1}</td>
                <td className="px-4 py-2">{row.subjectName}</td>
                <td className="px-4 py-2 text-right">{row.maximumMarks}</td>
                <td className="px-4 py-2 text-right">{row.passMarks}</td>
                <td className="px-4 py-2 text-right">{row.marksSecured}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-6 py-4 border-t border-gray-200 space-y-1 text-sm">
        <div className="flex justify-between max-w-xs ml-auto">
          <span className="text-gray-600">Total Maximum Marks:</span>
          <span className="font-medium">{card.totalMaximumMarks}</span>
        </div>
        <div className="flex justify-between max-w-xs ml-auto">
          <span className="text-gray-600">Total Pass Marks:</span>
          <span className="font-medium">{card.totalPassMarks}</span>
        </div>
        <div className="flex justify-between max-w-xs ml-auto">
          <span className="text-gray-600">Total Marks Secured:</span>
          <span className="font-medium">{card.totalMarksSecured}</span>
        </div>
        <p className="mt-3 font-semibold text-gray-900">RESULT: {card.resultStatus}</p>
      </div>
      <p className="px-6 pb-4 text-xs text-gray-500">GM = Grace Marks &nbsp; RI = Result Incomplete &nbsp; P = Passed &nbsp; F = Failed &nbsp; A = Absent</p>
    </div>
  );
}

export default function StudentResultsPage() {
  const [student, setStudent] = useState<Student | null>(null);
  const [results, setResults] = useState<Result[]>([]);
  const [marksCards, setMarksCards] = useState<Record<number, MarksCard>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<Student>('/students/by-user')
      .then(async (s) => {
        setStudent(s);
        const r = await api<Result[]>(`/results/student/${s.id}`);
        setResults(r);
        const semesters = [...new Set(r.map((x) => x.semester))].sort((a, b) => a - b);
        const cards = await Promise.all(
          semesters.map((sem) =>
            api<MarksCard>(`/results/student/${s.id}/marks-card?semester=${sem}`).catch(() => null)
          )
        );
        const bySem: Record<number, MarksCard> = {};
        semesters.forEach((sem, i) => {
          if (cards[i]) bySem[sem] = cards[i]!;
        });
        setMarksCards(bySem);
      })
      .catch(() => setStudent(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-12">Loading...</div>;
  if (!student) return <div className="text-center py-12 text-red-600">Could not load data.</div>;

  const semesters = [...new Set(results.map((r) => r.semester))].sort((a, b) => a - b);
  const roman = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'] as const;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Semester-wise Results</h1>
      {semesters.length === 0 ? (
        <p className="text-gray-500">No results available yet.</p>
      ) : (
        <div className="space-y-8">
          {semesters.map((sem) => (
            <div key={sem}>
              <h2 className="text-lg font-semibold text-iimst-orange-dark mb-3">Semester {roman[sem] || sem}</h2>
              {marksCards[sem] ? (
                <MarksCardView card={marksCards[sem]} />
              ) : (
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <p className="text-gray-500">Loading marks card...</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
