"use client";

export interface UniverseTicker {
  symbol: string;
  displayName: string;
  yahooSymbol: string;
  category: "indian_index" | "us_index" | "crypto" | "commodity_etf" | "equity";
  exchange: string;
}

export const TICKER_UNIVERSE: UniverseTicker[] = [
  { symbol: "NIFTY", displayName: "NIFTY 50", yahooSymbol: "^NSEI", category: "indian_index", exchange: "NSE" },
  { symbol: "SENSEX", displayName: "SENSEX", yahooSymbol: "^BSESN", category: "indian_index", exchange: "BSE" },
  { symbol: "SPX", displayName: "S&P 500", yahooSymbol: "^GSPC", category: "us_index", exchange: "NYSE" },
  { symbol: "NDX", displayName: "NASDAQ 100", yahooSymbol: "^NDX", category: "us_index", exchange: "NASDAQ" },
  { symbol: "DJI", displayName: "Dow Jones", yahooSymbol: "^DJI", category: "us_index", exchange: "NYSE" },
  { symbol: "BTC", displayName: "Bitcoin", yahooSymbol: "BTC-USD", category: "crypto", exchange: "CRYPTO" },
  { symbol: "ETH", displayName: "Ethereum", yahooSymbol: "ETH-USD", category: "crypto", exchange: "CRYPTO" },
  { symbol: "SOL", displayName: "Solana", yahooSymbol: "SOL-USD", category: "crypto", exchange: "CRYPTO" },
  { symbol: "GLD", displayName: "Gold ETF", yahooSymbol: "GLD", category: "commodity_etf", exchange: "NYSE" },
  { symbol: "USO", displayName: "Oil Fund", yahooSymbol: "USO", category: "commodity_etf", exchange: "NYSE" },
  { symbol: "SLV", displayName: "Silver Trust", yahooSymbol: "SLV", category: "commodity_etf", exchange: "NYSE" },
];

export function resolveTicker(input: string): UniverseTicker | null {
  const needle = input.trim().toUpperCase();
  if (!needle) return null;
  return TICKER_UNIVERSE.find(
    (t) => t.symbol === needle || t.yahooSymbol.toUpperCase() === needle
  ) ?? null;
}

export function isPlausibleSymbol(input: string): boolean {
  const s = input.trim().toUpperCase();
  return s.length >= 1 && s.length <= 24 && /^[A-Z0-9.\-=^]+$/.test(s);
}

const SECTOR_PEERS: Record<string, string[]> = {
  AAPL: ["MSFT", "GOOGL", "AMZN", "NVDA"],
  MSFT: ["AAPL", "GOOGL", "AMZN", "NVDA"],
  GOOGL: ["AAPL", "MSFT", "AMZN", "META"],
  AMZN: ["AAPL", "MSFT", "GOOGL", "META"],
  NVDA: ["AMD", "AVGO", "MSFT", "TSM"],
  META: ["GOOGL", "AMZN", "SNAP", "PINS"],
  TSLA: ["RIVN", "LCID", "NIO", "F"],
  RELIANCE: ["TCS", "HDFCBANK", "INFY", "ITC"],
  "RELIANCE.NS": ["TCS.NS", "HDFCBANK.NS", "INFY.NS", "ITC.NS"],
  TCS: ["INFY", "WIPRO", "HCLTECH", "TECHM"],
  "TCS.NS": ["INFY.NS", "WIPRO.NS", "HCLTECH.NS", "TECHM.NS"],
  HDFCBANK: ["ICICIBANK", "SBIN", "KOTAKBANK", "AXISBANK"],
  "HDFCBANK.NS": ["ICICIBANK.NS", "SBIN.NS", "KOTAKBANK.NS", "AXISBANK.NS"],
  INFY: ["TCS", "WIPRO", "HCLTECH", "TECHM"],
  "INFY.NS": ["TCS.NS", "WIPRO.NS", "HCLTECH.NS", "TECHM.NS"],
};

export function relatedSymbols(displayOrYahoo: string, category?: string): string[] {
  const key = displayOrYahoo.trim().toUpperCase();
  if (SECTOR_PEERS[key]) return SECTOR_PEERS[key].slice(0, 4);
  const self = resolveTicker(key);
  const cat = category ?? self?.category;
  if (cat) {
    const peers = TICKER_UNIVERSE.filter((t) => t.category === cat && t.symbol !== self?.symbol)
      .map((t) => t.symbol);
    if (peers.length > 0) return peers.slice(0, 4);
  }
  return ["SPX", "NDX", "BTC", "NIFTY"].filter((s) => s !== self?.symbol).slice(0, 4);
}

export function peerToQuery(symbol: string): string {
  const entry = resolveTicker(symbol);
  return entry ? entry.yahooSymbol : symbol;
}
