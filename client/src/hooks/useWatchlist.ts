"use client";

import { useCallback, useEffect, useState } from "react";

export interface WatchlistEntry {
  symbol: string;
  yahooSymbol: string;
  name: string;
  exchange: string | null;
  addedAt: string;
}

const STORAGE_KEY = "ds-watchlist";

function readStored(): WatchlistEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (e): e is WatchlistEntry =>
        e && typeof e.symbol === "string" && typeof e.yahooSymbol === "string"
    );
  } catch {
    return [];
  }
}

export function useWatchlist() {
  const [watchlist, setWatchlist] = useState<WatchlistEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setWatchlist(readStored());
      setLoading(false);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (loading) return;
    const timer = setTimeout(() => {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(watchlist));
      } catch {
        setError("Couldn't save watchlist on this device.");
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [watchlist, loading]);

  const isInWatchlist = useCallback(
    (symbol: string) => {
      const needle = symbol.trim().toUpperCase();
      return watchlist.some(
        (e) => e.symbol.toUpperCase() === needle || e.yahooSymbol.toUpperCase() === needle
      );
    },
    [watchlist]
  );

  const addTicker = useCallback(
    (entry: Omit<WatchlistEntry, "addedAt">): boolean => {
      const symbol = entry.symbol.trim().toUpperCase();
      const yahooSymbol = entry.yahooSymbol.trim();
      if (!symbol || !yahooSymbol) {
        setError("Invalid ticker.");
        return false;
      }
      if (
        watchlist.some((e) => e.symbol.toUpperCase() === symbol || e.yahooSymbol === yahooSymbol)
      ) {
        setError(`${symbol} is already in your watchlist.`);
        return false;
      }
      setWatchlist((prev) => [
        ...prev,
        {
          symbol,
          yahooSymbol,
          name: entry.name || symbol,
          exchange: entry.exchange ?? null,
          addedAt: new Date().toISOString(),
        },
      ]);
      setError(null);
      return true;
    },
    [watchlist]
  );

  const removeTicker = useCallback((symbol: string) => {
    const needle = symbol.trim().toUpperCase();
    setWatchlist((prev) =>
      prev.filter((e) => e.symbol.toUpperCase() !== needle && e.yahooSymbol.toUpperCase() !== needle)
    );
  }, []);

  const refresh = useCallback(() => {
    setLoading(true);
    setTimeout(() => {
      setWatchlist(readStored());
      setError(null);
      setLoading(false);
    }, 0);
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return { watchlist, loading, error, addTicker, removeTicker, isInWatchlist, refresh, clearError };
}
