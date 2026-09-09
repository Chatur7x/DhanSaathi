"use client";

import { motion } from "framer-motion";
import { BarChart3, TrendingUp, Search } from "lucide-react";
import { GlowCard } from "@/components/premium/glow-card";
import { LivePulse } from "@/components/premium/animated-counter";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { useState, useMemo } from "react";

import { useQuery } from "@tanstack/react-query";
import { getQuotes, getTopMovers, getCrypto, getForex } from "@/lib/api";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 20, filter: "blur(4px)" }, show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { type: "spring" as const, stiffness: 300, damping: 25 } } };

export default function MarketsPage() {
  const [search, setSearch] = useState("");

  const { data: globalMarkets } = useQuery({
    queryKey: ["globalMarkets"],
    queryFn: () => getQuotes(["^GSPC", "^DJI", "^IXIC", "^FTSE"]),
    refetchInterval: 30000,
  });

  const { data: crypto } = useQuery({
    queryKey: ["cryptoRates"],
    queryFn: () => getCrypto(),
    refetchInterval: 15000,
  });

  const { data: forex } = useQuery({
    queryKey: ["forexRates"],
    queryFn: () => getForex(),
    refetchInterval: 60000, // Forex updates slower on free tier
  });

  const { data: movers } = useQuery({
    queryKey: ["topMovers"],
    queryFn: getTopMovers,
    initialData: [
      { symbol: "TATAPOWER", price: 425.60, change: 5.42 },
      { symbol: "ADANIENT", price: 2847.30, change: 4.18 },
      { symbol: "BHARTIARTL", price: 1623.80, change: 3.21 },
      { symbol: "WIPRO", price: 456.90, change: -3.85 },
      { symbol: "COALINDIA", price: 387.15, change: -2.94 },
    ]
  });

  const q = search.trim().toLowerCase();
  const match = (s: string) => !q || s.toLowerCase().includes(q);
  const fGlobal = useMemo(() => (globalMarkets || []).filter((x: any) => match(String(x.symbol))), [globalMarkets, q]);
  const fCrypto = useMemo(() => (crypto || []).filter((x: any) => match(String(x.symbol))), [crypto, q]);
  const fForex = useMemo(() => (forex || []).filter((x: any) => match(String(x.symbol))), [forex, q]);
  const fMovers = useMemo(() => (movers || []).filter((x: any) => match(String(x.symbol))), [movers, q]);

  return (
    <AppShell>
      <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
        <motion.div variants={item}>
          <PageHeader
            icon={BarChart3} eyebrow="Overview" title="Global Markets" subtitle="Real-time global indices & crypto"
            right={
              <>
                <LivePulse label="REAL-TIME" />
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Filter symbols…"
                    className="w-44 bg-card border border-border rounded-xl pl-8 pr-3 py-2 text-[13px] placeholder:text-muted-foreground/60 focus:border-primary/50 focus:w-56 transition-all outline-none" />
                </div>
              </>
            }
          />
        </motion.div>

        {/* Global Indices */}
        <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {(fGlobal).map((idx: any, i: number) => (
            <GlowCard key={i} glowColor={idx.change >= 0 ? "#10b981" : "#ef4444"}>
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">{idx.symbol.replace('^', '')}</p>
              <p className="text-lg font-bold text-white mt-1">{idx.price.toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
              <p className={`text-xs font-semibold mt-0.5 ${idx.change >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                {idx.change >= 0 ? "+" : ""}{idx.change} ({idx.changePercent}%)
              </p>
            </GlowCard>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Crypto */}
          <motion.div variants={item}>
            <GlowCard glowColor="#f59e0b">
              <h3 className="font-bold text-white mb-4 flex items-center gap-2">Crypto (Coinlayer)</h3>
              <div className="space-y-0.5">
                {(fCrypto).map((s: any, i: number) => (
                  <motion.div key={s.symbol} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05, type: "spring" as const, stiffness: 300, damping: 25 }}
                    className="flex justify-between items-center px-3 py-2.5 rounded-xl hover:bg-white/[0.02] transition-colors">
                    <p className="text-sm font-bold text-white">{s.symbol.replace('-USD', '')}</p>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-white">${Number(s.price).toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
                      <p className={`text-xs font-bold ${s.changePercent >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                        {s.changePercent >= 0 ? "+" : ""}{s.changePercent}%
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </GlowCard>
          </motion.div>

          {/* Forex */}
          <motion.div variants={item}>
            <GlowCard glowColor="#06b6d4">
              <h3 className="font-bold text-white mb-4 flex items-center gap-2">Forex (Fixer)</h3>
              <div className="space-y-0.5">
                {(fForex).map((s: any, i: number) => (
                  <motion.div key={s.symbol} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05, type: "spring" as const, stiffness: 300, damping: 25 }}
                    className="flex justify-between items-center px-3 py-2.5 rounded-xl hover:bg-white/[0.02] transition-colors">
                    <p className="text-sm font-bold text-white">{s.symbol}</p>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-white">${Number(s.price).toLocaleString("en-US", { minimumFractionDigits: 4 })}</p>
                      <p className={`text-xs font-bold ${s.changePercent >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                        {s.changePercent >= 0 ? "+" : ""}{s.changePercent}%
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </GlowCard>
          </motion.div>

          {/* Top Movers (NSE) */}
          <motion.div variants={item}>
            <GlowCard glowColor="#6366f1">
              <h3 className="font-bold text-white mb-4 flex items-center gap-2"><TrendingUp size={18} className="text-indigo-400" /> NSE Top Movers</h3>
              <div className="space-y-0.5">
                {(fMovers).map((s: any, i: number) => (
                  <motion.div key={s.symbol} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05, type: "spring" as const, stiffness: 300, damping: 25 }}
                    className="flex justify-between items-center px-3 py-2.5 rounded-xl hover:bg-white/[0.02] transition-colors">
                    <p className="text-sm font-bold text-white">{s.symbol}</p>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-white">₹{s.price.toFixed(2)}</p>
                      <p className={`text-xs font-bold ${s.change >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                        {s.change >= 0 ? "+" : ""}{s.change}%
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </GlowCard>
          </motion.div>
        </div>
      </motion.div>
    </AppShell>
  );
}
