import type { Student, AttendanceStatus } from '../../types';

interface StudentRowProps {
  student: Student;
  status: AttendanceStatus;
  onToggle: () => void;
}

export function StudentRow({ student, status, onToggle }: StudentRowProps) {
  const isPresent = status === 'Presente';

  return (
    <tr
      className={`
        cursor-pointer transition-colors
        ${isPresent ? 'bg-green-50 hover:bg-green-100' : 'bg-red-50 hover:bg-red-100'}
      `}
      onClick={onToggle}
    >
      <td className="px-4 py-3 text-gray-900 font-medium text-lg">
        {student.name}
      </td>
      <td className="px-4 py-3 text-gray-600 text-lg">
        {student.identificationNumber}
      </td>
      <td className="px-4 py-3 text-right">
        <span
          className={`
            inline-flex items-center px-4 py-2 rounded-lg font-bold text-lg
            ${isPresent ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}
          `}
        >
          {isPresent ? 'PRESENTE' : 'AUSENTE'}
        </span>
      </td>
    </tr>
  );
}
