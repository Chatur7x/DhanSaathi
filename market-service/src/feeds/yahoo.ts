import YahooFinance from "yahoo-finance2";
import { getTickerByYahooSymbol } from "../tickers";

const yahooFinance = new YahooFinance({ suppressNotices: ["yahooSurvey"] });

export interface MarketQuote {
  ticker: string;
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  high: number;
  low: number;
  open: number;
  prevClose: number;
  timestamp: string;
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

async function fetchSingleQuote(yahooSymbol: string): Promise<QuoteResult> {
  try {
    const quote = await yahooFinance.quote(yahooSymbol);

    if (!quote || quote.regularMarketPrice === undefined || quote.regularMarketPrice === null) {
      return {
        success: false,
        error: `No price data returned for ${yahooSymbol}`,
        yahooSymbol,
      };
    }

    const tickerConfig = getTickerByYahooSymbol(yahooSymbol);

    const marketQuote: MarketQuote = {
      ticker: tickerConfig?.symbol || yahooSymbol,
      symbol: yahooSymbol,
      price: Number(quote.regularMarketPrice.toFixed(2)),
      change: Number((quote.regularMarketChange || 0).toFixed(2)),
      changePercent: Number((quote.regularMarketChangePercent || 0).toFixed(2)),
      volume: quote.regularMarketVolume || 0,
      high: Number((quote.regularMarketDayHigh || 0).toFixed(2)),
      low: Number((quote.regularMarketDayLow || 0).toFixed(2)),
      open: Number((quote.regularMarketOpen || 0).toFixed(2)),
      prevClose: Number((quote.regularMarketPreviousClose || 0).toFixed(2)),
      timestamp: new Date().toISOString(),
    };

    return {
      success: true,
      data: marketQuote,
      yahooSymbol,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return {
      success: false,
      error: `Yahoo Finance error for ${yahooSymbol}: ${message}`,
      yahooSymbol,
    };
  }
}

export async function fetchQuotes(yahooSymbols: string[]): Promise<BatchQuoteResult> {
  if (!yahooSymbols || yahooSymbols.length === 0) {
    return {
      results: [],
      timestamp: new Date().toISOString(),
    };
  }

  const results = await Promise.all(
    yahooSymbols.map((symbol) => fetchSingleQuote(symbol))
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