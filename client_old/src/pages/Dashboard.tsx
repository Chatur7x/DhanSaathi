import { formatCurrency, formatPercent, formatCompact, isPositive } from '../utils/formatters';
import { ArrowUpRight, ArrowDownRight, Activity, TrendingUp, Wallet, Zap, Brain, BarChart3 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { useEffect, useState } from 'react';
import { fetchMarketChart, fetchLiveNews, getRealPortfolio, socket } from '../services/api';
import type { MarketData } from '../services/api';
import GlowCard from '../components/ui/GlowCard';
import AnimatedCounter from '../components/ui/AnimatedCounter';
import { LivePulse, NumberTicker } from '../components/ui/PremiumUI';
import './Dashboard.scss';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.05 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30, filter: 'blur(6px)' },
  show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { type: "spring" as const, stiffness: 300, damping: 25 } }
};

export default function Dashboard() {
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [liveNews, setLiveNews] = useState<any[]>([]);
  const [quotes, setQuotes] = useState<Omit<MarketData, 'chart'>[]>([]);
  const [aiNews, setAiNews] = useState<any[]>([]);
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

    // Listen to real-time AI News
    const handleAiNews = (newsItem: any) => {
      setAiNews(prev => [newsItem, ...prev].slice(0, 5));
    };

    socket.on('marketUpdate', handleMarketUpdate);
    socket.on('aiNewsUpdate', handleAiNews);

    return () => {
      socket.off('marketUpdate', handleMarketUpdate);
      socket.off('aiNewsUpdate', handleAiNews);
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
            <h2 className="dashboard__greeting">{marketData ? 'NIFTY 50' : 'Loading Market...'}</h2>
            <LivePulse isConnected={!!marketData} />
          </div>
          <div className="dashboard__hero-balance">
            <h1>
              <AnimatedCounter value={displayValue} prefix="₹" decimals={2} />
            </h1>
            <motion.div
              className={`dashboard__hero-change ${isPositive(dayChange) ? 'positive' : 'negative'}`}
              key={dayChange}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            >
              {isPositive(dayChange) ? <ArrowUpRight size={24} /> : <ArrowDownRight size={24} />}
              <span>{formatCurrency(Math.abs(dayChange))} ({formatPercent(dayChangePercent)}) Today</span>
            </motion.div>
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
          <GlowCard className="dashboard__bento-main" glowColor="#3b82f6">
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
          </GlowCard>

          <GlowCard className="dashboard__bento-side" glowColor={isPositive(dayChangePercent) ? '#10b981' : '#ef4444'}>
            <div className="dashboard__bento-header">
              <h3>Market Status</h3>
              <Activity size={20} color={isPositive(dayChangePercent) ? "#34c759" : "#ff3b30"} />
            </div>
            <div className="dashboard__market-pulse">
              <motion.div
                className="pulse-ring"
                animate={{
                  boxShadow: isPositive(dayChangePercent)
                    ? ['0 0 0 0 rgba(52,199,89,0.4)', '0 0 0 15px rgba(52,199,89,0)', '0 0 0 0 rgba(52,199,89,0)']
                    : ['0 0 0 0 rgba(255,59,48,0.4)', '0 0 0 15px rgba(255,59,48,0)', '0 0 0 0 rgba(255,59,48,0)'],
                }}
                transition={{ duration: 2, repeat: Infinity }}
                style={{ background: isPositive(dayChangePercent) ? '#34c759' : '#ff3b30' }}
              />
              <span style={{ fontSize: '1rem' }}>
                NIFTY is {isPositive(dayChangePercent) ? 'up' : 'down'} {Math.abs(dayChangePercent)}%
              </span>
            </div>
          </GlowCard>
        </section>

        {/* AI News Ticker */}
        {aiNews.length > 0 && (
          <motion.section
            variants={itemVariants}
            style={{
              background: 'linear-gradient(135deg, rgba(139,92,246,0.08) 0%, rgba(59,130,246,0.05) 100%)',
              border: '1px solid rgba(139,92,246,0.2)',
              borderRadius: '16px',
              padding: '1rem 1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              overflow: 'hidden',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
              <Brain size={18} color="#8b5cf6" />
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#8b5cf6', letterSpacing: '0.05em' }}>AI INSIGHT</span>
            </div>
            <AnimatePresence mode="wait">
              <motion.div
                key={aiNews[0]?.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: 0 }}
              >
                <span style={{
                  fontSize: '0.85rem',
                  color: 'var(--text-primary)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}>
                  {aiNews[0]?.headline}
                </span>
                <span className={`badge ${aiNews[0]?.sentiment === 'Bullish' ? 'badge--green' : 'badge--red'}`} style={{ flexShrink: 0 }}>
                  {aiNews[0]?.sentiment}
                </span>
              </motion.div>
            </AnimatePresence>
          </motion.section>
        )}

        {/* Two Column Layout */}
        <section className="dashboard__columns">
          {/* Market Watch (Live Quotes) */}
          <GlowCard glowColor="#0a84ff">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 className="dashboard__section-title" style={{ margin: 0 }}>Market Watch</h3>
              <LivePulse />
            </div>
            <div className="dashboard__list">
              {quotes.length > 0 ? quotes.map((stock, i) => (
                <motion.div
                  key={stock.symbol}
                  className="dashboard__list-item"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08, type: 'spring', stiffness: 300, damping: 25 }}
                  whileHover={{ x: 4, backgroundColor: 'rgba(255,255,255,0.03)' }}
                >
                  <div className="info">
                    <span className="symbol">{stock.symbol.replace('.NS', '')}</span>
                    <span className="name">{stock.name}</span>
                  </div>
                  <div className="price-info">
                    <span className="price">
                      <AnimatedCounter value={stock.price} prefix="₹" decimals={2} />
                    </span>
                    <motion.span
                      className={`change ${isPositive(stock.change) ? 'positive' : 'negative'}`}
                      key={stock.changePercent}
                      initial={{ scale: 1.2 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                    >
                      {isPositive(stock.change) ? '+' : ''}{stock.changePercent}%
                    </motion.span>
                  </div>
                </motion.div>
              )) : (
                <div className="skeleton" style={{ height: '200px' }}></div>
              )}
            </div>
          </GlowCard>

          {/* AI News (Live RSS) */}
          <GlowCard glowColor="#8b5cf6" style={{ background: 'linear-gradient(135deg, rgba(191,90,242,0.08) 0%, rgba(20,20,22,0.7) 100%)' }}>
            <div className="dashboard__bento-header" style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h3>Live News Feed</h3>
                <Brain size={18} color="#8b5cf6" />
              </div>
              <span className="badge badge--purple">Real Data</span>
            </div>
            <div className="dashboard__news">
              {liveNews.length > 0 ? liveNews.slice(0, 2).map((news, i) => (
                <motion.a
                  key={news.id}
                  href={news.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="dashboard__news-item"
                  style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1, type: 'spring', stiffness: 300, damping: 25 }}
                  whileHover={{ x: 4, transition: { type: 'spring', stiffness: 400, damping: 20 } }}
                >
                  <div className="header">
                    <span className="source">{news.source}</span>
                    <span className="time">{news.time}</span>
                  </div>
                  <h4 style={{ color: 'var(--text-primary)' }}>{news.headline}</h4>
                  <p>{news.summary}</p>
                </motion.a>
              )) : (
                <div className="skeleton" style={{ height: '200px' }}></div>
              )}
            </div>
          </GlowCard>
        </section>
      </div>
    </motion.div>
  );
}
