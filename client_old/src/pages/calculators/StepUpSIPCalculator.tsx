import { useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { calcStepUpSIP } from '@/utils/calculators';
import { formatCurrency, formatCompact } from '@/utils/formatters';
import { motion } from 'framer-motion';

export default function StepUpSIPCalculator() {
  const [monthlyInvestment, setMonthlyInvestment] = useState(10000);
  const [annualStepUp, setAnnualStepUp] = useState(10);
  const [expectedReturn, setExpectedReturn] = useState(12);
  const [timePeriod, setTimePeriod] = useState(10);

  const results = useMemo(() => {
    return calcStepUpSIP(monthlyInvestment, annualStepUp, timePeriod, expectedReturn);
  }, [monthlyInvestment, annualStepUp, expectedReturn, timePeriod]);

  return (
    <motion.div 
      className="calculator-layout"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      style={{ '--input-accent': '#10b981', '--result-accent': '#10b981' } as any}
    >
      {/* Inputs Section */}
      <div className="calculator-layout__inputs">
        <h3 className="dashboard__section-title" style={{ marginBottom: '1rem' }}>Parameters</h3>

        <div className="input-group">
          <div className="input-group__header">
            <label className="input-group__label">Initial Monthly Investment</label>
            <div className="input-group__value-display">{formatCurrency(monthlyInvestment)}</div>
          </div>
          <input
            type="range" min="500" max="100000" step="500"
            value={monthlyInvestment} onChange={(e) => setMonthlyInvestment(Number(e.target.value))}
          />
        </div>

        <div className="input-group">
          <div className="input-group__header">
            <label className="input-group__label">Annual Step-up (%)</label>
            <div className="input-group__value-display">{annualStepUp}%</div>
          </div>
          <input
            type="range" min="1" max="50" step="1"
            value={annualStepUp} onChange={(e) => setAnnualStepUp(Number(e.target.value))}
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

      {/* Results Section */}
      <div className="calculator-layout__results">
        <h3 className="dashboard__section-title" style={{ marginBottom: '1rem' }}>Projection</h3>

        <div className="results-grid">
          <div className="result-card">
            <div className="result-card__label">Invested Amount</div>
            <div className="result-card__value">{formatCompact(results.totalInvested)}</div>
          </div>
          <div className="result-card">
            <div className="result-card__label">Est. Returns</div>
            <div className="result-card__value highlight">+{formatCompact(results.wealthGained)}</div>
          </div>
          <div className="result-card" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--accent-green)' }}>
            <div className="result-card__label">Total Value</div>
            <div className="result-card__value" style={{ color: 'var(--accent-green)' }}>{formatCompact(results.futureValue)}</div>
          </div>
        </div>

        <div className="chart-container">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={results.yearwise} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorInvestedStepUp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--text-muted)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--text-muted)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorValueStepUp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--accent-green)" stopOpacity={0.5} />
                  <stop offset="95%" stopColor="var(--accent-green)" stopOpacity={0} />
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
              <Area type="monotone" dataKey="invested" stackId="1" stroke="var(--text-muted)" fill="url(#colorInvestedStepUp)" name="Invested" />
              <Area type="monotone" dataKey="gains" stackId="2" stroke="var(--accent-green)" fill="url(#colorValueStepUp)" name="Est. Returns" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </motion.div>
  );
}
