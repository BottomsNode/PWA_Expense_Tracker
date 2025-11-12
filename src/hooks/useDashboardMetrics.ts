import { useExpenseContext } from "@/context"

export const useDashboardMetrics = () => {
    const { expenses, total } = useExpenseContext()

    const today = new Date().toISOString().split("T")[0]

    const todayTotal = expenses
        .filter((expense) => expense.date === today)
        .reduce((sum, expense) => sum + expense.amount, 0)

    const maxExpense = expenses.length
        ? Math.max(...expenses.map((e) => e.amount))
        : 0

    return {
        expenses,
        total,
        today,
        todayTotal,
        maxExpense,
    }
}
