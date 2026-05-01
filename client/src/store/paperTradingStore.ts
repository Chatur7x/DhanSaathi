import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface PaperHolding {
  symbol: string;
  quantity: number;
  avg_price: number;
}

export interface PaperTrade {
  id: number;
  symbol: string;
  action: 'BUY' | 'SELL';
  quantity: number;
  price: number;
  total: number;
  created_at: string;
}

export interface PaperSession {
  id: string;
  name: string;
  initial_balance: number;
  current_balance: number;
  total_pnl: number;
  total_trades: number;
  win_count: number;
  loss_count: number;
  holdings: PaperHolding[];
  trades: PaperTrade[];
  created_at: string;
}

interface PaperTradingState {
  sessions: PaperSession[];
  activeSession: PaperSession | null;
  loading: boolean;

  fetchSessions: () => Promise<void>;
  createSession: (name: string, balance: number) => Promise<void>;
  loadSession: (id: string) => Promise<void>;
  executeTrade: (symbol: string, action: 'BUY' | 'SELL', quantity: number, price: number) => Promise<void>;
  deleteSession: (id: string) => Promise<void>;
}

const API = '/api/paper-trading';

export const usePaperTradingStore = create<PaperTradingState>((set, get) => ({
  sessions: [],
  activeSession: null,
  loading: false,

  fetchSessions: async () => {
    set({ loading: true });
    try {
      const res = await fetch(`${API}/sessions`);
      const sessions = await res.json();
      set({ sessions, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  createSession: async (name, balance) => {
    try {
      const res = await fetch(`${API}/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, initialBalance: balance })
      });
      const session = await res.json();
      set(s => ({ sessions: [{ ...session, holdings: [], trades: [] }, ...s.sessions] }));
      // Auto-load the new session
      await get().loadSession(session.id);
    } catch (e) {
      console.error('Create session error:', e);
    }
  },

  loadSession: async (id) => {
    set({ loading: true });
    try {
      const res = await fetch(`${API}/sessions/${id}`);
      const session = await res.json();
      set({ activeSession: session, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  executeTrade: async (symbol, action, quantity, price) => {
    const { activeSession } = get();
    if (!activeSession) return;

    try {
      const res = await fetch(`${API}/trade`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: activeSession.id,
          symbol, action, quantity, price
        })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error);
      }

      const updated = await res.json();
      set({ activeSession: updated });
    } catch (e: any) {
      throw e;
    }
  },

  deleteSession: async (id) => {
    try {
      await fetch(`${API}/sessions/${id}`, { method: 'DELETE' });
      set(s => ({
        sessions: s.sessions.filter(ses => ses.id !== id),
        activeSession: s.activeSession?.id === id ? null : s.activeSession
      }));
    } catch (e) {
      console.error('Delete session error:', e);
    }
  }
}));
