"use client";

import {
  createChart,
  ColorType,
  CrosshairMode,
  LineType,
  AreaSeries,
  CandlestickSeries,
  type IChartApi,
  type ISeriesApi,
  type UTCTimestamp,
} from "lightweight-charts";
import { useEffect, useRef, useState } from "react";

export type ChartPoint = { time: number; value: number };
export type CandlePoint = { time: number; open: number; high: number; low: number; close: number };

interface BeastChartProps {
  data: ChartPoint[];
  candles?: CandlePoint[];
  mode?: "area" | "candles";
  liveValue?: number | null;
  up?: boolean;
  height?: number;
  currencyPrefix?: string;
}

const UP = "#7fb069";
const DOWN = "#d96a4b";

function fmt(n: number): string {
  return n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtTime(t: number): string {
  const d = new Date(t * 1000);
  const now = new Date();
  if (d.toDateString() === now.toDateString()) {
    return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  }
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

type AnySeries = ISeriesApi<"Area"> | ISeriesApi<"Candlestick">;

export function TradingViewChart({
  data,
  candles = [],
  mode = "area",
  liveValue = null,
  up = true,
  height,
  currencyPrefix = "₹",
}: BeastChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<AnySeries | null>(null);
  const lastTimeRef = useRef<number>(0);
  const lastCandleRef = useRef<CandlePoint | null>(null);
  const [cursor, setCursor] = useState<{ price: number; time: number } | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  const line = up ? UP : DOWN;

  useEffect(() => {
    if (!containerRef.current) return;
    const el = containerRef.current;

    const chart = createChart(el, {
      autoSize: true,
      layout: {
        attributionLogo: false,
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: "#a39a8b",
        fontFamily: `-apple-system, BlinkMacSystemFont, "SF Pro Text", Inter, sans-serif`,
        fontSize: 11,
      },
      grid: {
        vertLines: { visible: false },
        horzLines: { color: "rgba(236,230,219,0.05)" },
      },
      timeScale: {
        borderVisible: false,
        timeVisible: true,
        secondsVisible: false,
        rightOffset: 2,
      },
      rightPriceScale: { borderVisible: false },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: { color: "rgba(217,119,87,0.5)", width: 1, style: 2, labelBackgroundColor: "#d97757" },
        horzLine: { color: "rgba(217,119,87,0.5)", width: 1, style: 2, labelBackgroundColor: "#d97757" },
      },
      handleScroll: { mouseWheel: false, pressedMouseMove: true, horzTouchDrag: true, vertTouchDrag: false },
      handleScale: { axisPressedMouseMove: false, mouseWheel: false, pinch: false },
    });
    chartRef.current = chart;

    if (mode === "candles") {
      const series = chart.addSeries(CandlestickSeries, {
        upColor: UP,
        downColor: DOWN,
        borderVisible: false,
        wickUpColor: UP,
        wickDownColor: DOWN,
        priceLineColor: line,
        priceLineStyle: 2,
        priceLineWidth: 1,
      });
      seriesRef.current = series;
    } else {
      const series = chart.addSeries(AreaSeries, {
        lineColor: line,
        lineWidth: 2,
        lineType: LineType.Curved,
        topColor: up ? "rgba(127,176,105,0.32)" : "rgba(217,106,75,0.32)",
        bottomColor: up ? "rgba(127,176,105,0.0)" : "rgba(217,106,75,0.0)",
        priceLineColor: line,
        priceLineStyle: 2,
        priceLineWidth: 1,
        lastValueVisible: true,
        priceLineVisible: true,
        crosshairMarkerVisible: true,
        crosshairMarkerRadius: 4,
        crosshairMarkerBorderColor: line,
        crosshairMarkerBackgroundColor: "#171310",
      });
      seriesRef.current = series;
    }

    chart.subscribeCrosshairMove((param) => {
      if (!param.time || !seriesRef.current) {
        setCursor(null);
        return;
      }
      const v = param.seriesData.get(seriesRef.current) as
        | { value?: number; close?: number }
        | undefined;
      const price = v ? (v.close ?? v.value) : undefined;
      if (typeof price === "number") {
        setCursor({ price, time: param.time as number });
      } else {
        setCursor(null);
      }
    });

    const ro = new ResizeObserver(() => {
      chart.applyOptions({ width: el.clientWidth, height: el.clientHeight });
    });
    ro.observe(el);

    return () => {
      ro.disconnect();
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  useEffect(() => {
    if (mode !== "area") return;
    seriesRef.current?.applyOptions({
      lineColor: line,
      topColor: up ? "rgba(127,176,105,0.32)" : "rgba(217,106,75,0.32)",
      bottomColor: up ? "rgba(127,176,105,0.0)" : "rgba(217,106,75,0.0)",
      priceLineColor: line,
      crosshairMarkerBorderColor: line,
    });
  }, [line, up, mode]);

  useEffect(() => {
    if (!seriesRef.current) return;
    if (mode === "candles") {
      const clean = candles
        .filter((c) => [c.time, c.open, c.high, c.low, c.close].every(Number.isFinite))
        .sort((a, b) => a.time - b.time);
      const seen = new Set<number>();
      const rows = clean.filter((c) => (seen.has(c.time) ? false : (seen.add(c.time), true)));
      if (rows.length === 0) return;
      (seriesRef.current as ISeriesApi<"Candlestick">).setData(
        rows as { time: UTCTimestamp; open: number; high: number; low: number; close: number }[]
      );
      lastTimeRef.current = rows[rows.length - 1].time;
      lastCandleRef.current = rows[rows.length - 1];
      chartRef.current?.timeScale().fitContent();
      return;
    }
    const clean = data
      .filter((d) => Number.isFinite(d.time) && Number.isFinite(d.value))
      .sort((a, b) => a.time - b.time);
    const seen = new Set<number>();
    const rows = clean.filter((d) => (seen.has(d.time) ? false : (seen.add(d.time), true)));
    if (rows.length === 0) return;
    (seriesRef.current as ISeriesApi<"Area">).setData(rows as { time: UTCTimestamp; value: number }[]);
    lastTimeRef.current = rows[rows.length - 1].time;
    chartRef.current?.timeScale().fitContent();
  }, [data, candles, mode]);

  useEffect(() => {
    if (!seriesRef.current || liveValue === null || !Number.isFinite(liveValue)) return;
    const t = lastTimeRef.current || Math.floor(Date.now() / 1000);
    try {
      if (mode === "candles" && lastCandleRef.current) {
        const base = lastCandleRef.current;
        const next = {
          time: t as UTCTimestamp,
          open: base.open,
          high: Math.max(base.high, liveValue),
          low: Math.min(base.low, liveValue),
          close: liveValue,
        };
        (seriesRef.current as ISeriesApi<"Candlestick">).update(next);
        lastCandleRef.current = { ...next, time: t };
      } else {
        (seriesRef.current as ISeriesApi<"Area">).update({ time: t as UTCTimestamp, value: liveValue });
      }
    } catch {
      return;
    }
  }, [liveValue, mode]);

  const lastArea = data.length > 0 ? data[data.length - 1] : null;
  const lastPropCandle = candles.length > 0 ? candles[candles.length - 1] : null;
  const fallback = mode === "candles"
    ? lastPropCandle ? { price: liveValue ?? lastPropCandle.close, time: lastPropCandle.time } : null
    : lastArea ? { price: liveValue ?? lastArea.value, time: lastArea.time } : null;
  const shown = cursor ?? fallback;

  return (
    <div ref={containerRef} className="relative w-full h-full" style={height ? { height } : undefined}>
      {mounted && shown && (
        <div className="absolute top-2 left-3 z-10 pointer-events-none">
          <p className="text-lg font-semibold tracking-tight tabular-nums">{currencyPrefix}{fmt(shown.price)}</p>
          <p className="text-[11px] text-muted-foreground tabular-nums">{fmtTime(shown.time)}</p>
        </div>
      )}
    </div>
  );
}
