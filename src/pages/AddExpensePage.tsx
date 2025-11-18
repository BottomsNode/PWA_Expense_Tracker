import { PlusCircle } from "lucide-react";
import { AddExpense } from "@/components";

export const AddExpensePage = () => (
  <div className="sm:p-4 md:p-6 max-w-7xl mx-auto w-full bg-white/50 dark:bg-gray-800/50 rounded-t-3xl md:rounded-t-none shadow-inner">
    {/* Header (Matched with Daily UI) */}
    <header className="flex items-center gap-3 pb-6 border-b border-gray-200 dark:border-gray-700">
      <PlusCircle className="h-7 w-7 text-blue-600 dark:text-blue-400" />
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
        Add New Expense
      </h1>
    </header>
    <main className="mt-6 backdrop-blur-md bg-white/80 dark:bg-gray-900/80 rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-5 sm:p-8 space-y-6">
      <AddExpense />
    </main>
  </div>
);
