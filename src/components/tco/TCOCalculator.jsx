import { useState } from 'react';
import { DollarSign, TrendingUp, AlertCircle, Info } from 'lucide-react';
import { calculateTCO, formatCurrency } from '../../utils/tcoCalculator';

const TCOCalculator = ({ modelData }) => {
  const [usage, setUsage] = useState({
    tokensPerMonth: 1000000,
    hoursPerDay: 24,
    daysPerMonth: 30,
    monthlyActiveUsers: 10000
  });

  const tco = calculateTCO(modelData, usage);

  const updateUsage = (key, value) => {
    setUsage(prev => ({ ...prev, [key]: parseInt(value) || 0 }));
  };

  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="border-b border-white/10 p-6">
        <div className="flex items-center gap-3 mb-2">
          <DollarSign className="w-6 h-6 text-green-400" />
          <h2 className="text-2xl font-bold text-white">
            Total Cost of Ownership Calculator
          </h2>
        </div>
        <p className="text-gray-400">
          Compare costs across different deployment options over 3 years
        </p>
      </div>

      {/* Usage Parameters */}
      <div className="border-b border-white/10 p-6 bg-black/20">
        <h3 className="text-lg font-bold text-white mb-4">
          📊 Your Usage Profile
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Tokens per Month */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              Monthly Token Usage
            </label>
            <input
              type="range"
              min="100000"
              max="100000000"
              step="100000"
              value={usage.tokensPerMonth}
              onChange={(e) => updateUsage('tokensPerMonth', e.target.value)}
              className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-purple-500 mb-2"
            />
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">100K</span>
              <span className="text-purple-400 font-bold">
                {(usage.tokensPerMonth / 1000000).toFixed(1)}M tokens/mo
              </span>
              <span className="text-gray-400">100M</span>
            </div>
          </div>

          {/* Hours per Day */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              Hours per Day (Cloud GPU)
            </label>
            <input
              type="range"
              min="1"
              max="24"
              step="1"
              value={usage.hoursPerDay}
              onChange={(e) => updateUsage('hoursPerDay', e.target.value)}
              className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-purple-500 mb-2"
            />
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">1hr</span>
              <span className="text-purple-400 font-bold">
                {usage.hoursPerDay} hours/day
              </span>
              <span className="text-gray-400">24hr</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3-Year Comparison */}
      <div className="p-6">
        <h3 className="text-lg font-bold text-white mb-4">
          💰 3-Year Total Cost Comparison
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* API */}
          <CostCard
            title="API Services"
            icon="🌐"
            yearOne={tco.comparison.yearOne.api}
            yearTwo={tco.comparison.yearTwo.api}
            yearThree={tco.comparison.yearThree.api}
            total={tco.comparison.threeYearTotal.api}
            color="blue"
            pros={['No setup', 'Auto-scaling', 'No maintenance']}
            cons={['Recurring costs', 'Vendor lock-in']}
          />

          {/* Cloud GPU */}
          <CostCard
            title="Cloud GPU"
            icon="☁️"
            yearOne={tco.comparison.yearOne.cloudGPU}
            yearTwo={tco.comparison.yearTwo.cloudGPU}
            yearThree={tco.comparison.yearThree.cloudGPU}
            total={tco.comparison.threeYearTotal.cloudGPU}
            color="purple"
            pros={['Full control', 'Predictable', 'Scalable']}
            cons={['DevOps needed', 'Fixed costs']}
            recommended={tco.comparison.threeYearTotal.cloudGPU < tco.comparison.threeYearTotal.api}
          />

          {/* Self-Hosted */}
          <CostCard
            title="Self-Hosted"
            icon="🏢"
            yearOne={tco.comparison.yearOne.selfHosted}
            yearTwo={tco.comparison.yearTwo.selfHosted}
            yearThree={tco.comparison.yearThree.selfHosted}
            total={tco.comparison.threeYearTotal.selfHosted}
            color="green"
            pros={['One-time cost', 'Full ownership', 'Privacy']}
            cons={['High upfront', 'Maintenance', 'Hardware risk']}
            recommended={tco.comparison.threeYearTotal.selfHosted < tco.comparison.threeYearTotal.cloudGPU}
          />
        </div>

        {/* Break-Even Analysis */}
        <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-xl p-5 mb-6">
          <h4 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-yellow-400" />
            Break-Even Analysis
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-gray-400 mb-1">Self-Hosted vs API:</div>
              <div className="text-white font-bold">
                {tco.breakEven.selfHostedVsAPI.months} months
              </div>
              <div className="text-xs text-gray-400 mt-1">
                {tco.breakEven.selfHostedVsAPI.note}
              </div>
            </div>
            
            <div>
              <div className="text-gray-400 mb-1">Self-Hosted vs Cloud GPU:</div>
              <div className="text-white font-bold">
                {tco.breakEven.selfHostedVsCloud.months} months
              </div>
              <div className="text-xs text-gray-400 mt-1">
                {tco.breakEven.selfHostedVsCloud.note}
              </div>
            </div>
          </div>
        </div>

        {/* Recommendations */}
        <div className="space-y-3">
          <h4 className="text-lg font-bold text-white">💡 Recommendations</h4>
          {tco.recommendations.map((rec, idx) => {
            const icons = {
              success: <Info className="w-5 h-5 text-green-400" />,
              info: <Info className="w-5 h-5 text-blue-400" />,
              warning: <AlertCircle className="w-5 h-5 text-yellow-400" />
            };

            return (
              <div
                key={idx}
                className={`flex items-start gap-3 p-4 rounded-lg border ${
                  rec.type === 'success' ? 'bg-green-500/10 border-green-500/30' :
                  rec.type === 'warning' ? 'bg-yellow-500/10 border-yellow-500/30' :
                  'bg-blue-500/10 border-blue-500/30'
                }`}
              >
                {icons[rec.type]}
                <div className="flex-1">
                  <div className="font-semibold text-white mb-1">
                    {rec.message}
                  </div>
                  <div className="text-sm text-gray-300">
                    {rec.reason}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Cost Card Component
const CostCard = ({ title, icon, yearOne, yearTwo, yearThree, total, color, pros, cons, recommended }) => {
  const colorClasses = {
    blue: 'from-blue-500/20 to-cyan-500/20 border-blue-500/30',
    purple: 'from-purple-500/20 to-pink-500/20 border-purple-500/30',
    green: 'from-green-500/20 to-emerald-500/20 border-green-500/30'
  };

  return (
    <div className={`relative bg-gradient-to-br ${colorClasses[color]} border rounded-xl p-5`}>
      {recommended && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full">
          ⭐ Best Value
        </div>
      )}
      
      <div className="text-center mb-4">
        <div className="text-4xl mb-2">{icon}</div>
        <h4 className="text-lg font-bold text-white">{title}</h4>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Year 1:</span>
          <span className="text-white font-bold">{formatCurrency(yearOne)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Year 2:</span>
          <span className="text-white font-bold">{formatCurrency(yearTwo)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Year 3:</span>
          <span className="text-white font-bold">{formatCurrency(yearThree)}</span>
        </div>
        <div className="border-t border-white/20 pt-2 mt-2">
          <div className="flex justify-between">
            <span className="text-white font-bold">3-Year Total:</span>
            <span className="text-white font-bold text-lg">{formatCurrency(total)}</span>
          </div>
        </div>
      </div>

      <div className="space-y-2 text-xs">
        <div>
          <div className="text-green-400 font-semibold mb-1">Pros:</div>
          {pros.map((pro, idx) => (
            <div key={idx} className="text-gray-300">• {pro}</div>
          ))}
        </div>
        <div>
          <div className="text-red-400 font-semibold mb-1">Cons:</div>
          {cons.map((con, idx) => (
            <div key={idx} className="text-gray-300">• {con}</div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TCOCalculator;