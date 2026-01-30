import { useState } from 'react';
import { Filter, X, ChevronDown, ChevronUp } from 'lucide-react';
import { getFilterPresets } from '../../utils/filterUtils';

const FilterPanel = ({ onFilterChange, activeFilters = {}, activeTemplate = null }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState(activeFilters);
  const presets = getFilterPresets();

  const updateFilter = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    setFilters({});
    onFilterChange({});
  };

  const applyPreset = (presetKey) => {
    const preset = presets[presetKey];
    setFilters(preset.filters);
    onFilterChange(preset.filters);
  };

  const hasActiveFilters = Object.keys(filters).length > 0;

  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Filter className="w-5 h-5 text-purple-400" />
          <span className="font-semibold text-white">Filters & Sorting</span>
          
          {activeTemplate && (
            <span className="px-3 py-1 bg-purple-500/20 text-purple-400 text-xs rounded-lg border border-purple-500/30">
              Template: {activeTemplate}
            </span>
          )}

          {hasActiveFilters && (
            <span className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded-lg">
              {Object.keys(filters).length} active
            </span>
          )}
        </div>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        )}
      </button>

      {/* Filter Content */}
      {isOpen && (
        <div className="border-t border-white/10 p-6 space-y-6">
          {/* Presets */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-3">Quick Presets</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {Object.entries(presets).map(([key, preset]) => (
                <button
                  key={key}
                  onClick={() => applyPreset(key)}
                  className="text-left p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-all"
                >
                  <div className="font-semibold text-sm text-white mb-1">
                    {preset.name}
                  </div>
                  <div className="text-xs text-gray-400">
                    {preset.description}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* VRAM Filter */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              Maximum VRAM (GB)
            </label>
            <input
              type="range"
              min="4"
              max="80"
              step="4"
              value={filters.maxVRAM || 80}
              onChange={(e) => updateFilter('maxVRAM', parseInt(e.target.value))}
              className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-purple-500"
            />
            <div className="flex justify-between mt-2 text-xs text-gray-400">
              <span>4GB</span>
              <span className="text-purple-400 font-semibold">
                {filters.maxVRAM ? `≤ ${filters.maxVRAM}GB` : 'Any'}
              </span>
              <span>80GB</span>
            </div>
          </div>

          {/* License Filter */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              License Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => updateFilter('license', 'all')}
                className={`px-4 py-2 rounded-lg border transition-all ${
                  (!filters.license || filters.license === 'all')
                    ? 'bg-purple-500/30 border-purple-500/50 text-white'
                    : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                }`}
              >
                All
              </button>
              <button
                onClick={() => updateFilter('license', 'commercial')}
                className={`px-4 py-2 rounded-lg border transition-all ${
                  filters.license === 'commercial'
                    ? 'bg-green-500/30 border-green-500/50 text-white'
                    : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                }`}
              >
                Commercial
              </button>
              <button
                onClick={() => updateFilter('license', 'non-commercial')}
                className={`px-4 py-2 rounded-lg border transition-all ${
                  filters.license === 'non-commercial'
                    ? 'bg-red-500/30 border-red-500/50 text-white'
                    : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                }`}
              >
                Non-Commercial
              </button>
            </div>
          </div>

          {/* Context Length Filter */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              Minimum Context Length
            </label>
            <select
              value={filters.minContext || ''}
              onChange={(e) => updateFilter('minContext', parseInt(e.target.value) || null)}
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="" className="text-gray-900">Any</option>
              <option value="4096" className="text-gray-900">4k tokens (standard)</option>
              <option value="8192" className="text-gray-900">8k tokens</option>
              <option value="16384" className="text-gray-900">16k tokens</option>
              <option value="32768" className="text-gray-900">32k tokens</option>
              <option value="65536" className="text-gray-900">64k+ tokens</option>
              <option value="131072" className="text-gray-900">128k+ tokens</option>
            </select>
          </div>

          {/* Parameter Count Filter */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              Model Size (Parameters)
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => {
                  updateFilter('minParams', 1);
                  updateFilter('maxParams', 7);
                }}
                className={`px-4 py-2 rounded-lg border transition-all ${
                  filters.minParams === 1 && filters.maxParams === 7
                    ? 'bg-purple-500/30 border-purple-500/50 text-white'
                    : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                }`}
              >
                Small (1-7B)
              </button>
              <button
                onClick={() => {
                  updateFilter('minParams', 7);
                  updateFilter('maxParams', 15);
                }}
                className={`px-4 py-2 rounded-lg border transition-all ${
                  filters.minParams === 7 && filters.maxParams === 15
                    ? 'bg-purple-500/30 border-purple-500/50 text-white'
                    : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                }`}
              >
                Medium (7-15B)
              </button>
              <button
                onClick={() => {
                  updateFilter('minParams', 15);
                  updateFilter('maxParams', 999);
                }}
                className={`px-4 py-2 rounded-lg border transition-all ${
                  filters.minParams === 15
                    ? 'bg-purple-500/30 border-purple-500/50 text-white'
                    : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                }`}
              >
                Large (15B+)
              </button>
            </div>
          </div>

          {/* Sort By - Commented out as in original */}
          {/* <div>
            <label className="block text-sm font-semibold text-white mb-2">
              Sort By
            </label>
            <select
              value={filters.sortBy || ''}
              onChange={(e) => updateFilter('sortBy', e.target.value)}
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="" className="text-gray-900">Default</option>
              <option value="downloads" className="text-gray-900">Most Downloads</option>
              <option value="likes" className="text-gray-900">Most Likes</option>
              <option value="name" className="text-gray-900">Name (A-Z)</option>
              <option value="vram_low" className="text-gray-900">Lowest VRAM</option>
              <option value="vram_high" className="text-gray-900">Highest VRAM</option>
              <option value="context" className="text-gray-900">Longest Context</option>
            </select>
          </div> */}

          {/* Clear Filters */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-500/20 border border-red-500/30 text-red-400 rounded-lg hover:bg-red-500/30 transition-all"
            >
              <X className="w-4 h-4" />
              Clear All Filters
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default FilterPanel;