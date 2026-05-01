import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Calculators from './pages/calculators/Calculators';
import Markets from './pages/Markets';
import FODashboard from './pages/FODashboard';
import Portfolio from './pages/Portfolio';
import StockScreener from './pages/StockScreener';
import BarReplay from './pages/BarReplay';
import MultiChart from './pages/MultiChart';
import Alerts from './pages/Alerts';
import AIInsights from './pages/AIInsights';
import Knowledge from './pages/Knowledge';
import Settings from './pages/Settings';

// New Advanced Feature Pages
import PortfolioDoctor from './pages/PortfolioDoctor';
import TradeSignals from './pages/TradeSignals';
import GoalPlannerPage from './pages/GoalPlannerPage';
import PaperTrading from './pages/PaperTrading';
import Academy from './pages/Academy';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="markets" element={<Markets />} />
          <Route path="fo" element={<FODashboard />} />
          <Route path="screener" element={<StockScreener />} />
          <Route path="bar-replay" element={<BarReplay />} />
          <Route path="multi-chart" element={<MultiChart />} />
          <Route path="alerts" element={<Alerts />} />
          <Route path="portfolio" element={<Portfolio />} />
          <Route path="calculators" element={<Calculators />} />
          <Route path="knowledge" element={<Knowledge />} />
          <Route path="ai-insights" element={<AIInsights />} />
          <Route path="settings" element={<Settings />} />

          {/* Advanced Feature Routes */}
          <Route path="portfolio-doctor" element={<PortfolioDoctor />} />
          <Route path="trade-signals" element={<TradeSignals />} />
          <Route path="goals" element={<GoalPlannerPage />} />
          <Route path="paper-trading" element={<PaperTrading />} />
          <Route path="academy" element={<Academy />} />

          <Route path="*" element={<div className="glass-card" style={{ padding: '2rem', textAlign: 'center' }}><h2>404 - Not Found</h2></div>} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
