import { create } from 'zustand';

interface MarketState {
  indices: any[];
  sectors: any[];
  stocks: any[];
  etfs: any[];
  mutualFunds: any[];
  isConnected: boolean;
  watchlist: string[];
  allQuotes: any[];
  
  setMarketData: (data: any[]) => void;
  setConnected: (status: boolean) => void;
  setWatchlist: (symbols: string[]) => void;
  updateWatchlistPrices: (quotes: any[]) => void;
}

export const useMarketStore = create<MarketState>((set) => ({
  indices: [],
  sectors: [],
  stocks: [],
  etfs: [],
  mutualFunds: [],
  isConnected: false,
  watchlist: ['RELIANCE.NS', 'TCS.NS', 'HDFCBANK.NS', 'INFY.NS', 'ITC.NS', 'SBIN.NS'],
  allQuotes: [],

  setMarketData: (data) => {
    const INDICES = ['^NSEI', '^BSESN', '^NSEBANK', '^INDIAVIX'];
    const SECTORS = ['^CNXAUTO', '^CNXFMCG', '^CNXMETAL', '^CNXPHARMA', '^CNXIT'];
    const TOP_STOCKS = ['RELIANCE.NS', 'TCS.NS', 'HDFCBANK.NS', 'INFY.NS', 'ITC.NS', 'SBIN.NS'];
    const ETFS = ['NIFTYBEES.NS', 'GOLDBEES.NS', 'BANKBEES.NS', 'LIQUIDBEES.NS'];
    const MUTUAL_FUNDS = ['0P00005WLZ.BO', '0P00005V1W.BO'];

    set({
      indices: data.filter((item: any) => INDICES.includes(item.symbol)),
      sectors: data.filter((item: any) => SECTORS.includes(item.symbol)),
      stocks: data.filter((item: any) => TOP_STOCKS.includes(item.symbol)),
      etfs: data.filter((item: any) => ETFS.includes(item.symbol)),
      mutualFunds: data.filter((item: any) => MUTUAL_FUNDS.includes(item.symbol)),
      allQuotes: data
    });
  },

  setConnected: (status) => set({ isConnected: status }),

  setWatchlist: (symbols) => {
    set({ watchlist: symbols });
    localStorage.setItem('dhansaathi_watchlist', JSON.stringify(symbols));
  },

  updateWatchlistPrices: (quotes) => {
    set((state) => ({
      watchlist: state.watchlist,
      allQuotes: [...state.allQuotes, ...quotes]
    }));
  }
}));
