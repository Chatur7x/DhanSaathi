import { useState } from 'react';
import { formatCurrency } from '@/utils/formatters';
import { motion } from 'framer-motion';

export default function MarginCalculator() {
  const [assetPrice, setAssetPrice] = useState(22000);
  const [lotSize, setLotSize] = useState(50);
  const [lots, setLots] = useState(1);

  const contractValue = assetPrice * lotSize * lots;
  
  // Approximate simulated margins for Indian indices (e.g., NIFTY 50)
  // Normally ~10-12% SPAN and 2-5% Exposure
  const spanMarginPercent = 11; 
  const exposureMarginPercent = 2;

  const spanMargin = (contractValue * spanMarginPercent) / 100;
  const exposureMargin = (contractValue * exposureMarginPercent) / 100;
  const totalMargin = spanMargin + exposureMargin;
  const leverage = contractValue / totalMargin;

  return (
    <motion.div 
      className="calculator-layout"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      style={{ '--input-accent': '#ff9f0a', '--result-accent': '#ff9f0a' } as any}
    >
      <div className="calculator-layout__inputs">
        <h3 className="dashboard__section-title" style={{ marginBottom: '1rem' }}>Futures Contract Info</h3>

        <div className="input-group">
          <div className="input-group__header">
            <label className="input-group__label">Asset Price (Spot/Future)</label>
            <div className="input-group__value-display">₹{assetPrice}</div>
          </div>
          <input type="range" min="100" max="100000" step="50" value={assetPrice} onChange={(e) => setAssetPrice(Number(e.target.value))} />
        </div>

        <div className="input-group">
          <div className="input-group__header">
            <label className="input-group__label">Lot Size</label>
            <div className="input-group__value-display">{lotSize} Qty</div>
          </div>
          <input type="range" min="10" max="1000" step="5" value={lotSize} onChange={(e) => setLotSize(Number(e.target.value))} />
        </div>

        <div className="input-group">
          <div className="input-group__header">
            <label className="input-group__label">Number of Lots</label>
            <div className="input-group__value-display">{lots}</div>
          </div>
          <input type="range" min="1" max="100" step="1" value={lots} onChange={(e) => setLots(Number(e.target.value))} />
        </div>
      </div>

      <div className="calculator-layout__results">
        <h3 className="dashboard__section-title" style={{ marginBottom: '1rem' }}>Margin Required</h3>

        <div className="results-grid" style={{ flexDirection: 'column' }}>
          <div className="result-card" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--accent-gold)' }}>
            <div className="result-card__label">Total Margin Required</div>
            <div className="result-card__value" style={{ color: 'var(--accent-gold)', fontSize: '3rem' }}>
              {formatCurrency(totalMargin)}
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>
              Contract Value: {formatCurrency(contractValue)} ({leverage.toFixed(1)}x Leverage)
            </p>
          </div>

          <div style={{ display: 'flex', gap: '1rem', width: '100%' }}>
             <div className="result-card">
              <div className="result-card__label">SPAN Margin (~{spanMarginPercent}%)</div>
              <div className="result-card__value" style={{ fontSize: '1.5rem' }}>{formatCurrency(spanMargin)}</div>
            </div>
            <div className="result-card">
              <div className="result-card__label">Exposure Margin (~{exposureMarginPercent}%)</div>
              <div className="result-card__value" style={{ fontSize: '1.5rem' }}>{formatCurrency(exposureMargin)}</div>
            </div>
          </div>
          
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', textAlign: 'center', marginTop: '1rem' }}>
            * This is an estimation. Actual margins are calculated by the clearing corporation and change daily based on volatility.
          </p>
        </div>
      </div>
    </motion.div>
  );
}
