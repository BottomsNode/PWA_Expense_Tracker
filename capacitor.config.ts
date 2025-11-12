import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.bottomsnode.expensetracker',
  appName: 'expense-tracker',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
  loggingBehavior: 'production',
};

export default config;
