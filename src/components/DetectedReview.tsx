import React from "react";
import { formatIndianCurrency } from "@/utils";
import { DetectedReviewProps } from "@/props";

export const DetectedReview: React.FC<DetectedReviewProps> = ({
  txn,
  onAccept,
  onEdit,
  onIgnore,
}) => {
  const hasAmount = txn.amount != null;

  return (
    <div className="p-4 rounded-xl bg-gray-800 text-white border border-gray-700">
      <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
        <div className="min-w-0 flex-1 space-y-1">
          <div className="text-xs text-gray-400 uppercase tracking-wide">
            {txn.sender || "Unknown sender"}
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 flex-wrap">
            <div className="text-lg font-semibold truncate">
              {txn.merchant ?? "Unknown merchant"}
            </div>
            {txn.direction && txn.direction !== "unknown" && (
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-gray-700 uppercase">
                {txn.direction}
              </span>
            )}
          </div>
          <div className="text-xl font-bold mt-1">
            {hasAmount
              ? `₹${formatIndianCurrency(txn.amount!)}`
              : "Amount missing"}
          </div>
          <div className="text-xs text-gray-400 flex flex-wrap gap-3">
            {txn.accountMask && <span>{txn.accountMask}</span>}
            {txn.timestamp && <span>{txn.timestamp}</span>}
            <span>Confidence: {txn.confidence}%</span>
          </div>
        </div>
        <div className="flex flex-row md:flex-col gap-2 shrink-0 justify-center md:justify-start">
          <button
            onClick={() => onAccept(txn.id)}
            className="px-3 py-1 rounded bg-blue-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-sm"
            disabled={!hasAmount}
            title={hasAmount ? "Add expense" : "Amount required before adding"}
          >
            Add
          </button>
          {onEdit && (
            <button
              onClick={() => onEdit(txn)}
              className="px-3 py-1 rounded bg-yellow-600 text-black text-sm"
            >
              Edit
            </button>
          )}
          <button
            onClick={() => onIgnore(txn.id)}
            className="px-3 py-1 rounded bg-gray-600 text-sm"
          >
            Ignore
          </button>
        </div>
      </div>
      <pre className="mt-3 text-xs text-gray-400 whitespace-pre-wrap break-words border-t border-gray-700 pt-3">
        {txn.raw}
      </pre>
    </div>
  );
};
