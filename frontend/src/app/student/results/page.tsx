'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  api,
  getMarksCard,
  getSemestersWithResults,
  type MarksCard,
  type Student,
} from '@/lib/api';
import { digitsToWords } from '@/lib/numberWords';
import { toRoman } from '@/lib/roman';

function formatDob(dob: string | undefined): string {
  if (!dob) return '—';
  try {
    const d = new Date(dob);
    if (Number.isNaN(d.getTime())) return dob;
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  } catch {
    return dob;
  }
}

export default function StudentResultsPage() {
  const [student, setStudent] = useState<Student | null>(null);
  const [semesters, setSemesters] = useState<number[]>([]);
  const [selectedSemester, setSelectedSemester] = useState<number | ''>('');
  const [marksCard, setMarksCard] = useState<MarksCard | null>(null);
  const [loading, setLoading] = useState(true);
  const [cardLoading, setCardLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api<Student>('/students/by-user')
      .then(async (s) => {
        setStudent(s);
        const list = await getSemestersWithResults(s.id);
        setSemesters(list);
      })
      .catch(() => setStudent(null))
      .finally(() => setLoading(false));
  }, []);

  const fetchMarksCard = useCallback(async (studentId: string, semester: number) => {
    setCardLoading(true);
    setError(null);
    try {
      const card = await getMarksCard(studentId, semester);
      setMarksCard(card);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load marks card.');
      setMarksCard(null);
    } finally {
      setCardLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!student || selectedSemester === '') {
      setMarksCard(null);
      return;
    }
    fetchMarksCard(student.id, selectedSemester as number);
  }, [student, selectedSemester, fetchMarksCard]);

  function handleRefresh() {
    if (student && selectedSemester !== '') fetchMarksCard(student.id, selectedSemester as number);
  }

  if (loading) return <div className="text-center py-12">Loading...</div>;
  if (!student) return <div className="text-center py-12 text-red-600">Could not load data.</div>;

  return (
    <div className="space-y-6">
      {/* Header: name (left) + semester dropdown (right) */}
      <header className="flex flex-wrap items-center justify-between gap-4 bg-white rounded-xl border border-gray-200 px-5 py-4 shadow-sm">
        <h1 className="text-xl font-bold text-gray-900">{student.fullName}</h1>
        <div className="flex items-center gap-3">
          <label htmlFor="results-semester" className="text-sm font-medium text-gray-700 whitespace-nowrap">Semester</label>
          <select
            id="results-semester"
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(e.target.value === '' ? '' : Number(e.target.value))}
            className="rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500 min-w-[140px]"
          >
            <option value="">Select semester</option>
            {semesters.map((s) => (
              <option key={s} value={s}>
                Semester {toRoman(s)}
              </option>
            ))}
          </select>
          {selectedSemester !== '' && (
            <button
              type="button"
              onClick={handleRefresh}
              disabled={cardLoading}
              className="text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-3 py-2 rounded-md disabled:opacity-50"
              title="Refresh result (load latest from server)"
            >
              {cardLoading ? 'Loading…' : 'Refresh'}
            </button>
          )}
        </div>
      </header>

      {/* Result appears after selecting semester */}
      {selectedSemester === '' || semesters.length === 0 ? (
        <p className="text-gray-500">Select a semester to view the result.</p>
      ) : cardLoading ? (
        <div className="text-center py-12 text-gray-500">Loading...</div>
      ) : error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">{error}</div>
      ) : marksCard ? (
        <MarksCardView card={marksCard} year={new Date().getFullYear()} />
      ) : null}
    </div>
  );
}

