import { useExpenseContext } from "@/context/expenseContext";
import { useState, useMemo } from "react";
import { Modal } from "@/base";
import { formatIndianCurrency } from "@/utils/number";

export const ExpenseList = () => {
  const { expenses, deleteExpense, clearAll, purgeDeleted, total } =
    useExpenseContext();

  const [modalType, setModalType] = useState<
    "delete" | "clear" | "purge" | null
  >(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  // 🔥 Sort NEWEST → OLDEST using date + time
  const sortedExpenses = useMemo(() => {
    return [...expenses].sort((a, b) => {
      const tA = new Date(`${a.date} ${a.time}`).getTime();
      const tB = new Date(`${b.date} ${b.time}`).getTime();
      return tB - tA; // newest first
    });
  }, [expenses]);

  const activeExpenses = sortedExpenses.filter((e) => !e.deleted);
  const deletedExpenses = sortedExpenses.filter((e) => e.deleted);

  const handleConfirm = () => {
    switch (modalType) {
      case "delete":
        if (pendingDeleteId) deleteExpense(pendingDeleteId);
        break;
      case "clear":
        clearAll();
        break;
      case "purge":
        purgeDeleted();
        break;
    }
    setModalType(null);
    setPendingDeleteId(null);
  };

  if (activeExpenses.length === 0 && deletedExpenses.length === 0)
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
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">
          Recent Expenses
        </h3>
        <div className="flex gap-3">
          <button
            onClick={() => setModalType("clear")}
            className="text-sm text-red-500 hover:text-red-600 dark:hover:text-red-400 font-medium transition-colors"
          >
            Clear All
          </button>
          {deletedExpenses.length > 0 && (
            <button
              onClick={() => setModalType("purge")}
              className="text-sm text-orange-500 hover:text-orange-600 dark:hover:text-orange-400 font-medium transition-colors"
            >
              Empty Trash
            </button>
          )}
        </div>
      </div>

      {/* Active Expenses */}
      <div className="space-y-4">
        {activeExpenses.map((e) => (
          <div
            key={e.id}
            className="flex justify-between items-center bg-white dark:bg-gray-800
              border border-gray-100 dark:border-gray-700 rounded-2xl p-4
              shadow-sm hover:shadow-md transition-shadow duration-200"
          >
            <div>
              <p className="font-semibold text-gray-800 dark:text-gray-100">
                {e.title}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {new Date(`${e.date} ${e.time}`).toLocaleString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>

            <div className="flex items-center gap-4">
              <span
                className={`font-bold text-sm sm:text-base ${
                  e.direction === "credit"
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400"
                }`}
              >
                ₹{formatIndianCurrency(Math.abs(e.amount))}
              </span>
              <button
                onClick={() => {
                  setPendingDeleteId(e.id);
                  setModalType("delete");
                }}
                className="text-red-500 hover:text-red-600 dark:hover:text-red-400 font-bold text-lg transition-transform hover:scale-110"
                title="Delete Expense"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Deleted Expenses */}
      {deletedExpenses.length > 0 && (
        <div className="mt-8 border-t pt-4">
          <h4 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-3">
            Deleted Items
          </h4>
          <div className="space-y-2">
            {deletedExpenses.map((e) => (
              <div
                key={e.id}
                className="flex justify-between items-center bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl p-3 text-sm"
              >
                <span className="line-through text-gray-400 dark:text-gray-500">
                  {e.title}
                </span>
                <span className="text-gray-400 dark:text-gray-500">
                  ₹{formatIndianCurrency(Math.abs(e.amount))}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Total */}
      <div className="mt-6 text-right">
        <span className="text-lg font-semibold text-gray-800 dark:text-gray-100">
          Total:{" "}
          <span className="text-blue-600 dark:text-blue-400">
            ₹{formatIndianCurrency(total)}
          </span>
        </span>
      </div>

      {/* Modal */}
      {modalType && (
        <Modal
          show={!!modalType}
          type={modalType === "delete" ? "error" : "warning"}
          title={
            modalType === "delete"
              ? "Delete Expense?"
              : modalType === "clear"
                ? "Clear All Expenses?"
                : "Empty Trash?"
          }
          message={
            modalType === "delete"
              ? "Are you sure you want to remove this entry? You can recover it later."
              : modalType === "clear"
                ? "This will remove all your expenses (including deleted ones). Are you sure?"
                : "This will permanently delete all removed entries. This action cannot be undone."
          }
          confirmText={
            modalType === "delete"
              ? "Delete"
              : modalType === "clear"
                ? "Clear All"
                : "Delete Permanently"
          }
          cancelText="Cancel"
          onConfirm={handleConfirm}
          onCancel={() => {
            setModalType(null);
            setPendingDeleteId(null);
          }}
        />
      )}
    </div>
  );
};
