import { useEffect, useState } from 'react';
import { fetchQuotes } from '@/services/api';
import type { MarketData } from '@/services/api';
import { formatCurrency, isPositive } from '@/utils/formatters';
import { motion } from 'framer-motion';

const INDICES = ['^NSEI', '^BSESN', '^NSEBANK', '^CNXIT'];
const TOP_STOCKS = ['RELIANCE.NS', 'TCS.NS', 'HDFCBANK.NS', 'INFY.NS', 'ITC.NS', 'SBIN.NS', 'BHARTIARTL.NS'];

export default function Markets() {
  const [indices, setIndices] = useState<Omit<MarketData, 'chart'>[]>([]);
  const [stocks, setStocks] = useState<Omit<MarketData, 'chart'>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetchQuotes(INDICES),
      fetchQuotes(TOP_STOCKS)
    ]).then(([indicesData, stocksData]) => {
      setIndices(indicesData);
      setStocks(stocksData);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <div style={{ padding: '2rem', color: 'var(--text-secondary)' }}>Loading live market data...</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', paddingBottom: '4rem' }}>
      <section>
        <h2 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>Indian Indices</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          {indices.map(idx => (
            <motion.div key={idx.symbol} className="glass-card" whileHover={{ y: -4 }}>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                {idx.symbol === '^NSEI' ? 'NIFTY 50' : idx.symbol === '^BSESN' ? 'SENSEX' : idx.symbol === '^NSEBANK' ? 'NIFTY BANK' : 'NIFTY IT'}
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{formatCurrency(idx.price)}</div>
              <div style={{ color: isPositive(idx.change) ? 'var(--accent-green)' : 'var(--accent-red)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                {isPositive(idx.change) ? '+' : ''}{idx.changePercent}%
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <section>
        <h2 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>Market Movers</h2>
        <div className="glass-card" style={{ padding: '0' }}>
          {stocks.map((stock, i) => (
            <div key={stock.symbol} style={{ 
              display: 'flex', justifyContent: 'space-between', padding: '1rem 1.5rem',
              borderBottom: i !== stocks.length - 1 ? '1px solid var(--border-subtle)' : 'none'
            }}>
              <div>
                <div style={{ fontWeight: 600 }}>{stock.symbol.replace('.NS', '')}</div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{stock.name}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 600 }}>₹{stock.price.toFixed(2)}</div>
                <div style={{ color: isPositive(stock.change) ? 'var(--accent-green)' : 'var(--accent-red)', fontSize: '0.875rem' }}>
                  {isPositive(stock.change) ? '+' : ''}{stock.changePercent}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
