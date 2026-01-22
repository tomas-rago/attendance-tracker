import { useState } from 'react';
import type { Reason } from '../../types';
import { REASONS } from '../../types';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';

interface FinishDayModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFinish: (reason?: Reason) => void;
  pendingClassesCount: number;
  dateString: string;
}

export function FinishDayModal({
  isOpen,
  onClose,
  onFinish,
  pendingClassesCount,
  dateString,
}: FinishDayModalProps) {
  const [skipClasses, setSkipClasses] = useState(false);
  const [reason, setReason] = useState<Reason | ''>('');

  const handleFinish = () => {
    if (skipClasses && reason) {
      onFinish(reason);
    } else if (!skipClasses) {
      onFinish();
    }
    setSkipClasses(false);
    setReason('');
  };

  const canFinish = !skipClasses || (skipClasses && reason);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Finalizar día"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={handleFinish}
            disabled={!canFinish}
          >
            Finalizar
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <p className="text-gray-600">
          Fecha: <span className="font-medium">{dateString}</span>
        </p>

        {pendingClassesCount > 0 && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800">
              <span className="font-medium">Atención:</span> Hay {pendingClassesCount} clase(s) sin asistencia tomada.
            </p>
          </div>
        )}

        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={skipClasses}
              onChange={(e) => setSkipClasses(e.target.checked)}
              className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-gray-700">No se dieron clases este día</span>
          </label>

          {skipClasses && (
            <Select
              label="Motivo"
              value={reason}
              onChange={(e) => setReason(e.target.value as Reason | '')}
              options={REASONS.map(r => ({ value: r, label: r }))}
              placeholder="Seleccionar motivo..."
            />
          )}
        </div>

        {!skipClasses && pendingClassesCount === 0 && (
          <p className="text-green-600">
            Todas las clases tienen asistencia tomada.
          </p>
        )}
      </div>
    </Modal>
  );
}
