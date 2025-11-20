import { Capacitor } from "@capacitor/core";
import { useEffect } from "react";
import type { PluginListenerHandle } from "@capacitor/core";
import { NotificationListener } from "@plugins/capacitor-notification-listener";
import { NotificationData } from "@/props";
import {
  detectSenderWhitelisted,
  isDuplicate,
  parseNotification,
  pushPending,
} from "@/utils";

export function useNotificationListener() {
  useEffect(() => {
    if (Capacitor.getPlatform() === "web") return;

    let handle: PluginListenerHandle | undefined;

    async function init() {
      try {
        const permission = await NotificationListener.requestPermission();
        if (!permission?.granted) return;
      } catch (err) {
        console.error("Notification permission error:", err);
        return;
      }

      handle = await NotificationListener.addListener(
        "notificationReceived",
        (data: NotificationData) => {
          try {
            const text = (data?.text ?? data?.title ?? "").trim();
            if (!text) return;

            const sender = data?.packageName ?? null;
            if (!detectSenderWhitelisted(sender)) {
              return;
            }

            const timestamp = data?.postTime ?? Date.now();
            const parsed = parseNotification(text, sender, timestamp);
            if (!parsed) return;
            if (isDuplicate(parsed.id)) {
              return;
            }
            pushPending(parsed);
          } catch (err) {
            console.error("Notification parsing error:", err);
          }
        },
      );
    }

    init();

    return () => {
      try {
        handle?.remove();
      } catch {
        /* noop */
      }
    };
  }, []);
}
