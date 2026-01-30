import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ZAxis } from 'recharts';
import { prepareVRAMQualityData, getLicenseColor } from '../../utils/chartDataUtils';

const VRAMQualityScatter = ({ models, onSelectModel }) => {
  const data = prepareVRAMQualityData(models);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-800/95 backdrop-blur-sm border border-white/20 rounded-lg p-3 shadow-xl">
          <p className="font-bold text-white mb-1">{data.name}</p>
          <p className="text-sm text-gray-300">VRAM: {data.vram}GB</p>
          <p className="text-sm text-gray-300">Quality: {data.quality}</p>
          <p className="text-sm text-gray-300">Size: {data.params}B params</p>
          <p className="text-sm text-gray-300">License: {data.license}</p>
        </div>
      );
    }
    return null;
  };

  // Group by license for multiple scatter series
  const commercialData = data.filter(d => d.license === 'Commercial');
  const conditionalData = data.filter(d => d.license === 'Conditional');
  const nonCommercialData = data.filter(d => d.license === 'Non-Commercial');

  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
      <div className="mb-4">
        <h3 className="text-xl font-bold text-white mb-2">
          VRAM vs Quality Analysis
        </h3>
        <p className="text-sm text-gray-400">
          Models positioned by hardware requirements and performance
        </p>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis 
            type="number" 
            dataKey="vram" 
            name="VRAM" 
            unit="GB"
            stroke="#9ca3af"
            label={{ value: 'VRAM (GB)', position: 'insideBottom', offset: -10, fill: '#9ca3af' }}
          />
          <YAxis 
            type="number" 
            dataKey="quality" 
            name="Quality" 
            stroke="#9ca3af"
            label={{ value: 'Quality Score', angle: -90, position: 'insideLeft', fill: '#9ca3af' }}
          />
          <ZAxis type="number" dataKey="params" range={[50, 400]} name="Parameters" unit="B" />
          <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />
          <Legend />
          
          {commercialData.length > 0 && (
            <Scatter 
              name="Commercial" 
              data={commercialData} 
              fill="#10b981"
              onClick={(data) => onSelectModel && onSelectModel(data.fullName)}
              style={{ cursor: 'pointer' }}
            />
          )}
          
          {conditionalData.length > 0 && (
            <Scatter 
              name="Conditional" 
              data={conditionalData} 
              fill="#eab308"
              onClick={(data) => onSelectModel && onSelectModel(data.fullName)}
              style={{ cursor: 'pointer' }}
            />
          )}
          
          {nonCommercialData.length > 0 && (
            <Scatter 
              name="Non-Commercial" 
              data={nonCommercialData} 
              fill="#ef4444"
              onClick={(data) => onSelectModel && onSelectModel(data.fullName)}
              style={{ cursor: 'pointer' }}
            />
          )}
        </ScatterChart>
      </ResponsiveContainer>

      <div className="mt-4 text-xs text-gray-400">
        💡 <strong>How to read:</strong> Top-left = Best value (low VRAM, high quality). 
        Bubble size = parameter count. Click any bubble to analyze that model.
      </div>
    </div>
  );
};

export default VRAMQualityScatter;