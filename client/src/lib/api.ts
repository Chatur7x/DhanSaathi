import axios from "axios";
import { API_URL } from "./api-config";

export const getPortfolioSummary = async () => {
  const res = await axios.get(`${API_URL}/api/portfolio/summary`);
  return res.data;
};

export const getMarketIndices = async () => {
  const res = await axios.get(`${API_URL}/api/market/indices`);
  return res.data;
};

export const getTopMovers = async () => {
  const res = await axios.get(`${API_URL}/api/market/movers`);
  return res.data;
};

export const getHistoricalData = async (symbol: string, period: string = '1M') => {
  const res = await axios.get(`${API_URL}/api/market/historical`, { params: { symbol, period } });
  return res.data;
};

export const getOptionChain = async (symbol: string) => {
  const res = await axios.get(`${API_URL}/api/market/option-chain`, { params: { symbol } });
  return res.data;
};

export const getQuotes = async (symbols: string[]) => {
  const res = await axios.get(`${API_URL}/api/market/quotes`, { params: { symbols: symbols.join(',') } });
  return res.data;
};

export interface SimpleQuote {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  high: number;
  low: number;
  open: number;
  prevClose: number;
}

export const getQuote = async (symbol: string): Promise<SimpleQuote | null> => {
  const rows = await getQuotes([symbol]);
  if (!Array.isArray(rows) || rows.length === 0) return null;
  return rows[0] as SimpleQuote;
};

export const getCrypto = async (symbols: string = 'BTC,ETH,SOL,XRP') => {
  const res = await axios.get(`${API_URL}/api/market/crypto`, { params: { symbols } });
  return res.data;
};

export const getForex = async (symbols: string = 'INR,EUR,GBP,JPY') => {
  const res = await axios.get(`${API_URL}/api/market/forex`, { params: { symbols } });
  return res.data;
};

export interface HistoryCandle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface HistoryResponse {
  ticker: string;
  range: string;
  count: number;
  data: HistoryCandle[];
}

export const HISTORY_RANGES = ['1D', '1W', '1M', '3M', '1Y'] as const;
export type HistoryRange = typeof HISTORY_RANGES[number];

export const getHistory = async (ticker: string, range: HistoryRange = '1M'): Promise<HistoryResponse> => {
  const res = await axios.get(`${API_URL}/api/market/history/${encodeURIComponent(ticker)}`, { params: { range } });
  return res.data;
};

export interface Fundamentals {
  ticker: string;
  name: string;
  exchange: string | null;
  currency: string | null;
  marketCap: number | null;
  trailingPE: number | null;
  forwardPE: number | null;
  trailingEps: number | null;
  forwardEps: number | null;
  dividendYield: number | null;
  dividendRate: number | null;
  beta: number | null;
  fiftyTwoWeekHigh: number | null;
  fiftyTwoWeekLow: number | null;
  timestamp: string;
}

export const getFundamentals = async (ticker: string): Promise<Fundamentals> => {
  const res = await axios.get(`${API_URL}/api/market/fundamentals/${encodeURIComponent(ticker)}`);
  return res.data;
};

export const getNews = async () => {
  const res = await axios.get(`${API_URL}/api/ai/news`);
  return res.data;
};

export interface TickerSearchResult {
  symbol: string;
  yahooSymbol: string;
  name: string;
  exchange: string | null;
  category: string | null;
  inUniverse: boolean;
}

export const searchTickers = async (query: string): Promise<TickerSearchResult[]> => {
  const res = await axios.get(`${API_URL}/api/market/search`, { params: { q: query } });
  return res.data;
};
