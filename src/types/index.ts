// Enums
export type Level = 'Primario' | 'Secundario';
export type Division = 'A' | 'B' | 'C' | 'D';
export type Reason = 'PNFS' | 'Feriado' | 'Cambio de actividad';
export type AttendanceStatus = 'Presente' | 'Ausente';
export type DayStatus = 'pending' | 'completed' | 'skipped';
export type Weekday = 0 | 1 | 2 | 3 | 4; // Monday=0 to Friday=4

// Course (e.g., "7mo grado A")
export interface Course {
  id: string;
  grade: 1 | 2 | 3 | 4 | 5 | 6;
  level: Level;
  division: Division;
}

// Class (e.g., "Matemáticas 7mo A")
export interface Class {
  id: string;
  courseId: string;
  name: string;
}

// Student (belongs to a course, appears in all classes of that course)
export interface Student {
  id: string;
  name: string;
  identificationNumber: string;
  courseId: string;
}

// Schedule entry (a class at a specific day and time)
export interface ScheduleEntry {
  id: string;
  classId: string;
  weekday: Weekday;
  hour: string; // Time string "08:00"
}

// Schedule (yearly configuration)
export interface Schedule {
  id: string;
  year: number;
  entries: ScheduleEntry[];
}

// Individual student attendance record
export interface StudentAttendance {
  studentId: string;
  status: AttendanceStatus;
}

// Attendance record (per class per day)
export interface AttendanceRecord {
  id: string;
  classId: string;
  date: string; // ISO date "2026-01-21"
  records: StudentAttendance[];
}

// Day status (tracks if a day is completed/skipped)
export interface DayRecord {
  id: string;
  date: string; // ISO date
  status: DayStatus;
  reason?: Reason; // Only if skipped
}

// Teacher configuration
export interface TeacherConfig {
  id: string;
  name: string;
  setupComplete: boolean;
}

// Helper type for display
export interface ClassWithCourse extends Class {
  course: Course;
}

// App state for context
export interface AppState {
  teacher: TeacherConfig | null;
  courses: Course[];
  classes: Class[];
  students: Student[];
  schedule: Schedule | null;
  attendanceRecords: AttendanceRecord[];
  dayRecords: DayRecord[];
  isLoading: boolean;
}

// Constants
export const LEVELS: Level[] = ['Primario', 'Secundario'];
export const DIVISIONS: Division[] = ['A', 'B', 'C', 'D'];
export const REASONS: Reason[] = ['PNFS', 'Feriado', 'Cambio de actividad'];
export const GRADES = [1, 2, 3, 4, 5, 6] as const;
export const WEEKDAYS: { value: Weekday; label: string }[] = [
  { value: 0, label: 'Lunes' },
  { value: 1, label: 'Martes' },
  { value: 2, label: 'Miércoles' },
  { value: 3, label: 'Jueves' },
  { value: 4, label: 'Viernes' },
];

// Helper function to format course name
export function formatCourseName(course: Course): string {
  const gradeStr = course.level === 'Primario'
    ? `${course.grade}° Primaria`
    : `${course.grade}° Secundaria`;
  return `${gradeStr} ${course.division}`;
}

// Helper function to format class name with course
export function formatClassName(cls: Class, course: Course): string {
  return `${cls.name} - ${formatCourseName(course)}`;
}
