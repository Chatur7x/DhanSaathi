"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  Activity,
  ArrowRight,
  BarChart3,
  Brain,
  Calculator,
  CandlestickChart,
  Gauge,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { HeroVisual } from "@/components/landing/hero-visual";
import { Tape } from "@/components/landing/tape";
import { TiltCard } from "@/components/premium/tilt-card";
import { GlowCard } from "@/components/premium/glow-card";

function Reveal({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

const FEATURES = [
  {
    href: "/live-markets",
    icon: Activity,
    title: "Live market ticks",
    body: "NIFTY to Bitcoin, streaming over sockets with stale-data honesty built in.",
    span: false,
    visual: (
      <div className="mt-4 flex items-end gap-1.5" aria-hidden>
        {[38, 52, 44, 66, 58, 78, 70, 92].map((h, i) => (
          <motion.span
            key={i}
            initial={{ height: 4 }}
            whileInView={{ height: h }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 + i * 0.05, type: "spring", stiffness: 200, damping: 20 }}
            className="w-full rounded-full bg-primary/70"
            style={{ maxWidth: 22 }}
          />
        ))}
      </div>
    ),
  },
  {
    href: "/trade-signals",
    icon: Gauge,
    title: "SKORE you can audit",
    body: "Every score shows its math. Momentum, trend, stability, accumulation.",
    span: false,
    visual: (
      <div className="relative mx-auto mt-4 h-20 w-20" aria-hidden>
        <svg viewBox="0 0 36 36" className="h-20 w-20 -rotate-90">
          <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="var(--input)" strokeWidth="3" />
          <motion.path
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none" stroke="#d97757" strokeWidth="3" strokeLinecap="round"
            initial={{ strokeDasharray: "0 100" }}
            whileInView={{ strokeDasharray: "78 100" }}
            viewport={{ once: true }}
            transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-sm font-bold">78</span>
      </div>
    ),
  },
  {
    href: "/dashboard",
    icon: CandlestickChart,
    title: "Beast-mode charts",
    body: "Candles and curves that stream live ticks into the last bar.",
    span: false,
    visual: (
      <svg viewBox="0 0 200 56" className="mt-4 h-14 w-full" aria-hidden>
        <motion.path
          d="M4,44 C30,40 44,26 70,30 C96,34 110,16 136,20 C162,24 176,10 196,12"
          fill="none" stroke="#7fb069" strokeWidth="2.5" strokeLinecap="round"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
        />
      </svg>
    ),
  },
  {
    href: "/portfolio",
    icon: Wallet,
    title: "Paper trading",
    body: "Practice orders with zero rupees at risk. Holdings persist.",
    span: false,
    visual: (
      <div className="mt-4 flex gap-2" aria-hidden>
        <span className="rounded-lg bg-emerald-500/15 px-3 py-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">BUY</span>
        <span className="rounded-lg bg-red-500/15 px-3 py-1.5 text-xs font-bold text-red-600 dark:text-red-400">SELL</span>
      </div>
    ),
  },
  {
    href: "/ai-insights",
    icon: Brain,
    title: "AI that reads the wire",
    body: "News sentiment scored live, mapped to your market view.",
    span: true,
    visual: (
      <div className="mt-4 flex flex-wrap gap-2" aria-hidden>
        {["RBI holds rates", "Nifty IT +3.2%", "FII outflows", "Gold at highs"].map((t) => (
          <span key={t} className="rounded-full border border-border bg-accent/60 px-3 py-1.5 text-xs font-medium">
            {t}
          </span>
        ))}
      </div>
    ),
  },
  {
    href: "/calculators",
    icon: Calculator,
    title: "8 precision calculators",
    body: "SIP to SWP to tax — sliders, live math, projections.",
    span: false,
    visual: (
      <div className="mt-4 space-y-2" aria-hidden>
        <div className="h-1.5 rounded-full bg-accent"><div className="h-full w-3/4 rounded-full bg-primary" /></div>
        <div className="h-1.5 rounded-full bg-accent"><div className="h-full w-1/2 rounded-full bg-primary/70" /></div>
      </div>
    ),
  },
];

const STATS: [string, string][] = [
  ["11", "live tickers"],
  ["5", "chart ranges"],
  ["8", "calculators"],
  ["0", "mock prices"],
];

export default function LandingPage() {
  return (
    <div className="pb-4">
      <nav className="flex h-16 items-center justify-between" aria-label="Primary">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-[15px] font-semibold text-primary-foreground">
            ₹
          </span>
          <span className="text-[17px] font-semibold tracking-tight">DhanSaathi</span>
        </Link>
        <div className="hidden items-center gap-7 text-[13.5px] font-medium text-muted-foreground sm:flex">
          <Link href="/dashboard" className="transition-colors hover:text-foreground">Terminal</Link>
          <Link href="/markets" className="transition-colors hover:text-foreground">Markets</Link>
          <Link href="/academy" className="transition-colors hover:text-foreground">Academy</Link>
        </div>
        <Link
          href="/dashboard"
          className="rounded-xl bg-primary px-4 py-2 text-[13.5px] font-semibold text-primary-foreground transition-all hover:opacity-90 active:scale-[0.98]"
        >
          Open terminal
        </Link>
      </nav>

      <header className="grid items-center gap-10 pb-14 pt-10 md:pt-14 lg:grid-cols-2 lg:gap-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="eyebrow">AI-powered wealth terminal</p>
          <h1 className="font-display mt-3 text-4xl leading-[1.05] md:text-5xl lg:text-6xl">
            Know every tick.
            <br />
            Own every decision.
          </h1>
          <p className="mt-4 max-w-[46ch] text-[15px] leading-relaxed text-muted-foreground">
            Live Indian and global markets, beast-mode charts, and honest AI insight — in one calm terminal.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link
              href="/dashboard"
              className="group inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 active:scale-[0.98]"
            >
              Open terminal
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/live-markets"
              className="rounded-xl border border-border px-5 py-3 text-sm font-semibold transition-colors hover:bg-accent"
            >
              See live markets
            </Link>
          </div>
          <p className="mt-5 text-xs text-muted-foreground">11 live tickers · Real Yahoo Finance data · No sign-up</p>
        </motion.div>
        <HeroVisual />
      </header>

      <Tape />

      <section className="py-16 md:py-20" aria-label="Features">
        <Reveal>
          <h2 className="font-display max-w-[22ch] text-3xl leading-tight md:text-4xl">
            A terminal that respects your intelligence.
          </h2>
        </Reveal>
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <Reveal key={f.title} delay={Math.min(i * 0.06, 0.24)}>
              <TiltCard max={5} className={`h-full ${f.span ? "sm:col-span-2 lg:col-span-1" : ""}`}>
                <Link href={f.href} className="block h-full">
                  <GlowCard className="h-full" glowColor="#d97757">
                    <f.icon size={20} className="text-primary" />
                    <h3 className="mt-3 text-[15px] font-semibold">{f.title}</h3>
                    <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">{f.body}</p>
                    {f.visual}
                  </GlowCard>
                </Link>
              </TiltCard>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="border-y border-border py-12" aria-label="Numbers">
        <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
          {STATS.map(([n, label], i) => (
            <Reveal key={label} delay={i * 0.06}>
              <p className="font-display text-4xl tabular-nums md:text-5xl">{n}</p>
              <p className="mt-1 text-[13px] text-muted-foreground">{label}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="py-16 text-center md:py-20" aria-label="Get started">
        <Reveal>
          <BarChart3 size={22} className="mx-auto text-primary" />
          <h2 className="font-display mx-auto mt-4 max-w-[20ch] text-3xl leading-tight md:text-4xl">
            Start with the terminal.
          </h2>
          <p className="mx-auto mt-3 max-w-[52ch] text-sm leading-relaxed text-muted-foreground">
            Free, no sign-up, real data. Your watchlist saves on this device.
          </p>
          <Link
            href="/dashboard"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 active:scale-[0.98]"
          >
            Open terminal <ArrowRight size={16} />
          </Link>
        </Reveal>
      </section>

      <footer className="flex flex-col items-center gap-2 border-t border-border py-8 text-center">
        <p className="text-[13px] font-semibold">DhanSaathi</p>
        <p className="max-w-[60ch] text-xs leading-relaxed text-muted-foreground">
          Not SEBI registered. For education only — not financial advice.
        </p>
        <p className="text-[11px] text-muted-foreground/60">© 2026 DhanSaathi</p>
      </footer>
    </div>
  );
}
