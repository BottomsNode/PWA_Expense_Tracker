import { PlusCircle } from "lucide-react";
import { AddExpense } from "@/components";

export const AddExpensePage = () => (
    <div>
        <div className="backdrop-blur-md rounded-2xl shadow-lg p-5 sm:p-8">
            <h1 className="text-2xl sm:text-3xl font-extrabold mb-6 text-center text-blue-600 dark:text-blue-300 flex items-center justify-center gap-2">
                <PlusCircle className="h-6 w-6" />
                Add New Expense
            </h1>
            <AddExpense />
        </div>
    </div>
);
