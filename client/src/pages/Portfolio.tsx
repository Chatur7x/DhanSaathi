import { useState, useEffect } from 'react';
import { getRealPortfolio } from '../services/api';
import { formatCurrency, formatPercent } from '../utils/formatters';
import { motion } from 'framer-motion';
import { Wallet, TrendingUp } from 'lucide-react';

export default function Portfolio() {
  const [portfolio, setPortfolio] = useState({ invested: 0, returns: 0, xirr: 0, balance: 0 });
  const [inputInvested, setInputInvested] = useState('');
  const [inputBalance, setInputBalance] = useState('');

  useEffect(() => {
    setPortfolio(getRealPortfolio());
  }, []);

  const handleSave = () => {
    const inv = parseFloat(inputInvested) || 0;
    const bal = parseFloat(inputBalance) || 0;
    const ret = bal - inv;
    const xirrEstimate = inv > 0 ? (ret / inv) * 100 : 0; // Simple approximation for demo

    const newPort = { invested: inv, returns: ret, balance: bal, xirr: Number(xirrEstimate.toFixed(2)) };
    localStorage.setItem('dhansaathi_portfolio', JSON.stringify(newPort));
    setPortfolio(newPort);
    setInputInvested('');
    setInputBalance('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', paddingBottom: '4rem' }}>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
        <motion.div className="glass-card" whileHover={{ y: -4 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--accent-blue)' }}>
            <Wallet size={20} /> <span style={{ fontWeight: 600 }}>Total Invested</span>
          </div>
          <h2 style={{ fontSize: '2rem', color: 'var(--text-primary)' }}>{formatCurrency(portfolio.invested)}</h2>
        </motion.div>
        
        <motion.div className="glass-card" whileHover={{ y: -4 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--accent-green)' }}>
            <TrendingUp size={20} /> <span style={{ fontWeight: 600 }}>Current Balance</span>
          </div>
          <h2 style={{ fontSize: '2rem', color: 'var(--text-primary)' }}>{formatCurrency(portfolio.balance)}</h2>
          <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: portfolio.returns >= 0 ? 'var(--accent-green)' : 'var(--accent-red)' }}>
            {portfolio.returns >= 0 ? '+' : ''}{formatCurrency(portfolio.returns)} ({formatPercent(portfolio.xirr)})
          </div>
        </motion.div>
      </div>

      <div className="glass-card">
        <h3 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>Update Real Portfolio Data</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
          Since we don't connect directly to your broker yet, enter your real invested amount and current balance to track your performance across the Dashboard. This is saved securely in your browser's local storage.
        </p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '400px' }}>
          <div>
            <label className="label">Total Invested (₹)</label>
            <input 
              type="number" 
              className="input" 
              placeholder="e.g. 500000" 
              value={inputInvested}
              onChange={e => setInputInvested(e.target.value)}
            />
          </div>
          <div>
            <label className="label">Current Balance (₹)</label>
            <input 
              type="number" 
              className="input" 
              placeholder="e.g. 650000" 
              value={inputBalance}
              onChange={e => setInputBalance(e.target.value)}
            />
          </div>
          <button className="btn btn--primary" style={{ marginTop: '1rem', justifyContent: 'center' }} onClick={handleSave}>
            Save Portfolio
          </button>
        </div>
      </div>

    </div>
  );
}
