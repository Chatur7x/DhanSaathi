import React, { useState, useRef, useEffect } from 'react';
import { createChart, IChartApi, ColorType, CrosshairMode, LineStyle } from 'lightweight-charts';

const MultiChart: React.FC = () => {
  const layouts = [
    { id: '1x1', label: '1 Chart', cols: 1, rows: 1 },
    { id: '1x2', label: '1x2', cols: 1, rows: 2 },
    { id: '2x1', label: '2x1', cols: 2, rows: 1 },
    { id: '2x2', label: '2x2', cols: 2, rows: 2 },
    { id: '3x1', label: '3x1', cols: 3, rows: 1 },
    { id: '3x2', label: '3x2', cols: 3, rows: 2 },
    { id: '3x3', label: '3x3', cols: 3, rows: 3 },
  ];

  const [layout, setLayout] = useState('2x2');
  const [symbols, setSymbols] = useState(['NIFTY', 'BANKNIFTY', 'RELIANCE', 'TCS']);
  const chartRefs = useRef<(HTMLDivElement | null)[]>([]);
  const chartInstances = useRef<IChartApi[]>([]);

  const currentLayout = layouts.find(l => l.id === layout) || layouts[3];

  useEffect(() => {
    // Initialize charts
    chartInstances.current.forEach(c => c.remove());
    chartInstances.current = [];

    chartRefs.current.forEach((ref, i) => {
      if (!ref) return;
      const chart = createChart(ref, {
        width: ref.clientWidth,
        height: ref.clientHeight,
        layout: { background: { type: ColorType.Solid, color: '#1a1a2e' }, textColor: '#d1d5db', fontSize: 10 },
        grid: { vertLines: { color: '#2d2d3d' }, horzLines: { color: '#2d2d3d' } },
        crosshair: { mode: CrosshairMode.Normal },
        timeScale: { visible: i >= (symbols.length - currentLayout.cols) },
      });

      // Generate and set data
      const data = generateData(symbols[i] || `Symbol${i}`);
      const series = chart.addSeries('Candlestick' as any, {
        upColor: '#26a69a', downColor: '#ef5350', borderVisible: false,
      });
      series.setData(data);

      chartInstances.current.push(chart);
    });

    return () => chartInstances.current.forEach(c => c.remove());
  }, [layout, symbols]);

  const generateData = (symbol: string) => {
    const data: any[] = [];
    let price = symbol === 'NIFTY' ? 22450 : symbol === 'BANKNIFTY' ? 48200 : Math.random() * 5000;
    const now = Math.floor(Date.now() / 1000);
    for (let i = 100; i >= 0; i--) {
      const time = (now - i * 900) as any;
      const open = price;
      const change = (Math.random() - 0.48) * (price * 0.01);
      const close = price + change;
      const high = Math.max(open, close) + Math.random() * (price * 0.005);
      const low = Math.min(open, close) - Math.random() * (price * 0.005);
      data.push({ time, open, high, low, close });
      price = close;
    }
    return data;
  };

  const changeSymbol = (index: number, symbol: string) => {
    const newSymbols = [...symbols];
    newSymbols[index] = symbol;
    setSymbols(newSymbols);
  };

  return (
    <div className="h-full flex flex-col bg-gray-950">
      <div className="bg-gray-900 border-b border-gray-700 p-3 flex items-center justify-between">
        <h1 className="text-xl font-bold text-white">Multi-Chart Layout</h1>
        <div className="flex space-x-1">
          {layouts.map(l => (
            <button
              key={l.id}
              onClick={() => setLayout(l.id)}
              className={`px-3 py-1 rounded text-xs ${layout === l.id ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 p-2" style={{ display: 'grid', gridTemplateColumns: `repeat(${currentLayout.cols}, 1fr)`, gridTemplateRows: `repeat(${currentLayout.rows}, 1fr)`, gap: '4px' }}>
        {Array.from({ length: currentLayout.cols * currentLayout.rows }, (_, i) => (
          <div key={i} className="bg-gray-900 rounded overflow-hidden relative">
            <div className="absolute top-2 left-2 z-10">
              <select
                value={symbols[i] || ''}
                onChange={e => changeSymbol(i, e.target.value)}
                className="bg-gray-800 border border-gray-600 rounded px-2 py-1 text-xs text-white"
              >
                <option value="NIFTY">NIFTY</option>
                <option value="BANKNIFTY">BANKNIFTY</option>
                <option value="RELIANCE">RELIANCE</option>
                <option value="TCS">TCS</option>
                <option value="INFY">INFY</option>
                <option value="HDFCBANK">HDFCBANK</option>
              </select>
            </div>
            <div ref={el => { chartRefs.current[i] = el; }} className="w-full h-full" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default MultiChart;
