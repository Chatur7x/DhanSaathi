import { useEffect, useState } from 'react';
import { fetchLiveNews } from '@/services/api';
import { motion } from 'framer-motion';
import { Zap, Clock, ExternalLink } from 'lucide-react';

export default function AIInsights() {
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLiveNews().then(data => {
      setNews(data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <div style={{ padding: '2rem', color: 'var(--text-secondary)' }}>Analyzing live market data...</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', paddingBottom: '4rem' }}>
      <div className="glass-card" style={{ background: 'linear-gradient(135deg, rgba(191,90,242,0.15) 0%, rgba(20,20,22,0.8) 100%)', border: '1px solid rgba(191,90,242,0.3)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(191,90,242,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Zap size={24} color="#bf5af2" />
          </div>
          <div>
            <h2 style={{ color: 'var(--text-primary)' }}>Live Market Intelligence</h2>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Real-time news processing by AI</div>
          </div>
        </div>
        <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
          Our AI constantly monitors the Economic Times and global feeds to bring you the most critical updates affecting the Indian markets.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {news.map(item => (
          <motion.a 
            href={item.link} target="_blank" rel="noopener noreferrer"
            key={item.id} 
            className="glass-card" 
            whileHover={{ y: -4, borderColor: 'rgba(255,255,255,0.2)' }}
            style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', fontSize: '0.875rem' }}>
              <span style={{ color: 'var(--accent-purple)', fontWeight: 600 }}>{item.source}</span>
              <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Clock size={14} /> {item.time}
              </span>
            </div>
            <h3 style={{ fontSize: '1.125rem', color: 'var(--text-primary)', marginBottom: '0.5rem', lineHeight: '1.4' }}>
              {item.headline}
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: '1.5', flex: 1, marginBottom: '1rem' }}>
              {item.summary}
            </p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
              <span className={`badge ${item.impact === 'positive' ? 'badge--green' : 'badge--red'}`}>
                Sentiment: {item.impact}
              </span>
              <ExternalLink size={16} color="var(--text-muted)" />
            </div>
          </motion.a>
        ))}
      </div>
    </div>
  );
}
