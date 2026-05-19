import React, { useState, useRef, useEffect } from 'react';
import { createChart, IChartApi, ISeriesApi, CrosshairMode, LineStyle, ColorType, SeriesType } from 'lightweight-charts';
import { useMarketStore } from '../../store/marketStore';

// Heikin-Ashi data transformer
const toHeikinAshi = (data: any[]) => {
  if (data.length === 0) return [];
  const result = [];
  let prevHA = { open: 0, high: 0, low: 0, close: 0 };
  
  for (let i = 0; i < data.length; i++) {
    const d = data[i];
    const haClose = (d.open + d.high + d.low + d.close) / 4;
    const haOpen = i === 0 ? (d.open + d.close) / 2 : (prevHA.open + prevHA.close) / 2;
    const haHigh = Math.max(d.high, haOpen, haClose);
    const haLow = Math.min(d.low, haOpen, haClose);
    
    result.push({ time: d.time, open: haOpen, high: haHigh, low: haLow, close: haClose, volume: d.volume });
    prevHA = { open: haOpen, high: haHigh, low: haLow, close: haClose };
  }
  return result;
};

// Renko data transformer
const toRenko = (data: any[], boxSize = 10) => {
  if (data.length === 0) return [];
  const result = [];
  let lastPrice = data[0].close;
  
  for (const d of data) {
    const price = d.close;
    const bricks = Math.floor(Math.abs(price - lastPrice) / boxSize);
    
    for (let i = 0; i < bricks; i++) {
      const direction = price > lastPrice ? 1 : -1;
      result.push({
        time: d.time,
        open: lastPrice,
        high: direction > 0 ? lastPrice + boxSize : lastPrice,
        low: direction > 0 ? lastPrice : lastPrice - boxSize,
        close: lastPrice + direction * boxSize,
        volume: d.volume
      });
      lastPrice += direction * boxSize;
    }
  }
  return result;
};

// Point & Figure transformer
const toPointAndFigure = (data: any[], boxSize = 10, reversal = 3) => {
  if (data.length === 0) return [];
  const result = [];
  let currentColumn = 'X'; // X for up, O for down
  let lastPoint = data[0].close;
  
  for (const d of data) {
    const price = d.close;
    const boxes = Math.floor(Math.abs(price - lastPoint) / boxSize);
    
    if (boxes >= reversal) {
      currentColumn = currentColumn === 'X' ? 'O' : 'X';
    }
    
    for (let i = 0; i < boxes; i++) {
      const direction = currentColumn === 'X' ? 1 : -1;
      result.push({
        time: d.time,
        open: lastPoint,
        high: direction > 0 ? lastPoint + boxSize : lastPoint,
        low: direction > 0 ? lastPoint : lastPoint - boxSize,
        close: lastPoint + direction * boxSize,
        volume: d.volume,
        column: currentColumn
      });
      lastPoint += direction * boxSize;
    }
  }
  return result;
};

const ALL_CHART_TYPES = [
  { id: 'Candlestick', label: 'Candlestick' },
  { id: 'Bar', label: 'Bar' },
  { id: 'Line', label: 'Line' },
  { id: 'Area', label: 'Area' },
  { id: 'Baseline', label: 'Baseline' },
  { id: 'Histogram', label: 'Histogram' },
  { id: 'HeikinAshi', label: 'Heikin-Ashi' },
  { id: 'Renko', label: 'Renko' },
  { id: 'PointFigure', label: 'Point & Figure' },
  { id: 'LineBreak', label: 'Line Break' },
  { id: 'Kagi', label: 'Kagi' },
];

