import { Expense, ExpenseContext } from "@/types";
import { useState, useEffect } from "react";

export const ExpenseProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const stored = localStorage.getItem("expenses");
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    localStorage.setItem("expenses", JSON.stringify(expenses));
  }, [expenses]);

  const addExpense = (expense: Omit<Expense, "id">) => {
    const newExpense = { id: crypto.randomUUID(), ...expense };
    setExpenses((prev) => [newExpense, ...prev]);
  };

  const deleteExpense = (id: string) => {
    setExpenses((prev) =>
      prev.map((e) => (e.id === id ? { ...e, deleted: true } : e)),
    );
  };

  const restoreExpense = (id: string) => {
    setExpenses((prev) =>
      prev.map((e) => (e.id === id ? { ...e, deleted: false } : e)),
    );
  };

  const removeExpense = (id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  };

  const clearAll = () => setExpenses([]);

  const purgeDeleted = () =>
    setExpenses((prev) => prev.filter((e) => !e.deleted));
  const total = expenses.reduce(
    (sum, e) => (e.deleted ? sum : sum + e.amount),
    0,
  );

  return (
    <ExpenseContext.Provider
      value={{
        expenses,
        addExpense,
        deleteExpense,
        restoreExpense,
        removeExpense,
        clearAll,
        purgeDeleted,
        total,
      }}
    >
      {children}
    </ExpenseContext.Provider>
  );
};
