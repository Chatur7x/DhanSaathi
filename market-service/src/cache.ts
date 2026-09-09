import type { MarketQuote } from "./feeds/yahoo.js";

export interface CacheEntry {
  quote: MarketQuote;
  cachedAt: number; // epoch ms when stored
}

function getStaleAfterMs(): number {
  const raw = process.env.STALE_AFTER_MS;
  const parsed = raw ? parseInt(raw, 10) : NaN;
  if (!Number.isNaN(parsed) && parsed > 0) return parsed;
  // Sensible default: 2x the slowest refresh interval (60s) = 120s
  return 120_000;
}

/**
 * In-memory last-known-price cache.
 * Keyed by display ticker (e.g. "NIFTY"), NOT yahooSymbol, so lookups
 * from both fetch paths stay consistent.
 */
export class QuoteCache {
  private store = new Map<string, CacheEntry>();

  set(ticker: string, quote: MarketQuote): void {
    this.store.set(ticker, { quote: { ...quote }, cachedAt: Date.now() });
  }

  get(ticker: string): MarketQuote | undefined {
    const entry = this.store.get(ticker);
    return entry ? { ...entry.quote } : undefined;
  }

  /** Raw entry (for age/stale inspection). */
  getEntry(ticker: string): CacheEntry | undefined {
    const entry = this.store.get(ticker);
    return entry ? { quote: { ...entry.quote }, cachedAt: entry.cachedAt } : undefined;
  }

  has(ticker: string): boolean {
    return this.store.has(ticker);
  }

  /** Age in ms since the quote was cached. -1 when missing. */
  getAgeMs(ticker: string, now = Date.now()): number {
    const entry = this.store.get(ticker);
    if (!entry) return -1;
    return Math.max(0, now - entry.cachedAt);
  }

  /** True when missing OR older than STALE_AFTER_MS. */
  isStale(ticker: string, staleAfterMs = getStaleAfterMs(), now = Date.now()): boolean {
    const entry = this.store.get(ticker);
    if (!entry) return true;
    return now - entry.cachedAt > staleAfterMs;
  }

  remove(ticker: string): boolean {
    return this.store.delete(ticker);
  }

  clear(): void {
    this.store.clear();
  }

  size(): number {
    return this.store.size;
  }

  keys(): string[] {
    return [...this.store.keys()];
  }

  /**
   * Return the last-known quote marked as stale, with refreshed ageMs.
   * Returns undefined when nothing cached.
   */
  getStaleQuote(ticker: string, now = Date.now()): MarketQuote | undefined {
    const entry = this.store.get(ticker);
    if (!entry) return undefined;
    const ageMs = Math.max(0, now - entry.cachedAt);
    return {
      ...entry.quote,
      source: "cache",
      stale: true,
      ageMs,
    } as MarketQuote;
  }
}

/** Shared singleton used by the feed layer + scheduler + server. */
export const quoteCache = new QuoteCache();

export function getStaleThresholdMs(): number {
  return getStaleAfterMs();
}
