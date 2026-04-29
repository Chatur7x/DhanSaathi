import { useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { calcSWP } from '@/utils/calculators';
import { formatCurrency, formatCompact } from '@/utils/formatters';
import { motion } from 'framer-motion';

export default function SWPCalculator() {
  const [corpus, setCorpus] = useState(5000000);
  const [withdrawal, setWithdrawal] = useState(25000);
  const [expectedReturn, setExpectedReturn] = useState(8);
  const [timePeriod, setTimePeriod] = useState(10);

  const results = useMemo(() => {
    return calcSWP(corpus, withdrawal, expectedReturn, timePeriod);
  }, [corpus, withdrawal, expectedReturn, timePeriod]);

  return (
    <motion.div 
      className="calculator-layout"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      style={{ '--input-accent': '#f59e0b', '--result-accent': '#f59e0b' } as any}
    >
      <div className="calculator-layout__inputs">
        <h3 className="dashboard__section-title" style={{ marginBottom: '1rem' }}>Parameters</h3>

        <div className="input-group">
          <div className="input-group__header">
            <label className="input-group__label">Total Corpus</label>
            <div className="input-group__value-display">{formatCurrency(corpus)}</div>
          </div>
          <input
            type="range" min="100000" max="100000000" step="100000"
            value={corpus} onChange={(e) => setCorpus(Number(e.target.value))}
          />
        </div>

        <div className="input-group">
          <div className="input-group__header">
            <label className="input-group__label">Monthly Withdrawal</label>
            <div className="input-group__value-display">{formatCurrency(withdrawal)}</div>
          </div>
          <input
            type="range" min="1000" max="500000" step="1000"
            value={withdrawal} onChange={(e) => setWithdrawal(Number(e.target.value))}
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

        <div className="input-group">
          <div className="input-group__header">
            <label className="input-group__label">Time Period (Years)</label>
            <div className="input-group__value-display">{timePeriod} Yr</div>
          </div>
          <input
            type="range" min="1" max="40" step="1"
            value={timePeriod} onChange={(e) => setTimePeriod(Number(e.target.value))}
          />
        </div>
      </div>

      <div className="calculator-layout__results">
        <h3 className="dashboard__section-title" style={{ marginBottom: '1rem' }}>Projection</h3>

        <div className="results-grid">
          <div className="result-card">
            <div className="result-card__label">Total Withdrawn</div>
            <div className="result-card__value highlight">{formatCompact(results.totalWithdrawn)}</div>
          </div>
          <div className="result-card" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--accent-gold)' }}>
            <div className="result-card__label">Final Balance</div>
            <div className="result-card__value" style={{ color: 'var(--accent-gold)' }}>{formatCompact(results.finalBalance)}</div>
          </div>
        </div>

        <div className="chart-container">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={results.data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.5} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-subtle)" />
              <XAxis dataKey="year" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `${val}Y`} />
              <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => formatCompact(val)} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-subtle)', borderRadius: '8px' }}
                itemStyle={{ color: 'var(--text-primary)' }}
                formatter={(value: number) => formatCurrency(value)}
                labelFormatter={(label) => `Year ${label}`}
              />
              <Area type="monotone" dataKey="balance" stroke="#f59e0b" fill="url(#colorBalance)" name="Remaining Balance" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </motion.div>
  );
}
