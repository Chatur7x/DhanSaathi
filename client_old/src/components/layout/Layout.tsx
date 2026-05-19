import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
import Header from './Header';
import AIChatbot from '../ai/AIChatbot';
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { usePortfolioStore } from '../../store/portfolioStore';
import './Layout.scss';

export default function Layout() {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const location = useLocation();
  const fetchHoldings = usePortfolioStore(state => state.fetchHoldings);

  useEffect(() => {
    fetchHoldings(); // Fetch real portfolio from backend on load

    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Determine header title based on route
  const getHeaderInfo = () => {
    const path = location.pathname;
    if (path === '/') return { title: 'Dashboard', subtitle: 'Overview of your wealth' };
    if (path.startsWith('/markets')) return { title: 'Markets', subtitle: 'Live Indian indices & stocks' };
    if (path.startsWith('/portfolio-doctor')) return { title: 'Portfolio Doctor', subtitle: 'AI-powered health analysis' };
    if (path.startsWith('/portfolio')) return { title: 'Portfolio', subtitle: 'Your holdings & performance' };
    if (path.startsWith('/calculators')) return { title: 'Calculators', subtitle: 'Smart financial tools' };
    if (path.startsWith('/knowledge')) return { title: 'Knowledge', subtitle: 'Learn market basics' };
    if (path.startsWith('/ai-insights')) return { title: 'AI Insights', subtitle: 'Market intelligence engine' };
    if (path.startsWith('/trade-signals')) return { title: 'Trade Signals', subtitle: 'AI news-to-signal pipeline' };
    if (path.startsWith('/goals')) return { title: 'Goal Planner', subtitle: 'Plan your financial goals' };
    if (path.startsWith('/paper-trading')) return { title: 'Paper Trading', subtitle: 'Practice with virtual money' };
    if (path.startsWith('/academy')) return { title: 'Academy', subtitle: 'Learn & earn XP' };
    if (path.startsWith('/settings')) return { title: 'Settings', subtitle: 'Manage your app preferences' };
    return { title: 'DhanSaathi', subtitle: 'Your Wealth Companion' };
  };

  const { title, subtitle } = getHeaderInfo();

  return (
    <div className="layout">
      {/* Sidebar for Desktop */}
      {!isMobile && <Sidebar />}

      <div className="layout__main">
        <Header title={title} subtitle={subtitle} />
        
        <main className="layout__content" style={{ position: 'relative' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              style={{ width: '100%', height: '100%' }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Bottom Nav for Mobile/Android */}
      {isMobile && <BottomNav />}

      {/* AI Chatbot — always visible */}
      <AIChatbot />
    </div>
  );
}
