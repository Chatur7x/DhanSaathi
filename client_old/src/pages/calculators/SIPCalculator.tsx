import { useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { calcSIP, calcSIPYearwise } from '@/utils/calculators';
import { formatCurrency, formatCompact } from '@/utils/formatters';
import { motion } from 'framer-motion';

export default function SIPCalculator() {
  const [monthlyInvestment, setMonthlyInvestment] = useState(10000);
  const [expectedReturn, setExpectedReturn] = useState(12);
  const [timePeriod, setTimePeriod] = useState(10);

  const results = useMemo(() => {
    return calcSIP(monthlyInvestment, timePeriod, expectedReturn);
  }, [monthlyInvestment, expectedReturn, timePeriod]);

  const chartData = useMemo(() => {
    return calcSIPYearwise(monthlyInvestment, timePeriod, expectedReturn);
  }, [monthlyInvestment, expectedReturn, timePeriod]);

  return (
    <motion.div 
      className="calculator-layout"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Inputs Section */}
      <div className="calculator-layout__inputs glass-card">
        <h3 className="dashboard__section-title" style={{ marginBottom: '1rem' }}>SIP Parameters</h3>

        <div className="input-group">
          <div className="input-group__header">
            <label className="input-group__label">Monthly Investment</label>
            <div className="input-group__value-display">{formatCurrency(monthlyInvestment)}</div>
          </div>
          <input
            type="range"
            min="500"
            max="100000"
            step="500"
            value={monthlyInvestment}
            onChange={(e) => setMonthlyInvestment(Number(e.target.value))}
          />
          <div className="flex justify-between" style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
            <span>₹500</span>
            <span>₹1L</span>
          </div>
        </div>

        <div className="input-group">
          <div className="input-group__header">
            <label className="input-group__label">Expected Return Rate (p.a)</label>
            <div className="input-group__value-display">{expectedReturn}%</div>
          </div>
          <input
            type="range"
            min="1"
            max="30"
            step="0.5"
            value={expectedReturn}
            onChange={(e) => setExpectedReturn(Number(e.target.value))}
          />
          <div className="flex justify-between" style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
            <span>1%</span>
            <span>30%</span>
          </div>
        </div>

        <div className="input-group">
          <div className="input-group__header">
            <label className="input-group__label">Time Period (Years)</label>
            <div className="input-group__value-display">{timePeriod} Yr</div>
          </div>
          <input
            type="range"
            min="1"
            max="40"
            step="1"
            value={timePeriod}
            onChange={(e) => setTimePeriod(Number(e.target.value))}
          />
          <div className="flex justify-between" style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
            <span>1 Yr</span>
            <span>40 Yr</span>
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div className="calculator-layout__results glass-card">
        <h3 className="dashboard__section-title" style={{ marginBottom: '1rem' }}>Investment Projection</h3>

        <div className="results-grid">
          <div className="result-card">
            <div className="result-card__label">Invested Amount</div>
            <div className="result-card__value">{formatCompact(results.totalInvested)}</div>
          </div>
          <div className="result-card">
            <div className="result-card__label">Est. Returns</div>
            <div className="result-card__value highlight">+{formatCompact(results.wealthGained)}</div>
          </div>
          <div className="result-card" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--accent-blue)' }}>
            <div className="result-card__label">Total Value</div>
            <div className="result-card__value" style={{ color: 'var(--accent-blue)' }}>{formatCompact(results.futureValue)}</div>
          </div>
        </div>

        <div className="chart-container">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorInvested" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--text-muted)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--text-muted)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--accent-blue)" stopOpacity={0.5} />
                  <stop offset="95%" stopColor="var(--accent-blue)" stopOpacity={0} />
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
              <Area type="monotone" dataKey="invested" stackId="1" stroke="var(--text-muted)" fill="url(#colorInvested)" name="Invested" />
              <Area type="monotone" dataKey="gains" stackId="2" stroke="var(--accent-blue)" fill="url(#colorValue)" name="Est. Returns" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </motion.div>
  );
}
