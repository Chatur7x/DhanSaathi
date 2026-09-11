"use client";

import { motion } from "framer-motion";
import { Activity, Zap } from "lucide-react";
import { GlowCard } from "@/components/premium/glow-card";
import { LivePulse } from "@/components/premium/animated-counter";
import { AppShell } from "@/components/layout/app-shell";
import { useState } from "react";
import { useMarketData, type MarketQuote } from "@/hooks/useMarketData";

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
          <div className="h-7 w-7 bg-muted rounded-lg animate-pulse" />
          <div className="h-7 w-40 bg-muted rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-muted/50 rounded-2xl animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-48 bg-muted/50 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    </AppShell>
  );
}

export default function LiveMarketsPage() {
  const { quotes, lastUpdate, loading, connectionState } = useMarketData();
  const [catFilter, setCatFilter] = useState<string>("all");

  if (loading) return <Skeleton />;

  const staleCount = quotes.filter(q => q.stale).length;

  const grouped = quotes.reduce((acc, q) => {
    const key = q.category ?? "unknown";
    (acc[key] = acc[key] || []).push(q);
    return acc;
  }, {} as Record<string, MarketQuote[]>);

  const visibleCats = (["indian_index", "us_index", "crypto", "commodity_etf"] as const)
    .filter((cat) => catFilter === "all" || cat === catFilter);

  return (
    <AppShell>
      <div className="space-y-6">
        {}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Activity size={28} className="text-primary" />
            <div>
              <h1 className="text-2xl font-extrabold text-foreground">Live Markets</h1>
              <p className="text-xs text-muted-foreground">{lastUpdate && `Updated ${new Date(lastUpdate).toLocaleTimeString()} — ${quotes.length} tickers${staleCount > 0 ? ` — ${staleCount} cached` : ""}`}</p>
            </div>
          </div>
          <LivePulse label={
            connectionState === "connected" ? "LIVE"
            : connectionState === "reconnecting" ? "RECONNECTING"
            : connectionState === "error" ? "ERROR"
            : "CONNECTING"
          } />
        </motion.div>

        {}
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

        {}
        {visibleCats.map(cat => (
          grouped[cat] && (
            <motion.div key={cat} variants={item} initial="hidden" animate="show">
              <GlowCard glowColor={categoryColors[cat]}>
                <div className="flex items-center gap-2 mb-3">
                  <Zap size={14} style={{ color: categoryColors[cat] }} />
                  <h3 className="font-bold text-foreground text-sm">{categoryLabels[cat]} Markets</h3>
                </div>
                <div className="space-y-0.5">
                  {grouped[cat].map((q) => (
                    <div key={q.ticker} className="flex justify-between items-center px-3 py-2 rounded-lg hover:bg-accent/60 transition-colors">
                      <div>
                        <p className="text-sm font-bold text-foreground flex items-center gap-1.5">
                          {q.ticker}
                          {q.stale && (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30">
                              CACHED
                            </span>
                          )}
                        </p>
                        <p className="text-[10px] text-muted-foreground/70">{q.displayName}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-foreground">{formatPrice(q.price, q.symbol)}</p>
                        <p className={`text-xs font-bold ${q.change >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
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

        {}
        {quotes.length > 0 && (
          <motion.div variants={item} initial="hidden" animate="show" className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {quotes.filter(q => q.category === "indian_index" || q.category === "us_index").map(q => (
              <GlowCard key={q.ticker} glowColor={q.change >= 0 ? "#10b981" : "#ef4444"}>
                <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">{q.ticker}</p>
                <p className="text-lg font-bold text-foreground mt-1">{formatPrice(q.price, q.symbol)}</p>
                <p className={`text-xs font-semibold mt-0.5 ${q.change >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
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