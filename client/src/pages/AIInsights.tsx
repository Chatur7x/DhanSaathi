import { useEffect, useState } from 'react';
import { fetchLiveNews } from '../services/api';
import { motion } from 'framer-motion';
import { Newspaper, TrendingUp, TrendingDown, ExternalLink, RefreshCw } from 'lucide-react';

export default function AIInsights() {
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadNews = async () => {
    setLoading(true);
    const data = await fetchLiveNews();
    setNews(data);
    setLoading(false);
  };

  useEffect(() => {
    loadNews();
    const interval = setInterval(loadNews, 300000); // Refresh every 5 min
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', paddingBottom: '4rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: '2rem', color: 'var(--text-primary)' }}>AI Insights & News</h1>
        <button className="btn btn--primary" onClick={loadNews} disabled={loading}>
          <RefreshCw size={16} className={loading ? 'spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Market Sentiment Overview */}
      <div className="glass-card">
        <h3 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>Market Sentiment</h3>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          {['Overall', 'IT Sector', 'Banking', 'Auto', 'Pharma'].map((sector, i) => {
            const sentiment = Math.random() > 0.5 ? 'bullish' : 'bearish';
            return (
              <div key={i} style={{
                padding: '0.75rem 1rem', borderRadius: '8px',
                background: sentiment === 'bullish' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                border: `1px solid ${sentiment === 'bullish' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`
              }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{sector}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.25rem' }}>
                  {sentiment === 'bullish' ? 
                    <TrendingUp size={16} color="#10b981" /> : 
                    <TrendingDown size={16} color="#ef4444" />
                  }
                  <span style={{ color: sentiment === 'bullish' ? '#10b981' : '#ef4444', fontWeight: 600 }}>
                    {sentiment === 'bullish' ? 'Bullish' : 'Bearish'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* News Feed */}
      <div>
        <h2 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>Latest Market News</h2>
        {loading ? (
          <div className="glass-card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            Loading news...
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {news.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass-card"
                style={{ padding: '1rem', cursor: 'pointer' }}
                onClick={() => window.open(item.link, '_blank')}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>{item.headline}</div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>{item.summary}</div>
                    <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      <span>{item.source}</span>
                      <span>{item.time}</span>
                      <span className={`badge ${item.impact === 'positive' ? 'badge--green' : 'badge--red'}`}>
                        {item.impact}
                      </span>
                    </div>
                  </div>
                  <ExternalLink size={16} color="var(--text-muted)" />
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* AI Suggestions */}
      <div className="glass-card" style={{ padding: '1.5rem' }}>
        <h3 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>AI Suggestions</h3>
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
          AI-powered stock suggestions and sentiment analysis coming soon. 
          <br />Gemini API integration in progress...
        </div>
      </div>
    </div>
  );
}
