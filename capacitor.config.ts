import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.bottomsnode.expensetracker",
  appName: "expense-tracker",
  webDir: "dist",

  server: {
    androidScheme: "https",
    cleartext: true,
  },

  android: {
    allowMixedContent: true,
    captureInput: true,
  },

  loggingBehavior: "production",

  plugins: {
    "capacitor-sms": {
      android: {
        path: "./plugins/capacitor-sms/android",
      },
    },
  },
};

export default config;
