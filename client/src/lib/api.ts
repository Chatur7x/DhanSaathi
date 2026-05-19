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

export const getCrypto = async (symbols: string = 'BTC,ETH,SOL,XRP') => {
  const res = await axios.get(`${API_URL}/api/market/crypto`, { params: { symbols } });
  return res.data;
};

export const getForex = async (symbols: string = 'INR,EUR,GBP,JPY') => {
  const res = await axios.get(`${API_URL}/api/market/forex`, { params: { symbols } });
  return res.data;
};
