import { MonthlyCalendarProps } from "@/props"
import { formatIndianNumber } from "@/utils"
import React, { JSX } from "react"

export const MonthlyCalendar: React.FC<MonthlyCalendarProps> = ({
    dailyTotals,
    year,
    month,
    selectedDay,
    onSelectDay,
}) => {
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const firstDay = new Date(year, month, 1).getDay()
    const today = new Date()

    const days: JSX.Element[] = []

    // Empty slots for the first row offset
    for (let i = 0; i < firstDay; i++) {
        days.push(<div key={`empty-${i}`} className="aspect-square" />)
    }

    // Days of month
    for (let day = 1; day <= daysInMonth; day++) {
        const total = dailyTotals.find((d) => d.day === day)?.amount || 0
        const isToday =
            today.getDate() === day &&
            today.getMonth() === month &&
            today.getFullYear() === year

        // heat intensity based on spend
        const intensity = Math.min(0.9, total / 2000)
        const bgColor =
            total > 0
                ? `rgba(239, 68, 68, ${intensity})` // Tailwind red-500
                : "transparent"

        const isSelected = selectedDay === day

        days.push(
            <div
                key={day}
                role="button"
                tabIndex={0}
                onClick={() => onSelectDay?.(day)}
                onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault()
                        onSelectDay?.(day)
                    }
                }}
                className={`aspect-square flex flex-col items-center justify-center text-center rounded-lg border transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 
                    ${isToday
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
                        : "border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700/30"
                    }
                    ${isSelected && !isToday ? "ring-2 ring-blue-400 dark:ring-blue-500" : ""}
                    ${isSelected && isToday ? "ring-2 ring-blue-400 dark:ring-blue-500" : ""}
                `}
                style={{
                    backgroundColor: total > 0 ? bgColor : undefined,
                }}
                aria-label={`Expenses on ${new Date(year, month, day).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                })}`}
                aria-pressed={isSelected}
            >
                <div className="text-xs sm:text-sm font-medium text-gray-900 dark:text-gray-100 leading-tight">
                    {day}
                </div>
                {total > 0 && (
                    <div className="text-[10px] sm:text-xs text-gray-800 dark:text-gray-200 font-semibold truncate">
                        {`₹${formatIndianNumber(total, {
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0,
                        })}`}
                    </div>
                )}
            </div>
        )
    }

    return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm p-4 sm:p-6">
            <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2 sm:mb-3">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                    <div
                        key={d}
                        className="text-center text-[10px] sm:text-xs font-semibold text-gray-600 dark:text-gray-400"
                    >
                        {d}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-1 sm:gap-2">{days}</div>
        </div>
    )
}
