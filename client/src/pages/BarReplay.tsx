import React, { useState, useRef, useEffect } from 'react';
import { createChart, IChartApi, ColorType, CrosshairMode, LineStyle } from 'lightweight-charts';

const BarReplay: React.FC = () => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<IChartApi | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentBar, setCurrentBar] = useState(0);
  const [speed, setSpeed] = useState(500);
  const [totalBars] = useState(300);
  const dataRef = useRef<any[]>([]);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    const chart = createChart(chartRef.current, {
      width: chartRef.current.clientWidth,
      height: chartRef.current.clientHeight,
      layout: { background: { type: ColorType.Solid, color: '#1a1a2e' }, textColor: '#d1d5db' },
      grid: { vertLines: { color: '#2d2d3d' }, horzLines: { color: '#2d2d3d' } },
      crosshair: { mode: CrosshairMode.Normal },
    });

    chartInstance.current = chart;

    // Generate sample data
    const data = [];
    let price = 22450;
    const now = Math.floor(Date.now() / 1000);
    for (let i = totalBars; i >= 0; i--) {
      const time = (now - i * 900) as any;
      const open = price;
      const change = (Math.random() - 0.48) * 50;
      const close = price + change;
      const high = Math.max(open, close) + Math.random() * 20;
      const low = Math.min(open, close) - Math.random() * 20;
      data.push({ time, open, high, low, close, volume: Math.floor(Math.random() * 1000000) });
      price = close;
    }
    dataRef.current = data;

    // Add candlestick series
    const series = chart.addSeries('Candlestick' as any, {
      upColor: '#26a69a', downColor: '#ef5350', borderVisible: false,
    });
    series.setData(data.slice(0, 1)); // Start with 1 bar

    const handleResize = () => {
      if (chartRef.current) {
        chart.applyOptions({ width: chartRef.current.clientWidth, height: chartRef.current.clientHeight });
      }
    };
    const observer = new ResizeObserver(handleResize);
    observer.observe(chartRef.current);

    return () => { observer.disconnect(); chart.remove(); };
  }, []);

  const play = () => {
    if (isPlaying) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setIsPlaying(false);
      return;
    }
    setIsPlaying(true);
    intervalRef.current = setInterval(() => {
      setCurrentBar(prev => {
        const next = prev + 1;
        if (next >= totalBars) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          setIsPlaying(false);
          return prev;
        }
        if (chartInstance.current) {
          const series = chartInstance.current.addSeries('Candlestick' as any, {});
          chartInstance.current.removeSeries(series);
          const newSeries = chartInstance.current.addSeries('Candlestick' as any, {
            upColor: '#26a69a', downColor: '#ef5350', borderVisible: false,
          });
          newSeries.setData(dataRef.current.slice(0, next + 1));
        }
        return next;
      });
    }, speed) as any;
  };

  const jumpTo = (bar: number) => {
    setCurrentBar(bar);
    if (chartInstance.current) {
      const series = chartInstance.current.addSeries('Candlestick' as any, {});
      chartInstance.current.removeSeries(series);
      const newSeries = chartInstance.current.addSeries('Candlestick' as any, {
        upColor: '#26a69a', downColor: '#ef5350', borderVisible: false,
      });
      newSeries.setData(dataRef.current.slice(0, bar + 1));
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-950">
      <div className="bg-gray-900 border-b border-gray-700 p-3 flex items-center justify-between">
        <h1 className="text-xl font-bold text-white">Bar Replay</h1>
        <div className="flex items-center space-x-3">
          <button onClick={() => jumpTo(0)} className="bg-gray-800 hover:bg-gray-700 text-white px-3 py-1 rounded text-xs">⏮ First</button>
          <button onClick={() => jumpTo(Math.max(0, currentBar - 10))} className="bg-gray-800 hover:bg-gray-700 text-white px-3 py-1 rounded text-xs">⏪ -10</button>
          <button onClick={play} className={`px-4 py-1 rounded text-xs font-medium ${isPlaying ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'} text-white`}>
            {isPlaying ? '⏸ Pause' : '▶ Play'}
          </button>
          <button onClick={() => jumpTo(Math.min(totalBars, currentBar + 10))} className="bg-gray-800 hover:bg-gray-700 text-white px-3 py-1 rounded text-xs">⏩ +10</button>
          <button onClick={() => jumpTo(totalBars)} className="bg-gray-800 hover:bg-gray-700 text-white px-3 py-1 rounded text-xs">⏭ Last</button>
          <select value={speed} onChange={e => setSpeed(+e.target.value)} className="bg-gray-800 border border-gray-600 rounded px-2 py-1 text-xs text-white">
            <option value={1000}>1x (1s)</option>
            <option value={500}>2x (0.5s)</option>
            <option value={200}>5x (0.2s)</option>
            <option value={100}>10x (0.1s)</option>
            <option value={50}>20x (0.05s)</option>
          </select>
        </div>
      </div>
      <div className="flex-1 relative">
        <div ref={chartRef} className="absolute inset-0" />
      </div>
      <div className="bg-gray-900 border-t border-gray-700 p-2">
        <div className="flex items-center space-x-2">
          <input type="range" min={0} max={totalBars} value={currentBar} onChange={e => jumpTo(+e.target.value)} className="flex-1" />
          <span className="text-xs text-gray-400">Bar {currentBar} / {totalBars}</span>
        </div>
      </div>
    </div>
  );
};

export default BarReplay;
