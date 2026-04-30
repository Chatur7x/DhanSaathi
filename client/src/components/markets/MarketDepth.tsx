import { useState } from 'react';
import { getMarketDepth } from '../../services/marketApi';
import { formatCurrency } from '../../utils/formatters';
import { motion } from 'framer-motion';
import { GitCompare } from 'lucide-react';

export default function MarketDepth() {
  const [symbol, setSymbol] = useState('RELIANCE.NS');
  const [lastPrice, setLastPrice] = useState(2450);
  const depth = getMarketDepth(symbol, lastPrice);

  return (
    <div className="glass-card" style={{ padding: '1.5rem', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 style={{ color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <GitCompare size={16} />
          Market Depth
        </h3>
        <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          {symbol.replace('.NS', '')}
        </div>
      </div>

      <div style={{
        textAlign: 'center',
        padding: '1rem',
        background: 'rgba(255, 255, 255, 0.02)',
        borderRadius: '8px',
        marginBottom: '1rem'
      }}>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Last Price</div>
        <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>
          {formatCurrency(lastPrice)}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            padding: '0.5rem',
            color: 'var(--accent-green)',
            fontSize: '0.75rem',
            fontWeight: 600,
            borderBottom: '1px solid var(--border-subtle)'
          }}>
            <span>Bids</span>
            <span>Qty</span>
          </div>
          {depth.bids.map((bid: any, i: number) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '0.5rem',
                fontSize: '0.875rem',
                color: 'var(--text-primary)',
                background: i % 2 === 0 ? 'rgba(16, 185, 129, 0.05)' : 'transparent'
              }}
            >
              <span>{formatCurrency(bid.price)}</span>
              <span style={{ color: 'var(--text-secondary)' }}>{bid.quantity}</span>
            </motion.div>
          ))}
        </div>

        <div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            padding: '0.5rem',
            color: 'var(--accent-red)',
            fontSize: '0.75rem',
            fontWeight: 600,
            borderBottom: '1px solid var(--border-subtle)'
          }}>
            <span>Asks</span>
            <span>Qty</span>
          </div>
          {depth.asks.map((ask: any, i: number) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '0.5rem',
                fontSize: '0.875rem',
                color: 'var(--text-primary)',
                background: i % 2 === 0 ? 'rgba(239, 68, 68, 0.05)' : 'transparent'
              }}
            >
              <span>{formatCurrency(ask.price)}</span>
              <span style={{ color: 'var(--text-secondary)' }}>{ask.quantity}</span>
            </motion.div>
          ))}
        </div>
      </div>

      <div style={{
        marginTop: '1rem',
        padding: '0.75rem',
        background: 'rgba(255, 255, 255, 0.02)',
        borderRadius: '8px',
        fontSize: '0.75rem',
        color: 'var(--text-secondary)',
        display: 'flex',
        justifyContent: 'space-between'
      }}>
        <span>Spread</span>
        <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
          {formatCurrency(depth.asks[0]?.price - depth.bids[0]?.price)}
        </span>
      </div>
    </div>
  );
}
