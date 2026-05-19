import React from 'react';
import { useMarketStore } from '../../store/marketStore';

const MaxPainChart: React.FC = () => {
  const { allQuotes } = useMarketStore();
  
  // Mock Max Pain calculation for NIFTY
  const strikes = Array.from({ length: 20 }, (_, i) => 22000 + i * 100);
  const painData = strikes.map(strike => {
    let totalPain = 0;
    // Calculate pain for each strike (simplified)
    strikes.forEach(s => {
      const calls = Math.max(0, s - strike) * 1000; // Mock OI
      const puts = Math.max(0, strike - s) * 800; // Mock OI
      totalPain += calls + puts;
    });
    return { strike, pain: totalPain };
  });

  const maxPain = painData.reduce((min, curr) => curr.pain < min.pain ? curr : min);
  const maxPainValue = Math.max(...painData.map(d => d.pain));

  return (
    <div className="bg-gray-900 text-white p-4 h-full flex flex-col">
      <h2 className="text-lg font-semibold mb-4">Max Pain Analysis</h2>
      <div className="mb-4 p-3 bg-gray-800 rounded">
        <div className="text-sm text-gray-400">Max Pain Level</div>
        <div className="text-2xl font-bold text-yellow-400">{maxPain.strike}</div>
        <div className="text-xs text-gray-400 mt-1">
          Below this level: Put writers profit | Above: Call writers profit
        </div>
      </div>
      <div className="flex-1 flex items-end space-x-1 overflow-x-auto pb-2">
        {painData.map((d) => (
          <div key={d.strike} className="flex flex-col items-center flex-shrink-0" style={{ width: '30px' }}>
            <div
              className="w-full rounded-t"
              style={{
                height: `${(d.pain / maxPainValue) * 150}px`,
                backgroundColor: d.strike === maxPain.strike ? '#eab308' : '#3b82f6',
                minHeight: '2px'
              }}
              title={`Strike: ${d.strike}, Pain: ${d.pain.toFixed(0)}`}
            />
            <div className="text-xs text-gray-500 mt-1 transform -rotate-45 origin-center">
              {d.strike}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 text-xs text-gray-400">
        <p>• Max Pain shows the strike price where option writers have minimum loss</p>
        <p>• NIFTY typically gravitates toward Max Pain near expiry</p>
        <p>• Used for directional bias in F&O trading</p>
      </div>
    </div>
  );
};

export default MaxPainChart;
