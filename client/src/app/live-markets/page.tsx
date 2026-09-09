"use client";

import { motion } from "framer-motion";
import { Activity, TrendingUp, TrendingDown, Zap } from "lucide-react";
import { GlowCard } from "@/components/premium/glow-card";
import { LivePulse } from "@/components/premium/animated-counter";
import { AppShell } from "@/components/layout/app-shell";
import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { WS_URL } from "@/lib/api-config";

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

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.04 } } };
const item = { hidden: { opacity: 0, y: 16, filter: "blur(4px)" }, show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { type: "spring" as const, stiffness: 300, damping: 25 } } };

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

export default function LiveMarketsPage() {
  const [quotes, setQuotes] = useState<MarketQuote[]>([]);
  const [lastUpdate, setLastUpdate] = useState<string>("");
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const socket: Socket = io(WS_URL, { transports: ["websocket", "polling"] });

    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));

    socket.on("market:tick", (data: { quotes: MarketQuote[]; timestamp: string; count: number }) => {
      setQuotes(data.quotes);
      setLastUpdate(data.timestamp);
    });

    return () => { socket.disconnect(); };
  }, []);

  const grouped = quotes.reduce((acc, q) => {
    (acc[q.category] = acc[q.category] || []).push(q);
    return acc;
  }, {} as Record<string, MarketQuote[]>);

  return (
    <AppShell>
      <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
        {/* Header */}
        <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-white flex items-center gap-3">
              <Activity size={28} className="text-indigo-400" /> Live Markets
            </h1>
            <p className="text-sm text-slate-500 mt-1">Real-time Yahoo Finance data via WebSocket</p>
          </div>
          <div className="flex items-center gap-3">
            <LivePulse label={connected ? "LIVE" : "CONNECTING"} />
          </div>
        </motion.div>

        {/* Last Update */}
        {lastUpdate && (
          <motion.div variants={item} className="text-xs text-slate-600">
            Last update: {new Date(lastUpdate).toLocaleTimeString()} — {quotes.length} tickers
          </motion.div>
        )}

        {/* Ticker Groups */}
        {["indian_index", "us_index", "crypto", "commodity_etf"].map(cat => (
          grouped[cat] && (
            <motion.div key={cat} variants={item}>
              <GlowCard glowColor={categoryColors[cat]}>
                <div className="flex items-center gap-2 mb-4">
                  <Zap size={16} style={{ color: categoryColors[cat] }} />
                  <h3 className="font-bold text-white">{categoryLabels[cat]} Markets</h3>
                </div>
                <div className="space-y-1">
                  {grouped[cat].map((q, i) => (
                    <motion.div
                      key={q.ticker}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03, type: "spring" as const, stiffness: 300, damping: 25 }}
                      className="flex justify-between items-center px-3 py-2.5 rounded-xl hover:bg-white/[0.02] transition-colors"
                    >
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
                    </motion.div>
                  ))}
                </div>
              </GlowCard>
            </motion.div>
          )
        ))}

        {/* Summary Grid */}
        {quotes.length > 0 && (
          <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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
      </motion.div>
    </AppShell>
  );
}