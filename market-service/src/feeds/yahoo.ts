import YahooFinance from "yahoo-finance2";
import { getTickerByYahooSymbol } from "../tickers.js";
import { quoteCache } from "../cache.js";
import { withRetry, getRetryConfig } from "../retry.js";

const yahooFinance = new YahooFinance({ suppressNotices: ["yahooSurvey"] });

export type QuoteSource = "yahoo" | "cache";

export interface MarketQuote {
  ticker: string;
  symbol: string;
  displayName?: string;
  category?: string;
  exchange?: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  high: number;
  low: number;
  open: number;
  prevClose: number;
  timestamp: string;
  /** "yahoo" = fresh, "cache" = last-known-price fallback */
  source: QuoteSource;
  /** true when served from cache after Yahoo failure */
  stale: boolean;
  /** ms since the price was cached (0 for fresh quotes) */
  ageMs: number;
}

export interface QuoteResult {
  success: boolean;
  data?: MarketQuote;
  error?: string;
  yahooSymbol: string;
}

export interface BatchQuoteResult {
  results: QuoteResult[];
  timestamp: string;
}

/** In-flight dedupe: same yahooSymbol never triggers 2 concurrent Yahoo calls. */
const inFlight = new Map<string, Promise<MarketQuote>>();

function buildFreshQuote(yahooSymbol: string, quote: any): MarketQuote {
  const tickerConfig = getTickerByYahooSymbol(yahooSymbol);
  return {
    ticker: tickerConfig?.symbol || yahooSymbol,
    symbol: yahooSymbol,
    displayName: tickerConfig?.displayName,
    category: tickerConfig?.category,
    exchange: tickerConfig?.exchange,
    price: Number(quote.regularMarketPrice.toFixed(2)),
    change: Number((quote.regularMarketChange || 0).toFixed(2)),
    changePercent: Number((quote.regularMarketChangePercent || 0).toFixed(2)),
    volume: quote.regularMarketVolume || 0,
    high: Number((quote.regularMarketDayHigh || 0).toFixed(2)),
    low: Number((quote.regularMarketDayLow || 0).toFixed(2)),
    open: Number((quote.regularMarketOpen || 0).toFixed(2)),
    prevClose: Number((quote.regularMarketPreviousClose || 0).toFixed(2)),
    timestamp: new Date().toISOString(),
    source: "yahoo",
    stale: false,
    ageMs: 0,
  };
}

async function fetchFromYahooOrThrow(yahooSymbol: string): Promise<MarketQuote> {
  const quote = await yahooFinance.quote(yahooSymbol);

  if (
    !quote ||
    quote.regularMarketPrice === undefined ||
    quote.regularMarketPrice === null
  ) {
    throw new Error(`No price data returned for ${yahooSymbol}`);
  }

  return buildFreshQuote(yahooSymbol, quote);
}

function fetchFromYahooDeduped(yahooSymbol: string): Promise<MarketQuote> {
  const existing = inFlight.get(yahooSymbol);
  if (existing) return existing;

  const promise = fetchFromYahooOrThrow(yahooSymbol).finally(() => {
    if (inFlight.get(yahooSymbol) === promise) {
      inFlight.delete(yahooSymbol);
    }
  });

  inFlight.set(yahooSymbol, promise);
  return promise;
}

async function fetchSingleQuoteWithRetry(yahooSymbol: string): Promise<MarketQuote> {
  const config = getRetryConfig();
  return withRetry(
    () => fetchFromYahooDeduped(yahooSymbol),
    config,
    (attempt, error, delayMs) => {
      const message = error instanceof Error ? error.message : "Unknown error";
      console.warn(
        `[YahooFeed] ${yahooSymbol} attempt ${attempt + 1}/${config.maxRetries + 1} failed: ${message}. Retrying in ${delayMs}ms`
      );
    }
  );
}

async function fetchSingleQuote(yahooSymbol: string): Promise<QuoteResult> {
  try {
    const fresh = await fetchSingleQuoteWithRetry(yahooSymbol);
    // SUCCESS → update last-known-price cache, return fresh quote
    quoteCache.set(fresh.ticker, fresh);
    return { success: true, data: fresh, yahooSymbol };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";

    // FAILURE → fall back to last-known-price cache when available
    const tickerConfig = getTickerByYahooSymbol(yahooSymbol);
    const cacheKey = tickerConfig?.symbol || yahooSymbol;
    const staleQuote = quoteCache.getStaleQuote(cacheKey);

    if (staleQuote) {
      console.warn(
        `[YahooFeed] ${yahooSymbol} all retries failed, serving cached price (age ${staleQuote.ageMs}ms)`
      );
      return { success: true, data: staleQuote, yahooSymbol };
    }

    // No cache → proper error. Never invent a price.
    return {
      success: false,
      error: `Yahoo Finance error for ${yahooSymbol}: ${message}`,
      yahooSymbol,
    };
  }
}

export async function fetchQuotes(
  yahooSymbols: string[]
): Promise<BatchQuoteResult> {
  if (!yahooSymbols || yahooSymbols.length === 0) {
    return {
      results: [],
      timestamp: new Date().toISOString(),
    };
  }

  // Rate-limit awareness: dedupe identical symbols before fanning out.
  const uniqueSymbols = [...new Set(yahooSymbols)];

  const results = await Promise.all(
    uniqueSymbols.map((symbol) => fetchSingleQuote(symbol))
  );

  return {
    results,
    timestamp: new Date().toISOString(),
  };
}

export async function fetchQuote(yahooSymbol: string): Promise<QuoteResult> {
  return fetchSingleQuote(yahooSymbol);
}

export function filterSuccessfulQuotes(batchResult: BatchQuoteResult): MarketQuote[] {
  return batchResult.results
    .filter((r) => r.success && r.data)
    .map((r) => r.data!);
}

export function getFailedQuotes(batchResult: BatchQuoteResult): QuoteResult[] {
  return batchResult.results.filter((r) => !r.success);
}
