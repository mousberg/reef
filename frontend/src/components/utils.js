import { useState, useCallback } from "react";

export const cls = (...c) => c.filter(Boolean).join(" ");

export function timeAgo(date) {
  let d;
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
  const sec = Math.max(1, Math.floor((now - d) / 1000));
  const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });
  const ranges = [
    [60, "seconds"], [3600, "minutes"], [86400, "hours"],
    [604800, "days"], [2629800, "weeks"], [31557600, "months"],
  ];
  let unit = "years";
  let value = -Math.floor(sec / 31557600);
  for (const [limit, u] of ranges) {
    if (sec < limit) {
      unit = u;
      const div =
        unit === "seconds" ? 1 :
        limit / (unit === "minutes" ? 60 :
        unit === "hours" ? 3600 :
        unit === "days" ? 86400 :
        unit === "weeks" ? 604800 : 2629800);
      value = -Math.floor(sec / div);
      break;
    }
  }
  // Ensure value is finite before formatting
  if (!isFinite(value)) {
    return "Unknown";
  }

  return rtf.format(value, /** @type {Intl.RelativeTimeFormatUnit} */ (unit));
}

export const makeId = (p) => `${p}${Math.random().toString(36).slice(2, 10)}`;

/**
 * Custom hook for localStorage with automatic JSON handling and error handling
 * @param {string} key - localStorage key
 * @param {any} defaultValue - default value if key doesn't exist
 * @param {boolean} isJSON - whether to parse/stringify as JSON (default: true for objects/arrays)
 * @returns {[any, function]} - [value, setValue] tuple similar to useState
 */
export function useLocalStorage(key, defaultValue, isJSON = null) {
  // Auto-detect if we should use JSON based on the default value type
  const shouldUseJSON = isJSON !== null ? isJSON : (typeof defaultValue === 'object' && defaultValue !== null);
  
  // Initialize state with value from localStorage or default
  const [value, setValue] = useState(() => {
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
  const setStoredValue = useCallback((newValue) => {
    try {
      // Allow value to be a function so we have the same API as useState
      const valueToStore = newValue instanceof Function ? newValue(value) : newValue;
      setValue(valueToStore);
      
      if (typeof window !== "undefined") {
        const itemToStore = shouldUseJSON ? JSON.stringify(valueToStore) : valueToStore;
        localStorage.setItem(key, itemToStore);
      }
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, value, shouldUseJSON]);

  return [value, setStoredValue];
}
