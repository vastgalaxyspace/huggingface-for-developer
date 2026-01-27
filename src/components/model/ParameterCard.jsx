import { Info, Zap, AlertTriangle } from 'lucide-react';
import * as Icons from 'lucide-react';

const ParameterCard = ({ paramKey, paramValue, explanation }) => {
  // Get the icon component dynamically
  const IconComponent = Icons[explanation.icon] || Info;

  const getImportanceColor = (importance) => {
    switch (importance) {
      case 'critical': return 'border-red-500/30 bg-red-500/10';
      case 'high': return 'border-yellow-500/30 bg-yellow-500/10';
      case 'medium': return 'border-blue-500/30 bg-blue-500/10';
      default: return 'border-gray-500/30 bg-gray-500/10';
    }
  };

  const formatValue = (value) => {
    if (value === null || value === undefined) return 'Not specified';
    if (typeof value === 'object') return JSON.stringify(value, null, 2);
    if (typeof value === 'boolean') return value ? 'Enabled' : 'Disabled';
    if (typeof value === 'number') return value.toLocaleString();
    return value;
  };

  return (
    <div className={`${getImportanceColor(explanation.importance)} border backdrop-blur-sm rounded-xl p-5 transition-all hover:scale-[1.02]`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg bg-${explanation.color}-500/20 flex items-center justify-center`}>
            <IconComponent className={`w-5 h-5 text-${explanation.color}-400`} />
          </div>
          <div>
            <h3 className="font-semibold text-white text-lg">
              {explanation.label}
            </h3>
            <div className="text-xs text-gray-400 font-mono">
              {paramKey}
            </div>
          </div>
        </div>
        
        {explanation.importance === 'critical' && (
          <div className="flex items-center gap-1 px-2 py-1 bg-red-500/20 rounded-lg text-red-400 text-xs font-semibold">
            <AlertTriangle className="w-3 h-3" />
            Critical
          </div>
        )}
      </div>

      {/* Value */}
      <div className="mb-3 p-3 bg-black/20 rounded-lg">
        <div className="text-xs text-gray-400 mb-1">Current Value</div>
        <div className="text-xl font-bold text-white font-mono">
          {formatValue(paramValue)}
        </div>
      </div>

      {/* Explanation */}
      <div className="space-y-3 text-sm">
        <div>
          <div className="text-gray-400 mb-1">What this means:</div>
          <div className="text-gray-200">{explanation.explanation}</div>
        </div>

        <div>
          <div className="text-gray-400 mb-1 flex items-center gap-1">
            <Zap className="w-3 h-3" />
            Why developers care:
          </div>
          <div className="text-gray-200">{explanation.devNote}</div>
        </div>

        {explanation.impact && (
          <div className="flex items-center gap-2 px-3 py-2 bg-white/5 rounded-lg">
            <div className="text-gray-400 text-xs">Impacts:</div>
            <div className={`text-${explanation.color}-400 font-semibold text-xs`}>
              {explanation.impact}
            </div>
          </div>
        )}

        {explanation.example && (
          <div className="pt-3 border-t border-white/10">
            <div className="text-gray-400 mb-1 text-xs">Example:</div>
            <div className="text-gray-300 text-xs italic">
              {explanation.example}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ParameterCard;