// src/components/common/ModelSearchAutocomplete.jsx

import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, Loader2, TrendingUp, Heart, Cpu, X } from 'lucide-react';
import { searchModels } from '../../services/huggingface';

const ModelSearchAutocomplete = ({ onSearch, loading }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef(null);
  const listRef = useRef(null);

  // Parse model size from the model name (e.g., "7B", "13B", "70B")
  const parseModelSize = (modelId) => {
    const match = modelId.match(/(\d+\.?\d*)\s*[bB]/);
    if (match) return `${match[1]}B`;
    const matchM = modelId.match(/(\d+\.?\d*)\s*[mM](?!i)/);
    if (matchM) return `${matchM[1]}M`;
    return null;
  };

  // Debounce search effect
  useEffect(() => {
    if (query.length < 2) {
      setSuggestions([]);
      setSelectedIndex(-1);
      return;
    }

    const timer = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const results = await searchModels(query, 10);
        setSuggestions(results);
        setShowSuggestions(true);
        setSelectedIndex(-1);
      } catch (error) {
        console.error('Search error:', error);
        setSuggestions([]);
      } finally {
        setSearchLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Scroll selected item into view
  useEffect(() => {
    if (selectedIndex >= 0 && listRef.current) {
      const items = listRef.current.children;
      if (items[selectedIndex]) {
        items[selectedIndex].scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (loading) return;

    // If a suggestion is selected via keyboard, use it
    if (selectedIndex >= 0 && suggestions[selectedIndex]) {
      selectSuggestion(suggestions[selectedIndex].id);
      return;
    }

    if (query.trim()) {
      onSearch(query.trim());
      setShowSuggestions(false);
    }
  };

  const selectSuggestion = (modelId) => {
    setQuery(modelId);
    onSearch(modelId);
    setShowSuggestions(false);
    setSelectedIndex(-1);
  };

  // Keyboard navigation
  const handleKeyDown = useCallback((e) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
      default:
        break;
    }
  }, [showSuggestions, suggestions.length]);

  const formatNumber = (num) => {
    if (!num) return '0';
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  // Highlight matching text in suggestion
  const highlightMatch = (text, query) => {
    if (!query || query.length < 2) return text;
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) => 
      regex.test(part) 
        ? <mark key={i} className="bg-purple-500/30 text-white rounded px-0.5">{part}</mark>
        : part
    );
  };

  const clearQuery = () => {
    setQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
    setSelectedIndex(-1);
  };

  return (
    <div ref={searchRef} className="relative w-full">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative group">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
            onKeyDown={handleKeyDown}
            placeholder="Search models... (e.g., llama, mistral, phi, deepseek)"
            disabled={loading}
            className="w-full px-6 py-4 pl-14 pr-36 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xl"
            autoComplete="off"
          />
          
          <div className="absolute left-5 top-1/2 -translate-y-1/2 pointer-events-none">
            {(loading || searchLoading) ? (
              <Loader2 className="w-6 h-6 text-purple-400 animate-spin" />
            ) : (
              <Search className="w-6 h-6 text-gray-400 group-focus-within:text-purple-400 transition-colors" />
            )}
          </div>

          {/* Clear button */}
          {query && (
            <button
              type="button"
              onClick={clearQuery}
              className="absolute right-28 top-1/2 -translate-y-1/2 p-1.5 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-4 h-4 text-gray-400 hover:text-white" />
            </button>
          )}

          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-white shadow-lg"
          >
            {loading ? 'Loading...' : 'Search'}
          </button>
        </div>
      </form>

      {/* Autocomplete Suggestions Dropdown */}
      {showSuggestions && (
        <div className="absolute z-50 w-full mt-2 bg-slate-800/95 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl overflow-hidden">
          {suggestions.length > 0 ? (
            <>
              {/* Results header */}
              <div className="px-4 py-2 border-b border-white/10 flex items-center justify-between">
                <span className="text-xs text-gray-400 font-medium">
                  {suggestions.length} models found
                </span>
                <span className="text-xs text-gray-500">
                  ↑↓ to navigate • Enter to select
                </span>
              </div>

              {/* Results list */}
              <div ref={listRef} className="max-h-[400px] overflow-y-auto">
                {suggestions.map((model, index) => {
                  const modelSize = parseModelSize(model.id);
                  const isSelected = index === selectedIndex;

                  return (
                    <button
                      key={model.id}
                      onClick={() => selectSuggestion(model.id)}
                      className={`w-full px-5 py-3.5 transition-colors text-left border-b border-white/5 last:border-b-0 group ${
                        isSelected 
                          ? 'bg-purple-500/20 border-l-2 border-l-purple-500' 
                          : 'hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          {/* Model name with highlight */}
                          <div className="font-semibold text-white mb-1.5 truncate group-hover:text-purple-300 transition-colors text-sm">
                            {highlightMatch(model.id, query)}
                          </div>
                          
                          {/* Metadata badges */}
                          <div className="flex items-center gap-2 flex-wrap">
                            {/* Model size badge */}
                            {modelSize && (
                              <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded border border-purple-500/20">
                                <Cpu className="w-3 h-3" />
                                {modelSize}
                              </span>
                            )}

                            {/* Pipeline tag */}
                            {model.pipeline_tag && (
                              <span className="text-xs px-2 py-0.5 bg-cyan-500/15 text-cyan-300 rounded border border-cyan-500/20">
                                {model.pipeline_tag}
                              </span>
                            )}

                            {/* Downloads */}
                            <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                              <TrendingUp className="w-3 h-3 text-green-400" />
                              {formatNumber(model.downloads || 0)}
                            </span>

                            {/* Likes */}
                            {model.likes > 0 && (
                              <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                                <Heart className="w-3 h-3 text-pink-400" />
                                {formatNumber(model.likes)}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Arrow indicator */}
                        <div className={`text-purple-400 self-center transition-opacity ${
                          isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                        }`}>
                          →
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </>
          ) : (
            /* No results state */
            !searchLoading && query.length >= 2 && (
              <div className="px-6 py-8 text-center">
                <Search className="w-8 h-8 text-gray-500 mx-auto mb-3" />
                <p className="text-gray-300 font-medium mb-1">No models found for "{query}"</p>
                <p className="text-sm text-gray-500">
                  Try a different keyword, or search with the full model ID (e.g., author/model-name)
                </p>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
};

export default ModelSearchAutocomplete;