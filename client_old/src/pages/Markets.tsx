import { useEffect, useState } from 'react';
import TradingChart from '../components/charts/TradingChart';
import Watchlist from '../components/markets/Watchlist';
import TopMovers from '../components/markets/TopMovers';
import MarketDepth from '../components/markets/MarketDepth';
import { getQuotes } from '../services/marketApi';
import { useMarketStore } from '../store/marketStore';
import { socket } from '../services/api';
import { formatCurrency, isPositive } from '../utils/formatters';
import { motion } from 'framer-motion';
import { Wifi, WifiOff, GitCompare, BarChart3, LineChart } from 'lucide-react';

export default function Markets() {
  const { indices, sectors, stocks, etfs, mutualFunds, isConnected, setMarketData, setConnected } = useMarketStore();
  const [activeTab, setActiveTab] = useState<'overview' | 'watchlist' | 'depth' | 'heatmap'>('overview');
  const [selectedSymbol, setSelectedSymbol] = useState('^NSEI');

  useEffect(() => {
    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));
    
    socket.on('marketUpdate', (data) => {
      setMarketData(data);
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('marketUpdate');
    };
  }, []);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'watchlist', label: 'Watchlist', icon: LineChart },
    { id: 'depth', label: 'Depth', icon: GitCompare },
    { id: 'heatmap', label: 'Heatmap', icon: BarChart3 },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', paddingBottom: '4rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: '2rem', color: 'var(--text-primary)' }}>Live Market Terminal</h1>
        {isConnected ? (
          <div className="badge badge--green" style={{ animation: 'pulse 2s infinite' }}>
            <Wifi size={14} /> Live
          </div>
        ) : (
          <div className="badge badge--red">
            <WifiOff size={14} /> Disconnected
          </div>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-subtle)' }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            style={{
              padding: '0.75rem 1rem',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === tab.id ? '2px solid var(--accent-blue)' : '2px solid transparent',
              color: activeTab === tab.id ? 'var(--text-primary)' : 'var(--text-secondary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '1.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Indices Cards */}
            <div>
              <h2 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>Major Indices</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                {indices.map((idx, i) => (
                  <motion.div
                    key={idx.symbol}
                    className="glass-card"
                    whileHover={{ y: -4 }}
                    onClick={() => { setSelectedSymbol(idx.symbol); setActiveTab('watchlist'); }}
                    style={{ cursor: 'pointer' }}
                  >
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                      {idx.symbol.replace('^', '')}
                    </div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>₹{idx.price?.toFixed(2) || 'N/A'}</div>
                    <div style={{ color: isPositive(idx.change) ? 'var(--accent-green)' : 'var(--accent-red)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                      {isPositive(idx.change) ? '+' : ''}{idx.changePercent || 0}%
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* TradingView Chart */}
            <TradingChart symbol={selectedSymbol} height={400} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <TopMovers />
            <MarketDepth />
          </div>
        </div>
      )}

      {/* Watchlist Tab */}
      {activeTab === 'watchlist' && (
        <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '1.5rem' }}>
          <Watchlist />
          <TradingChart symbol={selectedSymbol} height={500} />
        </div>
      )}

      {/* Market Depth Tab */}
      {activeTab === 'depth' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '1.5rem' }}>
          <TradingChart symbol={selectedSymbol} height={500} />
          <MarketDepth />
        </div>
      )}

      {/* Heatmap Tab */}
      {activeTab === 'heatmap' && (
        <div>
          <h2 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>Sector Heatmap</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '0.75rem' }}>
            {sectors.map((sector, i) => {
              const color = sector.changePercent > 0 ? 'rgba(16, 185, 129, 0.8)' : 'rgba(239, 68, 68, 0.8)';
              return (
                <motion.div
                  key={sector.symbol}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  style={{
                    background: color,
                    padding: '1rem',
                    borderRadius: '12px',
                    textAlign: 'center',
                    color: 'white',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                  onClick={() => { setSelectedSymbol(sector.symbol); setActiveTab('watchlist'); }}
                >
                  <div style={{ fontSize: '0.75rem', opacity: 0.9, marginBottom: '0.25rem' }}>
                    {sector.symbol.replace('^CNX', '')}
                  </div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>
                    {sector.changePercent > 0 ? '+' : ''}{sector.changePercent}%
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Sector Performance List */}
      <section>
        <h2 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>Sector Performance</h2>
        <div className="glass-card" style={{ padding: '0' }}>
          {sectors.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading sector data...</div>
          ) : (
            sectors.map((sector, i) => (
              <div key={sector.symbol} style={{
                display: 'flex', justifyContent: 'space-between', padding: '1rem 1.5rem',
                borderBottom: i !== sectors.length - 1 ? '1px solid var(--border-subtle)' : 'none'
              }}>
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{sector.symbol.replace('^CNX', '')}</div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{sector.name}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>₹{sector.price?.toFixed(2) || 'N/A'}</div>
                  <div style={{ color: isPositive(sector.change) ? 'var(--accent-green)' : 'var(--accent-red)', fontSize: '0.875rem' }}>
                    {isPositive(sector.change) ? '+' : ''}{sector.changePercent || 0}%
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Stocks List */}
      <section>
        <h2 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>Equities (F&O Underlying)</h2>
        <div className="glass-card" style={{ padding: '0' }}>
          {stocks.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading stock data...</div>
          ) : (
            stocks.map((stock, i) => (
              <div key={stock.symbol} style={{
                display: 'flex', justifyContent: 'space-between', padding: '1rem 1.5rem',
                borderBottom: i !== stocks.length - 1 ? '1px solid var(--border-subtle)' : 'none'
              }}>
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{stock.symbol.replace('.NS', '')}</div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{stock.name}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>₹{stock.price?.toFixed(2) || 'N/A'}</div>
                  <div style={{ color: isPositive(stock.change) ? 'var(--accent-green)' : 'var(--accent-red)', fontSize: '0.875rem' }}>
                    {isPositive(stock.change) ? '+' : ''}{stock.changePercent || 0}%
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
