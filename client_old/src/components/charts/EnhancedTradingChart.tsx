import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createChart, IChartApi, ISeriesApi, CrosshairMode, LineStyle, ColorType, SeriesType } from 'lightweight-charts';
import { useMarketStore } from '../../store/marketStore';

const CHART_TYPES = [
  { id: 'Candlestick', label: 'Candlestick', icon: '🕯️' },
  { id: 'Bar', label: 'Bar', icon: '📊' },
  { id: 'Line', label: 'Line', icon: '📈' },
  { id: 'Area', label: 'Area', icon: '🏔️' },
  { id: 'Baseline', label: 'Baseline', icon: '📉' },
  { id: 'Histogram', label: 'Histogram', icon: '▦' },
];

const TIMEFRAMES = [
  { id: '1m', label: '1m' }, { id: '5m', label: '5m' }, { id: '15m', label: '15m' },
  { id: '30m', label: '30m' }, { id: '1h', label: '1H' }, { id: '4h', label: '4H' },
  { id: '1D', label: '1D' }, { id: '1W', label: '1W' }, { id: '1M', label: '1M' },
];

const DRAWING_TOOLS = [
  { id: 'trendline', label: 'Trend Line', icon: '📏' },
  { id: 'horizontalline', label: 'Horizontal', icon: '─' },
  { id: 'fibonacci', label: 'Fib Retracement', icon: '🔷' },
  { id: 'pitchfork', label: 'Pitchfork', icon: 'Յ' },
  { id: 'gannfan', label: 'Gann Fan', icon: '⊿' },
  { id: 'rectangles', label: 'Rectangle', icon: '▭' },
  { id: 'text', label: 'Text', icon: 'T' },
  { id: 'arrow', label: 'Arrow', icon: '↗' },
  { id: 'brush', label: 'Brush', icon: '🖌️' },
  { id: 'eraser', label: 'Eraser', icon: '⌫' },
];

const INDICATORS = [
  'SMA', 'EMA', 'WMA', 'VWMA', 'DEMA', 'TEMA', 'HMA',
  'RSI', 'MACD', 'Stochastic', 'CCI', 'Williams %R', 'ADX',
  'Bollinger Bands', 'Keltner Channels', 'ATR',
  'Volume', 'OBV', 'Money Flow Index',
  'Ichimoku Cloud', 'Parabolic SAR', 'Linear Regression',
  'Pivot Points', 'Fibonacci Retracement',
];

