import { formatCurrency, formatPercent, formatCompact, isPositive } from '../utils/formatters';
import { ArrowUpRight, ArrowDownRight, Activity, TrendingUp, Wallet, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { useEffect, useState } from 'react';
import { fetchMarketChart, fetchLiveNews, getRealPortfolio, socket } from '../services/api';
import type { MarketData } from '../services/api';
import './Dashboard.scss';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.05 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 25 } }
};

export default function Dashboard() {
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [liveNews, setLiveNews] = useState<any[]>([]);
  const [quotes, setQuotes] = useState<Omit<MarketData, 'chart'>[]>([]);
  const portfolio = getRealPortfolio();

  useEffect(() => {
    // Fetch initial chart history for NIFTY 50
    fetchMarketChart('^NSEI').then(data => data && setMarketData(data));
    fetchLiveNews().then(news => setLiveNews(news));

    // Listen to live WebSocket updates
    const handleMarketUpdate = (data: Omit<MarketData, 'chart'>[]) => {
      // Update the 4 specific quotes
      setQuotes(data.filter(item => ['RELIANCE.NS', 'TCS.NS', 'HDFCBANK.NS', 'INFY.NS'].includes(item.symbol)));
      
      // Update Nifty 50 live price if it exists
      const nifty = data.find(item => item.symbol === '^NSEI');
      if (nifty) {
        setMarketData(prev => prev ? {
          ...prev,
          price: nifty.price,
          change: nifty.change,
          changePercent: nifty.changePercent
        } : null);
      }
    };

    socket.on('marketUpdate', handleMarketUpdate);

    return () => {
      socket.off('marketUpdate', handleMarketUpdate);
    };
  }, []);

  const displayValue = marketData ? marketData.price : 0;
  const dayChange = marketData ? marketData.change : 0;
  const dayChangePercent = marketData ? marketData.changePercent : 0;
  const chartData = marketData?.chart || [];

  return (
    <motion.div className="dashboard" variants={containerVariants} initial="hidden" animate="show">
      {/* Hero Section */}
      <section className="dashboard__hero">
        <motion.div className="dashboard__hero-text" variants={itemVariants}>
          <h2 className="dashboard__greeting">{marketData ? 'NIFTY 50 (Live)' : 'Loading Market...'}</h2>
          <div className="dashboard__hero-balance">
            <h1>{marketData ? formatCurrency(displayValue) : '₹0'}</h1>
            <div className={`dashboard__hero-change ${isPositive(dayChange) ? 'positive' : 'negative'}`}>
              {isPositive(dayChange) ? <ArrowUpRight size={24} /> : <ArrowDownRight size={24} />}
              <span>{formatCurrency(Math.abs(dayChange))} ({formatPercent(dayChangePercent)}) Today</span>
            </div>
          </div>
        </motion.div>

        <div className="dashboard__hero-chart">
          {chartData.length > 0 && (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="heroGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0a84ff" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#0a84ff" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="value" stroke="#0a84ff" strokeWidth={3} fill="url(#heroGradient)" isAnimationActive={true} animationDuration={1500} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </section>

      <div className="dashboard__content">
        {/* Bento Grid Stats */}
        <section className="dashboard__bento">
          <motion.div className="glass-card dashboard__bento-main" variants={itemVariants}>
            <div className="dashboard__bento-header">
              <h3>My Portfolio</h3>
              <span className="badge badge--blue">Real Data</span>
            </div>
            <div className="dashboard__bento-stats">
              <div>
                <div className="label">Invested</div>
                <div className="value">{formatCompact(portfolio.invested)}</div>
              </div>
              <div>
                <div className="label">Returns</div>
                <div className="value highlight">{formatCompact(portfolio.returns)}</div>
              </div>
              <div>
                <div className="label">XIRR</div>
                <div className="value" style={{color: '#34c759'}}>{formatPercent(portfolio.xirr)}</div>
              </div>
            </div>
          </motion.div>

          <motion.div className="glass-card interactive dashboard__bento-side" variants={itemVariants}>
            <div className="dashboard__bento-header">
              <h3>Market Status</h3>
              <Activity size={20} color={isPositive(dayChangePercent) ? "#34c759" : "#ff3b30"} />
            </div>
            <div className="dashboard__market-pulse">
              <div className="pulse-ring" style={{ background: isPositive(dayChangePercent) ? '#34c759' : '#ff3b30', boxShadow: 'none' }}></div>
              <span style={{ fontSize: '1rem' }}>
                NIFTY is {isPositive(dayChangePercent) ? 'up' : 'down'} {Math.abs(dayChangePercent)}%
              </span>
            </div>
          </motion.div>
        </section>

        {/* Two Column Layout */}
        <section className="dashboard__columns">
          {/* Market Watch (Live Quotes) */}
          <motion.div className="glass-card" variants={itemVariants}>
            <h3 className="dashboard__section-title">Market Watch (Live)</h3>
            <div className="dashboard__list">
              {quotes.length > 0 ? quotes.map((stock, i) => (
                <div key={i} className="dashboard__list-item">
                  <div className="info">
                    <span className="symbol">{stock.symbol.replace('.NS', '')}</span>
                    <span className="name">{stock.name}</span>
                  </div>
                  <div className="price-info">
                    <span className="price">₹{stock.price.toFixed(2)}</span>
                    <span className={`change ${isPositive(stock.change) ? 'positive' : 'negative'}`}>
                      {isPositive(stock.change) ? '+' : ''}{stock.changePercent}%
                    </span>
                  </div>
                </div>
              )) : (
                <div className="skeleton" style={{ height: '200px' }}></div>
              )}
            </div>
          </motion.div>

          {/* AI News (Live RSS) */}
          <motion.div className="glass-card" variants={itemVariants} style={{ background: 'linear-gradient(135deg, rgba(191,90,242,0.1) 0%, rgba(20,20,22,0.7) 100%)' }}>
            <div className="dashboard__bento-header" style={{ marginBottom: '1.5rem' }}>
              <h3>Live News Feed</h3>
              <span className="badge badge--purple">Real Data</span>
            </div>
            <div className="dashboard__news">
              {liveNews.length > 0 ? liveNews.slice(0, 2).map((news) => (
                <a key={news.id} href={news.link} target="_blank" rel="noopener noreferrer" className="dashboard__news-item" style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div className="header">
                    <span className="source">{news.source}</span>
                    <span className="time">{news.time}</span>
                  </div>
                  <h4 style={{ color: 'var(--text-primary)' }}>{news.headline}</h4>
                  <p>{news.summary}</p>
                </a>
              )) : (
                <div className="skeleton" style={{ height: '200px' }}></div>
              )}
            </div>
          </motion.div>
        </section>
      </div>
    </motion.div>
  );
}
