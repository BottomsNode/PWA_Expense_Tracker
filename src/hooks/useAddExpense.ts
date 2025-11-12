import { useState } from "react"
import { useExpenseContext, useLocationContext } from "@/context"

export const useAddExpense = () => {
    const { addExpense } = useExpenseContext()
    const { permissionGranted, location } = useLocationContext()

    const [title, setTitle] = useState("")
    const [amount, setAmount] = useState("")
    const [description, setDescription] = useState("")
    const [category, setCategory] = useState("")
    const [error, setError] = useState("")
    const [popupMessage, setPopupMessage] = useState("")
    const [popupType, setPopupType] = useState<"success" | "error" | "info">("info")
    const [showPopup, setShowPopup] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!title.trim() || !amount.trim()) {
            setError("Please fill out all required fields.")
            return
        }

        const parsedAmount = parseFloat(amount)
        if (isNaN(parsedAmount) || parsedAmount <= 0) {
            setError("Please enter a valid amount greater than 0.")
            return
        }

        const now = new Date()
        const date = now.toLocaleDateString("en-CA") // YYYY-MM-DD
        const time = now.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        })

        addExpense({
            title: title.trim(),
            amount: parsedAmount,
            date,
            time,
            description: description.trim() || undefined,
            category: category || undefined,
            location: permissionGranted ? location || undefined : undefined,
        })

        setTitle("")
        setAmount("")
        setDescription("")
        setCategory("")
        setError("")

        setPopupType("success")
        setPopupMessage("✅ Expense Added Successfully!")
        setShowPopup(true)
    }

    return {
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
        setPopupMessage,
        setPopupType,
        handleSubmit,
    }
}
