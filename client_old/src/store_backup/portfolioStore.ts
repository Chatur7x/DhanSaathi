import { create } from 'zustand';

interface Holding {
  symbol: string;
  quantity: number;
  buyPrice: number;
  currentValue: number;
  pnl: number;
  pnlPercent: number;
  assetType: string;
}

interface PortfolioState {
  holdings: Holding[];
  totalInvested: number;
  totalCurrent: number;
  totalReturns: number;
  xirr: number;
  isAuthenticated: boolean;
  user: any;
  
  setAuth: (auth: boolean, user?: any) => void;
  addHolding: (holding: Holding) => void;
  removeHolding: (symbol: string) => void;
  updateTotals: () => void;
  fetchHoldings: () => Promise<void>;
  buyHolding: (symbol: string, quantity: number, price: number, assetType?: string) => Promise<void>;
  sellHolding: (symbol: string, quantity: number, price: number) => Promise<void>;
}

import { API_BASE } from '../config';

export const usePortfolioStore = create<PortfolioState>((set, get) => ({
  holdings: [],
  totalInvested: 0,
  totalCurrent: 0,
  totalReturns: 0,
  xirr: 14.2,
  isAuthenticated: false,
  user: null,

  setAuth: (auth, user) => {
    set({ isAuthenticated: auth, user });
    if (auth) {
      localStorage.setItem('dhansaathi_auth', 'true');
    } else {
      localStorage.removeItem('dhansaathi_auth');
    }
  },

  addHolding: (holding) => {
    set(state => ({
      holdings: [...state.holdings, holding]
    }));
    get().updateTotals();
  },

  removeHolding: (symbol) => {
    set(state => ({
      holdings: state.holdings.filter(h => h.symbol !== symbol)
    }));
    get().updateTotals();
  },

  updatePrices: (prices) => {
    set(state => ({
      holdings: state.holdings.map(h => {
        const priceUpdate = prices.find(p => p.symbol === h.symbol);
        if (priceUpdate) {
          const currentValue = h.quantity * priceUpdate.price;
          const invested = h.quantity * h.buyPrice;
          return {
            ...h,
            currentValue,
            pnl: currentValue - invested,
            pnlPercent: ((currentValue - invested) / invested) * 100
          };
        }
        return h;
      })
    }));
    get().updateTotals();
  },

  updateTotals: () => {
    const { holdings } = get();
    const totalInvested = holdings.reduce((sum, h) => sum + (h.quantity * h.buyPrice), 0);
    const totalCurrent = holdings.reduce((sum, h) => sum + (h.currentValue || (h.quantity * h.buyPrice)), 0);
    set({
      totalInvested,
      totalCurrent,
      totalReturns: totalCurrent - totalInvested
    });
  },

  fetchHoldings: async () => {
    try {
      const token = localStorage.getItem('dhansaathi_token') || 'null';
      const res = await fetch(`${API_BASE}/api/portfolio`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        const formatted = data.map(d => ({
          symbol: d.symbol,
          quantity: d.quantity,
          buyPrice: d.buy_price,
          currentValue: d.quantity * d.buy_price, // Will be updated by real price later
          pnl: 0,
          pnlPercent: 0,
          assetType: d.asset_type
        }));
        set({ holdings: formatted });
        get().updateTotals();
      }
    } catch (error) {
      console.error('Failed to fetch holdings', error);
    }
  },

  buyHolding: async (symbol, quantity, price, assetType = 'Stocks') => {
    try {
      const token = localStorage.getItem('dhansaathi_token') || 'null';
      await fetch(`${API_BASE}/api/portfolio`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ symbol, quantity, buy_price: price, asset_type: assetType })
      });
      await get().fetchHoldings();
    } catch (error) {
      console.error('Buy failed', error);
    }
  },

  sellHolding: async (symbol, quantity, price) => {
    try {
      const token = localStorage.getItem('dhansaathi_token') || 'null';
      await fetch(`${API_BASE}/api/portfolio/sell`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ symbol, quantity, sell_price: price })
      });
      await get().fetchHoldings();
    } catch (error) {
      console.error('Sell failed', error);
    }
  }
}));
