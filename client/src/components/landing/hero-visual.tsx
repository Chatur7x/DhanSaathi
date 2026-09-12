"use client";

import { useEffect, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { TradingViewChart } from "@/components/premium/trading-view-chart";
import { TiltCard } from "@/components/premium/tilt-card";
import { GlowCard } from "@/components/premium/glow-card";
import { getHistoricalData } from "@/lib/api";
import { useMarketData } from "@/hooks/useMarketData";

gsap.registerPlugin(ScrollTrigger);

function DecorativeCurve() {
  return (
    <svg viewBox="0 0 400 160" preserveAspectRatio="none" className="h-full w-full" aria-hidden>
      <defs>
        <linearGradient id="heroCurveFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#d97757" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#d97757" stopOpacity="0" />
        </linearGradient>
      </defs>
      <motion.path
        d="M0,130 C40,120 60,90 100,95 C140,100 160,60 200,65 C240,70 260,40 300,45 C340,50 360,25 400,30 L400,160 L0,160 Z"
        fill="url(#heroCurveFill)"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2 }}
      />
      <motion.path
        d="M0,130 C40,120 60,90 100,95 C140,100 160,60 200,65 C240,70 260,40 300,45 C340,50 360,25 400,30"
        fill="none"
        stroke="#d97757"
        strokeWidth="2.5"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
      />
    </svg>
  );
}

export function HeroVisual() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { quotesByTicker } = useMarketData({ tickers: ["NIFTY", "BTC"] });

  const { data: history } = useQuery({
    queryKey: ["landing-hero", "^NSEI"],
    queryFn: () => getHistoricalData("^NSEI", "1M"),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  useEffect(() => {
    if (reduce || !wrapRef.current) return;
    const ctx = gsap.context(() => {
      gsap.to("[data-hero-stage]", {
        rotateX: 14,
        y: 70,
        opacity: 0.35,
        ease: "none",
        scrollTrigger: {
          trigger: wrapRef.current,
          start: "top 12%",
          end: "bottom top",
          scrub: 0.8,
        },
      });
    }, wrapRef);
    return () => ctx.revert();
  }, [reduce]);

  const points = Array.isArray(history)
    ? history
        .map((h: { time?: number; date?: string; close?: number }) => ({
          time: h.time ?? 0,
          value: h.close ?? 0,
        }))
        .filter((p) => p.time > 0 && p.value > 0)
    : [];
  const live = quotesByTicker["NIFTY"]?.price ?? quotesByTicker["BTC"]?.price ?? null;

  const nifty = quotesByTicker["NIFTY"];
  const btc = quotesByTicker["BTC"];

  return (
    <div ref={wrapRef} className="relative [perspective:1400px]">
      <div aria-hidden className="animate-float-slow pointer-events-none absolute -top-10 right-6 h-44 w-44 rounded-full bg-primary/15 blur-3xl" />
      <div data-hero-stage className="relative">
        <TiltCard max={9} className="relative">
          <GlowCard className="!p-4 sm:!p-5">
            <div className="mb-2 flex items-center justify-between">
              <p className="eyebrow">Nifty 50 · live</p>
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
            </div>
            <div className="h-52 sm:h-64">
              {points.length > 10 ? (
                <TradingViewChart data={points} liveValue={live} up currencyPrefix="₹" />
              ) : (
                <DecorativeCurve />
              )}
            </div>
          </GlowCard>
        </TiltCard>

        {nifty && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, type: "spring", stiffness: 200, damping: 22 }}
            className="absolute -left-3 top-10 rounded-2xl border border-border bg-card/95 px-3.5 py-2.5 shadow-[var(--paper-shadow)] backdrop-blur sm:-left-8"
          >
            <p className="eyebrow">Nifty 50</p>
            <p className="text-base font-semibold tabular-nums">₹{nifty.price.toLocaleString("en-IN")}</p>
          </motion.div>
        )}
        {btc && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, type: "spring", stiffness: 200, damping: 22 }}
            className="absolute -right-2 bottom-12 rounded-2xl border border-border bg-card/95 px-3.5 py-2.5 shadow-[var(--paper-shadow)] backdrop-blur sm:-right-6"
          >
            <p className="eyebrow">Bitcoin</p>
            <p className="text-base font-semibold tabular-nums">${btc.price.toLocaleString("en-US")}</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
