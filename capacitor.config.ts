import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.bottomsnode.expensetracker',
  appName: 'expense-tracker',
  webDir: 'dist',

  server: {
    androidScheme: 'https',
    cleartext: true   // allow http if needed (local API, debug)
  },

  android: {
    allowMixedContent: true, // avoids images/api blocking inside WebView
    captureInput: true       // improves keyboard handling
  },

  loggingBehavior: 'production'
};

export default config;
