import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { ConfirmModal } from '../ui/Modal';
import { formatCourseName } from '../../types';
import type { Class } from '../../types';

export function ClassesConfig() {
  const { classes, courses, addClass, updateClass, deleteClass } = useApp();

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [courseId, setCourseId] = useState('');

  const resetForm = () => {
    setName('');
    setCourseId('');
    setIsAdding(false);
    setEditingId(null);
  };

  const handleAdd = async () => {
    if (!name.trim() || !courseId) return;
    await addClass({ name: name.trim(), courseId });
    resetForm();
  };

  const handleUpdate = async () => {
    if (editingId && name.trim() && courseId) {
      await updateClass(editingId, { name: name.trim(), courseId });
      resetForm();
    }
  };

  const handleEdit = (cls: Class) => {
    setEditingId(cls.id);
    setName(cls.name);
    setCourseId(cls.courseId);
  };

  const handleDelete = async () => {
    if (deleteId) {
      await deleteClass(deleteId);
      setDeleteId(null);
    }
  };

  const classToDelete = classes.find(c => c.id === deleteId);

  // Group classes by course
  const classesByCourse = courses.map(course => ({
    course,
    classes: classes.filter(c => c.courseId === course.id),
  }));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Materias</h3>
        {!isAdding && !editingId && courses.length > 0 && (
          <Button size="sm" onClick={() => setIsAdding(true)}>
            Agregar materia
          </Button>
        )}
      </div>

      {courses.length === 0 && (
        <p className="text-gray-500 text-sm">Primero debes crear al menos un curso.</p>
      )}

      {/* Add/Edit form */}
      {(isAdding || editingId) && (
        <div className="bg-white p-4 rounded-lg border border-gray-200 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Nombre de la materia"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Matemáticas"
            />
            <Select
              label="Curso"
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
              options={courses.map(c => ({ value: c.id, label: formatCourseName(c) }))}
              placeholder="Seleccionar curso..."
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" size="sm" onClick={resetForm}>
              Cancelar
            </Button>
            <Button size="sm" onClick={editingId ? handleUpdate : handleAdd} disabled={!name.trim() || !courseId}>
              {editingId ? 'Guardar' : 'Agregar'}
            </Button>
          </div>
        </div>
      )}

      {/* Classes grouped by course */}
      {classesByCourse.map(({ course, classes: courseClasses }) => (
        courseClasses.length > 0 && (
          <div key={course.id} className="space-y-2">
            <h4 className="text-sm font-medium text-gray-500">{formatCourseName(course)}</h4>
            <ul className="space-y-2">
              {courseClasses.map((cls) => (
                <li
                  key={cls.id}
                  className="flex items-center justify-between bg-white px-4 py-3 rounded-lg border border-gray-200"
                >
                  <span className="font-medium text-gray-900">{cls.name}</span>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(cls)}
                      disabled={editingId !== null}
                    >
                      Editar
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteId(cls.id)}
                      className="text-red-600 hover:bg-red-50"
                    >
                      Eliminar
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )
      ))}

      {classes.length === 0 && courses.length > 0 && (
        <p className="text-gray-500 text-sm">No hay materias registradas.</p>
      )}

      {/* Delete confirmation */}
      <ConfirmModal
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Eliminar materia"
        message={`¿Estás seguro de eliminar la materia "${classToDelete?.name}"?`}
        variant="danger"
        confirmText="Eliminar"
      />
    </div>
  );
}
