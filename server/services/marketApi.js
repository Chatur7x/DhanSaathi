const YahooFinance = require('yahoo-finance2').default;
const yahooFinance = new YahooFinance();
const { getEnabledTickers, getTickerByYahooSymbol } = require('../tickers');

// Fetch real-time quotes for multiple symbols
exports.getQuotes = async (symbols) => {
  try {
    if (!symbols || symbols.length === 0) return [];
    
    // Try Yahoo Finance, fallback to mock data
    try {
      const results = await yahooFinance.quote(symbols);
      const quotes = Array.isArray(results) ? results : [results];
      return quotes.map(q => ({
        symbol: q.symbol,
        price: parseFloat((q.regularMarketPrice || 0).toFixed(2)),
        change: parseFloat((q.regularMarketChange || 0).toFixed(2)),
        changePercent: parseFloat((q.regularMarketChangePercent || 0).toFixed(2)),
        volume: q.regularMarketVolume || 0,
        high: parseFloat((q.regularMarketDayHigh || 0).toFixed(2)),
        low: parseFloat((q.regularMarketDayLow || 0).toFixed(2)),
        open: parseFloat((q.regularMarketOpen || 0).toFixed(2)),
        prevClose: parseFloat((q.regularMarketPreviousClose || 0).toFixed(2))
      }));
    } catch (yahooError) {
      console.log('Yahoo Finance failed, using mock data:', yahooError.message);
      return getMockQuotes(symbols);
    }
  } catch (error) {
    console.error('Quote error:', error.message);
    return [];
  }
};

// Mock quotes generator
const getMockQuotes = (symbols) => {
  const mockPrices = {
    '^NSEI': 22450.25,
    '^BSESN': 73800.75,
    '^NSEBANK': 48200.50,
    '^INDIAVIX': 12.50,
    'RELIANCE.NS': 2450.35,
    'TCS.NS': 4100.80,
    'HDFCBANK.NS': 1680.45,
    'INFY.NS': 1520.60,
    'ITC.NS': 445.75,
    'SBIN.NS': 585.90
  };
  
  return symbols.map(symbol => {
    const basePrice = mockPrices[symbol] || 1000;
    const variation = (Math.random() - 0.5) * 20;
    const price = parseFloat((basePrice + variation).toFixed(2));
    const change = parseFloat(variation.toFixed(2));
    const changePercent = parseFloat(((change / basePrice) * 100).toFixed(2));
    
    return { symbol, price, change, changePercent, volume: Math.floor(Math.random() * 1000000) };
  });
};

// Fetch historical data for charting
exports.getHistoricalData = async (symbol, period = '1M') => {
  try {
    // Try Yahoo Finance, fallback to mock data
    try {
      const periodMap = {
        '1D': { period1: new Date(Date.now() - 24*60*60*1000), interval: '5m' },
        '5D': { period1: new Date(Date.now() - 5*24*60*60*1000), interval: '15m' },
        '1M': { period1: new Date(Date.now() - 30*24*60*60*1000), interval: '1d' },
        '3M': { period1: new Date(Date.now() - 90*24*60*60*1000), interval: '1d' },
        '6M': { period1: new Date(Date.now() - 180*24*60*60*1000), interval: '1d' },
        '1Y': { period1: new Date(Date.now() - 365*24*60*60*1000), interval: '1wk' },
        '5Y': { period1: new Date(Date.now() - 5*365*24*60*60*1000), interval: '1wk' }
      };
      const config = periodMap[period] || periodMap['1M'];
      const data = await yahooFinance.chart(symbol, {
        period1: config.period1,
        interval: config.interval
      });
      
      if (data.quotes && data.quotes.length > 0) {
        return data.quotes
          .filter(q => q.open && q.close)
          .map(q => ({
            time: Math.floor(new Date(q.date).getTime() / 1000),
            open: parseFloat((q.open || 0).toFixed(2)),
            high: parseFloat((q.high || 0).toFixed(2)),
            low: parseFloat((q.low || 0).toFixed(2)),
            close: parseFloat((q.close || 0).toFixed(2)),
            volume: q.volume || 0
          }));
      }
    } catch (yahooError) {
      console.log('Yahoo Finance historical failed, using mock data:', yahooError.message);
    }
    
    // Generate mock historical data
    return generateMockHistoricalData(symbol, period);
  } catch (error) {
    console.error('Historical error:', error.message);
    return generateMockHistoricalData(symbol, period);
  }
};

