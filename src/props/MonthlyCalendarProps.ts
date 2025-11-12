export interface MonthlyCalendarProps {
    dailyTotals: { day: number; amount: number }[]
    year: number
    month: number
    selectedDay?: number | null
    onSelectDay?: (day: number) => void
}
