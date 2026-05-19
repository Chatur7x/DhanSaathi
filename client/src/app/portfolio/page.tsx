"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Wallet, TrendingUp, BarChart3, ArrowUpRight, ShoppingCart, Plus, X, DollarSign } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { GlowCard } from "@/components/premium/glow-card";
import { AnimatedCounter, LivePulse } from "@/components/premium/animated-counter";
import { MagneticButton } from "@/components/premium/magnetic-button";
import { AppShell } from "@/components/layout/app-shell";
import { useState } from "react";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.07 } } };
const item = { hidden: { opacity: 0, y: 20, filter: "blur(4px)" }, show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { type: "spring" as const, stiffness: 300, damping: 25 } } };

const holdings = [
  { symbol: "RELIANCE", qty: 15, buyPrice: 2450, currentPrice: 2847.50, type: "Equity" },
  { symbol: "TCS", qty: 8, buyPrice: 3200, currentPrice: 3542.80, type: "Equity" },
  { symbol: "HDFCBANK", qty: 20, buyPrice: 1520, currentPrice: 1623.15, type: "Equity" },
  { symbol: "INFY", qty: 25, buyPrice: 1280, currentPrice: 1456.30, type: "IT" },
  { symbol: "SBI ETF", qty: 100, buyPrice: 580, currentPrice: 612.40, type: "ETF" },
];

const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#8b5cf6", "#ef4444", "#06b6d4"];

