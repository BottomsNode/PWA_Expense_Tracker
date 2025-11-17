import { useMonthlyStats } from "@/hooks";
import {
  Calendar,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  MapPin,
  FileText,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { MonthlyCalendar, SummaryCard } from "@/components";
import { formatIndianCurrency } from "@/utils";

export const Monthly = () => {
  const { stats, selectedMonth, selectedYear, monthName, changeMonth } =
    useMonthlyStats();
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  useEffect(() => {
    setSelectedDay((current) => {
      const existsInMonth = current
        ? stats.dailyTotals.some((d) => d.day === current)
        : false;

      if (existsInMonth) return current;

      const today = new Date();
      if (
        today.getMonth() === selectedMonth &&
        today.getFullYear() === selectedYear
      ) {
        return today.getDate();
      }

      const firstWithSpend = stats.dailyTotals.find((d) => d.amount > 0)?.day;
      return firstWithSpend || (stats.dailyTotals[0]?.day ?? null);
    });
  }, [selectedMonth, selectedYear, stats.dailyTotals]);

  const selectedDate = useMemo(() => {
    if (!selectedDay) return null;
    return new Date(selectedYear, selectedMonth, selectedDay);
  }, [selectedDay, selectedMonth, selectedYear]);

  const dayExpenses = useMemo(() => {
    if (!selectedDay) return [];

    const filtered = stats.expenses.filter((expense) => {
      const [y, m, d] = expense.date.split("-").map(Number);
      return y === selectedYear && m - 1 === selectedMonth && d === selectedDay;
    });

    return filtered.sort(
      (a, b) =>
        new Date(`${b.date} ${b.time}`).getTime() -
        new Date(`${a.date} ${a.time}`).getTime(),
    );
  }, [selectedDay, selectedMonth, selectedYear, stats.expenses]);

  const dayTotal = useMemo(
    () => dayExpenses.reduce((s, e) => s + e.amount, 0),
    [dayExpenses],
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8 sm:py-12 space-y-8">
      {/* HEADER */}
      <div className="flex items-center gap-3 pb-3 border-b border-gray-200 dark:border-gray-700">
        <Calendar className="h-7 w-7 text-blue-600 dark:text-blue-400" />
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
          Monthly Overview
        </h2>
      </div>

      {/* MONTH SELECTOR */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm p-4 flex justify-between items-center">
        <button
          onClick={() => changeMonth(-1)}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
        >
          <ChevronLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
        </button>

        <div className="text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Selected Month
          </p>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            {monthName}
          </h3>
        </div>

        <button
          onClick={() => changeMonth(1)}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
        >
          <ChevronRight className="h-5 w-5 text-gray-600 dark:text-gray-400" />
        </button>
      </div>

      {/* SUMMARY */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <SummaryCard
          icon={<BarChart3 />}
          title="Average per Day"
          value={`₹${formatIndianCurrency(stats.avgPerDay)}`}
          subtitle="Daily spending rate"
          gradient="from-emerald-500 to-teal-600"
        />
      </div>

      {/* CALENDAR */}
      <MonthlyCalendar
        dailyTotals={stats.dailyTotals}
        year={selectedYear}
        month={selectedMonth}
        selectedDay={selectedDay}
        onSelectDay={setSelectedDay}
      />

      {/* DAILY LIST */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm p-5 space-y-4">
        {/* DATE HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {selectedDate
                ? selectedDate.toLocaleDateString("en-IN", {
                    weekday: "long",
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })
                : "Select a date"}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {selectedDate
                ? dayExpenses.length
                  ? "Here are your expenses for the selected day."
                  : "No expenses recorded on this day."
                : "Tap a date in the calendar to see your expenses."}
            </p>
          </div>

          {selectedDate && (
            <span className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full text-sm font-semibold">
              Total: ₹{formatIndianCurrency(dayTotal)}
            </span>
          )}
        </div>

        {/* EXPENSE LIST */}
        {selectedDate && dayExpenses.length > 0 && (
          <div className="space-y-4">
            {dayExpenses.map((expense) => (
              <div
                key={expense.id}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40 p-4"
              >
                {/* LEFT COLUMN */}
                <div className="flex flex-col gap-2 flex-1 min-w-0">
                  {/* TITLE */}
                  <p className="font-semibold text-gray-900 dark:text-gray-100 wrap-break-word">
                    {expense.title}
                  </p>

                  {/* TIME + CATEGORY */}
                  <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2 flex-wrap">
                    <span>{expense.time}</span>
                    {expense.category && (
                      <>
                        <span>•</span>
                        <span>{expense.category}</span>
                      </>
                    )}
                  </div>

                  {/* SMS BADGE */}
                  {expense.source === "notification" && (
                    <span className="flex items-center gap-2 text-xs text-white bg-blue-600 dark:bg-blue-700 px-3 py-1 rounded-full w-fit">
                      <Sparkles className="h-4 w-4" />
                      SMS Auto-detected
                    </span>
                  )}

                  {/* TAGS */}
                  {Array.isArray(expense.tags) && expense.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {expense.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 text-xs rounded-full bg-purple-100 dark:bg-purple-800 text-purple-800 dark:text-purple-200 font-medium"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* CONFIDENCE BAR */}
                  {typeof expense.confidence === "number" && (
                    <div className="mt-1">
                      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                        <span>Confidence</span>
                        <span>{Math.round(expense.confidence * 100)}%</span>
                      </div>
                      <div className="w-full bg-gray-300 dark:bg-gray-700 h-2 rounded-full">
                        <div
                          className="h-2 bg-green-500 rounded-full"
                          style={{
                            width: `${expense.confidence * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {/* DESCRIPTION */}
                  {expense.description && (
                    <div className="flex items-start gap-2 text-gray-600 dark:text-gray-400 text-sm mt-1">
                      <FileText className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                      <p className="leading-relaxed wrap-break-word">
                        {expense.description}
                      </p>
                    </div>
                  )}

                  {/* LOCATION */}
                  {expense.location && (
                    <div className="flex items-center gap-2 mt-1 text-sm">
                      <MapPin className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                      <a
                        href={`https://maps.google.com/?q=${expense.location.latitude},${expense.location.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 dark:text-blue-300 hover:underline wrap-break-word"
                      >
                        {expense.location.address ||
                          `${expense.location.latitude.toFixed(
                            3,
                          )}, ${expense.location.longitude.toFixed(3)}`}
                      </a>
                    </div>
                  )}
                </div>

                {/* RIGHT → AMOUNT */}
                <span className="text-lg font-bold text-green-600 dark:text-green-400 whitespace-nowrap">
                  ₹{formatIndianCurrency(expense.amount)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