function MarksCardView({ card, year }: { card: MarksCard; year: number }) {
  return (
    <div className="bg-[#faf8f5] border-2 border-amber-700/30 rounded-lg overflow-hidden shadow-md print:shadow-none print:border-black">
      {/* Header */}
      <div className="border-b-2 border-amber-700/30 px-6 py-4 flex items-center gap-4">
        <div className="w-14 h-14 rounded-full border-2 border-amber-700 flex items-center justify-center bg-amber-50 shrink-0">
          <span className="text-amber-800 font-bold text-sm">IIMST</span>
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-900">Infinity Institute Of Management Science &amp; Technology</h2>
          <p className="text-gray-700 font-medium">Result-cum-Detailed Marks Card {year}</p>
        </div>
      </div>

      <div className="px-6 py-5 space-y-4">
        {/* Student & exam details on card */}
        <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-sm text-gray-800">
          <div><span className="text-gray-500">Name:</span> <span className="font-medium uppercase">{card.studentName}</span></div>
          <div><span className="text-gray-500">Father&apos;s/Husband&apos;s Name:</span> <span className="font-medium">{card.fatherName ?? '—'}</span></div>
          <div><span className="text-gray-500">Course in Branch:</span> <span className="font-medium">{card.courseName && card.branchName ? `${card.courseName} - ${card.branchName}` : (card.courseName ?? card.branchName ?? '—')}</span></div>
          <div><span className="text-gray-500">Date of Birth:</span> <span className="font-medium">{card.dateOfBirth ? formatDob(card.dateOfBirth) : '—'}</span></div>
          <div><span className="text-gray-500">Enrollment No.:</span> <span className="font-medium">{card.enrollmentNo}</span></div>
          <div><span className="text-gray-500">Semester:</span> <span className="font-medium">{card.semesterRoman}</span></div>
        </div>

        {/* Table: all headers no-wrap; all subjects for selected semester */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b-2 border-amber-800/40 bg-amber-50/60">
                <th className="text-left py-2 px-2 font-semibold text-gray-800 w-12 whitespace-nowrap">S. No.</th>
                <th className="text-left py-2 px-2 font-semibold text-gray-800 whitespace-nowrap">Subject</th>
                <th className="text-right py-2 px-2 font-semibold text-gray-800 w-24 whitespace-nowrap">Maximum Marks</th>
                <th className="text-right py-2 px-2 font-semibold text-gray-800 w-24 whitespace-nowrap">Pass Marks</th>
                <th className="text-right py-2 px-2 font-semibold text-gray-800 w-24 whitespace-nowrap">Marks Secured</th>
                <th className="text-left py-2 px-2 font-semibold text-gray-800 min-w-[120px] whitespace-nowrap">Total (In Words)</th>
              </tr>
            </thead>
            <tbody>
              {card.rows.map((row, idx) => (
                <tr key={idx} className="border-b border-amber-900/20">
                  <td className="py-2 px-2 text-gray-700">{idx + 1}</td>
                  <td className="py-2 px-2 text-gray-800">{row.subjectName}</td>
                  <td className="py-2 px-2 text-right text-gray-700">{row.maximumMarks}</td>
                  <td className="py-2 px-2 text-right text-gray-700">{row.passMarks}</td>
                  <td className="py-2 px-2 text-right text-gray-700">{row.marksSecured}</td>
                  <td className="py-2 px-2 text-gray-700">{digitsToWords(row.marksSecured)}</td>
                </tr>
              ))}
              <tr className="border-t-2 border-amber-800/40 bg-amber-50/40 font-medium">
                <td colSpan={2} className="py-2 px-2 text-gray-800">Total</td>
                <td className="py-2 px-2 text-right text-gray-800">{card.totalMaximumMarks}</td>
                <td className="py-2 px-2 text-right text-gray-800">{card.totalPassMarks}</td>
                <td className="py-2 px-2 text-right text-gray-800">{card.totalMarksSecured}</td>
                <td className="py-2 px-2 text-gray-800">{digitsToWords(card.totalMarksSecured)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="text-gray-800 font-medium">
          Total Marks Secured in words: <span className="font-semibold">{digitsToWords(card.totalMarksSecured)}</span>
        </p>
        <p className="text-gray-800 font-semibold">RESULT: {card.resultStatus}</p>

        {/* Abbreviations */}
        <div className="text-xs text-gray-600 pt-2 border-t border-amber-900/20">
          <span className="font-medium">Abbreviations:</span> GM = Grace Marks; RI = Result Incomplete; P = Passed in Subject; F = Failed; A = Absent
        </div>

        {/* Signatures */}
        <div className="grid grid-cols-3 gap-4 pt-6 text-sm">
          <div>
            <div className="border-b border-gray-400 w-32 mb-1" />
            <span className="text-gray-600">Prepared by</span>
          </div>
          <div>
            <div className="border-b border-gray-400 w-32 mb-1" />
            <span className="text-gray-600">Checked by</span>
          </div>
          <div>
            <div className="border-b border-gray-400 w-40 mb-1" />
            <span className="text-gray-600">Controller of Examinations</span>
          </div>
        </div>
        <p className="text-xs text-gray-500 pt-2">Dated {new Date().toLocaleString('en-IN', { month: 'short', year: 'numeric' }).toUpperCase()}</p>
      </div>
    </div>
  );
}
