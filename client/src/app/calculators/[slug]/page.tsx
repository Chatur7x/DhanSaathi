"use client";

import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { GlowCard } from "@/components/premium/glow-card";
import { AnimatedCounter } from "@/components/premium/animated-counter";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import Link from "next/link";
import { useState, useMemo } from "react";
import { useParams, notFound } from "next/navigation";
import { Calculator as CalcIcon } from "lucide-react";

const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.25 } } };

type SliderInput = {
  kind: "slider";
  key: string;
  label: string;
  min: number;
  max: number;
  step: number;
  format: (v: number) => string;
};
type ChoiceInput = { kind: "choice"; key: string; label: string; options: string[] };
type Input = SliderInput | ChoiceInput;

type Result = { label: string; value: number; format: (v: number) => string; accent?: string };

type CalcConfig = {
  title: string;
  subtitle: string;
  defaults: Record<string, number | string>;
  inputs: Input[];
  compute: (v: Record<string, number | string>) => { results: Result[]; series: { label: string; a: number; b: number }[]; aLabel: string; bLabel: string };
};

const inr = (v: number) => `₹${Math.round(v).toLocaleString("en-IN")}`;
const pct1 = (v: number) => `${v.toFixed(1)}%`;
const pct2 = (v: number) => `${v.toFixed(2)}%`;
const yrs = (v: number) => `${v} yr${v === 1 ? "" : "s"}`;

