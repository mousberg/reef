import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { useState, useCallback } from "react";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const cls = (...c: (string | boolean | undefined | null)[]) =>
  c.filter(Boolean).join(" ");

export function timeAgo(date: any) {
  let d: Date;
  if (date?.toDate) {
    d = date.toDate(); // Firebase Timestamp
  } else if (typeof date === "string") {
    d = new Date(date);
  } else {
    d = date;
  }

  if (!d || isNaN(d.getTime())) {
    return "Unknown"; // Fallback for invalid dates
  }

  const now = new Date();
  const sec = Math.max(1, Math.floor((now.getTime() - d.getTime()) / 1000));

  // If more than 24 hours ago, show the date
  if (sec >= 86400) {
    return d.toLocaleDateString();
  }

  const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });
  const ranges: [number, Intl.RelativeTimeFormatUnit][] = [
    [60, "second"],
    [3600, "minute"],
    [86400, "hour"],
  ];
  let unit: Intl.RelativeTimeFormatUnit = "hour";
  let value = -Math.floor(sec / 3600);
  for (const [limit, u] of ranges) {
    if (sec < limit) {
      unit = u;
      const div = unit === "second" ? 1 : unit === "minute" ? 60 : 3600;
      value = -Math.floor(sec / div);
      break;
    }
  }
  // Ensure value is finite before formatting
  if (!isFinite(value)) {
    return "Unknown";
  }

  return rtf.format(value, unit);
}

export const makeId = (p: string) =>
  `${p}${Math.random().toString(36).slice(2, 10)}`;

/**
 * Custom hook for localStorage with automatic JSON handling and error handling
 * @param key - localStorage key
 * @param defaultValue - default value if key doesn't exist
 * @param isJSON - whether to parse/stringify as JSON (default: true for objects/arrays)
 * @returns [value, setValue] tuple similar to useState
 */
export function useLocalStorage<T>(
  key: string,
  defaultValue: T,
  isJSON: boolean | null = null,
): [T, (newValue: T | ((prevValue: T) => T)) => void] {
  // Auto-detect if we should use JSON based on the default value type
  const shouldUseJSON =
    isJSON !== null
      ? isJSON
      : typeof defaultValue === "object" && defaultValue !== null;

  // Initialize state with value from localStorage or default
  const [value, setValue] = useState<T>(() => {
    try {
      if (typeof window === "undefined") return defaultValue;

      const item = localStorage.getItem(key);
      if (!item) return defaultValue;

      return shouldUseJSON ? JSON.parse(item) : item;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return defaultValue;
    }
  });

  // Update localStorage when value changes
  const setStoredValue = useCallback(
    (newValue: T | ((prevValue: T) => T)) => {
      try {
        // Allow value to be a function so we have the same API as useState
        const valueToStore =
          newValue instanceof Function ? newValue(value) : newValue;
        setValue(valueToStore);

        if (typeof window !== "undefined") {
          const itemToStore = shouldUseJSON
            ? JSON.stringify(valueToStore)
            : String(valueToStore);
          localStorage.setItem(key, itemToStore);
        }
      } catch (error) {
        console.warn(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, value, shouldUseJSON],
  );

  return [value, setStoredValue];
}
