"use client";

import { motion } from "framer-motion";
import { BarChart3, TrendingUp, TrendingDown, Search, Filter, ArrowUpRight } from "lucide-react";
import { AreaChart, Area, ResponsiveContainer } from "recharts";
import { GlowCard } from "@/components/premium/glow-card";
import { LivePulse } from "@/components/premium/animated-counter";
import { AppShell } from "@/components/layout/app-shell";
import { useState } from "react";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 20, filter: "blur(4px)" }, show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { type: "spring" as const, stiffness: 300, damping: 25 } } };

const indices = [
  { name: "NIFTY 50", value: 22456.80, change: 0.84, chart: Array.from({ length: 20 }, (_, i) => ({ v: 22000 + Math.sin(i * 0.4) * 300 + Math.random() * 100 })) },
  { name: "SENSEX", value: 73842.15, change: 0.72, chart: Array.from({ length: 20 }, (_, i) => ({ v: 73000 + Math.sin(i * 0.3) * 500 + Math.random() * 200 })) },
  { name: "BANK NIFTY", value: 48215.60, change: -0.45, chart: Array.from({ length: 20 }, (_, i) => ({ v: 48000 + Math.cos(i * 0.35) * 400 + Math.random() * 150 })) },
  { name: "NIFTY IT", value: 34580.25, change: 2.15, chart: Array.from({ length: 20 }, (_, i) => ({ v: 34000 + Math.sin(i * 0.5) * 350 + Math.random() * 100 })) },
];

const topMovers = [
  { symbol: "TATAPOWER", price: 425.60, change: 5.42 },
  { symbol: "ADANIENT", price: 2847.30, change: 4.18 },
  { symbol: "BHARTIARTL", price: 1623.80, change: 3.21 },
  { symbol: "WIPRO", price: 456.90, change: -3.85 },
  { symbol: "COALINDIA", price: 387.15, change: -2.94 },
  { symbol: "ONGC", price: 254.80, change: -2.12 },
];

const sectorHeatmap = [
  { name: "IT", change: 2.15, color: "bg-emerald-500" },
  { name: "Banking", change: 0.84, color: "bg-emerald-400" },
  { name: "Pharma", change: 1.42, color: "bg-emerald-500" },
  { name: "Auto", change: -0.67, color: "bg-red-400" },
  { name: "FMCG", change: 0.32, color: "bg-emerald-300" },
  { name: "Energy", change: -1.23, color: "bg-red-500" },
  { name: "Metal", change: -0.89, color: "bg-red-400" },
  { name: "Realty", change: 1.78, color: "bg-emerald-500" },
];

export default function MarketsPage() {
  const [search, setSearch] = useState("");

  return (
    <AppShell>
      <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
        <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-white flex items-center gap-3">
              <BarChart3 size={28} className="text-indigo-400" /> Markets
            </h1>
            <p className="text-sm text-slate-500 mt-1">Real-time Indian market data & sector analysis</p>
          </div>
          <LivePulse label="NSE LIVE" />
        </motion.div>

        {/* Search */}
        <motion.div variants={item} className="relative">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search stocks, indices, ETFs..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder:text-slate-600 focus:border-indigo-500/50 outline-none transition-all" />
        </motion.div>

        {/* Indices */}
        <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {indices.map((idx, i) => (
            <GlowCard key={i} glowColor={idx.change >= 0 ? "#10b981" : "#ef4444"}>
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">{idx.name}</p>
              <p className="text-lg font-bold text-white mt-1">₹{idx.value.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</p>
              <p className={`text-xs font-semibold mt-0.5 ${idx.change >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                {idx.change >= 0 ? "+" : ""}{idx.change}%
              </p>
              <div className="h-12 mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={idx.chart}>
                    <defs>
                      <linearGradient id={`ig${i}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={idx.change >= 0 ? "#10b981" : "#ef4444"} stopOpacity={0.3} />
                        <stop offset="100%" stopColor={idx.change >= 0 ? "#10b981" : "#ef4444"} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="v" stroke={idx.change >= 0 ? "#10b981" : "#ef4444"} strokeWidth={1.5} fill={`url(#ig${i})`} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </GlowCard>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Movers */}
          <motion.div variants={item}>
            <GlowCard glowColor="#6366f1">
              <h3 className="font-bold text-white mb-4 flex items-center gap-2"><TrendingUp size={18} className="text-indigo-400" /> Top Movers</h3>
              <div className="space-y-0.5">
                {topMovers.map((s, i) => (
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

          {/* Sector Heatmap */}
          <motion.div variants={item}>
            <GlowCard glowColor="#f59e0b">
              <h3 className="font-bold text-white mb-4 flex items-center gap-2"><Filter size={18} className="text-amber-400" /> Sector Heatmap</h3>
              <div className="grid grid-cols-2 gap-2">
                {sectorHeatmap.map(s => (
                  <div key={s.name} className={`rounded-xl p-3 border transition-colors ${
                    s.change >= 0 ? "border-emerald-500/20 bg-emerald-500/5" : "border-red-500/20 bg-red-500/5"
                  }`}>
                    <p className="text-sm font-semibold text-white">{s.name}</p>
                    <p className={`text-lg font-bold ${s.change >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                      {s.change >= 0 ? "+" : ""}{s.change}%
                    </p>
                  </div>
                ))}
              </div>
            </GlowCard>
          </motion.div>
        </div>
      </motion.div>
    </AppShell>
  );
}
