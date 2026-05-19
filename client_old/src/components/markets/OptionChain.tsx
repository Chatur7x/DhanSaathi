import React, { useState, useEffect } from 'react';
import { useMarketStore } from '../../store/marketStore';
import { API_BASE } from '../../config';

const OptionChain: React.FC<{ symbol?: string }> = ({ symbol = 'NIFTY' }) => {
  const [expiry, setExpiry] = useState('');
  const [strikes, setStrikes] = useState<any[]>([]);
  const [calls, setCalls] = useState<any[]>([]);
  const [puts, setPuts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOptionChain();
  }, [symbol]);

  const fetchOptionChain = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/market/option-chain?symbol=${symbol}`);
      const data = await res.json();
      setCalls(data.calls || []);
      setPuts(data.puts || []);
      // Merge strikes for display
      const allStrikes = [...(data.calls || []), ...(data.puts || [])]
        .map(o => o.strike)
        .filter((v, i, a) => a.indexOf(v) === i)
        .sort((a, b) => a - b);
      setStrikes(allStrikes);
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-4 text-gray-400">Loading option chain...</div>;

  return (
    <div className="bg-gray-900 text-white h-full flex flex-col">
      <div className="p-4 border-b border-gray-700 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Option Chain - {symbol}</h2>
        <select
          value={expiry}
          onChange={(e) => setExpiry(e.target.value)}
          className="bg-gray-800 border border-gray-600 rounded px-3 py-1 text-sm"
        >
          <option value="">Select Expiry</option>
          <option value="2026-05-29">29 May 2026</option>
          <option value="2026-06-26">26 Jun 2026</option>
        </select>
      </div>
      <div className="flex-1 overflow-auto">
        <table className="w-full text-xs">
          <thead className="bg-gray-800 sticky top-0">
            <tr>
              <th colSpan={4} className="p-2 text-green-400">CALLS</th>
              <th rowSpan={2} className="p-2 border-x border-gray-600">Strike</th>
              <th colSpan={4} className="p-2 text-red-400">PUTS</th>
            </tr>
            <tr className="bg-gray-800">
              <th className="p-1">OI</th>
              <th className="p-1">Vol</th>
              <th className="p-1">IV</th>
              <th className="p-1">LTP</th>
              <th className="p-1">LTP</th>
              <th className="p-1">IV</th>
              <th className="p-1">Vol</th>
              <th className="p-1">OI</th>
            </tr>
          </thead>
          <tbody>
            {strikes.map((strike) => {
              const call = calls.find(c => c.strike === strike) || {};
              const put = puts.find(p => p.strike === strike) || {};
              return (
                <tr key={strike} className="border-b border-gray-800 hover:bg-gray-800/50">
                  <td className="p-1 text-right text-green-400">{(call.openInterest || 0).toLocaleString()}</td>
                  <td className="p-1 text-right">{call.volume || 0}</td>
                  <td className="p-1 text-right">{((call.impliedVolatility || 0) * 100).toFixed(1)}%</td>
                  <td className="p-1 text-right font-semibold">{call.lastPrice || '-'}</td>
                  <td className="p-1 text-center font-bold border-x border-gray-600">{strike}</td>
                  <td className="p-1 text-right font-semibold text-red-400">{put.lastPrice || '-'}</td>
                  <td className="p-1 text-right">{((put.impliedVolatility || 0) * 100).toFixed(1)}%</td>
                  <td className="p-1 text-right">{put.volume || 0}</td>
                  <td className="p-1 text-right text-red-400">{(put.openInterest || 0).toLocaleString()}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OptionChain;
