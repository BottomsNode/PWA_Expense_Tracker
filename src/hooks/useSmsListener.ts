import { Capacitor } from "@capacitor/core";
import { useEffect, useRef } from "react";
import { classifySms } from "@/utils/smsClassifier";
import { useExpenseContext } from "@/context";
import { SmsReceivedEvent } from "@/types";
import { SmsMessage, Sms } from "@plugins/capacitor-sms";

export function useSmsListener() {
  const { addExpense, expenses } = useExpenseContext();

  const expenseRef = useRef(expenses);
  expenseRef.current = expenses;

  useEffect(() => {
    if (Capacitor.getPlatform() === "web") return;

    async function init() {
      try {
        await Sms.requestPermissions();
      } catch (err) {
        console.log("SMS permission denied:", err);
        return;
      }

      const handler = (event: SmsReceivedEvent) => {
        try {
          const sms: SmsMessage = JSON.parse(event.detail);

          const parsed = classifySms(sms.body);
          if (!parsed) return;

          // Prevent duplicates
          const exists = expenseRef.current.some((e) => e.hash === parsed.hash);
          if (exists) return;

          addExpense({
            title: parsed.party || "Unknown",
            amount:
              parsed.direction === "credit" ? -parsed.amount! : parsed.amount!,
            description: parsed.raw,
            category: parsed.category,
            hash: parsed.hash,
            date: new Date().toISOString().split("T")[0],
            time: new Date().toISOString(),
            confidence: parsed.confidence,
            tags: parsed.tags,
            source: "sms",
          });
        } catch (err) {
          console.log("SMS parsing error:", err);
        }
      };

      window.addEventListener("onSMSReceived", handler as EventListener);

      return () => {
        window.removeEventListener("onSMSReceived", handler as EventListener);
      };
    }

    init();
  }, [addExpense]);
}
