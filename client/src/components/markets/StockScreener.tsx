import { useState } from 'react';
import { useMarketStore } from '../../store/marketStore';
import { formatCurrency, isPositive } from '../../utils/formatters';
import { motion } from 'framer-motion';
import { Search, Filter } from 'lucide-react';

export default function StockScreener() {
  const { stocks } = useMarketStore();
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'symbol' | 'price' | 'change'>('change');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const filtered = stocks
    .filter(s => s.symbol.toLowerCase().includes(search.toLowerCase()) || s.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      const dir = sortDir === 'asc' ? 1 : -1;
      if (sortBy === 'symbol') return dir * a.symbol.localeCompare(b.symbol);
      if (sortBy === 'price') return dir * (a.price - b.price);
      return dir * (a.changePercent - b.changePercent);
    });

  return (
    <div className="glass-card" style={{ padding: '1.5rem' }}>
      <h3 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>Stock Screener</h3>
      
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search stocks..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', padding: '0.5rem 0.75rem 0.5rem 2.5rem', background: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)', borderRadius: '8px', color: 'var(--text-primary)' }}
          />
        </div>
        <button
          onClick={() => setSortDir(sortDir === 'asc' ? 'desc' : 'asc')}
          style={{ padding: '0.5rem 1rem', background: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)', borderRadius: '8px', color: 'var(--text-primary)', cursor: 'pointer' }}
        >
          <Filter size={16} /> {sortDir === 'desc' ? '↓' : '↑'}
        </button>
      </div>

      {filtered.length === 0 ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
          No stocks found.
        </div>
      ) : (
        <div>
          {filtered.map((stock, i) => (
            <motion.div
              key={stock.symbol}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              style={{
                display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0',
                borderBottom: i !== filtered.length - 1 ? '1px solid var(--border-subtle)' : 'none'
              }}
            >
              <div>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{stock.symbol.replace('.NS', '')}</div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{stock.name}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{formatCurrency(stock.price)}</div>
                <div style={{ color: isPositive(stock.change) ? 'var(--accent-green)' : 'var(--accent-red)', fontSize: '0.875rem' }}>
                  {stock.changePercent > 0 ? '+' : ''}{stock.changePercent}%
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
