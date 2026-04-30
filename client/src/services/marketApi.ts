import { UTCTimestamp } from 'lightweight-charts';
import { fetchMarketChart } from '../services/api';

export interface Quote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume?: number;
}

export interface Candle {
  time: UTCTimestamp;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

// Fetch real-time quotes
export const getQuotes = async (symbols: string[]): Promise<Quote[]> => {
  try {
    const res = await fetch(`/api/market/quotes?symbols=${symbols.join(',')}`);
    if (res.ok) return res.json();
    return [];
  } catch {
    return [];
  }
};

// Fetch historical data for chart
export const getHistoricalData = async (
  symbol: string, 
  timeframe: string = '1M'
): Promise<Candle[]> => {
  try {
    // Use our server API
    const res = await fetch(`/api/market/historical?symbol=${symbol}&period=${timeframe}`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return data.map((c: any) => ({
          time: c.time as UTCTimestamp,
          open: parseFloat(c.open.toFixed(2)),
          high: parseFloat(c.high.toFixed(2)),
          low: parseFloat(c.low.toFixed(2)),
          close: parseFloat(c.close.toFixed(2)),
          volume: c.volume
        }));
      }
    }
    
    // Fallback: generate mock data
    return generateMockCandles(symbol, timeframe);
  } catch {
    return generateMockCandles(symbol, timeframe);
  }
};

// Generate mock candles for demo
const generateMockCandles = (symbol: string, timeframe: string): Candle[] => {
  const candles: Candle[] = [];
  const now = new Date();
  let basePrice = 22000;
  
  if (symbol.includes('RELIANCE')) basePrice = 2450;
  else if (symbol.includes('TCS')) basePrice = 4100;
  else if (symbol.includes('HDFC')) basePrice = 1680;
  
  const days = timeframe === '1D' ? 1 : timeframe === '1W' ? 7 : timeframe === '1M' ? 30 : 365;
  const points = timeframe === '1D' ? 390 : days; // 390 minutes in a trading day
  
  for (let i = points; i >= 0; i--) {
    const time = new Date(now);
    if (timeframe === '1D') {
      time.setMinutes(time.getMinutes() - i);
    } else {
      time.setDate(time.getDate() - i);
    }
    
    const change = (Math.random() - 0.48) * (basePrice * 0.02);
    const open = basePrice + change;
    const close = open + (Math.random() - 0.48) * (basePrice * 0.015);
    const high = Math.max(open, close) + Math.random() * (basePrice * 0.01);
    const low = Math.min(open, close) - Math.random() * (basePrice * 0.01);
    
    candles.push({
      time: Math.floor(time.getTime() / 1000) as UTCTimestamp,
      open: Math.max(0, open),
      high: Math.max(0, high),
      low: Math.max(0, low),
      close: Math.max(0, close),
      volume: Math.floor(Math.random() * 1000000),
    });
    
    basePrice = close;
  }
  
  return candles;
};

// Top movers calculation
export const getTopMovers = (quotes: Quote[], type: 'gainers' | 'losers' | 'volume') => {
  if (type === 'volume') {
    return [...quotes].sort((a, b) => (b.volume || 0) - (a.volume || 0)).slice(0, 10);
  }
  return [...quotes]
    .sort((a, b) => b.changePercent - a.changePercent)
    .slice(0, type === 'gainers' ? 10 : undefined)
    .filter((_, i) => type === 'gainers' ? i < 10 : i >= quotes.length - 10);
};

// Market depth (Level 2) - simulated
export interface MarketDepth {
  bids: { price: number; quantity: number }[];
  asks: { price: number; quantity: number }[];
  lastPrice: number;
}

export const getMarketDepth = (symbol: string, lastPrice: number): MarketDepth => {
  const bids = [];
  const asks = [];
  
  for (let i = 5; i >= 1; i--) {
    bids.push({
      price: lastPrice - (i * 0.05),
      quantity: Math.floor(Math.random() * 1000) + 100,
    });
    asks.push({
      price: lastPrice + (i * 0.05),
      quantity: Math.floor(Math.random() * 1000) + 100,
    });
  }
  
  return { bids, asks, lastPrice };
};
