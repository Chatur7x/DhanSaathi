import { useState, useEffect } from 'react';
import { useMarketStore } from '../../store/marketStore';
import { getQuotes, Quote } from '../../services/marketApi';
import { formatCurrency, isPositive } from '../../utils/formatters';
import { motion } from 'framer-motion';
import { Plus, X, GripVertical } from 'lucide-react';

export default function Watchlist() {
  const { watchlist, setWatchlist, updateWatchlistPrices } = useMarketStore() as any;
  const [inputSymbol, setInputSymbol] = useState('');
  const [quotes, setQuotes] = useState<Quote[]>([]);

  const fetchQuotes = async () => {
    if (watchlist.length === 0) return;
    const data = await getQuotes(watchlist);
    setQuotes(data);
    if (updateWatchlistPrices) updateWatchlistPrices(data);
  };

  useEffect(() => {
    fetchQuotes();
    const interval = setInterval(fetchQuotes, 5000);
    return () => clearInterval(interval);
  }, [watchlist]);

  const addSymbol = () => {
    const symbol = inputSymbol.trim().toUpperCase();
    if (symbol && !watchlist.includes(symbol)) {
      setWatchlist([...watchlist, symbol]);
      setInputSymbol('');
    }
  };

  const removeSymbol = (symbol: string) => {
    setWatchlist(watchlist.filter((s: string) => s !== symbol));
  };

  return (
    <div className="glass-card" style={{ padding: '1.5rem', height: '100%' }}>
      <h3 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>Watchlist</h3>
      
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        <input
          type="text"
          value={inputSymbol}
          onChange={e => setInputSymbol(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addSymbol()}
          placeholder="Add symbol (e.g., RELIANCE.NS)"
          style={{
            flex: 1,
            padding: '0.5rem 0.75rem',
            background: 'var(--bg-tertiary)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '6px',
            color: 'var(--text-primary)',
            fontSize: '0.875rem'
          }}
        />
        <button
          onClick={addSymbol}
          className="btn btn--primary"
          style={{ padding: '0.5rem', minWidth: '40px' }}
        >
          <Plus size={16} />
        </button>
      </div>

      <div style={{ overflowY: 'auto', flex: 1 }}>
        {watchlist.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Add symbols to your watchlist
          </div>
        ) : (
          quotes.map((quote, i) => (
            <motion.div
              key={quote.symbol}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.75rem 0',
                borderBottom: i !== quotes.length - 1 ? '1px solid var(--border-subtle)' : 'none',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <GripVertical size={14} color="var(--text-muted)" />
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.875rem' }}>
                    {quote.symbol.replace('.NS', '').replace('.BO', '')}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    {quote.name}
                  </div>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.875rem' }}>
                  ₹{quote.price?.toFixed(2) || 'N/A'}
                </div>
                <div style={{
                  color: isPositive(quote.change) ? 'var(--accent-green)' : 'var(--accent-red)',
                  fontSize: '0.75rem'
                }}>
                  {quote.changePercent > 0 ? '+' : ''}{quote.changePercent?.toFixed(2)}%
                </div>
              </div>
              <button
                onClick={() => removeSymbol(quote.symbol)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '0.25rem'
                }}
              >
                <X size={14} />
              </button>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
