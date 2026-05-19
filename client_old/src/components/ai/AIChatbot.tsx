import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Bot, User, Sparkles } from 'lucide-react';
import './AIChatbot.scss';
import { API_BASE } from '../../config';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Hi! I'm DhanSaathi AI 🤖\n\nI can help you with:\n• SIP/Lumpsum calculations\n• Tax planning (STCG/LTCG)\n• Market insights\n• Portfolio analysis\n\nTry: \"Calculate SIP of ₹10,000 for 15 years\"", timestamp: new Date() }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg: Message = { role: 'user', content: input.trim(), timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsg.content,
          history: messages.slice(-10).map(m => ({ role: m.role, content: m.content }))
        })
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.response || 'Sorry, I could not process that.', timestamp: new Date() }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Connection error. Please make sure the server is running on port 5000.', timestamp: new Date() }]);
    }
    setLoading(false);
  };

  const quickQuestions = [
    'Calculate SIP ₹10,000 for 15 years',
    'How much LTCG tax on ₹5L?',
    'Best portfolio for a 25-year-old',
    'Explain options Greeks',
  ];

  return (
    <>
      {/* Floating Button */}
      <motion.button
        className="chatbot-fab"
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        animate={{ rotate: isOpen ? 180 : 0 }}
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
        {!isOpen && <span className="chatbot-fab__badge">AI</span>}
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="chatbot"
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            {/* Header */}
            <div className="chatbot__header">
              <div className="chatbot__header-info">
                <div className="chatbot__avatar"><Sparkles size={18} /></div>
                <div>
                  <div className="chatbot__title">DhanSaathi AI</div>
                  <div className="chatbot__subtitle">Your Wealth Companion</div>
                </div>
              </div>
              <button className="chatbot__close" onClick={() => setIsOpen(false)}><X size={18} /></button>
            </div>

            {/* Messages */}
            <div className="chatbot__messages">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  className={`chatbot__msg chatbot__msg--${msg.role}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i === messages.length - 1 ? 0.1 : 0 }}
                >
                  <div className="chatbot__msg-icon">
                    {msg.role === 'assistant' ? <Bot size={14} /> : <User size={14} />}
                  </div>
                  <div className="chatbot__msg-content">
                    {msg.content.split('\n').map((line, j) => (
                      <span key={j}>{line}<br /></span>
                    ))}
                  </div>
                </motion.div>
              ))}
              {loading && (
                <div className="chatbot__msg chatbot__msg--assistant">
                  <div className="chatbot__msg-icon"><Bot size={14} /></div>
                  <div className="chatbot__typing">
                    <span></span><span></span><span></span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Questions (shown only at start) */}
            {messages.length <= 1 && (
              <div className="chatbot__quick">
                {quickQuestions.map((q, i) => (
                  <button key={i} className="chatbot__quick-btn" onClick={() => { setInput(q); }}>
                    {q}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="chatbot__input-bar">
              <input
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMessage()}
                placeholder="Ask about SIP, tax, markets..."
                disabled={loading}
              />
              <button onClick={sendMessage} disabled={!input.trim() || loading} className="chatbot__send">
                <Send size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
