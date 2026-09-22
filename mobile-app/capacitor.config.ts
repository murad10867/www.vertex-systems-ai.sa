import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.vertexsystems.ai',
  appName: 'Vertex Systems AI',
  webDir: 'www',
  server: {
    url: 'https://murad10867.github.io/www.vertex-systems-ai.sa/',
    cleartext: false,
    allowNavigation: [
      'murad10867.github.io',
      '*.supabase.co'
    ]
  },
  android: {
    allowMixedContent: false,
    backgroundColor: '#08111f'
  },
  ios: {
    backgroundColor: '#08111f',
    contentInset: 'automatic'
  },
  plugins: {
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#08111f',
      overlaysWebView: false
    },
    SplashScreen: {
      launchShowDuration: 1800,
      launchAutoHide: true,
      backgroundColor: '#08111f',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false
    }
  }
};

export default config;
