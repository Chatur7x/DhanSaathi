import { Bell, Search, TrendingUp } from 'lucide-react';
import './Header.scss';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

const MARKET_STATUS = true; // mock — market open

export default function Header({ title, subtitle }: HeaderProps) {
  return (
    <header className="header">
      <div className="header__left">
        <h1 className="header__title">{title}</h1>
        {subtitle && <p className="header__subtitle">{subtitle}</p>}
      </div>

      <div className="header__right">
        <div className={`header__market-status ${MARKET_STATUS ? 'open' : 'closed'}`}>
          <span className="header__market-dot" />
          <span className="header__market-label">
            {MARKET_STATUS ? 'Market Open' : 'Market Closed'}
          </span>
          <TrendingUp size={13} />
        </div>

        <button className="header__icon-btn" title="Search">
          <Search size={18} />
        </button>

        <button className="header__icon-btn header__icon-btn--notify" title="Notifications">
          <Bell size={18} />
          <span className="header__notify-dot" />
        </button>

        <div className="header__avatar" title="Profile">
          <span>U</span>
        </div>
      </div>
    </header>
  );
}
