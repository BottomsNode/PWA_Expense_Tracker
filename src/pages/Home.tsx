import React, { useMemo, useState } from "react";
import { useDashboardMetrics, useMonthlyGoal } from "@/hooks";
import { ExpenseList, SummaryCard, PendingReviews } from "@/components";
import {
  Plus,
  TrendingUp,
  IndianRupee,
  CalendarDays,
  PieChart,
  ArrowDownRight,
  ArrowUpRight,
  Wallet,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { formatIndianCurrency } from "@/utils";
import { useNotificationReview } from "@/utils";
import { DAY_IN_MS, getTimestamp, sectionCardBase } from "@/types";

const SectionCard: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = "" }) => (
  <div className={`${sectionCardBase} ${className}`}>{children}</div>
);

export const Home: React.FC = () => {
  const { expenses, total, todayTotal, maxExpense } = useDashboardMetrics();
  const { goal, setGoal } = useMonthlyGoal();
  const navigate = useNavigate();
  const { pending } = useNotificationReview();

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning 🌅";
    if (hour < 18) return "Good Afternoon !!";
    return "Good Evening 🌙";
  }, []);

  const activeExpenses = useMemo(
    () => expenses.filter((expense) => !expense.deleted),
    [expenses],
  );

  const sortedExpenses = useMemo(
    () =>
      [...activeExpenses].sort(
        (a, b) => getTimestamp(b.date, b.time) - getTimestamp(a.date, a.time),
      ),
    [activeExpenses],
  );

  const latestExpense = sortedExpenses[0];

  const todayEntryCount = useMemo(() => {
    const todayKey = new Date().toISOString().split("T")[0];
    return activeExpenses.filter((expense) => expense.date === todayKey).length;
  }, [activeExpenses]);

  const { weeklySpend, previousWeekSpend } = useMemo(() => {
    const now = Date.now();
    const currentWeek = sortedExpenses.filter(
      (expense) =>
        now - getTimestamp(expense.date, expense.time) < 7 * DAY_IN_MS,
    );
    const lastWeek = sortedExpenses.filter((expense) => {
      const diff = now - getTimestamp(expense.date, expense.time);
      return diff >= 7 * DAY_IN_MS && diff < 14 * DAY_IN_MS;
    });

    const sum = (arr: typeof sortedExpenses) =>
      arr.reduce((acc, expense) => acc + expense.amount, 0);

    return {
      weeklySpend: sum(currentWeek),
      previousWeekSpend: sum(lastWeek),
    };
  }, [sortedExpenses]);

  const weeklyTrend = weeklySpend - previousWeekSpend;
  const weeklyTrendIsDown = weeklyTrend <= 0;

  const { creditTotal, debitTotal, netFlow } = useMemo(() => {
    const credits = activeExpenses
      .filter((expense) => expense.direction === "credit")
      .reduce((sum, expense) => sum + Math.abs(expense.amount), 0);
    const debits = activeExpenses
      .filter((expense) => expense.direction === "debit" || !expense.direction)
      .reduce((sum, expense) => sum + Math.abs(expense.amount), 0);

    return {
      creditTotal: credits,
      debitTotal: debits,
      netFlow: credits - debits,
    };
  }, [activeExpenses]);

  const monthlySnapshot = useMemo(() => {
    const now = new Date();
    const monthPrefix = `${now.getFullYear()}-${String(
      now.getMonth() + 1,
    ).padStart(2, "0")}`;
    const monthTotal = activeExpenses
      .filter((expense) => expense.date.startsWith(monthPrefix))
      .reduce((sum, expense) => sum + expense.amount, 0);

    const categories = activeExpenses.reduce<Record<string, number>>(
      (acc, expense) => {
        if (!expense.category) return acc;
        acc[expense.category] =
          (acc[expense.category] ?? 0) + Math.abs(expense.amount);
        return acc;
      },
      {},
    );

    const topCategory = Object.entries(categories).sort(
      (a, b) => b[1] - a[1],
    )[0];
    const monthlyGoal = goal > 0 ? goal : 1;
    const progress = Math.min((monthTotal / monthlyGoal) * 100, 100);

    return {
      monthTotal,
      monthlyGoal,
      progress,
      topCategory: topCategory
        ? { name: topCategory[0], amount: topCategory[1] }
        : null,
    };
  }, [activeExpenses, goal]);

  const todayBaseline =
    weeklySpend > 0 ? Math.max(weeklySpend / 7, 1) : Math.max(total / 30, 1);
  const todayProgress = Math.min((todayTotal / todayBaseline) * 100, 100);

  const [editingGoal, setEditingGoal] = useState(false);
  const [goalDraft, setGoalDraft] = useState(goal.toString());

  const handleGoalSave = () => {
    const parsed = Number(goalDraft);
    if (Number.isFinite(parsed) && parsed > 0) {
      setGoal(parsed);
      setEditingGoal(false);
    }
  };

  const handleGoalToggle = () => {
    setGoalDraft(goal.toString());
    setEditingGoal((prev) => !prev);
  };

  const isMorning = greeting.includes("Morning");
  const isAfternoon = greeting.includes("Afternoon");
  const isEvening = greeting.includes("Evening");

  return (
    <div className="w-full mx-auto py-3 sm:py-12 px-4 sm:px-6 sm:space-y-10 bg-gray-50 dark:bg-gray-900/1">
      {/* Greeting Card */}
      <div
        className={`mb-5
          relative rounded-3xl shadow-lg p-6 sm:p-8 text-center border
          overflow-hidden
          ${isEvening ? "night-sky" : isAfternoon ? "afternoon-sky" : "day-sky"}
          border-gray-200 dark:border-gray-700
        `}
        aria-hidden={false}
      >
        {/* Background Animation Container */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          {/* Clouds (morning / calm) — multilayered, soft */}
          {isMorning && (
            <>
              <div
                className="cloud-1 absolute"
                style={{
                  top: "24px",
                  left: "-20%",
                  width: "120px",
                  height: "48px",
                  borderRadius: "48px",
                  background: "rgba(255,255,255,0.72)",
                }}
                aria-hidden
              />
              <div
                className="cloud-2 absolute"
                style={{
                  top: "64px",
                  left: "-35%",
                  width: "160px",
                  height: "60px",
                  borderRadius: "60px",
                  background: "rgba(255,255,255,0.56)",
                }}
                aria-hidden
              />
              <div
                className="cloud-3 absolute"
                style={{
                  top: "12px",
                  left: "10%",
                  width: "90px",
                  height: "40px",
                  borderRadius: "40px",
                  background: "rgba(255,255,255,0.5)",
                }}
                aria-hidden
              />
            </>
          )}

          {/* Afternoon Sun (soft, theme-tuned) */}
          {isAfternoon && (
            <div
              className="sun absolute"
              style={{
                top: "16px",
                right: "16px",
                width: "96px",
                height: "96px",
                borderRadius: "50%",
                background:
                  "radial-gradient(circle at 35% 35%, rgba(250,204,21,0.95), rgba(245,158,11,0.65))",
                mixBlendMode: "screen",
              }}
              aria-hidden
            />
          )}

          {/* Evening Moon + stars (soft indigo moon) */}
          {isEvening && (
            <>
              <div
                className="moon absolute"
                style={{
                  top: "36px",
                  right: "28px",
                  width: "64px",
                  height: "64px",
                  borderRadius: "50%",
                  background: "rgba(147,197,253,0.18)",
                  boxShadow: "0 0 30px rgba(147,197,253,0.08)",
                }}
                aria-hidden
              />
              <div
                className="star absolute"
                style={{
                  top: "32px",
                  left: "48px",
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  background: "rgba(255,255,255,0.92)",
                  boxShadow: "0 0 8px rgba(255,255,255,0.6)",
                }}
                aria-hidden
              />
              <div
                className="star absolute"
                style={{
                  top: "64px",
                  left: "96px",
                  width: "4px",
                  height: "4px",
                  borderRadius: "50%",
                  background: "rgba(255,255,255,0.85)",
                  boxShadow: "0 0 6px rgba(255,255,255,0.5)",
                }}
                aria-hidden
              />
              <div
                className="star absolute"
                style={{
                  top: "48px",
                  left: "60%",
                  width: "5px",
                  height: "5px",
                  borderRadius: "50%",
                  background: "rgba(255,255,255,0.88)",
                  boxShadow: "0 0 8px rgba(255,255,255,0.55)",
                }}
                aria-hidden
              />
            </>
          )}
        </div>

        {/* Foreground Content */}
        <div className="relative z-10">
          <h2
            className={`text-xl sm:text-2xl font-semibold mb-2 ${
              isEvening ? "text-white" : "text-gray-800"
            }`}
          >
            {greeting}
          </h2>

          <p
            className={`text-base font-semibold sm:text-lg max-w-xl mx-auto ${
              isEvening ? "text-gray-300" : "text-gray-600"
            }`}
          >
            Stay on top of your finances — quick, simple, and visual.
          </p>
        </div>

        {/* Inline styles block for animations, reduced-motion, and GPU hints */}
        <style>{`
          /* ===== reduced motion fallback ===== */
          @media (prefers-reduced-motion: reduce) {
            .cloud-1, .cloud-2, .cloud-3, .sun, .moon, .star {
              animation: none !important;
              transition: none !important;
              transform: none !important;
              opacity: 1 !important;
            }
          }

          /* ===== GPU hint for smooth animations ===== */
          .cloud-1, .cloud-2, .cloud-3, .sun, .moon, .star {
            will-change: transform, opacity;
            transform: translateZ(0);
          }

          /* ===== multilayer soft clouds ===== */
          .cloud-1 {
            filter: blur(4px);
            opacity: 0.85;
            animation: cloudFloat 36s linear infinite;
          }
          .cloud-2 {
            filter: blur(6px);
            opacity: 0.66;
            animation: cloudFloat 48s linear infinite;
            animation-delay: 6s;
          }
          .cloud-3 {
            filter: blur(3px);
            opacity: 0.6;
            animation: cloudFloat 30s linear infinite;
            animation-delay: 2s;
          }

          @keyframes cloudFloat {
            0% { transform: translateX(-40%); }
            100% { transform: translateX(140%); }
          }

          /* ===== softened sun pulse ===== */
          .sun {
            animation: sunPulse 4s ease-in-out infinite;
            filter: blur(1.8px);
            box-shadow: 0 8px 40px rgba(245,158,11,0.12), inset 0 -6px 20px rgba(245,158,11,0.06);
          }

          @keyframes sunPulse {
            0%, 100% { transform: scale(1); opacity: 0.92; }
            50% { transform: scale(1.08); opacity: 1; }
          }

          /* ===== Bright, clean, soft glowing moon ===== */
          .moon {
            animation: moonGlow 4s ease-in-out infinite;
            filter: blur(1.2px);
            background: rgba(255, 255, 255, 0.28);
            box-shadow:
              0 0 20px rgba(255, 255, 255, 0.25),
              0 0 40px rgba(147, 197, 253, 0.35),
              0 0 60px rgba(147, 197, 253, 0.22);
          }

          @keyframes moonGlow {
            0% {
              box-shadow:
                0 0 20px rgba(255, 255, 255, 0.25),
                0 0 40px rgba(147, 197, 253, 0.35),
                0 0 60px rgba(147, 197, 253, 0.22);
              opacity: 0.9;
            }
            50% {
              box-shadow:
                0 0 28px rgba(255, 255, 255, 0.35),
                0 0 60px rgba(147, 197, 253, 0.45),
                0 0 90px rgba(147, 197, 253, 0.32);
              opacity: 1;
            }
            100% {
              box-shadow:
                0 0 20px rgba(255, 255, 255, 0.25),
                0 0 40px rgba(147, 197, 253, 0.35),
                0 0 60px rgba(147, 197, 253, 0.22);
              opacity: 0.9;
            }
          }

          /* ===== twinkling stars ===== */
          .star {
            animation: starTwinkle 3.5s ease-in-out infinite;
            filter: blur(0.4px);
          }

          @keyframes starTwinkle {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.45; transform: scale(0.82); }
          }

          /* ===== smooth day → night theme-safe gradients (class-driven) ===== */
          .day-sky {
            background: linear-gradient(135deg, rgba(219,234,254,0.9), rgba(191,219,254,0.85), rgba(147,197,253,0.75));
            transition: background 800ms ease-in-out;
          }
          .afternoon-sky {
            background: linear-gradient(135deg, rgba(255,247,214,0.95), rgba(252,211,77,0.85), rgba(251,146,60,0.75));
            transition: background 800ms ease-in-out;
          }
          .night-sky {
            background: linear-gradient(135deg, rgba(30,41,59,0.95), rgba(15,23,42,0.95), rgba(30,27,75,0.92));
            transition: background 800ms ease-in-out;
          }

          /* small accessibility nicety: focus ring for floating button */
          .floating-add:focus {
            outline: 2px solid rgba(59,130,246,0.25);
            outline-offset: 4px;
          }
        `}</style>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 w-full mb-5">
        <SummaryCard
          title="Total Spent"
          value={`₹${formatIndianCurrency(total)}`}
          gradient="from-blue-600 to-indigo-700"
          subtitle="All-time net spend"
        />
        <SummaryCard
          title="Today's Spend"
          value={`₹${formatIndianCurrency(todayTotal)}`}
          gradient="from-emerald-600 to-teal-700"
          subtitle={`${todayEntryCount} entries logged`}
        />
        <SummaryCard
          title="Highest Expense"
          value={`₹${formatIndianCurrency(maxExpense > 0 ? maxExpense : 0)}`}
          gradient="from-rose-600 to-pink-700"
          subtitle="Across active expenses"
        />
      </div>

      {/* Health Pulse */}
      {activeExpenses.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-4">
          <SectionCard className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-2xl bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300">
                <CalendarDays className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Today at a glance
                </p>
                <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  ₹{formatIndianCurrency(todayTotal)}
                </p>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                <span>Daily baseline</span>
                <span>{todayProgress.toFixed(0)}%</span>
              </div>
              <div className="h-2.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-linear-to-r from-blue-500 to-indigo-600 rounded-full transition-all"
                  style={{ width: `${todayProgress}%` }}
                />
              </div>
              {latestExpense && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
                  Last entry • {latestExpense.title} (₹
                  {formatIndianCurrency(Math.abs(latestExpense.amount))})
                </p>
              )}
            </div>
          </SectionCard>

          <SectionCard className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-2xl bg-emerald-50 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-300">
                <Wallet className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Cash flow
                </p>
                <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Net {netFlow >= 0 ? "+" : "-"}₹
                  {formatIndianCurrency(Math.abs(netFlow))}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500 dark:text-gray-400 flex items-center gap-1">
                  <ArrowDownRight className="w-3.5 h-3.5 text-rose-500" />
                  Debits
                </p>
                <p className="text-lg font-semibold text-rose-600 dark:text-rose-400">
                  ₹{formatIndianCurrency(debitTotal)}
                </p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400 flex items-center gap-1">
                  <ArrowUpRight className="w-3.5 h-3.5 text-emerald-500" />
                  Credits
                </p>
                <p className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">
                  ₹{formatIndianCurrency(creditTotal)}
                </p>
              </div>
            </div>
          </SectionCard>

          <SectionCard className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-2xl bg-violet-50 dark:bg-violet-900/40 text-violet-600 dark:text-violet-300">
                <PieChart className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Monthly focus
                </p>
                <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  ₹{formatIndianCurrency(monthlySnapshot.monthTotal)}
                </p>
              </div>
            </div>
            <div>
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2.5">
                  <span>
                    Goal ₹{formatIndianCurrency(monthlySnapshot.monthlyGoal)}
                  </span>
                  <div className="flex items-center gap-2">
                    <span>{monthlySnapshot.progress.toFixed(0)}%</span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={handleGoalToggle}
                        className={`
    inline-flex items-center gap-1 px-3 py-1.5
    rounded-full text-xs font-medium
    transition-all duration-200
    ${
      editingGoal
        ? "border border-violet-300 dark:border-violet-700 text-violet-600 dark:text-violet-300 bg-violet-50 dark:bg-violet-900/40 hover:bg-violet-100 dark:hover:bg-violet-900/60 shadow-sm"
        : "border border-violet-300 dark:border-violet-700 text-violet-700 dark:text-violet-300 bg-white dark:bg-gray-900 hover:bg-violet-50 dark:hover:bg-violet-900/40 shadow"
    }
  `}
                      >
                        {editingGoal ? "Cancel" : "Edit Goal"}
                      </button>

                      {editingGoal && (
                        <button
                          type="button"
                          onClick={handleGoalSave}
                          className="
      inline-flex items-center gap-1 px-3 py-1.5 rounded-full
      text-xs font-medium text-white
      bg-gradient-to-r from-violet-600 to-fuchsia-600
      hover:brightness-110 transition-all duration-200 shadow-md
    "
                        >
                          Save
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                {editingGoal && (
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={1000}
                      step={500}
                      value={goalDraft}
                      onChange={(event) => setGoalDraft(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") handleGoalSave();
                      }}
                      className="flex-1 mb-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm focus:border-violet-500 focus:ring-2 focus:ring-violet-200 dark:focus:ring-violet-800"
                      placeholder="Enter monthly goal"
                    />
                  </div>
                )}
              </div>
              <div className="h-2.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-linear-to-r from-violet-500 to-fuchsia-600 rounded-full transition-all"
                  style={{ width: `${monthlySnapshot.progress}%` }}
                />
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
                {monthlySnapshot.topCategory
                  ? `Top category • ${monthlySnapshot.topCategory.name} (₹${formatIndianCurrency(
                      monthlySnapshot.topCategory.amount,
                    )})`
                  : "Categorize expenses to see focus areas"}
              </p>
            </div>
          </SectionCard>
        </div>
      )}

      {/* Pending Reviews Card - Only show if there are pending reviews */}
      {pending.length > 0 && (
        <SectionCard>
          <p>
            <span className="font-semibold text-gray-800 dark:text-gray-200">
              Pending Reviews:
            </span>
          </p>
          <PendingReviews />
        </SectionCard>
      )}

      {/* Insights Card */}
      {total > 0 && (
        <SectionCard className="hover:shadow-xl transition-shadow duration-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
              <TrendingUp className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
              Weekly Insights 💡
            </h3>
          </div>
          <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            <p>
              📊 Last 7 days total:{" "}
              <span className="font-semibold text-blue-600 dark:text-blue-400">
                ₹{formatIndianCurrency(weeklySpend)}
              </span>
              {previousWeekSpend > 0 && (
                <>
                  {" "}
                  (
                  <span
                    className={`inline-flex items-center gap-1 font-semibold ${
                      weeklyTrendIsDown
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-rose-500 dark:text-rose-400"
                    }`}
                  >
                    {weeklyTrendIsDown ? (
                      <ArrowDownRight className="w-4 h-4" />
                    ) : (
                      <ArrowUpRight className="w-4 h-4" />
                    )}
                    ₹{formatIndianCurrency(Math.abs(weeklyTrend))}
                  </span>{" "}
                  vs last week)
                </>
              )}
            </p>
            {maxExpense > 0 && (
              <p>
                💸 Largest entry on record:{" "}
                <span className="font-semibold text-rose-500 dark:text-rose-400">
                  ₹{formatIndianCurrency(maxExpense)}
                </span>
              </p>
            )}
            {monthlySnapshot.topCategory && (
              <p>
                🏷️ Most active category:{" "}
                <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                  {monthlySnapshot.topCategory.name}
                </span>{" "}
                (₹{formatIndianCurrency(monthlySnapshot.topCategory.amount)})
              </p>
            )}
          </div>
        </SectionCard>
      )}

      {/* Expense List Card */}
      <SectionCard className="overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <IndianRupee className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                Recent Expenses
              </h3>
            </div>
            <button
              onClick={() => navigate("/manage-expenses")}
              aria-label="Manage all expenses"
              className="inline-flex items-center justify-center px-4 py-2 rounded-full text-sm font-semibold text-blue-600 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/40 border border-blue-200 dark:border-blue-800 hover:-translate-y-0.5 transition-transform"
            >
              Manage All
            </button>
          </div>
        </div>
        <div className="p-6">
          <ExpenseList />
        </div>
      </SectionCard>

      {/* Floating Add Button */}
      <button
        onClick={() => navigate("/add-expense")}
        aria-label="Add new expense"
        className="floating-add fixed bottom-6 right-6 sm:bottom-8 sm:right-8 
          p-4 rounded-full text-white
                    bg-linear-to-r from-blue-600 to-indigo-700
          shadow-[0_4px_12px_rgba(0,0,0,0.3)]
          hover:shadow-[0_6px_16px_rgba(0,0,0,0.4)]
          active:scale-95 hover:scale-110
          transition-all duration-200
          z-50"
      >
        <Plus className="w-6 h-6" />
      </button>
    </div>
  );
};

export default Home;
