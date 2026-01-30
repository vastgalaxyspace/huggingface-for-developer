import { useState } from 'react';
import { Shield, TrendingUp, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import ScoreGauge from './ScoreGauge';
import ScoreBreakdown from './ScoreBreakdown';
import { calculateDeploymentScore } from '../../utils/scoringEngine';

const DeploymentScore = ({ modelData }) => {
  const [showBreakdown, setShowBreakdown] = useState(false);
  
  const scoreData = calculateDeploymentScore(modelData);
  const { total, scores, rating, recommendations, readyForProduction } = scoreData;

  const getRatingBadge = () => {
    const badges = {
      green: {
        bg: 'bg-green-500/20',
        border: 'border-green-500/50',
        text: 'text-green-400',
        icon: CheckCircle
      },
      yellow: {
        bg: 'bg-yellow-500/20',
        border: 'border-yellow-500/50',
        text: 'text-yellow-400',
        icon: AlertTriangle
      },
      orange: {
        bg: 'bg-orange-500/20',
        border: 'border-orange-500/50',
        text: 'text-orange-400',
        icon: AlertTriangle
      },
      red: {
        bg: 'bg-red-500/20',
        border: 'border-red-500/50',
        text: 'text-red-400',
        icon: AlertTriangle
      }
    };

    return badges[rating.color] || badges.yellow;
  };

  const badge = getRatingBadge();
  const BadgeIcon = badge.icon;

  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="border-b border-white/10 p-6">
        <div className="flex items-center gap-3 mb-2">
          <Shield className="w-6 h-6 text-purple-400" />
          <h2 className="text-2xl font-bold text-white">
            Deployment Readiness Score
          </h2>
        </div>
        <p className="text-gray-400">
          Production readiness evaluation across 5 key categories
        </p>
      </div>

      {/* Score Display */}
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Gauge */}
          <div className="flex flex-col items-center justify-center p-6 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl border border-purple-500/20">
            <ScoreGauge score={total} size="large" />
            
            {/* Rating Badge */}
            <div className={`mt-6 px-4 py-2 ${badge.bg} border ${badge.border} rounded-lg flex items-center gap-2`}>
              <BadgeIcon className={`w-5 h-5 ${badge.text}`} />
              <span className={`font-bold ${badge.text}`}>
                {rating.label}
              </span>
            </div>

            {/* Production Ready Indicator */}
            <div className="mt-4 text-center">
              {readyForProduction ? (
                <div className="text-green-400 text-sm font-semibold flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Production Ready
                </div>
              ) : (
                <div className="text-yellow-400 text-sm font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Needs Review
                </div>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="lg:col-span-2 space-y-4">
            {/* Category Mini Scores */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {Object.entries(scores).map(([key, scoreData]) => {
                const percentage = (scoreData.score / scoreData.maxScore) * 100;
                const color = percentage >= 80 ? 'green' : percentage >= 60 ? 'yellow' : 'red';
                
                return (
                  <div
                    key={key}
                    className={`bg-${color}-500/10 border border-${color}-500/30 rounded-lg p-3`}
                  >
                    <div className="text-xs text-gray-400 capitalize mb-1">
                      {key}
                    </div>
                    <div className={`text-2xl font-bold text-${color}-400`}>
                      {scoreData.score}/{scoreData.maxScore}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Recommendations */}
            <div className="bg-black/20 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-5 h-5 text-purple-400" />
                <h3 className="font-semibold text-white">Recommendations</h3>
              </div>
              
              <div className="space-y-2">
                {recommendations.map((rec, idx) => {
                  const icons = {
                    success: <CheckCircle className="w-4 h-4 text-green-400" />,
                    warning: <AlertTriangle className="w-4 h-4 text-yellow-400" />,
                    info: <Info className="w-4 h-4 text-blue-400" />
                  };

                  return (
                    <div key={idx} className="flex items-start gap-2">
                      {icons[rec.type]}
                      <span className="text-sm text-gray-300">{rec.message}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Toggle Breakdown Button */}
            <button
              onClick={() => setShowBreakdown(!showBreakdown)}
              className="w-full px-4 py-3 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 rounded-lg font-semibold text-white transition-all"
            >
              {showBreakdown ? '▼ Hide Detailed Breakdown' : '▶ Show Detailed Breakdown'}
            </button>
          </div>
        </div>

        {/* Detailed Breakdown */}
        {showBreakdown && (
          <div className="mt-6 pt-6 border-t border-white/10">
            <h3 className="text-xl font-bold text-white mb-4">
              Detailed Score Breakdown
            </h3>
            <ScoreBreakdown scores={scores} />
          </div>
        )}
      </div>

      {/* Score Interpretation Guide */}
      <div className="border-t border-white/10 p-6 bg-black/20">
        <h3 className="text-sm font-semibold text-white mb-3">
          Score Interpretation:
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <div>
              <div className="text-white font-semibold">90-100</div>
              <div className="text-gray-400">Excellent</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <div>
              <div className="text-white font-semibold">80-89</div>
              <div className="text-gray-400">Great</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <div>
              <div className="text-white font-semibold">70-79</div>
              <div className="text-gray-400">Good</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
            <div>
              <div className="text-white font-semibold">60-69</div>
              <div className="text-gray-400">Fair</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <div>
              <div className="text-white font-semibold">&lt;60</div>
              <div className="text-gray-400">Poor</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeploymentScore;