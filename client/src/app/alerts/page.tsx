"use client";

import { motion } from "framer-motion";
import { Bell, TrendingUp, TrendingDown, AlertTriangle, Plus, Trash2 } from "lucide-react";
import { GlowCard } from "@/components/premium/glow-card";
import { MagneticButton } from "@/components/premium/magnetic-button";
import { AppShell } from "@/components/layout/app-shell";
import { useState } from "react";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 20, filter: "blur(4px)" }, show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { type: "spring" as const, stiffness: 300, damping: 25 } } };

const initialAlerts = [
  { id: 1, symbol: "RELIANCE", condition: "Price above", value: 2900, current: 2847, triggered: false },
  { id: 2, symbol: "TCS", condition: "Price below", value: 3500, current: 3542, triggered: false },
  { id: 3, symbol: "NIFTY 50", condition: "Change > 2%", value: 2, current: 0.84, triggered: false },
  { id: 4, symbol: "HDFCBANK", condition: "Price above", value: 1600, current: 1623, triggered: true },
];

export default function AlertsPage() {
  const [alerts, setAlerts] = useState(initialAlerts);

  return (
    <AppShell>
      <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
        <motion.div variants={item} className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-extrabold text-white flex items-center gap-3">
              <Bell size={28} className="text-indigo-400" /> Price Alerts
            </h1>
            <p className="text-sm text-slate-500 mt-1">Get notified when stocks hit your target price</p>
          </div>
          <MagneticButton className="bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 hover:bg-indigo-500/25">
            <Plus size={16} /> New Alert
          </MagneticButton>
        </motion.div>

        <div className="space-y-3">
          {alerts.map((alert, i) => (
            <motion.div key={alert.id} variants={item}>
              <GlowCard glowColor={alert.triggered ? "#10b981" : "#6366f1"} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      alert.triggered ? "bg-emerald-500/15" : "bg-indigo-500/15"
                    }`}>
                      {alert.triggered ? <TrendingUp size={20} className="text-emerald-400" /> : <Bell size={20} className="text-indigo-400" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">{alert.symbol}</span>
                        {alert.triggered && (
                          <span className="text-[0.6rem] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                            TRIGGERED
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500">{alert.condition} ₹{alert.value.toLocaleString("en-IN")} · Current: ₹{alert.current.toLocaleString("en-IN")}</p>
                    </div>
                  </div>
                  <button onClick={() => setAlerts(a => a.filter(x => x.id !== alert.id))}
                    className="p-2 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              </GlowCard>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </AppShell>
  );
}
