"use client";

import { motion } from "framer-motion";
import { Settings, User, Palette, Bell, Shield, Database, Smartphone, Moon, Sun } from "lucide-react";
import { GlowCard } from "@/components/premium/glow-card";
import { AppShell } from "@/components/layout/app-shell";
import { useState } from "react";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 20, filter: "blur(4px)" }, show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { type: "spring" as const, stiffness: 300, damping: 25 } } };

function Toggle({ enabled, onChange }: { enabled: boolean; onChange: () => void }) {
  return (
    <button onClick={onChange} className={`relative w-11 h-6 rounded-full transition-colors ${enabled ? "bg-indigo-500" : "bg-slate-700"}`}>
      <motion.div animate={{ x: enabled ? 20 : 2 }} transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-md" />
    </button>
  );
}

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    notifications: true, biometric: false, darkMode: true,
    marketAlerts: true, aiInsights: true, dataSync: true,
  });

  const toggle = (key: keyof typeof settings) => setSettings(s => ({ ...s, [key]: !s[key] }));

  const sections = [
    {
      title: "Preferences", icon: Palette, color: "#6366f1",
      items: [
        { label: "Dark Mode", desc: "Use dark theme across the app", key: "darkMode" as const, icon: Moon },
        { label: "Market Alerts", desc: "Get notified on price movements", key: "marketAlerts" as const, icon: Bell },
        { label: "AI Insights", desc: "Receive AI-powered recommendations", key: "aiInsights" as const, icon: Bell },
      ]
    },
    {
      title: "Security", icon: Shield, color: "#10b981",
      items: [
        { label: "Biometric Lock", desc: "Require fingerprint/face to open app", key: "biometric" as const, icon: Smartphone },
        { label: "Push Notifications", desc: "Enable mobile push notifications", key: "notifications" as const, icon: Bell },
      ]
    },
    {
      title: "Data", icon: Database, color: "#f59e0b",
      items: [
        { label: "Auto Sync", desc: "Sync portfolio data in real-time", key: "dataSync" as const, icon: Database },
      ]
    },
  ];

  return (
    <AppShell>
      <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
        <motion.div variants={item}>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-3">
            <Settings size={28} className="text-indigo-400" /> Settings
          </h1>
          <p className="text-sm text-slate-500 mt-1">Configure your DhanSaathi experience</p>
        </motion.div>

        {/* Profile Card */}
        <motion.div variants={item}>
          <GlowCard glowColor="#6366f1" className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center text-white font-black text-xl">
              C
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Chatur</h3>
              <p className="text-sm text-slate-500">chatur@dhansaathi.com</p>
              <p className="text-xs text-indigo-400 font-semibold mt-0.5">Pro Member</p>
            </div>
          </GlowCard>
        </motion.div>

        {/* Settings Sections */}
        {sections.map(section => (
          <motion.div key={section.title} variants={item}>
            <GlowCard glowColor={section.color}>
              <div className="flex items-center gap-2 mb-4">
                <section.icon size={18} style={{ color: section.color }} />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">{section.title}</h3>
              </div>
              <div className="space-y-0.5">
                {section.items.map(s => (
                  <div key={s.key} className="flex items-center justify-between px-3 py-3 rounded-xl hover:bg-white/[0.02] transition-colors">
                    <div>
                      <p className="text-sm font-semibold text-slate-200">{s.label}</p>
                      <p className="text-xs text-slate-500">{s.desc}</p>
                    </div>
                    <Toggle enabled={settings[s.key]} onChange={() => toggle(s.key)} />
                  </div>
                ))}
              </div>
            </GlowCard>
          </motion.div>
        ))}

        {/* Tech Stack Badge */}
        <motion.div variants={item} className="text-center py-6">
          <p className="text-xs text-slate-600">
            DhanSaathi Enterprise v2.0 · Next.js 15 · Tailwind CSS · Shadcn UI · Prisma ORM · Framer Motion
          </p>
        </motion.div>
      </motion.div>
    </AppShell>
  );
}
