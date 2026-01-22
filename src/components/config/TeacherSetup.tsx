import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

interface TeacherSetupProps {
  isOpen: boolean;
  onComplete: () => void;
}

export function TeacherSetup({ isOpen, onComplete }: TeacherSetupProps) {
  const { setTeacherName } = useApp();
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      await setTeacherName(name.trim());
      onComplete();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {}} // Cannot close without entering name
      title="Bienvenido/a"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-gray-600">
          Por favor, ingresa tu nombre para identificarte en la aplicación.
        </p>

        <Input
          label="Nombre del docente"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ej: María García"
          autoFocus
        />

        <div className="flex justify-end pt-2">
          <Button type="submit" disabled={!name.trim() || isSubmitting}>
            {isSubmitting ? 'Guardando...' : 'Comenzar'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
