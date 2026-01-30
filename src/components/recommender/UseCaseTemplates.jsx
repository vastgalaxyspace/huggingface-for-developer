import { useState } from 'react';
import { ChevronDown, ChevronUp, Check, ArrowRight } from 'lucide-react';
import { getAllTemplates } from '../../utils/useCaseTemplates';

const UseCaseTemplates = ({ onApplyTemplate, activeTemplateId = null }) => {
  const [expandedTemplate, setExpandedTemplate] = useState(null);
  const templates = getAllTemplates();

  const handleApply = (template) => {
    onApplyTemplate(template);
  };

  const toggleExpanded = (templateId) => {
    setExpandedTemplate(expandedTemplate === templateId ? null : templateId);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-white mb-2">
          🎯 Quick Start Templates
        </h3>
        <p className="text-gray-400">
          Apply pre-configured filters for common use cases
        </p>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((template) => {
          const isActive = activeTemplateId === template.id;
          const isExpanded = expandedTemplate === template.id;

          return (
            <div
              key={template.id}
              className={`relative bg-white/5 backdrop-blur-sm border rounded-xl overflow-hidden transition-all ${
                isActive
                  ? 'border-purple-500 ring-2 ring-purple-500/50'
                  : 'border-white/10 hover:border-purple-500/50'
              }`}
            >
              {/* Active Badge */}
              {isActive && (
                <div className="absolute top-2 right-2 px-2 py-1 bg-purple-500 rounded-lg text-xs font-bold flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  Active
                </div>
              )}

              {/* Template Header */}
              <div className="p-5">
                <div className="flex items-start gap-3 mb-3">
                  <div className="text-4xl">{template.emoji}</div>
                  <div className="flex-1">
                    <h4 className="text-lg font-bold text-white mb-1">
                      {template.name}
                    </h4>
                    <p className="text-sm text-gray-400">
                      {template.description}
                    </p>
                  </div>
                </div>

                {/* Quick Requirements */}
                <div className="bg-black/20 rounded-lg p-3 mb-3 text-xs space-y-1">
                  {template.requirements.vram && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">VRAM:</span>
                      <span className="text-white font-semibold">
                        {template.requirements.vram}
                      </span>
                    </div>
                  )}
                  {template.requirements.context && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Context:</span>
                      <span className="text-white font-semibold">
                        {template.requirements.context}
                      </span>
                    </div>
                  )}
                  {template.requirements.license && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">License:</span>
                      <span className="text-white font-semibold">
                        {template.requirements.license}
                      </span>
                    </div>
                  )}
                  {template.requirements.params && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Size:</span>
                      <span className="text-white font-semibold">
                        {template.requirements.params}
                      </span>
                    </div>
                  )}
                </div>

                {/* Apply Button */}
                <button
                  onClick={() => handleApply(template)}
                  className={`w-full px-4 py-2 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                    isActive
                      ? 'bg-purple-500/30 text-purple-400 border border-purple-500/50'
                      : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white'
                  }`}
                >
                  {isActive ? (
                    <>
                      <Check className="w-4 h-4" />
                      Applied
                    </>
                  ) : (
                    <>
                      Apply Template
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                {/* Expand/Collapse Details */}
                <button
                  onClick={() => toggleExpanded(template.id)}
                  className="w-full mt-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm text-gray-400 transition-all flex items-center justify-center gap-2"
                >
                  {isExpanded ? (
                    <>
                      Less details
                      <ChevronUp className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      More details
                      <ChevronDown className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="border-t border-white/10 p-5 bg-black/20">
                  <div className="space-y-4">
                    {/* Explanation */}
                    <div>
                      <div className="text-sm font-semibold text-white mb-2">
                        💡 What this filters for:
                      </div>
                      <p className="text-sm text-gray-300">
                        {template.explanation}
                      </p>
                    </div>

                    {/* Ideal For */}
                    <div>
                      <div className="text-sm font-semibold text-white mb-2">
                        ✅ Ideal for:
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {template.idealFor.map((use, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs border border-green-500/30"
                          >
                            {use}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Applied Filters */}
                    <div>
                      <div className="text-sm font-semibold text-white mb-2">
                        🔧 Filters applied:
                      </div>
                      <div className="space-y-1 text-xs">
                        {Object.entries(template.filters).map(([key, value]) => (
                          <div key={key} className="flex justify-between text-gray-400">
                            <span className="capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>
                            <span className="text-white font-mono">{String(value)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default UseCaseTemplates;