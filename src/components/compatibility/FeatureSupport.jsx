import { CheckCircle, XCircle, Zap, Info } from 'lucide-react';

const FeatureSupport = ({ features }) => {
  const featureList = [
    { key: 'flashAttention', icon: '⚡', color: 'yellow' },
    { key: 'gqa', icon: '🚀', color: 'purple' },
    { key: 'longContext', icon: '📄', color: 'blue' },
    { key: 'ropeScaling', icon: '📏', color: 'green' },
    { key: 'slidingWindow', icon: '🪟', color: 'cyan' }
  ];

  const supportedCount = Object.values(features).filter(f => f.supported).length;

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-white/10 rounded-xl p-5">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-lg font-bold text-white mb-1">
              Advanced Features
            </h4>
            <p className="text-sm text-gray-400">
              Performance optimizations and capabilities
            </p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-400">
              {supportedCount}/{Object.keys(features).length}
            </div>
            <div className="text-xs text-gray-400">Supported</div>
          </div>
        </div>
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {featureList.map((item) => {
          const feature = features[item.key];
          if (!feature) return null;

          return (
            <div
              key={item.key}
              className={`bg-white/5 border rounded-xl p-5 ${
                feature.supported
                  ? 'border-green-500/30 hover:bg-white/10'
                  : 'border-gray-500/30 opacity-75'
              } transition-all`}
            >
              <div className="flex items-start gap-3">
                {/* Icon */}
                <div className="text-3xl">{item.icon}</div>

                <div className="flex-1">
                  {/* Header */}
                  <div className="flex items-center gap-2 mb-2">
                    {feature.supported ? (
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-400" />
                    )}
                    <h5 className="font-bold text-white">
                      {feature.name}
                    </h5>
                  </div>

                  {/* Benefit */}
                  {feature.supported && feature.benefit && (
                    <div className={`mb-3 px-3 py-2 bg-${item.color}-500/20 border border-${item.color}-500/30 rounded-lg`}>
                      <div className="flex items-center gap-2">
                        <Zap className={`w-4 h-4 text-${item.color}-400`} />
                        <span className={`text-sm font-semibold text-${item.color}-400`}>
                          {feature.benefit}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Notes */}
                  <div className="space-y-1">
                    {feature.notes.map((note, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-gray-400">
                        <span>•</span>
                        <span>{note}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Performance Impact Summary */}
      <div className="bg-black/20 border border-white/10 rounded-xl p-4">
        <div className="flex items-start gap-2">
          <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-gray-300">
            <strong className="text-white">Performance Impact:</strong> Models with GQA and Flash Attention 
            typically achieve 2-4x faster inference compared to standard architectures. Long context support 
            enables processing larger documents without chunking.
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeatureSupport;