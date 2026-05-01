import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Zap, RefreshCw, ArrowUpRight, AlertTriangle } from 'lucide-react';

interface Signal {
  headline: string;
  sentiment: number;
  sentimentLabel: string;
  impactedSectors: { sector: string; impact: string; confidence: number }[];
  stockSignals: { symbol: string; action: string; reason: string; confidence: number }[];
}

interface TradeSignalData {
  signals: Signal[];
  overallMarketSentiment: number;
  sectorHeatmap: Record<string, number>;
  topPick: { symbol: string; action: string; reason: string; confidence: number } | null;
}

export default function TradeSignals() {
  const [data, setData] = useState<TradeSignalData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSignals = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/ai/trade-signals');
      const json = await res.json();
      setData(json);
    } catch { setData(null); }
    setLoading(false);
  };

  useEffect(() => { fetchSignals(); }, []);

  const getSentimentColor = (s: number) => s > 0.3 ? '#10b981' : s < -0.3 ? '#ef4444' : '#f59e0b';
  const getSentimentLabel = (s: number) => s > 0.3 ? 'Bullish' : s < -0.3 ? 'Bearish' : 'Neutral';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', paddingBottom: '4rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
            <Zap size={28} style={{ display: 'inline', marginRight: '0.5rem', color: '#f59e0b' }} />
            AI Trade Signals
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>News → Sentiment → Sector Impact → Stock Signals</p>
        </div>
        <button className="btn btn--primary" onClick={fetchSignals} disabled={loading}>
          <RefreshCw size={16} className={loading ? 'spin' : ''} />
          Refresh Signals
        </button>
      </div>

      {loading && (
        <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
          Analyzing news and generating trade signals...
        </div>
      )}

      {data && !loading && (
        <>
          {/* Overall Sentiment + Top Pick */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
            <motion.div className="glass-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Overall Market Sentiment</div>
              <div style={{ fontSize: '3rem', fontWeight: 700, color: getSentimentColor(data.overallMarketSentiment) }}>
                {data.overallMarketSentiment > 0 ? <TrendingUp size={36} style={{ display: 'inline' }} /> : <TrendingDown size={36} style={{ display: 'inline' }} />}
              </div>
              <div style={{ fontSize: '1.2rem', fontWeight: 600, color: getSentimentColor(data.overallMarketSentiment) }}>
                {getSentimentLabel(data.overallMarketSentiment)} ({(data.overallMarketSentiment * 100).toFixed(0)}%)
              </div>
            </motion.div>

            {data.topPick && (
              <motion.div className="glass-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.1) 0%, rgba(20,20,22,0.7) 100%)' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>🏆 AI Top Pick</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>{data.topPick.symbol}</div>
                <span className={`badge ${data.topPick.action === 'BUY' ? 'badge--green' : 'badge--red'}`}>{data.topPick.action}</span>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>{data.topPick.reason}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Confidence: {data.topPick.confidence}%</div>
              </motion.div>
            )}
          </div>

          {/* Sector Heatmap */}
          <div className="glass-card">
            <h3 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>🗺️ Sector Sentiment Heatmap</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem' }}>
              {Object.entries(data.sectorHeatmap).map(([sector, sentiment]) => (
                <div key={sector} style={{
                  padding: '1rem', borderRadius: '12px', textAlign: 'center',
                  background: sentiment > 0.3 ? 'rgba(16,185,129,0.15)' : sentiment < -0.3 ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.1)',
                  border: `1px solid ${sentiment > 0.3 ? 'rgba(16,185,129,0.3)' : sentiment < -0.3 ? 'rgba(239,68,68,0.3)' : 'rgba(245,158,11,0.2)'}`
                }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{sector}</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 700, color: getSentimentColor(sentiment), marginTop: '0.25rem' }}>
                    {sentiment > 0 ? '+' : ''}{(sentiment * 100).toFixed(0)}%
                  </div>
                  <div style={{ fontSize: '0.65rem', color: getSentimentColor(sentiment) }}>
                    {getSentimentLabel(sentiment)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* News → Signal Cards */}
          <div className="glass-card">
            <h3 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>📰 News → Trade Signal Pipeline</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {data.signals.map((signal, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                  style={{ padding: '1rem', borderRadius: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                  {/* Headline + Sentiment */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: '0.75rem' }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem', flex: 1 }}>{signal.headline}</div>
                    <span className={`badge ${signal.sentiment > 0.3 ? 'badge--green' : signal.sentiment < -0.3 ? 'badge--red' : 'badge--gold'}`}>
                      {signal.sentimentLabel}
                    </span>
                  </div>
                  {/* Impacted Sectors */}
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                    {signal.impactedSectors.map((s, j) => (
                      <span key={j} style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '4px',
                        background: s.impact === 'POSITIVE' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                        color: s.impact === 'POSITIVE' ? '#10b981' : '#ef4444' }}>
                        {s.sector} {s.impact === 'POSITIVE' ? '↑' : '↓'} ({s.confidence}%)
                      </span>
                    ))}
                  </div>
                  {/* Stock Signals */}
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {signal.stockSignals.map((ss, j) => (
                      <div key={j} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        <ArrowUpRight size={12} color={ss.action === 'BUY' ? '#10b981' : '#ef4444'} />
                        <span style={{ fontWeight: 600 }}>{ss.symbol}</span> — {ss.action} ({ss.confidence}%)
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="disclaimer">
            <AlertTriangle size={14} />
            <span>AI-generated signals for educational purposes only. Not financial advice. Not SEBI registered.</span>
          </div>
        </>
      )}
    </div>
  );
}