export default function PortfolioPage() {
  const [activeTab, setActiveTab] = useState<"holdings" | "allocation" | "trade">("holdings");
  const [tradeForm, setTradeForm] = useState({ symbol: "", quantity: "", price: "", type: "BUY" as "BUY" | "SELL" });
  const [showToast, setShowToast] = useState(false);

  const totalInvested = holdings.reduce((s, h) => s + h.qty * h.buyPrice, 0);
  const totalCurrent = holdings.reduce((s, h) => s + h.qty * h.currentPrice, 0);
  const totalReturns = totalCurrent - totalInvested;
  const xirr = (totalReturns / totalInvested) * 100;

  const pieData = holdings.reduce((acc, h) => {
    const found = acc.find(a => a.name === h.type);
    if (found) found.value += h.qty * h.currentPrice;
    else acc.push({ name: h.type, value: h.qty * h.currentPrice });
    return acc;
  }, [] as { name: string; value: number }[]);

  const handleTrade = () => {
    if (!tradeForm.symbol || !tradeForm.quantity || !tradeForm.price) return;
    setTradeForm({ symbol: "", quantity: "", price: "", type: "BUY" });
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  return (
    <AppShell>
      <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
        <motion.div variants={item} className="flex justify-between items-center">
          <h1 className="text-2xl font-extrabold text-white">Portfolio Tracker</h1>
          <LivePulse label="SYNCED" />
        </motion.div>

        {/* Toast */}
        <AnimatePresence>
          {showToast && (
            <motion.div initial={{ opacity: 0, y: -15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }}
              className="flex items-center gap-2 px-4 py-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 font-semibold text-sm"
            >
              <ArrowUpRight size={16} /> Trade executed successfully!
            </motion.div>
          )}
        </AnimatePresence>

        {/* Summary Cards */}
        <motion.div variants={item} className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Invested", value: totalInvested, icon: Wallet, color: "#6366f1" },
            { label: "Current", value: totalCurrent, icon: BarChart3, color: "#10b981" },
            { label: "Returns", value: totalReturns, icon: TrendingUp, color: totalReturns >= 0 ? "#10b981" : "#ef4444" },
            { label: "XIRR", value: xirr, icon: ArrowUpRight, color: "#f59e0b", suffix: "%" },
          ].map((card, i) => (
            <GlowCard key={i} glowColor={card.color}>
              <card.icon size={20} style={{ color: card.color }} />
              <p className="text-[0.65rem] text-slate-500 uppercase tracking-wider font-semibold mt-2">{card.label}</p>
              <p className="text-lg font-bold text-white mt-0.5">
                <AnimatedCounter value={card.value} prefix={card.suffix ? "" : "₹"} suffix={card.suffix || ""} decimals={card.suffix ? 1 : 0} />
              </p>
            </GlowCard>
          ))}
        </motion.div>

        {/* Tabs */}
        <motion.div variants={item} className="flex gap-1 p-1 rounded-xl bg-slate-900 border border-slate-800">
          {([
            { key: "holdings", label: "Holdings", icon: BarChart3 },
            { key: "allocation", label: "Allocation", icon: Wallet },
            { key: "trade", label: "Trade", icon: ShoppingCart },
          ] as const).map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.key ? "bg-indigo-500/15 text-indigo-400 border border-indigo-500/30" : "text-slate-500 hover:text-slate-300"
              }`}
            >
              <tab.icon size={15} /> {tab.label}
            </button>
          ))}
        </motion.div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === "holdings" && (
            <motion.div key="hold" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }}
              transition={{ type: "spring" as const, stiffness: 300, damping: 25 }}>
              <GlowCard glowColor="#6366f1" className="p-4">
                <h3 className="font-bold text-white mb-4">Holdings ({holdings.length})</h3>
                <div className="space-y-0.5">
                  {holdings.map((h, i) => {
                    const pnl = (h.currentPrice - h.buyPrice) * h.qty;
                    const pnlPct = ((h.currentPrice - h.buyPrice) / h.buyPrice) * 100;
                    return (
                      <motion.div key={h.symbol}
                        initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05, type: "spring" as const, stiffness: 300, damping: 25 }}
                        className="flex justify-between items-center px-3 py-3 rounded-xl hover:bg-white/[0.02] transition-colors"
                      >
                        <div>
                          <p className="text-sm font-bold text-white">{h.symbol}</p>
                          <p className="text-xs text-slate-500">{h.qty} units @ ₹{h.buyPrice.toLocaleString("en-IN")}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-white">₹{(h.qty * h.currentPrice).toLocaleString("en-IN")}</p>
                          <p className={`text-xs font-semibold ${pnl >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                            {pnl >= 0 ? "+" : ""}₹{pnl.toLocaleString("en-IN")} ({pnlPct.toFixed(1)}%)
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </GlowCard>
            </motion.div>
          )}

          {activeTab === "allocation" && (
            <motion.div key="alloc" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }}
              transition={{ type: "spring" as const, stiffness: 300, damping: 25 }}>
              <GlowCard glowColor="#f59e0b">
                <h3 className="font-bold text-white mb-4">Asset Allocation</h3>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" outerRadius={100} innerRadius={60} dataKey="value"
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}>
                        {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip formatter={(v: number) => `₹${v.toLocaleString("en-IN")}`}
                        contentStyle={{ background: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", color: "#fff" }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </GlowCard>
            </motion.div>
          )}

          {activeTab === "trade" && (
            <motion.div key="trade" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }}
              transition={{ type: "spring" as const, stiffness: 300, damping: 25 }}>
              <GlowCard glowColor={tradeForm.type === "BUY" ? "#10b981" : "#ef4444"} className="p-6">
                <h3 className="font-bold text-white mb-5">Execute Trade</h3>
                <div className="flex gap-2 mb-5">
                  {(["BUY", "SELL"] as const).map(t => (
                    <button key={t} onClick={() => setTradeForm(f => ({ ...f, type: t }))}
                      className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-all ${
                        tradeForm.type === t
                          ? t === "BUY" ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30" : "bg-red-500/15 text-red-400 border border-red-500/30"
                          : "bg-slate-800/50 text-slate-500 border border-slate-800"
                      }`}>
                      {t === "BUY" ? <Plus size={14} className="inline mr-1" /> : <X size={14} className="inline mr-1" />}{t}
                    </button>
                  ))}
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1.5 block">Symbol</label>
                    <input value={tradeForm.symbol} onChange={e => setTradeForm(f => ({ ...f, symbol: e.target.value }))}
                      placeholder="e.g. RELIANCE" className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm placeholder:text-slate-600 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 outline-none transition-all" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1.5 block">Quantity</label>
                      <input type="number" value={tradeForm.quantity} onChange={e => setTradeForm(f => ({ ...f, quantity: e.target.value }))}
                        placeholder="10" className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm placeholder:text-slate-600 focus:border-indigo-500/50 outline-none transition-all" />
                    </div>
                    <div>
                      <label className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1.5 block">Price (₹)</label>
                      <input type="number" value={tradeForm.price} onChange={e => setTradeForm(f => ({ ...f, price: e.target.value }))}
                        placeholder="2450.00" className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm placeholder:text-slate-600 focus:border-indigo-500/50 outline-none transition-all" />
                    </div>
                  </div>
                  {tradeForm.quantity && tradeForm.price && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                      className="flex justify-between px-4 py-3 rounded-xl bg-white/[0.02] border border-slate-800">
                      <span className="text-sm text-slate-400">Total Value</span>
                      <span className="text-base font-bold text-white">₹{(parseFloat(tradeForm.quantity) * parseFloat(tradeForm.price)).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                    </motion.div>
                  )}
                  <MagneticButton onClick={handleTrade}
                    className={`w-full py-3.5 text-base ${tradeForm.type === "BUY" ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25" : "bg-red-500/15 text-red-400 border border-red-500/30 hover:bg-red-500/25"}`}>
                    <DollarSign size={18} /> Execute {tradeForm.type} Order
                  </MagneticButton>
                </div>
              </GlowCard>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AppShell>
  );
}
