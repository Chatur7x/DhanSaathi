import React, { useState } from 'react';
import OptionChain from '../components/markets/OptionChain';
import GreeksPanel from '../components/markets/GreeksPanel';
import StrategyBuilder from '../components/markets/StrategyBuilder';
import MaxPainChart from '../components/markets/MaxPainChart';

const FODashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'chain' | 'greeks' | 'strategy' | 'maxpain'>('chain');

  const tabs = [
    { id: 'chain' as const, label: 'Option Chain', icon: '⛓️' },
    { id: 'greeks' as const, label: 'Greeks', icon: '📊' },
    { id: 'strategy' as const, label: 'Strategy Builder', icon: '🏗️' },
    { id: 'maxpain' as const, label: 'Max Pain', icon: '🎯' }
  ];

  return (
    <div className="h-full flex flex-col bg-gray-950">
      <div className="bg-gray-900 border-b border-gray-700 px-4 py-3">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-white">F&O Dashboard</h1>
          <div className="flex space-x-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-hidden">
        {activeTab === 'chain' && <OptionChain symbol="NIFTY" />}
        {activeTab === 'greeks' && <GreeksPanel />}
        {activeTab === 'strategy' && <StrategyBuilder />}
        {activeTab === 'maxpain' && <MaxPainChart />}
      </div>
    </div>
  );
};

export default FODashboard;