const EnhancedTradingChart: React.FC<{ symbol?: string }> = ({ symbol = 'NIFTY' }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<any> | null>(null);
  const [chartType, setChartType] = useState('Candlestick');
  const [timeframe, setTimeframe] = useState('15m');
  const [activeDrawing, setActiveDrawing] = useState<string | null>(null);
  const [showIndicatorPanel, setShowIndicatorPanel] = useState(false);
  const [activeIndicators, setActiveIndicators] = useState<string[]>([]);
  const [showDrawingToolbar, setShowDrawingToolbar] = useState(false);
  const { allQuotes } = useMarketStore();

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: chartContainerRef.current.clientHeight,
      layout: {
        background: { type: ColorType.Solid, color: '#1a1a2e' },
        textColor: '#d1d5db',
        fontSize: 11,
      },
      grid: {
        vertLines: { color: '#2d2d3d', style: LineStyle.Solid },
        horzLines: { color: '#2d2d3d', style: LineStyle.Solid },
      },
      crosshair: { mode: CrosshairMode.Normal },
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
        borderColor: '#2d2d3d',
      },
      rightPriceScale: { borderColor: '#2d2d3d' },
    });

    chartRef.current = chart;

    // Generate sample data
    const sampleData = generateSampleData();

    // Create initial series
    updateChartSeries(chart, chartType, sampleData);

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({
          width: chartContainerRef.current.clientWidth,
          height: chartContainerRef.current.clientHeight,
        });
      }
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(chartContainerRef.current);

    return () => {
      resizeObserver.disconnect();
      chart.remove();
    };
  }, []);

  const generateSampleData = () => {
    const data: any[] = [];
    let price = 22450;
    const now = Math.floor(Date.now() / 1000);
    for (let i = 200; i >= 0; i--) {
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

  const updateChartSeries = (chart: IChartApi, type: string, data: any[]) => {
    if (seriesRef.current) {
      chart.removeSeries(seriesRef.current);
    }

    let series: ISeriesApi<any>;
    const seriesType = type as SeriesType;

    if (type === 'Candlestick') {
      series = chart.addSeries('Candlestick' as any, {
        upColor: '#26a69a', downColor: '#ef5350', borderVisible: false,
        wickUpColor: '#26a69a', wickDownColor: '#ef5350',
      });
      series.setData(data);
    } else if (type === 'Bar') {
      series = chart.addSeries('Bar' as any, {
        upColor: '#26a69a', downColor: '#ef5350',
      });
      series.setData(data);
    } else if (type === 'Line') {
      series = chart.addSeries('Line' as any, {
        color: '#3b82f6', lineWidth: 2,
      });
      series.setData(data.map(d => ({ time: d.time, value: d.close })));
    } else if (type === 'Area') {
      series = chart.addSeries('Area' as any, {
        topColor: 'rgba(59, 130, 246, 0.4)',
        bottomColor: 'rgba(59, 130, 246, 0.05)',
        lineColor: '#3b82f6', lineWidth: 2,
      });
      series.setData(data.map(d => ({ time: d.time, value: d.close })));
    } else if (type === 'Baseline') {
      const lastClose = data[data.length - 1]?.close || 0;
      series = chart.addSeries('Baseline' as any, {
        baseValue: { type: 'price', price: lastClose },
        topFillColor1: 'rgba(38, 166, 154, 0.28)',
        topFillColor2: 'rgba(38, 166, 154, 0.05)',
        bottomFillColor1: 'rgba(239, 83, 80, 0.28)',
        bottomFillColor2: 'rgba(239, 83, 80, 0.05)',
        lineColor: '#3b82f6', lineWidth: 2,
      });
      series.setData(data.map(d => ({ time: d.time, value: d.close })));
    } else if (type === 'Histogram') {
      series = chart.addSeries('Histogram' as any, {
        color: '#3b82f6', priceFormat: { type: 'volume' },
      });
      series.setData(data.map(d => ({ time: d.time, value: d.volume, color: d.close >= d.open ? '#26a69a' : '#ef5350' })));
    } else {
      series = chart.addSeries('Candlestick' as any, {});
      series.setData(data);
    }

    seriesRef.current = series;
  };

  const addIndicator = (indicator: string) => {
    if (activeIndicators.includes(indicator)) return;
    setActiveIndicators([...activeIndicators, indicator]);
  };

  const removeIndicator = (indicator: string) => {
    setActiveIndicators(activeIndicators.filter(i => i !== indicator));
  };

  return (
    <div className="h-full flex flex-col bg-gray-950">
      {/* Toolbar */}
      <div className="bg-gray-900 border-b border-gray-700 p-2 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-white font-semibold mr-4">{symbol}</span>
          <div className="flex space-x-1">
            {CHART_TYPES.map(ct => (
              <button
                key={ct.id}
                onClick={() => {
                  setChartType(ct.id);
                  if (chartRef.current) {
                    updateChartSeries(chartRef.current, ct.id, generateSampleData());
                  }
                }}
                className={`px-2 py-1 rounded text-xs ${
                  chartType === ct.id ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
                title={ct.label}
              >
                {ct.icon} {ct.label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowDrawingToolbar(!showDrawingToolbar)}
            className={`px-3 py-1 rounded text-xs ${showDrawingToolbar ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400'}`}
          >
            ✏️ Draw
          </button>
          <button
            onClick={() => setShowIndicatorPanel(!showIndicatorPanel)}
            className={`px-3 py-1 rounded text-xs ${showIndicatorPanel ? 'bg-green-600 text-white' : 'bg-gray-800 text-gray-400'}`}
          >
            📊 Indicators ({activeIndicators.length})
          </button>
          <div className="flex space-x-1 ml-4">
            {TIMEFRAMES.map(tf => (
              <button
                key={tf.id}
                onClick={() => setTimeframe(tf.id)}
                className={`px-2 py-1 rounded text-xs ${
                  timeframe === tf.id ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400'
                }`}
              >
                {tf.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Drawing Toolbar */}
      {showDrawingToolbar && (
        <div className="bg-gray-800 border-b border-gray-700 p-2 flex items-center space-x-1 overflow-x-auto">
          {DRAWING_TOOLS.map(tool => (
            <button
              key={tool.id}
              onClick={() => setActiveDrawing(activeDrawing === tool.id ? null : tool.id)}
              className={`px-2 py-1 rounded text-xs whitespace-nowrap ${
                activeDrawing === tool.id ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
              title={tool.label}
            >
              {tool.icon} {tool.label}
            </button>
          ))}
        </div>
      )}

      <div className="flex-1 flex">
        {/* Indicator Panel */}
        {showIndicatorPanel && (
          <div className="w-64 bg-gray-900 border-r border-gray-700 overflow-y-auto">
            <div className="p-3 border-b border-gray-700">
              <h3 className="text-white font-semibold text-sm">Indicators</h3>
            </div>
            <div className="p-2">
              <input
                type="text"
                placeholder="Search indicators..."
                className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 text-xs text-white mb-2"
              />
              {INDICATORS.map(ind => (
                <div
                  key={ind}
                  onClick={() => activeIndicators.includes(ind) ? removeIndicator(ind) : addIndicator(ind)}
                  className={`p-2 rounded text-xs cursor-pointer flex items-center justify-between ${
                    activeIndicators.includes(ind) ? 'bg-green-600/20 text-green-400' : 'hover:bg-gray-800 text-gray-300'
                  }`}
                >
                  <span>{ind}</span>
                  {activeIndicators.includes(ind) && <span>✓</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Chart */}
        <div className="flex-1 relative">
          <div ref={chartContainerRef} className="absolute inset-0" />
        </div>
      </div>

      {/* Active Indicators Bar */}
      {activeIndicators.length > 0 && (
        <div className="bg-gray-900 border-t border-gray-700 p-2 flex items-center space-x-2">
          <span className="text-xs text-gray-400">Active:</span>
          {activeIndicators.map(ind => (
            <span key={ind} className="bg-green-600/20 text-green-400 px-2 py-1 rounded text-xs flex items-center">
              {ind}
              <button onClick={() => removeIndicator(ind)} className="ml-1 hover:text-white">×</button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default EnhancedTradingChart;
