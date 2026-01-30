import { Shield, Users, FileText, Layers, Zap, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { getScoreColor } from '../../utils/scoringEngine';

const ScoreBreakdown = ({ scores }) => {
  const [expandedCategory, setExpandedCategory] = useState(null);

  const categories = [
    {
      key: 'license',
      icon: Shield,
      label: 'License Clarity',
      description: 'Legal permissions and restrictions'
    },
    {
      key: 'community',
      icon: Users,
      label: 'Community Support',
      description: 'Adoption and maintenance activity'
    },
    {
      key: 'documentation',
      icon: FileText,
      label: 'Documentation',
      description: 'Guides, examples, and specifications'
    },
    {
      key: 'compatibility',
      icon: Layers,
      label: 'Compatibility',
      description: 'Framework and tooling support'
    },
    {
      key: 'efficiency',
      icon: Zap,
      label: 'Efficiency',
      description: 'Performance optimizations'
    }
  ];

  const toggleExpanded = (key) => {
    setExpandedCategory(expandedCategory === key ? null : key);
  };

  return (
    <div className="space-y-3">
      {categories.map((category) => {
        const scoreData = scores[category.key];
        const percentage = (scoreData.score / scoreData.maxScore) * 100;
        const color = getScoreColor(scoreData.score, scoreData.maxScore);
        const isExpanded = expandedCategory === category.key;
        const Icon = category.icon;

        const colorClasses = {
          green: 'bg-green-500',
          yellow: 'bg-yellow-500',
          orange: 'bg-orange-500',
          red: 'bg-red-500'
        };

        return (
          <div
            key={category.key}
            className="bg-white/5 border border-white/10 rounded-xl overflow-hidden"
          >
            {/* Category Header */}
            <button
              onClick={() => toggleExpanded(category.key)}
              className="w-full p-4 hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-lg bg-${color}-500/20 flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 text-${color}-400`} />
                </div>

                <div className="flex-1 text-left">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <div className="font-semibold text-white">
                        {category.label}
                      </div>
                      <div className="text-xs text-gray-400">
                        {category.description}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className={`text-${color}-400 font-bold text-lg`}>
                        {scoreData.score}/{scoreData.maxScore}
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                    <div
                      className={`${colorClasses[color]} h-full rounded-full transition-all duration-500`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              </div>
            </button>

            {/* Expanded Details */}
            {isExpanded && (
              <div className="border-t border-white/10 p-4 bg-black/20">
                {/* Details */}
                {scoreData.details.length > 0 && (
                  <div className="mb-4">
                    <div className="text-sm font-semibold text-white mb-2">
                      Details:
                    </div>
                    <div className="space-y-1">
                      {scoreData.details.map((detail, idx) => (
                        <div key={idx} className="text-sm text-gray-300">
                          {detail}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Issues */}
                {scoreData.issues.length > 0 && (
                  <div>
                    <div className="text-sm font-semibold text-white mb-2">
                      Issues:
                    </div>
                    <div className="space-y-1">
                      {scoreData.issues.map((issue, idx) => (
                        <div key={idx} className="text-sm text-red-400 flex items-start gap-2">
                          <span>⚠️</span>
                          <span>{issue}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ScoreBreakdown;