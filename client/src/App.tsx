import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Calculators from './pages/calculators/Calculators';
import Markets from './pages/Markets';
import Portfolio from './pages/Portfolio';
import AIInsights from './pages/AIInsights';
import Knowledge from './pages/Knowledge';

// Placeholder components for other pages
const Placeholder = ({ title }: { title: string }) => (
  <div className="glass-card" style={{ padding: '2rem', textAlign: 'center' }}>
    <h2>{title}</h2>
    <p>This page is currently under construction.</p>
  </div>
);

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="markets" element={<Markets />} />
          <Route path="portfolio" element={<Portfolio />} />
          <Route path="calculators" element={<Calculators />} />
          <Route path="knowledge" element={<Knowledge />} />
          <Route path="ai-insights" element={<AIInsights />} />
          <Route path="settings" element={<Placeholder title="Settings" />} />
          <Route path="*" element={<Placeholder title="404 - Not Found" />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
