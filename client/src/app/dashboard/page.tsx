"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight, ArrowDownRight, Activity, Brain, TrendingUp, Wallet, Zap, BarChart3 } from "lucide-react";
import { TradingViewChart } from "@/components/premium/trading-view-chart";
import { GlowCard } from "@/components/premium/glow-card";
import { AnimatedCounter, LivePulse } from "@/components/premium/animated-counter";
import { AppShell } from "@/components/layout/app-shell";
import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getPortfolioSummary, getMarketIndices, getHistoricalData } from "@/lib/api";
import { io } from "socket.io-client";
import { WS_URL } from "@/lib/api-config";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.07 } } };
const item = { hidden: { opacity: 0, y: 20, filter: "blur(4px)" }, show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { type: "spring" as const, stiffness: 300, damping: 25 } } };

export default function DashboardPage() {
  const [niftyRealtime, setNiftyRealtime] = useState<{ price: number, change: number } | null>(null);
  const [range, setRange] = useState<"1D" | "1W" | "1M" | "1Y">("1M");
  const periodMap = { "1D": "1D", "1W": "5D", "1M": "1M", "1Y": "1Y" } as const;

  const { data: portfolio } = useQuery({
    queryKey: ["portfolioSummary"],
    queryFn: getPortfolioSummary,
    initialData: { totalValue: 1245820, totalInvested: 1000000, todaysPnl: 8420, overallPnl: 245820, overallPnlPercentage: 24.58 }
  });

  const { data: indices } = useQuery({
    queryKey: ["marketIndices"],
    queryFn: getMarketIndices,
    initialData: [
      { symbol: "RELIANCE", name: "Reliance Industries", price: 2847.50, change: 1.24 },
      { symbol: "TCS", name: "Tata Consultancy", price: 3542.80, change: -0.67 },
      { symbol: "HDFCBANK", name: "HDFC Bank Ltd", price: 1623.15, change: 0.89 },
      { symbol: "INFY", name: "Infosys Limited", price: 1456.30, change: 2.15 },
    ]
  });

  const { data: historical } = useQuery({
    queryKey: ["historical", "^NSEI", range],
    queryFn: () => getHistoricalData("^NSEI", periodMap[range]),
  });

  const chartData = useMemo(() => {
    if (historical && Array.isArray(historical) && historical.length > 0) {
      return historical.map((h: any) => ({
        time: h.time ? h.time : Math.floor(new Date(h.date).getTime() / 1000),
        value: h.close || h.price || h.value,
      })).sort((a: any, b: any) => a.time - b.time);
    }
    // Fallback static data if Yahoo Finance doesn't return anything
    const now = Math.floor(Date.now() / 1000);
    return Array.from({ length: 30 }, (_, i) => ({
      time: now - (30 - i) * 86400, 
      value: 22000 + Math.sin(i * 0.3) * 400 + Math.random() * 200
    }));
  }, [historical]);

  // Setup WebSocket connection to Real-time Express Engine
  useEffect(() => {
    const socket = io(WS_URL);
    socket.on("marketUpdate", (data: any) => {
      // Find NIFTY 50
      const nifty = data.find((d: any) => d.symbol === "^NSEI" || d.name === "NIFTY 50");
      if (nifty) {
        setNiftyRealtime({ price: nifty.price, change: nifty.change });
      }
    });
    return () => { socket.disconnect(); };
  }, []);

  const niftyPrice = niftyRealtime?.price || 22456.80;
  const niftyChange = niftyRealtime?.change || 187.45;
  const isUp = niftyChange >= 0;

  // Real AI News from DB would go here, fallback for UI
  const aiNews = [
    { id: 1, headline: "RBI holds repo rate at 6.5%, signals continued support for growth", sentiment: "Bullish", time: "2m ago" },
    { id: 2, headline: "FII outflows reach ₹8,400 Cr in May — largest monthly exit in 6 months", sentiment: "Bearish", time: "12m ago" },
    { id: 3, headline: "Nifty IT index surges 3.2% as US tech spending outlook improves", sentiment: "Bullish", time: "28m ago" },
    { id: 4, headline: "Auto sector under pressure as chip shortage extends to Q3", sentiment: "Bearish", time: "1h ago" },
  ];

  return (
    <AppShell>
      <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
        {/* Hero */}
        <motion.section variants={item} className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/30 p-6 md:p-8">
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <h2 className="text-sm font-semibold text-slate-400 tracking-wide uppercase">NIFTY 50</h2>
                <LivePulse />
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white">
                ₹<AnimatedCounter value={niftyPrice} decimals={2} />
              </h1>
              <div className={`flex items-center gap-1.5 text-sm font-semibold ${isUp ? "text-emerald-400" : "text-red-400"}`}>
                {isUp ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
                <span>₹{Math.abs(niftyChange).toFixed(2)} ({(niftyChange / niftyPrice * 100).toFixed(2)}%) Today</span>
              </div>
            </div>
            <div className="relative h-32 md:h-40 w-full md:w-[28rem] rounded-xl overflow-hidden border border-white/5 bg-black/20">
              <TradingViewChart
                data={chartData}
                liveValue={niftyRealtime?.price ?? null}
                up={isUp}
              />
              <div className="absolute bottom-2 right-2 z-10 flex gap-0.5 p-0.5 rounded-lg bg-black/50 backdrop-blur border border-white/10">
                {(["1D", "1W", "1M", "1Y"] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => setRange(r)}
                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all ${
                      range === r ? "bg-primary/20 text-primary" : "text-slate-500 hover:text-slate-300"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.section>

        {/* Stats Grid */}
        <motion.div variants={item} className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Portfolio Value", value: `₹${portfolio.totalValue.toLocaleString("en-IN")}`, icon: Wallet, color: "text-indigo-400", bg: "bg-indigo-500/10" },
            { label: "Day P&L", value: `+₹${portfolio.todaysPnl.toLocaleString("en-IN")}`, icon: TrendingUp, color: "text-emerald-400", bg: "bg-emerald-500/10" },
            { label: "Total Returns", value: `+${portfolio.overallPnlPercentage}%`, icon: BarChart3, color: "text-cyan-400", bg: "bg-cyan-500/10" },
            { label: "AI Score", value: "87/100", icon: Zap, color: "text-amber-400", bg: "bg-amber-500/10" },
          ].map((s, i) => (
            <GlowCard key={i} glowColor={s.color.includes("indigo") ? "#6366f1" : s.color.includes("emerald") ? "#10b981" : s.color.includes("cyan") ? "#06b6d4" : "#f59e0b"}>
              <div className={`inline-flex p-2 rounded-lg ${s.bg} mb-3`}>
                <s.icon size={18} className={s.color} />
              </div>
              <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">{s.label}</p>
              <p className="text-xl font-bold text-white mt-0.5">{s.value}</p>
            </GlowCard>
          ))}
        </motion.div>

        {/* AI News Ticker */}
        <motion.div
          variants={item}
          className="flex items-center gap-3 px-4 py-3 rounded-2xl border border-purple-500/20 bg-purple-500/5"
        >
          <div className="flex items-center gap-2 shrink-0">
            <Brain size={16} className="text-purple-400" />
            <span className="text-[0.65rem] font-bold text-purple-400 tracking-widest">AI INSIGHT</span>
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={aiNews[0].id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center gap-3 min-w-0 flex-1"
            >
              <span className="text-sm text-slate-300 truncate">{aiNews[0].headline}</span>
              <span className={`shrink-0 text-[0.65rem] font-bold px-2 py-0.5 rounded-full ${
                aiNews[0].sentiment === "Bullish" ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30" : "bg-red-500/15 text-red-400 border border-red-500/30"
              }`}>
                {aiNews[0].sentiment}
              </span>
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* Two Column */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Market Watch */}
          <motion.div variants={item}>
            <GlowCard glowColor="#6366f1">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-base font-bold text-white">Market Watch</h3>
                <LivePulse />
              </div>
              <div className="space-y-1">
                {indices.map((stock: any, i: number) => (
                  <motion.div
                    key={stock.symbol}
                    initial={{ opacity: 0, x: -15 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06, type: "spring" as const, stiffness: 300, damping: 25 }}
                  >
                    <Link href="/live-markets"
                      className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-white/[0.02] transition-colors cursor-pointer group"
                    >
                    <div>
                      <p className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">{stock.symbol}</p>
                      <p className="text-xs text-slate-500">{stock.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-white">₹{stock.price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</p>
                      <p className={`text-xs font-semibold ${stock.change > 0 ? "text-emerald-400" : "text-red-400"}`}>
                        {stock.change > 0 ? "+" : ""}{stock.change}%
                      </p>
                    </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </GlowCard>
          </motion.div>

          {/* AI News */}
          <motion.div variants={item}>
            <GlowCard glowColor="#a855f7" className="bg-gradient-to-br from-slate-900 to-purple-950/20">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-white">AI News Feed</h3>
                  <Brain size={16} className="text-purple-400" />
                </div>
                <span className="text-[0.65rem] font-bold px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-400 border border-purple-500/30">REAL-TIME</span>
              </div>
              <div className="space-y-3">
                {aiNews.map((news, i) => (
                  <motion.div
                    key={news.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08, type: "spring" as const, stiffness: 300, damping: 25 }}
                  >
                    <Link href="/ai-insights"
                      className="block p-3 rounded-xl bg-white/[0.02] border border-slate-800 hover:border-slate-700 transition-colors cursor-pointer"
                    >
                    <p className="text-sm font-semibold text-slate-200 mb-1.5">{news.headline}</p>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="text-slate-500">{news.time}</span>
                      <span className={`font-bold px-2 py-0.5 rounded-full ${
                        news.sentiment === "Bullish" ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
                      }`}>
                        {news.sentiment}
                      </span>
                    </div>
                    </Link>
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
