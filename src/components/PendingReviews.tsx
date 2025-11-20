import React, { useMemo, useState } from "react";
import { DetectedReview } from "./DetectedReview";
import { useNotificationReview } from "@/utils";
import { useExpenseContext } from "@/context";
import { DraftState, ParsedTxn } from "@/props";

function deriveRecordedAt(txn: ParsedTxn) {
  if (txn.createdAt) return new Date(txn.createdAt);
  if (txn.timestamp) {
    const parsed = Date.parse(txn.timestamp);
    if (!Number.isNaN(parsed)) return new Date(parsed);
  }
  return new Date();
}

function buildExpensePayload(txn: ParsedTxn) {
  if (txn.amount == null) return null;
  const recordDate = deriveRecordedAt(txn);

  return {
    title: txn.merchant ?? txn.sender ?? "Notification expense",
    amount: txn.amount,
    date: recordDate.toLocaleDateString("en-CA"),
    time: recordDate.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }),
    description: txn.raw,
    merchant: txn.merchant ?? txn.sender ?? null,
    direction: txn.direction ?? "unknown",
    confidence: txn.confidence,
    source: "notification" as const,
  };
}

export const PendingReviews: React.FC = () => {
  const { pending, resolve } = useNotificationReview();
  const { addExpense } = useExpenseContext();
  const [draft, setDraft] = useState<DraftState | null>(null);
  const [error, setError] = useState<string | null>(null);

  const displayList = useMemo(() => pending.slice(0, 10), [pending]);

  if (!displayList.length) return null;

  const handleAccept = (id: string) => {
    const txn = pending.find((item) => item.id === id);
    if (!txn) return;
    const payload = buildExpensePayload(txn);
    if (!payload) {
      setError("Amount missing. Please edit before adding.");
      return;
    }
    addExpense(payload);
    resolve(id);
    setError(null);
  };

  const handleIgnore = (id: string) => {
    resolve(id);
  };

  const handleEdit = (txn: ParsedTxn) => {
    setError(null);
    setDraft({
      id: txn.id,
      title: txn.merchant ?? txn.sender ?? "Notification expense",
      amount: txn.amount?.toString() ?? "",
      notes: txn.raw,
      direction: txn.direction ?? "unknown",
      merchant: txn.merchant ?? null,
      sender: txn.sender ?? null,
      confidence: txn.confidence,
    });
  };

  const saveDraft = () => {
    if (!draft) return;
    const amountValue = Number(draft.amount);
    if (!Number.isFinite(amountValue) || amountValue <= 0) {
      setError("Enter a valid amount greater than zero.");
      return;
    }

    const recordDate = draft.id
      ? deriveRecordedAt(
          pending.find((p) => p.id === draft.id) ?? ({} as ParsedTxn),
        )
      : new Date();
    addExpense({
      title: draft.title.trim() || "Notification expense",
      amount: amountValue,
      date: recordDate.toLocaleDateString("en-CA"),
      time: recordDate.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }),
      description: draft.notes.trim() || undefined,
      merchant: draft.merchant ?? draft.sender ?? null,
      direction: draft.direction ?? "unknown",
      confidence: draft.confidence,
      source: "notification",
    });
    resolve(draft.id);
    setDraft(null);
    setError(null);
  };

  return (
    <section className="space-y-5 w-full max-w-2xl mx-auto px-3 md:px-0">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Pending Reviews
        </h2>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {pending.length} awaiting review
        </span>
      </div>

      {/* Review Cards */}
      <div className="space-y-4">
        {displayList.map((txn) => (
          <DetectedReview
            key={txn.id}
            txn={txn}
            onAccept={handleAccept}
            onIgnore={handleIgnore}
            onEdit={handleEdit}
          />
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="text-sm text-red-500 bg-red-100 dark:bg-red-900/20 px-4 py-2 rounded-lg">
          {error}
        </div>
      )}

      {/* Edit Modal */}
      {draft && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl p-5 space-y-4 shadow-xl border border-gray-200 dark:border-gray-700 animate-fadeIn">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Edit & Approve
            </h3>

            {/* Title */}
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Title
              <input
                className="mt-1 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm"
                value={draft.title}
                onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              />
            </label>

            {/* Amount */}
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Amount (₹)
              <input
                type="number"
                min="0"
                step="0.01"
                className="mt-1 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm"
                value={draft.amount}
                onChange={(e) => setDraft({ ...draft, amount: e.target.value })}
              />
            </label>

            {/* Notes */}
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Notes
              <textarea
                rows={3}
                className="mt-1 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm"
                value={draft.notes}
                onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
              />
            </label>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-3">
              <button
                className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-800"
                onClick={() => setDraft(null)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded-lg bg-blue-600 text-white"
                onClick={saveDraft}
              >
                Save & Add
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
