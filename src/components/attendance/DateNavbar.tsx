import { useRef } from 'react';
import { formatDateISO, formatDateNavbar, getToday } from '../../utils/dates';

interface DateNavbarProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  onPrevDay: () => void;
  onNextDay: () => void;
}

export function DateNavbar({ selectedDate, onDateChange, onPrevDay, onNextDay }: DateNavbarProps) {
  const dateInputRef = useRef<HTMLInputElement>(null);
  const today = getToday();
  const todayISO = formatDateISO(today);
  const isToday = formatDateISO(selectedDate) === todayISO;

  const handleDateInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = new Date(e.target.value + 'T00:00:00');
    if (!isNaN(date.getTime()) && date <= today) {
      onDateChange(date);
    }
  };

  const handleNextDay = () => {
    if (!isToday) {
      onNextDay();
    }
  };

  const openDatePicker = () => {
    dateInputRef.current?.showPicker();
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 px-4 py-3">
      <div className="flex items-center justify-between">
        {/* Left: Prev button + Date picker */}
        <div className="flex items-center gap-2">
          <button
            onClick={onPrevDay}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Día anterior"
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button
            onClick={openDatePicker}
            className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </button>
          <input
            ref={dateInputRef}
            type="date"
            value={formatDateISO(selectedDate)}
            max={todayISO}
            onChange={handleDateInputChange}
            className="absolute opacity-0 pointer-events-none"
            tabIndex={-1}
          />
        </div>

        {/* Center: Date text + Today badge */}
        <div className="flex items-center gap-3">
          <span className="text-lg font-semibold text-gray-800">
            {formatDateNavbar(selectedDate)}
          </span>
          {isToday && (
            <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
              Hoy
            </span>
          )}
        </div>

        {/* Right: Next button */}
        <button
          onClick={handleNextDay}
          disabled={isToday}
          className={`p-2 rounded-lg transition-colors ${
            isToday
              ? 'text-gray-300 cursor-not-allowed'
              : 'hover:bg-gray-100 text-gray-600'
          }`}
          aria-label="Día siguiente"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </nav>
  );
}
