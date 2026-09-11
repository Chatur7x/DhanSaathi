"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";
import { API_URL, MARKET_URL, WS_URL } from "@/lib/api-config";

export interface MarketQuote {
  ticker: string;
  symbol: string;
  displayName?: string;
  category?: string;
  exchange?: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  high: number;
  low: number;
  open: number;
  prevClose: number;
  timestamp: string;
  source?: "yahoo" | "cache";
  stale?: boolean;
  ageMs?: number;
}

export type ConnectionState =
  | "connecting"
  | "connected"
  | "disconnected"
  | "reconnecting"
  | "error";

export interface MarketStatus {
  status: string;
  lastUpdate?: string | null;
  totalSymbols?: number;
  liveQuotes?: number;
  cachedQuotes?: number;
  subscriptions?: string[];
  timestamp?: string;
}

export interface MarketError {
  failed?: { yahooSymbol?: string; ticker?: string; error?: string }[];
  error?: string;
  timestamp?: string;
}

export interface UseMarketDataOptions {

  tickers?: string[];
  socketUrl?: string;
  restUrl?: string;
  fallbackSocketUrl?: string;
  fallbackRestUrl?: string;
  autoConnect?: boolean;
}

function normalizeTickers(input: unknown): string[] {
  if (!Array.isArray(input)) return [];
  const out: string[] = [];
  for (const entry of input) {
    if (typeof entry !== "string") continue;
    const t = entry.trim().toUpperCase();
    if (t && !out.includes(t)) out.push(t);
  }
  return out;
}

