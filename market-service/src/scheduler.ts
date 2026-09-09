import type { TickerConfig } from "./tickers.js";
import {
  fetchQuote,
  type MarketQuote,
  type QuoteResult,
} from "./feeds/yahoo.js";

export interface SchedulerOptions {
  /** Called after each ticker fetch (success or stale-cache fallback). */
  onQuote?: (quote: MarketQuote, result: QuoteResult) => void;
  /** Called when a ticker fails with no cache to fall back to. */
  onError?: (ticker: TickerConfig, error: string) => void;
  /** Called after each full sweep decision (for status emission). */
  onCycle?: (info: {
    successful: number;
    failed: number;
    total: number;
    timestamp: string;
  }) => void;
}

interface Job {
  ticker: TickerConfig;
  timer: NodeJS.Timeout;
  running: boolean;
}

/**
 * Per-ticker in-memory scheduler.
 *
 * - Each ticker gets its own setInterval driven by `refreshIntervalMs`
 *   from tickers.ts (never hard-coded here).
 * - `running` flag prevents overlapping fetches for the same ticker.
 * - Groups are naturally staggered because 15s / 30s / 60s intervals
 *   don't all fire together, keeping Yahoo request rate respectful.
 */
export class TickerScheduler {
  private jobs = new Map<string, Job>();
  private stopped = false;

  constructor(
    private tickers: TickerConfig[],
    private options: SchedulerOptions = {}
  ) {}

  /** Interval (ms) configured for a ticker symbol. */
  getIntervalMs(symbol: string): number | undefined {
    return this.jobs.get(symbol)?.ticker.refreshIntervalMs;
  }

  /** All configured intervals — handy for tests / status endpoints. */
  getSchedule(): { symbol: string; refreshIntervalMs: number; running: boolean }[] {
    return [...this.jobs.values()].map((job) => ({
      symbol: job.ticker.symbol,
      refreshIntervalMs: job.ticker.refreshIntervalMs,
      running: job.running,
    }));
  }

  start(): void {
    this.stopped = false;
    for (const ticker of this.tickers) {
      if (!ticker.enabled) continue;
      if (this.jobs.has(ticker.symbol)) continue;

      const job: Job = { ticker, timer: null as unknown as NodeJS.Timeout, running: false };

      const tick = () => {
        void this.runOnce(job);
      };

      job.timer = setInterval(tick, ticker.refreshIntervalMs);
      // Don't keep the process alive on scheduler timers alone.
      if (typeof job.timer.unref === "function") job.timer.unref();
      this.jobs.set(ticker.symbol, job);

      // Immediate first fetch so clients don't wait a full interval.
      // Stagger slightly to avoid a thundering herd on boot.
      const staggerMs = Math.floor(Math.random() * 1500);
      setTimeout(() => {
        if (!this.stopped) void this.runOnce(job);
      }, staggerMs);
    }
  }

  /** Fetch one ticker now (respects the no-overlap guard). */
  async runOnce(jobOrSymbol: Job | string): Promise<QuoteResult | null> {
    const job =
      typeof jobOrSymbol === "string" ? this.jobs.get(jobOrSymbol) : jobOrSymbol;
    if (!job || this.stopped) return null;

    if (job.running) {
      console.log(`[Scheduler] ${job.ticker.symbol} fetch still running, skipping overlap`);
      return null;
    }

    job.running = true;
    try {
      const result = await fetchQuote(job.ticker.yahooSymbol);

      if (result.success && result.data) {
        this.options.onQuote?.(result.data, result);
      } else {
        this.options.onError?.(job.ticker, result.error || "Unknown error");
      }

      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      this.options.onError?.(job.ticker, message);
      return null;
    } finally {
      job.running = false;
    }
  }

  /** Fetch a single ticker by display symbol, outside the interval loop. */
  fetchNow(symbol: string): Promise<QuoteResult | null> {
    return this.runOnce(symbol);
  }

  stop(): void {
    this.stopped = true;
    for (const job of this.jobs.values()) {
      clearInterval(job.timer);
    }
    this.jobs.clear();
  }

  get size(): number {
    return this.jobs.size;
  }
}
