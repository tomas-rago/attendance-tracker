import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/database';
import type {
  Course,
  Class,
  Student,
  Schedule,
  ScheduleEntry,
  AttendanceRecord,
  DayRecord,
  TeacherConfig,
  StudentAttendance,
  Reason,
  Weekday,
} from '../types';
import { getCurrentYear } from '../utils/dates';

interface AppContextType {
  // Data
  teacher: TeacherConfig | null;
  courses: Course[];
  classes: Class[];
  students: Student[];
  schedule: Schedule | null;
  attendanceRecords: AttendanceRecord[];
  dayRecords: DayRecord[];
  isLoading: boolean;

  // Teacher operations
  setTeacherName: (name: string) => Promise<void>;

  // Course operations
  addCourse: (course: Omit<Course, 'id'>) => Promise<string>;
  updateCourse: (id: string, course: Partial<Course>) => Promise<void>;
  deleteCourse: (id: string) => Promise<void>;

  // Class operations
  addClass: (cls: Omit<Class, 'id'>) => Promise<string>;
  updateClass: (id: string, cls: Partial<Class>) => Promise<void>;
  deleteClass: (id: string) => Promise<void>;

  // Student operations
  addStudent: (student: Omit<Student, 'id'>) => Promise<string>;
  updateStudent: (id: string, student: Partial<Student>) => Promise<void>;
  deleteStudent: (id: string) => Promise<void>;

  // Schedule operations
  setScheduleEntry: (classId: string, weekday: Weekday, hour: string) => Promise<void>;
  removeScheduleEntry: (entryId: string) => Promise<void>;
  getClassesForDay: (weekday: Weekday) => Class[];

  // Attendance operations
  getAttendanceForClass: (classId: string, date: string) => AttendanceRecord | undefined;
  saveAttendance: (classId: string, date: string, records: StudentAttendance[]) => Promise<void>;
  getDayRecord: (date: string) => DayRecord | undefined;
  finishDay: (date: string, reason?: Reason) => Promise<void>;

