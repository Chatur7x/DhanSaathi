import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, BookOpen, RefreshCcw, Briefcase, Layers, TrendingUp, Activity, ChevronRight, X } from 'lucide-react';
import { KNOWLEDGE_TOPICS, GLOSSARY } from '../data/knowledgeData';
import type { Topic } from '../data/knowledgeData';

const iconMap: Record<string, React.ReactNode> = {
  RefreshCcw: <RefreshCcw size={24} />,
  Briefcase: <Briefcase size={24} />,
  Layers: <Layers size={24} />,
  TrendingUp: <TrendingUp size={24} />,
  Activity: <Activity size={24} />
};

export default function Knowledge() {
  const [activeTab, setActiveTab] = useState<'topics' | 'glossary'>('topics');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);

  const filteredGlossary = useMemo(() => {
    if (!searchQuery) return GLOSSARY;
    const lowerQ = searchQuery.toLowerCase();
    return GLOSSARY.filter(item => 
      item.term.toLowerCase().includes(lowerQ) || 
      item.definition.toLowerCase().includes(lowerQ) ||
      item.category.toLowerCase().includes(lowerQ)
    );
  }, [searchQuery]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', paddingBottom: '4rem' }}>
      
      {/* Header and Tabs */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div className="tabs" style={{ width: 'fit-content' }}>
          <button 
            className={`tabs__tab ${activeTab === 'topics' ? 'active' : ''}`}
            onClick={() => setActiveTab('topics')}
          >
            <BookOpen size={16} /> Topics
          </button>
          <button 
            className={`tabs__tab ${activeTab === 'glossary' ? 'active' : ''}`}
            onClick={() => setActiveTab('glossary')}
          >
            <Search size={16} /> Glossary
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'topics' && !selectedTopic && (
          <motion.div 
            key="topics-grid"
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}
          >
            {KNOWLEDGE_TOPICS.map(topic => (
              <motion.div 
                key={topic.id}
                className="glass-card interactive"
                whileHover={{ y: -4, borderColor: 'rgba(255,255,255,0.2)' }}
                onClick={() => setSelectedTopic(topic)}
                style={{ display: 'flex', flexDirection: 'column', gap: '1rem', cursor: 'pointer' }}
              >
                <div style={{ 
                  width: '48px', height: '48px', borderRadius: '12px', 
                  background: `linear-gradient(135deg, ${topic.color}22 0%, ${topic.color}11 100%)`,
                  border: `1px solid ${topic.color}44`,
                  color: topic.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  {iconMap[topic.icon]}
                </div>
                <div>
                  <h3 style={{ fontSize: '1.25rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>{topic.title}</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: '1.5' }}>{topic.description}</p>
                </div>
                <div style={{ marginTop: 'auto', paddingTop: '1rem', display: 'flex', justifyContent: 'flex-end', color: 'var(--text-muted)' }}>
                  <ChevronRight size={20} />
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {activeTab === 'topics' && selectedTopic && (
          <motion.div
            key="topic-detail"
            initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }}
            className="glass-card"
            style={{ position: 'relative', overflow: 'hidden' }}
          >
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: selectedTopic.color }} />
            
            <button 
              className="btn btn--ghost btn--icon" 
              style={{ position: 'absolute', top: '1rem', right: '1rem' }}
              onClick={() => setSelectedTopic(null)}
            >
              <X size={24} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem', marginTop: '1rem' }}>
              <div style={{ color: selectedTopic.color }}>{iconMap[selectedTopic.icon]}</div>
              <h2 style={{ color: 'var(--text-primary)' }}>{selectedTopic.title}</h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {selectedTopic.content.map((paragraph, idx) => (
                <p key={idx} style={{ color: 'var(--text-secondary)', lineHeight: '1.7', fontSize: '1.05rem' }}>
                  {paragraph}
                </p>
              ))}
            </div>
            
            <button 
              className="btn btn--secondary" 
              style={{ marginTop: '2rem' }}
              onClick={() => setSelectedTopic(null)}
            >
              Back to Topics
            </button>
          </motion.div>
        )}

        {activeTab === 'glossary' && (
          <motion.div 
            key="glossary-view"
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
          >
            <div style={{ position: 'relative', maxWidth: '400px' }}>
              <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="text" 
                className="input" 
                placeholder="Search financial terms..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ paddingLeft: '2.5rem' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
              <AnimatePresence>
                {filteredGlossary.map(item => (
                  <motion.div 
                    key={item.term}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                    className="glass-card"
                    style={{ padding: '1.5rem' }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                      <h4 style={{ color: 'var(--text-primary)', fontSize: '1.125rem', fontWeight: 600 }}>{item.term}</h4>
                      <span className="badge badge--blue" style={{ fontSize: '0.7rem', padding: '2px 8px' }}>{item.category}</span>
                    </div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: '1.5' }}>
                      {item.definition}
                    </p>
                  </motion.div>
                ))}
                {filteredGlossary.length === 0 && (
                  <p style={{ color: 'var(--text-muted)', fontStyle: 'italic', padding: '1rem' }}>
                    No terms found matching "{searchQuery}"
                  </p>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
