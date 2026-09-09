"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Brain, TrendingUp, TrendingDown, RefreshCw, Radio, Zap } from "lucide-react";
import { GlowCard } from "@/components/premium/glow-card";
import { LivePulse } from "@/components/premium/animated-counter";
import { MagneticButton } from "@/components/premium/magnetic-button";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { WS_URL } from "@/lib/api-config";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.25 } } };

type NewsItem = {
  id: number | string;
  headline: string;
  sentiment: "Bullish" | "Bearish";
  impact: number | string;
  source: string;
  time: string;
};

const baseNews: NewsItem[] = [
  { id: 1, headline: "RBI holds repo rate at 6.5%, signals continued support for growth", sentiment: "Bullish", impact: 8.2, source: "ET Markets", time: "2m ago" },
  { id: 2, headline: "FII outflows reach ₹8,400 Cr in May — largest monthly exit in 6 months", sentiment: "Bearish", impact: 7.5, source: "MoneyControl", time: "12m ago" },
  { id: 3, headline: "Nifty IT index surges 3.2% as US tech spending outlook improves", sentiment: "Bullish", impact: 6.8, source: "LiveMint", time: "28m ago" },
  { id: 4, headline: "Auto sector under pressure as global chip shortage extends to Q3", sentiment: "Bearish", impact: 5.9, source: "Reuters", time: "1h ago" },
  { id: 5, headline: "Reliance Jio announces 5G rollout in 200 more cities by September", sentiment: "Bullish", impact: 7.1, source: "NDTV Profit", time: "1h ago" },
  { id: 6, headline: "Gold prices hit all-time high amid geopolitical tensions in Middle East", sentiment: "Bullish", impact: 6.2, source: "Bloomberg", time: "2h ago" },
  { id: 7, headline: "SEBI tightens F&O rules — lot sizes increased for select contracts", sentiment: "Bearish", impact: 8.0, source: "ET Markets", time: "3h ago" },
  { id: 8, headline: "Indian rupee strengthens to 82.5 against USD on strong GDP data", sentiment: "Bullish", impact: 5.4, source: "Mint", time: "4h ago" },
];

const sectors = [
  { name: "IT Sector", sentiment: "Bullish" }, { name: "Banking", sentiment: "Bullish" },
  { name: "Auto", sentiment: "Bearish" }, { name: "Pharma", sentiment: "Bullish" },
  { name: "Energy", sentiment: "Bearish" },
];

type Filter = "All" | "Bullish" | "Bearish";

