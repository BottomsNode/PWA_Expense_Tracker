import { useMonthlyStats } from "@/hooks"
import { Calendar, BarChart3, ChevronLeft, ChevronRight } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { MonthlyCalendar, SummaryCard } from "@/components"
import { formatIndianCurrency } from "@/utils"

export const Monthly = () => {
    const { stats, selectedMonth, selectedYear, monthName, changeMonth } = useMonthlyStats()
    const [selectedDay, setSelectedDay] = useState<number | null>(null)

    useEffect(() => {
        setSelectedDay((current) => {
            const existsInMonth = current
                ? stats.dailyTotals.some((d) => d.day === current)
                : false

            if (existsInMonth) return current

            const today = new Date()
            if (
                today.getMonth() === selectedMonth &&
                today.getFullYear() === selectedYear
            ) {
                return today.getDate()
            }

            const firstWithSpend = stats.dailyTotals.find((d) => d.amount > 0)?.day
            if (firstWithSpend) return firstWithSpend

            return stats.dailyTotals.length ? stats.dailyTotals[0].day : null
        })
    }, [selectedMonth, selectedYear, stats.dailyTotals])

    const selectedDate = useMemo(() => {
        if (!selectedDay) return null
        return new Date(selectedYear, selectedMonth, selectedDay)
    }, [selectedDay, selectedMonth, selectedYear])

    const dayExpenses = useMemo(() => {
        if (!selectedDay) return []

        return stats.expenses.filter((expense) => {
            const [expenseYear, expenseMonth, expenseDay] = expense.date
                .split("-")
                .map(Number)
            return (
                expenseYear === selectedYear &&
                expenseMonth - 1 === selectedMonth &&
                expenseDay === selectedDay
            )
        })
    }, [selectedDay, selectedMonth, selectedYear, stats.expenses])

    const dayTotal = useMemo(
        () => dayExpenses.reduce((sum, expense) => sum + expense.amount, 0),
        [dayExpenses]
    )

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8 sm:py-12 space-y-6 sm:space-y-8">
            {/* Header */}
            <div className="flex items-center gap-2 sm:gap-3">
                <Calendar className="h-6 w-6 text-blue-500" />
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-100">
                    Monthly Overview
                </h2>
            </div>

            {/* Month Selector */}
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
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100">
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

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                <SummaryCard
                    icon={<BarChart3 />}
                    title="Average per Day"
                    value={`₹${formatIndianCurrency(stats.avgPerDay)}`}
                    subtitle="Daily spending rate"
                    gradient="from-emerald-500 to-teal-600"
                />
            </div>

            {/* Calendar Heatmap */}
            <MonthlyCalendar
                dailyTotals={stats.dailyTotals}
                year={selectedYear}
                month={selectedMonth}
                selectedDay={selectedDay}
                onSelectDay={setSelectedDay}
            />

            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm p-4 sm:p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
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
                        <span className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300 px-3 py-1 rounded-full text-sm font-semibold">
                            Total: ₹{formatIndianCurrency(dayTotal)}
                        </span>
                    )}
                </div>

                {selectedDate && dayExpenses.length > 0 && (
                    <div className="space-y-3">
                        {dayExpenses.map((expense) => (
                            <div
                                key={expense.id}
                                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40 px-4 py-3"
                            >
                                <div>
                                    <p className="font-semibold text-gray-900 dark:text-gray-100">
                                        {expense.title}
                                    </p>
                                    <div className="text-xs text-gray-500 dark:text-gray-400 flex flex-wrap items-center gap-2">
                                        <span>{expense.time}</span>
                                        {expense.category && (
                                            <>
                                                <span className="hidden sm:inline">•</span>
                                                <span>{expense.category}</span>
                                            </>
                                        )}
                                    </div>
                                    {expense.description && (
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                            {expense.description}
                                        </p>
                                    )}
                                </div>
                                <span className="text-base sm:text-lg font-bold text-green-600 dark:text-green-400 whitespace-nowrap">
                                    ₹{formatIndianCurrency(expense.amount)}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
