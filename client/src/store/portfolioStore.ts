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
  updatePrices: (prices: { symbol: string; price: number }[]) => void;
}

export const usePortfolioStore = create<PortfolioState>((set, get) => ({
  holdings: [
    { symbol: 'RELIANCE.NS', quantity: 10, buyPrice: 2450, currentValue: 0, pnl: 0, pnlPercent: 0, assetType: 'Stocks' },
    { symbol: 'TCS.NS', quantity: 5, buyPrice: 4100, currentValue: 0, pnl: 0, pnlPercent: 0, assetType: 'Stocks' },
    { symbol: 'HDFCBANK.NS', quantity: 15, buyPrice: 1680, currentValue: 0, pnl: 0, pnlPercent: 0, assetType: 'Stocks' }
  ],
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
    const totalCurrent = holdings.reduce((sum, h) => sum + h.currentValue, 0);
    set({
      totalInvested,
      totalCurrent,
      totalReturns: totalCurrent - totalInvested
    });
  }
}));
