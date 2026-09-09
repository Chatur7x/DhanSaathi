"use client";

import { motion } from "framer-motion";
import { Settings, Palette, Bell, Shield, Database, Moon } from "lucide-react";
import { GlowCard } from "@/components/premium/glow-card";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { useLocalStorage } from "@/lib/store";
import { useTheme } from "next-themes";
import { useEffect } from "react";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.25 } } };

function Toggle({ enabled, onChange, label }: { enabled: boolean; onChange: () => void; label: string }) {
  return (
    <button onClick={onChange} role="switch" aria-checked={enabled} aria-label={label}
      className={`relative w-11 h-[26px] rounded-full transition-colors duration-200 shrink-0 ${enabled ? "bg-primary" : "bg-input"}`}>
      <motion.div animate={{ x: enabled ? 20 : 3 }} transition={{ type: "spring", stiffness: 500, damping: 32 }}
        className="absolute top-[3px] w-5 h-5 rounded-full bg-white shadow" />
    </button>
  );
}

type SettingsState = {
  notifications: boolean; biometric: boolean; midnight: boolean;
  marketAlerts: boolean; aiInsights: boolean; dataSync: boolean;
};

const DEFAULTS: SettingsState = {
  notifications: true, biometric: false, midnight: false,
  marketAlerts: true, aiInsights: true, dataSync: true,
};

export default function SettingsPage() {
  const [settings, setSettings] = useLocalStorage<SettingsState>("ds-settings", DEFAULTS);
  const { setTheme } = useTheme();

  // Midnight = true OLED black variant layered over the warm dark theme.
  useEffect(() => {
    setTheme("dark");
    document.documentElement.classList.toggle("midnight", settings.midnight);
  }, [settings.midnight, setTheme]);

  const toggle = (key: keyof SettingsState) => setSettings((s) => ({ ...s, [key]: !s[key] }));

  const sections = [
    {
      title: "Appearance", icon: Palette,
      items: [
        { label: "Midnight Black", desc: "True-black background for OLED screens", key: "midnight" as const },
        { label: "Market Alerts", desc: "Get notified on price movements", key: "marketAlerts" as const },
        { label: "AI Insights", desc: "Receive AI-powered recommendations", key: "aiInsights" as const },
      ]
    },
    {
      title: "Security", icon: Shield,
      items: [
        { label: "Biometric Lock", desc: "Require fingerprint or face to open app", key: "biometric" as const },
        { label: "Push Notifications", desc: "Enable mobile push notifications", key: "notifications" as const },
      ]
    },
    {
      title: "Data", icon: Database,
      items: [
        { label: "Auto Sync", desc: "Sync portfolio data in real time", key: "dataSync" as const },
      ]
    },
  ];

  return (
    <AppShell>
      <motion.div variants={container} initial="hidden" animate="show" className="space-y-5">
        <motion.div variants={item}>
          <PageHeader icon={Settings} eyebrow="System" title="Settings" subtitle="Saved automatically on this device" />
        </motion.div>

        <motion.div variants={item}>
          <GlowCard className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground font-semibold text-lg">
              C
            </div>
            <div>
              <h3 className="text-[15px] font-semibold">Chatur</h3>
              <p className="text-[13px] text-muted-foreground">chatur@dhansaathi.com</p>
              <p className="text-xs text-primary font-semibold mt-0.5">Pro Member</p>
            </div>
          </GlowCard>
        </motion.div>

        {sections.map((section) => (
          <motion.div key={section.title} variants={item}>
            <GlowCard>
              <div className="flex items-center gap-2 mb-3">
                <section.icon size={16} className="text-primary" />
                <h3 className="eyebrow !text-muted-foreground">{section.title}</h3>
              </div>
              <div>
                {section.items.map((s) => (
                  <div key={s.key} className="flex items-center justify-between gap-4 px-2 py-3 rounded-xl hover:bg-accent/50 transition-colors">
                    <div className="flex items-center gap-3">
                      {s.key === "midnight" && <Moon size={15} className="text-muted-foreground shrink-0" />}
                      {(s.key === "marketAlerts" || s.key === "notifications") && <Bell size={15} className="text-muted-foreground shrink-0" />}
                      <div>
                        <p className="text-sm font-medium">{s.label}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{s.desc}</p>
                      </div>
                    </div>
                    <Toggle enabled={settings[s.key]} onChange={() => toggle(s.key)} label={s.label} />
                  </div>
                ))}
              </div>
            </GlowCard>
          </motion.div>
        ))}

        <motion.div variants={item} className="text-center py-4">
          <p className="text-xs text-muted-foreground/70">DhanSaathi v2.0 · Not SEBI registered — for education only</p>
        </motion.div>
      </motion.div>
    </AppShell>
  );
}
