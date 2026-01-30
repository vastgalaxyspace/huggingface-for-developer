import { useState } from 'react';
import { ArrowLeft, BarChart3, Table } from 'lucide-react';
import { useModelData } from '../hooks/useModelData';
import ComparisonTable from '../components/comparison/ComparisonTable';
import VisualComparison from '../components/charts/VisualComparison';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorDisplay from '../components/common/ErrorDisplay';

const ComparisonPage = ({ modelIds, onBack }) => {
  const [viewMode, setViewMode] = useState('visual'); // 'visual' | 'table'
  
  // Fetch data for all models
  const model1 = useModelData(modelIds[0]);
  const model2 = useModelData(modelIds[1]);
  const model3 = useModelData(modelIds[2] || null);

  const allLoaded = !model1.loading && !model2.loading && (!modelIds[2] || !model3.loading);
  const hasError = model1.error || model2.error || model3.error;
  
  const loadedModels = [
    model1.data,
    model2.data,
    model3.data
  ].filter(Boolean);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-300 hover:text-white mb-6 transition-colors group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Search</span>
          </button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                Model Comparison
              </h1>
              <p className="text-gray-400">
                Comparing {modelIds.length} models side-by-side
              </p>
            </div>

            {/* View Toggle */}
            {allLoaded && !hasError && (
              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode('visual')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
                    viewMode === 'visual'
                      ? 'bg-purple-500/30 border-purple-500/50 text-white'
                      : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                  }`}
                >
                  <BarChart3 className="w-4 h-4" />
                  <span className="font-semibold">Visual</span>
                </button>
                
                <button
                  onClick={() => setViewMode('table')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
                    viewMode === 'table'
                      ? 'bg-purple-500/30 border-purple-500/50 text-white'
                      : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                  }`}
                >
                  <Table className="w-4 h-4" />
                  <span className="font-semibold">Table</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Loading State */}
        {!allLoaded && !hasError && (
          <div className="space-y-4">
            {modelIds.map((id, idx) => (
              <div key={id} className="bg-white/5 border border-white/10 rounded-xl p-6">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-gray-300">
                    Loading {id}...
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {hasError && (
          <div className="space-y-4">
            {model1.error && <ErrorDisplay error={model1.error} />}
            {model2.error && <ErrorDisplay error={model2.error} />}
            {model3.error && <ErrorDisplay error={model3.error} />}
          </div>
        )}

        {/* Visual Comparison */}
        {allLoaded && !hasError && loadedModels.length >= 2 && viewMode === 'visual' && (
          <div>
            <VisualComparison 
              models={loadedModels}
              onSelectModel={(modelId) => {
                console.log('Navigate to:', modelId);
                // Could add navigation here
              }}
            />
          </div>
        )}

        {/* Table Comparison */}
        {allLoaded && !hasError && loadedModels.length >= 2 && viewMode === 'table' && (
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden">
            <ComparisonTable models={loadedModels} />
          </div>
        )}

        {/* Recommendation Section */}
        {allLoaded && !hasError && loadedModels.length >= 2 && (
          <div className="mt-8 bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
            <h2 className="text-2xl font-bold text-white mb-4">
              💡 Quick Recommendation
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="bg-black/20 rounded-lg p-4">
                <div className="text-gray-400 mb-2">Best for Production</div>
                <div className="text-white font-semibold">
                  {getBestForProduction(loadedModels)}
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  Commercial license + high adoption
                </div>
              </div>
              <div className="bg-black/20 rounded-lg p-4">
                <div className="text-gray-400 mb-2">Most Efficient</div>
                <div className="text-white font-semibold">
                  {getMostEfficient(loadedModels)}
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  Best quality per GB VRAM
                </div>
              </div>
              <div className="bg-black/20 rounded-lg p-4">
                <div className="text-gray-400 mb-2">Longest Context</div>
                <div className="text-white font-semibold">
                  {getLongestContext(loadedModels)}
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  Maximum context window
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Helper functions for recommendations
const getBestForProduction = (models) => {
  const commercial = models.filter(m => m.licenseInfo?.commercial === true);
  if (commercial.length === 0) return 'None (check licenses)';
  
  // Sort by downloads
  const sorted = commercial.sort((a, b) => (b.downloads || 0) - (a.downloads || 0));
  return sorted[0].modelId.split('/')[1];
};

const getMostEfficient = (models) => {
  const sorted = [...models].sort((a, b) => {
    const effA = parseFloat(a.vramEstimates?.totalParams || 0) / parseFloat(a.vramEstimates?.fp16 || 1);
    const effB = parseFloat(b.vramEstimates?.totalParams || 0) / parseFloat(b.vramEstimates?.fp16 || 1);
    return effB - effA;
  });
  return sorted[0].modelId.split('/')[1];
};

const getLongestContext = (models) => {
  const sorted = [...models].sort((a, b) => {
    const ctxA = a.config?.max_position_embeddings || 0;
    const ctxB = b.config?.max_position_embeddings || 0;
    return ctxB - ctxA;
  });
  return sorted[0].modelId.split('/')[1];
};

export default ComparisonPage;