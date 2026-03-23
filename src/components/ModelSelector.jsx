import { useState, useEffect, useRef } from 'react';
import { Search, X, Cpu, TrendingUp, Heart } from 'lucide-react';
import { searchModels } from '../services/huggingface';
import { parseModelSize, formatNumber } from '../utils/modelUtils';

const ModelSelector = ({ onSelect, onCancel }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchContainerRef = useRef(null);
  const listRef = useRef(null);

  useEffect(() => {
    if (searchQuery.length < 2) {
      setSuggestions([]);
      setSelectedIndex(-1);
      return;
    }

    const timer = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const results = await searchModels(searchQuery, 10);
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
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
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

  const handleKeyDown = (e) => {
    if (showSuggestions && suggestions.length > 0) {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
          return;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
          return;
        case 'Escape':
          setShowSuggestions(false);
          setSelectedIndex(-1);
          if (onCancel) onCancel();
          return;
        case 'Enter':
          e.preventDefault();
          if (selectedIndex >= 0 && suggestions[selectedIndex]) {
            onSelect(suggestions[selectedIndex].id);
            setShowSuggestions(false);
          }
          return;
        default:
          break;
      }
    } else if (e.key === 'Escape') {
      if (onCancel) onCancel();
    }
  };

  const clearQuery = () => {
    setSearchQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
    setSelectedIndex(-1);
  };

  const highlightMatch = (text, query) => {
    if (!query || query.length < 2) return text;
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
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

  return (
    <div className="relative w-full" ref={searchContainerRef}>
      <div className="group relative">
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-faint)] transition-colors group-focus-within:text-[var(--accent)]" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
          onKeyDown={handleKeyDown}
          autoFocus
          className="w-full rounded-xl border border-[var(--border-strong)] bg-white px-10 py-3 text-sm font-medium text-[var(--text-main)] shadow-sm outline-none transition-all placeholder:text-[var(--text-faint)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[rgba(53,87,132,0.1)]"
          placeholder="Search models to compare..."
        />
        
        {searchQuery && (
          <button
            type="button"
            onClick={clearQuery}
            className="absolute right-10 top-1/2 -translate-y-1/2 rounded-md p-1 transition-colors hover:bg-[var(--panel-muted)]"
          >
            <X className="h-4 w-4 text-[var(--text-faint)] hover:text-[var(--text-main)]" />
          </button>
        )}

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 transition-colors hover:bg-[var(--panel-muted)]"
            title="Cancel"
          >
            <X className="h-4 w-4 text-[var(--text-muted)] hover:text-[var(--accent)]" />
          </button>
        )}

        {searchLoading && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--accent)] border-t-transparent"></div>
          </div>
        )}

        {showSuggestions && (
          <div className="absolute left-0 top-[calc(100%+8px)] z-50 w-[320px] overflow-hidden rounded-xl border border-[var(--border-soft)] bg-white shadow-xl md:w-[400px]">
            {suggestions.length > 0 ? (
              <div ref={listRef} className="max-h-[300px] overflow-y-auto">
                {suggestions.map((model, index) => {
                  const modelSize = parseModelSize(model.id);
                  const isSelected = index === selectedIndex;
                  return (
                    <button
                      key={model.id}
                      onClick={() => {
                        onSelect(model.id);
                        setShowSuggestions(false);
                      }}
                      className={`group w-full border-b border-[var(--border-soft)] px-4 py-3 text-left transition-colors last:border-b-0 ${
                        isSelected
                          ? 'bg-[var(--panel-muted)]'
                          : 'hover:bg-[rgba(243,247,252,0.8)]'
                      }`}
                    >
                      <div className="mb-1 truncate text-[14px] font-bold text-[var(--text-strong)] transition-colors group-hover:text-[var(--accent)]">
                        {highlightMatch(model.id, searchQuery)}
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        {modelSize && (
                          <span className="flex items-center gap-1 rounded bg-[var(--accent-soft)] px-1.5 py-0.5 text-[10px] font-semibold text-[var(--accent)]">
                            <Cpu className="h-2.5 w-2.5" />
                            {modelSize}
                          </span>
                        )}
                        {model.pipeline_tag && (
                          <span className="rounded bg-[rgba(56,189,248,0.1)] px-1.5 py-0.5 text-[10px] font-semibold text-[rgb(14,165,233)]">
                            {model.pipeline_tag}
                          </span>
                        )}
                        <span className="flex items-center gap-1 text-[10px] font-medium text-[var(--text-muted)]">
                          <TrendingUp className="h-2.5 w-2.5 text-[rgb(34,197,94)]" />
                          {formatNumber(model.downloads || 0)}
                        </span>
                        {model.likes > 0 && (
                          <span className="flex items-center gap-1 text-[10px] font-medium text-[var(--text-muted)]">
                            <Heart className="h-2.5 w-2.5 text-[rgb(236,72,153)]" />
                            {formatNumber(model.likes)}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              !searchLoading &&
              searchQuery.length >= 2 && (
                <div className="px-4 py-6 text-center">
                  <p className="text-sm text-[var(--text-muted)]">
                    No models found.
                  </p>
                </div>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ModelSelector;
