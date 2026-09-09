"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Bell, TrendingUp, Plus, Trash2, X } from "lucide-react";
import { GlowCard } from "@/components/premium/glow-card";
import { MagneticButton } from "@/components/premium/magnetic-button";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { useLocalStorage } from "@/lib/store";
import { useState } from "react";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.25 } } };

type Alert = { id: number; symbol: string; condition: string; value: number; current: number; triggered: boolean };

const initialAlerts: Alert[] = [
  { id: 1, symbol: "RELIANCE", condition: "Price above", value: 2900, current: 2847, triggered: false },
  { id: 2, symbol: "TCS", condition: "Price below", value: 3500, current: 3542, triggered: false },
  { id: 3, symbol: "NIFTY 50", condition: "Change > 2%", value: 2, current: 0.84, triggered: false },
  { id: 4, symbol: "HDFCBANK", condition: "Price above", value: 1600, current: 1623, triggered: true },
];

const CONDITIONS = ["Price above", "Price below", "Change > 2%", "Change < -2%"];

export default function AlertsPage() {
  const [alerts, setAlerts] = useLocalStorage<Alert[]>("ds-alerts", initialAlerts);
  const [showForm, setShowForm] = useState(false);
  const [symbol, setSymbol] = useState("");
  const [condition, setCondition] = useState(CONDITIONS[0]);
  const [value, setValue] = useState("");

  const addAlert = () => {
    const sym = symbol.trim().toUpperCase();
    const num = parseFloat(value);
    if (!sym || Number.isNaN(num)) return;
    setAlerts((a) => [
      ...a,
      { id: Date.now(), symbol: sym, condition, value: num, current: num, triggered: false },
    ]);
    setSymbol(""); setValue(""); setCondition(CONDITIONS[0]); setShowForm(false);
  };

  return (
    <AppShell>
      <motion.div variants={container} initial="hidden" animate="show" className="space-y-5">
        <motion.div variants={item}>
          <PageHeader
            icon={Bell} eyebrow="Notifications" title="Price Alerts"
            subtitle={alerts.length === 0 ? "No alerts yet — create your first one" : `${alerts.filter(a => !a.triggered).length} watching · ${alerts.filter(a => a.triggered).length} triggered`}
            right={
              <MagneticButton
                onClick={() => setShowForm((s) => !s)}
                className="bg-primary/10 text-primary border border-primary/25 hover:bg-primary/20 !px-4 !py-2"
              >
                {showForm ? <X size={15} /> : <Plus size={15} />} {showForm ? "Close" : "New Alert"}
              </MagneticButton>
            }
          />
        </motion.div>

        <AnimatePresence>
          {showForm && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.25 }}>
              <GlowCard className="p-5">
                <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_1fr_auto] gap-3">
                  <div>
                    <label className="eyebrow block mb-1.5">Symbol</label>
                    <input value={symbol} onChange={(e) => setSymbol(e.target.value)} placeholder="e.g. RELIANCE"
                      className="w-full bg-accent/60 border border-border rounded-xl px-3.5 py-2.5 text-sm placeholder:text-muted-foreground/60 focus:border-primary/50 outline-none transition-colors" />
                  </div>
                  <div>
                    <label className="eyebrow block mb-1.5">Condition</label>
                    <div className="flex gap-1.5">
                      {CONDITIONS.map((c) => (
                        <button key={c} onClick={() => setCondition(c)}
                          className={`flex-1 px-2 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
                            condition === c ? "bg-primary/10 text-primary border-primary/30" : "text-muted-foreground border-border hover:bg-accent"
                          }`}>
                          {c.replace("Price ", "")}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="eyebrow block mb-1.5">Target (₹)</label>
                    <input type="number" value={value} onChange={(e) => setValue(e.target.value)} placeholder="2900"
                      className="w-full bg-accent/60 border border-border rounded-xl px-3.5 py-2.5 text-sm placeholder:text-muted-foreground/60 focus:border-primary/50 outline-none transition-colors" />
                  </div>
                  <div className="flex items-end">
                    <MagneticButton onClick={addAlert} className="bg-primary text-primary-foreground hover:opacity-90 !px-5 !py-2.5 w-full sm:w-auto">
                      <Plus size={15} /> Add
                    </MagneticButton>
                  </div>
                </div>
              </GlowCard>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-2.5">
          {alerts.length === 0 && (
            <GlowCard className="text-center py-10">
              <Bell size={22} className="mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">You&apos;re all caught up. New alerts will appear here.</p>
            </GlowCard>
          )}
          <AnimatePresence initial={false}>
            {alerts.map((alert) => (
              <motion.div key={alert.id} variants={item} layout
                initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }}>
                <GlowCard className="!p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3.5">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        alert.triggered ? "bg-emerald-500/10" : "bg-primary/10"
                      }`}>
                        {alert.triggered ? <TrendingUp size={18} className="text-emerald-500" /> : <Bell size={18} className="text-primary" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold">{alert.symbol}</span>
                          {alert.triggered && (
                            <span className="text-[0.6rem] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/25">
                              TRIGGERED
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{alert.condition} ₹{alert.value.toLocaleString("en-IN")}</p>
                      </div>
                    </div>
                    <button onClick={() => setAlerts((a) => a.filter((x) => x.id !== alert.id))} aria-label={`Delete ${alert.symbol} alert`}
                      className="p-2 rounded-lg text-muted-foreground/60 hover:text-red-400 hover:bg-red-500/10 transition-colors">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </GlowCard>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </motion.div>
    </AppShell>
  );
}
