import { Capacitor } from "@capacitor/core";
import { useEffect, useRef } from "react";
import { classifyTransaction } from "@/utils";
import { useExpenseContext } from "@/context";
import type { PluginListenerHandle } from "@capacitor/core";
import { NotificationListener } from "@plugins/capacitor-notification-listener";
import { NotificationData } from "@/props";

export function useNotificationListener() {
  const { addExpense, expenses } = useExpenseContext();
  const expenseRef = useRef(expenses);
  expenseRef.current = expenses;

  useEffect(() => {
    if (Capacitor.getPlatform() === "web") return;

    let handle: PluginListenerHandle | undefined;

    async function init() {
      try {
        await NotificationListener.requestPermission();
      } catch (err) {
        console.log("Notification listener permission error:", err);
        return;
      }

      handle = await NotificationListener.addListener(
        "notificationReceived",
        (data: NotificationData) => {
          try {
            const body = data?.text || data?.title || "";
            if (!body) return;

            const parsed = classifyTransaction(body);
            if (!parsed) return;

            const exists = expenseRef.current.some(
              (e) => e.hash === parsed.hash,
            );
            if (exists) return;

            addExpense({
              title: parsed.party || "Unknown",
              merchant: parsed.party || null,
              direction: parsed.direction,

              amount:
                parsed.direction === "credit"
                  ? -parsed.amount!
                  : parsed.amount!,

              description: parsed.raw,
              category: parsed.category,
              hash: parsed.hash,

              date: new Date().toISOString().split("T")[0],
              time: new Date().toISOString(),

              confidence: parsed.confidence,
              tags: parsed.tags,
              source: "notification",
            });
          } catch (err) {
            console.log("Notification parsing error:", err);
          }
        },
      );
    }

    init();

    return () => {
      try {
        handle?.remove();
      } catch (err) {
        console.log("Notification listener removal error:", err);
      }
    };
  }, [addExpense]);
}