const AdvancedChart: React.FC<{ symbol?: string }> = ({ symbol = 'NIFTY' }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<any> | null>(null);
  const [chartType, setChartType] = useState('Candlestick');
  const [showIndicators, setShowIndicators] = useState(false);
  const [activeIndicators, setActiveIndicators] = useState<string[]>([]);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: chartContainerRef.current.clientHeight,
      layout: { background: { type: ColorType.Solid, color: '#1a1a2e' }, textColor: '#d1d5db', fontSize: 11 },
      grid: { vertLines: { color: '#2d2d3d', style: LineStyle.Solid }, horzLines: { color: '#2d2d3d', style: LineStyle.Solid } },
      crosshair: { mode: CrosshairMode.Normal },
      timeScale: { timeVisible: true, secondsVisible: false, borderColor: '#2d2d3d' },
      rightPriceScale: { borderColor: '#2d2d3d' },
    });

    chartRef.current = chart;
    const data = generateData();
    updateSeries(chart, chartType, data);

    const observer = new ResizeObserver(() => {
      if (chartContainerRef.current) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth, height: chartContainerRef.current.clientHeight });
      }
    });
    observer.observe(chartContainerRef.current);

    return () => { observer.disconnect(); chart.remove(); };
  }, []);

  const generateData = () => {
    const data: any[] = [];
    let price = 22450;
    const now = Math.floor(Date.now() / 1000);
    for (let i = 300; i >= 0; i--) {
      const time = (now - i * 900) as any;
      const open = price;
      const change = (Math.random() - 0.48) * 50;
      const close = price + change;
      const high = Math.max(open, close) + Math.random() * 20;
      const low = Math.min(open, close) - Math.random() * 20;
      data.push({ time, open, high, low, close, volume: Math.floor(Math.random() * 1000000) });
      price = close;
    }
    return data;
  };

  const updateSeries = (chart: IChartApi, type: string, data: any[]) => {
    if (seriesRef.current) { chart.removeSeries(seriesRef.current); }

    let chartData = data;
    if (type === 'HeikinAshi') chartData = toHeikinAshi(data);
    else if (type === 'Renko') chartData = toRenko(data);
    else if (type === 'PointFigure') chartData = toPointAndFigure(data);

    let series: ISeriesApi<any>;
    if (type === 'Candlestick' || type === 'HeikinAshi') {
      series = chart.addSeries('Candlestick' as any, { upColor: '#26a69a', downColor: '#ef5350', borderVisible: false });
      series.setData(chartData);
    } else if (type === 'Bar') {
      series = chart.addSeries('Bar' as any, { upColor: '#26a69a', downColor: '#ef5350' });
      series.setData(chartData);
    } else if (['Line', 'Area', 'Baseline'].includes(type)) {
      const seriesType = type as SeriesType;
      const options: any = type === 'Area' 
        ? { topColor: 'rgba(59, 130, 246, 0.4)', bottomColor: 'rgba(59, 130, 246, 0.05)', lineColor: '#3b82f6', lineWidth: 2 }
        : type === 'Baseline' ? { baseValue: { type: 'price', price: chartData[chartData.length - 1]?.close || 0 }, topFillColor1: 'rgba(38, 166, 154, 0.28)', bottomFillColor2: 'rgba(239, 83, 80, 0.05)', lineColor: '#3b82f6' }
        : { color: '#3b82f6', lineWidth: 2 };
      series = chart.addSeries(seriesType as any, options);
      series.setData(chartData.map(d => ({ time: d.time, value: d.close })));
    } else if (type === 'Histogram') {
      series = chart.addSeries('Histogram' as any, { color: '#3b82f6', priceFormat: { type: 'volume' } });
      series.setData(chartData.map(d => ({ time: d.time, value: d.volume, color: d.close >= d.open ? '#26a69a' : '#ef5350' })));
    } else {
      // For Renko, PointFigure, LineBreak, Kagi - render as candlestick
      series = chart.addSeries('Candlestick' as any, { upColor: '#26a69a', downColor: '#ef5350', borderVisible: false });
      series.setData(chartData);
    }
    seriesRef.current = series;
  };

  return (
    <div className="h-full flex flex-col bg-gray-950">
      <div className="bg-gray-900 border-b border-gray-700 p-2 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-white font-semibold mr-4">{symbol}</span>
          <div className="flex flex-wrap gap-1">
            {ALL_CHART_TYPES.map(ct => (
              <button
                key={ct.id}
                onClick={() => {
                  setChartType(ct.id);
                  if (chartRef.current) updateSeries(chartRef.current, ct.id, generateData());
                }}
                className={`px-2 py-1 rounded text-xs ${chartType === ct.id ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
              >
                {ct.label}
              </button>
            ))}
          </div>
        </div>
        <button
          onClick={() => setShowIndicators(!showIndicators)}
          className={`px-3 py-1 rounded text-xs ${showIndicators ? 'bg-green-600 text-white' : 'bg-gray-800 text-gray-400'}`}
        >
          Indicators ({activeIndicators.length})
        </button>
      </div>
      <div className="flex-1 relative">
        <div ref={chartContainerRef} className="absolute inset-0" />
      </div>
    </div>
  );
};

export default AdvancedChart;
