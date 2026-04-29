import { useState, useMemo } from 'react';
import { calcTax } from '@/utils/calculators';
import { formatCurrency } from '@/utils/formatters';
import { motion } from 'framer-motion';

export default function TaxCalculator() {
  const [investedAmount, setInvestedAmount] = useState(100000);
  const [currentValue, setCurrentValue] = useState(250000);
  const [holdingPeriod, setHoldingPeriod] = useState(18); // months

  const profit = currentValue - investedAmount;
  const gainType = holdingPeriod > 12 ? 'LTCG' : 'STCG';
  
  const results = useMemo(() => {
    return calcTax(profit, gainType, 'equity');
  }, [profit, gainType]);

  return (
    <motion.div 
      className="calculator-layout"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      style={{ '--input-accent': '#ef4444', '--result-accent': '#ef4444' } as any}
    >
      <div className="calculator-layout__inputs">
        <h3 className="dashboard__section-title" style={{ marginBottom: '1rem' }}>Trade Details (Equity)</h3>

        <div className="input-group">
          <div className="input-group__header">
            <label className="input-group__label">Invested Amount</label>
            <div className="input-group__value-display">{formatCurrency(investedAmount)}</div>
          </div>
          <input
            type="range" min="10000" max="5000000" step="10000"
            value={investedAmount} onChange={(e) => setInvestedAmount(Number(e.target.value))}
          />
        </div>

        <div className="input-group">
          <div className="input-group__header">
            <label className="input-group__label">Current/Sell Value</label>
            <div className="input-group__value-display">{formatCurrency(currentValue)}</div>
          </div>
          <input
            type="range" min="10000" max="10000000" step="10000"
            value={currentValue} onChange={(e) => setCurrentValue(Number(e.target.value))}
          />
        </div>

        <div className="input-group">
          <div className="input-group__header">
            <label className="input-group__label">Holding Period (Months)</label>
            <div className="input-group__value-display">{holdingPeriod} Mo</div>
          </div>
          <input
            type="range" min="1" max="60" step="1"
            value={holdingPeriod} onChange={(e) => setHoldingPeriod(Number(e.target.value))}
          />
        </div>
      </div>

      <div className="calculator-layout__results">
        <h3 className="dashboard__section-title" style={{ marginBottom: '1rem' }}>Tax Breakdown</h3>

        <div className="results-grid" style={{ flexDirection: 'column' }}>
          <div className="result-card" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--accent-red)' }}>
            <div className="result-card__label">Estimated Tax Payable</div>
            <div className="result-card__value" style={{ color: 'var(--accent-red)', fontSize: '3rem' }}>
              {formatCurrency(results.tax)}
            </div>
            <div style={{ marginTop: '8px' }}>
              <span className={`badge ${gainType === 'LTCG' ? 'badge--green' : 'badge--red'}`}>
                {gainType} Applied ({results.rate}%)
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', width: '100%' }}>
             <div className="result-card">
              <div className="result-card__label">Total Profit</div>
              <div className="result-card__value" style={{ fontSize: '1.5rem', color: 'var(--accent-green)' }}>
                {formatCurrency(profit)}
              </div>
            </div>
            <div className="result-card">
              <div className="result-card__label">In-hand after Tax</div>
              <div className="result-card__value" style={{ fontSize: '1.5rem' }}>
                {formatCurrency(currentValue - results.tax)}
              </div>
            </div>
          </div>
          
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center', marginTop: '1rem' }}>
            {results.note}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
