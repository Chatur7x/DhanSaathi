"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Star, Trash2, BellRing, Check } from "lucide-react";
import { GlowCard } from "@/components/premium/glow-card";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { TickerSearch } from "@/components/market/TickerSearch";
import { useWatchlist } from "@/hooks/useWatchlist";
import { useState } from "react";
import Link from "next/link";
import type { TickerSearchResult } from "@/lib/api";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.25 } } };

const POPULAR: TickerSearchResult[] = [
  { symbol: "NIFTY", yahooSymbol: "^NSEI", name: "NIFTY 50", exchange: "NSE", category: "indian_index", inUniverse: true },
  { symbol: "BTC", yahooSymbol: "BTC-USD", name: "Bitcoin", exchange: "CRYPTO", category: "crypto", inUniverse: true },
  { symbol: "AAPL", yahooSymbol: "AAPL", name: "Apple Inc.", exchange: "NASDAQ", category: null, inUniverse: false },
  { symbol: "RELIANCE.NS", yahooSymbol: "RELIANCE.NS", name: "Reliance Industries", exchange: "NSE", category: null, inUniverse: false },
];

export default function WatchlistPage() {
  const { watchlist, loading, error, addTicker, removeTicker, isInWatchlist, clearError } = useWatchlist();
  const [addedFlash, setAddedFlash] = useState<string | null>(null);
  const [searchFocus, setSearchFocus] = useState(false);

  const handleSelect = (t: TickerSearchResult) => {
    const ok = addTicker({ symbol: t.symbol, yahooSymbol: t.yahooSymbol, name: t.name, exchange: t.exchange });
    if (ok) {
      setAddedFlash(t.symbol);
      setTimeout(() => setAddedFlash(null), 2500);
    }
  };

  return (
    <AppShell>
      <motion.div variants={container} initial="hidden" animate="show" className="space-y-5">
        <motion.div variants={item} className="relative">
          <div aria-hidden className="animate-float-slow pointer-events-none absolute -top-16 -right-10 w-64 h-40 rounded-full bg-primary/10 blur-3xl" />
          <div aria-hidden className="animate-float-slow pointer-events-none absolute -top-8 right-40 w-40 h-24 rounded-full bg-amber-500/10 blur-3xl" style={{ animationDelay: "-7s" }} />
          <PageHeader
            icon={Star}
            eyebrow="Track"
            title="Watchlist"
            subtitle={loading ? "Loading…" : watchlist.length === 0 ? "Search and add your first ticker" : `${watchlist.length} ticker${watchlist.length === 1 ? "" : "s"} tracked`}
            right={
              <AnimatePresence mode="popLayout">
                <motion.span
                  key={watchlist.length}
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.6, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 26 }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/25 tabular-nums"
                >
                  <Star size={12} /> {watchlist.length}
                </motion.span>
              </AnimatePresence>
            }
          />
        </motion.div>

        <motion.div
          variants={item}
          animate={searchFocus ? { scale: 1.008 } : { scale: 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 28 }}
          className={`rounded-2xl border search-glow ${searchFocus ? "search-glow-on" : "border-transparent"}`}
        >
          <TickerSearch onSelect={handleSelect} isAdded={isInWatchlist} autoFocus={watchlist.length === 0} onFocusChange={setSearchFocus} />
        </motion.div>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[13px] font-medium"
            >
              <span className="flex items-center gap-2"><BellRing size={14} /> {error}</span>
              <button onClick={clearError} className="font-semibold hover:opacity-70 transition-opacity">Dismiss</button>
            </motion.div>
          )}
          {addedFlash && !error && (
            <motion.div
              key="added"
              initial={{ opacity: 0, y: -8, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: 0.98 }}
              className="px-4 py-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[13px] font-medium flex items-center gap-2"
            >
              <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 600, damping: 18, delay: 0.05 }}>
                <Check size={15} />
              </motion.span>
              {addedFlash} added to your watchlist.
            </motion.div>
          )}
        </AnimatePresence>

        {loading ? (
          <div className="space-y-2.5">
            {[0, 1, 2].map((i) => (
              <GlowCard key={i} className="!p-4">
                <div className="flex justify-between items-center">
                  <div className="h-5 w-32 rounded-md bg-muted animate-shimmer" />
                  <div className="h-8 w-8 rounded-lg bg-muted animate-shimmer" />
                </div>
              </GlowCard>
            ))}
          </div>
        ) : watchlist.length === 0 ? (
          <motion.div variants={item}>
            <GlowCard className="text-center py-12">
              <Star size={22} className="mx-auto text-muted-foreground mb-3" />
              <p className="font-display text-xl">Nothing tracked yet</p>
              <p className="text-[13px] text-muted-foreground mt-1.5">Search above, or start from a popular pick.</p>
              <div className="flex flex-wrap gap-2 justify-center mt-5">
                {POPULAR.map((p, i) => (
                  <motion.button
                    key={p.yahooSymbol}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 + i * 0.06, type: "spring", stiffness: 400, damping: 24 }}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.94 }}
                    onClick={() => handleSelect(p)}
                    className="px-3.5 py-2 rounded-xl text-[13px] font-semibold border border-border hover:border-primary/40 hover:bg-primary/5 hover:text-primary transition-colors"
                  >
                    + {p.symbol}
                  </motion.button>
                ))}
              </div>
            </GlowCard>
          </motion.div>
        ) : (
          <div className="space-y-2.5">
            <AnimatePresence initial={false}>
              {watchlist.map((w, i) => (
                <motion.div
                  key={w.yahooSymbol}
                  layout
                  initial={{ opacity: 0, scale: 0.96, y: 14 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.94, x: 48 }}
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  whileHover={{ y: -2 }}
                >
                  <GlowCard className="!p-4 shine group">
                    <div className="flex items-center justify-between gap-3 relative z-[2]">
                      <Link
                        href={`/markets/${encodeURIComponent(w.symbol)}`}
                        className="flex items-center gap-3.5 min-w-0 flex-1"
                      >
                        <motion.span
                          initial={{ rotate: -8, scale: 0.8 }}
                          animate={{ rotate: 0, scale: 1 }}
                          transition={{ delay: Math.min(i * 0.04, 0.2), type: "spring", stiffness: 400, damping: 20 }}
                          className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-sm font-bold text-primary shrink-0"
                        >
                          {w.symbol.slice(0, 2)}
                        </motion.span>
                        <span className="min-w-0">
                          <span className="block text-sm font-semibold truncate">{w.symbol}</span>
                          <span className="block text-xs text-muted-foreground truncate">{w.name}</span>
                        </span>
                      </Link>
                      <motion.button
                        whileHover={{ scale: 1.18, rotate: -10 }}
                        whileTap={{ scale: 0.88 }}
                        transition={{ type: "spring", stiffness: 500, damping: 18 }}
                        onClick={() => removeTicker(w.symbol)}
                        aria-label={`Remove ${w.symbol} from watchlist`}
                        className="p-2.5 rounded-xl text-muted-foreground/70 hover:text-red-500 hover:bg-red-500/10 transition-colors shrink-0"
                      >
                        <Trash2 size={15} />
                      </motion.button>
                    </div>
                  </GlowCard>
                </motion.div>
              ))}
            </AnimatePresence>
            <p className="text-xs text-muted-foreground/70 pt-1">Live prices arrive on Day 3 — tap a ticker for its live detail page today.</p>
          </div>
        )}
      </motion.div>
    </AppShell>
  );
}
