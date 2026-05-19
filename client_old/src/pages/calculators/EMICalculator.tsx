import { useState, useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { calcEMI } from '@/utils/calculators';
import { formatCurrency, formatCompact } from '@/utils/formatters';
import { motion } from 'framer-motion';

export default function EMICalculator() {
  const [loanAmount, setLoanAmount] = useState(5000000);
  const [interestRate, setInterestRate] = useState(8.5);
  const [tenureYears, setTenureYears] = useState(20);

  const results = useMemo(() => {
    return calcEMI(loanAmount, interestRate, tenureYears * 12);
  }, [loanAmount, interestRate, tenureYears]);

  const pieData = [
    { name: 'Principal', value: loanAmount, color: '#3b82f6' },
    { name: 'Total Interest', value: results.totalInterest, color: '#06b6d4' }
  ];

  return (
    <motion.div 
      className="calculator-layout"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      style={{ '--input-accent': '#06b6d4', '--result-accent': '#06b6d4' } as any}
    >
      <div className="calculator-layout__inputs">
        <h3 className="dashboard__section-title" style={{ marginBottom: '1rem' }}>Loan Details</h3>

        <div className="input-group">
          <div className="input-group__header">
            <label className="input-group__label">Loan Amount</label>
            <div className="input-group__value-display">{formatCurrency(loanAmount)}</div>
          </div>
          <input
            type="range" min="100000" max="50000000" step="100000"
            value={loanAmount} onChange={(e) => setLoanAmount(Number(e.target.value))}
          />
        </div>

        <div className="input-group">
          <div className="input-group__header">
            <label className="input-group__label">Interest Rate (p.a)</label>
            <div className="input-group__value-display">{interestRate}%</div>
          </div>
          <input
            type="range" min="1" max="20" step="0.1"
            value={interestRate} onChange={(e) => setInterestRate(Number(e.target.value))}
          />
        </div>

        <div className="input-group">
          <div className="input-group__header">
            <label className="input-group__label">Tenure (Years)</label>
            <div className="input-group__value-display">{tenureYears} Yr</div>
          </div>
          <input
            type="range" min="1" max="30" step="1"
            value={tenureYears} onChange={(e) => setTenureYears(Number(e.target.value))}
          />
        </div>
      </div>

      <div className="calculator-layout__results">
        <h3 className="dashboard__section-title" style={{ marginBottom: '1rem' }}>Breakdown</h3>

        <div className="results-grid">
          <div className="result-card" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--accent-cyan)' }}>
            <div className="result-card__label">Monthly EMI</div>
            <div className="result-card__value" style={{ color: 'var(--accent-cyan)' }}>{formatCurrency(results.emi)}</div>
          </div>
          <div className="result-card">
            <div className="result-card__label">Total Interest</div>
            <div className="result-card__value">{formatCompact(results.totalInterest)}</div>
          </div>
          <div className="result-card">
            <div className="result-card__label">Total Payment</div>
            <div className="result-card__value">{formatCompact(results.totalAmount)}</div>
          </div>
        </div>

        <div className="chart-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={pieData} cx="50%" cy="50%"
                innerRadius={70} outerRadius={100}
                paddingAngle={5} dataKey="value" stroke="none"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <RechartsTooltip 
                formatter={(value: number) => formatCurrency(value)}
                contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-subtle)', borderRadius: '8px', color: 'white' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </motion.div>
  );
}
