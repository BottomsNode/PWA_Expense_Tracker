import { Expense } from "./Expense";

export type ExpenseContextType = {
  expenses: Expense[];
  addExpense: (expense: Omit<Expense, "id">) => void;
  deleteExpense: (id: string) => void;
  restoreExpense: (id: string) => void;
  removeExpense: (id: string) => void;
  clearAll: () => void;
  purgeDeleted: () => void;
  total: number;
};
