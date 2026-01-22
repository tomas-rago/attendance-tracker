import type { ReactNode } from 'react';
import { useApp } from '../context/AppContext';

interface LayoutProps {
  children: ReactNode;
  currentView: 'attendance' | 'config';
  onViewChange: (view: 'attendance' | 'config') => void;
}

export function Layout({ children, currentView, onViewChange }: LayoutProps) {
  const { teacher } = useApp();

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {/* Top bar */}
      <header className="bg-blue-600 text-white px-4 py-2 flex items-center justify-between shadow-md">
        <h1 className="text-lg font-bold">Control de Asistencia</h1>

        <div className="flex items-center gap-4">
          {teacher?.name && (
            <span className="text-blue-100 text-sm">
              {teacher.name}
            </span>
          )}

          <nav className="flex gap-1">
            <button
              onClick={() => onViewChange('attendance')}
              className={`
                px-4 py-1.5 rounded-lg text-sm font-medium transition-colors
                ${currentView === 'attendance'
                  ? 'bg-white text-blue-600'
                  : 'bg-blue-500 text-white hover:bg-blue-400'}
              `}
            >
              Asistencia
            </button>
            <button
              onClick={() => onViewChange('config')}
              className={`
                px-4 py-1.5 rounded-lg text-sm font-medium transition-colors
                ${currentView === 'config'
                  ? 'bg-white text-blue-600'
                  : 'bg-blue-500 text-white hover:bg-blue-400'}
              `}
            >
              Configuración
            </button>
          </nav>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
