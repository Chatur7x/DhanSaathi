import { useEffect, useState } from 'react';
import { usePortfolioStore } from '../store/portfolioStore';
import { formatCurrency, formatPercent } from '../utils/formatters';
import { motion, AnimatePresence } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { TrendingUp, Wallet, BarChart3, ArrowUpRight, ArrowDownRight, Plus, X, ShoppingCart, DollarSign } from 'lucide-react';
import GlowCard from '../components/ui/GlowCard';
import AnimatedCounter from '../components/ui/AnimatedCounter';
import MagneticButton from '../components/ui/MagneticButton';
import { LivePulse } from '../components/ui/PremiumUI';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, filter: 'blur(4px)' },
  show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { type: 'spring' as const, stiffness: 300, damping: 25 } }
};

export default function Portfolio() {
  const { holdings, totalInvested, totalCurrent, totalReturns, xirr, buyHolding, sellHolding } = usePortfolioStore();
  const [activeTab, setActiveTab] = useState<'holdings' | 'allocation' | 'trade'>('holdings');
  const [tradeForm, setTradeForm] = useState({ symbol: '', quantity: '', price: '', type: 'BUY' as 'BUY' | 'SELL' });
  const [showSuccess, setShowSuccess] = useState(false);

  const pieData = holdings.reduce((acc, h) => {
    const existing = acc.find(a => a.name === h.assetType);
    if (existing) existing.value += (h.currentValue || h.quantity * h.buyPrice);
    else acc.push({ name: h.assetType, value: h.currentValue || h.quantity * h.buyPrice });
    return acc;
  }, [] as { name: string; value: number }[]);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4'];

  const handleTrade = async () => {
    const qty = parseFloat(tradeForm.quantity);
    const price = parseFloat(tradeForm.price);
    if (!tradeForm.symbol || isNaN(qty) || isNaN(price)) return;

    if (tradeForm.type === 'BUY') {
      await buyHolding(tradeForm.symbol.toUpperCase(), qty, price);
    } else {
      await sellHolding(tradeForm.symbol.toUpperCase(), qty, price);
    }
    setTradeForm({ symbol: '', quantity: '', price: '', type: 'BUY' });
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '4rem' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <motion.h1 variants={itemVariants} style={{ fontSize: '2rem', color: 'var(--text-primary)' }}>
          Portfolio Tracker
        </motion.h1>
        <LivePulse label="SYNCED" />
      </div>

      {/* Success Toast */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            style={{
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              borderRadius: '12px',
              padding: '1rem 1.5rem',
              color: '#10b981',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <ArrowUpRight size={18} /> Trade executed and saved to database!
          </motion.div>
        )}
      </AnimatePresence>

      {/* Summary Cards */}
      <motion.div variants={itemVariants} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        {[
          { label: 'Total Invested', value: totalInvested, icon: Wallet, color: '#3b82f6' },
          { label: 'Current Value', value: totalCurrent, icon: BarChart3, color: '#10b981' },
          { label: 'Total Returns', value: totalReturns, icon: TrendingUp, color: totalReturns >= 0 ? '#10b981' : '#ef4444' },
          { label: 'XIRR', value: xirr, icon: ArrowUpRight, color: '#f59e0b', isSuffix: true }
        ].map((card, i) => (
          <GlowCard key={i} glowColor={card.color}>
            <card.icon size={24} color={card.color} />
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.5rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>{card.label}</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.25rem' }}>
              {card.isSuffix
                ? <AnimatedCounter value={card.value} suffix="%" decimals={1} />
                : <AnimatedCounter value={card.value} prefix="₹" decimals={0} />
              }
            </div>
          </GlowCard>
        ))}
      </motion.div>

      {/* Tabs */}
      <motion.div variants={itemVariants} className="tabs">
        {[
          { key: 'holdings', label: 'Holdings', icon: BarChart3 },
          { key: 'allocation', label: 'Allocation', icon: Wallet },
          { key: 'trade', label: 'Trade', icon: ShoppingCart }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`tabs__tab ${activeTab === tab.key ? 'active' : ''}`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </motion.div>

      {/* Holdings Tab */}
      <AnimatePresence mode="wait">
        {activeTab === 'holdings' && (
          <motion.div
            key="holdings"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            <GlowCard glowColor="#3b82f6" style={{ padding: '1rem' }}>
              <h3 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>Holdings ({holdings.length})</h3>
              {holdings.length === 0 ? (
                <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  <ShoppingCart size={48} style={{ marginBottom: '1rem', opacity: 0.3 }} />
                  <p>No holdings yet. Go to the <b>Trade</b> tab to start building your portfolio!</p>
                </div>
              ) : (
                holdings.map((h, i) => (
                  <motion.div
                    key={h.symbol}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06, type: 'spring', stiffness: 300, damping: 25 }}
                    whileHover={{ x: 4, backgroundColor: 'rgba(255,255,255,0.02)' }}
                    style={{
                      display: 'flex', justifyContent: 'space-between', padding: '1rem 0.5rem',
                      borderBottom: i !== holdings.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                      borderRadius: '8px', cursor: 'default',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '1rem' }}>{h.symbol}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{h.quantity} units @ {formatCurrency(h.buyPrice)}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                        <AnimatedCounter value={h.currentValue || h.quantity * h.buyPrice} prefix="₹" decimals={0} />
                      </div>
                      <div style={{ color: h.pnl >= 0 ? 'var(--accent-green)' : 'var(--accent-red)', fontSize: '0.8rem', fontWeight: 600 }}>
                        {h.pnl >= 0 ? '+' : ''}{formatCurrency(h.pnl)} ({formatPercent(h.pnlPercent)})
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </GlowCard>
          </motion.div>
        )}

        {/* Allocation Tab */}
        {activeTab === 'allocation' && (
          <motion.div
            key="allocation"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            <GlowCard glowColor="#f59e0b" style={{ padding: '1.5rem' }}>
              <h3 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>Asset Allocation</h3>
              {pieData.length > 0 ? (
                <div style={{ height: '300px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" outerRadius={100} innerRadius={60} dataKey="value" label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`} animationDuration={1500}>
                        {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip formatter={(value: number) => formatCurrency(value)} contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  Add holdings to see your asset allocation breakdown.
                </div>
              )}
            </GlowCard>
          </motion.div>
        )}

        {/* Trade Tab */}
        {activeTab === 'trade' && (
          <motion.div
            key="trade"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            <GlowCard glowColor={tradeForm.type === 'BUY' ? '#10b981' : '#ef4444'} style={{ padding: '2rem' }}>
              <h3 style={{ marginBottom: '1.5rem', color: 'var(--text-primary)' }}>Execute Trade</h3>

              {/* Buy/Sell Toggle */}
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
                {(['BUY', 'SELL'] as const).map(type => (
                  <motion.button
                    key={type}
                    onClick={() => setTradeForm(f => ({ ...f, type }))}
                    whileTap={{ scale: 0.95 }}
                    style={{
                      flex: 1,
                      padding: '0.75rem',
                      borderRadius: '12px',
                      fontWeight: 700,
                      fontSize: '0.9rem',
                      cursor: 'pointer',
                      background: tradeForm.type === type
                        ? (type === 'BUY' ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)')
                        : 'rgba(255,255,255,0.05)',
                      color: tradeForm.type === type
                        ? (type === 'BUY' ? '#10b981' : '#ef4444')
                        : 'var(--text-secondary)',
                      border: tradeForm.type === type
                        ? `1px solid ${type === 'BUY' ? 'rgba(16,185,129,0.4)' : 'rgba(239,68,68,0.4)'}`
                        : '1px solid rgba(255,255,255,0.05)',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {type === 'BUY' ? <Plus size={14} style={{ display: 'inline', marginRight: '4px' }} /> : <X size={14} style={{ display: 'inline', marginRight: '4px' }} />}
                    {type}
                  </motion.button>
                ))}
              </div>

              {/* Form Fields */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label className="label">Stock Symbol</label>
                  <input
                    className="input"
                    placeholder="e.g. RELIANCE.NS"
                    value={tradeForm.symbol}
                    onChange={(e) => setTradeForm(f => ({ ...f, symbol: e.target.value }))}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label className="label">Quantity</label>
                    <input
                      className="input"
                      type="number"
                      placeholder="10"
                      value={tradeForm.quantity}
                      onChange={(e) => setTradeForm(f => ({ ...f, quantity: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="label">Price (₹)</label>
                    <input
                      className="input"
                      type="number"
                      placeholder="2450.00"
                      value={tradeForm.price}
                      onChange={(e) => setTradeForm(f => ({ ...f, price: e.target.value }))}
                    />
                  </div>
                </div>

                {tradeForm.symbol && tradeForm.quantity && tradeForm.price && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    style={{
                      background: 'rgba(255,255,255,0.03)',
                      borderRadius: '12px',
                      padding: '1rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span style={{ color: 'var(--text-secondary)' }}>Total Value</span>
                    <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '1.1rem' }}>
                      ₹{(parseFloat(tradeForm.quantity) * parseFloat(tradeForm.price)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </motion.div>
                )}

                <MagneticButton
                  className={tradeForm.type === 'BUY' ? 'btn--green' : 'btn--primary'}
                  onClick={handleTrade}
                  style={{ width: '100%', justifyContent: 'center', padding: '1rem', fontSize: '1rem' }}
                >
                  <DollarSign size={18} />
                  Execute {tradeForm.type} Order
                </MagneticButton>
              </div>
            </GlowCard>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
