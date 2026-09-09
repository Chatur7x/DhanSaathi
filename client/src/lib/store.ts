"use client";

import { useEffect, useState } from "react";

/** Persisted state hook (localStorage). Drop-in replacement for useState. */
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === "undefined") return initialValue;
    try {
      const raw = window.localStorage.getItem(key);
      return raw !== null ? (JSON.parse(raw) as T) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // storage full / private mode — stay in-memory
    }
  }, [key, value]);

  return [value, setValue] as const;
}
