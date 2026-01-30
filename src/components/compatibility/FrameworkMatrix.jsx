import { CheckCircle, XCircle, AlertCircle, ExternalLink, Copy, Check } from 'lucide-react';
import { useState } from 'react';

const FrameworkMatrix = ({ frameworks }) => {
  const [copiedCmd, setCopiedCmd] = useState(null);

  const handleCopy = (cmd, frameworkId) => {
    navigator.clipboard.writeText(cmd);
    setCopiedCmd(frameworkId);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 90) return 'text-green-400';
    if (confidence >= 75) return 'text-yellow-400';
    if (confidence >= 50) return 'text-orange-400';
    return 'text-red-400';
  };

  const getConfidenceLabel = (confidence) => {
    if (confidence >= 90) return 'Excellent';
    if (confidence >= 75) return 'Good';
    if (confidence >= 50) return 'Fair';
    return 'Limited';
  };

  return (
    <div className="space-y-4">
      {Object.entries(frameworks).map(([key, framework]) => (
        <div
          key={key}
          className={`bg-white/5 border rounded-xl p-5 transition-all ${
            framework.compatible
              ? 'border-green-500/30 hover:bg-white/10'
              : 'border-red-500/30 opacity-75'
          }`}
        >
          <div className="flex items-start justify-between mb-4">
            {/* Framework Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl">{framework.icon}</span>
                <div>
                  <h4 className="text-lg font-bold text-white">
                    {framework.name}
                  </h4>
                  <div className="flex items-center gap-2 mt-1">
                    {framework.compatible ? (
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-400" />
                    )}
                    <span className={`text-sm font-semibold ${
                      framework.compatible ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {framework.compatible ? 'Compatible' : 'Not Compatible'}
                    </span>
                    
                    {framework.compatible && (
                      <>
                        <span className="text-gray-400">•</span>
                        <span className={`text-sm font-semibold ${getConfidenceColor(framework.confidence)}`}>
                          {getConfidenceLabel(framework.confidence)} ({framework.confidence}%)
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className="flex flex-wrap gap-2 mb-3">
                {framework.notes.map((note, idx) => (
                  <span
                    key={idx}
                    className={`px-2 py-1 rounded text-xs ${
                      framework.compatible
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                        : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                    }`}
                  >
                    {note}
                  </span>
                ))}
              </div>

              {/* Install Command */}
              {framework.compatible && (
                <div className="bg-black/30 rounded-lg p-3 font-mono text-sm">
                  <div className="flex items-center justify-between">
                    <code className="text-gray-300">{framework.installCmd}</code>
                    <button
                      onClick={() => handleCopy(framework.installCmd, key)}
                      className="ml-2 p-1 hover:bg-white/10 rounded transition-colors"
                      title="Copy command"
                    >
                      {copiedCmd === key ? (
                        <Check className="w-4 h-4 text-green-400" />
                      ) : (
                        <Copy className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Documentation Link */}
            
              <a
              href={framework.docs}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-4 p-2 hover:bg-white/10 rounded-lg transition-colors"
              title="View documentation"
            >
              <ExternalLink className="w-5 h-5 text-purple-400" />
            </a>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FrameworkMatrix;