const CALCS: Record<string, CalcConfig> = {
  lumpsum: {
    title: "Lumpsum Calculator",
    subtitle: "One-time investment growth projections",
    defaults: { principal: 500000, rate: 12, years: 10 },
    inputs: [
      { kind: "slider", key: "principal", label: "Investment (₹)", min: 10000, max: 10000000, step: 10000, format: inr },
      { kind: "slider", key: "rate", label: "Expected Return (%)", min: 1, max: 30, step: 0.5, format: pct1 },
      { kind: "slider", key: "years", label: "Time Period", min: 1, max: 40, step: 1, format: yrs },
    ],
    compute: (v) => {
      const P = v.principal as number, r = (v.rate as number) / 100, n = v.years as number;
      const fv = P * Math.pow(1 + r, n);
      const series = Array.from({ length: n }, (_, i) => {
        const y = i + 1;
        return { label: `Y${y}`, a: P, b: Math.round(P * Math.pow(1 + r, y)) };
      });
      return {
        results: [
          { label: "Invested", value: P, format: inr },
          { label: "Est. Gains", value: fv - P, format: inr, accent: "text-emerald-500" },
          { label: "Total Value", value: fv, format: inr, accent: "text-primary" },
        ],
        series, aLabel: "Invested", bLabel: "Value",
      };
    },
  },
  cagr: {
    title: "CAGR Calculator",
    subtitle: "Compound annual growth rate analysis",
    defaults: { start: 100000, end: 250000, years: 5 },
    inputs: [
      { kind: "slider", key: "start", label: "Initial Value (₹)", min: 1000, max: 10000000, step: 1000, format: inr },
      { kind: "slider", key: "end", label: "Final Value (₹)", min: 1000, max: 50000000, step: 1000, format: inr },
      { kind: "slider", key: "years", label: "Duration", min: 1, max: 40, step: 1, format: yrs },
    ],
    compute: (v) => {
      const S = v.start as number, E = v.end as number, n = v.years as number;
      const cagr = Math.pow(E / S, 1 / n) - 1;
      const series = Array.from({ length: n }, (_, i) => {
        const y = i + 1;
        return { label: `Y${y}`, a: S, b: Math.round(S * Math.pow(1 + cagr, y)) };
      });
      return {
        results: [
          { label: "CAGR", value: cagr * 100, format: pct2, accent: "text-primary" },
          { label: "Growth", value: (E / S - 1) * 100, format: (x) => `${x.toFixed(0)}%`, accent: "text-emerald-500" },
          { label: "Multiple", value: E / S, format: (x) => `${x.toFixed(2)}x` },
        ],
        series, aLabel: "Start", bLabel: "Growth path",
      };
    },
  },
  emi: {
    title: "EMI Calculator",
    subtitle: "Equated monthly installment planner",
    defaults: { loan: 2500000, rate: 9, years: 20 },
    inputs: [
      { kind: "slider", key: "loan", label: "Loan Amount (₹)", min: 50000, max: 50000000, step: 50000, format: inr },
      { kind: "slider", key: "rate", label: "Interest Rate (%)", min: 1, max: 24, step: 0.1, format: pct1 },
      { kind: "slider", key: "years", label: "Tenure", min: 1, max: 30, step: 1, format: yrs },
    ],
    compute: (v) => {
      const P = v.loan as number, r = (v.rate as number) / 100 / 12, n = (v.years as number) * 12;
      const emi = r === 0 ? P / n : (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
      const total = emi * n;
      const years = v.years as number;
      const series = Array.from({ length: years }, (_, i) => {
        const paid = Math.min(i + 1, years);
        const principalShare = (P / years) * paid;
        const interestShare = ((total - P) / years) * paid;
        return { label: `Y${paid}`, a: Math.round(principalShare), b: Math.round(principalShare + interestShare) };
      });
      return {
        results: [
          { label: "Monthly EMI", value: emi, format: inr, accent: "text-primary" },
          { label: "Total Interest", value: total - P, format: inr, accent: "text-amber-500" },
          { label: "Total Payable", value: total, format: inr },
        ],
        series, aLabel: "Principal", bLabel: "Paid (incl. interest)",
      };
    },
  },
  goal: {
    title: "Goal Planner",
    subtitle: "Required monthly SIP for your target",
    defaults: { target: 10000000, rate: 12, years: 10 },
    inputs: [
      { kind: "slider", key: "target", label: "Target Amount (₹)", min: 100000, max: 100000000, step: 100000, format: inr },
      { kind: "slider", key: "rate", label: "Expected Return (%)", min: 1, max: 30, step: 0.5, format: pct1 },
      { kind: "slider", key: "years", label: "Time To Goal", min: 1, max: 40, step: 1, format: yrs },
    ],
    compute: (v) => {
      const FV = v.target as number, r = (v.rate as number) / 100 / 12, n = (v.years as number) * 12;
      const sip = r === 0 ? FV / n : (FV * r) / ((Math.pow(1 + r, n) - 1) * (1 + r));
      const invested = sip * n;
      const years = v.years as number;
      const series = Array.from({ length: years }, (_, i) => {
        const m = (i + 1) * 12;
        const val = r === 0 ? sip * m : sip * ((Math.pow(1 + r, m) - 1) / r) * (1 + r);
        return { label: `Y${i + 1}`, a: Math.round(sip * m), b: Math.round(val) };
      });
      return {
        results: [
          { label: "Monthly SIP", value: sip, format: inr, accent: "text-primary" },
          { label: "You Invest", value: invested, format: inr },
          { label: "Growth", value: FV - invested, format: inr, accent: "text-emerald-500" },
        ],
        series, aLabel: "Invested", bLabel: "Value",
      };
    },
  },
  inflation: {
    title: "Inflation Calculator",
    subtitle: "What your money will be worth tomorrow",
    defaults: { cost: 100000, rate: 6, years: 10 },
    inputs: [
      { kind: "slider", key: "cost", label: "Today's Cost (₹)", min: 1000, max: 10000000, step: 1000, format: inr },
      { kind: "slider", key: "rate", label: "Inflation Rate (%)", min: 0, max: 20, step: 0.5, format: pct1 },
      { kind: "slider", key: "years", label: "After", min: 1, max: 40, step: 1, format: yrs },
    ],
    compute: (v) => {
      const P = v.cost as number, i = (v.rate as number) / 100, n = v.years as number;
      const future = P * Math.pow(1 + i, n);
      const series = Array.from({ length: n }, (_, k) => ({
        label: `Y${k + 1}`, a: P, b: Math.round(P * Math.pow(1 + i, k + 1)),
      }));
      return {
        results: [
          { label: "Future Cost", value: future, format: inr, accent: "text-primary" },
          { label: "Price Rise", value: (future / P - 1) * 100, format: (x) => `+${x.toFixed(0)}%`, accent: "text-amber-500" },
          { label: "Value of ₹100", value: 100 * (P / future), format: (x) => `₹${x.toFixed(0)}` },
        ],
        series, aLabel: "Today", bLabel: "Future cost",
      };
    },
  },
  swp: {
    title: "SWP Calculator",
    subtitle: "How long your corpus will last",
    defaults: { corpus: 5000000, monthly: 40000, rate: 9 },
    inputs: [
      { kind: "slider", key: "corpus", label: "Corpus (₹)", min: 100000, max: 100000000, step: 100000, format: inr },
      { kind: "slider", key: "monthly", label: "Monthly Withdrawal (₹)", min: 5000, max: 1000000, step: 5000, format: inr },
      { kind: "slider", key: "rate", label: "Growth Rate (%)", min: 0, max: 20, step: 0.5, format: pct1 },
    ],
    compute: (v) => {
      const r = (v.rate as number) / 100 / 12;
      let bal = v.corpus as number;
      const W = v.monthly as number;
      const series: { label: string; a: number; b: number }[] = [];
      let months = 0;
      let withdrawn = 0;
      while (bal > 0 && months < 600) {
        bal = bal * (1 + r) - W;
        if (bal < 0) { withdrawn += W + bal; bal = 0; }
        else withdrawn += W;
        months++;
        if (months % 12 === 0 || bal === 0) {
          series.push({ label: `Y${Math.ceil(months / 12)}`, a: 0, b: Math.round(Math.max(0, bal)) });
        }
      }
      const years = Math.floor(months / 12);
      return {
        results: [
          { label: "Lasts", value: months, format: (x) => `${Math.floor(x / 12)}y ${Math.round(x % 12)}m`, accent: "text-primary" },
          { label: "Total Withdrawn", value: withdrawn, format: inr, accent: "text-emerald-500" },
          { label: "Monthly Payout", value: W, format: inr },
        ],
        series: series.length > 0 ? series : [{ label: "Y0", a: 0, b: v.corpus as number }],
        aLabel: "", bLabel: "Balance",
      };
    },
  },
  tax: {
    title: "Tax Calculator",
    subtitle: "Capital gains tax estimate (FY 2024-25 rules)",
    defaults: { gains: 500000, type: "Equity LTCG", years: 2 },
    inputs: [
      { kind: "slider", key: "gains", label: "Total Gains (₹)", min: 10000, max: 50000000, step: 10000, format: inr },
      { kind: "choice", key: "type", label: "Gain Type", options: ["Equity STCG", "Equity LTCG", "Debt / Other"] },
      { kind: "slider", key: "years", label: "Holding Period", min: 0, max: 10, step: 1, format: (x) => (x < 1 ? "< 1 yr" : yrs(x)) },
    ],
    compute: (v) => {
      const G = v.gains as number;
      const t = v.type as string;
      let rate = 0, exempt = 0, note = "";
      if (t === "Equity STCG") { rate = 0.2; note = "20% flat"; }
      else if (t === "Equity LTCG") { rate = 0.125; exempt = 125000; note = "12.5% above ₹1.25L"; }
      else { rate = (v.years as number) >= 2 ? 0.125 : 0.3; note = "slab / 12.5%"; }
      void note;
      const taxable = Math.max(0, G - exempt);
      const tax = taxable * rate;
      return {
        results: [
          { label: "Tax Payable", value: tax, format: inr, accent: "text-primary" },
          { label: "Effective Rate", value: G === 0 ? 0 : (tax / G) * 100, format: pct2, accent: "text-amber-500" },
          { label: "You Keep", value: G - tax, format: inr, accent: "text-emerald-500" },
        ],
        series: [], aLabel: "", bLabel: "",
      };
    },
  },
};

export default function CalculatorSlugPage() {
  const params = useParams();
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;
  const config = slug ? CALCS[slug] : undefined;
  if (!config) notFound();

  return <CalculatorView config={config} />;
}

function CalculatorView({ config }: { config: CalcConfig }) {
  const [values, setValues] = useState<Record<string, number | string>>(config.defaults);
  const set = (key: string, val: number | string) => setValues((p) => ({ ...p, [key]: val }));

  const { results, series, aLabel, bLabel } = useMemo(() => config.compute(values), [config, values]);

  return (
    <AppShell>
      <motion.div initial="hidden" animate="show" variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.07 } } }} className="space-y-6">
        <motion.div variants={item} className="flex items-center gap-3">
          <Link href="/calculators" aria-label="Back to calculators" className="p-2 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
            <ArrowLeft size={18} />
          </Link>
          <PageHeader icon={CalcIcon} eyebrow="Calculator" title={config.title} subtitle={config.subtitle} />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <motion.div variants={item}>
            <GlowCard className="space-y-6">
              {config.inputs.map((inp) => {
                if (inp.kind === "choice") {
                  return (
                    <div key={inp.key}>
                      <label className="eyebrow block mb-2">{inp.label}</label>
                      <div className="flex gap-2">
                        {inp.options.map((opt) => (
                          <button
                            key={opt}
                            onClick={() => set(inp.key, opt)}
                            className={`flex-1 px-3 py-2.5 rounded-xl text-[13px] font-semibold border transition-all ${
                              values[inp.key] === opt
                                ? "bg-primary/10 text-primary border-primary/30"
                                : "text-muted-foreground border-border hover:bg-accent"
                            }`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                }
                const val = values[inp.key] as number;
                return (
                  <div key={inp.key}>
                    <div className="flex justify-between items-baseline mb-2.5">
                      <label className="eyebrow">{inp.label}</label>
                      <span className="text-sm font-semibold text-primary">{inp.format(val)}</span>
                    </div>
                    <input
                      type="range" min={inp.min} max={inp.max} step={inp.step} value={val}
                      onChange={(e) => set(inp.key, Number(e.target.value))}
                      className="w-full" aria-label={inp.label}
                    />
                  </div>
                );
              })}

              <div className="grid grid-cols-3 gap-3 pt-1">
                {results.map((r) => (
                  <div key={r.label} className="text-center p-3 rounded-xl bg-accent/50 border border-border">
                    <p className="eyebrow !text-[0.6rem]">{r.label}</p>
                    <p className={`text-[15px] font-semibold mt-1 ${r.accent || ""}`}>
                      {typeof r.value === "number" && r.format === inr ? (
                        <>₹<AnimatedCounter value={r.value} decimals={0} /></>
                      ) : (
                        r.format(r.value)
                      )}
                    </p>
                  </div>
                ))}
              </div>
            </GlowCard>
          </motion.div>

          <motion.div variants={item}>
            <GlowCard>
              <h3 className="font-semibold mb-4">Projection</h3>
              {series.length > 0 ? (
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={series}>
                      <defs>
                        <linearGradient id="calcB" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#d97757" stopOpacity={0.35} />
                          <stop offset="100%" stopColor="#d97757" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="label" tick={{ fill: "#a39a8b", fontSize: 11 }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                      <YAxis tick={{ fill: "#a39a8b", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(x: number) => x >= 10000000 ? `₹${(x / 10000000).toFixed(1)}Cr` : x >= 100000 ? `₹${(x / 100000).toFixed(0)}L` : `₹${x}`} width={56} />
                      <Tooltip
                        contentStyle={{ background: "#241e18", border: "1px solid rgba(236,230,219,0.12)", borderRadius: "12px", color: "#ece6db", fontSize: 12 }}
                        formatter={(val: unknown, name: unknown) => [`₹${Number(val).toLocaleString("en-IN")}`, name === "a" ? aLabel : bLabel]}
                        labelStyle={{ color: "#a39a8b" }}
                      />
                      {aLabel && <Area type="monotone" dataKey="a" stroke="#a39a8b" strokeWidth={1.5} strokeDasharray="4 4" fill="none" name="a" />}
                      <Area type="monotone" dataKey="b" stroke="#d97757" strokeWidth={2.5} fill="url(#calcB)" name="b" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-72 flex flex-col items-center justify-center text-center gap-2">
                  <p className="text-4xl font-semibold tracking-tight">{results[0]?.format(results[0]?.value ?? 0)}</p>
                  <p className="text-[13px] text-muted-foreground">{results[0]?.label} · {results[2]?.format(results[2]?.value ?? 0)} {results[2]?.label.toLowerCase()}</p>
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-3">Estimates only — not financial advice. Consult a SEBI-registered advisor.</p>
            </GlowCard>
          </motion.div>
        </div>
      </motion.div>
    </AppShell>
  );
}
