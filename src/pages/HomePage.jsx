import { useState, useEffect, useMemo } from 'react';
import { Sparkles, Zap, Shield, Database, TrendingUp } from 'lucide-react';
import ModelSearchAutocomplete from '../components/common/ModelSearchAutocomplete';
import FilterPanel from '../components/common/FilterPanel';
import { getTrendingModels } from '../services/huggingface';
import { applyFilters } from '../utils/filterUtils';

const HomePage = ({ onSearch, loading, onViewRecommender }) => {
  const [filters, setFilters] = useState({});
  const [popularModels, setPopularModels] = useState([]);
  const [modelsLoading, setModelsLoading] = useState(true);

  // Helper: Estimate data from the raw API response so filters can work
  const enrichModelData = (model) => {
    // 1. Estimate Parameters from name (e.g. "7b" -> 7)
    const paramMatch = model.id.match(/(\d+)[bB]/);
    const params = paramMatch ? parseInt(paramMatch[1]) : 7; // Default to 7B if unknown

    // 2. Estimate VRAM (rough rule of thumb: params * 2 for FP16)
    const estimatedVRAM = params * 2;

    // 3. Check License from tags
    const isCommercial = model.tags?.some(tag => 
      ['mit', 'apache-2.0', 'openrail', 'cc-by'].includes(tag.toLowerCase())
    ) ?? true;

    // 4. Estimate Context Length from Name (FIX for Context Filter)
    let estimatedContext = 4096;
    if (model.id.includes('128k') || model.id.includes('128K')) estimatedContext = 131072;
    else if (model.id.includes('32k') || model.id.includes('32K')) estimatedContext = 32768;
    else if (model.id.includes('16k') || model.id.includes('16K')) estimatedContext = 16384;
    else if (model.id.includes('8k') || model.id.includes('8K')) estimatedContext = 8192;

    return {
      ...model,
      // IMPORTANT: Add modelId alias because filterUtils sorts by 'modelId', not 'id'
      modelId: model.id, 
      
      // Properties expected by filterUtils.js
      vramEstimates: {
        fp16: estimatedVRAM,
        totalParams: params
      },
      licenseInfo: {
        commercial: isCommercial
      },
      config: {
        max_position_embeddings: estimatedContext
      },
      // UI Properties
      name: model.id.split('/')[1] || model.id,
      desc: `${formatNumber(model.downloads)} downloads • ${model.pipeline_tag || 'Text Generation'}`,
    };
  };

  // Fetch trending models on component mount
  useEffect(() => {
    const fetchModels = async () => {
      try {
        setModelsLoading(true);
        // Fetch top 15 models to give filters more to work with
        const trending = await getTrendingModels(15);
        
        // Transform the API data into a rich object our filters can understand
        const enrichedModels = trending.map(enrichModelData);
        
        setPopularModels(enrichedModels);
      } catch (error) {
        console.error("Failed to fetch trending models:", error);
        setPopularModels([]);
      } finally {
        setModelsLoading(false);
      }
    };

    fetchModels();
  }, []);

  // Apply filters using useMemo
  const filteredModels = useMemo(() => {
    return applyFilters(popularModels, filters);
  }, [popularModels, filters]);

  // Helper to format large numbers
  const formatNumber = (num) => {
    if (!num) return '0';
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const features = [
    {
      icon: Zap,
      title: 'Instant Analysis',
      description: 'Get complete model breakdown in seconds'
    },
    {
      icon: Shield,
      title: 'License Clarity',
      description: 'Know if you can deploy commercially'
    },
    {
      icon: Database,
      title: 'VRAM Calculator',
      description: 'Calculate exact hardware requirements'
    },
    {
      icon: TrendingUp,
      title: 'Smart Comparisons',
      description: 'Compare models side-by-side'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-500 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-6 py-20">
          {/* Hero Content */}
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
              Decode Any LLM
              <br />
              Make Confident Decisions
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Instantly understand any HuggingFace model's parameters, requirements, and deployment implications
            </p>

            {/* NEW: Recommender CTA */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <button
                onClick={onViewRecommender}
                className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl font-bold text-lg hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                <Sparkles className="w-6 h-6" />
                Find My Perfect Model
              </button>
              
              <button
                onClick={() => document.getElementById('search').scrollIntoView({ behavior: 'smooth' })}
                className="px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl font-bold text-lg hover:bg-white/20 transition-all"
              >
                Search Manually
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div id="search" className="max-w-4xl mx-auto mb-8">
            <ModelSearchAutocomplete onSearch={onSearch} loading={loading} />
          </div>

          {/* Filter Panel */}
          <div className="max-w-4xl mx-auto mb-16">
            <FilterPanel 
              onFilterChange={setFilters}
              activeFilters={filters}
            />
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all"
              >
                <feature.icon className="w-10 h-10 text-purple-400 mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>

          {/* Popular Models */}
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-purple-400" />
              {Object.keys(filters).length > 0 ? 'Filtered Models' : 'Trending Models'}
            </h2>
            
            {modelsLoading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500 mb-2"></div>
                <p className="text-gray-400">Loading top models from HuggingFace...</p>
              </div>
            ) : (
              <>
                {filteredModels.length === 0 ? (
                  <div className="text-center py-12 bg-white/5 rounded-xl border border-white/10">
                    <p className="text-xl text-white mb-2">No models match your filters</p>
                    <p className="text-sm text-gray-400 mb-4">Try searching directly in the search bar above for specific models.</p>
                    <button 
                      onClick={() => setFilters({})}
                      className="text-purple-400 hover:text-purple-300 underline"
                    >
                      Clear filters
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredModels.map((model) => (
                      <button
                        key={model.id}
                        onClick={() => onSearch(model.id)}
                        disabled={loading}
                        className="text-left bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-5 hover:bg-white/10 hover:border-purple-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                      >
                        <div className="flex items-start justify-between">
                          <div className="overflow-hidden">
                            <h3 className="font-semibold text-white mb-1 group-hover:text-purple-400 transition-colors truncate">
                              {model.name}
                            </h3>
                            <p className="text-sm text-gray-400 mb-2">{model.desc}</p>
                            
                            <div className="flex flex-wrap gap-2 mb-1">
                               <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded border border-purple-500/20">
                                 ~{model.vramEstimates.totalParams}B Params
                               </span>
                               {model.config.max_position_embeddings > 4096 && (
                                 <span className="text-xs bg-green-500/20 text-green-300 px-2 py-0.5 rounded border border-green-500/20">
                                   {formatNumber(model.config.max_position_embeddings)} ctx
                                 </span>
                               )}
                            </div>

                            <p className="text-xs text-gray-500 font-mono truncate opacity-50">{model.id}</p>
                          </div>
                          <div className="text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity ml-4 self-center">
                            →
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;