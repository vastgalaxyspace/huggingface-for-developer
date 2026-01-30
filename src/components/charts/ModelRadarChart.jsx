import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, ResponsiveContainer, Tooltip } from 'recharts';
import { prepareRadarData, getModelColors } from '../../utils/chartDataUtils';

const ModelRadarChart = ({ models }) => {
  if (!models || models.length === 0) {
    return (
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
        <p className="text-center text-gray-400">Select models to compare</p>
      </div>
    );
  }

  const data = prepareRadarData(models.slice(0, 3)); // Max 3 models
  const colors = getModelColors();

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-800/95 backdrop-blur-sm border border-white/20 rounded-lg p-3 shadow-xl">
          <p className="font-bold text-white mb-2">{payload[0].payload.metric}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value}/100
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
      <div className="mb-4">
        <h3 className="text-xl font-bold text-white mb-2">
          Multi-Dimensional Comparison
        </h3>
        <p className="text-sm text-gray-400">
          Five key metrics compared across models
        </p>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <RadarChart data={data}>
          <PolarGrid stroke="rgba(255,255,255,0.2)" />
          <PolarAngleAxis 
            dataKey="metric" 
            tick={{ fill: '#9ca3af', fontSize: 12 }}
          />
          <PolarRadiusAxis 
            angle={90} 
            domain={[0, 100]}
            tick={{ fill: '#9ca3af', fontSize: 10 }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          
          {models.slice(0, 3).map((model, index) => {
            const modelName = model.modelId.split('/')[1] || model.modelId;
            return (
              <Radar
                key={modelName}
                name={modelName}
                dataKey={modelName}
                stroke={colors[index]}
                fill={colors[index]}
                fillOpacity={0.3}
                strokeWidth={2}
              />
            );
          })}
        </RadarChart>
      </ResponsiveContainer>

      <div className="mt-4 grid grid-cols-5 gap-2 text-xs">
        <div className="text-center">
          <div className="text-purple-400 font-semibold">Quality</div>
          <div className="text-gray-400">Parameter count</div>
        </div>
        <div className="text-center">
          <div className="text-pink-400 font-semibold">Speed</div>
          <div className="text-gray-400">Inference time</div>
        </div>
        <div className="text-center">
          <div className="text-cyan-400 font-semibold">Efficiency</div>
          <div className="text-gray-400">Quality/VRAM</div>
        </div>
        <div className="text-center">
          <div className="text-green-400 font-semibold">Context</div>
          <div className="text-gray-400">Window size</div>
        </div>
        <div className="text-center">
          <div className="text-yellow-400 font-semibold">Support</div>
          <div className="text-gray-400">Downloads</div>
        </div>
      </div>
    </div>
  );
};

export default ModelRadarChart;