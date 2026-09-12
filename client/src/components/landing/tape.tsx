"use client";

import { useMarketData } from "@/hooks/useMarketData";

const SYMBOLS = ["NIFTY", "SENSEX", "BTC", "ETH", "SPX", "NDX", "GLD", "SOL"];

export function Tape() {
  const { quotesByTicker } = useMarketData({ tickers: SYMBOLS });

  const items = SYMBOLS.map((s) => {
    const q = quotesByTicker[s];
    return { symbol: s, price: q?.price ?? null, up: (q?.changePercent ?? 0) >= 0, pct: q?.changePercent ?? null };
  });

  const row = (hidden: boolean) => (
    <div aria-hidden={hidden} className="flex shrink-0 items-center">
      {items.map((t) => (
        <span key={t.symbol} className="mx-5 inline-flex items-baseline gap-2 text-[13px] whitespace-nowrap">
          <span className="font-semibold tracking-wide">{t.symbol}</span>
          {t.price !== null && t.pct !== null ? (
            <span className={`tabular-nums ${t.up ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
              {t.price.toLocaleString("en-US", { maximumFractionDigits: 2 })} ({t.up ? "+" : ""}{t.pct.toFixed(2)}%)
            </span>
          ) : (
            <span className="text-muted-foreground/50">···</span>
          )}
          <span className="ml-3 inline-block h-1 w-1 rounded-full bg-primary/50" />
        </span>
      ))}
    </div>
  );

  return (
    <div className="relative w-screen left-1/2 -translate-x-1/2 overflow-hidden border-y border-border bg-card/60 py-2.5 backdrop-blur">
      <div className="tape-track flex w-max">
        {row(false)}
        {row(true)}
      </div>
    </div>
  );
}
