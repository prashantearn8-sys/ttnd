export type AttendanceStatus = 'present' | 'absent' | 'upcoming';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'student' | 'teacher' | 'rep';
  section: string;
  studentId: string;
}

export interface SubjectAttendance {
  id: string;
  code: string;
  name: string;
  faculty: string;
  totalHeld: number;
  totalAttended: number;
  percentage: number;
  color: string;
  lastUpdated?: string;
}

export interface DayClassSession {
  id: string;
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  subject: string;
  subjectCode: string;
  time: string;
  room?: string;
  faculty: string;
  status: AttendanceStatus;
  notes?: string;
}

export interface AttendanceHistorySession {
  id: string;
  date: string; // YYYY-MM-DD
  day: string;
  subjectName: string;
  subjectCode: string;
  status: AttendanceStatus;
  time: string;
}

export interface AppAttendanceState {
  currentSection: string;
  isUsingLastWeekFallback: boolean;
  lastUploadedDate: string | null;
  weekLabel: string;
  targetPercentage: number;
  subjects: SubjectAttendance[];
  schedule: DayClassSession[];
  history: AttendanceHistorySession[];
}
