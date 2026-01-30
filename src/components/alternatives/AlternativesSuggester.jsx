import { useState, useEffect } from 'react';
import { Lightbulb, TrendingDown, TrendingUp, Shield, FileText, AlertCircle } from 'lucide-react';
import { findAlternatives, getAlternativesSummary } from '../../utils/alternativesEngine';
import AlternativeCard from './AlternativeCard';

const AlternativesSuggester = ({ modelData, allModels, onSelectModel }) => {
  const [alternatives, setAlternatives] = useState(null);
  const [activeCategory, setActiveCategory] = useState('cheaper');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (modelData && allModels.length > 0) {
      setLoading(true);
      // Simulate processing delay for better UX
      setTimeout(() => {
        const alts = findAlternatives(modelData, allModels);
        setAlternatives(alts);
        
        // Auto-select first non-empty category
        if (alts.cheaper.length === 0 && alts.better.length > 0) {
          setActiveCategory('better');
        } else if (alts.cheaper.length === 0 && alts.better.length === 0 && alts.license.length > 0) {
          setActiveCategory('license');
        } else if (alts.cheaper.length === 0 && alts.better.length === 0 && alts.license.length === 0 && alts.context.length > 0) {
          setActiveCategory('context');
        }
        
        setLoading(false);
      }, 500);
    }
  }, [modelData, allModels]);

  if (loading) {
    return (
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-12 text-center">
        <div className="inline-block w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-300">Finding alternatives...</p>
      </div>
    );
  }

  if (!alternatives) {
    return null;
  }

  const summary = getAlternativesSummary(alternatives);

  if (summary.total === 0) {
    return (
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 text-center">
        <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">
          No Alternatives Found
        </h3>
        <p className="text-gray-400">
          This model is already well-optimized for its class, or we don't have enough similar models in our database.
        </p>
      </div>
    );
  }

  const categories = [
    {
      id: 'cheaper',
      label: 'Cheaper Options',
      icon: TrendingDown,
      color: 'green',
      count: alternatives.cheaper.length,
      description: 'Lower VRAM, reduce costs'
    },
    {
      id: 'better',
      label: 'Better Performance',
      icon: TrendingUp,
      color: 'purple',
      count: alternatives.better.length,
      description: 'Higher quality at similar cost'
    },
    {
      id: 'license',
      label: 'Better License',
      icon: Shield,
      color: 'blue',
      count: alternatives.license.length,
      description: 'More permissive licensing'
    },
    {
      id: 'context',
      label: 'Longer Context',
      icon: FileText,
      color: 'yellow',
      count: alternatives.context.length,
      description: 'Extended context windows'
    }
  ];

  const activeAlternatives = alternatives[activeCategory] || [];

  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="border-b border-white/10 p-6">
        <div className="flex items-center gap-3 mb-2">
          <Lightbulb className="w-6 h-6 text-yellow-400" />
          <h2 className="text-2xl font-bold text-white">
            Alternative Suggestions
          </h2>
        </div>
        <p className="text-gray-400">
          Similar models that might better fit your needs
        </p>
      </div>

      {/* Category Tabs */}
      <div className="border-b border-white/10 px-6">
        <div className="flex gap-2 -mb-px overflow-x-auto">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                disabled={category.count === 0}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-all whitespace-nowrap ${
                  activeCategory === category.id
                    ? 'border-purple-500 text-white bg-white/5'
                    : category.count > 0
                    ? 'border-transparent text-gray-400 hover:text-white hover:bg-white/5'
                    : 'border-transparent text-gray-600 opacity-50 cursor-not-allowed'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="font-semibold">{category.label}</span>
                {category.count > 0 && (
                  <span className={`px-2 py-0.5 bg-${category.color}-500/20 text-${category.color}-400 rounded-full text-xs font-bold`}>
                    {category.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Category Description */}
      <div className="bg-black/20 px-6 py-3 border-b border-white/10">
        <p className="text-sm text-gray-300">
          {categories.find(c => c.id === activeCategory)?.description}
        </p>
      </div>

      {/* Alternatives Grid */}
      <div className="p-6">
        {activeAlternatives.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeAlternatives.map((alt) => (
              <AlternativeCard
                key={alt.modelId}
                model={alt}
                type={activeCategory}
                onAnalyze={onSelectModel}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-400">
              No alternatives found in this category
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AlternativesSuggester;