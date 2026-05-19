"use client";

import { motion } from "framer-motion";
import { Activity, Search, Shield, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { GlowCard } from "@/components/premium/glow-card";
import { AppShell } from "@/components/layout/app-shell";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getOptionChain } from "@/lib/api";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 20, filter: "blur(4px)" }, show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { type: "spring" as const, stiffness: 300, damping: 25 } } };

export default function OptionsChainPage() {
  const [symbol, setSymbol] = useState("^NSEI");
  const [searchInput, setSearchInput] = useState("");

  const { data: chain, isLoading } = useQuery({
    queryKey: ["optionChain", symbol],
    queryFn: () => getOptionChain(symbol),
    refetchInterval: 30000, // Refresh every 30s
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setSymbol(searchInput.toUpperCase());
    }
  };

  const calls = chain?.calls || [];
  const puts = chain?.puts || [];
  const strikes = chain?.strikes || [];

  return (
    <AppShell>
      <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
        <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-white flex items-center gap-3">
              <Activity size={28} className="text-indigo-400" /> Options Chain
            </h1>
            <p className="text-sm text-slate-500 mt-1">Real-time options data from Yahoo Finance</p>
          </div>
          
          <form onSubmit={handleSearch} className="relative">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
            <input 
              value={searchInput} 
              onChange={e => setSearchInput(e.target.value)} 
              placeholder="Search symbol (e.g. ^NSEI, AAPL)"
              className="w-full sm:w-64 bg-slate-900 border border-slate-800 rounded-xl pl-11 pr-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:border-indigo-500/50 outline-none transition-all" 
            />
          </form>
        </motion.div>

        <motion.div variants={item} className="flex items-center gap-2 px-4 py-3 rounded-xl border border-indigo-500/20 bg-indigo-500/5 text-indigo-400 text-xs font-medium">
          <Shield size={14} /> Currently showing derivatives for {symbol}. Data updates every 30 seconds.
        </motion.div>

        {isLoading ? (
          <div className="h-64 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <motion.div variants={item}>
            <GlowCard glowColor="#6366f1" className="p-0 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left whitespace-nowrap">
                  <thead className="text-xs uppercase bg-slate-900/50 border-b border-slate-800">
                    <tr>
                      <th colSpan={4} className="px-6 py-4 text-center border-r border-slate-800 text-emerald-400 font-bold bg-emerald-500/5">CALLS</th>
                      <th className="px-6 py-4 text-center text-slate-400 font-black tracking-widest bg-slate-800/20">STRIKE</th>
                      <th colSpan={4} className="px-6 py-4 text-center border-l border-slate-800 text-red-400 font-bold bg-red-500/5">PUTS</th>
                    </tr>
                    <tr className="text-slate-500 font-semibold border-b border-slate-800">
                      <th className="px-4 py-3 text-right">OI</th>
                      <th className="px-4 py-3 text-right">Vol</th>
                      <th className="px-4 py-3 text-right">Chg</th>
                      <th className="px-4 py-3 text-right border-r border-slate-800">LTP</th>
                      
                      <th className="px-4 py-3 text-center bg-slate-800/20">PRICE</th>
                      
                      <th className="px-4 py-3 text-left border-l border-slate-800">LTP</th>
                      <th className="px-4 py-3 text-left">Chg</th>
                      <th className="px-4 py-3 text-left">Vol</th>
                      <th className="px-4 py-3 text-left">OI</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {strikes.slice(0, 30).map((strike: number) => {
                      const call = calls.find((c: any) => c.strike === strike);
                      const put = puts.find((p: any) => p.strike === strike);
                      
                      if (!call && !put) return null;
                      
                      return (
                        <tr key={strike} className="hover:bg-white/[0.02] transition-colors">
                          <td className="px-4 py-3 text-right text-slate-400">{call?.openInterest || '-'}</td>
                          <td className="px-4 py-3 text-right text-slate-400">{call?.volume || '-'}</td>
                          <td className={`px-4 py-3 text-right font-medium ${(call?.lastPrice || 0) > 0 ? "text-emerald-400" : "text-slate-500"}`}>
                            {call?.lastPrice || '-'}
                          </td>
                          <td className="px-4 py-3 text-right font-bold text-white border-r border-slate-800 bg-emerald-500/5">
                            {call?.lastPrice?.toFixed(2) || '-'}
                          </td>
                          
                          <td className="px-4 py-3 text-center font-black text-indigo-400 bg-slate-800/20">
                            {strike.toLocaleString()}
                          </td>
                          
                          <td className="px-4 py-3 text-left font-bold text-white border-l border-slate-800 bg-red-500/5">
                            {put?.lastPrice?.toFixed(2) || '-'}
                          </td>
                          <td className={`px-4 py-3 text-left font-medium ${(put?.lastPrice || 0) > 0 ? "text-red-400" : "text-slate-500"}`}>
                            {put?.lastPrice || '-'}
                          </td>
                          <td className="px-4 py-3 text-left text-slate-400">{put?.volume || '-'}</td>
                          <td className="px-4 py-3 text-left text-slate-400">{put?.openInterest || '-'}</td>
                        </tr>
                      );
                    })}
                    {strikes.length === 0 && (
                      <tr>
                        <td colSpan={9} className="px-6 py-12 text-center text-slate-500">
                          No option chain data available for this symbol.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </GlowCard>
          </motion.div>
        )}
      </motion.div>
    </AppShell>
  );
}
