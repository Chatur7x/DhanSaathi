import React, { useState } from 'react';
import { Bell, Plus, Trash2, AlertTriangle } from 'lucide-react';

interface Alert {
  id: string;
  symbol: string;
  condition: 'above' | 'below' | 'crosses_above' | 'crosses_below';
  value: number;
  indicator?: string;
  timeframe: string;
  isActive: boolean;
  triggered: boolean;
  createdAt: Date;
}

const Alerts: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>([
    { id: '1', symbol: 'NIFTY', condition: 'above', value: 22500, timeframe: '5m', isActive: true, triggered: false, createdAt: new Date() },
    { id: '2', symbol: 'BANKNIFTY', condition: 'below', value: 48000, timeframe: '15m', isActive: true, triggered: false, createdAt: new Date() },
    { id: '3', symbol: 'RELIANCE', condition: 'crosses_above', value: 2500, timeframe: '1h', isActive: false, triggered: true, createdAt: new Date() }
  ]);
  const [showCreate, setShowCreate] = useState(false);
  const [newAlert, setNewAlert] = useState({
    symbol: 'NIFTY',
    condition: 'above' as const,
    value: 0,
    timeframe: '5m'
  });

  const addAlert = () => {
    const alert: Alert = {
      id: Date.now().toString(),
      ...newAlert,
      isActive: true,
      triggered: false,
      createdAt: new Date()
    };
    setAlerts([...alerts, alert]);
    setShowCreate(false);
  };

  const toggleAlert = (id: string) => {
    setAlerts(alerts.map(a => a.id === id ? { ...a, isActive: !a.isActive } : a));
  };

  const deleteAlert = (id: string) => {
    setAlerts(alerts.filter(a => a.id !== id));
  };

  const conditionLabels = {
    above: 'Price Above',
    below: 'Price Below',
    crosses_above: 'Crosses Above',
    crosses_below: 'Crosses Below'
  };

  return (
    <div className="h-full flex flex-col bg-gray-950 p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-white flex items-center">
          <Bell className="mr-2" size={20} /> Alerts Manager
        </h1>
        <button
          onClick={() => setShowCreate(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm flex items-center"
        >
          <Plus size={16} className="mr-1" /> Create Alert
        </button>
      </div>
      {showCreate && (
        <div className="bg-gray-900 rounded p-4 mb-4 border border-gray-700">
          <h3 className="text-white font-semibold mb-3">New Alert</h3>
          <div className="grid grid-cols-4 gap-3">
            <select
              value={newAlert.symbol}
              onChange={e => setNewAlert({ ...newAlert, symbol: e.target.value })}
              className="bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm text-white"
            >
              <option>NIFTY</option>
              <option>BANKNIFTY</option>
              <option>RELIANCE</option>
              <option>TCS</option>
            </select>
            <select
              value={newAlert.condition}
              onChange={e => setNewAlert({ ...newAlert, condition: e.target.value as any })}
              className="bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm text-white"
            >
              <option value="above">Price Above</option>
              <option value="below">Price Below</option>
              <option value="crosses_above">Crosses Above</option>
              <option value="crosses_below">Crosses Below</option>
            </select>
            <input
              type="number"
              value={newAlert.value}
              onChange={e => setNewAlert({ ...newAlert, value: +e.target.value })}
              placeholder="Value"
              className="bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm text-white"
            />
            <select
              value={newAlert.timeframe}
              onChange={e => setNewAlert({ ...newAlert, timeframe: e.target.value })}
              className="bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm text-white"
            >
              <option value="1m">1 min</option>
              <option value="5m">5 min</option>
              <option value="15m">15 min</option>
              <option value="1h">1 hour</option>
              <option value="1D">1 day</option>
            </select>
          </div>
          <div className="flex space-x-2 mt-3">
            <button onClick={addAlert} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm">
              Create Alert
            </button>
            <button onClick={() => setShowCreate(false)} className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded text-sm">
              Cancel
            </button>
          </div>
        </div>
      )}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-800 text-gray-400 sticky top-0">
            <tr>
              <th className="text-left p-3">Status</th>
              <th className="text-left p-3">Symbol</th>
              <th className="text-left p-3">Condition</th>
              <th className="text-right p-3">Value</th>
              <th className="text-left p-3">Timeframe</th>
              <th className="text-left p-3">Created</th>
              <th className="text-right p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {alerts.map(alert => (
              <tr key={alert.id} className="border-t border-gray-800 hover:bg-gray-800/50">
                <td className="p-3">
                  {alert.triggered ? (
                    <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-red-600/20 text-red-400">
                      <AlertTriangle size={12} className="mr-1" /> Triggered
                    </span>
                  ) : alert.isActive ? (
                    <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-green-600/20 text-green-400">Active</span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-600/20 text-gray-400">Paused</span>
                  )}
                </td>
                <td className="p-3 text-white font-medium">{alert.symbol}</td>
                <td className="p-3 text-gray-300">{conditionLabels[alert.condition]}</td>
                <td className="p-3 text-right text-white">{alert.value}</td>
                <td className="p-3 text-gray-300">{alert.timeframe}</td>
                <td className="p-3 text-gray-400 text-xs">{alert.createdAt.toLocaleDateString()}</td>
                <td className="p-3 text-right">
                  <button onClick={() => toggleAlert(alert.id)} className="text-blue-400 hover:text-blue-300 mr-2 text-xs">
                    {alert.isActive ? 'Pause' : 'Resume'}
                  </button>
                  <button onClick={() => deleteAlert(alert.id)} className="text-red-400 hover:text-red-300">
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Alerts;
