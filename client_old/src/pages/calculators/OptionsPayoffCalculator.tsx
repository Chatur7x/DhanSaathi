import { useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, CartesianGrid } from 'recharts';
import { calcOptionsPayoff } from '@/utils/calculators';
import { formatCurrency } from '@/utils/formatters';
import { motion } from 'framer-motion';

export default function OptionsPayoffCalculator() {
  const [optionType, setOptionType] = useState<'Call' | 'Put'>('Call');
  const [strikePrice, setStrikePrice] = useState(22000);
  const [premium, setPremium] = useState(150);
  const [lotSize, setLotSize] = useState(50); // NIFTY

  const chartData = useMemo(() => {
    const rawData = calcOptionsPayoff(
      strikePrice, 
      premium, 
      optionType.toLowerCase() as 'call' | 'put', 
      'buy', 
      [strikePrice * 0.8, strikePrice * 1.2]
    );
    // Multiply pnl by lotSize to get total contract value
    return rawData.data.map(d => ({ spot: d.spot, payoff: d.pnl * lotSize }));
  }, [optionType, strikePrice, premium, lotSize]);

  const maxLoss = premium * lotSize;

  return (
    <motion.div 
      className="calculator-layout"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      style={{ '--input-accent': '#34c759', '--result-accent': '#34c759' } as any}
    >
      <div className="calculator-layout__inputs">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 className="dashboard__section-title" style={{ margin: 0 }}>Options Strategy (Long)</h3>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button 
              onClick={() => setOptionType('Call')}
              style={{ background: optionType === 'Call' ? 'var(--accent-green)' : 'var(--bg-tertiary)', color: optionType === 'Call' ? 'black' : 'white', border: 'none', padding: '4px 12px', borderRadius: '12px', cursor: 'pointer', fontWeight: 600 }}
            >Call (CE)</button>
            <button 
              onClick={() => setOptionType('Put')}
              style={{ background: optionType === 'Put' ? 'var(--accent-red)' : 'var(--bg-tertiary)', color: optionType === 'Put' ? 'black' : 'white', border: 'none', padding: '4px 12px', borderRadius: '12px', cursor: 'pointer', fontWeight: 600 }}
            >Put (PE)</button>
          </div>
        </div>

        <div className="input-group">
          <div className="input-group__header">
            <label className="input-group__label">Strike Price</label>
            <div className="input-group__value-display">{formatCurrency(strikePrice)}</div>
          </div>
          <input type="range" min="10000" max="30000" step="100" value={strikePrice} onChange={(e) => setStrikePrice(Number(e.target.value))} />
        </div>

        <div className="input-group">
          <div className="input-group__header">
            <label className="input-group__label">Premium Paid</label>
            <div className="input-group__value-display">₹{premium}</div>
          </div>
          <input type="range" min="1" max="1000" step="1" value={premium} onChange={(e) => setPremium(Number(e.target.value))} />
        </div>

        <div className="input-group">
          <div className="input-group__header">
            <label className="input-group__label">Lot Size</label>
            <div className="input-group__value-display">{lotSize} Qty</div>
          </div>
          <input type="range" min="15" max="1000" step="5" value={lotSize} onChange={(e) => setLotSize(Number(e.target.value))} />
        </div>
      </div>

      <div className="calculator-layout__results">
        <h3 className="dashboard__section-title" style={{ marginBottom: '1rem' }}>Payoff at Expiry</h3>

        <div className="results-grid">
          <div className="result-card">
            <div className="result-card__label">Breakeven Point</div>
            <div className="result-card__value">₹{optionType === 'Call' ? strikePrice + premium : strikePrice - premium}</div>
          </div>
          <div className="result-card">
            <div className="result-card__label">Max Risk (Loss)</div>
            <div className="result-card__value" style={{ color: 'var(--accent-red)' }}>-{formatCurrency(maxLoss)}</div>
          </div>
        </div>

        <div className="chart-container">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="splitColor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="50%" stopColor="#34c759" stopOpacity={0.4} />
                  <stop offset="50%" stopColor="#ff3b30" stopOpacity={0.4} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-subtle)" />
              <XAxis dataKey="spot" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val}`} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-subtle)', borderRadius: '8px' }}
                itemStyle={{ color: 'var(--text-primary)' }}
                formatter={(value: number) => [formatCurrency(value), 'Profit/Loss']}
                labelFormatter={(label) => `Spot Price: ₹${label}`}
              />
              <ReferenceLine y={0} stroke="rgba(255,255,255,0.2)" strokeDasharray="3 3" />
              <ReferenceLine x={strikePrice} stroke="rgba(255,255,255,0.1)" label={{ position: 'top', value: 'Strike', fill: 'var(--text-muted)' }} />
              <Area type="monotone" dataKey="payoff" stroke="url(#splitColor)" fill="url(#splitColor)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </motion.div>
  );
}
