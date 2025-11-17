import type { PluginListenerHandle } from "@capacitor/core";

export interface NotificationData {
  package: string;
  title?: string;
  text?: string;
}

export interface NotificationListenerPlugin {
  requestPermission(): Promise<{ granted: boolean }>;
  addListener(
    eventName: "notificationReceived",
    listenerFunc: (data: NotificationData) => void,
  ): Promise<PluginListenerHandle>;
}
