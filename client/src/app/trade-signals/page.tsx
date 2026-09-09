"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Target, Shield, Clock } from "lucide-react";
import { GlowCard } from "@/components/premium/glow-card";
import { LivePulse } from "@/components/premium/animated-counter";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { useState } from "react";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 20, filter: "blur(4px)" }, show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { type: "spring" as const, stiffness: 300, damping: 25 } } };

const signals = [
  { symbol: "RELIANCE", type: "BUY", entry: 2820, target: 2920, sl: 2780, confidence: 87, timeframe: "Swing", reason: "Breakout above 200 DMA with strong volume" },
  { symbol: "TCS", type: "SELL", entry: 3560, target: 3420, sl: 3610, confidence: 72, timeframe: "Intraday", reason: "Double top formation near resistance" },
  { symbol: "HDFCBANK", type: "BUY", entry: 1610, target: 1700, sl: 1580, confidence: 81, timeframe: "Positional", reason: "Cup & handle pattern completion on weekly" },
  { symbol: "BHARTIARTL", type: "BUY", entry: 1580, target: 1680, sl: 1540, confidence: 78, timeframe: "Swing", reason: "RSI divergence on daily + sector momentum" },
  { symbol: "INFY", type: "SELL", entry: 1470, target: 1380, sl: 1505, confidence: 65, timeframe: "Intraday", reason: "Head & shoulders on 4H chart" },
];

export default function TradeSignalsPage() {
  const [filter, setFilter] = useState<"All" | "BUY" | "SELL">("All");
  const shown = signals.filter((s) => filter === "All" || s.type === filter);

  return (
    <AppShell>
      <motion.div variants={container} initial="hidden" animate="show" className="space-y-5">
        <motion.div variants={item}>
          <PageHeader
            icon={Target} eyebrow="AI Picks" title="Trade Signals" subtitle="Recommendations with entry, target & stop-loss"
            right={
              <>
                <LivePulse label="AI ACTIVE" />
                <div className="flex gap-1 p-1 rounded-xl bg-card border border-border">
                  {(["All", "BUY", "SELL"] as const).map((f) => (
                    <button key={f} onClick={() => setFilter(f)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        filter === f
                          ? f === "SELL" ? "bg-red-500/10 text-red-500" : f === "BUY" ? "bg-emerald-500/10 text-emerald-500" : "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:text-foreground"
                      }`}>
                      {f}
                    </button>
                  ))}
                </div>
              </>
            }
          />
        </motion.div>

        <motion.div variants={item} className="flex items-center gap-2 px-4 py-3 rounded-xl border border-amber-500/20 bg-amber-500/5 text-amber-400 text-xs font-medium">
          <Shield size={14} /> Disclaimer: These are AI-generated signals for educational purposes only. Always do your own research before trading.
        </motion.div>

        <div className="space-y-4">
          {shown.map((sig) => (
            <motion.div key={sig.symbol + sig.type} variants={item}>
              <GlowCard glowColor={sig.type === "BUY" ? "#10b981" : "#ef4444"} className="p-5">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-black text-white">{sig.symbol}</span>
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                        sig.type === "BUY" ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30" : "bg-red-500/15 text-red-400 border border-red-500/30"
                      }`}>
                        {sig.type === "BUY" ? <TrendingUp size={12} className="inline mr-1" /> : <TrendingDown size={12} className="inline mr-1" />}
                        {sig.type}
                      </span>
                      <span className="text-[0.6rem] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                        <Clock size={10} className="inline mr-1" />{sig.timeframe}
                      </span>
                    </div>
                    <p className="text-sm text-slate-400">{sig.reason}</p>
                    <div className="flex gap-4">
                      {[
                        { label: "Entry", value: `₹${sig.entry}`, color: "text-white" },
                        { label: "Target", value: `₹${sig.target}`, color: "text-emerald-400" },
                        { label: "Stop Loss", value: `₹${sig.sl}`, color: "text-red-400" },
                      ].map(p => (
                        <div key={p.label}>
                          <p className="text-[0.6rem] text-slate-600 uppercase tracking-widest font-semibold">{p.label}</p>
                          <p className={`text-sm font-bold ${p.color}`}>{p.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <div className="relative w-16 h-16">
                      <svg className="w-16 h-16 -rotate-90" viewBox="0 0 36 36">
                        <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="var(--input)" strokeWidth="3" />
                        <motion.path
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none" stroke={sig.confidence >= 80 ? "#10b981" : sig.confidence >= 60 ? "#f59e0b" : "#ef4444"}
                          strokeWidth="3" strokeLinecap="round"
                          initial={{ strokeDasharray: "0 100" }}
                          animate={{ strokeDasharray: `${sig.confidence} 100` }}
                          transition={{ duration: 1.5, ease: "easeOut" }}
                        />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-white">{sig.confidence}%</span>
                    </div>
                    <p className="text-[0.6rem] text-slate-500 font-semibold">Confidence</p>
                  </div>
                </div>
              </GlowCard>
            </motion.div>
          ))}
          {shown.length === 0 && (
            <GlowCard className="text-center py-8">
              <p className="text-sm text-muted-foreground">No {filter} signals right now.</p>
            </GlowCard>
          )}
        </div>
      </motion.div>
    </AppShell>
  );
}
