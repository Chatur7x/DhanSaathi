"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

interface AnimatedCounterProps {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  className?: string;
}

export function AnimatedCounter({ value, prefix = "", suffix = "", decimals = 2, className }: AnimatedCounterProps) {
  const mv = useMotionValue(0);
  const spring = useSpring(mv, { stiffness: 100, damping: 30 });
  const [display, setDisplay] = useState("0");

  useEffect(() => { mv.set(value); }, [value, mv]);
  useEffect(() => {
    const unsub = spring.on("change", (v) => setDisplay(v.toFixed(decimals)));
    return unsub;
  }, [spring, decimals]);

  return <span className={className}>{prefix}{display}{suffix}</span>;
}

export function LivePulse({ label = "LIVE", connected = true }: { label?: string; connected?: boolean }) {
  return (
    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[0.65rem] font-bold tracking-widest border ${
      connected ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400" : "border-red-500/30 bg-red-500/10 text-red-400"
    }`}>
      <motion.div
        animate={{ scale: [1, 1.4, 1], opacity: [1, 0.5, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
        className={`w-1.5 h-1.5 rounded-full ${connected ? "bg-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.6)]" : "bg-red-400 shadow-[0_0_6px_rgba(239,68,68,0.6)]"}`}
      />
      {label}
    </div>
  );
}

export function NumberTicker({ value, className }: { value: number; className?: string }) {
  const digits = value.toLocaleString("en-IN").split("");
  return (
    <span className={`inline-flex overflow-hidden ${className}`}>
      {digits.map((d, i) => (
        <motion.span
          key={`${i}-${d}`}
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 20, delay: i * 0.03 }}
        >
          {d}
        </motion.span>
      ))}
    </span>
  );
}
