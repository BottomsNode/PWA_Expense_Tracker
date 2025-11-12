import React from "react"
import {
    IndianRupee,
    FileText,
    PlusCircle,
    StickyNote,
    MapPin,
    Tag,
} from "lucide-react"
import { useLocationContext } from "@/context"
import { InputField, Popup, TextAreaField } from "@/base"
import { Listbox, Transition } from "@headlessui/react"
import { useAddExpense } from "@/hooks"

export const AddExpense: React.FC = () => {
    const {
        title,
        amount,
        description,
        category,
        error,
        popupMessage,
        popupType,
        showPopup,
        setTitle,
        setAmount,
        setDescription,
        setCategory,
        setShowPopup,
        handleSubmit,
    } = useAddExpense()

    const { permissionGranted, location } = useLocationContext()

    const categories = [
        "Food & Drinks",
        "Transport",
        "Shopping",
        "Entertainment",
        "Bills & Utilities",
        "Health",
        "Education",
        "Other",
    ]

    return (
        <>
            <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in">
                <InputField
                    icon={<FileText className="h-5 w-5 text-gray-500" />}
                    label="Expense Title"
                    placeholder="e.g. Coffee, Groceries, Taxi"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="transition-all duration-200 focus:ring-2 focus:ring-indigo-500 hover:border-indigo-400"
                />

                <InputField
                    icon={<IndianRupee className="h-5 w-5 text-gray-500" />}
                    label="Amount (₹)"
                    placeholder="Enter amount"
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="transition-all duration-200 focus:ring-2 focus:ring-indigo-500 hover:border-indigo-400"
                />

                {/* Category Dropdown */}
                <div>
                    <label
                        htmlFor="category"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                        Category
                    </label>

                    <div className="relative">
                        <Tag className="absolute left-3 top-3 h-5 w-5 text-gray-500 pointer-events-none" />

                        <Listbox value={category} onChange={setCategory}>
                            <Listbox.Button
                                className="flex items-center w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 
                rounded-xl shadow-sm pl-10 pr-10 py-3 text-sm sm:text-base text-gray-800 dark:text-gray-100 
                transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 hover:border-indigo-400"
                            >
                                <span className="block truncate">
                                    {category || "Select category"}
                                </span>
                                <span className="absolute right-3 pointer-events-none text-gray-500 dark:text-gray-400">
                                    ▼
                                </span>
                            </Listbox.Button>

                            <Transition
                                as={React.Fragment}
                                leave="transition ease-in duration-100"
                                leaveFrom="opacity-100"
                                leaveTo="opacity-0"
                            >
                                <Listbox.Options
                                    className="absolute z-50 mt-1 w-full max-h-60 overflow-auto bg-white dark:bg-gray-800 
                    border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl focus:outline-none"
                                >
                                    {categories.map((cat) => (
                                        <Listbox.Option
                                            key={cat}
                                            value={cat}
                                            className={({ active, selected }) =>
                                                `cursor-pointer select-none px-4 py-2 text-sm sm:text-base
                                ${active
                                                    ? "bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-200"
                                                    : "text-gray-800 dark:text-gray-100"}
                                ${selected ? "font-semibold" : "font-normal"}`
                                            }
                                        >
                                            {({ selected }) => (
                                                <div className="flex justify-between items-center">
                                                    <span className="block truncate">{cat}</span>
                                                    {selected && (
                                                        <span className="text-indigo-600 dark:text-indigo-400">
                                                            ✓
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </Listbox.Option>
                                    ))}
                                </Listbox.Options>
                            </Transition>
                        </Listbox>
                    </div>
                </div>

                <TextAreaField
                    icon={<StickyNote className="h-5 w-5 text-gray-500" />}
                    label="Description (Optional)"
                    placeholder="Add notes like purpose, who, or where..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="transition-all duration-200 focus:ring-2 focus:ring-indigo-500 hover:border-indigo-400"
                />

                {/* 📍 Location Display */}
                {permissionGranted && location && (
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 gap-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-xl transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-600">
                        <MapPin className="h-4 w-4 text-green-500" />
                        <span className="font-medium">
                            {location.address ||
                                `${location.latitude.toFixed(3)}, ${location.longitude.toFixed(3)}`}
                        </span>
                    </div>
                )}

                {error && (
                    <div className="text-red-600 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 text-sm font-medium p-4 rounded-xl text-center animate-bounce">
                        {error}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={!title || !amount}
                    className={`w-full py-4 rounded-2xl font-semibold text-white flex items-center justify-center gap-3 shadow-lg transition-all duration-300 ${title && amount
                        ? "bg-linear-to-r from-indigo-500 to-purple-600 hover:scale-105 hover:shadow-xl active:scale-95 focus:ring-4 focus:ring-indigo-300 dark:focus:ring-indigo-800"
                        : "bg-gray-400 cursor-not-allowed opacity-50"
                        }`}
                >
                    <PlusCircle className="h-6 w-6 transition-transform duration-200 hover:rotate-12" />
                    Add Expense
                </button>
            </form>

            <Popup
                message={popupMessage}
                type={popupType}
                show={showPopup}
                onClose={() => setShowPopup(false)}
            />
        </>
    )
}