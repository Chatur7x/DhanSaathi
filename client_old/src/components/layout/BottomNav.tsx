import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, TrendingUp, Briefcase, Calculator, Brain } from 'lucide-react';
import './BottomNav.scss';

const NAV_ITEMS = [
  { to: '/', label: 'Home', icon: LayoutDashboard, color: '#3b82f6' },
  { to: '/markets', label: 'Markets', icon: TrendingUp, color: '#10b981' },
  { to: '/portfolio', label: 'Portfolio', icon: Briefcase, color: '#f59e0b' },
  { to: '/calculators', label: 'Calc', icon: Calculator, color: '#8b5cf6' },
  { to: '/ai-insights', label: 'AI', icon: Brain, color: '#ec4899' },
];

export default function BottomNav() {
  const location = useLocation();

  return (
    <nav className="bottom-nav">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive = item.to === '/'
          ? location.pathname === '/'
          : location.pathname.startsWith(item.to);

        return (
          <NavLink
            key={item.to}
            to={item.to}
            className={`bottom-nav__item ${isActive ? 'bottom-nav__item--active' : ''}`}
          >
            <div
              className="bottom-nav__icon"
              style={isActive ? { color: item.color } : {}}
            >
              {isActive && (
                <div
                  className="bottom-nav__icon-bg"
                  style={{ background: `${item.color}20` }}
                />
              )}
              <Icon size={20} />
            </div>
            <span
              className="bottom-nav__label"
              style={isActive ? { color: item.color } : {}}
            >
              {item.label}
            </span>
          </NavLink>
        );
      })}
    </nav>
  );
}
