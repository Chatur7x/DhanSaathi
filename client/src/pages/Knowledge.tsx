import { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, TrendingUp, Wallet, BarChart3, LineChart, ArrowLeft } from 'lucide-react';

const TOPICS = [
  {
    id: 'sip', title: 'SIP (Systematic Investment Plan)',
    icon: TrendingUp, color: '#3b82f6',
    articles: [
      { title: 'What is SIP?', content: 'SIP allows you to invest a fixed amount regularly in mutual funds. It averages out market volatility through rupee cost averaging.' },
      { title: 'Power of Compounding', content: 'Even small SIPs can grow significantly over time. ₹5,000/month at 12% for 20 years = ₹49.7L (invested: ₹12L)' },
      { title: 'SIP vs Lumpsum', content: 'SIP reduces timing risk. In volatile markets, SIP often outperforms lumpsum investments.' },
      { title: 'Step-up SIP', content: 'Increase your SIP amount annually (e.g., 10% yearly) to beat inflation and accelerate wealth creation.' }
    ]
  },
  {
    id: 'mutual-funds', title: 'Mutual Funds',
    icon: Wallet, color: '#10b981',
    articles: [
      { title: 'Types of Mutual Funds', content: 'Equity (stocks), Debt (bonds), Hybrid (mix), ELSS (tax-saving). Choose based on risk appetite and goals.' },
      { title: 'NAV Explained', content: 'Net Asset Value = (Total Assets - Liabilities) / Number of units. NAV changes daily based on underlying asset prices.' },
      { title: 'Direct vs Regular Plans', content: 'Direct plans have lower expense ratios (no distributor commission). Save 1-1.5% annually with Direct plans.' },
      { title: 'Expense Ratio', content: 'Annual fee charged by fund houses. Lower is better. Equity funds typically charge 0.5-2.5%. SEBI caps at 2.5%.' }
    ]
  },
  {
    id: 'etf', title: 'ETFs (Exchange Traded Funds)',
    icon: BarChart3, color: '#f59e0b',
    articles: [
      { title: 'How ETFs Work', content: 'ETFs trade like stocks on exchanges. They track an index (Nifty 50, Gold, etc.) and have lower expense ratios than mutual funds.' },
      { title: 'Gold ETFs', content: 'Invest in gold without physical storage. 1 unit = 1 gram gold. More liquid than physical gold. No making charges.' },
      { title: 'Nifty/Sensex ETFs', content: 'Low-cost way to invest in entire market indices. Expense ratio typically 0.05-0.5% vs 1-2.5% for index funds.' }
    ]
  },
  {
    id: 'stocks', title: 'Stock Investing',
    icon: LineChart, color: '#8b5cf6',
    articles: [
      { title: 'Fundamental Analysis', content: 'Analyze P/E ratio, P/B ratio, debt-to-equity, ROE, and revenue growth to evaluate stocks.' },
      { title: 'Market Cap Classes', content: 'Large Cap (₹20,000Cr+), Mid Cap (₹5,000-20,000Cr), Small Cap (<₹5,000Cr). Higher cap = lower risk.' },
      { title: 'Candlestick Patterns', content: 'Doji, Hammer, Engulfing patterns help predict price movements. Use with volume analysis for better accuracy.' }
    ]
  },
  {
    id: 'fno', title: 'F&O (Futures & Options)',
    icon: BarChart3, color: '#ef4444',
    articles: [
      { title: 'Futures Basics', content: 'Agreement to buy/sell at predetermined price on a future date. Requires margin money. High risk, high reward.' },
      { title: 'Options - Call & Put', content: 'Call = right to buy at strike price. Put = right to sell at strike price. Options premium = cost of the contract.' },
      { title: 'Greeks Explained', content: 'Delta (price sensitivity), Gamma (delta change), Theta (time decay), Vega (volatility impact). Master Greeks to trade options profitably.' },
      { title: 'Margin Requirements', content: 'SPAN + Exposure margin needed. For Nifty, ~₹1.2L per lot. Use margin calculator before trading.' }
    ]
  }
];

export default function Knowledge() {
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [expandedArticle, setExpandedArticle] = useState<number | null>(null);

  const topic = TOPICS.find(t => t.id === selectedTopic);

  if (selectedTopic && topic) {
    return (
      <div style={{ paddingBottom: '4rem' }}>
        <button 
          onClick={() => setSelectedTopic(null)}
          style={{ background: 'none', border: 'none', color: 'var(--accent-blue)', cursor: 'pointer', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <ArrowLeft size={16} /> Back to Topics
        </button>
        <h1 style={{ fontSize: '2rem', color: 'var(--text-primary)', marginBottom: '2rem' }}>{topic.title}</h1>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {topic.articles.map((article, i) => (
            <motion.div
              key={i}
              className="glass-card"
              style={{ padding: '1.5rem', cursor: 'pointer' }}
              onClick={() => setExpandedArticle(expandedArticle === i ? null : i)}
              whileHover={{ y: -2 }}
            >
              <h3 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>{article.title}</h3>
              {expandedArticle === i && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}
                >
                  {article.content}
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{ paddingBottom: '4rem' }}>
      <h1 style={{ fontSize: '2rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Knowledge Hub</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Learn everything about Indian financial instruments</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
        {TOPICS.map((topic, i) => (
          <motion.div
            key={topic.id}
            className="glass-card"
            style={{ padding: '1.5rem', cursor: 'pointer' }}
            onClick={() => setSelectedTopic(topic.id)}
            whileHover={{ y: -4, scale: 1.02 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <topic.icon size={32} color={topic.color} />
            <h3 style={{ color: 'var(--text-primary)', marginTop: '1rem', marginBottom: '0.5rem' }}>{topic.title}</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              {topic.articles.length} articles · Click to explore
            </p>
          </motion.div>
        ))}
      </div>
      <div className="glass-card" style={{ padding: '1.5rem', marginTop: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
        <BookOpen size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
        <p>Quiz system, glossary search, and progress tracking coming soon!</p>
        <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>SEBI disclaimers: Past performance does not guarantee future results.</p>
      </div>
    </div>
  );
}