// Mock historical data generator
const generateMockHistoricalData = (symbol, period) => {
  const data = [];
  const now = Math.floor(Date.now() / 1000);
  let price = symbol.includes('NSEI') ? 22450.25 : symbol.includes('RELIANCE') ? 2450.35 : 1000;
  const periods = { '1D': 78, '5D': 26, '1M': 30, '3M': 90, '6M': 180, '1Y': 365 };
  const count = periods[period] || 30;
  
  for (let i = count; i >= 0; i--) {
    const time = now - i * 24 * 60 * 60;
    const change = (Math.random() - 0.48) * (price * 0.02);
    const open = parseFloat(price.toFixed(2));
    const close = parseFloat((price + change).toFixed(2));
    const high = parseFloat((Math.max(open, close) + Math.random() * 10).toFixed(2));
    const low = parseFloat((Math.min(open, close) - Math.random() * 10).toFixed(2));
    
    data.push({ time, open, high, low, close, volume: Math.floor(Math.random() * 1000000) });
    price = close;
  }
  return data;
};

// Fetch option chain data
exports.getOptionChain = async (symbol) => {
  try {
    const options = await yahooFinance.options(symbol);
    const chain = options.options?.[0] || {};
    return {
      underlying: symbol,
      expiryDates: chain.expirationDates || [],
      strikes: chain.strikes || [],
      calls: (chain.calls || []).map(c => ({
        strike: c.strike,
        lastPrice: c.lastPrice,
        bid: c.bid,
        ask: c.ask,
        volume: c.volume,
        openInterest: c.openInterest,
        impliedVolatility: c.impliedVolatility
      })),
      puts: (chain.puts || []).map(p => ({
        strike: p.strike,
        lastPrice: p.lastPrice,
        bid: p.bid,
        ask: p.ask,
        volume: p.volume,
        openInterest: p.openInterest,
        impliedVolatility: p.impliedVolatility
      }))
    };
  } catch (error) {
    console.error('Option chain error:', error.message);
    return { underlying: symbol, expiryDates: [], strikes: [], calls: [], puts: [] };
  }
};

// Fetch quotes for all enabled tickers in the universe
exports.fetchAllTickerQuotes = async () => {
  const tickers = getEnabledTickers();
  const yahooSymbols = tickers.map(t => t.yahooSymbol);

  try {
    const results = await yahooFinance.quote(yahooSymbols);
    const quotes = Array.isArray(results) ? results : [results];

    return quotes.map(q => {
      const config = getTickerByYahooSymbol(q.symbol) || {};
      return {
        ticker: config.symbol || q.symbol,
        symbol: q.symbol,
        displayName: config.displayName || q.shortName || q.symbol,
        category: config.category || 'unknown',
        exchange: config.exchange || q.exchange || '',
        price: parseFloat((q.regularMarketPrice || 0).toFixed(2)),
        change: parseFloat((q.regularMarketChange || 0).toFixed(2)),
        changePercent: parseFloat((q.regularMarketChangePercent || 0).toFixed(2)),
        volume: q.regularMarketVolume || 0,
        high: parseFloat((q.regularMarketDayHigh || 0).toFixed(2)),
        low: parseFloat((q.regularMarketDayLow || 0).toFixed(2)),
        open: parseFloat((q.regularMarketOpen || 0).toFixed(2)),
        prevClose: parseFloat((q.regularMarketPreviousClose || 0).toFixed(2)),
        timestamp: new Date().toISOString(),
      };
    });
  } catch (error) {
    console.error('Ticker universe fetch error:', error.message);
    return [];
  }
};
