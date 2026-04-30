import { useEffect, useState } from 'react';
import { usePortfolioStore } from '../store/portfolioStore';
import { formatCurrency, formatPercent } from '../utils/formatters';
import { motion } from 'framer-motion';
import { AreaChart, Area, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Wallet, BarChart3, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function Portfolio() {
  const { holdings, totalInvested, totalCurrent, totalReturns, xirr } = usePortfolioStore();
  const [activeTab, setActiveTab] = useState<'holdings' | 'allocation' | 'sip'>('holdings');

  const pieData = holdings.reduce((acc, h) => {
    const existing = acc.find(a => a.name === h.assetType);
    if (existing) existing.value += h.currentValue;
    else acc.push({ name: h.assetType, value: h.currentValue });
    return acc;
  }, [] as { name: string; value: number }[]);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', paddingBottom: '4rem' }}>
      <h1 style={{ fontSize: '2rem', color: 'var(--text-primary)' }}>Portfolio Tracker</h1>
      
      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        {[
          { label: 'Total Invested', value: totalInvested, icon: Wallet, color: '#3b82f6' },
          { label: 'Current Value', value: totalCurrent, icon: BarChart3, color: '#10b981' },
          { label: 'Total Returns', value: totalReturns, icon: TrendingUp, color: totalReturns >= 0 ? '#10b981' : '#ef4444' },
          { label: 'XIRR', value: xirr + '%', icon: ArrowUpRight, color: '#f59e0b' }
        ].map((card, i) => (
          <motion.div key={i} className="glass-card" whileHover={{ y: -4 }}>
            <card.icon size={24} color={card.color} />
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>{card.label}</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {typeof card.value === 'number' ? formatCurrency(card.value) : card.value}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border-subtle)' }}>
        {['holdings', 'allocation', 'sip'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            style={{
              padding: '0.75rem 1rem',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === tab ? '2px solid var(--accent-blue)' : '2px solid transparent',
              color: activeTab === tab ? 'var(--text-primary)' : 'var(--text-secondary)',
              cursor: 'pointer',
              textTransform: 'capitalize'
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Holdings Tab */}
      {activeTab === 'holdings' && (
        <div className="glass-card" style={{ padding: '1rem' }}>
          <h3 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>Holdings</h3>
          {holdings.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
              No holdings yet. Start adding your investments!
            </div>
          ) : (
            holdings.map((h, i) => (
              <div key={i} style={{
                display: 'flex', justifyContent: 'space-between', padding: '1rem 0',
                borderBottom: i !== holdings.length - 1 ? '1px solid var(--border-subtle)' : 'none'
              }}>
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{h.symbol}</div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{h.quantity} units @ {formatCurrency(h.buyPrice)}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{formatCurrency(h.currentValue)}</div>
                  <div style={{ color: h.pnl >= 0 ? 'var(--accent-green)' : 'var(--accent-red)', fontSize: '0.875rem' }}>
                    {h.pnl >= 0 ? '+' : ''}{formatCurrency(h.pnl)} ({formatPercent(h.pnlPercent)})
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Allocation Tab */}
      {activeTab === 'allocation' && (
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <h3 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>Asset Allocation</h3>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={({ name }) => name}>
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* SIP Tab */}
      {activeTab === 'sip' && (
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <h3 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>Active SIPs</h3>
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            SIP tracking coming soon. Link your mutual fund investments to track auto-renewing SIPs.
          </div>
        </div>
      )}
    </div>
  );
}
