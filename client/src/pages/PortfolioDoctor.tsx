import { useState } from 'react';
import { motion } from 'framer-motion';
import { usePortfolioStore } from '../store/portfolioStore';
import { formatCurrency, formatPercent } from '../utils/formatters';
import { Activity, Shield, AlertTriangle, TrendingUp, PieChart, Brain, RefreshCw, CheckCircle, XCircle, Info } from 'lucide-react';
import { PieChart as RPieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface PortfolioAnalysis {
  healthScore: number;
  riskLevel: string;
  diversificationScore: number;
  alerts: { type: string; title: string; description: string }[];
  sectorExposure: Record<string, number>;
  recommendations: { action: string; symbol: string; reason: string }[];
  behavioralBiases: string[];
  benchmarkComparison: { portfolioXIRR: number; nifty50Return: number; alpha: number };
  summary: string;
}

export default function PortfolioDoctor() {
  const { holdings } = usePortfolioStore();
  const [analysis, setAnalysis] = useState<PortfolioAnalysis | null>(null);
  const [loading, setLoading] = useState(false);

  const runAnalysis = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/ai/portfolio-doctor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          holdings: holdings.map(h => ({
            symbol: h.symbol,
            quantity: h.quantity,
            buyPrice: h.buyPrice,
            currentPrice: h.currentValue / h.quantity || h.buyPrice,
            pnlPercent: h.pnlPercent
          }))
        })
      });
      const data = await res.json();
      setAnalysis(data);
    } catch {
      // Use a minimal fallback
      setAnalysis(null);
    }
    setLoading(false);
  };

  const getScoreColor = (score: number) =>
    score >= 75 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444';

  const getRiskColor = (risk: string) =>
    risk === 'LOW' ? '#10b981' : risk === 'MEDIUM' ? '#f59e0b' : '#ef4444';

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4', '#ec4899'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', paddingBottom: '4rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
            <Activity size={28} style={{ display: 'inline', marginRight: '0.5rem', color: '#bf5af2' }} />
            Portfolio Doctor
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>AI-powered health analysis of your investment portfolio</p>
        </div>
        <button className="btn btn--primary" onClick={runAnalysis} disabled={loading}>
          <RefreshCw size={16} className={loading ? 'spin' : ''} />
          {loading ? 'Analyzing...' : 'Run AI Analysis'}
        </button>
      </div>

      {!analysis && !loading && (
        <div className="glass-card" style={{ padding: '3rem', textAlign: 'center' }}>
          <Brain size={64} style={{ color: '#bf5af2', marginBottom: '1rem', opacity: 0.5 }} />
          <h3 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Ready to Analyze</h3>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '400px', margin: '0 auto 1.5rem' }}>
            Your portfolio has {holdings.length} holdings. Click "Run AI Analysis" to get a comprehensive health report with actionable recommendations.
          </p>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            {holdings.map(h => (
              <span key={h.symbol} className="badge badge--blue">{h.symbol.replace('.NS', '')}</span>
            ))}
          </div>
        </div>
      )}

      {analysis && (
        <>
          {/* Health Score + Risk + Diversification */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <motion.div className="glass-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', fontWeight: 700, color: getScoreColor(analysis.healthScore) }}>{analysis.healthScore}</div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Health Score / 100</div>
              <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', marginTop: '0.75rem' }}>
                <div style={{ width: `${analysis.healthScore}%`, height: '100%', background: getScoreColor(analysis.healthScore), borderRadius: '3px', transition: 'width 1s ease' }} />
              </div>
            </motion.div>

            <motion.div className="glass-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} style={{ textAlign: 'center' }}>
              <Shield size={32} color={getRiskColor(analysis.riskLevel)} style={{ marginBottom: '0.5rem' }} />
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: getRiskColor(analysis.riskLevel) }}>{analysis.riskLevel}</div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Risk Level</div>
            </motion.div>

            <motion.div className="glass-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', fontWeight: 700, color: getScoreColor(analysis.diversificationScore) }}>{analysis.diversificationScore}</div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Diversification / 100</div>
            </motion.div>
          </div>

          {/* Summary */}
          <div className="glass-card" style={{ background: 'linear-gradient(135deg, rgba(191,90,242,0.1) 0%, rgba(20,20,22,0.7) 100%)' }}>
            <h3 style={{ color: 'var(--text-primary)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Brain size={20} color="#bf5af2" /> AI Summary
            </h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>{analysis.summary}</p>
          </div>

          {/* Alerts */}
          <div className="glass-card">
            <h3 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>🚨 Alerts & Warnings</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {analysis.alerts.map((alert, i) => (
                <div key={i} style={{
                  padding: '0.75rem 1rem', borderRadius: '12px',
                  background: alert.type === 'CRITICAL' ? 'rgba(239,68,68,0.1)' : alert.type === 'WARNING' ? 'rgba(245,158,11,0.1)' : 'rgba(59,130,246,0.1)',
                  border: `1px solid ${alert.type === 'CRITICAL' ? 'rgba(239,68,68,0.3)' : alert.type === 'WARNING' ? 'rgba(245,158,11,0.3)' : 'rgba(59,130,246,0.3)'}`,
                  display: 'flex', alignItems: 'flex-start', gap: '0.75rem'
                }}>
                  {alert.type === 'CRITICAL' ? <XCircle size={18} color="#ef4444" style={{ flexShrink: 0, marginTop: '2px' }} /> :
                   alert.type === 'WARNING' ? <AlertTriangle size={18} color="#f59e0b" style={{ flexShrink: 0, marginTop: '2px' }} /> :
                   <Info size={18} color="#3b82f6" style={{ flexShrink: 0, marginTop: '2px' }} />}
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem' }}>{alert.title}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>{alert.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Two columns: Sector Exposure + Recommendations */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
            {/* Sector Exposure Pie */}
            <div className="glass-card">
              <h3 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>
                <PieChart size={18} style={{ display: 'inline', marginRight: '0.5rem' }} />Sector Exposure
              </h3>
              <div style={{ height: '220px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <RPieChart>
                    <Pie
                      data={Object.entries(analysis.sectorExposure).map(([name, value]) => ({ name, value }))}
                      cx="50%" cy="50%" outerRadius={80} innerRadius={40} dataKey="value"
                      label={({ name, value }) => `${name} ${value}%`}
                    >
                      {Object.keys(analysis.sectorExposure).map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                  </RPieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Recommendations */}
            <div className="glass-card">
              <h3 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>
                <TrendingUp size={18} style={{ display: 'inline', marginRight: '0.5rem' }} />Recommendations
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {analysis.recommendations.map((rec, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', borderRadius: '10px', background: 'rgba(255,255,255,0.03)' }}>
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{rec.symbol}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{rec.reason}</div>
                    </div>
                    <span className={`badge ${rec.action === 'BUY' ? 'badge--green' : rec.action === 'SELL' ? 'badge--red' : 'badge--blue'}`}>
                      {rec.action}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Benchmark Comparison */}
          <div className="glass-card">
            <h3 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>📊 Benchmark Comparison</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', textAlign: 'center' }}>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Your XIRR</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: analysis.benchmarkComparison.portfolioXIRR >= 0 ? '#10b981' : '#ef4444' }}>
                  {formatPercent(analysis.benchmarkComparison.portfolioXIRR)}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Nifty 50</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#3b82f6' }}>
                  {formatPercent(analysis.benchmarkComparison.nifty50Return)}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Alpha</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: analysis.benchmarkComparison.alpha >= 0 ? '#10b981' : '#ef4444' }}>
                  {formatPercent(analysis.benchmarkComparison.alpha)}
                </div>
              </div>
            </div>
          </div>

          {/* Behavioral Biases */}
          {analysis.behavioralBiases.length > 0 && (
            <div className="glass-card">
              <h3 style={{ color: 'var(--text-primary)', marginBottom: '0.75rem' }}>🧠 Behavioral Biases Detected</h3>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {analysis.behavioralBiases.map((bias, i) => (
                  <span key={i} className="badge badge--purple">{bias}</span>
                ))}
              </div>
            </div>
          )}

          <div className="disclaimer">
            <AlertTriangle size={14} />
            <span>AI-generated analysis for educational purposes only. Not SEBI registered. Consult a registered advisor.</span>
          </div>
        </>
      )}
    </div>
  );
}
