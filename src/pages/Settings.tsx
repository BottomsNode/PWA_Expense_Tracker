import { Modal } from "@/base"
import { ThemeToggle } from "@/components"
import { useLocationContext } from "@/context"
import { useInstallPrompt } from "@/hooks"
import {
    Moon,
    MapPin,
    Smartphone,
    Info,
    Lock,
    Settings as SettingsIcon,
    Shield,
    DownloadCloud,
    CheckCircle2,
    XCircle,
} from "lucide-react"
import { useState, useEffect } from "react"

export const Settings = () => {
    const { installAvailable, promptInstall } = useInstallPrompt()
    const {
        permissionGranted,
        requestLocationPermission,
        revokePermission,
        location,
        fetching,
    } = useLocationContext()

    const [isInstalled, setIsInstalled] = useState(false)
    const [showModal, setShowModal] = useState(false)

    useEffect(() => {
        const checkInstalled = () => {
            setIsInstalled(window.matchMedia("(display-mode: standalone)").matches)
        }
        checkInstalled()
        window.addEventListener("appinstalled", checkInstalled)
        return () => window.removeEventListener("appinstalled", checkInstalled)
    }, [])

    return (
        <div className="flex items-center justify-center">
            <div className="max-w-2xl w-full bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-3 sm:p-4 md:p-6 transition-all duration-300 hover:shadow-3xl">
                {/* Header */}
                <div className="text-center mb-3 sm:mb-4 md:mb-6">
                    <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-blue-100 dark:bg-blue-900 rounded-full mb-1 sm:mb-2">
                        <SettingsIcon className="text-blue-600 dark:text-blue-400 w-6 h-6 sm:w-8 sm:h-8" />
                    </div>
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                        Settings
                    </h1>
                    <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
                        Customize your experience
                    </p>
                </div>

                <div className="space-y-4 sm:space-y-6">
                    {/* Appearance */}
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-2xl p-3 sm:p-4 transition-colors">
                        <div className="flex items-center mb-2 sm:mb-3">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-500 rounded-lg flex items-center justify-center mr-3 sm:mr-4">
                                <Moon className="text-white w-5 h-5 sm:w-6 sm:h-6" />
                            </div>
                            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                                Appearance
                            </h3>
                        </div>
                        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-3 sm:mb-4">
                            Toggle between light and dark themes for a personalized look.
                        </p>
                        <div className="flex justify-center">
                            <ThemeToggle />
                        </div>
                    </div>

                    {/* 📍 Location Access */}
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-2xl p-3 sm:p-4 transition-colors">
                        <div className="flex items-center mb-2 sm:mb-3">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-yellow-500 rounded-lg flex items-center justify-center mr-3 sm:mr-4">
                                <MapPin className="text-white w-5 h-5 sm:w-6 sm:h-6" />
                            </div>
                            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                                Location Access
                            </h3>
                        </div>
                        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-3 sm:mb-4">
                            Manage app access to your current location.
                        </p>

                        <div className="flex justify-center">
                            {permissionGranted ? (
                                <button
                                    onClick={revokePermission}
                                    disabled={fetching}
                                    className="w-full sm:w-64 bg-red-500 hover:bg-red-600 text-white py-2 sm:py-2.5 rounded-xl font-semibold shadow-md hover:scale-105 transition-all flex items-center justify-center gap-2"
                                >
                                    <Lock className="w-4 h-4" />
                                    Revoke Access
                                </button>
                            ) : (
                                <button
                                    onClick={() => setShowModal(true)}
                                    disabled={fetching}
                                    className={`w-full sm:w-64 py-2 sm:py-2.5 rounded-xl font-semibold text-white shadow-md transition-all flex items-center justify-center gap-2 ${fetching
                                        ? "bg-gray-400 cursor-wait"
                                        : "bg-blue-500 hover:bg-blue-600 hover:scale-105 active:scale-95"
                                        }`}
                                >
                                    <Shield className="w-4 h-4" />
                                    {fetching ? "Requesting..." : "Grant Access"}
                                </button>
                            )}
                        </div>

                        {/* Current Location */}
                        {permissionGranted && location && (
                            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-3 text-center">
                                Current:{" "}
                                {location.address ||
                                    `${location.latitude.toFixed(2)}, ${location.longitude.toFixed(2)}`}
                            </p>
                        )}

                        {/* Permission Modal */}
                        {showModal && (
                            <Modal
                                show={showModal}
                                type="info"
                                title="Allow Location Access"
                                message="This app will use your current location to tag your expenses. You can revoke this permission anytime from Settings."
                                confirmText="Allow"
                                cancelText="Cancel"
                                onConfirm={() => {
                                    setShowModal(false)
                                    setTimeout(() => {
                                        requestLocationPermission()
                                    }, 150)
                                }}
                                onCancel={() => setShowModal(false)}
                            />
                        )}
                    </div>

                    {/* 📱 App Installation */}
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-2xl p-3 sm:p-4 transition-colors">
                        <div className="flex items-center mb-2 sm:mb-3">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-500 rounded-lg flex items-center justify-center mr-3 sm:mr-4">
                                <Smartphone className="text-white w-5 h-5 sm:w-6 sm:h-6" />
                            </div>
                            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                                App Installation
                            </h3>
                        </div>
                        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-3 sm:mb-4">
                            Install the app for offline access and faster performance.
                        </p>
                        <div className="flex justify-center">
                            {isInstalled ? (
                                <button
                                    disabled
                                    className="w-full sm:w-64 bg-linear-to-r from-green-400 to-green-500 text-white py-2 sm:py-2.5 px-3 sm:px-4 rounded-xl font-semibold shadow-lg text-sm sm:text-base cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    <CheckCircle2 className="w-4 h-4" />
                                    Already Installed
                                </button>
                            ) : installAvailable ? (
                                <button
                                    onClick={promptInstall}
                                    className="w-full sm:w-64 bg-linear-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700
                    text-white py-2 sm:py-2.5 px-3 sm:px-4 rounded-xl font-semibold transition-all duration-200
                    hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl text-sm sm:text-base flex items-center justify-center gap-2"
                                >
                                    <DownloadCloud className="w-4 h-4" />
                                    Install Now
                                </button>
                            ) : (
                                <button
                                    disabled
                                    className="w-full sm:w-64 bg-linear-to-r from-gray-400 to-gray-500 text-gray-300 py-2 sm:py-2.5 px-3 sm:px-4 rounded-xl font-semibold shadow-lg text-sm sm:text-base cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    <XCircle className="w-4 h-4" />
                                    Not Available
                                </button>
                            )}
                        </div>
                    </div>

                    {/* ℹ️ App Info */}
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-2xl p-3 sm:p-4 transition-colors">
                        <div className="flex items-center mb-2 sm:mb-3">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-500 rounded-lg flex items-center justify-center mr-3 sm:mr-4">
                                <Info className="text-white w-5 h-5 sm:w-6 sm:h-6" />
                            </div>
                            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                                App Information
                            </h3>
                        </div>
                        <div className="space-y-1 sm:space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                                    Version
                                </span>
                                <span className="font-medium text-gray-900 dark:text-white bg-gray-200 dark:bg-gray-600 px-2 sm:px-3 py-1 rounded-lg text-sm sm:text-base">
                                    v1.0.1
                                </span>
                            </div>
                            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                                Your data is stored securely with you locally. No cloud sync yet.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
