"use client";

import type { HistoryCandle } from "./api";

export interface SkoreComponent {
  key: string;
  label: string;
  score: number;
  weight: number;
  detail: string;
}

export interface Skore {
  score: number;
  label: string;
  components: SkoreComponent[];
}

function closes(candles: HistoryCandle[]): number[] {
  return candles.map((c) => c.close).filter((v) => Number.isFinite(v) && v > 0);
}

function dailyReturns(values: number[]): number[] {
  const out: number[] = [];
  for (let i = 1; i < values.length; i++) {
    if (values[i - 1] > 0) out.push((values[i] - values[i - 1]) / values[i - 1]);
  }
  return out;
}

function stdev(xs: number[]): number {
  if (xs.length < 2) return 0;
  const mean = xs.reduce((s, x) => s + x, 0) / xs.length;
  return Math.sqrt(xs.reduce((s, x) => s + (x - mean) ** 2, 0) / (xs.length - 1));
}

function sma(values: number[], n: number): number {
  const tail = values.slice(-n);
  if (tail.length === 0) return 0;
  return tail.reduce((s, x) => s + x, 0) / tail.length;
}

const clamp = (v: number, lo = 0, hi = 100) => Math.min(hi, Math.max(lo, v));

export function computeSkore(month: HistoryCandle[], year: HistoryCandle[]): Skore | null {
  const m = closes(month);
  const y = closes(year);
  if (m.length < 10 || y.length < 30) return null;

  const momentumPct = ((m[m.length - 1] - m[0]) / m[0]) * 100;
  const momentum = clamp(50 + momentumPct * 4);

  const last = m[m.length - 1];
  const sma50 = sma(m, 50);
  const trendDev = sma50 > 0 ? ((last - sma50) / sma50) * 100 : 0;
  const trend = clamp(50 + trendDev * 6);

  const volAnn = stdev(dailyReturns(y)) * Math.sqrt(252) * 100;
  const stability = clamp(100 - volAnn * 1.5);

  const vols = month.map((c) => c.volume).filter((v) => Number.isFinite(v) && v > 0);
  let accumulation = 50;
  let volDetail = "Volume data unavailable";
  if (vols.length >= 10) {
    const first = vols.slice(0, Math.floor(vols.length / 2));
    const second = vols.slice(Math.floor(vols.length / 2));
    const avg = (a: number[]) => a.reduce((s, x) => s + x, 0) / a.length;
    const ratio = avg(first) > 0 ? avg(second) / avg(first) : 1;
    accumulation = clamp(50 + (ratio - 1) * 100);
    volDetail = `Recent volume ${ratio >= 1 ? "+" : ""}${((ratio - 1) * 100).toFixed(0)}% vs prior half`;
  }

  const components: SkoreComponent[] = [
    { key: "momentum", label: "1M Momentum", score: Math.round(momentum), weight: 40, detail: `${momentumPct >= 0 ? "+" : ""}${momentumPct.toFixed(1)}% past month` },
    { key: "trend", label: "Trend vs 50-day", score: Math.round(trend), weight: 25, detail: `${trendDev >= 0 ? "+" : ""}${trendDev.toFixed(1)}% vs SMA-50` },
    { key: "stability", label: "Stability", score: Math.round(stability), weight: 25, detail: `${volAnn.toFixed(0)}% annualized volatility` },
    { key: "accumulation", label: "Accumulation", score: Math.round(accumulation), weight: 10, detail: volDetail },
  ];
  const score = Math.round(
    components.reduce((s, c) => s + (c.score * c.weight) / 100, 0)
  );
  const label = score >= 70 ? "Strong" : score >= 50 ? "Neutral" : score >= 30 ? "Weak" : "Fragile";
  return { score, label, components };
}
