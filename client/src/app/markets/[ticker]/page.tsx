"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, WifiOff } from "lucide-react";
import { GlowCard } from "@/components/premium/glow-card";
import { LivePulse } from "@/components/premium/animated-counter";
import { TradingViewChart } from "@/components/premium/trading-view-chart";
import { AppShell } from "@/components/layout/app-shell";
import { useMarketData } from "@/hooks/useMarketData";
import { resolveTicker, isPlausibleSymbol, relatedSymbols, peerToQuery } from "@/lib/tickers";
import { getHistory, getFundamentals, getQuote, getQuotes, getNews, type HistoryRange, type Fundamentals } from "@/lib/api";
import { HISTORY_RANGES } from "@/lib/api";
import { computeSkore } from "@/lib/skore";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.25 } } };

function isCryptoBear(sym: string): boolean {
  return sym.endsWith("-USD") || sym === "BTC" || sym === "ETH" || sym === "SOL";
}

function currencyFor(yahooSymbol: string, fallback: string | null): string {
  if (yahooSymbol.startsWith("^NSE") || yahooSymbol.startsWith("^BSE") || yahooSymbol.endsWith(".NS")) return "₹";
  if (isCryptoBear(yahooSymbol)) return "$";
  if (fallback === "INR") return "₹";
  if (fallback === "EUR") return "€";
  if (fallback === "GBP") return "£";
  return "$";
}

