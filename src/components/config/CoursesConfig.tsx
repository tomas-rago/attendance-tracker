import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';
import { ConfirmModal } from '../ui/Modal';
import { GRADES, LEVELS, DIVISIONS, formatCourseName } from '../../types';
import type { Course, Level, Division } from '../../types';

export function CoursesConfig() {
  const { courses, addCourse, updateCourse, deleteCourse } = useApp();

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Form state
  const [grade, setGrade] = useState<number>(1);
  const [level, setLevel] = useState<Level>('Primario');
  const [division, setDivision] = useState<Division>('A');

  const resetForm = () => {
    setGrade(1);
    setLevel('Primario');
    setDivision('A');
    setIsAdding(false);
    setEditingId(null);
  };

  const handleAdd = async () => {
    await addCourse({ grade: grade as 1|2|3|4|5|6, level, division });
    resetForm();
  };

  const handleUpdate = async () => {
    if (editingId) {
      await updateCourse(editingId, { grade: grade as 1|2|3|4|5|6, level, division });
      resetForm();
    }
  };

  const handleEdit = (course: Course) => {
    setEditingId(course.id);
    setGrade(course.grade);
    setLevel(course.level);
    setDivision(course.division);
  };

  const handleDelete = async () => {
    if (deleteId) {
      await deleteCourse(deleteId);
      setDeleteId(null);
    }
  };

  const courseToDelete = courses.find(c => c.id === deleteId);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Cursos</h3>
        {!isAdding && !editingId && (
          <Button size="sm" onClick={() => setIsAdding(true)}>
            Agregar curso
          </Button>
        )}
      </div>

      {/* Add/Edit form */}
      {(isAdding || editingId) && (
        <div className="bg-white p-4 rounded-lg border border-gray-200 space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <Select
              label="Grado"
              value={grade}
              onChange={(e) => setGrade(Number(e.target.value))}
              options={GRADES.map(g => ({ value: g, label: `${g}°` }))}
            />
            <Select
              label="Nivel"
              value={level}
              onChange={(e) => setLevel(e.target.value as Level)}
              options={LEVELS.map(l => ({ value: l, label: l }))}
            />
            <Select
              label="División"
              value={division}
              onChange={(e) => setDivision(e.target.value as Division)}
              options={DIVISIONS.map(d => ({ value: d, label: d }))}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" size="sm" onClick={resetForm}>
              Cancelar
            </Button>
            <Button size="sm" onClick={editingId ? handleUpdate : handleAdd}>
              {editingId ? 'Guardar' : 'Agregar'}
            </Button>
          </div>
        </div>
      )}

      {/* Course list */}
      {courses.length === 0 ? (
        <p className="text-gray-500 text-sm">No hay cursos registrados.</p>
      ) : (
        <ul className="space-y-2">
          {courses.map((course) => (
            <li
              key={course.id}
              className="flex items-center justify-between bg-white px-4 py-3 rounded-lg border border-gray-200"
            >
              <span className="font-medium text-gray-900">
                {formatCourseName(course)}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEdit(course)}
                  disabled={editingId !== null}
                >
                  Editar
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDeleteId(course.id)}
                  className="text-red-600 hover:bg-red-50"
                >
                  Eliminar
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Delete confirmation */}
      <ConfirmModal
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Eliminar curso"
        message={`¿Estás seguro de eliminar el curso "${courseToDelete ? formatCourseName(courseToDelete) : ''}"? También se eliminarán todas las materias y alumnos asociados.`}
        variant="danger"
        confirmText="Eliminar"
      />
    </div>
  );
}
