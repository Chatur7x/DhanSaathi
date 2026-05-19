import { useState, useEffect } from 'react';
import { useMarketStore } from '../../store/marketStore';
import { getTopMovers, Quote } from '../../services/marketApi';
import { formatCurrency, isPositive } from '../../utils/formatters';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function TopMovers() {
  const store = useMarketStore() as any;
  const allQuotes = store.allQuotes || [];
  const [type, setType] = useState<'gainers' | 'losers' | 'volume'>('gainers');
  const [movers, setMovers] = useState<Quote[]>([]);

  useEffect(() => {
    const data = getTopMovers(allQuotes, type);
    setMovers(data);
  }, [allQuotes, type]);

  return (
    <div className="glass-card" style={{ padding: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 style={{ color: 'var(--text-primary)' }}>
          {type === 'gainers' ? 'Top Gainers' : type === 'losers' ? 'Top Losers' : 'High Volume'}
        </h3>
        <div style={{ display: 'flex', gap: '0.25rem' }}>
          {['gainers', 'losers', 'volume'].map((t: string) => (
            <button
              key={t}
              onClick={() => setType(t as any)}
              style={{
                padding: '0.25rem 0.75rem',
                background: type === t ? 'var(--accent-blue)' : 'var(--bg-tertiary)',
                border: 'none',
                borderRadius: '4px',
                color: type === t ? 'white' : 'var(--text-secondary)',
                cursor: 'pointer',
                fontSize: '0.75rem',
                textTransform: 'capitalize'
              }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
        {movers.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Loading movers...
          </div>
        ) : (
          movers.map((quote, i) => (
            <motion.div
              key={quote.symbol}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.75rem 0',
                borderBottom: i !== movers.length - 1 ? '1px solid var(--border-subtle)' : 'none'
              }}
            >
              <div>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.875rem' }}>
                  {quote.symbol.replace('.NS', '').replace('.BO', '')}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  {quote.name}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.875rem' }}>
                  ₹{quote.price?.toFixed(2)}
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  color: isPositive(quote.change) ? 'var(--accent-green)' : 'var(--accent-red)',
                  fontSize: '0.75rem'
                }}>
                  {isPositive(quote.change) ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                  {quote.changePercent > 0 ? '+' : ''}{quote.changePercent?.toFixed(2)}%
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
