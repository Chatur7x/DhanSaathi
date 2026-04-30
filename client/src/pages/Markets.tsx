import { useEffect, useState } from 'react';
import { socket } from '../services/api';
import type { MarketData } from '../services/api';
import { formatCurrency, isPositive } from '../utils/formatters';
import { motion } from 'framer-motion';

const INDICES = ['^NSEI', '^BSESN', '^NSEBANK', '^INDIAVIX'];
const SECTORS = ['^CNXAUTO', '^CNXFMCG', '^CNXMETAL', '^CNXPHARMA', '^CNXIT'];
const TOP_STOCKS = ['RELIANCE.NS', 'TCS.NS', 'HDFCBANK.NS', 'INFY.NS', 'ITC.NS', 'SBIN.NS'];
const ETFS = ['NIFTYBEES.NS', 'GOLDBEES.NS', 'BANKBEES.NS', 'LIQUIDBEES.NS'];
const MUTUAL_FUNDS = ['0P00005WLZ.BO', '0P00005V1W.BO'];

export default function Markets() {
  const [indices, setIndices] = useState<Omit<MarketData, 'chart'>[]>([]);
  const [sectors, setSectors] = useState<Omit<MarketData, 'chart'>[]>([]);
  const [stocks, setStocks] = useState<Omit<MarketData, 'chart'>[]>([]);
  const [etfs, setEtfs] = useState<Omit<MarketData, 'chart'>[]>([]);
  const [mfs, setMfs] = useState<Omit<MarketData, 'chart'>[]>([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));
    
    socket.on('marketUpdate', (data: Omit<MarketData, 'chart'>[]) => {
      setIndices(data.filter(item => INDICES.includes(item.symbol)));
      setSectors(data.filter(item => SECTORS.includes(item.symbol)));
      setStocks(data.filter(item => TOP_STOCKS.includes(item.symbol)));
      setEtfs(data.filter(item => ETFS.includes(item.symbol)));
      setMfs(data.filter(item => MUTUAL_FUNDS.includes(item.symbol)));
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('marketUpdate');
    };
  }, []);

  const renderList = (items: Omit<MarketData, 'chart'>[], title: string) => (
    <section style={{ marginBottom: '2rem' }}>
      <h2 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>{title}</h2>
      <div className="glass-card" style={{ padding: '0' }}>
        {items.length === 0 ? <div style={{ padding: '2rem', textAlign: 'center' }}>Loading Live Data...</div> : items.map((item, i) => (
          <div key={item.symbol} style={{ 
            display: 'flex', justifyContent: 'space-between', padding: '1rem 1.5rem',
            borderBottom: i !== items.length - 1 ? '1px solid var(--border-subtle)' : 'none'
          }}>
            <div>
              <div style={{ fontWeight: 600 }}>{item.symbol.replace('.NS', '').replace('.BO', '')}</div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{item.name}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: 600 }}>₹{item.price.toFixed(2)}</div>
              <div style={{ color: isPositive(item.change) ? 'var(--accent-green)' : 'var(--accent-red)', fontSize: '0.875rem' }}>
                {isPositive(item.change) ? '+' : ''}{item.changePercent}%
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', paddingBottom: '4rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: '2rem', color: 'var(--text-primary)' }}>Live Market Terminal</h1>
        {connected ? (
          <div className="badge badge--green" style={{ animation: 'pulse 2s infinite' }}>● Socket Connected</div>
        ) : (
          <div className="badge badge--red">○ Disconnected</div>
        )}
      </div>

      <section>
        <h2 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>Major Indices & Volatility</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          {indices.map(idx => (
            <motion.div key={idx.symbol} className="glass-card" whileHover={{ y: -4 }}>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                {idx.symbol.replace('^', '')}
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{formatCurrency(idx.price)}</div>
              <div style={{ color: isPositive(idx.change) ? 'var(--accent-green)' : 'var(--accent-red)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                {isPositive(idx.change) ? '+' : ''}{idx.changePercent}%
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {renderList(etfs, "Exchange Traded Funds (ETFs)")}
      {renderList(mfs, "Mutual Funds (NAV)")}
      
      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ color: 'var(--text-primary)' }}>Equities (F&O Underlying)</h2>
        </div>
        <div className="glass-card" style={{ padding: '1rem' }}>
          <div style={{ display: 'grid', gap: '0.5rem' }}>
            {stocks.map((stock) => (
              <div key={stock.symbol} style={{ 
                display: 'flex', justifyContent: 'space-between', padding: '0.75rem',
                background: 'rgba(255,255,255,0.02)', borderRadius: '8px'
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
        </div>
      </section>
      
      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>IPO Gray Market (Simulated)</h2>
        <div className="glass-card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
          Real-time IPO allotment and GMP APIs require paid NSE broker keys. <br/>
          (Future integration point via backend).
        </div>
      </section>

    </div>
  );
}
