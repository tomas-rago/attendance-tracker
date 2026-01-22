import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { DateNavbar, ClassCard, AttendanceList, FinishDayModal } from '../components/attendance';
import { Button } from '../components/ui/Button';
import {
  getToday,
  getPreviousDay,
  getNextDay,
  formatDateISO,
  formatDateShort,
  getScheduleWeekday,
  isWeekday,
} from '../utils/dates';
import type { Class, StudentAttendance, Reason } from '../types';

export function AttendancePage() {
  const {
    getClassesForDay,
    getAttendanceForClass,
    saveAttendance,
    getDayRecord,
    finishDay,
    getStudentsByCourse,
    getCourseById,
  } = useApp();

  const [selectedDate, setSelectedDate] = useState(getToday);
  const [activeClass, setActiveClass] = useState<Class | null>(null);
  const [showFinishModal, setShowFinishModal] = useState(false);

  const dateString = formatDateISO(selectedDate);
  const weekday = getScheduleWeekday(selectedDate);
  const dayRecord = getDayRecord(dateString);

  // Get classes for the current day based on schedule
  const dayClasses = weekday !== null ? getClassesForDay(weekday) : [];

  // Check which classes have attendance taken
  const classesWithAttendance = dayClasses.map(cls => ({
    cls,
    course: getCourseById(cls.courseId)!,
    hasAttendance: !!getAttendanceForClass(cls.id, dateString),
  })).filter(item => item.course); // Filter out any with missing courses

  const pendingClassesCount = classesWithAttendance.filter(c => !c.hasAttendance).length;

  const handlePrevDay = () => setSelectedDate(prev => getPreviousDay(prev));
  const handleNextDay = () => setSelectedDate(prev => getNextDay(prev));

  const handleTakeAttendance = (cls: Class) => {
    setActiveClass(cls);
  };

  const handleSaveAttendance = async (records: StudentAttendance[]) => {
    if (activeClass) {
      await saveAttendance(activeClass.id, dateString, records);
      setActiveClass(null);
    }
  };

  const handleCancelAttendance = () => {
    setActiveClass(null);
  };

  const handleFinishDay = async (reason?: Reason) => {
    await finishDay(dateString, reason);
    setShowFinishModal(false);
  };

  // If taking attendance for a specific class
  if (activeClass) {
    const course = getCourseById(activeClass.courseId);
    if (!course) return null;

    const students = getStudentsByCourse(course.id);
    const existingAttendance = getAttendanceForClass(activeClass.id, dateString);

    return (
      <AttendanceList
        cls={activeClass}
        course={course}
        students={students}
        date={selectedDate}
        existingRecords={existingAttendance?.records}
        onSave={handleSaveAttendance}
        onCancel={handleCancelAttendance}
      />
    );
  }

  // Main attendance view
  const isDayCompleted = dayRecord?.status === 'completed' || dayRecord?.status === 'skipped';

  return (
    <div className="flex flex-col h-full">
      <DateNavbar
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        onPrevDay={handlePrevDay}
        onNextDay={handleNextDay}
      />

      <div className="flex-1 overflow-auto p-4">
        {!isWeekday(selectedDate) ? (
          // Weekend message
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-500">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-xl font-medium">Fin de semana</p>
              <p className="mt-1">No hay clases programadas</p>
            </div>
          </div>
        ) : isDayCompleted ? (
          // Day already completed
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className={`
                w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center
                ${dayRecord?.status === 'skipped' ? 'bg-yellow-100' : 'bg-green-100'}
              `}>
                <svg className={`w-10 h-10 ${dayRecord?.status === 'skipped' ? 'text-yellow-600' : 'text-green-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-xl font-medium text-gray-900">
                {dayRecord?.status === 'skipped' ? 'Día omitido' : 'Día completado'}
              </p>
              {dayRecord?.reason && (
                <p className="mt-2 text-gray-600">
                  Motivo: <span className="font-medium">{dayRecord.reason}</span>
                </p>
              )}
            </div>
          </div>
        ) : dayClasses.length === 0 ? (
          // No classes scheduled
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-500">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p className="text-xl font-medium">Sin clases programadas</p>
              <p className="mt-1">Configura tu horario en la sección de configuración</p>
            </div>
          </div>
        ) : (
          // Show class cards
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col gap-4 mb-6">
              {classesWithAttendance.map(({ cls, course, hasAttendance }) => (
                <ClassCard
                  key={cls.id}
                  cls={cls}
                  course={course}
                  hasAttendance={hasAttendance}
                  onTakeAttendance={() => handleTakeAttendance(cls)}
                />
              ))}
            </div>

            <div className="flex justify-center">
              <Button
                variant="secondary"
                size="lg"
                onClick={() => setShowFinishModal(true)}
              >
                Finalizar día
              </Button>
            </div>
          </div>
        )}
      </div>

      <FinishDayModal
        isOpen={showFinishModal}
        onClose={() => setShowFinishModal(false)}
        onFinish={handleFinishDay}
        pendingClassesCount={pendingClassesCount}
        dateString={formatDateShort(selectedDate)}
      />
    </div>
  );
}
