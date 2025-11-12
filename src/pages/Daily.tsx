import { CalendarDays, IndianRupee, Clock, ChevronDown, MapPin, FileText } from "lucide-react"
import { format, parse } from "date-fns"
import { useDailyExpenses } from "@/hooks"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { formatIndianCurrency, formatIndianNumber } from "@/utils"

export const Daily = () => {
    const { groupedExpenses, sortedDates, dailyTotals, hasExpenses } = useDailyExpenses()
    const [expanded, setExpanded] = useState<string | null>(null)

    const toggleExpand = (key: string) => {
        setExpanded((prev) => (prev === key ? null : key))
    }

    if (!hasExpenses) {
        return (
            <div className="p-6 text-center">
                <p className="text-gray-500 dark:text-gray-400 text-lg">
                    No expenses yet. Add one to see your daily breakdown.
                </p>
            </div>
        )
    }

    return (
        <div className="p-4 sm:p-6 space-y-6">
            <div className="flex items-center gap-2">
                <CalendarDays className="h-6 w-6 text-blue-500" />
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                    Daily Expenses
                </h2>
            </div>

            {sortedDates.map((date) => {
                const expenses = groupedExpenses[date]
                const mostExpensive = expenses.reduce((max, e) => e.amount > max.amount ? e : max, expenses[0])

                return (
                    <div
                        key={date}
                        className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm p-4 sm:p-5 space-y-4"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                                    {format(parse(date, "yyyy-MM-dd", new Date()), "dd MMM yyyy")}
                                </h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {expenses.length} {expenses.length === 1 ? "item" : "items"}
                                </p>
                            </div>
                            <div className="text-right">
                                <div className="flex items-center justify-end gap-1 text-blue-600 dark:text-blue-400 font-medium">
                                    <IndianRupee className="h-4 w-4" />
                                    {formatIndianCurrency(dailyTotals[date])}
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {`Top: ${mostExpensive.title} (₹${formatIndianNumber(mostExpensive.amount, {
                                        minimumFractionDigits: 0,
                                        maximumFractionDigits: 0,
                                    })})`}
                                </p>
                            </div>
                        </div>

                        {/* Expense Items */}
                        <div className="divide-y divide-gray-100 dark:divide-gray-800">
                            {expenses.map((expense, index) => {
                                const key = `${date}-${index}`
                                const isOpen = expanded === key
                                return (
                                    <div key={key} className="py-2">
                                        <button
                                            onClick={() => toggleExpand(key)}
                                            className="flex items-center justify-between w-full text-left"
                                        >
                                            <div className="flex items-center gap-2">
                                                <Clock className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                                                <span className="text-gray-700 dark:text-gray-300 font-medium">
                                                    {expense.title}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold text-gray-900 dark:text-gray-100">
                                                    ₹{formatIndianCurrency(expense.amount)}
                                                </span>
                                                <ChevronDown
                                                    className={`h-4 w-4 transition-transform duration-300 ${isOpen ? "rotate-180 text-blue-500" : "text-gray-400"
                                                        }`}
                                                />
                                            </div>
                                        </button>

                                        <AnimatePresence>
                                            {isOpen && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: "auto" }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    transition={{ duration: 0.25, ease: "easeOut" }}
                                                    className="pl-6 pr-2 mt-2 space-y-2 text-sm text-gray-600 dark:text-gray-400"
                                                >
                                                    {expense.description && (
                                                        <div className="flex items-start gap-2">
                                                            <FileText className="h-4 w-4 text-gray-400 dark:text-gray-500 mt-0.5" />
                                                            <p>{expense.description}</p>
                                                        </div>
                                                    )}
                                                    {expense.location && (
                                                        <div className="flex items-center gap-2">
                                                            <MapPin className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                                                            <a
                                                                href={`https://maps.google.com/?q=${expense.location.latitude},${expense.location.longitude}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="hover:underline text-blue-500"
                                                            >
                                                                {expense.location.address ||
                                                                    `${expense.location.latitude.toFixed(2)}, ${expense.location.longitude.toFixed(2)}`}
                                                            </a>
                                                        </div>
                                                    )}
                                                    <div className="text-xs text-gray-500 dark:text-gray-500">
                                                        Recorded at: {expense.time}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )
            })}
        </div>
    )
}