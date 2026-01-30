import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { prepareContextComparisonData } from '../../utils/chartDataUtils';

const ContextComparisonBar = ({ models, onSelectModel }) => {
  const data = prepareContextComparisonData(models);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-800/95 backdrop-blur-sm border border-white/20 rounded-lg p-3 shadow-xl">
          <p className="font-bold text-white mb-1">{data.name}</p>
          <p className="text-sm text-gray-300">Context: {data.contextK} tokens</p>
          <p className="text-sm text-gray-300">VRAM: {data.vram}GB</p>
        </div>
      );
    }
    return null;
  };

  const getBarColor = (context) => {
    if (context >= 32768) return '#10b981'; // green
    if (context >= 16384) return '#3b82f6'; // blue
    if (context >= 8192) return '#eab308';  // yellow
    return '#ef4444'; // red
  };

  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
      <div className="mb-4">
        <h3 className="text-xl font-bold text-white mb-2">
          Context Length Comparison
        </h3>
        <p className="text-sm text-gray-400">
          Maximum token capacity for each model
        </p>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <BarChart 
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis 
            dataKey="name" 
            stroke="#9ca3af"
            angle={-45}
            textAnchor="end"
            height={100}
            interval={0}
            tick={{ fontSize: 11 }}
          />
          <YAxis 
            stroke="#9ca3af"
            label={{ value: 'Context Length (tokens)', angle: -90, position: 'insideLeft', fill: '#9ca3af' }}
            tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar 
            dataKey="context" 
            onClick={(data) => onSelectModel && onSelectModel(data.fullName)}
            style={{ cursor: 'pointer' }}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getBarColor(entry.context)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div className="mt-4 flex justify-center gap-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500 rounded"></div>
          <span className="text-gray-400">&lt; 8k</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-yellow-500 rounded"></div>
          <span className="text-gray-400">8k - 16k</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-500 rounded"></div>
          <span className="text-gray-400">16k - 32k</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded"></div>
          <span className="text-gray-400">&gt; 32k</span>
        </div>
      </div>
    </div>
  );
};

export default ContextComparisonBar;