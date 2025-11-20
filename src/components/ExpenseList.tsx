import { useExpenseContext } from "@/context/expenseContext";
import { useState, useMemo } from "react";
import { Modal } from "@/base";
import { formatIndianCurrency } from "@/utils/number";

const DAY_IN_MS = 24 * 60 * 60 * 1000;

type RangeFilter = "today" | "7d" | "30d" | "all";

const rangeMeta: Record<
  RangeFilter,
  { label: string; description: string; window?: number }
> = {
  today: { label: "Today", description: "Only today's entries" },
  "7d": { label: "7 days", description: "Last 7 days", window: 7 },
  "30d": { label: "30 days", description: "Last 30 days", window: 30 },
  all: { label: "All time", description: "Everything not in trash" },
};

const getTimestamp = (date: string, time?: string) =>
  new Date(`${date} ${time ?? "00:00"}`).getTime();

export const ExpenseList = () => {
  const { expenses, deleteExpense } = useExpenseContext();

  const [modalVisible, setModalVisible] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [range, setRange] = useState<RangeFilter>("7d");

  const sortedExpenses = useMemo(() => {
    return [...expenses].sort(
      (a, b) => getTimestamp(b.date, b.time) - getTimestamp(a.date, a.time),
    );
  }, [expenses]);

  const activeExpenses = sortedExpenses.filter((expense) => !expense.deleted);

  const filteredExpenses = useMemo(() => {
    if (range === "all") return activeExpenses;
    if (range === "today") {
      const todayKey = new Date().toISOString().split("T")[0];
      return activeExpenses.filter((expense) => expense.date === todayKey);
    }
    const windowInMs = (rangeMeta[range].window ?? 0) * DAY_IN_MS;
    const now = Date.now();
    return activeExpenses.filter(
      (expense) => now - getTimestamp(expense.date, expense.time) < windowInMs,
    );
  }, [activeExpenses, range]);

  const displayedExpenses = filteredExpenses.slice(0, 5);
  const hiddenCount = Math.max(
    filteredExpenses.length - displayedExpenses.length,
    0,
  );

  const stats = useMemo(() => {
    if (filteredExpenses.length === 0) {
      return {
        average: 0,
        credits: 0,
        debits: 0,
        rangeTotal: 0,
      };
    }

    const absoluteTotal = filteredExpenses.reduce(
      (sum, expense) => sum + Math.abs(expense.amount),
      0,
    );
    const credits = filteredExpenses.filter(
      (expense) => expense.direction === "credit",
    ).length;
    const debits = filteredExpenses.length - credits;
    const rangeTotal = filteredExpenses.reduce(
      (sum, expense) => sum + expense.amount,
      0,
    );

    return {
      average: absoluteTotal / filteredExpenses.length,
      credits,
      debits,
      rangeTotal,
    };
  }, [filteredExpenses]);

  const handleConfirm = () => {
    if (pendingDeleteId) deleteExpense(pendingDeleteId);
    setModalVisible(false);
    setPendingDeleteId(null);
  };

  if (activeExpenses.length === 0)
    return (
      <div className="text-center mt-10 p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-md">
        <p className="text-gray-500 dark:text-gray-400 text-lg">
          No expenses yet. Start adding your first one! 💸
        </p>
      </div>
    );

  return (
    <div className="space-y-6">
      {/* Header Row */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">
            Recent Activity
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {rangeMeta[range].description}. Showing up to{" "}
            {displayedExpenses.length} entries
            {hiddenCount > 0 ? ` • ${hiddenCount} more in Manage Expenses` : ""}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(rangeMeta) as RangeFilter[]).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setRange(option)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                range === option
                  ? "bg-blue-600 text-white border-blue-500 shadow-lg"
                  : "bg-gray-50 dark:bg-gray-900/40 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-blue-300"
              }`}
            >
              {rangeMeta[option].label}
            </button>
          ))}
        </div>
      </div>

      {/* Active Expenses */}
      {displayedExpenses.length === 0 ? (
        <div className="text-center py-12 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40">
          <p className="text-gray-600 dark:text-gray-300 font-medium">
            No entries in this range yet.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {displayedExpenses.map((expense) => (
            <div
              key={expense.id}
              className="flex justify-between items-center bg-white dark:bg-gray-900/80
              border border-gray-100 dark:border-gray-700 rounded-2xl p-4
              shadow-sm hover:shadow-md transition-shadow duration-200"
            >
              <div>
                <p className="font-semibold text-gray-800 dark:text-gray-100">
                  {expense.title}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {new Date(`${expense.date} ${expense.time}`).toLocaleString(
                    "en-IN",
                    {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    },
                  )}
                </p>
              </div>

              <div className="flex items-center gap-4">
                <span
                  className={`font-bold text-sm sm:text-base ${
                    expense.direction === "credit"
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  ₹{formatIndianCurrency(Math.abs(expense.amount))}
                </span>
                <button
                  onClick={() => {
                    setPendingDeleteId(expense.id);
                    setModalVisible(true);
                  }}
                  className="text-red-500 hover:text-red-600 dark:hover:text-red-400 font-bold text-lg transition-transform hover:scale-110"
                  title="Move to Trash"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quick Stats */}
      {filteredExpenses.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
          <div className="rounded-2xl border border-blue-100 dark:border-blue-900/40 bg-blue-50/60 dark:bg-blue-950/10 p-4">
            <p className="text-xs uppercase text-blue-500 font-semibold">
              Avg per entry
            </p>
            <p className="text-xl font-bold text-blue-700 dark:text-blue-300 mt-2">
              ₹{formatIndianCurrency(stats.average)}
            </p>
          </div>
          <div className="rounded-2xl border border-emerald-100 dark:border-emerald-900/40 bg-emerald-50/60 dark:bg-emerald-950/10 p-4">
            <p className="text-xs uppercase text-emerald-500 font-semibold">
              Credits
            </p>
            <p className="text-xl font-bold text-emerald-700 dark:text-emerald-300 mt-2">
              {stats.credits}
            </p>
          </div>
          <div className="rounded-2xl border border-rose-100 dark:border-rose-900/40 bg-rose-50/60 dark:bg-rose-950/10 p-4">
            <p className="text-xs uppercase text-rose-500 font-semibold">
              Debits
            </p>
            <p className="text-xl font-bold text-rose-700 dark:text-rose-300 mt-2">
              {stats.debits}
            </p>
          </div>
        </div>
      )}

      {/* Modal */}
      {modalVisible && (
        <Modal
          show={modalVisible}
          type="warning"
          title="Move to Trash?"
          message="This expense will go to Manage Expenses where you can restore or delete it permanently."
          confirmText="Move"
          cancelText="Cancel"
          onConfirm={handleConfirm}
          onCancel={() => {
            setModalVisible(false);
            setPendingDeleteId(null);
          }}
        />
      )}
    </div>
  );
};
