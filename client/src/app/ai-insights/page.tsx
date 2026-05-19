"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Brain, TrendingUp, TrendingDown, RefreshCw, Radio, ExternalLink, Zap } from "lucide-react";
import { GlowCard } from "@/components/premium/glow-card";
import { LivePulse } from "@/components/premium/animated-counter";
import { MagneticButton } from "@/components/premium/magnetic-button";
import { AppShell } from "@/components/layout/app-shell";
import { useState } from "react";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 20, filter: "blur(4px)" }, show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { type: "spring" as const, stiffness: 300, damping: 25 } } };

const news = [
  { id: 1, headline: "RBI holds repo rate at 6.5%, signals continued support for growth", sentiment: "Bullish", impact: 8.2, source: "ET Markets", time: "2m ago" },
  { id: 2, headline: "FII outflows reach ₹8,400 Cr in May — largest monthly exit in 6 months", sentiment: "Bearish", impact: 7.5, source: "MoneyControl", time: "12m ago" },
  { id: 3, headline: "Nifty IT index surges 3.2% as US tech spending outlook improves", sentiment: "Bullish", impact: 6.8, source: "LiveMint", time: "28m ago" },
  { id: 4, headline: "Auto sector under pressure as global chip shortage extends to Q3", sentiment: "Bearish", impact: 5.9, source: "Reuters", time: "1h ago" },
  { id: 5, headline: "Reliance Jio announces 5G rollout in 200 more cities by September", sentiment: "Bullish", impact: 7.1, source: "NDTV Profit", time: "1h ago" },
  { id: 6, headline: "Gold prices hit all-time high amid geopolitical tensions in Middle East", sentiment: "Bullish", impact: 6.2, source: "Bloomberg", time: "2h ago" },
  { id: 7, headline: "SEBI tightens F&O rules — lot sizes increased for select contracts", sentiment: "Bearish", impact: 8.0, source: "ET Markets", time: "3h ago" },
  { id: 8, headline: "Indian rupee strengthens to 82.5 against USD on strong GDP data", sentiment: "Bullish", impact: 5.4, source: "Mint", time: "4h ago" },
];

const sectors = [
  { name: "IT Sector", sentiment: "Bullish" }, { name: "Banking", sentiment: "Bullish" },
  { name: "Auto", sentiment: "Bearish" }, { name: "Pharma", sentiment: "Bullish" },
  { name: "Energy", sentiment: "Bearish" },
];

export default function AIInsightsPage() {
  const [loading, setLoading] = useState(false);
  const bullish = news.filter(n => n.sentiment === "Bullish").length;
  const overall = bullish >= news.length / 2 ? "Bullish" : "Bearish";

  return (
    <AppShell>
      <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
        <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-white flex items-center gap-3">
              <Brain size={28} className="text-purple-400" /> AI Insights & News
            </h1>
            <p className="text-sm text-slate-500 mt-1">Real-time intelligence powered by AI sentiment analysis</p>
          </div>
          <div className="flex gap-3 items-center">
            <LivePulse label={`${news.length} ARTICLES`} />
            <MagneticButton onClick={() => { setLoading(true); setTimeout(() => setLoading(false), 1000); }}
              className="bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700">
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
            </MagneticButton>
          </div>
        </motion.div>

        {/* Sentiment Overview */}
        <motion.div variants={item} className="grid grid-cols-2 md:grid-cols-6 gap-3">
          <GlowCard glowColor={overall === "Bullish" ? "#10b981" : "#ef4444"} className="col-span-2 md:col-span-2">
            <p className="text-[0.6rem] text-slate-500 uppercase tracking-widest font-semibold mb-2">Overall Market</p>
            <div className="flex items-center gap-2">
              {overall === "Bullish" ? <TrendingUp size={22} className="text-emerald-400" /> : <TrendingDown size={22} className="text-red-400" />}
              <span className={`text-xl font-black ${overall === "Bullish" ? "text-emerald-400" : "text-red-400"}`}>{overall}</span>
            </div>
            <p className="text-[0.65rem] text-slate-600 mt-1">{news.length} articles analyzed</p>
          </GlowCard>
          {sectors.map(s => (
            <GlowCard key={s.name} glowColor={s.sentiment === "Bullish" ? "#10b981" : "#ef4444"}>
              <p className="text-[0.6rem] text-slate-500 uppercase tracking-widest font-semibold mb-1.5">{s.name}</p>
              <div className="flex items-center gap-1.5">
                {s.sentiment === "Bullish" ? <TrendingUp size={15} className="text-emerald-400" /> : <TrendingDown size={15} className="text-red-400" />}
                <span className={`text-sm font-bold ${s.sentiment === "Bullish" ? "text-emerald-400" : "text-red-400"}`}>{s.sentiment}</span>
              </div>
            </GlowCard>
          ))}
        </motion.div>

        {/* News Feed */}
        <motion.div variants={item}>
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-lg font-bold text-white">Live News Feed</h2>
            <Radio size={14} className="text-purple-400" />
          </div>
          <div className="space-y-3">
            {news.map((n, i) => (
              <motion.div key={n.id}
                initial={{ opacity: 0, y: 15, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: i * 0.04, type: "spring" as const, stiffness: 300, damping: 25 }} layout>
                <GlowCard glowColor={n.sentiment === "Bullish" ? "#10b981" : "#ef4444"} className="p-4 cursor-pointer">
                  <p className="text-sm font-semibold text-slate-200 mb-2">{n.headline}</p>
                  <div className="flex flex-wrap items-center gap-3 text-xs">
                    <span className="font-semibold text-slate-500">{n.source}</span>
                    <span className="text-slate-600">{n.time}</span>
                    <span className={`font-bold px-2 py-0.5 rounded-full ${n.sentiment === "Bullish" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"}`}>{n.sentiment}</span>
                    <span className="flex items-center gap-1 text-purple-400 font-semibold px-2 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20">
                      <Zap size={10} /> {n.impact}
                    </span>
                  </div>
                </GlowCard>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </AppShell>
  );
}
