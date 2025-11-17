import { useExpenseContext } from "@/context";
import { Expense } from "@/types";

export const useDailyExpenses = () => {
  const { expenses } = useExpenseContext() as { expenses: Expense[] };

  const groupedExpenses = expenses.reduce<Record<string, Expense[]>>(
    (acc, expense) => {
      const date = expense.date;
      if (!acc[date]) acc[date] = [];
      acc[date].push(expense);
      return acc;
    },
    {},
  );

  for (const date in groupedExpenses) {
    groupedExpenses[date].sort(
      (a, b) =>
        new Date(`${b.date} ${b.time}`).getTime() -
        new Date(`${a.date} ${a.time}`).getTime(),
    );
  }

  const sortedDates = Object.keys(groupedExpenses).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime(),
  );

  const dailyTotals = Object.fromEntries(
    sortedDates.map((date) => [
      date,
      groupedExpenses[date].reduce((sum, e) => sum + e.amount, 0),
    ]),
  );

  return {
    groupedExpenses,
    sortedDates,
    dailyTotals,
    hasExpenses: expenses.length > 0,
  };
};
