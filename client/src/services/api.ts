import { io } from 'socket.io-client';

export const socket = io('http://localhost:5000'); // Connect to Node.js backend

export interface MarketData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  chart?: { time: number; open: number; high: number; low: number; close: number }[];
}

// Fetch market chart data from our server API
export const fetchMarketChart = async (symbol: string = '^NSEI'): Promise<MarketData | null> => {
  try {
    const res = await fetch(`/api/market/historical?symbol=${symbol}&period=1M`);
    if (!res.ok) throw new Error('Failed to fetch historical data');
    
    const data = await res.json();
    if (!data || data.length === 0) return null;

    const lastCandle = data[data.length - 1];
    const firstCandle = data[0];
    const price = lastCandle.close;
    const change = price - firstCandle.close;
    const changePercent = ((change / firstCandle.close) * 100);

    return {
      symbol,
      name: symbol.replace('^', '').replace('.NS', ''),
      price: parseFloat(price.toFixed(2)),
      change: parseFloat(change.toFixed(2)),
      changePercent: parseFloat(changePercent.toFixed(2)),
      chart: data
    };
  } catch (error) {
    console.error("Failed to fetch market chart:", error);
    return null;
  }
};

// Fetch quotes from our server API
export const fetchQuotes = async (symbols: string[]): Promise<MarketData[]> => {
  try {
    const res = await fetch(`/api/market/quotes?symbols=${symbols.join(',')}`);
    if (!res.ok) throw new Error('Failed to fetch quotes');
    const data = await res.json();
    return data.map((item: any) => ({
      ...item,
      price: parseFloat((item.price || 0).toFixed(2)),
      change: parseFloat((item.change || 0).toFixed(2)),
      changePercent: parseFloat((item.changePercent || 0).toFixed(2))
    }));
  } catch (error) {
    console.error("Failed to fetch quotes:", error);
    return [];
  }
};

export const fetchLiveNews = async () => {
  try {
    const rssUrl = encodeURIComponent('https://economictimes.indiatimes.com/markets/rssfeeds/2146842.cms');
    const res = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${rssUrl}`);
    if (!res.ok) throw new Error('RSS fetch failed');
    
    const data = await res.json();
    return data.items.slice(0, 5).map((item: any) => ({
      id: item.guid || Math.random().toString(),
      headline: item.title,
      summary: item.description.replace(/<[^>]*>/gm, '').substring(0, 100) + '...',
      source: 'Economic Times',
      time: new Date(item.pubDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      link: item.link,
      impact: Math.random() > 0.5 ? 'positive' : 'negative'
    }));
  } catch (error) {
    console.error("Failed to fetch live news:", error);
    return [];
  }
};

// Real LocalStorage Portfolio logic
export const getRealPortfolio = () => {
  const stored = localStorage.getItem('dhansaathi_portfolio');
  if (stored) return JSON.parse(stored);
  return { invested: 0, returns: 0, xirr: 0, balance: 0 };
};
