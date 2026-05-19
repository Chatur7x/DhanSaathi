"use client";

import { createChart, ColorType, IChartApi, ISeriesApi } from "lightweight-charts";
import React, { useEffect, useRef } from "react";

interface TradingViewChartProps {
  data: { time: string | number; value?: number; open?: number; high?: number; low?: number; close?: number }[];
  type?: "area" | "candlestick";
  colors?: {
    backgroundColor?: string;
    lineColor?: string;
    textColor?: string;
    areaTopColor?: string;
    areaBottomColor?: string;
  };
}

export function TradingViewChart({
  data,
  type = "area",
  colors: {
    backgroundColor = "transparent",
    lineColor = "#6366f1",
    textColor = "#64748b",
    areaTopColor = "rgba(99, 102, 241, 0.4)",
    areaBottomColor = "rgba(99, 102, 241, 0.0)",
  } = {},
}: TradingViewChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Area"> | ISeriesApi<"Candlestick"> | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const handleResize = () => {
      chartRef.current?.applyOptions({ width: chartContainerRef.current?.clientWidth });
    };

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: backgroundColor },
        textColor,
      },
      grid: {
        vertLines: { color: "rgba(255,255,255,0.03)" },
        horzLines: { color: "rgba(255,255,255,0.03)" },
      },
      width: chartContainerRef.current.clientWidth,
      height: chartContainerRef.current.clientHeight,
      timeScale: {
        borderVisible: false,
        timeVisible: true,
        secondsVisible: false,
      },
      rightPriceScale: {
        borderVisible: false,
      },
      handleScroll: {
        mouseWheel: false,
        pressedMouseMove: false,
      },
      handleScale: {
        axisPressedMouseMove: false,
        mouseWheel: false,
        pinch: false,
      }
    });

    chartRef.current = chart;

    if (type === "area") {
      const series = chart.addAreaSeries({
        lineColor,
        topColor: areaTopColor,
        bottomColor: areaBottomColor,
        lineWidth: 2,
      });
      series.setData(data as any);
      seriesRef.current = series as any;
    } else {
      const series = chart.addCandlestickSeries({
        upColor: '#10b981',
        downColor: '#ef4444',
        borderVisible: false,
        wickUpColor: '#10b981',
        wickDownColor: '#ef4444'
      });
      series.setData(data as any);
      seriesRef.current = series as any;
    }

    chart.timeScale().fitContent();

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
    };
  }, [data, type, backgroundColor, lineColor, textColor, areaTopColor, areaBottomColor]);

  // Update data if it changes
  useEffect(() => {
    if (seriesRef.current && data) {
      seriesRef.current.setData(data as any);
      chartRef.current?.timeScale().fitContent();
    }
  }, [data]);

  return <div ref={chartContainerRef} className="w-full h-full" />;
}
