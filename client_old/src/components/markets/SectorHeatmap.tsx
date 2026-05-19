import { useState } from 'react';
import { useMarketStore } from '../../store/marketStore';
import { motion } from 'framer-motion';
import { Info } from 'lucide-react';

export default function SectorHeatmap() {
  const { sectors } = useMarketStore();
  const [view, setView] = useState<'grid' | 'list'>('grid');

  const getColor = (change: number) => {
    if (change > 2) return '#10b981';
    if (change > 0) return '#34d399';
    if (change > -2) return '#fbbf24';
    return '#ef4444';
  };

  return (
    <div className="glass-card" style={{ padding: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 style={{ color: 'var(--text-primary)' }}>Sector Heat Map</h3>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {['grid', 'list'].map(v => (
            <button
              key={v}
              onClick={() => setView(v as any)}
              style={{
                padding: '0.25rem 0.75rem',
                background: view === v ? 'var(--accent-blue)' : 'var(--bg-tertiary)',
                border: 'none',
                borderRadius: '4px',
                color: 'white',
                cursor: 'pointer',
                fontSize: '0.75rem'
              }}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {sectors.length === 0 ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
          Loading sector data...
        </div>
      ) : view === 'grid' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '0.75rem' }}>
          {sectors.map((sector, i) => (
            <motion.div
              key={sector.symbol}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              style={{
                background: getColor(sector.changePercent),
                padding: '1rem',
                borderRadius: '12px',
                textAlign: 'center',
                color: 'white',
                fontWeight: 600
              }}
            >
              <div style={{ fontSize: '0.75rem', opacity: 0.9, marginBottom: '0.25rem' }}>
                {sector.symbol.replace('^CNX', '')}
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>
                {sector.changePercent > 0 ? '+' : ''}{sector.changePercent}%
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div>
          {sectors.map((sector, i) => (
            <div key={sector.symbol} style={{
              display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0',
              borderBottom: i !== sectors.length - 1 ? '1px solid var(--border-subtle)' : 'none'
            }}>
              <span style={{ color: 'var(--text-primary)' }}>{sector.name}</span>
              <span style={{ color: sector.changePercent >= 0 ? 'var(--accent-green)' : 'var(--accent-red)', fontWeight: 600 }}>
                {sector.changePercent > 0 ? '+' : ''}{sector.changePercent}%
              </span>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
        <Info size={12} />
        <span>Color intensity shows sector performance. Data updates every 10 seconds.</span>
      </div>
    </div>
  );
}
