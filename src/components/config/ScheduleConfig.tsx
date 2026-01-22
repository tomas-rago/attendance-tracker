import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';
import { Input } from '../ui/Input';
import { ConfirmModal } from '../ui/Modal';
import { WEEKDAYS, formatCourseName, type Weekday } from '../../types';
import { getCurrentYear } from '../../utils/dates';

export function ScheduleConfig() {
  const { schedule, classes, setScheduleEntry, removeScheduleEntry, getCourseById } = useApp();

  const [isAdding, setIsAdding] = useState(false);
  const [deleteEntryId, setDeleteEntryId] = useState<string | null>(null);

  // Form state
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedWeekday, setSelectedWeekday] = useState<Weekday>(0);
  const [selectedHour, setSelectedHour] = useState('08:00');

  const resetForm = () => {
    setSelectedClassId('');
    setSelectedWeekday(0);
    setSelectedHour('08:00');
    setIsAdding(false);
  };

  const handleAdd = async () => {
    if (!selectedClassId) return;
    await setScheduleEntry(selectedClassId, selectedWeekday, selectedHour);
    resetForm();
  };

  const handleDelete = async () => {
    if (deleteEntryId) {
      await removeScheduleEntry(deleteEntryId);
      setDeleteEntryId(null);
    }
  };

  // Group entries by weekday
  const entriesByDay = WEEKDAYS.map(({ value, label }) => ({
    weekday: value,
    label,
    entries: (schedule?.entries ?? [])
      .filter(e => e.weekday === value)
      .sort((a, b) => a.hour.localeCompare(b.hour))
      .map(entry => {
        const cls = classes.find(c => c.id === entry.classId);
        const course = cls ? getCourseById(cls.courseId) : undefined;
        return { entry, cls, course };
      })
      .filter(item => item.cls && item.course),
  }));

  // Get class options for dropdown
  const classOptions = classes.map(cls => {
    const course = getCourseById(cls.courseId);
    return {
      value: cls.id,
      label: course ? `${cls.name} - ${formatCourseName(course)}` : cls.name,
    };
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Horario {getCurrentYear()}</h3>
          <p className="text-sm text-gray-500">Configura las materias que das cada día de la semana.</p>
        </div>
        {!isAdding && classes.length > 0 && (
          <Button size="sm" onClick={() => setIsAdding(true)}>
            Agregar clase
          </Button>
        )}
      </div>

      {classes.length === 0 && (
        <p className="text-gray-500 text-sm">Primero debes crear al menos una materia.</p>
      )}

      {/* Add form */}
      {isAdding && (
        <div className="bg-white p-4 rounded-lg border border-gray-200 space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <Select
              label="Materia"
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              options={classOptions}
              placeholder="Seleccionar materia..."
            />
            <Select
              label="Día"
              value={selectedWeekday}
              onChange={(e) => setSelectedWeekday(Number(e.target.value) as Weekday)}
              options={WEEKDAYS.map(d => ({ value: d.value, label: d.label }))}
            />
            <Input
              label="Hora"
              type="time"
              value={selectedHour}
              onChange={(e) => setSelectedHour(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" size="sm" onClick={resetForm}>
              Cancelar
            </Button>
            <Button size="sm" onClick={handleAdd} disabled={!selectedClassId}>
              Agregar
            </Button>
          </div>
        </div>
      )}

      {/* Schedule by day */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {entriesByDay.map(({ weekday, label, entries }) => (
          <div key={weekday} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="bg-blue-600 px-3 py-2">
              <h4 className="font-semibold text-white">{label}</h4>
            </div>
            <div className="p-2 space-y-2 min-h-[100px]">
              {entries.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-4">Sin clases</p>
              ) : (
                entries.map(({ entry, cls, course }) => (
                  <div
                    key={entry.id}
                    className="bg-gray-50 rounded px-2 py-1.5 text-sm flex items-center justify-between group"
                  >
                    <div>
                      <span className="text-gray-500">{entry.hour}</span>
                      <span className="mx-1">-</span>
                      <span className="font-medium text-gray-900">{cls!.name}</span>
                      <span className="block text-xs text-gray-500">
                        {course!.grade}° {course!.level} {course!.division}
                      </span>
                    </div>
                    <button
                      onClick={() => setDeleteEntryId(entry.id)}
                      className="text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Eliminar"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Delete confirmation */}
      <ConfirmModal
        isOpen={deleteEntryId !== null}
        onClose={() => setDeleteEntryId(null)}
        onConfirm={handleDelete}
        title="Eliminar del horario"
        message="¿Estás seguro de eliminar esta clase del horario?"
        variant="danger"
        confirmText="Eliminar"
      />
    </div>
  );
}
