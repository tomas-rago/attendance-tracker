import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.asistencia.app',
  appName: 'Control de Asistencia',
  webDir: 'dist',
  android: {
    backgroundColor: '#ffffff',
  },
  server: {
    androidScheme: 'https'
  }
};

export default config;
