import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.mygearbase.app',
  appName: 'GearBase',
  webDir: 'dist',
  server: {
    // Allow navigation to your domain for deep links
    allowNavigation: ['mygearbase.com', '*.mygearbase.com', '*.supabase.co'],
  },
  ios: {
    contentInset: 'automatic',
    preferredContentMode: 'mobile',
    scheme: 'GearBase',
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: true,
      launchShowDuration: 2000,
      backgroundColor: '#0c0a09', // stone-950 to match your dark theme
      showSpinner: false,
    },
    StatusBar: {
      style: 'DARK', // Light text on dark background
      backgroundColor: '#0c0a09',
    },
    Keyboard: {
      resizeOnFullScreen: true,
    },
  },
};

export default config;
