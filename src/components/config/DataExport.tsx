import { useState, useRef } from 'react';
import { Button } from '../ui/Button';
import { ConfirmModal } from '../ui/Modal';
import { downloadDataAsJson, importDataFromFile } from '../../utils/export';
import { clearAllData } from '../../db/database';
import { useApp } from '../../context/AppContext';

export function DataExport() {
  const { refreshData } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [showImportConfirm, setShowImportConfirm] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleExport = async () => {
    setIsExporting(true);
    setMessage(null);
    try {
      await downloadDataAsJson();
      setMessage({ type: 'success', text: 'Datos exportados correctamente.' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Error al exportar los datos.' });
    } finally {
      setIsExporting(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPendingFile(file);
      setShowImportConfirm(true);
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleImportConfirm = async () => {
    if (!pendingFile) return;

    setIsImporting(true);
    setShowImportConfirm(false);
    setMessage(null);

    try {
      await importDataFromFile(pendingFile);
      refreshData();
      setMessage({ type: 'success', text: 'Datos importados correctamente.' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Error al importar los datos. Verifica que el archivo sea válido.' });
    } finally {
      setIsImporting(false);
      setPendingFile(null);
    }
  };

  const handleClearData = async () => {
    setShowClearConfirm(false);
    try {
      await clearAllData();
      refreshData();
      setMessage({ type: 'success', text: 'Todos los datos han sido eliminados.' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Error al eliminar los datos.' });
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Exportar / Importar datos</h3>

      <p className="text-sm text-gray-600">
        Exporta tus datos periódicamente para crear copias de seguridad. Puedes importarlos
        en este u otro dispositivo para restaurar la información.
      </p>

      {/* Message */}
      {message && (
        <div className={`p-3 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
          {message.text}
        </div>
      )}

      {/* Export/Import buttons */}
      <div className="flex flex-wrap gap-3">
        <Button
          onClick={handleExport}
          disabled={isExporting}
        >
          {isExporting ? 'Exportando...' : 'Exportar datos'}
        </Button>

        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileSelect}
            className="hidden"
            id="import-file"
          />
          <Button
            variant="secondary"
            onClick={() => fileInputRef.current?.click()}
            disabled={isImporting}
          >
            {isImporting ? 'Importando...' : 'Importar datos'}
          </Button>
        </div>

        <Button
          variant="danger"
          onClick={() => setShowClearConfirm(true)}
        >
          Eliminar todos los datos
        </Button>
      </div>

      {/* Import confirmation */}
      <ConfirmModal
        isOpen={showImportConfirm}
        onClose={() => {
          setShowImportConfirm(false);
          setPendingFile(null);
        }}
        onConfirm={handleImportConfirm}
        title="Importar datos"
        message="Esta acción reemplazará todos los datos actuales con los del archivo seleccionado. ¿Deseas continuar?"
        variant="danger"
        confirmText="Importar"
      />

      {/* Clear data confirmation */}
      <ConfirmModal
        isOpen={showClearConfirm}
        onClose={() => setShowClearConfirm(false)}
        onConfirm={handleClearData}
        title="Eliminar todos los datos"
        message="Esta acción eliminará permanentemente todos los cursos, materias, alumnos, horarios y registros de asistencia. Esta acción no se puede deshacer. ¿Estás seguro?"
        variant="danger"
        confirmText="Eliminar todo"
      />
    </div>
  );
}