  // Utility
  getStudentsByCourse: (courseId: string) => Student[];
  getCourseById: (courseId: string) => Course | undefined;
  getClassById: (classId: string) => Class | undefined;
  refreshData: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [refreshKey, setRefreshKey] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);

  // Live queries - automatically update when data changes
  // Using a wrapper to detect when query has completed (returns null for no results, undefined while loading)
  const teacherQuery = useLiveQuery(
    async () => {
      const result = await db.teacherConfig.toCollection().first();
      return result ?? null; // Convert undefined (no record) to null
    },
    [refreshKey]
  );
  const coursesQuery = useLiveQuery(() => db.courses.toArray(), [refreshKey]);
  const classesQuery = useLiveQuery(() => db.classes.toArray(), [refreshKey]);
  const studentsQuery = useLiveQuery(() => db.students.toArray(), [refreshKey]);
  const schedulesQuery = useLiveQuery(() => db.schedules.toArray(), [refreshKey]);
  const attendanceRecordsQuery = useLiveQuery(() => db.attendanceRecords.toArray(), [refreshKey]);
  const dayRecordsQuery = useLiveQuery(() => db.dayRecords.toArray(), [refreshKey]);

  // Derived values with defaults
  const teacher = teacherQuery ?? null;
  const courses = coursesQuery ?? [];
  const classes = classesQuery ?? [];
  const students = studentsQuery ?? [];
  const schedules = schedulesQuery ?? [];
  const attendanceRecords = attendanceRecordsQuery ?? [];
  const dayRecords = dayRecordsQuery ?? [];

  const currentYear = getCurrentYear();
  const schedule = schedules.find(s => s.year === currentYear) ?? null;

  // Check if all queries have completed (not undefined)
  const queriesLoaded =
    teacherQuery !== undefined &&
    coursesQuery !== undefined &&
    classesQuery !== undefined;

  // Mark as initialized once queries load
  useEffect(() => {
    if (queriesLoaded && !isInitialized) {
      setIsInitialized(true);
    }
  }, [queriesLoaded, isInitialized]);

  const isLoading = !isInitialized;

  const refreshData = useCallback(() => {
    setRefreshKey(k => k + 1);
  }, []);

  // Teacher operations
  const setTeacherName = useCallback(async (name: string) => {
    const existing = await db.teacherConfig.toCollection().first();
    if (existing) {
      await db.teacherConfig.update(existing.id, { name, setupComplete: true });
    } else {
      await db.teacherConfig.add({ id: uuidv4(), name, setupComplete: true });
    }
  }, []);

  // Course operations
  const addCourse = useCallback(async (course: Omit<Course, 'id'>): Promise<string> => {
    const id = uuidv4();
    await db.courses.add({ ...course, id });
    return id;
  }, []);

  const updateCourse = useCallback(async (id: string, course: Partial<Course>) => {
    await db.courses.update(id, course);
  }, []);

  const deleteCourse = useCallback(async (id: string) => {
    // Also delete associated classes and students
    await db.transaction('rw', [db.courses, db.classes, db.students], async () => {
      const classesToDelete = await db.classes.where('courseId').equals(id).toArray();
      await db.classes.where('courseId').equals(id).delete();
      await db.students.where('courseId').equals(id).delete();
      // Remove schedule entries for deleted classes
      const currentSchedule = await db.schedules.where('year').equals(currentYear).first();
      if (currentSchedule) {
        const classIds = classesToDelete.map(c => c.id);
        const updatedEntries = currentSchedule.entries.filter(e => !classIds.includes(e.classId));
        await db.schedules.update(currentSchedule.id, { entries: updatedEntries });
      }
      await db.courses.delete(id);
    });
  }, [currentYear]);

  // Class operations
  const addClass = useCallback(async (cls: Omit<Class, 'id'>): Promise<string> => {
    const id = uuidv4();
    await db.classes.add({ ...cls, id });
    return id;
  }, []);

  const updateClass = useCallback(async (id: string, cls: Partial<Class>) => {
    await db.classes.update(id, cls);
  }, []);

  const deleteClass = useCallback(async (id: string) => {
    await db.transaction('rw', [db.classes, db.schedules, db.attendanceRecords], async () => {
      await db.classes.delete(id);
      await db.attendanceRecords.where('classId').equals(id).delete();
      // Remove from schedule
      const currentSchedule = await db.schedules.where('year').equals(currentYear).first();
      if (currentSchedule) {
        const updatedEntries = currentSchedule.entries.filter(e => e.classId !== id);
        await db.schedules.update(currentSchedule.id, { entries: updatedEntries });
      }
    });
  }, [currentYear]);

  // Student operations
  const addStudent = useCallback(async (student: Omit<Student, 'id'>): Promise<string> => {
    const id = uuidv4();
    await db.students.add({ ...student, id });
    return id;
  }, []);

  const updateStudent = useCallback(async (id: string, student: Partial<Student>) => {
    await db.students.update(id, student);
  }, []);

  const deleteStudent = useCallback(async (id: string) => {
    await db.students.delete(id);
  }, []);

  // Schedule operations
  const setScheduleEntry = useCallback(async (classId: string, weekday: Weekday, hour: string) => {
    let currentSchedule = await db.schedules.where('year').equals(currentYear).first();

    if (!currentSchedule) {
      currentSchedule = {
        id: uuidv4(),
        year: currentYear,
        entries: [],
      };
      await db.schedules.add(currentSchedule);
    }

    const newEntry: ScheduleEntry = {
      id: uuidv4(),
      classId,
      weekday,
      hour,
    };

    const updatedEntries = [...currentSchedule.entries, newEntry];
    await db.schedules.update(currentSchedule.id, { entries: updatedEntries });
  }, [currentYear]);

  const removeScheduleEntry = useCallback(async (entryId: string) => {
    const currentSchedule = await db.schedules.where('year').equals(currentYear).first();
    if (currentSchedule) {
      const updatedEntries = currentSchedule.entries.filter(e => e.id !== entryId);
      await db.schedules.update(currentSchedule.id, { entries: updatedEntries });
    }
  }, [currentYear]);

  const getClassesForDay = useCallback((weekday: Weekday): Class[] => {
    if (!schedule) return [];
    const classIds = schedule.entries
      .filter(e => Number(e.weekday) === Number(weekday))
      .sort((a, b) => a.hour.localeCompare(b.hour))
      .map(e => e.classId);
    // Remove duplicates and map to classes
    const uniqueClassIds = [...new Set(classIds)];
    return uniqueClassIds.map(id => classes.find(c => c.id === id)).filter((c): c is Class => c !== undefined);
  }, [schedule, classes]);

  // Attendance operations
  const getAttendanceForClass = useCallback((classId: string, date: string): AttendanceRecord | undefined => {
    return attendanceRecords.find(r => r.classId === classId && r.date === date);
  }, [attendanceRecords]);

  const saveAttendance = useCallback(async (classId: string, date: string, records: StudentAttendance[]) => {
    const existing = await db.attendanceRecords.where('[classId+date]').equals([classId, date]).first();

    if (existing) {
      await db.attendanceRecords.update(existing.id, { records });
    } else {
      await db.attendanceRecords.add({
        id: uuidv4(),
        classId,
        date,
        records,
      });
    }
  }, []);

  const getDayRecord = useCallback((date: string): DayRecord | undefined => {
    return dayRecords.find(r => r.date === date);
  }, [dayRecords]);

  const finishDay = useCallback(async (date: string, reason?: Reason) => {
    const existing = await db.dayRecords.where('date').equals(date).first();
    const status = reason ? 'skipped' : 'completed';

    if (existing) {
      await db.dayRecords.update(existing.id, { status, reason });
    } else {
      await db.dayRecords.add({
        id: uuidv4(),
        date,
        status,
        reason,
      });
    }
  }, []);

  // Utility functions
  const getStudentsByCourse = useCallback((courseId: string): Student[] => {
    return students.filter(s => s.courseId === courseId);
  }, [students]);

  const getCourseById = useCallback((courseId: string): Course | undefined => {
    return courses.find(c => c.id === courseId);
  }, [courses]);

  const getClassById = useCallback((classId: string): Class | undefined => {
    return classes.find(c => c.id === classId);
  }, [classes]);

  const value: AppContextType = {
    teacher,
    courses,
    classes,
    students,
    schedule,
    attendanceRecords,
    dayRecords,
    isLoading,
    setTeacherName,
    addCourse,
    updateCourse,
    deleteCourse,
    addClass,
    updateClass,
    deleteClass,
    addStudent,
    updateStudent,
    deleteStudent,
    setScheduleEntry,
    removeScheduleEntry,
    getClassesForDay,
    getAttendanceForClass,
    saveAttendance,
    getDayRecord,
    finishDay,
    getStudentsByCourse,
    getCourseById,
    getClassById,
    refreshData,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