export default function AIInsightsPage() {
  const [loading, setLoading] = useState(false);
  const [live, setLive] = useState<NewsItem[]>([]);
  const [filter, setFilter] = useState<Filter>("All");
  const [expanded, setExpanded] = useState<number | string | null>(null);
  const [liveOn, setLiveOn] = useState(false);

  // Live AI news pushed by the backend (RSS + sentiment, every ~10s)
  useEffect(() => {
    const socket = io(WS_URL, { transports: ["websocket", "polling"] });
    socket.on("connect", () => setLiveOn(true));
    socket.on("disconnect", () => setLiveOn(false));
    socket.on("aiNewsUpdate", (n: { id: number | string; headline: string; sentiment: string; impact: string | number }) => {
      setLive((prev) => {
        if (prev.some((x) => x.id === n.id)) return prev;
        const item: NewsItem = {
          id: n.id,
          headline: n.headline,
          sentiment: n.sentiment === "Bearish" ? "Bearish" : "Bullish",
          impact: n.impact,
          source: "Live Wire",
          time: "just now",
        };
        return [item, ...prev].slice(0, 6);
      });
    });
    return () => { socket.disconnect(); };
  }, []);

  const news = [...live, ...baseNews].filter((n) => filter === "All" || n.sentiment === filter);
  const bullish = baseNews.filter((n) => n.sentiment === "Bullish").length;
  const overall = bullish >= baseNews.length / 2 ? "Bullish" : "Bearish";

  const refresh = () => {
    setLoading(true);
    setLive([]); // drop the live buffer — fresh wire items stream back in
    setTimeout(() => setLoading(false), 800);
  };

  return (
    <AppShell>
      <motion.div variants={container} initial="hidden" animate="show" className="space-y-5">
        <motion.div variants={item}>
          <PageHeader
            icon={Brain} eyebrow="Intelligence" title="AI Insights & News"
            subtitle="Sentiment analysis across market wires"
            right={
              <>
                <LivePulse label={liveOn ? "LIVE WIRE" : `${baseNews.length} ARTICLES`} />
                <div className="flex gap-1 p-1 rounded-xl bg-card border border-border">
                  {(["All", "Bullish", "Bearish"] as Filter[]).map((f) => (
                    <button key={f} onClick={() => setFilter(f)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        filter === f ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"
                      }`}>
                      {f}
                    </button>
                  ))}
                </div>
                <MagneticButton onClick={refresh}
                  className="bg-card text-muted-foreground border border-border hover:text-foreground !px-4 !py-2">
                  <RefreshCw size={13} className={loading ? "animate-spin" : ""} /> Refresh
                </MagneticButton>
              </>
            }
          />
        </motion.div>

        {/* Sentiment Overview */}
        <motion.div variants={item} className="grid grid-cols-2 md:grid-cols-6 gap-3">
          <GlowCard className="col-span-2 md:col-span-2 !p-5">
            <p className="eyebrow mb-2">Overall Market</p>
            <div className="flex items-center gap-2">
              {overall === "Bullish" ? <TrendingUp size={22} className="text-emerald-500" /> : <TrendingDown size={22} className="text-red-500" />}
              <span className={`text-xl font-semibold tracking-tight ${overall === "Bullish" ? "text-emerald-500" : "text-red-500"}`}>{overall}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">{baseNews.length} articles analyzed</p>
          </GlowCard>
          {sectors.map((s) => (
            <GlowCard key={s.name} className="!p-4">
              <p className="eyebrow !text-[0.6rem] mb-1.5">{s.name}</p>
              <div className="flex items-center gap-1.5">
                {s.sentiment === "Bullish" ? <TrendingUp size={14} className="text-emerald-500" /> : <TrendingDown size={14} className="text-red-500" />}
                <span className={`text-[13px] font-semibold ${s.sentiment === "Bullish" ? "text-emerald-500" : "text-red-500"}`}>{s.sentiment}</span>
              </div>
            </GlowCard>
          ))}
        </motion.div>

        {/* News Feed */}
        <motion.div variants={item}>
          <div className="flex items-center gap-2 mb-3">
            <h2 className="text-[15px] font-semibold">News Feed</h2>
            <Radio size={13} className="text-primary" />
            {live.length > 0 && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/25">
                {live.length} LIVE
              </span>
            )}
          </div>
          <div className="space-y-2.5">
            <AnimatePresence initial={false}>
              {news.map((n) => {
                const isOpen = expanded === n.id;
                const impactNum = typeof n.impact === "string" ? parseFloat(n.impact) || 0 : n.impact;
                return (
                  <motion.div key={n.id} layout
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                    <GlowCard className="!p-4">
                      <button onClick={() => setExpanded(isOpen ? null : n.id)} className="w-full text-left">
                        <p className="text-sm font-medium leading-snug mb-2">{n.headline}</p>
                        <div className="flex flex-wrap items-center gap-2.5 text-xs">
                          <span className="font-medium text-muted-foreground">{n.source}</span>
                          <span className="text-muted-foreground/70">{n.time}</span>
                          <span className={`font-semibold px-2 py-0.5 rounded-full ${n.sentiment === "Bullish" ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"}`}>{n.sentiment}</span>
                          <span className="flex items-center gap-1 text-primary font-semibold px-2 py-0.5 rounded-full bg-primary/10">
                            <Zap size={10} /> {typeof n.impact === "number" ? n.impact.toFixed(1) : n.impact}
                          </span>
                        </div>
                      </button>
                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22 }}>
                            <div className="pt-3 mt-1">
                              <div className="flex justify-between text-[11px] text-muted-foreground mb-1.5">
                                <span>Impact score</span><span className="font-semibold">{typeof n.impact === "number" ? n.impact.toFixed(1) : n.impact} / 10</span>
                              </div>
                              <div className="h-1.5 rounded-full bg-accent overflow-hidden">
                                <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(100, impactNum * 10)}%` }}
                                  transition={{ duration: 0.5, ease: "easeOut" }}
                                  className={`h-full rounded-full ${n.sentiment === "Bullish" ? "bg-emerald-500" : "bg-red-500"}`} />
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </GlowCard>
                  </motion.div>
                );
              })}
            </AnimatePresence>
            {news.length === 0 && (
              <GlowCard className="text-center py-8">
                <p className="text-sm text-muted-foreground">No {filter.toLowerCase()} stories right now.</p>
              </GlowCard>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AppShell>
  );
}
