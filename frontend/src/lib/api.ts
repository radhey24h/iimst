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
    if (res.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('iimst_token');
      localStorage.removeItem('iimst_user');
      window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname || '/admin');
    }
    const err = await res.json().catch(() => ({ message: res.statusText }));
    const body = err as { message?: string; error?: string };
    const detail = body.error ? `${body.message ?? 'Request failed'}: ${body.error}` : body.message;
    throw new Error(detail || 'Request failed');
  }
  if (res.status === 204) return undefined as T;
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

export type Course = { id: string; name: string; code?: string; maxSemester: number; durationYears?: number };

export type Branch = {
  id: string;
  courseId: string;
  courseName?: string;
  name: string;
  code: string;
  createdAt?: string;
};

export type Student = {
  id: string;
  userId: string;
  userName?: string;
  enrollmentNo: string;
  fullName: string;
  fatherName?: string;
  dateOfBirth?: string;
  dob?: string;
  email?: string;
  emailId?: string;
  address?: string;
  phone?: string;
  phoneNumber?: string;
  courseId?: string;
  courseName?: string;
  branchId?: string;
  branchName?: string;
  admissionYear?: number;
  photoUrl?: string;
  status?: string;
  createdAt: string;
};

export type Subject = {
  id: string;
  courseId: string;
  courseName?: string;
  branchId?: string;
  branchName?: string;
  code: string;
  name: string;
  semester: number;
  minPassMarks: number;
  maxMarks: number;
  examLink?: string;
  isActive?: boolean;
};

export type SubjectForResult = {
  subjectId: string;
  code: string;
  name: string;
  semester: number;
  semesterRoman: string;
  maxMarks: number;
  minPassMarks: number;
};

export type ResultBulkRequest = {
  studentId: string;
  semester: number;
  year: number;
  marks: Array<{ subjectId: string; marksObtained: number }>;
};

export type ResultItem = {
  subjectName: string;
  semester: number;
  semesterRoman: string;
  marksObtained: number;
  grade?: string;
  isPassed: boolean;
};

export type Result = {
  id?: string;
  studentId?: string;
  studentName?: string;
  enrollmentNo?: string;
  courseId?: string;
  courseName?: string;
  subjectId?: string;
  subjectCode?: string;
  subjectName?: string;
  semester: number;
  semesterRoman?: string;
  year?: number;
  marksObtained: number;
  maxMarks?: number;
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
  branchName?: string;
  semester: number;
  semesterRoman: string;
  year?: number;
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
export type AdminBackupResponse = {
  message: string;
  backupDir: string;
  durationSeconds: string;
  backupSize: string;
};

export function getBranchesByCourse(courseId: string) {
  return api<Branch[]>(`/branches?courseId=${encodeURIComponent(courseId)}`);
}

/** Server-side backup to shared Docker volume /backup (optional; restore-on-deploy uses this). */
export function triggerAdminBackup() {
  return api<AdminBackupResponse>('/admin/backup', {
    method: 'POST',
  });
}

/** Download a fresh MongoDB dump as a ZIP file (admin browser download). */
export async function downloadAdminBackup(): Promise<{ fileName: string }> {
  const token = getToken();
  const res = await fetch(`${API_BASE}/admin/backup/download`, {
    method: 'GET',
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });
  if (!res.ok) {
    if (res.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('iimst_token');
      localStorage.removeItem('iimst_user');
      window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname || '/admin');
    }
    const err = await res.json().catch(() => ({ message: res.statusText }));
    const body = err as { message?: string; error?: string };
    const detail = body.error ? `${body.message ?? 'Request failed'}: ${body.error}` : body.message;
    throw new Error(detail || 'Download failed');
  }
  const blob = await res.blob();
  const cd = res.headers.get('Content-Disposition');
  let fileName = 'iimst-mongodb-backup.zip';
  if (cd) {
    const utf8 = /filename\*=UTF-8''([^;\s]+)/i.exec(cd);
    if (utf8?.[1]) {
      try {
        fileName = decodeURIComponent(utf8[1]);
      } catch {
        fileName = utf8[1];
      }
    } else {
      const m = /filename="([^"]+)"/i.exec(cd) ?? /filename=([^;\s]+)/i.exec(cd);
      if (m?.[1]) fileName = m[1].trim();
    }
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  return { fileName };
}

/** Update student (e.g. photo). Students can only update their own record. */
export function updateStudent(studentId: string, data: { photoUrl?: string | null }) {
  return api<Student>(`/students/${encodeURIComponent(studentId)}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

/** Update student status (Active/Inactive). Admin only. */
export function updateStudentStatus(studentId: string, status: string) {
  return api<Student>(`/students/${encodeURIComponent(studentId)}`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  });
}

/** Delete student and their results. Admin only. */
export function deleteStudent(studentId: string) {
  return api<void>(`/students/${encodeURIComponent(studentId)}`, {
    method: 'DELETE',
  });
}

export function getSubjectsForResult(courseId: string, branchId: string, semester: number) {
  return api<SubjectForResult[]>(
    `/subjects/by-course-branch-semester?courseId=${encodeURIComponent(courseId)}&branchId=${encodeURIComponent(branchId)}&semester=${semester}`
  );
}

export function bulkInsertResults(payload: ResultBulkRequest) {
  return api<ResultItem[]>('/results/bulk', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function hasResultsForSemester(studentId: string, semester: number) {
  return api<{ hasResults: boolean }>(`/results/student/${studentId}/has-results?semester=${semester}`);
}

/** For prefilling marks when editing results. Returns list with subjectId and marksObtained. */
export function getResultsByStudentAndSemester(studentId: string, semester: number) {
  return api<Result[]>(`/results/student/${encodeURIComponent(studentId)}?semester=${semester}`);
}

/** Semesters for which the student has results (for marks card dropdown). */
/** Semesters for which the student has results (for marks card dropdown). Always fresh from backend. */
export function getSemestersWithResults(studentId: string) {
  return api<number[]>(`/results/student/${encodeURIComponent(studentId)}/semesters`, { cache: 'no-store' });
}

/** Result-cum-Detailed Marks Card for one semester. Always fresh so admin updates appear. */
export function getMarksCard(studentId: string, semester: number) {
  return api<MarksCard>(`/results/student/${encodeURIComponent(studentId)}/marks-card?semester=${semester}`, { cache: 'no-store' });
}

/** Paginated students list; returns total from X-Total-Count for pagination UI. */
export async function getStudentsPaginated(
  page: number,
  pageSize: number,
  search?: string,
  courseId?: string
): Promise<{ students: Student[]; total: number }> {
  const params = new URLSearchParams();
  params.set('page', String(page));
  params.set('pageSize', String(pageSize));
  if (search?.trim()) params.set('search', search.trim());
  if (courseId?.trim()) params.set('courseId', courseId.trim());
  const token = typeof window !== 'undefined' ? localStorage.getItem('iimst_token') : null;
  const res = await fetch(`${API_BASE}/students?${params}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    const body = err as { message?: string; error?: string };
    const detail = body.error ? `${body.message ?? 'Request failed'}: ${body.error}` : body.message;
    throw new Error(detail || 'Request failed');
  }
  const students = (await res.json()) as Student[];
  const total = parseInt(res.headers.get('X-Total-Count') ?? '0', 10);
  return { students, total };
}
