import React, { useState, useMemo } from 'react';
import { useMarketStore } from '../../store/marketStore';

interface OptionPosition {
  id: string;
  type: 'CE' | 'PE';
  strike: number;
  action: 'BUY' | 'SELL';
  quantity: number;
  premium: number;
  symbol: string;
}

const StrategyBuilder: React.FC = () => {
  const [positions, setPositions] = useState<OptionPosition[]>([]);
  const [selectedType, setSelectedType] = useState<'CE' | 'PE'>('CE');
  const [selectedAction, setSelectedAction] = useState<'BUY' | 'SELL'>('BUY');
  const [strike, setStrike] = useState(22500);
  const [quantity, setQuantity] = useState(50);
  const [premium, setPremium] = useState(150);

  const addPosition = () => {
    const newPos: OptionPosition = {
      id: Date.now().toString(),
      type: selectedType,
      strike,
      action: selectedAction,
      quantity,
      premium,
      symbol: 'NIFTY'
    };
    setPositions([...positions, newPos]);
  };

  const removePosition = (id: string) => {
    setPositions(positions.filter(p => p.id !== id));
  };

  const strategyMetrics = useMemo(() => {
    let totalPremium = 0;
    let maxLoss = 0;
    let maxProfit = 0;

    positions.forEach(pos => {
      const cashflow = pos.action === 'BUY' 
        ? -pos.premium * pos.quantity 
        : pos.premium * pos.quantity;
      totalPremium += cashflow;
    });

    return { totalPremium, maxLoss, maxProfit, positionCount: positions.length };
  }, [positions]);

  const renderPayoffChart = () => {
    const spotRange = Array.from({ length: 21 }, (_, i) => 22000 + i * 50);
    const payoffs = spotRange.map(spot => {
      return positions.reduce((payoff, pos) => {
        let optionPayoff = 0;
        if (pos.type === 'CE') {
          optionPayoff = Math.max(0, spot - pos.strike) - pos.premium;
        } else {
          optionPayoff = Math.max(0, pos.strike - spot) - pos.premium;
        }
        return payoff + (pos.action === 'BUY' ? optionPayoff : -optionPayoff) * pos.quantity;
      }, 0);
    });

    const maxPayoff = Math.max(...payoffs);
    const minPayoff = Math.min(...payoffs);
    const range = maxPayoff - minPayoff || 1;

    return (
      <div className="bg-gray-800 rounded p-3 h-40 flex items-end space-x-1">
        {payoffs.map((payoff, i) => (
          <div
            key={i}
            className="flex-1 rounded-t"
            style={{
              height: `${((payoff - minPayoff) / range) * 100}%`,
              backgroundColor: payoff >= 0 ? '#22c55e' : '#ef4444',
              minHeight: '2px'
            }}
            title={`Spot: ${spotRange[i]}, P&L: ${payoff.toFixed(0)}`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="bg-gray-900 text-white p-4 h-full flex flex-col">
      <h2 className="text-lg font-semibold mb-4">Strategy Builder</h2>
      <div className="grid grid-cols-5 gap-2 mb-4">
        <select value={selectedType} onChange={e => setSelectedType(e.target.value as any)} className="bg-gray-800 rounded px-2 py-1 text-sm">
          <option value="CE">Call (CE)</option>
          <option value="PE">Put (PE)</option>
        </select>
        <select value={selectedAction} onChange={e => setSelectedAction(e.target.value as any)} className="bg-gray-800 rounded px-2 py-1 text-sm">
          <option value="BUY">BUY</option>
          <option value="SELL">SELL</option>
        </select>
        <input type="number" value={strike} onChange={e => setStrike(+e.target.value)} placeholder="Strike" className="bg-gray-800 rounded px-2 py-1 text-sm" />
        <input type="number" value={quantity} onChange={e => setQuantity(+e.target.value)} placeholder="Qty" className="bg-gray-800 rounded px-2 py-1 text-sm" />
        <input type="number" value={premium} onChange={e => setPremium(+e.target.value)} placeholder="Premium" className="bg-gray-800 rounded px-2 py-1 text-sm" />
      </div>
      <button onClick={addPosition} className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-sm mb-4">
        + Add Position
      </button>
      <div className="bg-gray-800 rounded p-3 mb-4">
        <div className="grid grid-cols-4 gap-2 text-xs text-gray-400 mb-2">
          <span>Type</span>
          <span>Strike</span>
          <span>Action</span>
          <span>Qty @ Premium</span>
        </div>
        {positions.map(pos => (
          <div key={pos.id} className="grid grid-cols-4 gap-2 text-xs py-1 border-b border-gray-700 items-center">
            <span className={pos.type === 'CE' ? 'text-green-400' : 'text-red-400'}>{pos.type}</span>
            <span>{pos.strike}</span>
            <span className={pos.action === 'BUY' ? 'text-green-400' : 'text-red-400'}>{pos.action}</span>
            <span className="flex items-center justify-between">
              {pos.quantity} @ {pos.premium}
              <button onClick={() => removePosition(pos.id)} className="text-red-400 hover:text-red-300 ml-2">×</button>
            </span>
          </div>
        ))}
      </div>
      {positions.length > 0 && (
        <>
          <div className="grid grid-cols-3 gap-2 mb-4 text-sm">
            <div className="bg-gray-800 rounded p-2">
              <div className="text-gray-400 text-xs">Net Premium</div>
              <div className={strategyMetrics.totalPremium >= 0 ? 'text-green-400' : 'text-red-400'}>
                {strategyMetrics.totalPremium.toFixed(0)}
              </div>
            </div>
            <div className="bg-gray-800 rounded p-2">
              <div className="text-gray-400 text-xs">Positions</div>
              <div>{strategyMetrics.positionCount}</div>
            </div>
          </div>
          {renderPayoffChart()}
        </>
      )}
    </div>
  );
};

export default StrategyBuilder;
