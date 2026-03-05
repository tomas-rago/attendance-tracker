import { useState, useEffect, useMemo } from 'react';
import type { Class, Course, Student, AttendanceStatus, StudentAttendance } from '../../types';
import { formatDateShort } from '../../utils/dates';
import { StudentRow } from './StudentRow';
import { Button } from '../ui/Button';

interface AttendanceListProps {
  cls: Class;
  course: Course;
  students: Student[];
  date: Date;
  existingRecords?: StudentAttendance[];
  onSave: (records: StudentAttendance[]) => void;
  onCancel: () => void;
}

export function AttendanceList({
  cls,
  course,
  students,
  date,
  existingRecords,
  onSave,
  onCancel,
}: AttendanceListProps) {
  // Sort students: Varon first, then Mujer, alphabetically within each group
  const sortedStudents = useMemo(() => {
    return [...students].sort((a, b) => {
      const genderOrder: Record<string, number> = { 'Varon': 1, 'Mujer': 2 };
      const genderA = genderOrder[a.gender] || 3;
      const genderB = genderOrder[b.gender] || 3;

      if (genderA !== genderB) {
        return genderA - genderB;
      }
      return a.name.localeCompare(b.name);
    });
  }, [students]);

  // Initialize attendance status - default everyone to present
  const [attendance, setAttendance] = useState<Map<string, AttendanceStatus>>(() => {
    const map = new Map<string, AttendanceStatus>();
    sortedStudents.forEach(student => {
      const existing = existingRecords?.find(r => r.studentId === student.id);
      map.set(student.id, existing?.status ?? 'Presente');
    });
    return map;
  });

  // Update when students or existing records change
  useEffect(() => {
    const map = new Map<string, AttendanceStatus>();
    sortedStudents.forEach(student => {
      const existing = existingRecords?.find(r => r.studentId === student.id);
      map.set(student.id, existing?.status ?? 'Presente');
    });
    setAttendance(map);
  }, [sortedStudents, existingRecords]);

  const toggleStatus = (studentId: string) => {
    setAttendance(prev => {
      const newMap = new Map(prev);
      const currentStatus = newMap.get(studentId) ?? 'Presente';
      newMap.set(studentId, currentStatus === 'Presente' ? 'Ausente' : 'Presente');
      return newMap;
    });
  };

  const handleSave = () => {
    const records: StudentAttendance[] = students.map(student => ({
      studentId: student.id,
      status: attendance.get(student.id) ?? 'Presente',
    }));
    onSave(records);
  };

  const presentCount = Array.from(attendance.values()).filter(s => s === 'Presente').length;
  const absentCount = sortedStudents.length - presentCount;

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Sticky header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
        <div className="px-4 py-3 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{cls.name}</h2>
            <p className="text-sm text-gray-500">
              {course.grade}° {course.level} {course.division} - {formatDateShort(date)}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-sm">
              <span className="text-green-600 font-medium">{presentCount} presentes</span>
              <span className="mx-2 text-gray-300">|</span>
              <span className="text-red-600 font-medium">{absentCount} ausentes</span>
            </div>

            <div className="flex gap-2">
              <Button variant="secondary" onClick={onCancel}>
                Cancelar
              </Button>
              <Button variant="success" onClick={handleSave}>
                Confirmar
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Student list */}
      {sortedStudents.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-gray-500">
          <p>No hay alumnos registrados en este curso.</p>
        </div>
      ) : (
        <div className="flex-1 overflow-auto">
          <table className="w-full">
            <thead className="bg-gray-100 sticky top-0">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Nombre</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">DNI</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {sortedStudents.map(student => (
                <StudentRow
                  key={student.id}
                  student={student}
                  status={attendance.get(student.id) ?? 'Presente'}
                  onToggle={() => toggleStatus(student.id)}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
