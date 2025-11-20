import React, { useMemo, useState } from "react";
import { useExpenseContext } from "@/context/expenseContext";
import { Modal } from "@/base";
import { formatIndianCurrency } from "@/utils";
import {
  Filter,
  Undo2,
  Trash2,
  ShieldCheck,
  Search,
  Layers,
  Eye,
  EyeOff,
} from "lucide-react";

type FilterType = "all" | "active" | "deleted";
type ActionType = "softDelete" | "restore" | "remove" | "purge" | "clear";

type ActionState = { type: ActionType; id?: string | null };

export const ManageExpenses: React.FC = () => {
  const {
    expenses,
    deleteExpense,
    restoreExpense,
    removeExpense,
    clearAll,
    purgeDeleted,
  } = useExpenseContext();

  const [filter, setFilter] = useState<FilterType>("all");
  const [query, setQuery] = useState("");
  const [pendingAction, setPendingAction] = useState<ActionState | null>(null);

  const stats = useMemo(() => {
    const activeItems = expenses.filter((expense) => !expense.deleted);
    const deletedItems = expenses.filter((expense) => expense.deleted);
    const activeTotal = activeItems.reduce(
      (sum, expense) => sum + expense.amount,
      0,
    );
    const deletedTotal = deletedItems.reduce(
      (sum, expense) => sum + expense.amount,
      0,
    );

    return {
      totalCount: expenses.length,
      activeCount: activeItems.length,
      deletedCount: deletedItems.length,
      activeTotal,
      deletedTotal,
    };
  }, [expenses]);

  const sortedExpenses = useMemo(
    () =>
      [...expenses].sort((a, b) => {
        const timeA = new Date(`${a.date} ${a.time}`).getTime();
        const timeB = new Date(`${b.date} ${b.time}`).getTime();
        return timeB - timeA;
      }),
    [expenses],
  );

  const filteredExpenses = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return sortedExpenses.filter((expense) => {
      const matchesFilter =
        filter === "all"
          ? true
          : filter === "active"
            ? !expense.deleted
            : expense.deleted;
      const matchesQuery =
        normalized.length === 0
          ? true
          : [
              expense.title,
              expense.description,
              expense.category,
              expense.merchant,
            ]
              .filter(Boolean)
              .some((field) => field!.toLowerCase().includes(normalized));
      return matchesFilter && matchesQuery;
    });
  }, [sortedExpenses, filter, query]);

  const openAction = (type: ActionType, id?: string | null) => {
    setPendingAction({ type, id: id ?? null });
  };

  const closeAction = () => setPendingAction(null);

  const confirmAction = () => {
    if (!pendingAction) return;
    const { type, id } = pendingAction;

    switch (type) {
      case "softDelete":
        if (id) deleteExpense(id);
        break;
      case "restore":
        if (id) restoreExpense(id);
        break;
      case "remove":
        if (id) removeExpense(id);
        break;
      case "purge":
        purgeDeleted();
        break;
      case "clear":
        clearAll();
        break;
    }

    closeAction();
  };

  const modalCopy = useMemo(() => {
    if (!pendingAction) return null;

    switch (pendingAction.type) {
      case "softDelete":
        return {
          title: "Move to Trash?",
          message:
            "This expense will be moved to trash. You can restore it later from here.",
          confirmText: "Move to Trash",
          type: "warning" as const,
        };
      case "restore":
        return {
          title: "Restore Expense?",
          message: "The expense will be restored to your active list.",
          confirmText: "Restore",
          type: "success" as const,
        };
      case "remove":
        return {
          title: "Delete Permanently?",
          message:
            "This will permanently remove the expense. This action cannot be undone.",
          confirmText: "Delete Forever",
          type: "error" as const,
        };
      case "purge":
        return {
          title: "Empty Trash?",
          message:
            "All trashed expenses will be deleted permanently. This cannot be undone.",
          confirmText: "Empty Trash",
          type: "error" as const,
        };
      case "clear":
        return {
          title: "Clear All Expenses?",
          message:
            "Every expense, including the trash, will be removed permanently.",
          confirmText: "Clear Everything",
          type: "error" as const,
        };
      default:
        return null;
    }
  }, [pendingAction]);

  const filterOptions: {
    label: string;
    value: FilterType;
    count: number;
    icon: React.ReactNode;
  }[] = [
    {
      label: "All",
      value: "all",
      count: stats.totalCount,
      icon: <Layers className="w-4 h-4" />,
    },
    {
      label: "Active",
      value: "active",
      count: stats.activeCount,
      icon: <Eye className="w-4 h-4" />,
    },
    {
      label: "Trash",
      value: "deleted",
      count: stats.deletedCount,
      icon: <EyeOff className="w-4 h-4" />,
    },
  ];

  const hasExpenses = expenses.length > 0;

  return (
    <div className="w-full mx-auto py-8 sm:py-12 px-4 sm:px-6 space-y-8 sm:space-y-10 bg-gray-50 dark:bg-gray-900/1">
      {/* Header Section */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between rounded-3xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-6 shadow-lg">
        <div>
          <p className="text-sm uppercase tracking-widest text-blue-500 font-semibold mb-2 flex items-center gap-2">
            <Layers className="w-4 h-4" />
            Expense Control Center
          </p>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Manage Expenses
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
            Move entries to trash, restore important ones, or clean up forever —
            you are in full control.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            disabled={stats.deletedCount === 0}
            onClick={() => openAction("purge")}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
              stats.deletedCount === 0
                ? "bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed"
                : "bg-orange-50 dark:bg-orange-950/50 text-orange-600 dark:text-orange-300 border border-orange-200 dark:border-orange-900 hover:-translate-y-0.5 hover:shadow-md"
            }`}
            aria-label="Empty trash"
          >
            <Trash2 className="w-4 h-4" />
            Empty Trash
          </button>
          <button
            type="button"
            disabled={!hasExpenses}
            onClick={() => openAction("clear")}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
              !hasExpenses
                ? "bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed"
                : "bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-300 border border-red-200 dark:border-red-900 hover:-translate-y-0.5 hover:shadow-md"
            }`}
            aria-label="Clear all expenses"
          >
            <ShieldCheck className="w-4 h-4" />
            Clear All
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        <div className="rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white p-5 shadow-lg hover:shadow-xl transition-shadow duration-200">
          <p className="text-sm uppercase opacity-80">Active Amount</p>
          <p className="text-2xl font-bold mt-2">
            ₹{formatIndianCurrency(stats.activeTotal)}
          </p>
          <p className="text-sm opacity-80 mt-1">{stats.activeCount} entries</p>
        </div>
        <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-5 shadow-lg hover:shadow-xl transition-shadow duration-200">
          <p className="text-sm uppercase text-gray-500 dark:text-gray-400">
            Trashed Amount
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-2">
            ₹{formatIndianCurrency(Math.abs(stats.deletedTotal))}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {stats.deletedCount} entries
          </p>
        </div>
        <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-5 shadow-lg hover:shadow-xl transition-shadow duration-200">
          <p className="text-sm uppercase text-gray-500 dark:text-gray-400">
            Total Items
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-2">
            {stats.totalCount}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Combined active & trash
          </p>
        </div>
      </div>

      {/* Filters and Search Section */}
      <div className="rounded-3xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-4 sm:p-6 shadow-lg space-y-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            {filterOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setFilter(option.value)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl border text-sm font-medium transition-all duration-200 ${
                  filter === option.value
                    ? "bg-blue-600 text-white border-blue-500 shadow-lg"
                    : "bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-blue-300 hover:shadow-sm"
                }`}
                aria-pressed={filter === option.value}
                aria-label={`Filter by ${option.label.toLowerCase()}`}
              >
                {option.icon}
                {option.label}
                <span
                  className={`text-xs font-semibold ${
                    filter === option.value
                      ? "text-white/80"
                      : "text-gray-500 dark:text-gray-400"
                  }`}
                >
                  {option.count}
                </span>
              </button>
            ))}
          </div>
          <div className="relative w-full lg:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by title, merchant, category"
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 transition-all"
              aria-label="Search expenses"
            />
          </div>
        </div>

        <div className="flex items-center justify-between text-xs uppercase tracking-widest text-gray-500 dark:text-gray-400 border-b border-dashed border-gray-200 dark:border-gray-700 pb-3">
          <span className="inline-flex items-center gap-2">
            <Filter className="w-3.5 h-3.5" />
            {filteredExpenses.length} results
          </span>
          <span>Newest first</span>
        </div>

        {/* Expense List */}
        {filteredExpenses.length === 0 ? (
          <div className="text-center py-16 rounded-3xl border border-dashed border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/40">
            <p className="text-lg font-semibold text-gray-700 dark:text-gray-200">
              Nothing to show here
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Try switching filters or clearing the search text.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredExpenses.map((expense) => {
              const dateTime = new Date(
                `${expense.date} ${expense.time}`,
              ).toLocaleString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              });
              const isCredit = expense.direction === "credit";
              const isDeleted = Boolean(expense.deleted);

              return (
                <div
                  key={expense.id}
                  className={`rounded-3xl border p-4 sm:p-5 flex flex-col gap-4 sm:flex-row sm:items-center justify-between shadow-sm hover:shadow-md transition-all duration-200 ${
                    isDeleted
                      ? "bg-gray-50/70 dark:bg-gray-900/40 border-gray-200 dark:border-gray-800"
                      : "bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-700"
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 flex-wrap">
                      <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {expense.title}
                      </p>
                      {expense.category && (
                        <span className="text-xs px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300">
                          {expense.category}
                        </span>
                      )}
                      {isDeleted && (
                        <span className="text-xs px-3 py-1 rounded-full bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-300">
                          In Trash
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {dateTime}
                      {expense.merchant ? ` • ${expense.merchant}` : ""}
                    </p>
                    {expense.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {expense.description}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col sm:items-end gap-3 min-w-[200px]">
                    <span
                      className={`text-xl font-bold ${
                        isCredit
                          ? "text-green-600 dark:text-green-400"
                          : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      ₹{formatIndianCurrency(Math.abs(expense.amount))}
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {isDeleted ? (
                        <>
                          <button
                            type="button"
                            onClick={() => openAction("restore", expense.id)}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-300 text-sm font-semibold hover:-translate-y-0.5 transition-transform bg-emerald-50/60 dark:bg-emerald-950/30 hover:shadow-sm"
                            aria-label="Restore expense"
                          >
                            <Undo2 className="w-4 h-4" />
                            Restore
                          </button>
                          <button
                            type="button"
                            onClick={() => openAction("remove", expense.id)}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl border border-red-200 dark:border-red-800 text-red-600 dark:text-red-300 text-sm font-semibold hover:-translate-y-0.5 transition-transform bg-red-50/60 dark:bg-red-950/30 hover:shadow-sm"
                            aria-label="Delete expense permanently"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete Forever
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={() => openAction("softDelete", expense.id)}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl border border-orange-200 dark:border-orange-800 text-orange-600 dark:text-orange-300 text-sm font-semibold hover:-translate-y-0.5 transition-transform bg-orange-50/60 dark:bg-orange-950/30 hover:shadow-sm"
                          aria-label="Move to trash"
                        >
                          <Trash2 className="w-4 h-4" />
                          Move to Trash
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {pendingAction && modalCopy && (
        <Modal
          show
          title={modalCopy.title}
          message={modalCopy.message}
          confirmText={modalCopy.confirmText}
          type={modalCopy.type}
          onCancel={closeAction}
          onConfirm={confirmAction}
        />
      )}
    </div>
  );
};

export default ManageExpenses;
