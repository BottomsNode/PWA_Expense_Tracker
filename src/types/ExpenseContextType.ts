import { Expense } from "./Expense"

export type ExpenseContextType = {
    expenses: Expense[]
    addExpense: (expense: Omit<Expense, 'id'>) => void
    deleteExpense: (id: string) => void
    clearAll: () => void
    purgeDeleted: () => void
    total: number
}