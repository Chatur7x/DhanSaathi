import React, { useState } from 'react';

interface GreeksData {
  callDelta: number;
  putDelta: number;
  gamma: number;
  callTheta: number;
  putTheta: number;
  callVega: number;
  putVega: number;
  callRho: number;
  putRho: number;
}

const GreeksPanel: React.FC = () => {
  const [symbol] = useState('NIFTY');
  const [spot, setSpot] = useState(22450);
  const [strike, setStrike] = useState(22500);
  const [timeToExpiry, setTimeToExpiry] = useState(0.1); // 10 days
  const [riskFreeRate, setRiskFreeRate] = useState(0.06);
  const [volatility, setVolatility] = useState(0.15);

  // Black-Scholes Greeks calculation
  const calculateGreeks = (): GreeksData => {
    const d1 = (Math.log(spot / strike) + (riskFreeRate + volatility * volatility / 2) * timeToExpiry) / (volatility * Math.sqrt(timeToExpiry));
    const d2 = d1 - volatility * Math.sqrt(timeToExpiry);
    
    const normCDF = (x: number) => {
      const a1 = 0.254829592, a2 = -0.284496736, a3 = 1.421413741;
      const a4 = -1.453152027, a5 = 1.061405429, p = 0.3275911;
      const sign = x < 0 ? -1 : 1;
      x = Math.abs(x) / Math.sqrt(2);
      const t = 1 / (1 + p * x);
      const y = 1 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
      return 0.5 * (1 + sign * y);
    };
    
    const normPDF = (x: number) => Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI);
    
    const nd1 = normPDF(d1);
    const Nd1 = normCDF(d1);
    const Nd2 = normCDF(d2);
    const N_d1 = normCDF(-d1);
    const N_d2 = normCDF(-d2);

    return {
      callDelta: Nd1,
      putDelta: Nd1 - 1,
      gamma: nd1 / (spot * volatility * Math.sqrt(timeToExpiry)),
      callTheta: (-spot * nd1 * volatility / (2 * Math.sqrt(timeToExpiry)) - riskFreeRate * strike * Math.exp(-riskFreeRate * timeToExpiry) * Nd2) / 365,
      putTheta: (-spot * nd1 * volatility / (2 * Math.sqrt(timeToExpiry)) + riskFreeRate * strike * Math.exp(-riskFreeRate * timeToExpiry) * N_d2) / 365,
      callVega: spot * Math.sqrt(timeToExpiry) * nd1 / 100,
      putVega: spot * Math.sqrt(timeToExpiry) * nd1 / 100,
      callRho: strike * timeToExpiry * Math.exp(-riskFreeRate * timeToExpiry) * Nd2 / 100,
      putRho: -strike * timeToExpiry * Math.exp(-riskFreeRate * timeToExpiry) * N_d2 / 100
    };
  };

  const greeks = calculateGreeks();

  const renderGauge = (label: string, value: number, color: string, min = -1, max = 1) => (
    <div className="bg-gray-800 rounded p-3">
      <div className="text-xs text-gray-400 mb-1">{label}</div>
      <div className="text-lg font-bold" style={{ color }}>{value.toFixed(4)}</div>
      <div className="w-full bg-gray-700 rounded-full h-1.5 mt-2">
        <div
          className="h-1.5 rounded-full"
          style={{
            width: `${((value - min) / (max - min)) * 100}%`,
            backgroundColor: color
          }}
        />
      </div>
    </div>
  );

  return (
    <div className="bg-gray-900 text-white p-4 h-full flex flex-col">
      <h2 className="text-lg font-semibold mb-4">Greeks Calculator</h2>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="text-xs text-gray-400">Spot Price</label>
          <input type="number" value={spot} onChange={e => setSpot(+e.target.value)} className="w-full bg-gray-800 rounded px-2 py-1 text-sm" />
        </div>
        <div>
          <label className="text-xs text-gray-400">Strike Price</label>
          <input type="number" value={strike} onChange={e => setStrike(+e.target.value)} className="w-full bg-gray-800 rounded px-2 py-1 text-sm" />
        </div>
        <div>
          <label className="text-xs text-gray-400">Time to Expiry (years)</label>
          <input type="number" value={timeToExpiry} onChange={e => setTimeToExpiry(+e.target.value)} step="0.01" className="w-full bg-gray-800 rounded px-2 py-1 text-sm" />
        </div>
        <div>
          <label className="text-xs text-gray-400">Volatility</label>
          <input type="number" value={volatility} onChange={e => setVolatility(+e.target.value)} step="0.01" className="w-full bg-gray-800 rounded px-2 py-1 text-sm" />
        </div>
        <div>
          <label className="text-xs text-gray-400">Risk-Free Rate</label>
          <input type="number" value={riskFreeRate} onChange={e => setRiskFreeRate(+e.target.value)} step="0.01" className="w-full bg-gray-800 rounded px-2 py-1 text-sm" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 flex-1 overflow-auto">
        {renderGauge('Call Delta', greeks.callDelta, '#22c55e')}
        {renderGauge('Put Delta', greeks.putDelta, '#ef4444')}
        {renderGauge('Gamma', greeks.gamma, '#3b82f6', 0, 0.01)}
        {renderGauge('Call Theta', greeks.callTheta, '#f59e0b', -1, 0)}
        {renderGauge('Put Theta', greeks.putTheta, '#f59e0b', -1, 0)}
        {renderGauge('Vega', greeks.callVega, '#8b5cf6', 0, 0.5)}
        {renderGauge('Call Rho', greeks.callRho, '#ec4899', 0, 0.1)}
        {renderGauge('Put Rho', greeks.putRho, '#ec4899', -0.1, 0)}
      </div>
    </div>
  );
};

export default GreeksPanel;
