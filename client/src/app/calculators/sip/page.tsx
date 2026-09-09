"use client";

import { motion } from "framer-motion";
import { Calculator, ArrowLeft } from "lucide-react";
import { GlowCard } from "@/components/premium/glow-card";
import { AnimatedCounter } from "@/components/premium/animated-counter";
import { MagneticButton } from "@/components/premium/magnetic-button";
import { AppShell } from "@/components/layout/app-shell";
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import Link from "next/link";
import { useState, useMemo } from "react";

const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 25 } } };

export default function SIPCalculatorPage() {
  const [monthly, setMonthly] = useState(10000);
  const [rate, setRate] = useState(12);
  const [years, setYears] = useState(10);

  const result = useMemo(() => {
    const months = years * 12;
    const r = rate / 100 / 12;
    const fv = monthly * ((Math.pow(1 + r, months) - 1) / r) * (1 + r);
    const invested = monthly * months;
    const chartData = [];
    let running = 0;
    for (let y = 1; y <= years; y++) {
      const m = y * 12;
      running = monthly * ((Math.pow(1 + r, m) - 1) / r) * (1 + r);
      chartData.push({ year: `Y${y}`, invested: monthly * m, value: Math.round(running) });
    }
    return { futureValue: fv, invested, wealth: fv - invested, chartData };
  }, [monthly, rate, years]);

  return (
    <AppShell>
      <motion.div initial="hidden" animate="show" variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.07 } } }} className="space-y-6">
        <motion.div variants={item} className="flex items-center gap-3">
          <Link href="/calculators" className="p-2 rounded-xl border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-2xl font-extrabold text-white">SIP Calculator</h1>
            <p className="text-sm text-slate-500">Systematic Investment Plan Growth Projections</p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Controls */}
          <motion.div variants={item}>
            <GlowCard glowColor="#10b981" className="space-y-6">
              {[
                { label: "Monthly Investment (₹)", value: monthly, set: setMonthly, min: 500, max: 500000, step: 500, prefix: "₹" },
                { label: "Expected Return (%)", value: rate, set: setRate, min: 1, max: 30, step: 0.5, suffix: "%" },
                { label: "Time Period (Years)", value: years, set: setYears, min: 1, max: 40, step: 1, suffix: " yrs" },
              ].map(s => (
                <div key={s.label}>
                  <div className="flex justify-between mb-2">
                    <label className="text-xs text-slate-500 font-semibold uppercase tracking-wider">{s.label}</label>
                    <span className="text-sm font-bold text-indigo-400">{s.prefix || ""}{s.value.toLocaleString("en-IN")}{s.suffix || ""}</span>
                  </div>
                  <input type="range" min={s.min} max={s.max} step={s.step} value={s.value}
                    onChange={e => s.set(Number(e.target.value))}
                    className="w-full h-1.5 rounded-full appearance-none bg-slate-800 accent-indigo-500 cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-indigo-500 [&::-webkit-slider-thumb]:shadow-[0_0_8px_rgba(99,102,241,0.4)]" />
                </div>
              ))}

              <div className="grid grid-cols-3 gap-3 pt-2">
                {[
                  { label: "Invested", value: result.invested, color: "text-slate-300" },
                  { label: "Wealth Gained", value: result.wealth, color: "text-emerald-400" },
                  { label: "Total Value", value: result.futureValue, color: "text-indigo-400" },
                ].map(r => (
                  <div key={r.label} className="text-center p-3 rounded-xl bg-white/[0.02] border border-slate-800">
                    <p className="text-[0.6rem] text-slate-500 uppercase tracking-widest font-semibold">{r.label}</p>
                    <p className={`text-base font-bold mt-1 ${r.color}`}>
                      ₹<AnimatedCounter value={r.value} decimals={0} />
                    </p>
                  </div>
                ))}
              </div>
            </GlowCard>
          </motion.div>

          {/* Chart */}
          <motion.div variants={item}>
            <GlowCard glowColor="#6366f1">
              <h3 className="font-bold text-white mb-4">Growth Projection</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={result.chartData}>
                    <defs>
                      <linearGradient id="sipInv" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#6366f1" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="sipVal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="year" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v / 100000).toFixed(0)}L`} />
                    <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", color: "#fff" }}
                      formatter={(v: any) => [`₹${Number(v).toLocaleString("en-IN")}`, ""]} />
                    <Area type="monotone" dataKey="invested" stroke="#6366f1" strokeWidth={2} fill="url(#sipInv)" name="Invested" />
                    <Area type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} fill="url(#sipVal)" name="Value" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </GlowCard>
          </motion.div>
        </div>
      </motion.div>
    </AppShell>
  );
}
