"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard, Briefcase, Brain, BarChart3, Calculator,
  GraduationCap, Settings, TrendingUp, Bell, ChevronLeft, ChevronRight, Activity, Radio
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/portfolio", label: "Portfolio", icon: Briefcase },
  { href: "/markets", label: "Markets", icon: BarChart3 },
  { href: "/live-markets", label: "Live", icon: Radio },
  { href: "/ai-insights", label: "AI Insights", icon: Brain },
  { href: "/trade-signals", label: "Signals", icon: TrendingUp },
  { href: "/options", label: "Options", icon: Activity },
  { href: "/calculators", label: "Calculators", icon: Calculator },
  { href: "/academy", label: "Academy", icon: GraduationCap },
  { href: "/alerts", label: "Alerts", icon: Bell },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <motion.aside
      animate={{ width: collapsed ? 76 : 248 }}
      transition={{ type: "spring", stiffness: 320, damping: 32 }}
      className="hidden lg:flex flex-col fixed left-0 top-0 bottom-0 z-40 border-r border-border bg-sidebar/90 backdrop-blur-xl"
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 h-16 border-b border-border">
        <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-semibold text-[15px] shrink-0">
          ₹
        </div>
        {!collapsed && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-[17px] font-semibold tracking-tight"
          >
            DhanSaathi
          </motion.span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 px-3 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-xl text-[13.5px] font-medium transition-colors relative",
                active
                  ? "text-foreground bg-accent"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/60"
              )}
            >
              {active && (
                <motion.div
                  layoutId="sidebar-active-pill"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-full bg-primary"
                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
                />
              )}
              <item.icon size={18} strokeWidth={active ? 2.2 : 1.8} className={cn("shrink-0", active && "text-primary")} />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        className="mx-3 mb-4 p-2 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:bg-accent transition-colors flex items-center justify-center"
      >
        {collapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
      </button>
    </motion.aside>
  );
}

export function BottomNav() {
  const pathname = usePathname();
  const mobileItems = navItems.slice(0, 5);

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-sidebar/95 backdrop-blur-xl">
      <div className="flex items-center justify-around h-[68px] px-2 pb-[env(safe-area-inset-bottom)]">
        {mobileItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl text-[11px] transition-colors relative",
                active ? "text-primary font-semibold" : "text-muted-foreground"
              )}
            >
              {active && (
                <motion.div
                  layoutId="bottom-active"
                  className="absolute -top-[9px] w-8 h-[3px] rounded-full bg-primary"
                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
                />
              )}
              <item.icon size={20} strokeWidth={active ? 2.2 : 1.8} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
