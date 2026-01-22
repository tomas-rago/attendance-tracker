import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { ConfirmModal } from '../ui/Modal';
import { formatCourseName } from '../../types';
import type { Student } from '../../types';

export function StudentsConfig() {
  const { students, courses, addStudent, updateStudent, deleteStudent, getCourseById } = useApp();

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [filterCourseId, setFilterCourseId] = useState<string>('');

  // Form state
  const [name, setName] = useState('');
  const [identificationNumber, setIdentificationNumber] = useState('');
  const [courseId, setCourseId] = useState('');

  const resetForm = () => {
    setName('');
    setIdentificationNumber('');
    setCourseId('');
    setIsAdding(false);
    setEditingId(null);
  };

  const handleAdd = async () => {
    if (!name.trim() || !courseId) return;
    await addStudent({ name: name.trim(), identificationNumber: identificationNumber.trim(), courseId });
    resetForm();
  };

  const handleUpdate = async () => {
    if (editingId && name.trim() && courseId) {
      await updateStudent(editingId, { name: name.trim(), identificationNumber: identificationNumber.trim(), courseId });
      resetForm();
    }
  };

  const handleEdit = (student: Student) => {
    setEditingId(student.id);
    setName(student.name);
    setIdentificationNumber(student.identificationNumber);
    setCourseId(student.courseId);
  };

  const handleDelete = async () => {
    if (deleteId) {
      await deleteStudent(deleteId);
      setDeleteId(null);
    }
  };

  const studentToDelete = students.find(s => s.id === deleteId);

  // Filter students by course
  const filteredStudents = filterCourseId
    ? students.filter(s => s.courseId === filterCourseId)
    : students;

  // Sort students by name
  const sortedStudents = [...filteredStudents].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Alumnos</h3>
        {!isAdding && !editingId && courses.length > 0 && (
          <Button size="sm" onClick={() => setIsAdding(true)}>
            Agregar alumno
          </Button>
        )}
      </div>

      {courses.length === 0 && (
        <p className="text-gray-500 text-sm">Primero debes crear al menos un curso.</p>
      )}

      {/* Filter by course */}
      {students.length > 0 && !isAdding && !editingId && (
        <Select
          value={filterCourseId}
          onChange={(e) => setFilterCourseId(e.target.value)}
          options={courses.map(c => ({ value: c.id, label: formatCourseName(c) }))}
          placeholder="Todos los cursos"
          className="max-w-xs"
        />
      )}

      {/* Add/Edit form */}
      {(isAdding || editingId) && (
        <div className="bg-white p-4 rounded-lg border border-gray-200 space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <Input
              label="Nombre completo"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Juan Pérez"
            />
            <Input
              label="DNI / Identificación"
              value={identificationNumber}
              onChange={(e) => setIdentificationNumber(e.target.value)}
              placeholder="Ej: 12345678"
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

      {/* Student list */}
      {sortedStudents.length === 0 ? (
        courses.length > 0 && (
          <p className="text-gray-500 text-sm">
            {filterCourseId ? 'No hay alumnos en este curso.' : 'No hay alumnos registrados.'}
          </p>
        )
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Nombre</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">DNI</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Curso</th>
                <th className="px-4 py-2 text-right text-sm font-semibold text-gray-700">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {sortedStudents.map((student) => {
                const course = getCourseById(student.courseId);
                return (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-900">{student.name}</td>
                    <td className="px-4 py-3 text-gray-600">{student.identificationNumber || '-'}</td>
                    <td className="px-4 py-3 text-gray-600">{course ? formatCourseName(course) : '-'}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(student)}
                          disabled={editingId !== null}
                        >
                          Editar
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteId(student.id)}
                          className="text-red-600 hover:bg-red-50"
                        >
                          Eliminar
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete confirmation */}
      <ConfirmModal
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Eliminar alumno"
        message={`¿Estás seguro de eliminar al alumno "${studentToDelete?.name}"?`}
        variant="danger"
        confirmText="Eliminar"
      />
    </div>
  );
}
