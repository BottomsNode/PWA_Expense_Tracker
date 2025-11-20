import { useEffect, useState } from "react";

const STORAGE_KEY = "monthlyGoal";

const sanitizeGoal = (value: number | null | undefined, fallback: number) => {
  if (!Number.isFinite(value ?? NaN)) return fallback;
  const normalized = Math.round(Number(value));
  return normalized > 0 ? normalized : fallback;
};

export const useMonthlyGoal = (defaultGoal = 30000) => {
  const [goal, setGoal] = useState(() => {
    if (typeof window === "undefined") return defaultGoal;
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return sanitizeGoal(stored ? Number(stored) : defaultGoal, defaultGoal);
  });

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, String(goal));
  }, [goal]);

  const updateGoal = (nextGoal: number) => {
    setGoal(sanitizeGoal(nextGoal, defaultGoal));
  };

  return { goal, setGoal: updateGoal };
};
