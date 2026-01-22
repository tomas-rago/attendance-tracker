import Dexie, { type Table } from 'dexie';
import type {
  Course,
  Class,
  Student,
  Schedule,
  AttendanceRecord,
  DayRecord,
  TeacherConfig,
} from '../types';

export class AttendanceDatabase extends Dexie {
  courses!: Table<Course>;
  classes!: Table<Class>;
  students!: Table<Student>;
  schedules!: Table<Schedule>;
  attendanceRecords!: Table<AttendanceRecord>;
  dayRecords!: Table<DayRecord>;
  teacherConfig!: Table<TeacherConfig>;

  constructor() {
    super('AttendanceTrackerDB');

    this.version(1).stores({
      courses: 'id, grade, level, division',
      classes: 'id, courseId, name',
      students: 'id, courseId, name',
      schedules: 'id, year',
      attendanceRecords: 'id, classId, date, [classId+date]',
      dayRecords: 'id, date',
      teacherConfig: 'id',
    });
  }
}

export const db = new AttendanceDatabase();

// Export all data as JSON
export async function exportAllData(): Promise<string> {
  const data = {
    version: 1,
    exportedAt: new Date().toISOString(),
    teacher: await db.teacherConfig.toArray(),
    courses: await db.courses.toArray(),
    classes: await db.classes.toArray(),
    students: await db.students.toArray(),
    schedules: await db.schedules.toArray(),
    attendanceRecords: await db.attendanceRecords.toArray(),
    dayRecords: await db.dayRecords.toArray(),
  };
  return JSON.stringify(data, null, 2);
}

// Import data from JSON
export async function importAllData(jsonString: string): Promise<void> {
  const data = JSON.parse(jsonString);

  // Clear all existing data
  await db.transaction('rw',
    [db.teacherConfig, db.courses, db.classes, db.students, db.schedules, db.attendanceRecords, db.dayRecords],
    async () => {
      await db.teacherConfig.clear();
      await db.courses.clear();
      await db.classes.clear();
      await db.students.clear();
      await db.schedules.clear();
      await db.attendanceRecords.clear();
      await db.dayRecords.clear();

      // Import new data
      if (data.teacher?.length) await db.teacherConfig.bulkAdd(data.teacher);
      if (data.courses?.length) await db.courses.bulkAdd(data.courses);
      if (data.classes?.length) await db.classes.bulkAdd(data.classes);
      if (data.students?.length) await db.students.bulkAdd(data.students);
      if (data.schedules?.length) await db.schedules.bulkAdd(data.schedules);
      if (data.attendanceRecords?.length) await db.attendanceRecords.bulkAdd(data.attendanceRecords);
      if (data.dayRecords?.length) await db.dayRecords.bulkAdd(data.dayRecords);
    }
  );
}

// Clear all data (for testing/reset)
export async function clearAllData(): Promise<void> {
  await db.transaction('rw',
    [db.teacherConfig, db.courses, db.classes, db.students, db.schedules, db.attendanceRecords, db.dayRecords],
    async () => {
      await db.teacherConfig.clear();
      await db.courses.clear();
      await db.classes.clear();
      await db.students.clear();
      await db.schedules.clear();
      await db.attendanceRecords.clear();
      await db.dayRecords.clear();
    }
  );
}
