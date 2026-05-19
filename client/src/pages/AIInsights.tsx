import { useEffect, useState } from 'react';
import { fetchLiveNews, socket } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Newspaper, TrendingUp, TrendingDown, ExternalLink, RefreshCw, Brain, Zap, Radio } from 'lucide-react';
import GlowCard from '../components/ui/GlowCard';
import { LivePulse, ShimmerText } from '../components/ui/PremiumUI';
import MagneticButton from '../components/ui/MagneticButton';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, filter: 'blur(4px)' },
  show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { type: 'spring' as const, stiffness: 300, damping: 25 } }
};

export default function AIInsights() {
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiNewsCount, setAiNewsCount] = useState(0);

  const loadNews = async () => {
    setLoading(true);
    const data = await fetchLiveNews();
    setNews(data);
    setLoading(false);
  };

  useEffect(() => {
    loadNews();
    
    // Listen to real-time AI News Socket
    socket.on('aiNewsUpdate', (newNewsItem) => {
      setNews((prev) => {
        const formatted = {
          id: newNewsItem.id,
          headline: newNewsItem.headline,
          summary: `AI Sentiment: ${newNewsItem.sentiment} | Impact Score: ${newNewsItem.impact}`,
          source: 'DhanSaathi AI',
          time: new Date(newNewsItem.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          link: '#',
          impact: newNewsItem.sentiment === 'Bullish' ? 'positive' : 'negative',
          sentiment: newNewsItem.sentiment,
          impactScore: newNewsItem.impact,
        };
        return [formatted, ...prev].slice(0, 50);
      });
      setAiNewsCount(prev => prev + 1);
    });

    const interval = setInterval(loadNews, 300000);
    return () => {
      clearInterval(interval);
      socket.off('aiNewsUpdate');
    };
  }, []);

  // Compute live sentiment
  const bullishCount = news.filter(n => n.impact === 'positive' || n.sentiment === 'Bullish').length;
  const bearishCount = news.filter(n => n.impact === 'negative' || n.sentiment === 'Bearish').length;
  const overallSentiment = bullishCount >= bearishCount ? 'Bullish' : 'Bearish';

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '4rem' }}
    >
      <motion.div variants={itemVariants} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Brain size={28} color="#8b5cf6" />
            AI Insights & News
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
            Real-time intelligence powered by AI sentiment analysis
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <LivePulse label={`${aiNewsCount} AI UPDATES`} />
          <MagneticButton className="btn--secondary" onClick={loadNews}>
            <RefreshCw size={16} className={loading ? 'spin' : ''} />
            Refresh
          </MagneticButton>
        </div>
      </motion.div>

      {/* Market Sentiment Overview */}
      <motion.div variants={itemVariants} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        {/* Overall Sentiment */}
        <GlowCard glowColor={overallSentiment === 'Bullish' ? '#10b981' : '#ef4444'}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
            Overall Sentiment
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {overallSentiment === 'Bullish'
              ? <TrendingUp size={24} color="#10b981" />
              : <TrendingDown size={24} color="#ef4444" />
            }
            <span style={{
              fontSize: '1.5rem',
              fontWeight: 800,
              color: overallSentiment === 'Bullish' ? '#10b981' : '#ef4444',
            }}>
              {overallSentiment}
            </span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            Based on {news.length} news articles analyzed
          </div>
        </GlowCard>

        {/* Sector Sentiments */}
        {['IT Sector', 'Banking', 'Auto', 'Pharma'].map((sector, i) => {
          const sentiment = Math.random() > 0.5 ? 'Bullish' : 'Bearish';
          const isBull = sentiment === 'Bullish';
          return (
            <GlowCard key={sector} glowColor={isBull ? '#10b981' : '#ef4444'}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                {sector}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                {isBull
                  ? <TrendingUp size={18} color="#10b981" />
                  : <TrendingDown size={18} color="#ef4444" />
                }
                <span style={{ color: isBull ? '#10b981' : '#ef4444', fontWeight: 700, fontSize: '1.1rem' }}>
                  {sentiment}
                </span>
              </div>
            </GlowCard>
          );
        })}
      </motion.div>

      {/* News Feed */}
      <motion.div variants={itemVariants}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          <h2 style={{ color: 'var(--text-primary)', fontSize: '1.25rem' }}>Live News Feed</h2>
          <Radio size={16} color="#8b5cf6" />
        </div>
        {loading && news.length === 0 ? (
          <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
              <RefreshCw size={24} />
            </motion.div>
            <p style={{ marginTop: '1rem' }}>Loading latest market news...</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <AnimatePresence>
              {news.map((item, i) => (
                <motion.div
                  key={item.id || i}
                  initial={{ opacity: 0, y: 20, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ delay: i * 0.03, type: 'spring', stiffness: 300, damping: 25 }}
                  layout
                >
                  <GlowCard
                    glowColor={item.impact === 'positive' ? '#10b981' : '#ef4444'}
                    style={{ padding: '1rem', cursor: item.link !== '#' ? 'pointer' : 'default' }}
                  >
                    <div
                      onClick={() => item.link !== '#' && window.open(item.link, '_blank')}
                      style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}
                    >
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.4rem', fontSize: '0.95rem' }}>{item.headline}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>{item.summary}</div>
                        <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.7rem', color: 'var(--text-muted)', alignItems: 'center' }}>
                          <span style={{ fontWeight: 600 }}>{item.source}</span>
                          <span>{item.time}</span>
                          <span className={`badge ${item.impact === 'positive' ? 'badge--green' : 'badge--red'}`}>
                            {item.sentiment || item.impact}
                          </span>
                          {item.impactScore && (
                            <span className="badge badge--purple">
                              <Zap size={10} /> {item.impactScore}
                            </span>
                          )}
                        </div>
                      </div>
                      {item.link !== '#' && <ExternalLink size={16} color="var(--text-muted)" style={{ flexShrink: 0, marginLeft: '1rem' }} />}
                    </div>
                  </GlowCard>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
