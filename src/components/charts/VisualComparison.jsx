import { useState } from 'react';
import { BarChart3, ScatterChart as ScatterIcon, RadarIcon } from 'lucide-react';
import VRAMQualityScatter from './VRAMQualityScatter';
import ModelRadarChart from './ModelRadarChart';
import ContextComparisonBar from './ContextComparisonBar';

const VisualComparison = ({ models, onSelectModel }) => {
  const [activeChart, setActiveChart] = useState('scatter');

  const charts = [
    { id: 'scatter', label: 'VRAM vs Quality', icon: ScatterIcon, component: VRAMQualityScatter },
    { id: 'radar', label: 'Multi-Dimensional', icon: RadarIcon, component: ModelRadarChart },
    { id: 'context', label: 'Context Length', icon: BarChart3, component: ContextComparisonBar }
  ];

  const ActiveComponent = charts.find(c => c.id === activeChart)?.component;

  return (
    <div className="space-y-4">
      {/* Chart Selector */}
      <div className="flex gap-2 flex-wrap">
        {charts.map((chart) => {
          const Icon = chart.icon;
          return (
            <button
              key={chart.id}
              onClick={() => setActiveChart(chart.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
                activeChart === chart.id
                  ? 'bg-purple-500/30 border-purple-500/50 text-white'
                  : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="font-semibold text-sm">{chart.label}</span>
            </button>
          );
        })}
      </div>

      {/* Active Chart */}
      {ActiveComponent && (
        <ActiveComponent 
          models={models} 
          onSelectModel={onSelectModel}
        />
      )}
    </div>
  );
};

export default VisualComparison;