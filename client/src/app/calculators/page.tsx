"use client";

import { motion } from "framer-motion";
import { Calculator, TrendingUp, Banknote, Target, Percent, BarChart3, PiggyBank, ArrowRight } from "lucide-react";
import { GlowCard } from "@/components/premium/glow-card";
import { AppShell } from "@/components/layout/app-shell";
import Link from "next/link";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 20, filter: "blur(4px)" }, show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { type: "spring" as const, stiffness: 300, damping: 25 } } };

const calculators = [
  { name: "SIP Calculator", desc: "Calculate returns on systematic investment plans", icon: PiggyBank, color: "#10b981", href: "/calculators/sip" },
  { name: "Lumpsum Calculator", desc: "One-time investment growth projections", icon: Banknote, color: "#6366f1", href: "/calculators/lumpsum" },
  { name: "CAGR Calculator", desc: "Compound annual growth rate analysis", icon: TrendingUp, color: "#f59e0b", href: "/calculators/cagr" },
  { name: "EMI Calculator", desc: "Equated monthly installment planner", icon: Calculator, color: "#ef4444", href: "/calculators/emi" },
  { name: "Goal Planner", desc: "Plan for future financial goals", icon: Target, color: "#8b5cf6", href: "/calculators/goal" },
  { name: "Inflation Calculator", desc: "Understand purchasing power erosion", icon: Percent, color: "#06b6d4", href: "/calculators/inflation" },
  { name: "SWP Calculator", desc: "Systematic withdrawal plan analysis", icon: BarChart3, color: "#ec4899", href: "/calculators/swp" },
  { name: "Tax Calculator", desc: "Capital gains tax estimation (STCG/LTCG)", icon: Banknote, color: "#14b8a6", href: "/calculators/tax" },
];

export default function CalculatorsPage() {
  return (
    <AppShell>
      <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
        <motion.div variants={item}>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-3">
            <Calculator size={28} className="text-indigo-400" /> Financial Calculators
          </h1>
          <p className="text-sm text-slate-500 mt-1">Precision tools for smart financial planning</p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {calculators.map((calc, i) => (
            <motion.div key={calc.name} variants={item}>
              <Link href={calc.href}>
                <GlowCard glowColor={calc.color} className="group cursor-pointer h-full">
                  <div className="inline-flex p-2.5 rounded-xl mb-4" style={{ background: `${calc.color}15` }}>
                    <calc.icon size={22} style={{ color: calc.color }} />
                  </div>
                  <h3 className="text-sm font-bold text-white mb-1 group-hover:text-indigo-300 transition-colors">{calc.name}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{calc.desc}</p>
                  <div className="flex items-center gap-1 mt-3 text-xs font-semibold text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    Open <ArrowRight size={12} />
                  </div>
                </GlowCard>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </AppShell>
  );
}
