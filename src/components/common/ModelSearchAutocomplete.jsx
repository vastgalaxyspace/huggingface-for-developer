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

  const parseModelSize = (modelId) => {
    const match = modelId.match(/(\d+\.?\d*)\s*[bB]/);
    if (match) return `${match[1]}B`;
    const matchM = modelId.match(/(\d+\.?\d*)\s*[mM](?!i)/);
    if (matchM) return `${matchM[1]}M`;
    return null;
  };

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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  const handleKeyDown = useCallback(
    (e) => {
      if (!showSuggestions || suggestions.length === 0) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
          break;
        case 'Escape':
          setShowSuggestions(false);
          setSelectedIndex(-1);
          break;
        default:
          break;
      }
    },
    [showSuggestions, suggestions.length]
  );

  const formatNumber = (num) => {
    if (!num) return '0';
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const highlightMatch = (text, value) => {
    if (!value || value.length < 2) return text;
    const regex = new RegExp(`(${value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark key={i} className="rounded bg-[var(--accent-soft)] px-0.5 text-[var(--accent)]">
          {part}
        </mark>
      ) : (
        part
      )
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
        <div className="group relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
            onKeyDown={handleKeyDown}
            placeholder="Search models... (e.g., llama, mistral, phi, deepseek)"
            disabled={loading}
            className="w-full rounded-2xl border border-[var(--border-soft)] bg-white px-6 py-4 pl-14 pr-36 text-lg text-[var(--text-main)] placeholder-[var(--text-faint)] shadow-[0_8px_24px_rgba(24,39,75,0.08)] transition-all focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[rgba(53,87,132,0.2)] disabled:cursor-not-allowed disabled:opacity-50"
            autoComplete="off"
          />

          <div className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2">
            {loading || searchLoading ? (
              <Loader2 className="h-6 w-6 animate-spin text-[var(--accent)]" />
            ) : (
              <Search className="h-6 w-6 text-[var(--text-faint)] transition-colors group-focus-within:text-[var(--accent)]" />
            )}
          </div>

          {query && (
            <button
              type="button"
              onClick={clearQuery}
              className="absolute right-28 top-1/2 -translate-y-1/2 rounded-lg p-1.5 transition-colors hover:bg-[var(--panel-muted)]"
            >
              <X className="h-4 w-4 text-[var(--text-faint)] hover:text-[var(--text-main)]" />
            </button>
          )}

          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl bg-[var(--accent)] px-6 py-2 font-semibold text-white shadow-lg transition-all hover:bg-[var(--accent-strong)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Search'}
          </button>
        </div>
      </form>

      {showSuggestions && (
        <div className="absolute z-50 mt-2 w-full overflow-hidden rounded-xl border border-[var(--border-soft)] bg-white shadow-2xl">
          {suggestions.length > 0 ? (
            <>
              <div className="flex items-center justify-between border-b border-[var(--border-soft)] px-4 py-2">
                <span className="text-xs font-medium text-[var(--text-muted)]">{suggestions.length} models found</span>
                <span className="text-xs text-[var(--text-faint)]">Up/Down to navigate | Enter to select</span>
              </div>

              <div ref={listRef} className="max-h-[400px] overflow-y-auto">
                {suggestions.map((model, index) => {
                  const modelSize = parseModelSize(model.id);
                  const isSelected = index === selectedIndex;

                  return (
                    <button
                      key={model.id}
                      onClick={() => selectSuggestion(model.id)}
                      className={`group w-full border-b border-[var(--border-soft)] px-5 py-3.5 text-left transition-colors last:border-b-0 ${
                        isSelected
                          ? 'border-l-2 border-l-[var(--accent)] bg-[var(--accent-soft)]'
                          : 'hover:bg-[var(--panel-muted)]'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="mb-1.5 truncate text-sm font-semibold text-[var(--text-main)] transition-colors group-hover:text-[var(--accent)]">
                            {highlightMatch(model.id, query)}
                          </div>

                          <div className="flex flex-wrap items-center gap-2">
                            {modelSize && (
                              <span className="inline-flex items-center gap-1 rounded border border-[rgba(53,87,132,0.2)] bg-[var(--accent-soft)] px-2 py-0.5 text-xs text-[var(--accent)]">
                                <Cpu className="h-3 w-3" />
                                {modelSize}
                              </span>
                            )}

                            {model.pipeline_tag && (
                              <span className="rounded border border-[var(--border-soft)] bg-[var(--panel-muted)] px-2 py-0.5 text-xs text-[var(--text-main)]">
                                {model.pipeline_tag}
                              </span>
                            )}

                            <span className="inline-flex items-center gap-1 text-xs text-[var(--text-muted)]">
                              <TrendingUp className="h-3 w-3 text-emerald-500" />
                              {formatNumber(model.downloads || 0)}
                            </span>

                            {model.likes > 0 && (
                              <span className="inline-flex items-center gap-1 text-xs text-[var(--text-muted)]">
                                <Heart className="h-3 w-3 text-rose-500" />
                                {formatNumber(model.likes)}
                              </span>
                            )}
                          </div>
                        </div>

                        <div
                          className={`self-center text-[var(--accent)] transition-opacity ${
                            isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                          }`}
                        >
                          →
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </>
          ) : (
            !searchLoading &&
            query.length >= 2 && (
              <div className="px-6 py-8 text-center">
                <Search className="mx-auto mb-3 h-8 w-8 text-[var(--text-faint)]" />
                <p className="mb-1 font-medium text-[var(--text-main)]">No models found for "{query}"</p>
                <p className="text-sm text-[var(--text-muted)]">
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
