import { Star, Zap, Shield, Database, CheckCircle, ArrowRight, ExternalLink } from 'lucide-react';
import { generateExplanation } from '../../utils/recommenderEngine';

const WizardStepResults = ({ recommendations, onSelectModel, onStartOver }) => {
  if (!recommendations || recommendations.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">😔</div>
        <h2 className="text-2xl font-bold text-white mb-3">
          No Models Match Your Requirements
        </h2>
        <p className="text-gray-400 mb-6">
          Try relaxing your constraints (increase VRAM budget or remove context requirements)
        </p>
        <button
          onClick={onStartOver}
          className="px-6 py-3 bg-purple-500 hover:bg-purple-600 rounded-lg font-semibold transition-colors"
        >
          Adjust Requirements
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <div className="text-6xl mb-4">🎯</div>
        <h2 className="text-3xl font-bold text-white mb-3">
          Your Perfect Matches!
        </h2>
        <p className="text-gray-400">
          We found {recommendations.length} models that fit your requirements
        </p>
      </div>

      {/* Recommendations */}
      <div className="space-y-6">
        {recommendations.map((model, index) => {
          const rank = index + 1;
          const rec = model.recommendation;
          const explanation = generateExplanation(model, rank);
          
          return (
            <div
              key={model.modelId}
              className={`relative bg-gradient-to-br rounded-2xl p-6 border-2 ${
                rank === 1
                  ? 'from-yellow-500/20 to-orange-500/20 border-yellow-500/50'
                  : rank === 2
                  ? 'from-gray-400/20 to-gray-500/20 border-gray-400/50'
                  : 'from-orange-600/20 to-red-600/20 border-orange-600/50'
              }`}
            >
              {/* Rank Badge */}
              <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-2xl font-bold shadow-lg">
                {rank === 1 ? '🥇' : rank === 2 ? '🥈' : '🥉'}
              </div>

              {/* Model Info */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-white mb-2">
                    {model.modelId}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-gray-400 mb-3">
                    <span>by {model.author}</span>
                    <span>•</span>
                    <span>{model.vramEstimates?.totalParams}B params</span>
                  </div>
                </div>

                {/* Score Badge */}
                <div className="text-center bg-purple-500/30 rounded-xl px-4 py-2 border border-purple-500/50">
                  <div className="text-3xl font-bold text-white">
                    {rec.score}
                  </div>
                  <div className="text-xs text-gray-400">Score</div>
                </div>
              </div>

              {/* Explanation */}
              <div className="bg-black/20 rounded-lg p-4 mb-4">
                <p className="text-white">{explanation}</p>
              </div>

              {/* Score Breakdown */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                <ScoreCard
                  icon={<Star className="w-4 h-4" />}
                  label="Quality"
                  score={rec.scores.quality}
                />
                <ScoreCard
                  icon={<Zap className="w-4 h-4" />}
                  label="Speed"
                  score={rec.scores.speed}
                />
                <ScoreCard
                  icon={<Database className="w-4 h-4" />}
                  label="Context"
                  score={rec.scores.context}
                />
                <ScoreCard
                  icon={<Shield className="w-4 h-4" />}
                  label="Cost"
                  score={rec.scores.cost}
                />
              </div>

              {/* Key Highlights */}
              <div className="bg-black/20 rounded-lg p-4 mb-4">
                <div className="text-sm font-semibold text-white mb-2">
                  ✨ Key Highlights:
                </div>
                <div className="flex flex-wrap gap-2">
                  {rec.reasons.map((reason, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-green-500/20 text-green-400 rounded-lg text-xs border border-green-500/30"
                    >
                      <CheckCircle className="w-3 h-3 inline mr-1" />
                      {reason}
                    </span>
                  ))}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
                <div>
                  <div className="text-gray-400">VRAM</div>
                  <div className="text-white font-semibold">
                    {model.vramEstimates?.fp16}GB
                  </div>
                </div>
                <div>
                  <div className="text-gray-400">Context</div>
                  <div className="text-white font-semibold">
                    {(model.config?.max_position_embeddings / 1000).toFixed(0)}k
                  </div>
                </div>
                <div>
                  <div className="text-gray-400">License</div>
                  <div className="text-white font-semibold">
                    {model.licenseInfo?.name?.split(' ')[0] || 'N/A'}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => onSelectModel(model.modelId)}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all"
                >
                  <span>Analyze in Detail</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <a
                
                  href={`https://huggingface.co/${model.modelId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-3 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                  title="View on HuggingFace"
                >
                  <ExternalLink className="w-5 h-5" />
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {/* Start Over */}
      <div className="text-center pt-6">
        <button
          onClick={onStartOver}
          className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-lg font-semibold transition-colors"
        >
          🔄 Try Different Requirements
        </button>
      </div>
    </div>
  );
};

// Score Card Component
const ScoreCard = ({ icon, label, score }) => {
  const getColor = (score) => {
    if (score >= 80) return 'text-green-400 bg-green-500/20 border-green-500/30';
    if (score >= 60) return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
    return 'text-red-400 bg-red-500/20 border-red-500/30';
  };

  return (
    <div className={`${getColor(score)} rounded-lg p-3 border`}>
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <span className="text-xs font-semibold">{label}</span>
      </div>
      <div className="text-2xl font-bold">{score}</div>
    </div>
  );
};

export default WizardStepResults;