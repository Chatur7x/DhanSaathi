import React, { useState, useMemo } from 'react';
import { useMarketStore } from '../store/marketStore';

interface ScreeningCriteria {
  sector: string;
  marketCap: string;
  peRatio: [number, number];
  priceChange: [number, number];
  volume: number;
  dividend: boolean;
}

const StockScreener: React.FC = () => {
  const { allQuotes } = useMarketStore();
  const [criteria, setCriteria] = useState<ScreeningCriteria>({
    sector: 'all',
    marketCap: 'all',
    peRatio: [0, 100],
    priceChange: [-10, 10],
    volume: 0,
    dividend: false
  });
  const [savedScreens, setSavedScreens] = useState([
    { name: 'Large Cap Growth', criteria: { ...criteria, marketCap: 'large' } },
    { name: 'High Dividend Yield', criteria: { ...criteria, dividend: true, marketCap: 'large' } },
    { name: 'Momentum Stocks', criteria: { ...criteria, priceChange: [5, 50] } }
  ]);

  const filteredStocks = useMemo(() => {
    return allQuotes.filter(stock => {
      if (criteria.priceChange[0] > 0 && stock.changePercent < criteria.priceChange[0]) return false;
      if (criteria.priceChange[1] < 50 && stock.changePercent > criteria.priceChange[1]) return false;
      return true;
    }).sort((a, b) => b.changePercent - a.changePercent);
  }, [allQuotes, criteria]);

  const sectors = ['all', 'IT', 'Banking', 'Pharma', 'Auto', 'FMCG', 'Metal', 'Energy'];
  const marketCaps = ['all', 'large', 'mid', 'small'];

  return (
    <div className="h-full flex bg-gray-950">
      {/* Filters Panel */}
      <div className="w-80 bg-gray-900 border-r border-gray-700 p-4 overflow-y-auto">
        <h2 className="text-lg font-bold text-white mb-4">Stock Screener</h2>
        <div className="space-y-4">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Sector</label>
            <select
              value={criteria.sector}
              onChange={e => setCriteria({ ...criteria, sector: e.target.value })}
              className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm text-white"
            >
              {sectors.map(s => <option key={s} value={s}>{s.toUpperCase()}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Market Cap</label>
            <select
              value={criteria.marketCap}
              onChange={e => setCriteria({ ...criteria, marketCap: e.target.value })}
              className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm text-white"
            >
              {marketCaps.map(m => <option key={m} value={m}>{m.toUpperCase()}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Price Change %</label>
            <div className="flex space-x-2">
              <input type="number" value={criteria.priceChange[0]} onChange={e => setCriteria({ ...criteria, priceChange: [+e.target.value, criteria.priceChange[1]] })} className="flex-1 bg-gray-800 border border-gray-600 rounded px-2 py-1 text-sm text-white" placeholder="Min" />
              <input type="number" value={criteria.priceChange[1]} onChange={e => setCriteria({ ...criteria, priceChange: [criteria.priceChange[0], +e.target.value] })} className="flex-1 bg-gray-800 border border-gray-600 rounded px-2 py-1 text-sm text-white" placeholder="Max" />
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Min Volume</label>
            <input type="number" value={criteria.volume} onChange={e => setCriteria({ ...criteria, volume: +e.target.value })} className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm text-white" />
          </div>
          <label className="flex items-center space-x-2 cursor-pointer">
            <input type="checkbox" checked={criteria.dividend} onChange={e => setCriteria({ ...criteria, dividend: e.target.checked })} className="rounded" />
            <span className="text-sm text-gray-300">Dividend Paying</span>
          </label>
          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded text-sm font-medium">
            Apply Filters
          </button>
        </div>
        <div className="mt-6">
          <h3 className="text-sm font-semibold text-gray-300 mb-2">Saved Screens</h3>
          {savedScreens.map((screen, i) => (
            <div key={i} className="bg-gray-800 rounded p-2 mb-2 text-xs text-gray-300 cursor-pointer hover:bg-gray-700">
              {screen.name}
            </div>
          ))}
        </div>
      </div>
      {/* Results */}
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold">Results: {filteredStocks.length} stocks</h3>
          <button className="bg-gray-800 hover:bg-gray-700 text-white px-3 py-1 rounded text-xs">
            Export CSV
          </button>
        </div>
        <div className="bg-gray-900 rounded overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-800 text-gray-400 text-xs">
              <tr>
                <th className="text-left p-3">Symbol</th>
                <th className="text-left p-3">Name</th>
                <th className="text-right p-3">Price</th>
                <th className="text-right p-3">Change %</th>
                <th className="text-right p-3">Volume</th>
                <th className="text-right p-3">Market Cap</th>
              </tr>
            </thead>
            <tbody>
              {filteredStocks.map((stock, i) => (
                <tr key={i} className="border-t border-gray-800 hover:bg-gray-800/50 cursor-pointer">
                  <td className="p-3 text-white font-medium">{stock.symbol}</td>
                  <td className="p-3 text-gray-300">{stock.name}</td>
                  <td className="p-3 text-right text-white">₹{stock.price?.toFixed(2) || '0.00'}</td>
                  <td className={`p-3 text-right ${(stock.changePercent || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {(stock.changePercent || 0) >= 0 ? '+' : ''}{(stock.changePercent || 0).toFixed(2)}%
                  </td>
                  <td className="p-3 text-right text-gray-300">{(stock.volume || 0).toLocaleString()}</td>
                  <td className="p-3 text-right text-gray-300">-</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StockScreener;
