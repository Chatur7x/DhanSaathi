import { useState, useMemo } from 'react';
import { calcCAGR } from '@/utils/calculators';
import { formatCurrency, formatPercent } from '@/utils/formatters';
import { motion } from 'framer-motion';

export default function CAGRCalculator() {
  const [initialValue, setInitialValue] = useState(100000);
  const [finalValue, setFinalValue] = useState(250000);
  const [years, setYears] = useState(5);

  const cagr = useMemo(() => {
    return calcCAGR(initialValue, finalValue, years);
  }, [initialValue, finalValue, years]);

  const absoluteReturn = ((finalValue - initialValue) / initialValue) * 100;

  return (
    <motion.div 
      className="calculator-layout"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      style={{ '--input-accent': '#3b82f6', '--result-accent': '#3b82f6' } as any}
    >
      <div className="calculator-layout__inputs">
        <h3 className="dashboard__section-title" style={{ marginBottom: '1rem' }}>Growth Details</h3>

        <div className="input-group">
          <div className="input-group__header">
            <label className="input-group__label">Initial Investment</label>
            <div className="input-group__value-display">{formatCurrency(initialValue)}</div>
          </div>
          <input
            type="range" min="1000" max="10000000" step="1000"
            value={initialValue} onChange={(e) => setInitialValue(Number(e.target.value))}
          />
        </div>

        <div className="input-group">
          <div className="input-group__header">
            <label className="input-group__label">Final Value</label>
            <div className="input-group__value-display">{formatCurrency(finalValue)}</div>
          </div>
          <input
            type="range" min="1000" max="50000000" step="1000"
            value={finalValue} onChange={(e) => setFinalValue(Number(e.target.value))}
          />
        </div>

        <div className="input-group">
          <div className="input-group__header">
            <label className="input-group__label">Time Period (Years)</label>
            <div className="input-group__value-display">{years} Yr</div>
          </div>
          <input
            type="range" min="1" max="40" step="1"
            value={years} onChange={(e) => setYears(Number(e.target.value))}
          />
        </div>
      </div>

      <div className="calculator-layout__results" style={{ justifyContent: 'center' }}>
        <h3 className="dashboard__section-title" style={{ marginBottom: '1rem' }}>Performance</h3>

        <div className="results-grid" style={{ flexDirection: 'column' }}>
          <div className="result-card" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--accent-blue)', padding: '3rem 2rem' }}>
            <div className="result-card__label">Compound Annual Growth Rate</div>
            <div className="result-card__value" style={{ color: 'var(--accent-blue)', fontSize: '4rem' }}>
              {formatPercent(cagr)}
            </div>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '16px' }}>
              Your investment grew by an average of {formatPercent(cagr)} every year.
            </p>
          </div>

          <div className="result-card">
            <div className="result-card__label">Absolute Return</div>
            <div className="result-card__value highlight">
              {formatPercent(absoluteReturn)}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
