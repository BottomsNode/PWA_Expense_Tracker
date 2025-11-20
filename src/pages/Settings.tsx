import { Loading, Modal } from "@/base";
import { ThemeToggle } from "@/components";
import { useLocationContext } from "@/context";
import { useInstallPrompt } from "@/hooks";
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
} from "lucide-react";

import { useState, useEffect } from "react";

export const Settings = () => {
  const {
    installAvailable,
    installed,
    showInstallModal,
    setShowInstallModal,
    platform,
    blocked,
    triggerInstall,
  } = useInstallPrompt();
  const {
    permissionGranted,
    requestLocationPermission,
    revokePermission,
    location,
    fetching,
  } = useLocationContext();

  const [isInstalled, setIsInstalled] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const appVersion = __APP_VERSION__;

  useEffect(() => {
    const checkInstalled = () => {
      setIsInstalled(window.matchMedia("(display-mode: standalone)").matches);
    };
    checkInstalled();
    window.addEventListener("appinstalled", checkInstalled);
    return () => window.removeEventListener("appinstalled", checkInstalled);
  }, []);

  return (
    <div className="flex justify-center py-3 px-4 bg-gray-50 dark:bg-gray-900/1">
      <div className="w-full max-w-4xl space-y-6">
        {/* SETTINGS HEADER */}
        <div className="mb-5">
          {/* Title Row */}
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-full">
              <SettingsIcon className="w-6 h-6 sm:w-7 sm:h-7 text-blue-600 dark:text-blue-400" />
            </div>

            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-50 leading-tight">
              Settings
            </h1>
          </div>

          {/* Subtext */}
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            Customize your app experience and manage permissions.
          </p>

          {/* Divider */}
          <hr className="border-gray-300 dark:border-gray-700" />
        </div>

        {/* SETTINGS GRID */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* APPEARANCE CARD */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl transition-shadow duration-200">
            <h2 className="flex items-center gap-2 text-xl font-semibold text-gray-900 dark:text-white mb-3">
              <div className="p-1 bg-blue-100 dark:bg-blue-900 rounded">
                <Moon className="w-5 h-5 text-blue-500" />
              </div>
              Appearance
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Switch between light and dark themes.
            </p>
            <ThemeToggle />
          </div>

          {/* LOCATION ACCESS CARD */}
          <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl transition-shadow duration-200 overflow-hidden">
            {fetching && (
              <Loading
                size="sm"
                message="Requesting secure location..."
                label="Requesting location access"
                className="absolute inset-0 z-10 rounded-xl bg-white/85 dark:bg-gray-900/80 backdrop-blur-sm"
              />
            )}
            <h2 className="flex items-center gap-2 text-xl font-semibold text-gray-900 dark:text-white mb-3">
              <div className="p-1 bg-yellow-100 dark:bg-yellow-900 rounded">
                <MapPin className="w-5 h-5 text-yellow-500" />
              </div>
              Location Access
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Manage how the app uses your location.
            </p>
            {permissionGranted ? (
              <button
                onClick={revokePermission}
                disabled={fetching}
                className="w-full sm:w-64 py-2.5 sm:py-3 px-4 sm:px-6 rounded-xl font-semibold text-sm sm:text-base shadow-lg transition-all duration-200 flex items-center justify-center gap-2 bg-linear-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                <Lock className="w-5 h-5 sm:w-6 sm:h-6" />
                <span>Revoke Access</span>
              </button>
            ) : (
              <button
                onClick={() => setShowModal(true)}
                disabled={fetching}
                className={`w-full sm:w-64 py-2.5 sm:py-3 px-4 sm:px-6 rounded-xl font-semibold text-sm sm:text-base shadow-lg transition-all duration-200 flex items-center justify-center gap-2 text-white hover:scale-105 active:scale-95 ${
                  fetching
                    ? "bg-gray-400 cursor-not-allowed opacity-50"
                    : "bg-linear-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
                }`}
              >
                <Shield className="w-5 h-5 sm:w-6 sm:h-6" />
                <span>{fetching ? "Requesting…" : "Grant Access"}</span>
              </button>
            )}
            {permissionGranted && location && (
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-3">
                Current:{" "}
                {location?.address ||
                  `${location.latitude.toFixed(2)}, ${location.longitude.toFixed(2)}`}
              </p>
            )}
            {showModal && (
              <Modal
                show={showModal}
                type="info"
                title="Allow Location Access"
                message="The app uses your current location to tag expenses."
                confirmText="Allow"
                cancelText="Cancel"
                onConfirm={() => {
                  setShowModal(false);
                  setTimeout(() => requestLocationPermission(), 150);
                }}
                onCancel={() => setShowModal(false)}
              />
            )}
          </div>

          {/* APP INSTALL CARD */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl transition-shadow duration-200">
            <h2 className="flex items-center gap-2 text-xl font-semibold text-gray-900 dark:text-white mb-3">
              <div className="p-1 bg-green-100 dark:bg-green-900 rounded">
                <Smartphone className="w-5 h-5 text-green-600" />
              </div>
              App Installation
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Install for offline access and better performance.
            </p>
            {installed || isInstalled ? (
              <button
                disabled
                className="w-full sm:w-64 py-2.5 sm:py-3 px-4 sm:px-6 rounded-xl font-semibold text-sm sm:text-base shadow-lg transition-all duration-200 flex items-center justify-center gap-2 bg-linear-to-r from-green-500 to-green-600 text-white opacity-90 cursor-not-allowed disabled:hover:scale-100"
              >
                <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6" />
                <span>Installed</span>
              </button>
            ) : installAvailable ? (
              <button
                onClick={() => setShowInstallModal(true)}
                className="w-full sm:w-64 py-2.5 sm:py-3 px-4 sm:px-6 rounded-xl font-semibold text-sm sm:text-base shadow-lg transition-all duration-200 flex items-center justify-center gap-2 bg-linear-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white hover:scale-105 active:scale-95"
              >
                <DownloadCloud className="w-5 h-5 sm:w-6 sm:h-6" />
                <span>Install Now</span>
              </button>
            ) : (
              <button
                disabled
                className="w-full sm:w-64 py-2.5 sm:py-3 px-4 sm:px-6 rounded-xl font-semibold text-sm sm:text-base shadow-lg transition-all duration-200 flex items-center justify-center gap-2 bg-gray-400 text-white opacity-70 cursor-not-allowed disabled:hover:scale-100"
              >
                <XCircle className="w-5 h-5 sm:w-6 sm:h-6" />
                <span>Not Available</span>
              </button>
            )}
            {showInstallModal && (
              <Modal
                show={showInstallModal}
                type="info"
                title="Install App"
                message={(() => {
                  if (platform === "ios") {
                    return "On iPhone/iPad, install the app by tapping the Share icon → Add to Home Screen.";
                  }
                  if (blocked) {
                    return "Your browser blocked the install prompt. You can still install the app from your browser menu.";
                  }
                  return "Install this app for offline access and faster performance.";
                })()}
                confirmText={platform === "ios" || blocked ? "OK" : "Install"}
                cancelText="Close"
                onConfirm={
                  platform === "ios" || blocked
                    ? () => setShowInstallModal(false)
                    : triggerInstall
                }
                onCancel={() => setShowInstallModal(false)}
              />
            )}
          </div>

          {/* APP INFO CARD */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl transition-shadow duration-200">
            <h2 className="flex items-center gap-2 text-xl font-semibold text-gray-900 dark:text-white mb-3">
              <div className="p-1 bg-purple-100 dark:bg-purple-900 rounded">
                <Info className="w-5 h-5 text-purple-500" />
              </div>
              App Information
            </h2>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  Version
                </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  v{appVersion}
                </span>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Your data stays on your device. No cloud sync yet.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
