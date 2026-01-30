import { ArrowRight, TrendingDown, TrendingUp, Shield, FileText, ExternalLink } from 'lucide-react';

const AlternativeCard = ({ model, type, onAnalyze }) => {
  const renderTypeSpecificInfo = () => {
    switch (type) {
      case 'cheaper':
        return (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">VRAM Savings:</span>
              <span className="text-green-400 font-bold flex items-center gap-1">
                <TrendingDown className="w-4 h-4" />
                {model.savings.vram}%
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Cost Impact:</span>
              <span className="text-green-400 font-semibold text-xs">
                {model.savings.cost}
              </span>
            </div>
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded p-2 mt-2">
              <div className="text-xs text-yellow-400">
                ⚠️ {model.tradeoff}
              </div>
            </div>
          </div>
        );

      case 'better':
        return (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Quality Gain:</span>
              <span className="text-purple-400 font-bold flex items-center gap-1">
                <TrendingUp className="w-4 h-4" />
                {model.improvements.params}%
              </span>
            </div>
            <div className="bg-purple-500/10 border border-purple-500/30 rounded p-2">
              <div className="text-xs text-purple-400">
                ✨ {model.improvements.quality}
              </div>
            </div>
            <div className="flex items-center justify-between text-sm mt-2">
              <span className="text-gray-400">VRAM Increase:</span>
              <span className="text-orange-400 font-semibold">
                +{model.cost.additionalVRAM}GB ({model.cost.vramIncrease}%)
              </span>
            </div>
          </div>
        );

      case 'license':
        return (
          <div className="space-y-2">
            <div className="bg-green-500/10 border border-green-500/30 rounded p-3">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-4 h-4 text-green-400" />
                <span className="text-sm font-bold text-green-400">
                  {model.license.alternative}
                </span>
              </div>
              <div className="text-xs text-gray-300">
                {model.license.advantage}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <div className="text-gray-400">VRAM Diff:</div>
                <div className={`font-bold ${
                  parseFloat(model.comparison.vramDiff) > 0 ? 'text-orange-400' : 'text-green-400'
                }`}>
                  {model.comparison.vramDiff > 0 ? '+' : ''}{model.comparison.vramDiff}%
                </div>
              </div>
              <div>
                <div className="text-gray-400">Params Diff:</div>
                <div className={`font-bold ${
                  parseFloat(model.comparison.paramsDiff) > 0 ? 'text-green-400' : 'text-orange-400'
                }`}>
                  {model.comparison.paramsDiff > 0 ? '+' : ''}{model.comparison.paramsDiff}%
                </div>
              </div>
            </div>
          </div>
        );

      case 'context':
        return (
          <div className="space-y-2">
            <div className="bg-blue-500/10 border border-blue-500/30 rounded p-3">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-4 h-4 text-blue-400" />
                <span className="text-sm font-bold text-blue-400">
                  {model.contextImprovement.current} → {model.contextImprovement.alternative}
                </span>
              </div>
              <div className="text-xs text-gray-300 mb-1">
                {model.contextImprovement.multiplier} longer context
              </div>
              <div className="text-xs text-blue-400">
                {model.contextImprovement.advantage}
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">VRAM Increase:</span>
              <span className="text-orange-400 font-semibold">
                +{model.cost.additionalVRAM}GB ({model.cost.vramIncrease}%)
              </span>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-white/5 border border-white/10 hover:border-purple-500/50 rounded-xl p-5 transition-all hover:bg-white/10 group">
      {/* Model Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h4 className="text-lg font-bold text-white group-hover:text-purple-400 transition-colors mb-1">
            {model.modelId.split('/')[1] || model.modelId}
          </h4>
          <div className="text-xs text-gray-400">
            by {model.author}
          </div>
        </div>

        <a
          href={`https://huggingface.co/${model.modelId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          <ExternalLink className="w-4 h-4 text-gray-400 hover:text-purple-400" />
        </a>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-2 mb-4 text-xs">
        <div className="bg-black/20 rounded p-2 text-center">
          <div className="text-gray-400">VRAM</div>
          <div className="text-white font-bold">
            {model.vramEstimates?.fp16}GB
          </div>
        </div>
        <div className="bg-black/20 rounded p-2 text-center">
          <div className="text-gray-400">Size</div>
          <div className="text-white font-bold">
            {model.vramEstimates?.totalParams}B
          </div>
        </div>
        <div className="bg-black/20 rounded p-2 text-center">
          <div className="text-gray-400">Downloads</div>
          <div className="text-white font-bold">
            {(model.downloads / 1000000).toFixed(1)}M
          </div>
        </div>
      </div>

      {/* Type-Specific Info */}
      {renderTypeSpecificInfo()}

      {/* Analyze Button */}
      <button
        onClick={() => onAnalyze(model.modelId)}
        className="w-full mt-4 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-lg font-semibold text-white transition-all flex items-center justify-center gap-2 group"
      >
        <span>Analyze This Model</span>
        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </button>
    </div>
  );
};

export default AlternativeCard;