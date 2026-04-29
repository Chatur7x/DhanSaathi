import { useState, useMemo } from 'react';
import { calcInflation } from '@/utils/calculators';
import { formatCurrency } from '@/utils/formatters';
import { motion } from 'framer-motion';

export default function InflationCalculator() {
  const [currentCost, setCurrentCost] = useState(50000);
  const [inflationRate, setInflationRate] = useState(6);
  const [years, setYears] = useState(10);

  const results = useMemo(() => {
    return calcInflation(currentCost, inflationRate, years);
  }, [currentCost, inflationRate, years]);

  const futureCost = results.futureCost;
  const difference = results.purchasingPowerLoss;

  return (
    <motion.div 
      className="calculator-layout"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      style={{ '--input-accent': '#8b5cf6', '--result-accent': '#8b5cf6' } as any}
    >
      <div className="calculator-layout__inputs">
        <h3 className="dashboard__section-title" style={{ marginBottom: '1rem' }}>Expense Details</h3>

        <div className="input-group">
          <div className="input-group__header">
            <label className="input-group__label">Current Cost of Item/Expense</label>
            <div className="input-group__value-display">{formatCurrency(currentCost)}</div>
          </div>
          <input
            type="range" min="1000" max="1000000" step="1000"
            value={currentCost} onChange={(e) => setCurrentCost(Number(e.target.value))}
          />
        </div>

        <div className="input-group">
          <div className="input-group__header">
            <label className="input-group__label">Expected Inflation Rate (p.a)</label>
            <div className="input-group__value-display">{inflationRate}%</div>
          </div>
          <input
            type="range" min="1" max="15" step="0.5"
            value={inflationRate} onChange={(e) => setInflationRate(Number(e.target.value))}
          />
        </div>

        <div className="input-group">
          <div className="input-group__header">
            <label className="input-group__label">Years in Future</label>
            <div className="input-group__value-display">{years} Yr</div>
          </div>
          <input
            type="range" min="1" max="50" step="1"
            value={years} onChange={(e) => setYears(Number(e.target.value))}
          />
        </div>
      </div>

      <div className="calculator-layout__results" style={{ justifyContent: 'center' }}>
        <h3 className="dashboard__section-title" style={{ marginBottom: '1rem' }}>Impact of Inflation</h3>

        <div className="results-grid" style={{ flexDirection: 'column' }}>
          <div className="result-card" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--accent-purple)', padding: '3rem 2rem' }}>
            <div className="result-card__label">Future Cost</div>
            <div className="result-card__value" style={{ color: 'var(--accent-purple)', fontSize: '3.5rem' }}>
              {formatCurrency(futureCost)}
            </div>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '16px' }}>
              Because of inflation, you will need {formatCurrency(difference)} extra to buy the exact same thing in {years} years.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
