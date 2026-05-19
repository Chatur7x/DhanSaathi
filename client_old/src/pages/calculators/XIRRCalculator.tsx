import { useState } from 'react';
import { calcXIRR } from '@/utils/calculators';
import { formatCurrency, formatPercent } from '@/utils/formatters';
import { motion } from 'framer-motion';

export default function XIRRCalculator() {
  const [cashflows, setCashflows] = useState([
    { amount: -100000, date: new Date('2022-01-01') },
    { amount: 15000, date: new Date('2022-12-31') },
    { amount: 15000, date: new Date('2023-12-31') },
    { amount: 115000, date: new Date('2024-12-31') }
  ]);

  const xirr = calcXIRR(cashflows);

  return (
    <motion.div 
      className="calculator-layout"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      style={{ '--input-accent': '#ff3b30', '--result-accent': '#ff3b30' } as any}
    >
      <div className="calculator-layout__inputs">
        <h3 className="dashboard__section-title" style={{ marginBottom: '1rem' }}>Cash Flows</h3>
        <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '1rem' }}>
          Negative values are investments (outflows). Positive values are returns (inflows).
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {cashflows.map((cf, index) => (
            <div key={index} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <input
                type="date"
                value={cf.date.toISOString().split('T')[0]}
                onChange={(e) => {
                  const newCfs = [...cashflows];
                  newCfs[index].date = new Date(e.target.value);
                  setCashflows(newCfs);
                }}
                style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)', color: 'white', padding: '0.5rem', borderRadius: '8px' }}
              />
              <input
                type="number"
                value={cf.amount}
                onChange={(e) => {
                  const newCfs = [...cashflows];
                  newCfs[index].amount = Number(e.target.value);
                  setCashflows(newCfs);
                }}
                style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)', color: 'white', padding: '0.5rem', borderRadius: '8px', flex: 1 }}
              />
            </div>
          ))}
        </div>

        <button 
          onClick={() => setCashflows([...cashflows, { amount: 0, date: new Date() }])}
          style={{ marginTop: '1rem', background: 'rgba(255,255,255,0.1)', color: 'white', padding: '0.75rem', borderRadius: '8px', border: 'none', cursor: 'pointer' }}
        >
          + Add Cash Flow
        </button>
      </div>

      <div className="calculator-layout__results" style={{ justifyContent: 'center' }}>
        <h3 className="dashboard__section-title" style={{ marginBottom: '1rem' }}>XIRR Result</h3>

        <div className="results-grid" style={{ flexDirection: 'column' }}>
          <div className="result-card" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--accent-red)', padding: '3rem 2rem' }}>
            <div className="result-card__label">Extended Internal Rate of Return</div>
            <div className="result-card__value" style={{ color: 'var(--accent-red)', fontSize: '4rem' }}>
              {xirr === null ? 'Error' : formatPercent(xirr)}
            </div>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '16px' }}>
              This is the annualized yield of your irregular investments.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
