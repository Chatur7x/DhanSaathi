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
          <Route path="*" element={<div className="glass-card" style={{ padding: '2rem', textAlign: 'center' }}><h2>404 - Not Found</h2></div>} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
