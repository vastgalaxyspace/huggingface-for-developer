import { X, ArrowRight } from 'lucide-react';

const ComparisonBar = ({ comparisonList, onRemove, onCompare, onClear }) => {
  if (comparisonList.length === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-purple-900 to-pink-900 border-t border-white/20 backdrop-blur-lg shadow-2xl z-50">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Selected Models */}
          <div className="flex items-center gap-4 flex-1">
            <span className="text-sm font-semibold text-white">
              Compare Models ({comparisonList.length}/3)
            </span>
            
            <div className="flex gap-2 flex-wrap">
              {comparisonList.map((modelId) => (
                <div
                  key={modelId}
                  className="flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-lg border border-white/20"
                >
                  <span className="text-sm text-white truncate max-w-[200px]">
                    {modelId.split('/')[1] || modelId}
                  </span>
                  <button
                    onClick={() => onRemove(modelId)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={onClear}
              className="px-4 py-2 text-sm text-gray-300 hover:text-white transition-colors"
            >
              Clear All
            </button>
            
            <button
              onClick={onCompare}
              disabled={comparisonList.length < 2}
              className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>Compare Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComparisonBar;