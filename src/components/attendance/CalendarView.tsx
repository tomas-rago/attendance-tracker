import { useState, useMemo } from 'react';
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameMonth,
  isSameDay,
  format,
  addMonths,
  subMonths,
} from 'date-fns';
import { es } from 'date-fns/locale';
import { useApp } from '../../context/AppContext';
import { formatDateISO, getScheduleWeekday, isWeekday, getToday } from '../../utils/dates';
import type { Weekday } from '../../types';

interface CalendarViewProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  onClose: () => void;
}

type DayStatus = 'has-attendance' | 'skipped' | 'no-classes' | 'pending' | 'future';

interface ClassDayStatus {
  classId: string;
  className: string;
  status: 'completed' | 'pending';
}

export function CalendarView({ selectedDate, onDateSelect, onClose }: CalendarViewProps) {
  const [viewMonth, setViewMonth] = useState(selectedDate);
  const {
    getClassesForDay,
    getAttendanceForClass,
    getDayRecord,
  } = useApp();

  const today = getToday();

  // Generate calendar days for the current month view
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(viewMonth);
    const monthEnd = endOfMonth(viewMonth);
    const calStart = startOfWeek(monthStart, { weekStartsOn: 1 }); // Monday start
    const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const days: Date[] = [];
    let day = calStart;
    while (day <= calEnd) {
      days.push(day);
      day = addDays(day, 1);
    }
    return days;
  }, [viewMonth]);

  // Get status for a specific day
  const getDayStatus = (date: Date): { status: DayStatus; classes: ClassDayStatus[] } => {
    const dateString = formatDateISO(date);
    const dayRecord = getDayRecord(dateString);

    // Future dates
    if (date > today) {
      return { status: 'future', classes: [] };
    }

    // Weekend
    if (!isWeekday(date)) {
      return { status: 'no-classes', classes: [] };
    }

    // Day was explicitly skipped
    if (dayRecord?.status === 'skipped') {
      return { status: 'skipped', classes: [] };
    }

    const weekday = getScheduleWeekday(date) as Weekday;
    const dayClasses = getClassesForDay(weekday);

    // No classes scheduled for this weekday
    if (dayClasses.length === 0) {
      return { status: 'no-classes', classes: [] };
    }

    // Check if at least one class has attendance
    const hasAnyAttendance = dayClasses.some(cls =>
      getAttendanceForClass(cls.id, dateString)
    );

    if (hasAnyAttendance) {
      return { status: 'has-attendance', classes: [] };
    } else {
      return { status: 'pending', classes: [] };
    }
  };

  // Color mapping for day status
  const getStatusColor = (status: DayStatus): string => {
    switch (status) {
      case 'has-attendance':
        return 'bg-green-500';
      case 'skipped':
        return 'bg-red-500';
      case 'pending':
        return 'bg-blue-300';
      case 'no-classes':
        return 'bg-gray-200';
      case 'future':
        return 'bg-gray-100';
      default:
        return 'bg-gray-100';
    }
  };

  const handlePrevMonth = () => setViewMonth(prev => subMonths(prev, 1));
  const handleNextMonth = () => setViewMonth(prev => addMonths(prev, 1));

  const handleDayClick = (date: Date) => {
    if (date <= today && isWeekday(date)) {
      onDateSelect(date);
      onClose();
    }
  };

  const weekDays = ['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom'];

  return (
    <div className="absolute top-full left-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-200 p-4 z-50 w-80">
      {/* Header with month navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={handlePrevMonth}
          className="p-1 hover:bg-gray-100 rounded"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <span className="font-semibold text-gray-900 capitalize">
          {format(viewMonth, 'MMMM yyyy', { locale: es })}
        </span>
        <button
          onClick={handleNextMonth}
          className="p-1 hover:bg-gray-100 rounded"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map(day => (
          <div key={day} className="text-center text-xs font-medium text-gray-500 py-1">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((day, index) => {
          const { status, classes } = getDayStatus(day);
          const isCurrentMonth = isSameMonth(day, viewMonth);
          const isSelected = isSameDay(day, selectedDate);
          const isClickable = day <= today && isCurrentMonth && isWeekday(day);

          return (
            <button
              key={index}
              onClick={() => isClickable && handleDayClick(day)}
              disabled={!isClickable}
              className={`
                relative aspect-square p-1 rounded-lg text-sm
                ${!isCurrentMonth ? 'opacity-30' : ''}
                ${isSelected ? 'ring-2 ring-blue-500' : ''}
                ${isClickable ? 'cursor-pointer hover:ring-1 hover:ring-gray-300' : 'cursor-default'}
              `}
            >
              <div className="text-xs font-medium mb-0.5">{format(day, 'd')}</div>

              {/* Status indicator - always use status color */}
              <div className={`h-2 rounded-sm ${getStatusColor(status)}`} />
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 pt-3 border-t border-gray-200">
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-green-500" />
            <span>Con asistencia</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-blue-300" />
            <span>Pendiente</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-red-500" />
            <span>Omitido</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-gray-200" />
            <span>Sin clases</span>
          </div>
        </div>
      </div>
    </div>
  );
}
