"use client";

import { motion } from "framer-motion";
import { BarChart3, TrendingUp, Search, WifiOff } from "lucide-react";
import { GlowCard } from "@/components/premium/glow-card";
import { TiltCard } from "@/components/premium/tilt-card";
import { LivePulse } from "@/components/premium/animated-counter";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import Link from "next/link";
import { useState, useMemo, useCallback } from "react";

import { useQuery } from "@tanstack/react-query";
import { getQuotes, getTopMovers, getCrypto, getForex } from "@/lib/api";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.25 } } };

interface MarketRow {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
}

const toNum = (v: unknown): number => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

const normalize = (rows: MarketRow[]): MarketRow[] =>
  rows.map((r) => ({
    symbol: String(r.symbol),
    price: toNum(r.price),
    change: toNum(r.change),
    changePercent: toNum(r.changePercent),
  }));

const up = (v: number) => v >= 0;
const upText = (v: number) => (up(v) ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400");

const CURR: Record<string, string> = { USD: "$", INR: "₹", EUR: "€", GBP: "£", JPY: "¥" };

function forexFormat(symbol: string, price: number): string {
  const quote = symbol.split("/")[1] ?? "";
  const mark = CURR[quote] ?? "";
  const digits = price >= 1000 ? 2 : 4;
  return `${mark}${price.toLocaleString("en-US", { minimumFractionDigits: digits, maximumFractionDigits: digits })}`;
}

function ShimmerRows({ n = 4 }: { n?: number }) {
  return (
    <div className="space-y-0.5" aria-label="Loading">
      {Array.from({ length: n }).map((_, i) => (
        <div key={i} className="flex justify-between items-center px-3 py-2.5">
          <div className="h-4 w-20 rounded-md bg-muted animate-pulse" />
          <div className="h-4 w-16 rounded-md bg-muted animate-pulse" />
        </div>
      ))}
    </div>
  );
}

function EmptyNote({ what }: { what: string }) {
  return (
    <div className="flex items-center gap-2 px-3 py-4 text-[13px] text-muted-foreground">
      <WifiOff size={14} />
      {what} unavailable right now.
    </div>
  );
}

export default function MarketsPage() {
  const [search, setSearch] = useState("");

  const { data: globalMarkets, dataUpdatedAt: tGlobal, isLoading: lGlobal } = useQuery({
    queryKey: ["globalMarkets"],
    queryFn: () => getQuotes(["^GSPC", "^DJI", "^IXIC", "^FTSE"]),
    refetchInterval: 30000,
  });

  const { data: crypto, dataUpdatedAt: tCrypto, isLoading: lCrypto } = useQuery({
    queryKey: ["cryptoRates"],
    queryFn: () => getCrypto(),
    refetchInterval: 15000,
  });

  const { data: forex, dataUpdatedAt: tForex, isLoading: lForex } = useQuery({
    queryKey: ["forexRates"],
    queryFn: () => getForex(),
    refetchInterval: 60000,
  });

  const { data: movers, dataUpdatedAt: tMovers } = useQuery({
    queryKey: ["topMovers"],
    queryFn: getTopMovers,
    initialData: [
      { symbol: "TATAPOWER", price: 425.60, change: 5.42, changePercent: 5.42 },
      { symbol: "ADANIENT", price: 2847.30, change: 4.18, changePercent: 4.18 },
      { symbol: "BHARTIARTL", price: 1623.80, change: 3.21, changePercent: 3.21 },
      { symbol: "WIPRO", price: 456.90, change: -3.85, changePercent: -3.85 },
      { symbol: "COALINDIA", price: 387.15, change: -2.94, changePercent: -2.94 },
    ]
  });

  const q = search.trim().toLowerCase();
  const match = useCallback((s: string) => !q || s.toLowerCase().includes(q), [q]);
  const fGlobal = useMemo(() => normalize(((globalMarkets || []) as MarketRow[]).filter((x) => match(String(x.symbol)))), [globalMarkets, match]);
  const fCrypto = useMemo(() => normalize(((crypto || []) as MarketRow[]).filter((x) => match(String(x.symbol)))), [crypto, match]);
  const fForex = useMemo(() => normalize(((forex || []) as MarketRow[]).filter((x) => match(String(x.symbol)))), [forex, match]);
  const fMovers = useMemo(() => normalize(((movers || []) as MarketRow[]).filter((x) => match(String(x.symbol)))), [movers, match]);

  const updatedAt = Math.max(tGlobal, tCrypto, tForex, tMovers, 0);
  const subtitle = updatedAt > 0
    ? `Updated ${new Date(updatedAt).toLocaleTimeString()} · global indices, crypto & forex`
    : "Global indices, crypto & forex";

  return (
    <AppShell>
      <motion.div variants={container} initial="hidden" animate="show" className="space-y-5">
        <motion.div variants={item}>
          <PageHeader
            icon={BarChart3} eyebrow="Overview" title="Global Markets" subtitle={subtitle}
            right={
              <>
                <LivePulse label="REAL-TIME" />
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Filter symbols…"
                    aria-label="Filter symbols"
                    className="w-44 bg-card border border-border rounded-xl pl-8 pr-3 py-2 text-[13px] placeholder:text-muted-foreground/60 focus:border-primary/50 focus:w-56 transition-all outline-none" />
                </div>
              </>
            }
          />
        </motion.div>

        <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {lGlobal && fGlobal.length === 0 && Array.from({ length: 4 }).map((_, i) => (
            <GlowCard key={i} className="!p-4">
              <div className="h-3 w-16 rounded bg-muted animate-pulse" />
              <div className="h-6 w-24 rounded bg-muted animate-pulse mt-2" />
              <div className="h-3 w-20 rounded bg-muted animate-pulse mt-1.5" />
            </GlowCard>
          ))}
          {fGlobal.map((idx) => (
            <Link key={idx.symbol} href={`/markets/${encodeURIComponent(idx.symbol)}`}>
              <TiltCard max={6}>
              <GlowCard glowColor={up(idx.changePercent) ? "#10b981" : "#ef4444"} className="!p-4 cursor-pointer h-full">
              <p className="eyebrow">{idx.symbol.replace("^", "")}</p>
              <p className="font-display text-[22px] mt-1 tabular-nums">{idx.price.toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
              <p className={`text-xs font-semibold mt-0.5 tabular-nums ${upText(idx.changePercent)}`}>
                {up(idx.changePercent) ? "+" : ""}{idx.change.toLocaleString("en-US")} ({up(idx.changePercent) ? "+" : ""}{idx.changePercent.toFixed(2)}%)
              </p>
            </GlowCard>
              </TiltCard>
            </Link>
          ))}
          {!lGlobal && fGlobal.length === 0 && (
            <div className="col-span-2 lg:col-span-4"><GlowCard><EmptyNote what="Global indices" /></GlowCard></div>
          )}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <motion.div variants={item}>
            <GlowCard glowColor="#d97757">
              <h3 className="font-display text-[17px] mb-3">Crypto · USD</h3>
              {lCrypto && fCrypto.length === 0 ? <ShimmerRows /> :
                fCrypto.length === 0 ? <EmptyNote what="Crypto prices" /> : (
                <div className="space-y-0.5">
                  {fCrypto.map((s, i) => (
                    <motion.div key={s.symbol} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: Math.min(i * 0.05, 0.3), type: "spring" as const, stiffness: 300, damping: 25 }}>
                      <Link href={`/markets/${encodeURIComponent(s.symbol.replace("-USD", ""))}`}
                        className="flex justify-between items-center px-3 py-2.5 rounded-xl hover:bg-accent/60 transition-colors">
                      <p className="text-sm font-semibold">{s.symbol.replace("-USD", "")}</p>
                      <div className="text-right">
                        <p className="text-sm font-semibold tabular-nums">${s.price.toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
                        <p className={`text-xs font-semibold tabular-nums ${upText(s.changePercent)}`}>
                          {up(s.changePercent) ? "+" : ""}{s.changePercent.toFixed(2)}%
                        </p>
                      </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              )}
            </GlowCard>
          </motion.div>

          <motion.div variants={item}>
            <GlowCard glowColor="#6aa5d4">
              <h3 className="font-display text-[17px] mb-3">Forex · vs USD</h3>
              {lForex && fForex.length === 0 ? <ShimmerRows /> :
                fForex.length === 0 ? <EmptyNote what="Forex rates" /> : (
                <div className="space-y-0.5">
                  {fForex.map((s, i) => (
                    <motion.div key={s.symbol} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: Math.min(i * 0.05, 0.3), type: "spring" as const, stiffness: 300, damping: 25 }}>
                      <Link href={`/markets/${encodeURIComponent(s.symbol.replace("/", ""))}=X`}
                        className="flex justify-between items-center px-3 py-2.5 rounded-xl hover:bg-accent/60 transition-colors">
                      <p className="text-sm font-semibold">{s.symbol}</p>
                      <div className="text-right">
                        <p className="text-sm font-semibold tabular-nums">{forexFormat(s.symbol, s.price)}</p>
                        <p className={`text-xs font-semibold tabular-nums ${upText(s.changePercent)}`}>
                          {up(s.changePercent) ? "+" : ""}{s.changePercent.toFixed(2)}%
                        </p>
                      </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              )}
            </GlowCard>
          </motion.div>

          <motion.div variants={item}>
            <GlowCard glowColor="#d97757">
              <h3 className="font-display text-[17px] mb-3 flex items-center gap-2"><TrendingUp size={16} className="text-primary" /> NSE Top Movers</h3>
              {fMovers.length === 0 ? <EmptyNote what="Top movers" /> : (
                <div className="space-y-0.5">
                  {fMovers.map((s, i) => (
                    <motion.div key={s.symbol} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: Math.min(i * 0.05, 0.3), type: "spring" as const, stiffness: 300, damping: 25 }}>
                      <Link href={`/markets/${encodeURIComponent(s.symbol)}`}
                        className="flex justify-between items-center px-3 py-2.5 rounded-xl hover:bg-accent/60 transition-colors">
                      <p className="text-sm font-semibold">{s.symbol}</p>
                      <div className="text-right">
                        <p className="text-sm font-semibold tabular-nums">₹{s.price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</p>
                        <p className={`text-xs font-semibold tabular-nums ${upText(s.changePercent)}`}>
                          {up(s.changePercent) ? "+" : ""}{s.changePercent.toFixed(2)}%
                        </p>
                      </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              )}
            </GlowCard>
          </motion.div>
        </div>
      </motion.div>
    </AppShell>
  );
}
