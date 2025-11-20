import React from "react";
import { LoadingProps, LoadingSize } from "@/props";

const SIZE_MAP: Record<LoadingSize, string> = {
  sm: "h-10 w-10",
  md: "h-14 w-14",
  lg: "h-20 w-20",
};

export const Loading: React.FC<LoadingProps> = ({
  message = "Loading insights...",
  size = "md",
  fullscreen = false,
  className = "",
  label = "Content is loading",
}) => {
  const containerClasses = [
    "flex flex-col items-center justify-center text-center gap-3 text-gray-700 dark:text-gray-200",
    fullscreen
      ? "fixed inset-0 z-50 bg-white/75 dark:bg-gray-900/80 backdrop-blur-xl"
      : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={containerClasses}
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <div
        className={`relative ${SIZE_MAP[size]} flex items-center justify-center`}
      >
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-blue-500 border-l-purple-500 animate-spin [animation-duration:900ms]" />
        <div className="absolute inset-1 rounded-full border border-blue-500/10 dark:border-purple-400/10 blur-[1px]" />
        <div className="relative rounded-full bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-violet-500/40 p-3 shadow-inner shadow-blue-500/10">
          <span className="block h-3 w-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 animate-ping [animation-duration:1500ms]" />
        </div>
        <div className="absolute h-full w-full blur-2xl bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-indigo-500/20" />
      </div>
      {message && (
        <div className="space-y-1">
          <p className="text-sm font-medium text-gray-800 dark:text-gray-100 tracking-wide">
            {message}
          </p>
          <p className="text-xs uppercase tracking-[0.35em] text-gray-500 dark:text-gray-400">
            Please wait
          </p>
        </div>
      )}
    </div>
  );
};
