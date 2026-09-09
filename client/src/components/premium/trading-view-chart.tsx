"use client";

import {
  createChart,
  ColorType,
  CrosshairMode,
  LineType,
  AreaSeries,
  type IChartApi,
  type ISeriesApi,
  type UTCTimestamp,
} from "lightweight-charts";
import { useEffect, useRef, useState } from "react";

export type ChartPoint = { time: number; value: number };

interface BeastChartProps {
  data: ChartPoint[];
  /** Live tick — streams into the last bar without rebuilding the chart. */
  liveValue?: number | null;
  up?: boolean;
  height?: number;
}

function fmt(n: number): string {
  return n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtTime(t: number): string {
  const d = new Date(t * 1000);
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  if (sameDay) {
    return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  }
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

export function TradingViewChart({ data, liveValue = null, up = true }: BeastChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Area"> | null>(null);
  const lastTimeRef = useRef<number>(0);
  const [cursor, setCursor] = useState<{ price: number; time: number } | null>(null);

  const line = up ? "#7fb069" : "#d96a4b";

  // Create once
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

    chart.subscribeCrosshairMove((param) => {
      if (!param.time || !seriesRef.current) {
        setCursor(null);
        return;
      }
      const v = param.seriesData.get(seriesRef.current) as { value?: number } | undefined;
      if (v && typeof v.value === "number") {
        setCursor({ price: v.value, time: param.time as number });
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
  }, []);

  // Recolor when trend flips (no rebuild)
  useEffect(() => {
    seriesRef.current?.applyOptions({
      lineColor: line,
      topColor: up ? "rgba(127,176,105,0.32)" : "rgba(217,106,75,0.32)",
      bottomColor: up ? "rgba(127,176,105,0.0)" : "rgba(217,106,75,0.0)",
      priceLineColor: line,
      crosshairMarkerBorderColor: line,
    });
  }, [line, up]);

  // Full data sets (timeframe switches)
  useEffect(() => {
    if (!seriesRef.current || data.length === 0) return;
    const clean = data
      .filter((d) => Number.isFinite(d.time) && Number.isFinite(d.value))
      .sort((a, b) => a.time - b.time);
    // de-dupe timestamps (lightweight-charts rejects duplicates)
    const seen = new Set<number>();
    const rows = clean.filter((d) => (seen.has(d.time) ? false : (seen.add(d.time), true)));
    if (rows.length === 0) return;
    seriesRef.current.setData(rows as { time: UTCTimestamp; value: number }[]);
    lastTimeRef.current = rows[rows.length - 1].time;
    chartRef.current?.timeScale().fitContent();
  }, [data]);

  // Live tick streams into the last bar
  useEffect(() => {
    if (!seriesRef.current || liveValue === null || !Number.isFinite(liveValue)) return;
    const t = lastTimeRef.current || Math.floor(Date.now() / 1000);
    try {
      seriesRef.current.update({ time: t as UTCTimestamp, value: liveValue });
    } catch {
      // out-of-order tick — ignore, next full set will correct it
    }
  }, [liveValue]);

  const shown = cursor ?? (data.length > 0 ? { price: liveValue ?? data[data.length - 1].value, time: lastTimeRef.current || data[data.length - 1].time } : null);

  return (
    <div ref={containerRef} className="relative w-full h-full">
      {shown && (
        <div className="absolute top-2 left-3 z-10 pointer-events-none">
          <p className="text-lg font-semibold tracking-tight tabular-nums">₹{fmt(shown.price)}</p>
          <p className="text-[11px] text-muted-foreground tabular-nums">{fmtTime(shown.time)}</p>
        </div>
      )}
    </div>
  );
}
