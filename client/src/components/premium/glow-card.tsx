"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlowCardProps {
  children: React.ReactNode;
  className?: string;
  /** Kept for API compatibility — now a whisper of warmth, not neon. */
  glowColor?: string;
}

export function GlowCard({ children, className, glowColor = "#d97757" }: GlowCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [hovered, setHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    setMouse({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      whileHover={{ y: -1 }}
      transition={{ type: "spring", stiffness: 400, damping: 28 }}
      className={cn(
        "relative overflow-hidden rounded-2xl border border-border bg-card p-6 transition-colors",
        className
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-500"
        style={{
          opacity: hovered ? 1 : 0,
          background: `radial-gradient(500px circle at ${mouse.x}px ${mouse.y}px, ${glowColor}0d, transparent 45%)`,
        }}
      />
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}
