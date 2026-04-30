import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, TrendingUp, Briefcase, Calculator,
  BookOpen, Brain, Settings, ChevronLeft, ChevronRight, Zap,
  BarChart3, Bell
} from 'lucide-react';
import { useState, useEffect } from 'react';
import './Sidebar.scss';

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, color: '#3b82f6' },
  { to: '/markets', label: 'Markets', icon: TrendingUp, color: '#10b981' },
  { to: '/fo', label: 'F&O', icon: BarChart3, color: '#f59e0b' },
  { to: '/screener', label: 'Screener', icon: BarChart3, color: '#8b5cf6' },
  { to: '/bar-replay', label: 'Bar Replay', icon: Zap, color: '#f59e0b' },
  { to: '/multi-chart', label: 'Multi-Chart', icon: BarChart3, color: '#06b6d4' },
  { to: '/alerts', label: 'Alerts', icon: Bell, color: '#ef4444' },
  { to: '/portfolio', label: 'Portfolio', icon: Briefcase, color: '#f59e0b' },
  { to: '/calculators', label: 'Calculators', icon: Calculator, color: '#8b5cf6' },
  { to: '/knowledge', label: 'Knowledge', icon: BookOpen, color: '#06b6d4' },
  { to: '/ai-insights', label: 'AI Insights', icon: Brain, color: '#ec4899' },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (collapsed) {
      document.body.classList.add('sidebar-collapsed');
    } else {
      document.body.classList.remove('sidebar-collapsed');
    }
  }, [collapsed]);

  return (
    <motion.aside
      className={`sidebar ${collapsed ? 'sidebar--collapsed' : ''}`}
      animate={{ width: collapsed ? 72 : 240 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
    >
      {/* Logo */}
      <div className="sidebar__logo">
        <div className="sidebar__logo-icon">
          <Zap size={20} />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              className="sidebar__logo-text"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              <span className="sidebar__logo-name">DhanSaathi</span>
              <span className="sidebar__logo-tagline">Wealth Companion</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Nav */}
      <nav className="sidebar__nav">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = item.to === '/'
            ? location.pathname === '/'
            : location.pathname.startsWith(item.to);

          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={`sidebar__nav-item ${isActive ? 'sidebar__nav-item--active' : ''}`}
              title={collapsed ? item.label : ''}
            >
              {isActive && (
                <motion.div
                  className="sidebar__nav-active-bg"
                  layoutId="activeNav"
                  style={{ background: `${item.color}20`, borderColor: `${item.color}40` }}
                  transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                />
              )}
              <div
                className="sidebar__nav-icon"
                style={{ color: isActive ? item.color : undefined }}
              >
                <Icon size={18} />
              </div>
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    className="sidebar__nav-label"
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -8 }}
                    transition={{ duration: 0.2 }}
                    style={{ color: isActive ? item.color : undefined }}
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="sidebar__bottom">
        <NavLink to="/settings" className="sidebar__nav-item" title={collapsed ? 'Settings' : ''}>
          <div className="sidebar__nav-icon"><Settings size={18} /></div>
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                className="sidebar__nav-label"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >Settings</motion.span>
            )}
          </AnimatePresence>
        </NavLink>

        <button
          className="sidebar__collapse-btn"
          onClick={() => setCollapsed(!collapsed)}
          title={collapsed ? 'Expand' : 'Collapse'}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>
    </motion.aside>
  );
}
