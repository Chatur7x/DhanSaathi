import type { MarketQuote } from "./feeds/yahoo.js";

export interface CacheEntry {
  quote: MarketQuote;
  cachedAt: number;
}

function getStaleAfterMs(): number {
  const raw = process.env.STALE_AFTER_MS;
  const parsed = raw ? parseInt(raw, 10) : NaN;
  if (!Number.isNaN(parsed) && parsed > 0) return parsed;

  return 120_000;
}

export class QuoteCache {
  private store = new Map<string, CacheEntry>();

  set(ticker: string, quote: MarketQuote): void {
    this.store.set(ticker, { quote: { ...quote }, cachedAt: Date.now() });
  }

  get(ticker: string): MarketQuote | undefined {
    const entry = this.store.get(ticker);
    return entry ? { ...entry.quote } : undefined;
  }

  getEntry(ticker: string): CacheEntry | undefined {
    const entry = this.store.get(ticker);
    return entry ? { quote: { ...entry.quote }, cachedAt: entry.cachedAt } : undefined;
  }

  has(ticker: string): boolean {
    return this.store.has(ticker);
  }

  getAgeMs(ticker: string, now = Date.now()): number {
    const entry = this.store.get(ticker);
    if (!entry) return -1;
    return Math.max(0, now - entry.cachedAt);
  }

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

export const quoteCache = new QuoteCache();

export function getStaleThresholdMs(): number {
  return getStaleAfterMs();
}
