// src/components/common/ModelSearchAutocomplete.jsx

import { useState, useEffect, useRef } from 'react';
import { Search, Loader2, TrendingUp, X } from 'lucide-react';
import { searchModels } from '../../services/huggingface';

const ModelSearchAutocomplete = ({ onSearch, loading }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const searchRef = useRef(null);

  // Debounce search effect
  useEffect(() => {
    // Don't search if query is too short
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    // Set a timer to wait for user to stop typing
    const timer = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const results = await searchModels(query, 5);
        setSuggestions(results);
        setShowSuggestions(true);
      } catch (error) {
        console.error('Search error:', error);
        setSuggestions([]);
      } finally {
        setSearchLoading(false);
      }
    }, 300); // 300ms delay

    // Cleanup timer if user types again before 300ms
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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim() && !loading) {
      onSearch(query.trim());
      setShowSuggestions(false);
    }
  };

  const selectSuggestion = (modelId) => {
    setQuery(modelId);
    onSearch(modelId);
    setShowSuggestions(false);
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num;
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
            placeholder="Search models... (e.g., llama, mistral, phi)"
            disabled={loading}
            className="w-full px-6 py-4 pl-14 pr-32 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xl"
          />
          
          <div className="absolute left-5 top-1/2 -translate-y-1/2 pointer-events-none">
            {(loading || searchLoading) ? (
              <Loader2 className="w-6 h-6 text-purple-400 animate-spin" />
            ) : (
              <Search className="w-6 h-6 text-gray-400 group-focus-within:text-purple-400 transition-colors" />
            )}
          </div>

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
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-slate-800/95 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2">
          {suggestions.map((model) => (
            <button
              key={model.id}
              onClick={() => selectSuggestion(model.id)}
              className="w-full px-6 py-4 hover:bg-white/10 transition-colors text-left border-b border-white/10 last:border-b-0 group"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-white mb-1 truncate group-hover:text-purple-300 transition-colors">
                    {model.id}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <TrendingUp className="w-3 h-3 text-purple-400" />
                      {formatNumber(model.downloads || 0)} downloads
                    </span>
                    {model.pipeline_tag && (
                      <span className="px-2 py-0.5 bg-purple-500/20 rounded text-purple-400 border border-purple-500/20">
                        {model.pipeline_tag}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ModelSearchAutocomplete;