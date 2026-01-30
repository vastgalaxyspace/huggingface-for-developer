import { useState } from 'react';
import { Grid, Download, TrendingUp } from 'lucide-react';

const DecisionMatrix = ({ models }) => {
  const [criteria, setCriteria] = useState({
    cost: { weight: 8, label: 'Cost Efficiency' },
    speed: { weight: 7, label: 'Inference Speed' },
    quality: { weight: 9, label: 'Quality/Accuracy' },
    license: { weight: 10, label: 'License' },
    support: { weight: 6, label: 'Community Support' }
  });

  if (!models || models.length < 2) {
    return (
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 text-center">
        <Grid className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">
          Decision Matrix
        </h3>
        <p className="text-gray-400">
          Add 2+ models to comparison to use the decision matrix
        </p>
      </div>
    );
  }

  const updateWeight = (criterionKey, weight) => {
    setCriteria(prev => ({
      ...prev,
      [criterionKey]: { ...prev[criterionKey], weight: parseInt(weight) }
    }));
  };

  // Score each model
  const scoredModels = models.map(model => {
    const scores = {
      cost: scoreCost(model),
      speed: scoreSpeed(model),
      quality: scoreQuality(model),
      license: scoreLicense(model),
      support: scoreSupport(model)
    };

    const weightedScore = Object.entries(scores).reduce((total, [key, score]) => {
      return total + (score * criteria[key].weight);
    }, 0);

    const maxPossibleScore = Object.values(criteria).reduce((sum, c) => sum + c.weight * 10, 0);
    const percentage = (weightedScore / maxPossibleScore) * 100;

    return {
      ...model,
      scores,
      weightedScore,
      percentage: Math.round(percentage)
    };
  }).sort((a, b) => b.weightedScore - a.weightedScore);

  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="border-b border-white/10 p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Grid className="w-6 h-6 text-purple-400" />
              <h2 className="text-2xl font-bold text-white">
                Decision Matrix
              </h2>
            </div>
            <p className="text-gray-400">
              Weighted scoring to help you make the best choice
            </p>
          </div>

          <button
            onClick={() => exportMatrix(scoredModels, criteria)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 rounded-lg text-purple-400 transition-all"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Criteria Weights */}
      <div className="border-b border-white/10 p-6 bg-black/20">
        <h3 className="font-semibold text-white mb-4">
          🎯 Adjust Criteria Importance (1-10):
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {Object.entries(criteria).map(([key, criterion]) => (
            <div key={key}>
              <label className="block text-sm text-gray-400 mb-2">
                {criterion.label}
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={criterion.weight}
                onChange={(e) => updateWeight(key, e.target.value)}
                className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-purple-500 mb-1"
              />
              <div className="text-center text-2xl font-bold text-purple-400">
                {criterion.weight}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Results */}
      <div className="p-6">
        <h3 className="font-semibold text-white mb-4">
          🏆 Ranked Results:
        </h3>

        <div className="space-y-4">
          {scoredModels.map((model, index) => (
            <div
              key={model.modelId}
              className={`relative bg-gradient-to-r rounded-xl p-5 border-2 ${
                index === 0
                  ? 'from-yellow-500/20 to-orange-500/20 border-yellow-500/50'
                  : 'from-white/5 to-white/10 border-white/10'
              }`}
            >
              {index === 0 && (
                <div className="absolute -top-3 -right-3 w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center text-2xl">
                  👑
                </div>
              )}

              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-white">
                        {model.modelId.split('/')[1] || model.modelId}
                      </h4>
                      <div className="text-sm text-gray-400">
                        by {model.author}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-4xl font-bold text-purple-400">
                    {model.percentage}
                  </div>
                  <div className="text-xs text-gray-400">Overall Score</div>
                </div>
              </div>

              {/* Score Breakdown */}
              <div className="grid grid-cols-5 gap-2 text-sm">
                {Object.entries(model.scores).map(([key, score]) => (
                  <div key={key} className="text-center">
                    <div className="text-gray-400 text-xs mb-1">
                      {criteria[key].label.split(' ')[0]}
                    </div>
                    <div className={`font-bold ${
                      score >= 8 ? 'text-green-400' :
                      score >= 6 ? 'text-yellow-400' :
                      'text-red-400'
                    }`}>
                      {score}/10
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Scoring functions (0-10 scale)
const scoreCost = (model) => {
  const vram = parseFloat(model.vramEstimates?.fp16 || 999);
  if (vram <= 8) return 10;
  if (vram <= 16) return 8;
  if (vram <= 24) return 6;
  if (vram <= 40) return 4;
  return 2;
};

const scoreSpeed = (model) => {
  const vram = parseFloat(model.vramEstimates?.fp16 || 999);
  const hasGQA = model.config?.num_key_value_heads < model.config?.num_attention_heads;
  let score = 10 - (vram / 10);
  if (hasGQA) score += 2;
  return Math.min(10, Math.max(0, Math.round(score)));
};

const scoreQuality = (model) => {
  const params = parseFloat(model.vramEstimates?.totalParams || 0);
  if (params >= 70) return 10;
  if (params >= 30) return 9;
  if (params >= 13) return 8;
  if (params >= 7) return 7;
  return 5;
};

const scoreLicense = (model) => {
  if (model.licenseInfo?.commercial === true) return 10;
  if (model.licenseInfo?.commercial === 'conditional') return 6;
  if (model.licenseInfo?.commercial === false) return 2;
  return 5;
};

const scoreSupport = (model) => {
  const downloads = model.downloads || 0;
  if (downloads >= 5000000) return 10;
  if (downloads >= 1000000) return 8;
  if (downloads >= 500000) return 6;
  if (downloads >= 100000) return 4;
  return 2;
};

// Export function
const exportMatrix = (models, criteria) => {
  const csv = [
    ['Rank', 'Model', 'Overall Score', ...Object.values(criteria).map(c => c.label)],
    ...models.map((model, index) => [
      index + 1,
      model.modelId,
      model.percentage + '%',
      ...Object.values(model.scores)
    ])
  ].map(row => row.join(',')).join('\n');

  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'model-decision-matrix.csv';
  a.click();
  URL.revokeObjectURL(url);
};

export default DecisionMatrix;