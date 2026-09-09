const TICKER_UNIVERSE = [
  // Indian Markets
  { symbol: "NIFTY", displayName: "NIFTY 50", yahooSymbol: "^NSEI", category: "indian_index", exchange: "NSE", refreshIntervalMs: 15000, enabled: true },
  { symbol: "SENSEX", displayName: "SENSEX", yahooSymbol: "^BSESN", category: "indian_index", exchange: "BSE", refreshIntervalMs: 15000, enabled: true },

  // US Markets
  { symbol: "SPX", displayName: "S&P 500", yahooSymbol: "^GSPC", category: "us_index", exchange: "NYSE", refreshIntervalMs: 15000, enabled: true },
  { symbol: "NDX", displayName: "NASDAQ 100", yahooSymbol: "^NDX", category: "us_index", exchange: "NASDAQ", refreshIntervalMs: 15000, enabled: true },
  { symbol: "DJI", displayName: "Dow Jones", yahooSymbol: "^DJI", category: "us_index", exchange: "NYSE", refreshIntervalMs: 15000, enabled: true },

  // Crypto
  { symbol: "BTC", displayName: "Bitcoin", yahooSymbol: "BTC-USD", category: "crypto", exchange: "CRYPTO", refreshIntervalMs: 10000, enabled: true },
  { symbol: "ETH", displayName: "Ethereum", yahooSymbol: "ETH-USD", category: "crypto", exchange: "CRYPTO", refreshIntervalMs: 10000, enabled: true },
  { symbol: "SOL", displayName: "Solana", yahooSymbol: "SOL-USD", category: "crypto", exchange: "CRYPTO", refreshIntervalMs: 10000, enabled: true },

  // Commodities/ETFs
  { symbol: "GLD", displayName: "SPDR Gold Shares", yahooSymbol: "GLD", category: "commodity_etf", exchange: "NYSE", refreshIntervalMs: 30000, enabled: true },
  { symbol: "USO", displayName: "United States Oil Fund", yahooSymbol: "USO", category: "commodity_etf", exchange: "NYSE", refreshIntervalMs: 30000, enabled: true },
  { symbol: "SLV", displayName: "iShares Silver Trust", yahooSymbol: "SLV", category: "commodity_etf", exchange: "NYSE", refreshIntervalMs: 30000, enabled: true },
];

function getEnabledTickers() {
  return TICKER_UNIVERSE.filter(t => t.enabled);
}

function getYahooSymbols() {
  return getEnabledTickers().map(t => t.yahooSymbol);
}

function getTickerByYahooSymbol(yahooSymbol) {
  return TICKER_UNIVERSE.find(t => t.yahooSymbol === yahooSymbol);
}

module.exports = { TICKER_UNIVERSE, getEnabledTickers, getYahooSymbols, getTickerByYahooSymbol };