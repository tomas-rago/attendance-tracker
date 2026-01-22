import { useState } from 'react';
import { useApp } from './context/AppContext';
import { Layout } from './components/Layout';
import { TeacherSetup } from './components/config/TeacherSetup';
import { AttendancePage } from './pages/AttendancePage';
import { ConfigPage } from './pages/ConfigPage';

function App() {
  const { teacher, isLoading } = useApp();
  const [currentView, setCurrentView] = useState<'attendance' | 'config'>('attendance');
  const [showSetup, setShowSetup] = useState(false);

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  // Show setup modal if teacher hasn't been configured
  const needsSetup = !teacher?.setupComplete;

  return (
    <>
      <Layout currentView={currentView} onViewChange={setCurrentView}>
        {currentView === 'attendance' ? <AttendancePage /> : <ConfigPage />}
      </Layout>

      <TeacherSetup
        isOpen={needsSetup || showSetup}
        onComplete={() => setShowSetup(false)}
      />
    </>
  );
}

export default App;
