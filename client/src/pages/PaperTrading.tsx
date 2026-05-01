import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { usePaperTradingStore } from '../store/paperTradingStore';
import { formatCurrency, formatPercent } from '../utils/formatters';
import { Play, Plus, Trash2, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, DollarSign, BarChart3, Trophy } from 'lucide-react';
import { socket } from '../services/api';

export default function PaperTrading() {
  const { sessions, activeSession, loading, fetchSessions, createSession, loadSession, executeTrade, deleteSession } = usePaperTradingStore();
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('My Portfolio');
  const [newBalance, setNewBalance] = useState(1000000);
  const [tradeForm, setTradeForm] = useState({ symbol: 'RELIANCE.NS', action: 'BUY' as 'BUY' | 'SELL', quantity: 10 });
  const [livePrice, setLivePrice] = useState<Record<string, number>>({});
  const [error, setError] = useState('');

  useEffect(() => { fetchSessions(); }, []);

  // Listen to live prices
  useEffect(() => {
    const handler = (data: any[]) => {
      const prices: Record<string, number> = {};
      data.forEach(d => { if (d.price > 0) prices[d.symbol] = d.price; });
      setLivePrice(prices);
    };
    socket.on('marketUpdate', handler);
    return () => { socket.off('marketUpdate', handler); };
  }, []);

  const handleCreate = async () => {
    await createSession(newName, newBalance);
    setShowCreate(false);
  };

  const handleTrade = async () => {
    setError('');
    const price = livePrice[tradeForm.symbol];
    if (!price) { setError('No live price for this symbol'); return; }
    try {
      await executeTrade(tradeForm.symbol, tradeForm.action, tradeForm.quantity, price);
    } catch (e: any) {
      setError(e.message || 'Trade failed');
    }
  };

  const STOCKS = [
    { symbol: 'RELIANCE.NS', name: 'Reliance' },
    { symbol: 'TCS.NS', name: 'TCS' },
    { symbol: 'HDFCBANK.NS', name: 'HDFC Bank' },
    { symbol: 'INFY.NS', name: 'Infosys' },
    { symbol: 'ITC.NS', name: 'ITC' },
    { symbol: 'SBIN.NS', name: 'SBI' },
  ];

  const winRate = activeSession && activeSession.total_trades > 0
    ? ((activeSession.win_count / activeSession.total_trades) * 100).toFixed(0)
    : '0';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', paddingBottom: '4rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', color: 'var(--text-primary)' }}>
            <Play size={28} style={{ display: 'inline', marginRight: '0.5rem', color: '#10b981' }} />
            Paper Trading
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Practice trading with ₹10L virtual money — zero risk, real prices</p>
        </div>
        <button className="btn btn--primary" onClick={() => setShowCreate(true)}>
          <Plus size={16} /> New Session
        </button>
      </div>

      {/* Create Session */}
      {showCreate && (
        <motion.div className="glass-card" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h3 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>Create Trading Session</h3>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <label className="label">Session Name</label>
              <input className="input" value={newName} onChange={e => setNewName(e.target.value)} />
            </div>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <label className="label">Starting Balance (₹)</label>
              <input className="input" type="number" value={newBalance} onChange={e => setNewBalance(+e.target.value)} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
            <button className="btn btn--green" onClick={handleCreate}>Start Trading</button>
            <button className="btn btn--ghost" onClick={() => setShowCreate(false)}>Cancel</button>
          </div>
        </motion.div>
      )}

      {/* Session List (if no active) */}
      {!activeSession && (
        <div>
          <h3 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>Your Sessions</h3>
          {sessions.length === 0 ? (
            <div className="glass-card" style={{ padding: '3rem', textAlign: 'center' }}>
              <Trophy size={64} style={{ color: '#f59e0b', opacity: 0.3, marginBottom: '1rem' }} />
              <h3 style={{ color: 'var(--text-primary)' }}>No Sessions Yet</h3>
              <p style={{ color: 'var(--text-secondary)' }}>Create your first paper trading session to start practicing!</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
              {sessions.map(s => (
                <motion.div key={s.id} className="glass-card interactive" onClick={() => loadSession(s.id)}
                  whileHover={{ y: -4 }} style={{ cursor: 'pointer' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{s.name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{s.total_trades} trades</div>
                    </div>
                    <button onClick={e => { e.stopPropagation(); deleteSession(s.id); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: s.total_pnl >= 0 ? '#10b981' : '#ef4444', marginTop: '0.5rem' }}>
                    {s.total_pnl >= 0 ? '+' : ''}{formatCurrency(s.total_pnl)}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Balance: {formatCurrency(s.current_balance)}</div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Active Session */}
      {activeSession && (
        <>
          <button className="btn btn--ghost" onClick={() => usePaperTradingStore.setState({ activeSession: null })} style={{ alignSelf: 'flex-start' }}>
            ← Back to Sessions
          </button>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem' }}>
            {[
              { label: 'Balance', value: formatCurrency(activeSession.current_balance), icon: DollarSign, color: '#3b82f6' },
              { label: 'Total P&L', value: (activeSession.total_pnl >= 0 ? '+' : '') + formatCurrency(activeSession.total_pnl), icon: activeSession.total_pnl >= 0 ? TrendingUp : TrendingDown, color: activeSession.total_pnl >= 0 ? '#10b981' : '#ef4444' },
              { label: 'Total Trades', value: activeSession.total_trades, icon: BarChart3, color: '#f59e0b' },
              { label: 'Win Rate', value: winRate + '%', icon: Trophy, color: '#8b5cf6' },
            ].map((stat, i) => (
              <motion.div key={i} className="glass-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                style={{ textAlign: 'center' }}>
                <stat.icon size={24} color={stat.color} style={{ marginBottom: '0.5rem' }} />
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{stat.label}</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: stat.color }}>{stat.value}</div>
              </motion.div>
            ))}
          </div>

          {/* Trade Panel */}
          <div className="glass-card" style={{ borderTop: '3px solid #10b981' }}>
            <h3 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>Execute Trade</h3>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
              <div style={{ flex: 1, minWidth: '150px' }}>
                <label className="label">Stock</label>
                <select className="input" value={tradeForm.symbol} onChange={e => setTradeForm({ ...tradeForm, symbol: e.target.value })}
                  style={{ background: 'var(--bg-tertiary)', color: 'var(--text-primary)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  {STOCKS.map(s => (
                    <option key={s.symbol} value={s.symbol}>{s.name} — ₹{livePrice[s.symbol]?.toFixed(2) || '...'}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Action</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button className={`btn ${tradeForm.action === 'BUY' ? 'btn--green' : 'btn--ghost'}`} onClick={() => setTradeForm({ ...tradeForm, action: 'BUY' })}>BUY</button>
                  <button className={`btn ${tradeForm.action === 'SELL' ? 'btn--primary' : 'btn--ghost'}`} onClick={() => setTradeForm({ ...tradeForm, action: 'SELL' })}
                    style={tradeForm.action === 'SELL' ? { background: 'rgba(239,68,68,0.3)', boxShadow: 'none' } : {}}>SELL</button>
                </div>
              </div>
              <div style={{ minWidth: '100px' }}>
                <label className="label">Quantity</label>
                <input className="input" type="number" value={tradeForm.quantity} onChange={e => setTradeForm({ ...tradeForm, quantity: +e.target.value })} min={1} />
              </div>
              <div style={{ minWidth: '120px' }}>
                <label className="label">Est. Total</label>
                <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {formatCurrency((livePrice[tradeForm.symbol] || 0) * tradeForm.quantity)}
                </div>
              </div>
              <button className={`btn ${tradeForm.action === 'BUY' ? 'btn--green' : 'btn--primary'}`} onClick={handleTrade}
                style={tradeForm.action === 'SELL' ? { background: 'rgba(239,68,68,0.3)', boxShadow: 'none' } : {}}>
                {tradeForm.action} {tradeForm.quantity} Shares
              </button>
            </div>
            {error && <div style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.5rem' }}>{error}</div>}
          </div>

          {/* Holdings */}
          <div className="glass-card">
            <h3 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>Holdings ({activeSession.holdings?.length || 0})</h3>
            {(!activeSession.holdings || activeSession.holdings.length === 0) ? (
              <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>No holdings yet. Make your first trade above!</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {activeSession.holdings.map((h, i) => {
                  const currentPrice = livePrice[h.symbol] || h.avg_price;
                  const pnl = (currentPrice - h.avg_price) * h.quantity;
                  const pnlPct = ((currentPrice - h.avg_price) / h.avg_price) * 100;
                  return (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', borderRadius: '10px', background: 'rgba(255,255,255,0.02)' }}>
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{h.symbol.replace('.NS', '')}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{h.quantity} shares @ ₹{h.avg_price.toFixed(2)}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>₹{(currentPrice * h.quantity).toFixed(2)}</div>
                        <div style={{ fontSize: '0.8rem', color: pnl >= 0 ? '#10b981' : '#ef4444', display: 'flex', alignItems: 'center', gap: '0.25rem', justifyContent: 'flex-end' }}>
                          {pnl >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                          {formatCurrency(Math.abs(pnl))} ({formatPercent(pnlPct)})
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Trade History */}
          <div className="glass-card">
            <h3 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>Recent Trades</h3>
            {(!activeSession.trades || activeSession.trades.length === 0) ? (
              <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>No trades yet</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {activeSession.trades.slice(0, 15).map((t, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: '0.85rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <span className={`badge ${t.action === 'BUY' ? 'badge--green' : 'badge--red'}`} style={{ fontSize: '0.65rem' }}>{t.action}</span>
                      <span style={{ color: 'var(--text-primary)' }}>{t.symbol.replace('.NS', '')}</span>
                      <span style={{ color: 'var(--text-secondary)' }}>×{t.quantity}</span>
                    </div>
                    <span style={{ color: 'var(--text-primary)' }}>{formatCurrency(t.total)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
