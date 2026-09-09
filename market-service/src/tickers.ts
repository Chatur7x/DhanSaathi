export type MarketCategory =
  | "indian_index"
  | "us_index"
  | "crypto"
  | "commodity_etf";

export interface TickerConfig {
  symbol: string;
  displayName: string;
  yahooSymbol: string;
  category: MarketCategory;
  exchange: string;
  refreshIntervalMs: number;
  enabled: boolean;
}

export const TICKER_UNIVERSE: TickerConfig[] = [
  // Indian Markets
  {
    symbol: "NIFTY",
    displayName: "NIFTY 50",
    yahooSymbol: "^NSEI",
    category: "indian_index",
    exchange: "NSE",
    refreshIntervalMs: 15000,
    enabled: true,
  },
  {
    symbol: "SENSEX",
    displayName: "SENSEX",
    yahooSymbol: "^BSESN",
    category: "indian_index",
    exchange: "BSE",
    refreshIntervalMs: 15000,
    enabled: true,
  },

  // US Markets — 30s per Day-2 spec
  {
    symbol: "SPX",
    displayName: "S&P 500",
    yahooSymbol: "^GSPC",
    category: "us_index",
    exchange: "NYSE",
    refreshIntervalMs: 30000,
    enabled: true,
  },
  {
    symbol: "NDX",
    displayName: "NASDAQ 100",
    yahooSymbol: "^NDX",
    category: "us_index",
    exchange: "NASDAQ",
    refreshIntervalMs: 30000,
    enabled: true,
  },
  {
    symbol: "DJI",
    displayName: "Dow Jones Industrial Average",
    yahooSymbol: "^DJI",
    category: "us_index",
    exchange: "NYSE",
    refreshIntervalMs: 30000,
    enabled: true,
  },

  // Crypto — 30s per Day-2 spec
  {
    symbol: "BTC",
    displayName: "Bitcoin",
    yahooSymbol: "BTC-USD",
    category: "crypto",
    exchange: "CRYPTO",
    refreshIntervalMs: 30000,
    enabled: true,
  },
  {
    symbol: "ETH",
    displayName: "Ethereum",
    yahooSymbol: "ETH-USD",
    category: "crypto",
    exchange: "CRYPTO",
    refreshIntervalMs: 30000,
    enabled: true,
  },
  {
    symbol: "SOL",
    displayName: "Solana",
    yahooSymbol: "SOL-USD",
    category: "crypto",
    exchange: "CRYPTO",
    refreshIntervalMs: 30000,
    enabled: true,
  },

  // Commodities/ETFs — 60s per Day-2 spec
  {
    symbol: "GLD",
    displayName: "SPDR Gold Shares",
    yahooSymbol: "GLD",
    category: "commodity_etf",
    exchange: "NYSE",
    refreshIntervalMs: 60000,
    enabled: true,
  },
  {
    symbol: "USO",
    displayName: "United States Oil Fund",
    yahooSymbol: "USO",
    category: "commodity_etf",
    exchange: "NYSE",
    refreshIntervalMs: 60000,
    enabled: true,
  },
  {
    symbol: "SLV",
    displayName: "iShares Silver Trust",
    yahooSymbol: "SLV",
    category: "commodity_etf",
    exchange: "NYSE",
    refreshIntervalMs: 60000,
    enabled: true,
  },
];

export function getEnabledTickers(): TickerConfig[] {
  return TICKER_UNIVERSE.filter((t) => t.enabled);
}

export function getYahooSymbols(): string[] {
  return getEnabledTickers().map((t) => t.yahooSymbol);
}

export function getTickersByCategory(category: MarketCategory): TickerConfig[] {
  return getEnabledTickers().filter((t) => t.category === category);
}

export function getTickerBySymbol(symbol: string): TickerConfig | undefined {
  return TICKER_UNIVERSE.find((t) => t.symbol === symbol);
}

export function getTickerByYahooSymbol(yahooSymbol: string): TickerConfig | undefined {
  return TICKER_UNIVERSE.find((t) => t.yahooSymbol === yahooSymbol);
}