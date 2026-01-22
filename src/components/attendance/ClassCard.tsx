import type { Class, Course } from '../../types';
import { Button } from '../ui/Button';

interface ClassCardProps {
  cls: Class;
  course: Course;
  hasAttendance: boolean;
  onTakeAttendance: () => void;
}

export function ClassCard({ cls, course, hasAttendance, onTakeAttendance }: ClassCardProps) {
  return (
    <div className={`
      bg-white rounded-xl shadow-sm border p-4
      ${hasAttendance ? 'border-green-300 bg-green-50' : 'border-gray-200'}
    `}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-gray-900 text-lg">{cls.name}</h3>
          <p className="text-sm text-gray-500">
            {course.grade}° {course.level} {course.division}
          </p>
        </div>

        {hasAttendance ? (
          <div className="flex items-center gap-2 text-green-600">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-sm font-medium">Completado</span>
          </div>
        ) : (
          <Button onClick={onTakeAttendance} size="md">
            Tomar asistencia
          </Button>
        )}
      </div>
    </div>
  );
}
