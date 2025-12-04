import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.BinaryStudio8.expensetracker",
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
    Geolocation: {
      androidBackgroundLocation: true,
    },

    "capacitor-notification-listener": {
      android: {
        path: "./plugins/capacitor-notification-listener/android",
      },
    },
  },
};

export default config;
