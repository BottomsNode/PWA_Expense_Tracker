import { useDashboardMetrics } from "@/hooks";
import { ExpenseList, SummaryCard } from "@/components";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useMemo } from "react";
import { formatIndianCurrency } from "@/utils";

export const Home = () => {
    const { total, todayTotal, maxExpense } = useDashboardMetrics();
    const navigate = useNavigate();

    // Personalized greeting
    const greeting = useMemo(() => {
        const hour = new Date().getHours();
        if (hour < 12) return "Good Morning ☀️";
        if (hour < 18) return "Good Afternoon 🌤️";
        return "Good Evening 🌙";
    }, []);

    return (
        <div className="max-w-6xl mx-auto py-8 sm:py-12 px-4 sm:px-8 space-y-10 relative">
            {/* Greeting Header */}
            <div className="text-center space-y-3">
                <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 dark:text-gray-100 transition-colors duration-200 hover:text-blue-600 dark:hover:text-blue-400">
                    {greeting}
                </h2>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-blue-700 dark:text-blue-400 tracking-tight transition-all duration-300 hover:scale-105 hover:text-blue-800 dark:hover:text-blue-300">
                    💰 Expense Dashboard
                </h1>
                <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 font-medium transition-colors duration-200 hover:text-gray-700 dark:hover:text-gray-300">
                    Stay on top of your finances — quick, simple, and visual.
                </p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-7 md:gap-8 w-full">
                <div className="transform transition-all duration-300 hover:scale-105 hover:shadow-xl active:scale-95 cursor-pointer">
                    <SummaryCard
                        title="Total Spent"
                        value={`₹${formatIndianCurrency(total)}`}
                        gradient="from-blue-600 to-indigo-700"
                    />
                </div>
                <div className="transform transition-all duration-300 hover:scale-105 hover:shadow-xl active:scale-95 cursor-pointer">
                    <SummaryCard
                        title="Today’s Spend"
                        value={`₹${formatIndianCurrency(todayTotal)}`}
                        gradient="from-emerald-600 to-teal-700"
                    />
                </div>
                <div className="transform transition-all duration-300 hover:scale-105 hover:shadow-xl active:scale-95 cursor-pointer">
                    <SummaryCard
                        title="Highest Expense"
                        value={`₹${formatIndianCurrency(maxExpense > 0 ? maxExpense : 0)}`}
                        gradient="from-rose-600 to-pink-700"
                    />
                </div>
            </div>

            {/* Smart Insights */}
            {total > 0 && (
                <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl shadow-sm p-4 sm:p-6 border border-gray-200 dark:border-gray-700 space-y-2 transition-all duration-300 hover:shadow-lg hover:bg-gray-100 dark:hover:bg-gray-750">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2 transition-colors duration-200 hover:text-blue-600 dark:hover:text-blue-400">
                        Quick Insights 💡
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-200 hover:text-gray-700 dark:hover:text-gray-300">
                        📈 You’ve spent an average of{" "}
                        <span className="font-semibold text-blue-600 dark:text-blue-400 transition-colors duration-200 hover:text-blue-700 dark:hover:text-blue-300">
                            ₹{formatIndianCurrency(total / 7)}
                        </span>{" "}
                        per day this week.
                    </p>
                    {maxExpense > 0 && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-200 hover:text-gray-700 dark:hover:text-gray-300">
                            💸 Your largest single expense was{" "}
                            <span className="font-semibold text-rose-500 dark:text-rose-400 transition-colors duration-200 hover:text-rose-600 dark:hover:text-rose-300">
                                ₹{formatIndianCurrency(maxExpense)}
                            </span>
                            .
                        </p>
                    )}
                </div>
            )}

            {/* Expense List */}
            <div className="pt-4 sm:pt-6 transition-all duration-300 hover:opacity-90">
                <ExpenseList />
            </div>

            {/* Floating Quick Add Button */}
            <button
                onClick={() => navigate("/add-expense")}
                className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 p-4 bg-linear-to-r from-blue-600 to-indigo-700 text-white rounded-full shadow-lg hover:scale-110 hover:shadow-2xl active:scale-95 transition-all duration-300 z-50 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800"
                aria-label="Add new expense"
            >
                <Plus className="w-6 h-6 transition-transform duration-200 hover:rotate-90" />
            </button>
        </div>
    );
};
