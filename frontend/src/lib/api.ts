const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('iimst_token');
}

export async function api<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error((err as { message?: string }).message || 'Request failed');
  }
  return res.json() as Promise<T>;
}

export const auth = {
  login: (userNameOrEmail: string, password: string) =>
    api<{ token: string; userName: string; email: string; role: string; studentId?: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ userNameOrEmail, password }),
    }),
  changePassword: (currentPassword: string, newPassword: string) =>
    api<{ message: string }>('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    }),
};

const API_BASE_PUBLIC = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
export async function submitEnquiry(data: { name: string; email: string; phone?: string; message?: string; courseInterest?: string }) {
  const res = await fetch(`${API_BASE_PUBLIC}/enquiries`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error((err as { message?: string }).message || 'Failed to submit');
  }
  return res.json();
}

export type Course = { id: string; name: string; maxSemester: number };

export type Student = {
  id: string;
  userId: string;
  userName?: string;
  enrollmentNo: string;
  fullName: string;
  fatherName?: string;
  motherName?: string;
  dateOfBirth?: string;
  email?: string;
  address?: string;
  phone?: string;
  courseId?: string;
  courseName?: string;
  program?: string;
  branch?: string;
  currentSemester?: number;
  photoUrl?: string;
  bloodGroup?: string;
  createdAt: string;
};

export type Subject = {
  id: string;
  courseId: string;
  courseName?: string;
  code: string;
  name: string;
  semester?: number;
  program?: string;
  minPassMarks: number;
  maxMarks: number;
  examLink?: string;
  credits: number;
};
export type Result = {
  id: string;
  studentId: string;
  studentName?: string;
  enrollmentNo?: string;
  courseId?: string;
  courseName?: string;
  subjectId: string;
  subjectCode?: string;
  subjectName?: string;
  semester: number;
  semesterRoman?: string;
  marksObtained: number;
  maxMarks: number;
  minPassMarks?: number;
  grade?: string;
  isPassed: boolean;
};

export type MarksCardRow = { subjectName: string; maximumMarks: number; passMarks: number; marksSecured: number; isPassed: boolean };
export type MarksCard = {
  studentName: string;
  fatherName?: string;
  dateOfBirth?: string;
  enrollmentNo: string;
  courseName?: string;
  semester: number;
  semesterRoman: string;
  rows: MarksCardRow[];
  totalMaximumMarks: number;
  totalPassMarks: number;
  totalMarksSecured: number;
  resultStatus: string;
};
export type SubjectExam = {
  id: string;
  subjectId: string;
  subjectCode?: string;
  subjectName?: string;
  examLink: string;
  minPassingMarks: number;
  maxMarks: number;
  isActive: boolean;
};
export type ExamAttempt = {
  id: string;
  studentId: string;
  subjectExamId: string;
  subjectName?: string;
  subjectCode?: string;
  marksObtained: number;
  minPassingMarks: number;
  maxMarks: number;
  isPassed: boolean;
  attemptedAt: string;
};
export type User = { id: string; userName: string; email: string; role: string; createdAt: string };
