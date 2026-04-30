import { useEffect, useRef, useState, useCallback } from 'react';
import { createChart, ColorType, CrosshairMode, LineSeries, BarSeries, CandlestickSeries, AreaSeries, HistogramSeries } from 'lightweight-charts';
import type { IChartApi, ISeriesApi, Time, UTCTimestamp } from 'lightweight-charts';
import { motion } from 'framer-motion';
import { ZoomIn, ZoomOut, RotateCw, TrendingUp, BarChart2, LineChart, CandlestickChart, AreaChart } from 'lucide-react';

export type ChartType = 'candlestick' | 'bar' | 'line' | 'area' | 'histogram';
export type Timeframe = '1D' | '1W' | '1M' | '3M' | '6M' | '1Y' | '5Y' | 'MAX';

interface CandleData {
  time: UTCTimestamp;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

interface TradingChartProps {
  symbol?: string;
  data?: CandleData[];
  height?: number;
  showVolume?: boolean;
}

const TIMEFRAMES: { label: Timeframe; days: number }[] = [
  { label: '1D', days: 1 },
  { label: '1W', days: 7 },
  { label: '1M', days: 30 },
  { label: '3M', days: 90 },
  { label: '6M', days: 180 },
  { label: '1Y', days: 365 },
  { label: '5Y', days: 1825 },
  { label: 'MAX', days: 99999 },
];

const CHART_TYPES: { type: ChartType; icon: any; label: string }[] = [
  { type: 'candlestick', icon: CandlestickChart, label: 'Candlestick' },
  { type: 'bar', icon: BarChart2, label: 'Bar' },
  { type: 'line', icon: LineChart, label: 'Line' },
  { type: 'area', icon: AreaChart, label: 'Area' },
  { type: 'histogram', icon: BarChart2, label: 'Volume' },
];

export default function TradingChart({ 
  symbol = '^NSEI', 
  data: propData, 
  height = 500,
  showVolume = true,
}: TradingChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<any> | null>(null);
  const volumeRef = useRef<ISeriesApi<any> | null>(null);
  const [chartType, setChartType] = useState<ChartType>('candlestick');
  const [timeframe, setTimeframe] = useState<Timeframe>('1M');
  const [chartData, setChartData] = useState<CandleData[]>(propData || []);
  const [loading, setLoading] = useState(!propData);

  const fetchData = useCallback(async () => {
    if (propData) return;
    setLoading(true);
    try {
      const tf = TIMEFRAMES.find(t => t.label === timeframe);
      const data = generateMockData(symbol, tf?.days || 30);
      setChartData(data);
    } finally {
      setLoading(false);
    }
  }, [symbol, timeframe, propData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (!chartContainerRef.current || chartData.length === 0) return;

    if (chartRef.current) {
      chartRef.current.remove();
    }

    const container = chartContainerRef.current;
    const chart = createChart(container, {
      width: container.clientWidth,
      height: height,
      layout: {
        background: { type: ColorType.Solid, color: '#0a0e1a' },
        textColor: '#9ca3af',
        fontSize: 11,
      },
      grid: {
        vertLines: { color: 'rgba(255, 255, 255, 0.04)' },
        horzLines: { color: 'rgba(255, 255, 255, 0.04)' },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
      },
      rightPriceScale: {
        borderColor: 'rgba(255, 255, 255, 0.1)',
        scaleMargins: {
          top: 0.1,
          bottom: showVolume ? 0.35 : 0.1,
        },
      },
      timeScale: {
        borderColor: 'rgba(255, 255, 255, 0.1)',
      },
    });

    let series: ISeriesApi<any>;
    
    if (chartType === 'candlestick') {
      const s = chart.addSeries(CandlestickSeries, {
        upColor: '#10b981',
        downColor: '#ef4444',
        borderVisible: false,
      } as any);
      s.setData(chartData.map(d => ({
        time: d.time,
        open: d.open,
        high: d.high,
        low: d.low,
        close: d.close,
      })));
      series = s;
    } else if (chartType === 'bar') {
      const s = chart.addSeries(BarSeries, {
        upColor: '#10b981',
        downColor: '#ef4444',
      } as any);
      s.setData(chartData.map(d => ({
        time: d.time,
        open: d.open,
        high: d.high,
        low: d.low,
        close: d.close,
      })));
      series = s;
    } else if (chartType === 'line') {
      const s = chart.addSeries(LineSeries, {
        color: '#3b82f6',
        lineWidth: 2,
      } as any);
      s.setData(chartData.map(d => ({
        time: d.time,
        value: d.close,
      })));
      series = s;
    } else if (chartType === 'area') {
      const s = chart.addSeries(AreaSeries, {
        topColor: 'rgba(59, 130, 246, 0.4)',
        bottomColor: 'rgba(59, 130, 246, 0.0)',
        lineColor: '#3b82f6',
        lineWidth: 2,
      } as any);
      s.setData(chartData.map(d => ({
        time: d.time,
        value: d.close,
      })));
      series = s;
    } else if (chartType === 'histogram') {
      const s = chart.addSeries(HistogramSeries, {
        priceFormat: {
          type: 'volume',
        },
        color: '#26a69a',
      } as any);
      s.setData(chartData.map(d => ({
        time: d.time,
        value: d.volume || 0,
        color: d.close >= d.open ? 'rgba(16, 185, 129, 0.5)' : 'rgba(239, 68, 68, 0.5)',
      })));
      series = s;
    }

    seriesRef.current = series;

    if (showVolume && chartType !== 'histogram') {
      const volumeSeries = chart.addSeries(HistogramSeries, {
        priceFormat: {
          type: 'volume',
        },
        color: '#26a69a',
      } as any);
      
      volumeSeries.setData(chartData.map(d => ({
        time: d.time,
        value: d.volume || 0,
        color: d.close >= d.open ? 'rgba(16, 185, 129, 0.5)' : 'rgba(239, 68, 68, 0.5)',
      })));
      
      volumeSeries.priceScale().applyOptions({
        scaleMargins: {
          top: 0.7,
          bottom: 0,
        },
      });
      
      volumeRef.current = volumeSeries;
    }

    const resizeObserver = new ResizeObserver(() => {
      if (container && chart) {
        chart.applyOptions({ width: container.clientWidth });
      }
    });
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      chart.remove();
    };
  }, [chartData, chartType, timeframe, height, showVolume]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{
        background: 'var(--bg-secondary)',
        borderRadius: '12px',
        padding: '1rem',
        position: 'relative',
      }}
    >
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '1rem',
        gap: '1rem',
        flexWrap: 'wrap'
      }}>
        <div style={{ display: 'flex', gap: '0.25rem', background: 'var(--bg-tertiary)', borderRadius: '8px', padding: '0.25rem' }}>
          {CHART_TYPES.map(({ type, icon: Icon, label }) => (
            <button
              key={type}
              onClick={() => setChartType(type)}
              style={{
                padding: '0.5rem 0.75rem',
                background: chartType === type ? 'var(--accent-blue)' : 'transparent',
                border: 'none',
                borderRadius: '6px',
                color: chartType === type ? 'white' : 'var(--text-secondary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
                fontSize: '0.75rem',
              }}
            >
              <Icon size={14} />
              <span style={{ display: chartType === type ? 'inline' : 'none' }}>{label}</span>
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '0.25rem', background: 'var(--bg-tertiary)', borderRadius: '8px', padding: '0.25rem' }}>
          {TIMEFRAMES.map(({ label }) => (
            <button
              key={label}
              onClick={() => setTimeframe(label)}
              style={{
                padding: '0.5rem 0.75rem',
                background: timeframe === label ? 'var(--accent-blue)' : 'transparent',
                border: 'none',
                borderRadius: '6px',
                color: timeframe === label ? 'white' : 'var(--text-secondary)',
                cursor: 'pointer',
                fontSize: '0.75rem',
              }}
            >
              {label}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '0.25rem' }}>
          <button
            onClick={() => {
              try { chartRef.current?.timeScale().scrollToRealTime(); } catch (e) {}
            }}
            style={{ padding: '0.5rem', background: 'var(--bg-tertiary)', border: 'none', borderRadius: '6px', color: 'var(--text-secondary)', cursor: 'pointer' }}
          >
            <ZoomIn size={14} />
          </button>
          <button
            onClick={() => {
              try {
                const logicalRange = chartRef.current?.timeScale().getVisibleLogicalRange();
                if (logicalRange) {
                  chartRef.current?.timeScale().setVisibleLogicalRange({
                    from: logicalRange.from! * 1.5,
                    to: logicalRange.to! * 1.5,
                  });
                }
              } catch (e) {}
            }}
            style={{ padding: '0.5rem', background: 'var(--bg-tertiary)', border: 'none', borderRadius: '6px', color: 'var(--text-secondary)', cursor: 'pointer' }}
          >
            <ZoomOut size={14} />
          </button>
          <button
            onClick={() => {
              try {
                if (chartRef.current && chartContainerRef.current) {
                  chartRef.current.applyOptions({ width: chartContainerRef.current.clientWidth });
                  chartRef.current.timeScale().fitContent();
                }
              } catch (e) {}
            }}
            style={{ padding: '0.5rem', background: 'var(--bg-tertiary)', border: 'none', borderRadius: '6px', color: 'var(--text-secondary)', cursor: 'pointer' }}
          >
            <RotateCw size={14} />
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ 
          height: `${height}px`, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          color: 'var(--text-secondary)'
        }}>
          Loading chart data...
        </div>
      ) : (
        <div ref={chartContainerRef} style={{ height: `${height}px`, width: '100%' }} />
      )}
    </motion.div>
  );
}

function generateMockData(symbol: string, days: number): CandleData[] {
  const data: CandleData[] = [];
  const now = new Date();
  let basePrice = 22000;
  
  if (symbol.includes('RELIANCE')) basePrice = 2450;
  else if (symbol.includes('TCS')) basePrice = 4100;
  else if (symbol.includes('HDFC')) basePrice = 1680;
  
  for (let i = days; i >= 0; i--) {
    const time = new Date(now);
    time.setDate(time.getDate() - i);
    const timestamp = Math.floor(time.getTime() / 1000) as UTCTimestamp;
    
    const change = (Math.random() - 0.48) * (basePrice * 0.02);
    const open = basePrice + change;
    const close = open + (Math.random() - 0.48) * (basePrice * 0.015);
    const high = Math.max(open, close) + Math.random() * (basePrice * 0.01);
    const low = Math.min(open, close) - Math.random() * (basePrice * 0.01);
    const volume = Math.floor(Math.random() * 10000000) + 100000;
    
    data.push({
      time: timestamp,
      open: Math.max(0, open),
      high: Math.max(0, high),
      low: Math.max(0, low),
      close: Math.max(0, close),
      volume,
    });
    
    basePrice = close;
  }
  
  return data;
}
