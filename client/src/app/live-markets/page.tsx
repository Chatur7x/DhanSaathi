"use client";

import { motion } from "framer-motion";
import { Activity, Zap } from "lucide-react";
import { GlowCard } from "@/components/premium/glow-card";
import { LivePulse } from "@/components/premium/animated-counter";
import { AppShell } from "@/components/layout/app-shell";
import { useEffect, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { WS_URL, API_URL, MARKET_URL } from "@/lib/api-config";

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
  // Day-2 cache metadata (present on market-service quotes)
  source?: "yahoo" | "cache";
  stale?: boolean;
  ageMs?: number;
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
  const [catFilter, setCatFilter] = useState<string>("all");

  const handleTick = useCallback((data: { quotes: MarketQuote[]; timestamp: string }) => {
    setQuotes(data.quotes);
    setLastUpdate(data.timestamp);
    setLoading(false);
  }, []);

  useEffect(() => {
    let cancelled = false;
    let primary: Socket | null = null;
    let fallback: Socket | null = null;
    let fellBack = false;

    const attach = (s: Socket) => {
      s.on("connect", () => { if (!cancelled) setConnected(true); });
      s.on("disconnect", () => {
        if (!cancelled) {
          setConnected(
            (primary?.connected || fallback?.connected) ?? false
          );
        }
      });
      s.on("market:tick", handleTick);
    };

    // 1. REST: Day-2 market-service (/quotes) first, main API fallback
    fetch(`${MARKET_URL}/quotes`)
      .then(r => {
        if (!r.ok) throw new Error("market-service unavailable");
        return r.json();
      })
      .then((data: { quotes: MarketQuote[]; timestamp: string }) => {
        if (cancelled) return;
        if (Array.isArray(data.quotes) && data.quotes.length > 0) {
          setQuotes(data.quotes);
          setLastUpdate(data.timestamp || new Date().toISOString());
          setLoading(false);
        } else {
          throw new Error("empty market-service snapshot");
        }
      })
      .catch(() => {
        // Fallback: main backend ticker universe
        fetch(`${API_URL}/api/market/tickers`)
          .then(r => r.json())
          .then((data: MarketQuote[]) => {
            if (cancelled) return;
            if (data.length > 0) {
              setQuotes(data);
              setLastUpdate(new Date().toISOString());
              setLoading(false);
            }
          })
          .catch(() => {});
      });

    // 2. WebSocket: market-service first, main server fallback (once)
    primary = io(MARKET_URL, { transports: ["websocket", "polling"], reconnectionDelay: 1000, timeout: 5000 });
    attach(primary);
    primary.on("connect_error", () => {
      if (cancelled || fellBack) return;
      fellBack = true;
      primary?.disconnect();
      primary = null;
      fallback = io(WS_URL, { transports: ["websocket", "polling"], reconnectionDelay: 1000 });
      attach(fallback);
    });

    return () => {
      cancelled = true;
      primary?.disconnect();
      fallback?.disconnect();
    };
  }, [handleTick]);

  if (loading) return <Skeleton />;

  const staleCount = quotes.filter(q => q.stale).length;

  const grouped = quotes.reduce((acc, q) => {
    (acc[q.category] = acc[q.category] || []).push(q);
    return acc;
  }, {} as Record<string, MarketQuote[]>);

  const visibleCats = (["indian_index", "us_index", "crypto", "commodity_etf"] as const)
    .filter((cat) => catFilter === "all" || cat === catFilter);

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Activity size={28} className="text-indigo-400" />
            <div>
              <h1 className="text-2xl font-extrabold text-white">Live Markets</h1>
              <p className="text-xs text-slate-500">{lastUpdate && `Updated ${new Date(lastUpdate).toLocaleTimeString()} — ${quotes.length} tickers${staleCount > 0 ? ` — ${staleCount} cached` : ""}`}</p>
            </div>
          </div>
          <LivePulse label={connected ? "LIVE" : "CONNECTING"} />
        </motion.div>

        {/* Category filter */}
        <div className="flex gap-1 p-1 rounded-xl bg-card border border-border w-fit">
          {[["all", "All"], ["indian_index", "Indian"], ["us_index", "US"], ["crypto", "Crypto"], ["commodity_etf", "Commodity"]].map(([key, label]) => (
            <button key={key} onClick={() => setCatFilter(key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                catFilter === key ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"
              }`}>
              {label}
            </button>
          ))}
        </div>

        {/* Ticker Groups */}
        {visibleCats.map(cat => (
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
                        <p className="text-sm font-bold text-white flex items-center gap-1.5">
                          {q.ticker}
                          {q.stale && (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30">
                              CACHED
                            </span>
                          )}
                        </p>
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