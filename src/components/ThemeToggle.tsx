import { useThemeContext } from "@/context"
import { Sun, Moon } from "lucide-react"

export const ThemeToggle = () => {
    const { theme, setTheme } = useThemeContext()

    const handleToggle = () => {
        const newTheme = theme === "dark" ? "light" : "dark"
        setTheme(newTheme)
    }

    return (
        <button
            onClick={handleToggle}
            className={`w-full sm:w-64 py-2.5 sm:py-3 px-4 sm:px-6 rounded-xl font-semibold text-sm sm:text-base 
                        shadow-lg transition-all duration-200 flex items-center justify-center gap-2
                        ${theme === "dark"
                    ? "bg-linear-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-white"
                    : "bg-linear-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white"
                } 
                        hover:scale-105 active:scale-95`}
            aria-label="Toggle theme"
        >
            {theme === "dark" ? (
                <>
                    <Sun className="w-5 h-5 sm:w-6 sm:h-6" />
                    <span>Switch to Light Mode</span>
                </>
            ) : (
                <>
                    <Moon className="w-5 h-5 sm:w-6 sm:h-6" />
                    <span>Switch to Dark Mode</span>
                </>
            )}
        </button>
    )
}
