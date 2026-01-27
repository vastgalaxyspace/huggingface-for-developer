import { ArrowLeft, Layers } from 'lucide-react';
import ModelHeader from '../components/model/ModelHeader';
import QuickDecisionPanel from '../components/model/QuickDecisionPanel';
import ParameterCard from '../components/model/ParameterCard';
import CodeSnippets from '../components/model/CodeSnippets';
import HardwareRecommendations from '../components/model/HardwareRecommendations';
import FavoriteButton from '../components/common/FavoriteButton';
import CompareButton from '../components/common/CompareButton';
import { getParameterExplanation, getParametersByCategory } from '../utils/parameterExplanations';

const ModelDetailPage = ({ 
  modelData, 
  onBack,
  onAddToComparison,
  onRemoveFromComparison,
  isInComparison,
  canAddMore,
  onToggleFavorite,
  isFavorite
}) => {
  // Group parameters by category
  const categorizedParams = {};
  
  if (modelData.config) {
    Object.entries(modelData.config).forEach(([key, value]) => {
      const explanation = getParameterExplanation(key);
      const category = explanation.category || 'Other';
      
      if (!categorizedParams[category]) {
        categorizedParams[category] = [];
      }
      
      categorizedParams[category].push({
        key,
        value,
        explanation
      });
    });
  }

  // Category display order and colors
  const categoryConfig = {
    'Architecture': { icon: '🏗️', color: 'purple' },
    'Memory': { icon: '💾', color: 'blue' },
    'Performance': { icon: '⚡', color: 'cyan' },
    'Context': { icon: '📄', color: 'green' },
    'Tokenization': { icon: '🔤', color: 'yellow' },
    'Advanced': { icon: '⚙️', color: 'orange' },
    'Generation': { icon: '✨', color: 'pink' },
    'Technical': { icon: '🔧', color: 'gray' },
    'Optimization': { icon: '🚀', color: 'emerald' },
    'Other': { icon: '📦', color: 'slate' }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Back Button and Actions */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Search</span>
          </button>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <FavoriteButton
              isFavorite={isFavorite}
              onToggle={() => onToggleFavorite(modelData)}
              size="lg"
            />
            
            <CompareButton
              modelId={modelData.modelId}
              isInComparison={isInComparison}
              onAdd={onAddToComparison}
              onRemove={onRemoveFromComparison}
              disabled={!canAddMore && !isInComparison}
            />
          </div>
        </div>

        {/* Model Header */}
        <div className="mb-6">
          <ModelHeader modelData={modelData} />
        </div>

        {/* Quick Decision Panel */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <span>⚡</span>
            Quick Decision Panel
          </h2>
          <QuickDecisionPanel 
            licenseInfo={modelData.licenseInfo} 
            vramEstimates={modelData.vramEstimates} 
          />
        </div>
        {/* Code Snippets Section */}
<div className="mb-8">
  <CodeSnippets modelData={modelData} />
</div>

        {/* Hardware Recommendations */}
        <div className="mb-8">
          <HardwareRecommendations modelData={modelData} />
        </div>

        {/* Parameters by Category */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <Layers className="w-6 h-6 text-purple-400" />
            Model Parameters Explained
          </h2>
          
          <div className="space-y-8">
            {Object.entries(categorizedParams).map(([category, params]) => {
              const config = categoryConfig[category] || categoryConfig['Other'];
              
              return (
                <div key={category}>
                  {/* Category Header */}
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-3xl">{config.icon}</span>
                    <h3 className="text-xl font-bold text-white">
                      {category}
                    </h3>
                    <div className="flex-1 h-px bg-white/10"></div>
                    <span className="text-sm text-gray-400">
                      {params.length} {params.length === 1 ? 'parameter' : 'parameters'}
                    </span>
                  </div>

                  {/* Parameter Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {params.map((param) => (
                      <ParameterCard
                        key={param.key}
                        paramKey={param.key}
                        paramValue={param.value}
                        explanation={param.explanation}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Benchmarks (if available) */}
        {modelData.card?.benchmarks && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <span>📊</span>
              Benchmark Scores
            </h2>
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(modelData.card.benchmarks).map(([name, score]) => (
                  <div key={name} className="text-center">
                    <div className="text-3xl font-bold text-purple-400 mb-1">
                      {score}%
                    </div>
                    <div className="text-sm text-gray-400 uppercase">
                      {name}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Raw Config (Collapsible) */}
        <details className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden">
          <summary className="cursor-pointer p-4 hover:bg-white/5 transition-colors">
            <span className="font-semibold text-white">🔍 View Raw Configuration (Advanced)</span>
          </summary>
          <div className="p-4 border-t border-white/10">
            <pre className="text-xs text-gray-300 overflow-auto">
              {JSON.stringify(modelData.config, null, 2)}
            </pre>
          </div>
        </details>
      </div>
    </div>
  );
};

export default ModelDetailPage;