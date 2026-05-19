import { useState, useMemo } from 'react';
import { calcGoalSIP } from '@/utils/calculators';
import { formatCurrency, formatCompact } from '@/utils/formatters';
import { motion } from 'framer-motion';

export default function GoalPlanner() {
  const [targetAmount, setTargetAmount] = useState(10000000); // 1 Cr
  const [timePeriod, setTimePeriod] = useState(10);
  const [expectedReturn, setExpectedReturn] = useState(12);

  const requiredSIP = useMemo(() => {
    return calcGoalSIP(targetAmount, timePeriod, expectedReturn);
  }, [targetAmount, timePeriod, expectedReturn]);

  const totalInvested = requiredSIP * timePeriod * 12;

  return (
    <motion.div 
      className="calculator-layout"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      style={{ '--input-accent': '#ec4899', '--result-accent': '#ec4899' } as any}
    >
      <div className="calculator-layout__inputs">
        <h3 className="dashboard__section-title" style={{ marginBottom: '1rem' }}>Goal Details</h3>

        <div className="input-group">
          <div className="input-group__header">
            <label className="input-group__label">Target Amount</label>
            <div className="input-group__value-display">{formatCompact(targetAmount)}</div>
          </div>
          <input
            type="range" min="100000" max="100000000" step="100000"
            value={targetAmount} onChange={(e) => setTargetAmount(Number(e.target.value))}
          />
        </div>

        <div className="input-group">
          <div className="input-group__header">
            <label className="input-group__label">Time to Goal (Years)</label>
            <div className="input-group__value-display">{timePeriod} Yr</div>
          </div>
          <input
            type="range" min="1" max="40" step="1"
            value={timePeriod} onChange={(e) => setTimePeriod(Number(e.target.value))}
          />
        </div>

        <div className="input-group">
          <div className="input-group__header">
            <label className="input-group__label">Expected Return Rate (p.a)</label>
            <div className="input-group__value-display">{expectedReturn}%</div>
          </div>
          <input
            type="range" min="1" max="30" step="0.5"
            value={expectedReturn} onChange={(e) => setExpectedReturn(Number(e.target.value))}
          />
        </div>
      </div>

      <div className="calculator-layout__results">
        <h3 className="dashboard__section-title" style={{ marginBottom: '1rem' }}>Action Plan</h3>

        <div className="results-grid" style={{ flexDirection: 'column' }}>
          <div className="result-card" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--accent-pink)' }}>
            <div className="result-card__label">Required Monthly SIP</div>
            <div className="result-card__value" style={{ color: 'var(--accent-pink)', fontSize: '3rem' }}>
              {formatCurrency(requiredSIP)}
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>
              Invest {formatCurrency(requiredSIP)} every month for {timePeriod} years at {expectedReturn}% returns.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '1rem', width: '100%' }}>
             <div className="result-card">
              <div className="result-card__label">Total Outflow</div>
              <div className="result-card__value" style={{ fontSize: '1.5rem' }}>{formatCompact(totalInvested)}</div>
            </div>
            <div className="result-card">
              <div className="result-card__label">Wealth Gained</div>
              <div className="result-card__value highlight" style={{ fontSize: '1.5rem' }}>+{formatCompact(targetAmount - totalInvested)}</div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
