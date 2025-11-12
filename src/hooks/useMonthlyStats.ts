import { useExpenseContext } from "@/context"
import { useMemo, useState } from "react"

export const useMonthlyStats = () => {
    const { expenses } = useExpenseContext()
    const currentDate = new Date()

    const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear())
    const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth())

    const monthName = new Date(selectedYear, selectedMonth).toLocaleString("default", {
        month: "long",
        year: "numeric",
    })

    const stats = useMemo(() => {
        const monthExpenses = expenses.filter((e) => {
            const date = new Date(e.date)
            return (
                date.getMonth() === selectedMonth &&
                date.getFullYear() === selectedYear &&
                !e.deleted
            )
        })

        const total = monthExpenses.reduce((sum, e) => sum + e.amount, 0)
        const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate()
        const avgPerDay = daysInMonth ? total / daysInMonth : 0
        const highest = Math.max(...monthExpenses.map((e) => e.amount), 0)

        // Daily totals
        const dailyTotals = Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1
            const dayTotal = monthExpenses
                .filter((e) => new Date(e.date).getDate() === day)
                .reduce((sum, e) => sum + e.amount, 0)
            return { day, amount: dayTotal }
        })

        // Category totals
        const categoryTotals: Record<string, number> = {}
        monthExpenses.forEach((e) => {
            const key = e.category || "Uncategorized"
            categoryTotals[key] = (categoryTotals[key] || 0) + e.amount
        })
        const categoryData = Object.entries(categoryTotals).map(([name, value]) => ({
            name,
            value,
        }))

        return {
            total,
            avgPerDay,
            highest,
            dailyTotals,
            categoryData,
            count: monthExpenses.length,
            expenses: monthExpenses,
        }
    }, [expenses, selectedMonth, selectedYear])

    const changeMonth = (delta: number) => {
        let newMonth = selectedMonth + delta
        let newYear = selectedYear
        if (newMonth > 11) {
            newMonth = 0
            newYear++
        } else if (newMonth < 0) {
            newMonth = 11
            newYear--
        }
        setSelectedMonth(newMonth)
        setSelectedYear(newYear)
    }

    return {
        stats,
        selectedMonth,
        selectedYear,
        monthName,
        changeMonth,
    }
}