export function useMarketData(options: UseMarketDataOptions = {}) {
  const {
    tickers: initialTickers = [],
    socketUrl = MARKET_URL,
    restUrl = MARKET_URL,
    fallbackSocketUrl = WS_URL,
    fallbackRestUrl = API_URL,
    autoConnect = true,
  } = options;

  const [quotes, setQuotes] = useState<MarketQuote[]>([]);
  const [lastUpdate, setLastUpdate] = useState<string>("");
  const [connected, setConnected] = useState(false);
  const [connectionState, setConnectionState] =
    useState<ConnectionState>(autoConnect ? "connecting" : "disconnected");
  const [loading, setLoading] = useState(autoConnect);
  const [status, setStatus] = useState<MarketStatus | null>(null);
  const [error, setError] = useState<MarketError | null>(null);
  const [subscriptions, setSubscriptions] = useState<string[]>([]);
  const [quotesByTicker, setQuotesByTicker] = useState<Record<string, MarketQuote>>({});

  const quotesRef = useRef(new Map<string, MarketQuote>());
  const subsRef = useRef<Set<string>>(new Set(normalizeTickers(initialTickers)));
  const wiredRef = useRef<Set<string>>(new Set());
  const socketRef = useRef<Socket | null>(null);
  const autoSubbedRef = useRef(false);

  const publish = useCallback(() => {
    const arr = [...quotesRef.current.values()];
    setQuotes(arr);
    setQuotesByTicker(Object.fromEntries(quotesRef.current.entries()));
  }, []);

  const applyTick = useCallback(
    (data: { quotes?: MarketQuote[]; timestamp?: string }) => {
      if (!data || !Array.isArray(data.quotes)) return;
      for (const q of data.quotes) {
        if (q && q.ticker) quotesRef.current.set(q.ticker, q);
      }
      publish();
      if (data.timestamp) setLastUpdate(data.timestamp);
      setLoading(false);
    },
    [publish]
  );

  const applyQuote = useCallback(
    (q: MarketQuote) => {
      if (!q || !q.ticker) return;
      quotesRef.current.set(q.ticker, q);
      publish();
      setLoading(false);
    },
    [publish]
  );

  const attachTickerListeners = useCallback(
    (sock: Socket, tickers: string[]) => {
      for (const t of tickers) {
        const event = `market:tick:${t}`;
        if (wiredRef.current.has(event)) continue;
        wiredRef.current.add(event);
        sock.on(event, applyQuote);
      }
    },
    [applyQuote]
  );

  const detachTickerListeners = useCallback((sock: Socket, tickers: string[]) => {
    for (const t of tickers) {
      const event = `market:tick:${t}`;
      wiredRef.current.delete(event);
      sock.off(event);
    }
  }, []);

  const subscribe = useCallback(
    (tickers: string[] | string) => {
      const list = normalizeTickers(Array.isArray(tickers) ? tickers : [tickers]);
      if (list.length === 0) return;
      const fresh = list.filter((t) => !subsRef.current.has(t));
      for (const t of list) subsRef.current.add(t);
      const sock = socketRef.current;
      if (sock) {
        attachTickerListeners(sock, fresh);
        if (sock.connected) {
          sock.emit("market:subscribe", { tickers: [...subsRef.current] });
        }
      }
    },
    [attachTickerListeners]
  );

  const unsubscribe = useCallback(
    (tickers: string[] | string) => {
      const list = normalizeTickers(Array.isArray(tickers) ? tickers : [tickers]);
      if (list.length === 0) return;
      for (const t of list) subsRef.current.delete(t);
      const sock = socketRef.current;
      if (sock) {
        detachTickerListeners(sock, list);
        if (sock.connected) {
          sock.emit("market:unsubscribe", { tickers: [...subsRef.current] });
        }
      }
      setSubscriptions((prev) => prev.filter((t) => !list.includes(t)));
    },
    [detachTickerListeners]
  );

  const fetchSnapshot = useCallback(async () => {

    try {
      const r = await fetch(`${restUrl}/quotes`);
      if (!r.ok) throw new Error("market-service unavailable");
      const data = await r.json();
      if (Array.isArray(data.quotes) && data.quotes.length > 0) {
        applyTick(data);

        if (!autoSubbedRef.current && subsRef.current.size === 0) {
          autoSubbedRef.current = true;
          subscribe(data.quotes.map((q: MarketQuote) => q.ticker));
        }
        return;
      }
      throw new Error("empty market-service snapshot");
    } catch {

      try {
        const r = await fetch(`${fallbackRestUrl}/api/market/tickers`);
        const data: MarketQuote[] = await r.json();
        if (Array.isArray(data) && data.length > 0) {
          applyTick({ quotes: data, timestamp: new Date().toISOString() });
        }
      } catch {

      }
    }
  }, [restUrl, fallbackRestUrl, applyTick, subscribe]);

  const refresh = useCallback(() => {
    void fetchSnapshot();
  }, [fetchSnapshot]);

  useEffect(() => {
    if (!autoConnect) return;

    let cancelled = false;
    let primary: Socket | null = null;
    let fallback: Socket | null = null;
    let fellBack = false;
    let everConnected = false;

    const fetchTimer = setTimeout(() => {
      if (!cancelled) void fetchSnapshot();
    }, 0);

    const wire = (sock: Socket, isFallback: boolean) => {
      sock.on("connect", () => {
        if (cancelled) return;
        everConnected = true;
        socketRef.current = sock;
        setConnected(true);
        setConnectionState("connected");

        attachTickerListeners(sock, [...subsRef.current]);
        if (subsRef.current.size > 0) {
          sock.emit("market:subscribe", { tickers: [...subsRef.current] });
        }
      });
      sock.on("disconnect", () => {
        if (cancelled) return;
        const other = isFallback ? primary : fallback;
        const stillUp = other?.connected ?? false;
        setConnected(stillUp);
        if (!stillUp) setConnectionState("disconnected");
      });

      sock.on("reconnect_attempt", () => {
        if (!cancelled) setConnectionState("reconnecting");
      });
      sock.on("reconnect", () => {
        if (!cancelled) setConnectionState("connected");
      });
      sock.on("connect_error", () => {
        if (cancelled) return;
        if (!everConnected && !fellBack && !isFallback) {

          fellBack = true;
          primary?.disconnect();
          primary = null;
          socketRef.current = null;
          wiredRef.current.clear();
          fallback = io(fallbackSocketUrl, {
            transports: ["websocket", "polling"],
            reconnectionDelay: 1000,
          });
          wire(fallback, true);
        } else if (isFallback || everConnected) {
          setConnectionState(everConnected ? "reconnecting" : "error");
        }
      });
      sock.on("market:tick", applyTick);
      sock.on("market:status", (s: MarketStatus) => {
        if (!cancelled) setStatus(s);
      });
      sock.on("market:error", (e: MarketError) => {
        if (!cancelled) setError(e);
      });
      sock.on("market:subscribed", (ack: { symbols?: string[] }) => {
        if (!cancelled && Array.isArray(ack?.symbols)) {
          setSubscriptions(ack.symbols);
        }
      });
    };

    primary = io(socketUrl, {
      transports: ["websocket", "polling"],
      reconnectionDelay: 1000,
      timeout: 5000,
    });
    socketRef.current = primary;
    wire(primary, false);

    return () => {
      cancelled = true;
      clearTimeout(fetchTimer);
      primary?.disconnect();
      fallback?.disconnect();
      socketRef.current = null;
      primary = null;
      fallback = null;
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoConnect, socketUrl, restUrl, fallbackSocketUrl, fallbackRestUrl]);

  return {
    quotes,
    quotesByTicker,
    lastUpdate,
    connected,
    connectionState,
    loading,
    status,
    error,
    subscriptions,
    subscribe,
    unsubscribe,
    refresh,
  };
}
