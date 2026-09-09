"use client";

import { motion } from "framer-motion";
import { Activity, Zap } from "lucide-react";
import { GlowCard } from "@/components/premium/glow-card";
import { LivePulse } from "@/components/premium/animated-counter";
import { AppShell } from "@/components/layout/app-shell";
import { useEffect, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { WS_URL, API_URL } from "@/lib/api-config";

interface MarketQuote {
  ticker: string;
  symbol: string;
  displayName: string;
  category: string;
  exchange: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  high: number;
  low: number;
  open: number;
  prevClose: number;
  timestamp: string;
}

const item = { hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0, transition: { duration: 0.2 } } };

const categoryColors: Record<string, string> = {
  indian_index: "#6366f1",
  us_index: "#06b6d4",
  crypto: "#f59e0b",
  commodity_etf: "#10b981",
};

const categoryLabels: Record<string, string> = {
  indian_index: "Indian",
  us_index: "US",
  crypto: "Crypto",
  commodity_etf: "Commodity",
};

function formatPrice(price: number, symbol: string): string {
  if (symbol.endsWith("-USD")) return `$${price.toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
  if (symbol.startsWith("^NSE") || symbol.startsWith("^BSE")) return `₹${price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
  return `$${price.toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
}

function Skeleton() {
  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="h-7 w-7 bg-slate-800 rounded-lg animate-pulse" />
          <div className="h-7 w-40 bg-slate-800 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-slate-800/50 rounded-2xl animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-48 bg-slate-800/50 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    </AppShell>
  );
}

export default function LiveMarketsPage() {
  const [quotes, setQuotes] = useState<MarketQuote[]>([]);
  const [lastUpdate, setLastUpdate] = useState<string>("");
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);

  const handleTick = useCallback((data: { quotes: MarketQuote[]; timestamp: string }) => {
    setQuotes(data.quotes);
    setLastUpdate(data.timestamp);
    setLoading(false);
  }, []);

  useEffect(() => {
    // 1. Fetch immediately via REST so page shows data instantly
    fetch(`${API_URL}/api/market/tickers`)
      .then(r => r.json())
      .then((data: MarketQuote[]) => {
        if (data.length > 0) {
          setQuotes(data);
          setLastUpdate(new Date().toISOString());
          setLoading(false);
        }
      })
      .catch(() => {});

    // 2. Connect WebSocket for live updates
    const socket: Socket = io(WS_URL, { transports: ["websocket", "polling"], reconnectionDelay: 1000 });
    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));
    socket.on("market:tick", handleTick);

    return () => { socket.disconnect(); };
  }, [handleTick]);

  if (loading) return <Skeleton />;

  const grouped = quotes.reduce((acc, q) => {
    (acc[q.category] = acc[q.category] || []).push(q);
    return acc;
  }, {} as Record<string, MarketQuote[]>);

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Activity size={28} className="text-indigo-400" />
            <div>
              <h1 className="text-2xl font-extrabold text-white">Live Markets</h1>
              <p className="text-xs text-slate-500">{lastUpdate && `Updated ${new Date(lastUpdate).toLocaleTimeString()} — ${quotes.length} tickers`}</p>
            </div>
          </div>
          <LivePulse label={connected ? "LIVE" : "CONNECTING"} />
        </motion.div>

        {/* Ticker Groups */}
        {["indian_index", "us_index", "crypto", "commodity_etf"].map(cat => (
          grouped[cat] && (
            <motion.div key={cat} variants={item} initial="hidden" animate="show">
              <GlowCard glowColor={categoryColors[cat]}>
                <div className="flex items-center gap-2 mb-3">
                  <Zap size={14} style={{ color: categoryColors[cat] }} />
                  <h3 className="font-bold text-white text-sm">{categoryLabels[cat]} Markets</h3>
                </div>
                <div className="space-y-0.5">
                  {grouped[cat].map((q) => (
                    <div key={q.ticker} className="flex justify-between items-center px-3 py-2 rounded-lg hover:bg-white/[0.02] transition-colors">
                      <div>
                        <p className="text-sm font-bold text-white">{q.ticker}</p>
                        <p className="text-[10px] text-slate-600">{q.displayName}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-white">{formatPrice(q.price, q.symbol)}</p>
                        <p className={`text-xs font-bold ${q.change >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                          {q.change >= 0 ? "+" : ""}{q.change.toFixed(2)} ({q.changePercent.toFixed(2)}%)
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </GlowCard>
            </motion.div>
          )
        ))}

        {/* Index Summary */}
        {quotes.length > 0 && (
          <motion.div variants={item} initial="hidden" animate="show" className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {quotes.filter(q => q.category === "indian_index" || q.category === "us_index").map(q => (
              <GlowCard key={q.ticker} glowColor={q.change >= 0 ? "#10b981" : "#ef4444"}>
                <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">{q.ticker}</p>
                <p className="text-lg font-bold text-white mt-1">{formatPrice(q.price, q.symbol)}</p>
                <p className={`text-xs font-semibold mt-0.5 ${q.change >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                  {q.change >= 0 ? "+" : ""}{q.change.toFixed(2)} ({q.changePercent.toFixed(2)}%)
                </p>
              </GlowCard>
            ))}
          </motion.div>
        )}
      </div>
    </AppShell>
  );
}