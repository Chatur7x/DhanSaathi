import { io } from 'socket.io-client';

export const socket = io('http://localhost:5000'); // Connect to Node.js backend

export interface MarketData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  chart?: { value: number }[];
}

export const fetchMarketChart = async (symbol: string = '^NSEI'): Promise<MarketData | null> => {
  try {
    const res = await fetch(`/api/finance/v8/finance/chart/${symbol}?range=1mo&interval=1d`);
    if (!res.ok) throw new Error('Network response was not ok');
    
    const data = await res.json();
    const result = data.chart?.result?.[0];
    if (!result) return null;

    const meta = result.meta;
    const price = meta.regularMarketPrice;
    const previousClose = meta.chartPreviousClose;
    const change = price - previousClose;
    const changePercent = (change / previousClose) * 100;

    const quotes = result.indicators?.quote?.[0]?.close || [];
    const chart = quotes
      .filter((v: number | null) => v !== null)
      .map((val: number) => ({ value: Math.round(val) }));

    return {
      symbol: meta.symbol,
      name: meta.symbol === '^NSEI' ? 'NIFTY 50' : meta.symbol,
      price: Math.round(price),
      change: Math.round(change),
      changePercent: Number(changePercent.toFixed(2)),
      chart
    };
  } catch (error) {
    console.error("Failed to fetch real market chart:", error);
    return null;
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
      summary: item.description.replace(/<[^>]*>?/gm, '').substring(0, 100) + '...',
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
