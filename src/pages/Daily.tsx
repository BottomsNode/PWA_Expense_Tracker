import {
  CalendarDays,
  IndianRupee,
  Clock,
  ChevronDown,
  MapPin,
  FileText,
  Sparkles,
} from "lucide-react";
import { format, parse } from "date-fns";
import { useDailyExpenses } from "@/hooks";
import { useState } from "react";
import { formatIndianCurrency, formatIndianNumber } from "@/utils";

export const Daily = () => {
  const { groupedExpenses, sortedDates, dailyTotals, hasExpenses } =
    useDailyExpenses();
  const [expanded, setExpanded] = useState<string | null>(null);

  const toggleExpand = (key: string) => {
    setExpanded((prev) => (prev === key ? null : key));
  };

  if (!hasExpenses) {
    return (
      <div className="p-6 text-center min-h-[200px] flex items-center justify-center">
        <div>
          <CalendarDays className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400 text-base sm:text-lg leading-relaxed">
            No expenses yet. Add one to see your daily breakdown.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 pb-2 border-b border-gray-200 dark:border-gray-700">
        <CalendarDays className="h-7 w-7 text-blue-600 dark:text-blue-400" />
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
          Daily Expenses
        </h2>
      </div>

      {/* Daily groups */}
      {sortedDates.map((date) => {
        const expenses = groupedExpenses[date];
        // Find the most expensive expense for the day
        const mostExpensive = expenses.reduce(
          (max, expense) => (expense.amount > max.amount ? expense : max),
          expenses[0],
        );

        return (
          <div
            key={date}
            className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm hover:shadow-md transition-shadow duration-200 p-4 sm:p-6 space-y-4"
          >
            {/* Date Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100">
                  {format(parse(date, "yyyy-MM-dd", new Date()), "dd MMM yyyy")}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {expenses.length} {expenses.length === 1 ? "item" : "items"}
                </p>
              </div>
              <div className="text-left sm:text-right">
                <div className="flex items-center gap-2 text-lg sm:text-xl font-bold text-blue-600 dark:text-blue-400">
                  <IndianRupee className="h-5 w-5" />
                  {formatIndianCurrency(dailyTotals[date])}
                </div>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Top:{" "}
                  <span className="font-medium">{mostExpensive.title}</span> (₹
                  {formatIndianNumber(mostExpensive.amount)})
                </p>
              </div>
            </div>

            {/* Expense Items */}
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {expenses.map((expense, index) => {
                const key = `${date}-${index}`;
                const isOpen = expanded === key;

                return (
                  <div key={key} className="py-3">
                    {/* Collapsible Header */}
                    <button
                      onClick={() => toggleExpand(key)}
                      className="flex items-center justify-between w-full text-left p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                      aria-expanded={isOpen}
                      aria-controls={`expense-details-${key}`}
                      style={{ minHeight: "48px" }} // Ensure touch target
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <Clock className="h-5 w-5 text-gray-400 dark:text-gray-500 shrink-0" />
                        <span className="text-gray-800 dark:text-gray-200 font-medium text-base truncate">
                          {expense.title}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="font-bold text-gray-900 dark:text-gray-100 text-lg">
                          ₹{formatIndianCurrency(expense.amount)}
                        </span>
                        <ChevronDown
                          className={`h-5 w-5 transition-transform duration-300 ${isOpen ? "rotate-180 text-blue-600" : "text-gray-400"}`}
                        />
                      </div>
                    </button>

                    {/* Expanded Content */}
                    {isOpen && (
                      <div
                        id={`expense-details-${key}`}
                        className="pl-6 pr-4 mt-3 space-y-4 text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-lg p-4"
                      >
                        {/* Notification Auto-detected */}
                        {expense.source === "notification" && (
                          <div className="flex items-center gap-2 text-s bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full w-fit">
                            <Sparkles className="h-4 w-4" />
                            Notification Auto-detected
                          </div>
                        )}

                        {/* Tags */}
                        {expense.tags && expense.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {expense.tags.map((tag) => (
                              <span
                                key={tag}
                                className="px-3 py-1 text-s rounded-full bg-purple-100 dark:bg-purple-800 text-purple-800 dark:text-purple-200 font-medium"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Confidence Bar */}
                        {typeof expense.confidence === "number" && (
                          <div>
                            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-2">
                              <span>Confidence</span>
                              <span>
                                {Math.round(expense.confidence * 100)}%
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full">
                              <div
                                className="h-2 bg-green-500 rounded-full transition-all duration-500"
                                style={{
                                  width: `${expense.confidence * 100}%`,
                                }}
                              />
                            </div>
                          </div>
                        )}

                        {/* Description */}
                        {expense.description && (
                          <div className="flex items-start gap-3">
                            <FileText className="h-5 w-5 text-gray-400 dark:text-gray-500 mt-0.5 shrink-0" />
                            <p className="leading-relaxed text-base">
                              {expense.description}
                            </p>
                          </div>
                        )}

                        {/* Location */}
                        {expense.location && (
                          <div className="flex items-center gap-3">
                            <MapPin className="h-5 w-5 text-gray-400 dark:text-gray-500 shrink-0" />
                            <a
                              href={`https://maps.google.com/?q=${expense.location.latitude},${expense.location.longitude}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 dark:text-blue-400 hover:underline text-base"
                            >
                              {expense.location.address ||
                                `${expense.location.latitude.toFixed(4)}, ${expense.location.longitude.toFixed(4)}`}
                            </a>
                          </div>
                        )}

                        {/* Time */}
                        <div className="text-xs text-gray-500 dark:text-gray-500 pt-2 border-t border-gray-200 dark:border-gray-600">
                          Recorded at: {expense.time}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};