function fmtMoney(v: number, cur: string): string {
  const locale = cur === "₹" ? "en-IN" : "en-US";
  return `${cur}${v.toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function fmtCompact(v: number, cur: string): string {
  const abs = Math.abs(v);
  if (abs >= 1e12) return `${cur}${(v / 1e12).toFixed(2)}T`;
  if (abs >= 1e9) return `${cur}${(v / 1e9).toFixed(2)}B`;
  if (abs >= 1e6) return `${cur}${(v / 1e6).toFixed(2)}M`;
  if (abs >= 1e3) return `${cur}${(v / 1e3).toFixed(2)}K`;
  return fmtMoney(v, cur);
}

function Skeleton() {
  return (
    <AppShell>
      <div className="space-y-5">
        <div className="h-6 w-48 rounded-lg bg-muted animate-pulse" />
        <div className="h-20 rounded-2xl bg-muted animate-pulse" />
        <div className="h-80 rounded-2xl bg-muted animate-pulse" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded-2xl bg-muted animate-pulse" />
          ))}
        </div>
      </div>
    </AppShell>
  );
}

function Notice({ title, hint, retry }: { title: string; hint?: string; retry?: () => void }) {
  return (
    <AppShell>
      <div className="space-y-5">
        <Link href="/markets" className="inline-flex items-center gap-2 text-[13px] font-medium text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft size={15} /> Markets
        </Link>
        <GlowCard className="text-center py-14">
          <WifiOff size={22} className="mx-auto text-muted-foreground mb-3" />
          <p className="font-display text-xl">{title}</p>
          {hint && <p className="text-[13px] text-muted-foreground mt-1.5">{hint}</p>}
          <div className="flex gap-2 justify-center mt-5">
            {retry && (
              <button onClick={retry} className="px-4 py-2 rounded-xl text-[13px] font-semibold bg-primary/10 text-primary border border-primary/25 hover:bg-primary/20 transition-all">
                Try again
              </button>
            )}
            <Link href="/markets" className="px-4 py-2 rounded-xl text-[13px] font-semibold border border-border text-muted-foreground hover:text-foreground hover:bg-accent transition-all">
              All markets
            </Link>
          </div>
        </GlowCard>
      </div>
    </AppShell>
  );
}

export default function TickerPage() {
  const params = useParams();
  const raw = Array.isArray(params.ticker) ? params.ticker[0] : params.ticker ?? "";
  const decoded = (() => { try { return decodeURIComponent(raw); } catch { return raw; } })();
  const param = decoded.trim().toUpperCase();

  const [range, setRange] = useState<HistoryRange>("1M");
  const [chartMode, setChartMode] = useState<"area" | "candles">("candles");

  const valid = isPlausibleSymbol(param);
  const universe = valid ? resolveTicker(param) : null;
  const yahooSymbol = universe ? universe.yahooSymbol : param;

  const { quotesByTicker, connected } = useMarketData({
    tickers: universe ? [universe.symbol] : [],
  });
  const live = universe ? quotesByTicker[universe.symbol] : undefined;

  const quoteQuery = useQuery({
    queryKey: ["ticker-quote", yahooSymbol],
    queryFn: () => getQuote(yahooSymbol),
    enabled: valid,
    refetchInterval: 20000,
    retry: 1,
  });

  const fundQuery = useQuery({
    queryKey: ["ticker-fundamentals", yahooSymbol],
    queryFn: () => getFundamentals(yahooSymbol),
    enabled: valid,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const histQuery = useQuery({
    queryKey: ["ticker-history", yahooSymbol, range],
    queryFn: () => getHistory(yahooSymbol, range),
    enabled: valid,
    staleTime: 60 * 1000,
    retry: 1,
  });

  const histMonth = useQuery({
    queryKey: ["ticker-history", yahooSymbol, "1M-skore"],
    queryFn: () => getHistory(yahooSymbol, "1M"),
    enabled: valid,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const histYear = useQuery({
    queryKey: ["ticker-history", yahooSymbol, "1Y-skore"],
    queryFn: () => getHistory(yahooSymbol, "1Y"),
    enabled: valid,
    staleTime: 30 * 60 * 1000,
    retry: 1,
  });

  const newsQuery = useQuery({
    queryKey: ["ticker-news"],
    queryFn: getNews,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const peers = useMemo(
    () => (valid ? relatedSymbols(param, universe?.category) : []),
    [valid, param, universe]
  );
  const peerQuery = useQuery({
    queryKey: ["ticker-peers", yahooSymbol],
    queryFn: () => getQuotes(peers.map(peerToQuery)),
    enabled: valid && peers.length > 0,
    refetchInterval: 30000,
    retry: 1,
  });

  const candles = useMemo(
    () => (histQuery.data?.data ?? []).map((c) => ({ time: c.time, open: c.open, high: c.high, low: c.low, close: c.close })),
    [histQuery.data]
  );
  const area = useMemo(
    () => candles.map((c) => ({ time: c.time, value: c.close })),
    [candles]
  );

  const skore = useMemo(() => {
    if (!histMonth.data?.data || !histYear.data?.data) return undefined;
    try {
      return computeSkore(histMonth.data.data, histYear.data.data);
    } catch {
      return null;
    }
  }, [histMonth.data, histYear.data]);

  const articles = useMemo(() => {
    const all = Array.isArray(newsQuery.data) ? newsQuery.data : [];
    const tokenSource = `${param} ${yahooSymbol} ${universe?.displayName ?? ""}`;
    const tokens = new Set(
      tokenSource.toUpperCase().split(/[^A-Z0-9]+/)
        .filter((t) => t.length >= 3 && !["THE", "AND", "FOR", "USD", "ETF", "FUND", "TRUST", "SHARES"].includes(t))
    );
    type NewsRow = { headline?: string; source?: string; time?: string; sentiment?: string; link?: string };
    const scored = (all as NewsRow[]).map((a) => {
      const head = String(a.headline ?? "").toUpperCase();
      let hits = 0;
      tokens.forEach((t) => { if (head.includes(t)) hits += t.length >= 5 ? 2 : 1; });
      return { a, hits };
    }).filter((x) => x.hits > 0).sort((x, y) => y.hits - x.hits).slice(0, 5).map((x) => ({ ...x.a, headline: x.a.headline ?? "" }));
    return scored;
  }, [newsQuery.data, param, yahooSymbol, universe]);

  if (!valid) {
    return <Notice title="Invalid ticker" hint={`"${decoded || "?"}" doesn't look like a market symbol.`} />;
  }

  const rest = quoteQuery.data ?? null;
  const fund: Fundamentals | null = fundQuery.data ?? null;
  const price = live?.price ?? rest?.price ?? null;
  const change = live?.change ?? rest?.change ?? 0;
  const changePercent = live?.changePercent ?? rest?.changePercent ?? 0;
  const isUp = change >= 0;
  const cur = currencyFor(yahooSymbol, fund?.currency ?? null);
  const name = fund?.name ?? universe?.displayName ?? param;
  const exchange = fund?.exchange ?? universe?.exchange ?? "—";
  const category = universe?.category.replace(/_/g, " ") ?? (isCryptoBear(yahooSymbol) ? "crypto" : "equity");

  const quoteFailed = quoteQuery.isError && !quoteQuery.data;
  const loadingQuote = quoteQuery.isLoading && price === null;

  if (loadingQuote && !quoteQuery.isError) {
    return <Skeleton />;
  }

  if (quoteFailed || (quoteQuery.isSuccess && price === null)) {
    return (
      <Notice
        title={`No data for ${param}`}
        hint="Yahoo Finance returned nothing for this symbol. Check the spelling or try again."
        retry={() => { void quoteQuery.refetch(); void fundQuery.refetch(); void histQuery.refetch(); }}
      />
    );
  }

  const vol = live?.volume ?? rest?.volume ?? 0;
  const dayHigh = live?.high ?? rest?.high ?? 0;
  const dayLow = live?.low ?? rest?.low ?? 0;
  const wHigh = fund?.fiftyTwoWeekHigh ?? null;
  const wLow = fund?.fiftyTwoWeekLow ?? null;
  const wPos = wHigh && wLow && wHigh > wLow && price !== null
    ? Math.min(100, Math.max(0, ((price - wLow) / (wHigh - wLow)) * 100))
    : null;

  const fundRows: { label: string; value: string }[] = [
    { label: "Market Cap", value: fund?.marketCap ? fmtCompact(fund.marketCap, cur) : "N/A" },
    { label: "P/E (TTM)", value: fund?.trailingPE ? fund.trailingPE.toFixed(2) : "N/A" },
    { label: "P/E (Fwd)", value: fund?.forwardPE ? fund.forwardPE.toFixed(2) : "N/A" },
    { label: "EPS (TTM)", value: fund?.trailingEps ? fmtMoney(fund.trailingEps, cur) : "N/A" },
    { label: "Div Yield", value: fund?.dividendYield ? `${(fund.dividendYield * 100).toFixed(2)}%` : "N/A" },
    { label: "Beta", value: fund?.beta ? fund.beta.toFixed(2) : "N/A" },
  ];

  return (
    <AppShell>
      <motion.div variants={container} initial="hidden" animate="show" className="space-y-5">
        <motion.div variants={item}>
          <Link href="/markets" className="inline-flex items-center gap-2 text-[13px] font-medium text-muted-foreground hover:text-foreground transition-colors mb-3">
            <ArrowLeft size={15} /> Markets
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="font-display text-[26px] leading-tight">{name}</h1>
                {live?.stale && (
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                    CACHED
                  </span>
                )}
              </div>
              <p className="eyebrow mt-1">{param} · {exchange} · {category}</p>
              <div className="flex items-baseline gap-2.5 mt-2">
                <span className="font-display text-[34px] tabular-nums">
                  {price !== null ? fmtMoney(price, cur) : "—"}
                </span>
                <span className={`text-sm font-semibold tabular-nums ${isUp ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
                  {isUp ? "+" : ""}{change.toFixed(2)} ({isUp ? "+" : ""}{changePercent.toFixed(2)}%)
                </span>
              </div>
            </div>
            <LivePulse label={connected && universe ? "LIVE" : "AUTO"} />
          </div>
        </motion.div>

        <motion.div variants={item}>
          <GlowCard className="!p-4">
            <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
              <div className="flex gap-1 p-1 rounded-xl bg-accent/60 border border-border">
                {HISTORY_RANGES.map((r) => (
                  <button key={r} onClick={() => setRange(r)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      range === r ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"
                    }`}>
                    {r}
                  </button>
                ))}
              </div>
              <div className="flex gap-1 p-1 rounded-xl bg-accent/60 border border-border">
                {(["candles", "area"] as const).map((m) => (
                  <button key={m} onClick={() => setChartMode(m)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                      chartMode === m ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"
                    }`}>
                    {m === "candles" ? "Candles" : "Area"}
                  </button>
                ))}
              </div>
            </div>
            <div className="h-[340px] sm:h-[400px]">
              {histQuery.isLoading ? (
                <div className="h-full rounded-xl bg-muted animate-pulse" />
              ) : histQuery.isError || candles.length === 0 ? (
                <div className="h-full rounded-xl border border-dashed border-border flex flex-col items-center justify-center gap-2 text-center px-6">
                  <p className="text-sm font-medium">No chart data for this range</p>
                  <p className="text-xs text-muted-foreground">Yahoo Finance returned nothing. Try another range.</p>
                  <button onClick={() => void histQuery.refetch()} className="mt-1 px-4 py-2 rounded-xl text-xs font-semibold bg-primary/10 text-primary border border-primary/25 hover:bg-primary/20 transition-all">
                    Retry
                  </button>
                </div>
              ) : (
                <TradingViewChart
                  data={area}
                  candles={candles}
                  mode={chartMode}
                  liveValue={price}
                  up={isUp}
                  currencyPrefix={cur}
                />
              )}
            </div>
          </GlowCard>
        </motion.div>

        <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: "Volume", value: vol > 0 ? vol.toLocaleString("en-US") : "—" },
            { label: "Day High", value: dayHigh > 0 ? fmtMoney(dayHigh, cur) : "—" },
            { label: "Day Low", value: dayLow > 0 ? fmtMoney(dayLow, cur) : "—" },
            { label: "Prev Close", value: (live?.prevClose ?? rest?.prevClose) ? fmtMoney((live?.prevClose ?? rest?.prevClose) as number, cur) : "—" },
          ].map((s) => (
            <GlowCard key={s.label} className="!p-4">
              <p className="eyebrow">{s.label}</p>
              <p className="text-[17px] font-semibold mt-1 tabular-nums">{s.value}</p>
            </GlowCard>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <motion.div variants={item}>
            <GlowCard>
              <h3 className="font-display text-[17px] mb-4">Fundamentals</h3>
              {fundQuery.isLoading ? (
                <div className="space-y-2.5">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="h-5 rounded-md bg-muted animate-pulse" />
                  ))}
                </div>
              ) : (
                <div>
                  {fundRows.map((r) => (
                    <div key={r.label} className="flex justify-between items-center px-2 py-2 rounded-lg hover:bg-accent/50 transition-colors">
                      <span className="text-[13px] text-muted-foreground">{r.label}</span>
                      <span className="text-[13px] font-semibold tabular-nums">{r.value}</span>
                    </div>
                  ))}
                  {wHigh !== null && wLow !== null && (
                    <div className="px-2 pt-3">
                      <div className="flex justify-between text-[11px] text-muted-foreground mb-1.5 tabular-nums">
                        <span>{fmtMoney(wLow, cur)}</span>
                        <span className="font-semibold text-foreground">52-week range</span>
                        <span>{fmtMoney(wHigh, cur)}</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-accent overflow-hidden relative">
                        <div className="absolute inset-y-0 left-0 rounded-full bg-primary" style={{ width: `${wPos ?? 0}%` }} />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </GlowCard>
          </motion.div>

          <motion.div variants={item}>
            <GlowCard>
              <div className="flex items-baseline justify-between mb-1">
                <h3 className="font-display text-[17px]">SKORE</h3>
                {skore && (
                  <span className={`text-sm font-bold ${skore.score >= 50 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
                    {skore.score} · {skore.label}
                  </span>
                )}
              </div>
              {!histMonth.data || !histYear.data ? (
                <div className="space-y-2.5 pt-2">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="h-5 rounded-md bg-muted animate-pulse" />
                  ))}
                </div>
              ) : !skore ? (
                <p className="text-[13px] text-muted-foreground pt-2">Not enough history to score this asset yet.</p>
              ) : (
                <div className="space-y-3 pt-2">
                  {skore.components.map((c) => (
                    <div key={c.key}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-muted-foreground">{c.label} <span className="text-muted-foreground/60">· {c.weight}%</span></span>
                        <span className="font-semibold tabular-nums">{c.score}</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-accent overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${c.score}%` }}
                          transition={{ duration: 0.6, ease: "easeOut" }}
                          className={`h-full rounded-full ${c.score >= 50 ? "bg-emerald-500" : "bg-red-500"}`}
                        />
                      </div>
                      <p className="text-[11px] text-muted-foreground/80 mt-1">{c.detail}</p>
                    </div>
                  ))}
                  <p className="text-[11px] text-muted-foreground/70 pt-1">Technical composite from real price history — momentum 40 · trend 25 · stability 25 · accumulation 10. Not financial advice.</p>
                </div>
              )}
            </GlowCard>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <motion.div variants={item}>
            <GlowCard>
              <h3 className="font-display text-[17px] mb-3">Related</h3>
              {peerQuery.isLoading ? (
                <div className="space-y-0.5">
                  {[0, 1, 2, 3].map((i) => (
                    <div key={i} className="flex justify-between px-3 py-2.5">
                      <div className="h-4 w-20 rounded-md bg-muted animate-pulse" />
                      <div className="h-4 w-16 rounded-md bg-muted animate-pulse" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-0.5">
                  {(peerQuery.data ?? []).map((p: { symbol: string; price: number; changePercent: number }) => {
                    const entry = resolveTicker(p.symbol);
                    const link = `/markets/${encodeURIComponent(entry ? entry.symbol : p.symbol)}`;
                    const upNow = (p.changePercent ?? 0) >= 0;
                    return (
                      <Link key={p.symbol} href={link} className="flex justify-between items-center px-3 py-2.5 rounded-xl hover:bg-accent/60 transition-colors">
                        <span className="text-sm font-semibold">{entry ? entry.symbol : p.symbol}</span>
                        <span className="text-right">
                          <span className="text-sm font-semibold tabular-nums block">{fmtMoney(p.price ?? 0, cur)}</span>
                          <span className={`text-xs font-semibold tabular-nums ${upNow ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
                            {upNow ? "+" : ""}{(p.changePercent ?? 0).toFixed(2)}%
                          </span>
                        </span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </GlowCard>
          </motion.div>

          <motion.div variants={item}>
            <GlowCard>
              <h3 className="font-display text-[17px] mb-3">Latest articles</h3>
              {newsQuery.isLoading ? (
                <div className="space-y-2.5">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="h-12 rounded-xl bg-muted animate-pulse" />
                  ))}
                </div>
              ) : newsQuery.isError ? (
                <p className="text-[13px] text-muted-foreground">News feed unavailable right now.</p>
              ) : articles.length === 0 ? (
                <p className="text-[13px] text-muted-foreground">No related articles right now.</p>
              ) : (
                <div className="space-y-2">
                  <AnimatePresence initial={false}>
                    {articles.map((a, i) => (
                      <motion.div
                        key={`${a.headline}-${i}`}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: Math.min(i * 0.05, 0.25) }}
                      >
                        {a.link ? (
                          <a href={a.link} target="_blank" rel="noreferrer" className="block p-3 rounded-xl border border-border hover:bg-accent/50 transition-colors">
                            <ArticleBody a={a} />
                          </a>
                        ) : (
                          <div className="p-3 rounded-xl border border-border">
                            <ArticleBody a={a} />
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </GlowCard>
          </motion.div>
        </div>
      </motion.div>
    </AppShell>
  );
}

function ArticleBody({ a }: { a: { headline: string; source?: string; time?: string; sentiment?: string } }) {
  return (
    <>
      <p className="text-[13px] font-medium leading-snug">{a.headline}</p>
      <div className="flex items-center gap-2.5 mt-1.5 text-[11px] text-muted-foreground">
        {a.source && <span className="font-medium">{a.source}</span>}
        {a.time && <span>{a.time}</span>}
        {a.sentiment && (
          <span className={`font-semibold px-1.5 py-px rounded-full ${
            a.sentiment === "Bullish" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-red-500/10 text-red-600 dark:text-red-400"
          }`}>
            {a.sentiment}
          </span>
        )}
      </div>
    </>
  );
}
