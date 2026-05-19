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
