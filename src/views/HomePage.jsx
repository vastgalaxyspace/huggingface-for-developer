"use client";
import { useState, useEffect, useRef } from 'react';
import { Search, Terminal, CheckCircle, Cloud, BarChart3, ChevronDown, AlignLeft, SlidersHorizontal, MessageSquare, Image as ImageIcon, Cpu, TrendingUp, Heart, X, Mic, Scan } from 'lucide-react';
import { getTrendingModels, searchModels } from '../services/huggingface';
import { parseModelSize, formatNumber, enrichModelData } from '../utils/modelUtils';

const FeatureItem = ({ icon, text }) => {
  const Icon = icon;

  return (
    <div className="group flex cursor-pointer items-center justify-center gap-3 px-3 py-5 text-center text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--text-muted)] transition-colors sm:py-6 sm:text-xs sm:tracking-[0.24em]">
      <Icon className="h-4 w-4 shrink-0 text-[var(--text-faint)] group-hover:text-[var(--accent)]" />
      <span>{text}</span>
    </div>
  );
};

const HomePage = ({ onSearch, loading }) => {
  const [popularModels, setPopularModels] = useState([]);
  const [modelsLoading, setModelsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchContainerRef = useRef(null);
  const listRef = useRef(null);
  const filterRef = useRef(null);

  const [activeFilter, setActiveFilter] = useState(null);
  const [filters, setFilters] = useState({
    architecture: [],
    parameters: [],
    license: [],
    pipeline: [],
  });
  const [sortBy, setSortBy] = useState('latest');
  const [currentPage, setCurrentPage] = useState(1);
  const modelsPerPage = 15;

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters, sortBy]);



  useEffect(() => {
    const fetchModels = async () => {
      try {
        setModelsLoading(true);
        const trending = await getTrendingModels(100);
        setPopularModels(trending.map(enrichModelData));
      } catch (error) {
        console.error('Failed to fetch tending models:', error);
      } finally {
        setModelsLoading(false);
      }
    };
    fetchModels();
  }, []);

  // Debounce search effect
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

  // Click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setActiveFilter(null);
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
          return;
        case 'Enter':
          e.preventDefault();
          if (selectedIndex >= 0 && suggestions[selectedIndex]) {
            setSearchQuery(suggestions[selectedIndex].id);
            onSearch(suggestions[selectedIndex].id);
            setShowSuggestions(false);
            setSelectedIndex(-1);
          } else if (searchQuery.trim()) {
            onSearch(searchQuery.trim());
            setShowSuggestions(false);
          }
          return;
        default:
          break;
      }
    } else if (e.key === 'Enter' && searchQuery.trim()) {
      e.preventDefault();
      onSearch(searchQuery.trim());
    }
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

  const clearQuery = () => {
    setSearchQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
    setSelectedIndex(-1);
  };

  const filterOptions = {
    architecture: ['Transformer', 'Mistral', 'Llama', 'Phi', 'Gemma', 'Qwen'],
    parameters: ['< 3B', '3B - 10B', '10B - 30B', '> 30B'],
    license: ['Apache-2.0', 'MIT', 'Llama-3', 'CreativeML', 'Other'],
    pipeline: ['Text Generation', 'Text-to-Image', 'Image-to-Text', 'Text-to-Speech', 'Speech Recognition', 'Image Classification', 'Object Detection', 'Conversational', 'Code Generation', 'Other'],
    sort: [
      { id: 'latest', label: 'Latest Trending' },
      { id: 'downloads', label: 'Most Downloads' },
      { id: 'likes', label: 'Most Likes' },
      { id: 'parameters', label: 'Parameters Size' }
    ]
  };

  const getFilteredModels = () => {
    let result = [...popularModels];

    if (filters.architecture.length > 0) {
      result = result.filter(m => filters.architecture.some(a => m.name.toLowerCase().includes(a.toLowerCase())));
    }
    
    if (filters.parameters.length > 0) {
      result = result.filter(m => {
        if (!m.vramEstimates?.totalParams) return false;
        const p = m.vramEstimates.totalParams;
        return filters.parameters.some(param => {
          if (param === '< 3B') return p < 3;
          if (param === '3B - 10B') return p >= 3 && p <= 10;
          if (param === '10B - 30B') return p > 10 && p <= 30;
          if (param === '> 30B') return p > 30;
          return false;
        });
      });
    }

    if (filters.license.length > 0) {
      result = result.filter(m => {
        const lic = m.licenseInfo?.name;
        return filters.license.some(l => {
          if (l === 'Other') return !['Apache-2.0', 'MIT', 'Llama-3', 'CreativeML'].includes(lic);
          return lic === l;
        });
      });
    }

    if (filters.pipeline.length > 0) {
      result = result.filter(m => {
        const pText = m.pipelineText || 'Other';
        if (filters.pipeline.includes(pText)) return true;
        // If "Other" is selected, match anything not in the standard list
        if (filters.pipeline.includes('Other') && !filterOptions.pipeline.includes(pText)) return true;
        return false;
      });
    }

    if (sortBy === 'downloads') {
      result.sort((a, b) => (b.downloads || 0) - (a.downloads || 0));
    } else if (sortBy === 'likes') {
      result.sort((a, b) => (b.likes || 0) - (a.likes || 0));
    } else if (sortBy === 'parameters') {
      result.sort((a, b) => (b.vramEstimates?.totalParams || 0) - (a.vramEstimates?.totalParams || 0));
    }

    return result;
  };

  const filteredModels = getFilteredModels();
  const totalPages = Math.ceil(filteredModels.length / modelsPerPage);
  const startIndex = (currentPage - 1) * modelsPerPage;
  const endIndex = Math.min(startIndex + modelsPerPage, filteredModels.length);
  const displayModels = filteredModels.slice(startIndex, startIndex + modelsPerPage);

  const toggleFilter = (filterName) => {
    setActiveFilter(activeFilter === filterName ? null : filterName);
  };

  const handleFilterToggle = (type, value) => {
    setFilters(prev => {
      const current = prev[type];
      if (current.includes(value)) {
        return { ...prev, [type]: current.filter(v => v !== value) };
      } else {
        return { ...prev, [type]: [...current, value] };
      }
    });
  };

  const clearFilter = (type, e) => {
    e.stopPropagation();
    setFilters(prev => ({ ...prev, [type]: [] }));
  };

  const currentSortLabel = filterOptions.sort.find(s => s.id === sortBy)?.label.toUpperCase();

  return (
    <div className="min-h-screen">
      <section className="shell-container pb-8 pt-8 text-center sm:pt-12 lg:pt-20">
        <div className="editorial-panel soft-grid rounded-[28px] px-4 py-10 sm:rounded-[36px] sm:px-8 sm:py-14 lg:px-16 lg:py-24">
          <div className="mx-auto max-w-5xl">
            <h1 className="mx-auto max-w-4xl text-3xl font-black tracking-tight text-[var(--text-strong)] sm:text-5xl lg:text-[4.9rem] lg:leading-[1]">
              The Architect&apos;s Workspace for LLMs
            </h1>
            <p className="mx-auto mt-4 max-w-3xl text-base font-medium leading-relaxed text-[var(--text-muted)] sm:mt-6 sm:text-xl lg:text-[2rem] lg:leading-[1.35]">
              Search across 500,000+ open-source models with high-precision technical metadata.
            </p>

            <div className="mx-auto mt-8 max-w-4xl sm:mt-12" ref={searchContainerRef}>
              <div className="group relative">
                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-faint)] transition-colors group-focus-within:text-[var(--accent)] sm:left-6 sm:h-5 sm:w-5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                  onKeyDown={handleKeyDown}
                  className="w-full rounded-[20px] border border-[var(--border-soft)] bg-white px-12 py-4 text-base font-medium text-[var(--text-main)] shadow-[0_16px_40px_rgba(48,67,95,0.08)] outline-none transition-all placeholder:text-[var(--text-faint)] focus:border-[var(--border-strong)] focus:ring-4 focus:ring-[rgba(53,87,132,0.08)] sm:rounded-[22px] sm:px-16 sm:py-5 sm:text-lg"
                  placeholder="Search models by name, task, or architecture..."
                  disabled={loading}
                />
                
                {searchQuery && (
                  <button
                    type="button"
                    onClick={clearQuery}
                    className="absolute right-12 top-1/2 -translate-y-1/2 rounded-lg p-1.5 transition-colors hover:bg-[var(--panel-muted)] sm:right-16"
                  >
                    <X className="h-4 w-4 text-[var(--text-faint)] hover:text-[var(--text-main)] sm:h-5 sm:w-5" />
                  </button>
                )}

                {(loading || searchLoading) && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 sm:right-6">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--accent)] border-t-transparent sm:h-5 sm:w-5"></div>
                  </div>
                )}

                {/* Dropdown Menu */}
                {showSuggestions && (
                  <div className="absolute top-[calc(100%+12px)] z-[60] w-full overflow-hidden rounded-[22px] border border-[var(--border-soft)] bg-white shadow-[0_24px_60px_rgba(48,67,95,0.12)]">
                    {suggestions.length > 0 ? (
                      <>
                        <div className="flex flex-col gap-1 border-b border-[var(--border-soft)] bg-[var(--panel-muted)] px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                          <span className="text-xs font-bold uppercase tracking-[0.15em] text-[var(--text-muted)]">
                            {suggestions.length} models found
                          </span>
                          <span className="text-[11px] text-[var(--text-faint)] sm:text-xs">
                            Use arrows to navigate and Enter to select
                          </span>
                        </div>
                        <div ref={listRef} className="max-h-[400px] overflow-y-auto">
                          {suggestions.map((model, index) => {
                            const modelSize = parseModelSize(model.id);
                            const isSelected = index === selectedIndex;
                            return (
                              <button
                                key={model.id}
                                onClick={() => {
                                  setSearchQuery(model.id);
                                  onSearch(model.id);
                                  setShowSuggestions(false);
                                  setSelectedIndex(-1);
                                }}
                                className={`group w-full cursor-pointer border-b border-[var(--border-soft)] px-4 py-4 text-left transition-colors last:border-b-0 sm:px-6 ${
                                  isSelected
                                    ? 'border-l-4 border-l-[var(--accent)] bg-[var(--panel-muted)]'
                                    : 'border-l-4 border-l-transparent hover:bg-[rgba(243,247,252,0.8)]'
                                }`}
                              >
                                <div className="flex items-start justify-between gap-4">
                                  <div className="min-w-0 flex-1">
                                    <div className="mb-2 truncate text-sm font-bold text-[var(--text-strong)] transition-colors group-hover:text-[var(--accent)] sm:text-[15px]">
                                      {highlightMatch(model.id, searchQuery)}
                                    </div>
                                    <div className="flex flex-wrap items-center gap-2.5">
                                      {modelSize && (
                                        <span className="flex items-center gap-1 rounded bg-[var(--accent-soft)] px-2 py-0.5 text-xs font-semibold text-[var(--accent)]">
                                          <Cpu className="h-3 w-3" />
                                          {modelSize}
                                        </span>
                                      )}
                                      {model.pipeline_tag && (
                                        <span className="rounded bg-[rgba(56,189,248,0.1)] px-2 py-0.5 text-xs font-semibold text-[rgb(14,165,233)]">
                                          {model.pipeline_tag}
                                        </span>
                                      )}
                                      <span className="flex items-center gap-1 text-xs font-medium text-[var(--text-muted)]">
                                        <TrendingUp className="h-3 w-3 text-[rgb(34,197,94)]" />
                                        {formatNumber(model.downloads || 0)}
                                      </span>
                                      {model.likes > 0 && (
                                        <span className="flex items-center gap-1 text-xs font-medium text-[var(--text-muted)]">
                                          <Heart className="h-3 w-3 text-[rgb(236,72,153)]" />
                                          {formatNumber(model.likes)}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  <div
                                    className={`hidden self-center text-[var(--accent)] transition-opacity sm:block ${
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
                      searchQuery.length >= 2 && (
                        <div className="px-6 py-12 text-center">
                          <Search className="mx-auto mb-4 h-8 w-8 text-[var(--text-faint)]" />
                          <p className="mb-1 text-[15px] font-bold text-[var(--text-main)]">
                            No models found for "{searchQuery}"
                          </p>
                          <p className="text-sm text-[var(--text-muted)]">
                            Try a different keyword, or search with the full model ID (e.g., author/model-name)
                          </p>
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mt-4 border-y border-[var(--border-soft)] bg-[rgba(255,255,255,0.6)] sm:mt-6">
        <div className="shell-container grid grid-cols-2 divide-y divide-[var(--border-soft)] md:grid-cols-4 md:divide-x md:divide-y-0">
          <FeatureItem icon={Terminal} text="CLI ACCESS" />
          <FeatureItem icon={CheckCircle} text="VERIFIED MODELS" />
          <FeatureItem icon={Cloud} text="DIRECT WEIGHTS" />
          <FeatureItem icon={BarChart3} text="USAGE METRICS" />
        </div>
      </div>

      <section className="shell-container py-8 sm:py-12">
        <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between" ref={filterRef}>
          <div className="hide-scrollbar relative -mx-4 flex w-[calc(100%+2rem)] items-center gap-3 overflow-x-auto overflow-y-visible px-4 pb-2 md:mx-0 md:w-auto md:px-0 md:pb-0">
            {['architecture', 'parameters', 'license', 'pipeline'].map((type) => {
              const labelMap = { architecture: 'Architecture', parameters: 'Parameters', license: 'License', pipeline: 'Pipeline Tag'};
              const label = labelMap[type];
              const selectedValues = filters[type];
              const isActive = selectedValues.length > 0;
              const isOpen = activeFilter === type;
              
              let displayText = label;
              if (selectedValues.length === 1) displayText = `${label}: ${selectedValues[0]}`;
              else if (selectedValues.length > 1) displayText = `${label}: ${selectedValues.length} selected`;

              return (
                <div key={type} className="relative shrink-0">
                  <div className={`flex whitespace-nowrap items-center gap-1 rounded-xl border px-1 py-1 text-sm font-semibold shadow-[0_8px_18px_rgba(52,75,104,0.04)] transition-colors ${
                      isActive || isOpen 
                        ? 'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]' 
                        : 'border-[var(--border-soft)] bg-white text-[var(--text-main)] hover:bg-[var(--panel-muted)]'
                    }`}
                  >
                    <button onClick={() => toggleFilter(type)} className="flex items-center gap-1.5 px-3 py-1.5">
                      {displayText} <ChevronDown className={`h-3 w-3 transition-transform ${isOpen ? 'rotate-180' : ''} ${isActive ? 'text-[var(--accent)]' : 'text-[var(--text-faint)]'}`} />
                    </button>
                    {isActive && (
                      <button onClick={(e) => clearFilter(type, e)} className="pr-3 pl-1 py-1.5 text-[var(--accent)] hover:text-[var(--accent-strong)] transition-colors">
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>

                  {isOpen && (
                    <div className="absolute left-0 top-[calc(100%+8px)] z-[60] min-w-[220px] max-w-[min(18rem,calc(100vw-2rem))] rounded-xl border border-[var(--border-soft)] bg-white py-2 shadow-xl">
                      {filterOptions[type].map(opt => {
                        const isSelected = selectedValues.includes(opt);
                        return (
                          <button
                            key={opt}
                            onClick={() => handleFilterToggle(type, opt)}
                            className="flex w-full items-center justify-between gap-4 px-4 py-2 text-left text-sm font-medium text-[var(--text-main)] transition-colors hover:bg-[var(--panel-muted)]"
                          >
                            <span className="break-words">{opt}</span>
                            <div className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${isSelected ? 'border-[var(--accent)] bg-[var(--accent)]' : 'border-[var(--border-strong)] bg-white text-transparent'}`}>
                              {isSelected && <svg className="h-2.5 w-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="relative flex w-full flex-wrap items-center justify-between gap-4 md:w-auto md:flex-nowrap md:justify-end md:gap-6">
            <div className="relative">
              <button 
                onClick={(e) => { e.stopPropagation(); toggleFilter('sort'); }}
                className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--accent)] transition-colors hover:text-[var(--accent-strong)] sm:text-xs sm:tracking-[0.2em]"
              >
                <AlignLeft className="h-[14px] w-[14px]" /> SORT: {currentSortLabel}
              </button>
              
              {activeFilter === 'sort' && (
                <div className="absolute left-0 top-[calc(100%+12px)] z-[60] w-56 rounded-xl border border-[var(--border-soft)] bg-white py-2 shadow-xl md:left-auto md:right-0">
                  {filterOptions.sort.map(opt => (
                    <button
                      key={opt.id}
                      onClick={() => { setSortBy(opt.id); setActiveFilter(null); }}
                      className={`w-full px-4 py-2 text-left text-sm font-bold uppercase tracking-[0.1em] transition-colors hover:bg-[var(--panel-muted)] ${
                        sortBy === opt.id ? 'bg-[var(--accent-soft)] text-[var(--accent)]' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            <button className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--text-muted)] transition-colors hover:text-[var(--text-strong)] sm:border-l sm:border-[var(--border-soft)] sm:pl-6 sm:text-xs sm:tracking-[0.2em]">
              <SlidersHorizontal className="h-[14px] w-[14px]" /> ADVANCED
            </button>
          </div>
        </div>

        <div className="editorial-panel overflow-hidden rounded-[28px]">
          <div className="hidden overflow-x-auto lg:block">
            <table className="w-full whitespace-nowrap text-left text-[15px]">
              <thead className="bg-[var(--panel-muted)] text-[11px] font-bold uppercase tracking-[0.24em] text-[var(--text-muted)]">
                <tr>
                  <th className="w-[360px] px-8 py-6">Model Name</th>
                  <th className="px-5 py-6">Parameters</th>
                  <th className="px-5 py-6">Downloads</th>
                  <th className="px-5 py-6">License</th>
                  <th className="px-5 py-6">VRAM</th>
                  <th className="px-5 py-6">Context</th>
                  <th className="px-5 py-6">Pipeline</th>
                </tr>
              </thead>
              <tbody>
                {modelsLoading ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-16 text-center text-[var(--text-muted)]">
                      <div className="mb-3 inline-block h-6 w-6 animate-spin rounded-full border-2 border-[var(--accent)] border-t-transparent" />
                      <div>Loading models...</div>
                    </td>
                  </tr>
                ) : displayModels.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-16 text-center text-[var(--text-muted)]">
                      No models found.
                    </td>
                  </tr>
                ) : (
                  displayModels.map((model, i) => {
                    const times = ['2h ago', '1d ago', '5h ago', '12h ago', '3d ago'];
                    const time = times[i % times.length];

                    let PipelineIcon = MessageSquare;
                    const pText = model.pipelineText || 'Other';
                    
                    if (pText.includes('Generation') || pText.includes('Text')) PipelineIcon = Terminal;
                    if (pText.includes('Image') || pText.includes('Vision') || pText.includes('Detection')) PipelineIcon = ImageIcon;
                    if (pText.includes('Speech') || pText.includes('Audio')) PipelineIcon = Mic;
                    if (pText.includes('Conversational')) PipelineIcon = MessageSquare;
                    if (pText.includes('Classification')) PipelineIcon = Scan;

                    return (
                      <tr key={model.modelId} className="group border-b border-[var(--border-soft)] bg-white transition-colors hover:bg-[rgba(243,247,252,0.8)]">
                        <td className="px-8 py-6">
                          <button
                            onClick={() => onSearch(model.modelId)}
                            className="block w-[300px] cursor-pointer truncate text-left text-[17px] font-extrabold text-[var(--accent)] transition-colors hover:text-[var(--accent-strong)]"
                          >
                            {model.name}
                          </button>
                          <div className="mt-2 text-[12px] font-medium text-[var(--text-faint)]">Updated {time}</div>
                        </td>
                        <td className="px-5 py-4 font-medium text-[var(--text-main)]">{model.rawParams}</td>
                        <td className="px-5 py-4 font-medium text-[var(--text-main)]">{formatNumber(model.downloads)}</td>
                        <td className="px-5 py-4">
                          <span className="inline-block rounded-full bg-[var(--accent-soft)] px-3 py-1 text-[11px] font-bold tracking-[0.14em] text-[var(--accent)]">
                            {model.licenseInfo.name}
                          </span>
                        </td>
                        <td className="px-5 py-4 font-medium text-[var(--text-main)]">{model.vramEstimates?.fp16} GB</td>
                        <td className="px-5 py-4 font-medium text-[var(--text-main)]">
                          {model.config?.max_position_embeddings > 0 ? `${model.config.max_position_embeddings / 1000}k` : 'N/A'}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2 font-medium text-[var(--text-muted)]">
                            <PipelineIcon className="h-3.5 w-3.5" />
                            <span className="text-[13px]">{pText}</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="grid gap-0 lg:hidden">
            {modelsLoading ? (
              <div className="px-6 py-16 text-center text-[var(--text-muted)]">
                <div className="mb-3 inline-block h-6 w-6 animate-spin rounded-full border-2 border-[var(--accent)] border-t-transparent" />
                <div>Loading models...</div>
              </div>
            ) : displayModels.length === 0 ? (
              <div className="px-6 py-16 text-center text-[var(--text-muted)]">
                No models found.
              </div>
            ) : (
              displayModels.map((model, i) => {
                const times = ['2h ago', '1d ago', '5h ago', '12h ago', '3d ago'];
                const time = times[i % times.length];
                const pText = model.pipelineText || 'Other';

                return (
                  <article key={model.modelId} className="border-b border-[var(--border-soft)] bg-white p-5 last:border-b-0 sm:p-6">
                    <button
                      onClick={() => onSearch(model.modelId)}
                      className="block w-full text-left text-base font-extrabold text-[var(--accent)] transition-colors hover:text-[var(--accent-strong)] sm:text-lg"
                    >
                      <span className="line-clamp-2 break-words">{model.name}</span>
                    </button>
                    <div className="mt-2 text-[12px] font-medium text-[var(--text-faint)]">Updated {time}</div>

                    <div className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
                      <div className="rounded-2xl bg-[var(--panel-muted)] px-3 py-2">
                        <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--text-faint)]">Parameters</div>
                        <div className="mt-1 font-semibold text-[var(--text-main)]">{model.rawParams}</div>
                      </div>
                      <div className="rounded-2xl bg-[var(--panel-muted)] px-3 py-2">
                        <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--text-faint)]">Downloads</div>
                        <div className="mt-1 font-semibold text-[var(--text-main)]">{formatNumber(model.downloads)}</div>
                      </div>
                      <div className="rounded-2xl bg-[var(--panel-muted)] px-3 py-2">
                        <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--text-faint)]">VRAM</div>
                        <div className="mt-1 font-semibold text-[var(--text-main)]">{model.vramEstimates?.fp16} GB</div>
                      </div>
                      <div className="rounded-2xl bg-[var(--panel-muted)] px-3 py-2">
                        <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--text-faint)]">Context</div>
                        <div className="mt-1 font-semibold text-[var(--text-main)]">
                          {model.config?.max_position_embeddings > 0 ? `${model.config.max_position_embeddings / 1000}k` : 'N/A'}
                        </div>
                      </div>
                      <div className="col-span-2 rounded-2xl bg-[var(--panel-muted)] px-3 py-2 sm:col-span-1">
                        <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--text-faint)]">License</div>
                        <div className="mt-1 break-words font-semibold text-[var(--text-main)]">{model.licenseInfo.name}</div>
                      </div>
                      <div className="col-span-2 rounded-2xl bg-[var(--panel-muted)] px-3 py-2 sm:col-span-3">
                        <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--text-faint)]">Pipeline</div>
                        <div className="mt-1 break-words font-semibold text-[var(--text-main)]">{pText}</div>
                      </div>
                    </div>
                  </article>
                );
              })
            )}
          </div>

          <div className="flex flex-col items-stretch justify-between gap-4 border-t border-[var(--border-soft)] bg-[rgba(245,248,251,0.92)] px-4 py-5 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)] sm:px-6 sm:text-xs sm:tracking-[0.18em] md:flex-row md:items-center">
            <div className="text-center md:text-left">Showing {filteredModels.length > 0 ? `${startIndex + 1}-${endIndex}` : 0} of {filteredModels.length} {filteredModels.length !== popularModels.length ? '(filtered) ' : ''}models</div>
            <div className="flex flex-wrap items-center justify-center gap-2 md:justify-end">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-2 py-1 transition-colors hover:text-[var(--text-strong)] disabled:opacity-50"
              >
                PREVIOUS
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).slice(0, 8).map(page => (
                <button 
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold leading-none shadow-sm transition-colors ${
                    currentPage === page 
                      ? 'bg-[var(--accent)] text-white' 
                      : 'text-[var(--text-muted)] hover:bg-white hover:text-[var(--text-main)]'
                  }`}
                >
                  {page}
                </button>
              ))}

              <button 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages || totalPages === 0}
                className="px-2 py-1 text-[var(--accent)] transition-colors hover:text-[var(--accent-strong)] disabled:opacity-50 disabled:text-[var(--text-muted)]"
              >
                NEXT
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
