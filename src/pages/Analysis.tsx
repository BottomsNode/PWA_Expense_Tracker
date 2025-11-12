import React, { useMemo } from "react"
import { ChartCard, SummaryCard } from "@/components"
import { useMonthlyStats } from "@/hooks"
import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    PieChart,
    Pie,
    Cell,
    Legend,
} from "recharts"
import type { PieLabelRenderProps } from "recharts"
import {
    ChevronLeft,
    ChevronRight,
    TrendingUp,
    Wallet2,
    Target,
    PieChart as PieChartIcon,
    CalendarRange,
    CircleDollarSign,
    CalendarDays,
} from "lucide-react"
import { formatIndianNumber } from "@/utils/number"

export const Analysis: React.FC = () => {
    const { stats, monthName, changeMonth } = useMonthlyStats()
    const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"]
    const currencyFormatter = useMemo(
        () =>
            new Intl.NumberFormat("en-IN", {
                style: "currency",
                currency: "INR",
                minimumFractionDigits: 0,
                maximumFractionDigits: 2,
            }),
        []
    )
    const highestDay = useMemo(
        () =>
            stats.dailyTotals.length
                ? stats.dailyTotals.reduce((max, day) =>
                      day.amount > max.amount ? day : max
                  )
                : null,
        [stats.dailyTotals]
    )
    const topCategory = useMemo(
        () =>
            stats.categoryData.length
                ? stats.categoryData.reduce((max, cat) =>
                      cat.value > max.value ? cat : max
                  )
                : null,
        [stats.categoryData]
    )
    const highestExpense = useMemo(() => {
        if (!stats.expenses.length) return null
        return stats.expenses.reduce((max, expense) =>
            expense.amount > max.amount ? expense : max
        )
    }, [stats.expenses])
    const topCategories = useMemo(() => {
        if (!stats.categoryData.length) return []
        const total = stats.categoryData.reduce((sum, cat) => sum + cat.value, 0)
        return [...stats.categoryData]
            .sort((a, b) => b.value - a.value)
            .slice(0, 4)
            .map((cat) => ({
                ...cat,
                percent: total ? (cat.value / total) * 100 : 0,
            }))
    }, [stats.categoryData])
    const focusExpenses = useMemo(
        () =>
            [...stats.expenses]
                .sort((a, b) => b.amount - a.amount)
                .slice(0, 5),
        [stats.expenses]
    )
    const topSpendingDays = useMemo(
        () =>
            stats.dailyTotals
                .filter((day) => day.amount > 0)
                .sort((a, b) => b.amount - a.amount)
                .slice(0, 3),
        [stats.dailyTotals]
    )
    const daysWithSpend = useMemo(
        () => stats.dailyTotals.filter((day) => day.amount > 0).length,
        [stats.dailyTotals]
    )
    const primaryHighlights = useMemo(
        () => [
            {
                key: "total",
                icon: <Wallet2 className="h-6 w-6" />,
                title: "Total Spent",
                value: currencyFormatter.format(stats.total),
                subtitle: `${stats.count} ${stats.count === 1 ? "transaction" : "transactions"}`,
                gradient: "from-blue-600 to-indigo-700",
            },
            {
                key: "average",
                icon: <TrendingUp className="h-6 w-6" />,
                title: "Average / Day",
                value: currencyFormatter.format(stats.avgPerDay),
                subtitle: daysWithSpend
                    ? `${daysWithSpend} active ${daysWithSpend === 1 ? "day" : "days"}`
                    : "No activity yet",
                gradient: "from-emerald-600 to-teal-700",
            },
            {
                key: "highest-day",
                icon: <Target className="h-6 w-6" />,
                title: "Highest Day",
                value: highestDay
                    ? currencyFormatter.format(highestDay.amount)
                    : currencyFormatter.format(0),
                subtitle: highestDay ? `on day ${highestDay.day}` : "No spending yet",
                gradient: "from-rose-600 to-pink-700",
            },
            {
                key: "top-category",
                icon: <PieChartIcon className="h-6 w-6" />,
                title: "Top Category",
                value: topCategory
                    ? currencyFormatter.format(topCategory.value)
                    : currencyFormatter.format(0),
                subtitle: topCategory ? topCategory.name : "Awaiting expenses",
                gradient: "from-violet-600 to-purple-700",
            },
        ],
        [currencyFormatter, stats.total, stats.count, stats.avgPerDay, daysWithSpend, highestDay, topCategory]
    )
    const insightCards = useMemo(() => {
        const cards: Array<{
            key: string
            icon: React.ReactNode
            title: string
            value: string
            subtitle?: string
            gradient: string
        }> = []

        if (highestExpense) {
            cards.push({
                key: "largest-purchase",
                icon: <CircleDollarSign className="h-6 w-6" />,
                title: "Largest Purchase",
                value: currencyFormatter.format(highestExpense.amount),
                subtitle: `${new Date(highestExpense.date).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                })}${highestExpense.title ? ` • ${highestExpense.title}` : ""}`,
                gradient: "from-rose-600 to-pink-700",
            })
        }
        if (daysWithSpend) {
            cards.push({
                key: "active-days",
                icon: <CalendarRange className="h-6 w-6" />,
                title: "Active Spending Days",
                value: `${daysWithSpend} / ${stats.dailyTotals.length}`,
                subtitle: `Spent on ${daysWithSpend} day${daysWithSpend === 1 ? "" : "s"} this month`,
                gradient: "from-emerald-600 to-teal-700",
            })
        }
        if (topSpendingDays.length > 1) {
            const [, ...otherBusyDays] = topSpendingDays
            cards.push({
                key: "busy-days",
                icon: <CalendarDays className="h-6 w-6" />,
                title: "Other Busy Days",
                value: otherBusyDays.map((day) => `Day ${day.day}`).join(" • "),
                subtitle: otherBusyDays
                    .map((day) => currencyFormatter.format(day.amount))
                    .join(" • "),
                gradient: "from-blue-600 to-indigo-700",
            })
        }

        return cards
    }, [currencyFormatter, daysWithSpend, stats.dailyTotals.length, topSpendingDays, highestExpense])

    /* ---------- Custom Label for Pie Chart ---------- */
    const renderCustomizedLabel = ({
        cx = 0,
        cy = 0,
        midAngle = 0,
        innerRadius = 0,
        outerRadius = 0,
        percent = 0,
    }: PieLabelRenderProps) => {
        const RADIAN = Math.PI / 180
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5
        const x = cx + radius * Math.cos(-midAngle * RADIAN)
        const y = cy + radius * Math.sin(-midAngle * RADIAN)

        return (
            <text
                x={x}
                y={y}
                fill="white"
                textAnchor={x > cx ? "start" : "end"}
                dominantBaseline="central"
                className="text-[10px] sm:text-xs font-medium"
            >
                {`${(percent * 100).toFixed(0)}%`}
            </text>
        )
    }
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-8 relative">
            {/* Header */}
            <div className="space-y-4 sm:space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight">
                    📊 Spending Analysis
                </h1>
                        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 font-medium max-w-2xl mt-3">
                    Track how and where your money goes — visualize patterns and manage your spending smarter.
                </p>
                    </div>
                    <div className="
                    flex items-center justify-between sm:justify-end gap-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 shadow-sm
                    ">
                        <button
                            onClick={() => changeMonth(-1)}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition"
                            aria-label="Previous month"
                        >
                            <ChevronLeft className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                        </button>
                        <div className="text-center px-3">
                            <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                Analyzing
                            </p>
                            <p className="text-sm sm:text-base font-semibold text-gray-900 dark:text-gray-100">
                                {monthName}
                            </p>
                        </div>
                        <button
                            onClick={() => changeMonth(1)}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition"
                            aria-label="Next month"
                        >
                            <ChevronRight className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                        </button>
                    </div>
                </div>
            </div>

            {/* High-level metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
                {primaryHighlights.map(({ key, ...card }) => (
                    <SummaryCard key={key} {...card} />
                ))}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                {/* Line Chart */}
                <ChartCard
                    title="Daily Spending Trend"
                    className="bg-linear-to-br from-blue-100 to-indigo-200 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-md p-4 sm:p-6 border border-gray-200 dark:border-gray-700"
                >
                    <ResponsiveContainer width="100%" height={260}>
                        <LineChart
                            data={stats.dailyTotals}
                            margin={{ top: 10, right: 20, left: 10, bottom: 5 }}
                        >
                            <CartesianGrid
                                strokeDasharray="3 3"
                                stroke="#374151"
                                opacity={0.1}
                            />
                            <XAxis
                                dataKey="day"
                                stroke="#6b7280"
                                tick={{ fontSize: 10 }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <YAxis
                                stroke="#6b7280"
                                tick={{ fontSize: 10 }}
                                axisLine={false}
                                tickLine={false}
                                tickFormatter={(value) =>
                                    `₹${formatIndianNumber(value, {
                                        minimumFractionDigits: 0,
                                        maximumFractionDigits: 0,
                                    })}`
                                }
                            />
                            <Line
                                type="monotone"
                                dataKey="amount"
                                stroke="#3b82f6"
                                strokeWidth={3}
                                dot={{ r: 2.5, fill: "#3b82f6" }}
                                activeDot={{ r: 4, fill: "#1e40af" }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </ChartCard>

                {/* Pie Chart */}
                <ChartCard
                    title="Category Distribution"
                    className="bg-linear-to-br from-emerald-100 to-teal-200 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-md p-4 sm:p-6 border border-gray-200 dark:border-gray-700"
                >
                    {stats.categoryData.length ? (
                        <ResponsiveContainer width="100%" height={260}>
                            <PieChart margin={{ top: 10, right: 20, left: 20, bottom: 5 }}>
                                <Pie
                                    data={stats.categoryData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={renderCustomizedLabel}
                                    outerRadius={90}
                                    fill="#8884d8"
                                    dataKey="value"
                                    animationBegin={0}
                                    animationDuration={800}
                                >
                                    {stats.categoryData.map((_, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={COLORS[index % COLORS.length]}
                                            stroke="#fff"
                                            strokeWidth={1}
                                        />
                                    ))}
                                </Pie>
                                <Legend
                                    verticalAlign="bottom"
                                    height={36}
                                    iconType="circle"
                                    wrapperStyle={{
                                        fontSize: "12px",
                                        color: "#6b7280",
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex h-[220px] items-center justify-center text-sm text-gray-500 dark:text-gray-400">
                            Categorize your expenses to see where your money goes.
                        </div>
                    )}
                </ChartCard>
            </div>

            {/* Insights Section */}
            {stats.dailyTotals.length > 0 && (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl shadow-sm p-4 sm:p-6 border border-gray-200 dark:border-gray-700 space-y-5">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-gray-200">
                            💡 Key Insights
                        </h3>
                        {insightCards.length ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {insightCards.map(({ key, ...card }) => (
                                    <SummaryCard key={key} {...card} />
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Add and categorise expenses to unlock personalised insights.
                            </p>
                        )}
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl shadow-sm p-4 sm:p-6 border border-gray-200 dark:border-gray-700 space-y-5">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-gray-200">
                            🍰 Category Highlights
                        </h3>
                        {topCategories.length ? (
                            <div className="space-y-4">
                                {topCategories.map((category, index) => (
                                    <div key={category.name} className="space-y-2">
                                        <div className="flex justify-between items-baseline text-sm">
                                            <span className="font-medium text-gray-700 dark:text-gray-300">
                                                {index + 1}. {category.name}
                                            </span>
                                            <span className="text-gray-500 dark:text-gray-400">
                                                {currencyFormatter.format(category.value)} •{" "}
                                                {category.percent.toFixed(0)}%
                                            </span>
                                        </div>
                                        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-linear-to-r from-indigo-300 via-sky-300 to-emerald-300"
                                                style={{ width: `${category.percent}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Categorize your expenses to see which areas impact your wallet the most.
                            </p>
                        )}
                    </div>
                </div>
            )}

            {/* Noteworthy expenses */}
            {focusExpenses.length > 0 && (
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm p-4 sm:p-6 space-y-4">
                    <div className="flex items-center justify-between gap-2">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">
                            🔍 Expenses to Review
                        </h3>
                        <span className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                            Top {focusExpenses.length} by amount
                        </span>
                    </div>
                    <div className="space-y-3">
                        {focusExpenses.map((expense) => (
                            <div
                                key={expense.id}
                                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 rounded-xl bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 px-4 py-3"
                            >
                                <div>
                                    <p className="text-sm sm:text-base font-semibold text-gray-900 dark:text-gray-100">
                                        {expense.title || "Untitled expense"}
                                    </p>
                                    <div className="text-xs text-gray-500 dark:text-gray-400 flex flex-wrap gap-2">
                                        <span>
                                            {new Date(expense.date).toLocaleDateString("en-IN", {
                                                day: "2-digit",
                                                month: "short",
                                                year: "numeric",
                                            })}
                                        </span>
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
                                <span className="text-base sm:text-lg font-bold text-rose-600 dark:text-rose-400 whitespace-nowrap">
                                    {currencyFormatter.format(expense.amount)}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Empty State */}
            {(!stats.dailyTotals.length || !stats.categoryData.length) && (
                <div className="text-center py-10">
                    <p className="text-gray-500 dark:text-gray-400 text-base">
                        No data available yet. Start adding expenses to see your
                        analysis!
                    </p>
                </div>
            )}
        </div>
    )
}
