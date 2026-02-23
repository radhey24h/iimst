'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import logo from '@/assets/logo/iimst_logo.jpg';
import { api, type Student } from '@/lib/api';

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

function formatSession(admissionYear: number | undefined, durationYears?: number): string {
  if (admissionYear == null) return '—';
  const end = durationYears ? admissionYear + durationYears : admissionYear + 3;
  return `${admissionYear} TO ${end}`;
}

export default function IdCardPage() {
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<Student>('/students/by-user')
      .then(setStudent)
      .catch(() => setStudent(null))
      .finally(() => setLoading(false));
  }, []);

  function handlePrint() {
    window.print();
  }

  if (loading) return <div className="text-center py-12">Loading...</div>;
  if (!student) return <div className="text-center py-12 text-red-600">Could not load profile.</div>;

  const dob = formatDob(student.dateOfBirth ?? student.dob);
  const session = formatSession(student.admissionYear);
  const courseDisplay = student.courseName && student.branchName
    ? `${student.courseName} - ${student.branchName}`
    : (student.courseName || student.branchName || '—');

  return (
    <div className="max-w-lg mx-auto">
      <style jsx global>{`
        @media print {
          body * { visibility: hidden; }
          .id-card-print-area,
          .id-card-print-area * { visibility: visible; }
          .id-card-print-area { position: absolute; left: 0; top: 0; width: 100%; }
          .no-print { display: none !important; }
          /* Preserve header and other background colors when printing */
          .id-card-print-area,
          .id-card-print-area * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>
      <div className="no-print flex items-center justify-between gap-4 mb-6">
        <h1 className="text-xl font-bold text-gray-900">Student ID Card</h1>
        <button
          type="button"
          onClick={handlePrint}
          className="bg-iimst-orange hover:bg-iimst-orange-dark text-white px-4 py-2.5 rounded-xl font-medium"
        >
          Download / Print ID card
        </button>
      </div>

      {/* ID card matching attachment: orange header (logo left, name right), white body (photo left, details right), stamp/signature over photo bottom */}
      <div className="id-card-print-area bg-white rounded-xl border-2 border-amber-700/50 shadow-xl overflow-hidden">
        {/* Header: orange/yellow, logo top-left, institute name in dark blue to the right */}
        <div className="bg-amber-400 px-4 py-3 flex items-start gap-3 border-b-2 border-amber-600/50">
          <div className="flex-shrink-0">
            <Image src={logo} alt="IIMST" width={64} height={64} className="rounded-full object-cover border-2 border-amber-600/60 shadow" />
          </div>
          <div className="flex-1 min-w-0 pt-0.5">
            <h2 className="text-base font-bold uppercase leading-tight text-blue-900">
              Infinity Institute of Management Science &amp; Technology
            </h2>
            <p className="text-xs text-blue-900/80 mt-1 leading-snug">
              An ISO 9001:2008 Certified International E-Learning Institute for Technical &amp; Business Studies
            </p>
          </div>
        </div>

        {/* Main: white – photo left, then signature on top of Issuing authority, Issuing authority below image */}
        <div className="p-4 flex gap-5">
          <div className="flex-shrink-0 flex flex-col items-center">
            {student.photoUrl ? (
              <img src={student.photoUrl} alt="" className="w-28 h-32 rounded-sm object-cover border border-gray-300" />
            ) : (
              <div className="w-28 h-32 rounded-sm bg-gray-200 flex items-center justify-center text-3xl text-gray-400 border border-gray-300">👤</div>
            )}
            {/* Signature line on top of "Issuing authority", Issuing authority below the image */}
            <div className="w-full mt-2 flex flex-col items-center">
              <div className="w-24 border-b-2 border-gray-600 mb-1" aria-hidden />
              <p className="text-[10px] font-medium text-gray-600">Issuing authority</p>
            </div>
          </div>
          <div className="flex-1 min-w-0 space-y-2 text-sm">
            <p><span className="font-bold text-gray-800">Name:</span> <span className="uppercase">{student.fullName}</span></p>
            <p><span className="font-bold text-gray-800">D. O. B.:</span> {dob}</p>
            <p><span className="font-bold text-gray-800">Session:</span> {session}</p>
            <p><span className="font-bold text-gray-800">Course:</span> {courseDisplay}</p>
            <p><span className="font-bold text-gray-800">Enrol. No.:</span> {student.enrollmentNo}</p>
          </div>
        </div>
      </div>

      <p className="no-print text-sm text-gray-500 mt-4">
        Use &quot;Download / Print ID card&quot; then choose &quot;Save as PDF&quot; in the print dialog to download.
      </p>
    </div>
  );
}
