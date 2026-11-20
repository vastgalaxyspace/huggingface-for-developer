"use client";
import Link from 'next/link';
import Image from 'next/image';
import { modelPath } from '../lib/modelIndexing';
import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  AlignLeft,
  BarChart3,
  ChevronDown,
  Code2,
  Cpu,
  Heart,
  Image as ImageIcon,
  MessageSquare,
  Mic,
  Scan,
  Search,
  SlidersHorizontal,
  Sparkles,
  Terminal,
  TrendingUp,
  X,
  Zap,
  Laptop,
  ShieldCheck,
  Filter,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
} from 'lucide-react';
import { getTrendingModels, searchModels } from '../services/huggingfaceClient';
import { parseModelSize, formatNumber, enrichModelData } from '../utils/modelUtils';

// ─── Constants ───────────────────────────────────────────────────────────────

const FILTER_LABELS = {
  architecture: 'Architecture',
  parameters: 'Parameters',
  license: 'License',
  pipeline: 'Pipeline',
};

const FILTER_DESCRIPTIONS = {
  architecture: 'Filter by model family or backbone style.',
  parameters: 'Narrow by model size range.',
  license: 'Focus on models with the licensing posture you need.',
  pipeline: 'Match the model to the task category you are exploring.',
};

const FILTER_EMPTY_STATES = {
  architecture: 'No architecture options available right now.',
  parameters: 'No parameter range options available right now.',
  license: 'No license options available right now.',
  pipeline: 'No pipeline tag options available right now.',
};

const PARAMETER_RANGES = {
  '< 3B': (p) => p < 3,
  '3B – 10B': (p) => p >= 3 && p <= 10,
  '10B – 30B': (p) => p > 10 && p <= 30,
  '> 30B': (p) => p > 30,
};

const PARAMETER_RANGE_HELPERS = {
  '< 3B': 'Lightweight, fits consumer GPUs.',
  '3B – 10B': 'Balanced for local inference.',
  '10B – 30B': 'Mid-large, stronger reasoning.',
  '> 30B': 'Large-scale, needs serious hardware.',
};

const CONTEXT_OPTIONS = [
  { value: '', label: 'Any context length' },
  { value: '4096', label: '4K tokens+' },
  { value: '8192', label: '8K tokens+' },
  { value: '16384', label: '16K tokens+' },
  { value: '32768', label: '32K tokens+' },
  { value: '65536', label: '64K tokens+' },
  { value: '131072', label: '128K tokens+' },
];

const DEFAULT_FILTER_OPTIONS = {
  architecture: ['Transformer', 'Mistral', 'Llama', 'Phi', 'Gemma', 'Qwen'],
  license: ['Apache-2.0', 'MIT', 'Llama-3', 'CreativeML', 'Gemma', 'Other'],
  pipeline: [
    'Text Generation', 'Text-to-Image', 'Image-to-Text', 'Text-to-Speech',
    'Speech Recognition', 'Image Classification', 'Object Detection',
    'Conversational', 'Code Generation', 'Other',
  ],
};

/**
 * QUICK PRESET FILTERS
 * These let users jump to curated filter states instantly.
 */
const QUICK_PRESETS = [
  {
    id: 'laptop',
    label: 'Run on Laptop',
    icon: Laptop,
    description: 'Models that fit under 8 GB VRAM',
    filters: { architecture: [], parameters: ['< 3B'], license: [], pipeline: [] },
    advanced: { maxVram: '8', minContext: '', commercialOnly: false },
  },
  {
    id: 'commercial',
    label: 'Commercial Ready',
    icon: ShieldCheck,
    description: 'Permissive licensed models only',
    filters: { architecture: [], parameters: [], license: ['Apache-2.0', 'MIT'], pipeline: [] },
    advanced: { maxVram: '', minContext: '', commercialOnly: true },
  },
  {
    id: 'longcontext',
    label: 'Long Context',
    icon: AlignLeft,
    description: '32K+ token context window',
    filters: { architecture: [], parameters: [], license: [], pipeline: [] },
    advanced: { maxVram: '', minContext: '32768', commercialOnly: false },
  },
  {
    id: 'codegen',
    label: 'Code Generation',
    icon: Code2,
    description: 'Models built for coding tasks',
    filters: { architecture: [], parameters: [], license: [], pipeline: ['Code Generation'] },
    advanced: { maxVram: '', minContext: '', commercialOnly: false },
  },
  {
    id: 'vision',
    label: 'Vision & Image',
    icon: ImageIcon,
    description: 'Image understanding and generation',
    filters: { architecture: [], parameters: [], license: [], pipeline: ['Text-to-Image', 'Image-to-Text', 'Image Classification'] },
    advanced: { maxVram: '', minContext: '', commercialOnly: false },
  },
  {
    id: 'efficient',
    label: 'Efficient Mid-Size',
    icon: Zap,
    description: 'Best performance-per-parameter',
    filters: { architecture: [], parameters: ['3B – 10B'], license: [], pipeline: [] },
    advanced: { maxVram: '', minContext: '', commercialOnly: false },
  },
];

const SORT_OPTIONS = [
  { id: 'latest', label: 'Latest Trending' },
  { id: 'downloads', label: 'Most Downloads' },
  { id: 'likes', label: 'Most Likes' },
  { id: 'parameters', label: 'Parameter Size' },
];

const faqItems = [
  {
    question: 'How much VRAM do I need for a 7B model?',
    answer: 'That depends on precision, quantization, batch size, and context length. A VRAM calculator helps estimate whether a 7B model fits on consumer GPUs, workstation cards, or server hardware. In full FP16 precision, expect roughly 14 GB; with 4-bit quantization, around 4–5 GB.',
  },
  {
    question: 'What is the best way to compare Hugging Face models?',
    answer: 'Start with task fit, parameter size, context window, license, and deployment cost. Then use LLM comparison and GPU sizing tools to validate whether the model fits your hardware and product constraints.',
  },
  {
    question: 'Can I use this site as an AI model recommender?',
    answer: 'Yes. The recommender helps narrow down open-source models based on use case, constraints, and infrastructure so you can move from browsing to a practical shortlist faster.',
  },
  {
    question: 'Why does GPU sizing matter before deployment?',
    answer: 'GPU sizing directly affects latency, throughput, hosting cost, and whether a model can run at all in production. Estimating VRAM and hardware fit early prevents expensive deployment mistakes.',
  },
  {
    question: 'What does the pipeline tag filter do?',
    answer: 'Pipeline tags describe the primary task a model is designed for—text generation, image classification, speech recognition, etc. Filtering by pipeline quickly narrows down models relevant to your specific application.',
  },
  {
    question: 'Are all listed models free to use commercially?',
    answer: 'No. License terms vary widely. Apache-2.0 and MIT models are generally permissive, while Llama or Gemma licenses have specific restrictions. Use the "Commercial Ready" preset or license filter to see only commercially viable options.',
  },
];

// ─── JSON-LD Structured Data ──────────────────────────────────────────────────

const JSON_LD_WEBSITE = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'InnoAI — Hugging Face Model Explorer',
  description:
    'Search 500,000+ open-source AI models with technical metadata. Compare LLMs, estimate VRAM, and plan GPU deployment.',
  url: 'https://innoai.space',
  potentialAction: {
    '@type': 'SearchAction',
    target: 'https://innoai.space/?q={search_term_string}',
    'query-input': 'required name=search_term_string',
  },
};

const JSON_LD_FAQ = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqItems.map((item) => ({
    '@type': 'Question',
    name: item.question,
    acceptedAnswer: { '@type': 'Answer', text: item.answer },
  })),
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const getPipelineIcon = (pText = '') => {
  if (pText.includes('Image') || pText.includes('Vision') || pText.includes('Detection')) return ImageIcon;
  if (pText.includes('Speech') || pText.includes('Audio')) return Mic;
  if (pText.includes('Classification')) return Scan;
  if (pText.includes('Conversational')) return MessageSquare;
  if (pText.includes('Generation') || pText.includes('Text') || pText.includes('Code')) return Terminal;
  return MessageSquare;
};

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (currentPage <= 4) return [1, 2, 3, 4, 5, '...', totalPages];
    if (currentPage >= totalPages - 3) return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
  };

  return (
    <div className="flex flex-wrap items-center justify-center gap-1.5">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Previous page"
        className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border-soft)] text-[var(--text-muted)] transition-colors hover:bg-white hover:text-[var(--text-main)] disabled:opacity-40 disabled:pointer-events-none"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      {getPageNumbers().map((page, i) =>
        page === '...' ? (
          <span key={`ellipsis-${i}`} className="flex h-8 w-8 items-center justify-center text-[var(--text-faint)]">
            <MoreHorizontal className="h-4 w-4" />
          </span>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            aria-label={`Page ${page}`}
            aria-current={currentPage === page ? 'page' : undefined}
            className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold transition-colors ${
              currentPage === page
                ? 'bg-[var(--accent)] text-white shadow-sm'
                : 'border border-[var(--border-soft)] text-[var(--text-muted)] hover:bg-white hover:text-[var(--text-main)]'
            }`}
          >
            {page}
          </button>
        )
      )}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="Next page"
        className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border-soft)] text-[var(--accent)] transition-colors hover:bg-white hover:text-[var(--accent-strong)] disabled:opacity-40 disabled:pointer-events-none"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
};

// ─── Filter Dropdown ──────────────────────────────────────────────────────────

const FilterDropdown = ({ type, label, options, selected, onToggle, onClear, description, emptyState }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef(null);
  const isActive = selected.length > 0;

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setIsOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = options.filter(({ option }) =>
    !search || option.toLowerCase().includes(search.toLowerCase())
  );

  let displayText = label;
  if (selected.length === 1) displayText = `${label}: ${selected[0]}`;
  else if (selected.length > 1) displayText = `${label} (${selected.length})`;

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        onClick={() => setIsOpen((o) => !o)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        className={`flex whitespace-nowrap items-center gap-2 rounded-2xl border px-4 py-2.5 text-[15px] font-semibold transition-colors ${
          isActive || isOpen
            ? 'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]'
            : 'border-[var(--border-soft)] bg-white text-[var(--text-main)] hover:bg-[var(--panel-muted)]'
        }`}
      >
        <Filter className="h-3.5 w-3.5" />
        {displayText}
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        {isActive && (
          <span className="ml-1 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--accent)] text-[10px] font-black text-white">
            {selected.length}
          </span>
        )}
      </button>

      {isActive && (
        <button
          onClick={(e) => { e.stopPropagation(); onClear(); }}
          aria-label={`Clear ${label} filter`}
          className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--accent)] text-white shadow-sm hover:bg-[var(--accent-strong)] transition-colors z-10"
        >
          <X className="h-3 w-3" />
        </button>
      )}

      {isOpen && (
        <div
          role="listbox"
          aria-multiselectable="true"
          className="absolute left-0 top-[calc(100%+10px)] z-[80] w-[min(22rem,calc(100vw-2rem))] rounded-2xl border border-[var(--border-soft)] bg-white p-3 shadow-[0_20px_48px_rgba(48,67,95,0.14)]"
        >
          <div className="mb-3 px-2">
            <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--accent)]">{label}</div>
            <p className="mt-1 text-xs text-[var(--text-muted)]">{description}</p>
          </div>

          {/* Search within filter */}
          <div className="relative mb-2">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--text-faint)]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={`Search ${label.toLowerCase()}…`}
              className="w-full rounded-xl border border-[var(--border-soft)] bg-[var(--panel-muted)] py-2 pl-8 pr-3 text-xs text-[var(--text-main)] outline-none focus:border-[var(--accent)]"
            />
          </div>

          {/* Select/Deselect all */}
          {filtered.length > 1 && (
            <div className="mb-1.5 flex gap-2 px-1">
              <button
                onClick={() => filtered.forEach(({ option }) => { if (!selected.includes(option)) onToggle(option); })}
                className="text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--accent)] hover:underline"
              >
                Select all
              </button>
              <span className="text-[var(--border-strong)]">·</span>
              <button onClick={onClear} className="text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--text-muted)] hover:underline">
                Clear
              </button>
            </div>
          )}

          <div className="max-h-[280px] gap-1 overflow-y-auto grid">
            {filtered.length === 0 && (
              <div className="rounded-xl border border-dashed border-[var(--border-soft)] px-4 py-6 text-center text-sm text-[var(--text-muted)]">
                {search ? `No results for "${search}"` : emptyState}
              </div>
            )}
            {filtered.map(({ option, count }) => {
              const isSelected = selected.includes(option);
              return (
                <button
                  key={option}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => onToggle(option)}
                  className={`flex items-center justify-between gap-4 rounded-xl px-4 py-3 text-left text-sm font-medium transition-colors ${
                    isSelected
                      ? 'bg-[var(--accent-soft)] text-[var(--accent)]'
                      : 'bg-white text-[var(--text-main)] hover:bg-[var(--panel-muted)]'
                  }`}
                >
                  <div className="min-w-0">
                    <span className="block break-words text-sm font-semibold">{option}</span>
                    {type === 'parameters' && (
                      <span className="mt-0.5 block text-xs leading-5 text-[var(--text-muted)]">
                        {PARAMETER_RANGE_HELPERS[option]}
                      </span>
                    )}
                    <span className="mt-0.5 block text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--text-faint)]">
                      {count} model{count !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div
                    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${
                      isSelected ? 'border-[var(--accent)] bg-[var(--accent)] text-white' : 'border-[var(--border-strong)] bg-white'
                    }`}
                  >
                    {isSelected && (
                      <svg className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

const HomePage = ({ onSearch, loading, initialModels = [] }) => {

  const [popularModels, setPopularModels] = useState(initialModels);
  const [modelsLoading, setModelsLoading] = useState(initialModels.length === 0);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [activePreset, setActivePreset] = useState(null);

  const searchContainerRef = useRef(null);
  const listRef = useRef(null);
  const sortRef = useRef(null);
  const advancedRef = useRef(null);

  const [filters, setFilters] = useState({
    architecture: [],
    parameters: [],
    license: [],
    pipeline: [],
  });
  const [advancedFilters, setAdvancedFilters] = useState({
    maxVram: '',
    minContext: '',
    commercialOnly: false,
  });
  const [sortBy, setSortBy] = useState('latest');
  const [sortOpen, setSortOpen] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const MODELS_PER_PAGE = 15;

  useEffect(() => {
    const query = new URLSearchParams(window.location.search).get('q');
    if (query) setSearchQuery(query);
  }, []);

  // ── Data fetching ────────────────────────────────────────────────────────

  useEffect(() => {
    if (initialModels.length > 0) {
      setPopularModels(initialModels);
      setModelsLoading(false);
      return;
    }

    (async () => {
      try {
        setModelsLoading(true);
        const trending = await getTrendingModels(100);
        setPopularModels(trending.map(enrichModelData));
      } catch (err) {
        console.error('Failed to fetch trending models:', err);
      } finally {
        setModelsLoading(false);
      }
    })();
  }, [initialModels]);

  // ── Search debounce ──────────────────────────────────────────────────────

  useEffect(() => {
    if (searchQuery.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      setSearchLoading(false);
      setSelectedIndex(-1);
      return;
    }
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const results = await searchModels(searchQuery, 10, { signal: controller.signal });
        if (controller.signal.aborted) return;
        setSuggestions(results);
        setShowSuggestions(true);
        setSelectedIndex(-1);
      } catch {
        setSuggestions([]);
      } finally {
        if (!controller.signal.aborted) setSearchLoading(false);
      }
    }, 300);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [searchQuery]);

  // ── Outside click ────────────────────────────────────────────────────────

  useEffect(() => {
    const handler = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
      if (sortRef.current && !sortRef.current.contains(e.target)) setSortOpen(false);
      if (advancedRef.current && !advancedRef.current.contains(e.target)) setAdvancedOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // ── Scroll selected suggestion into view ─────────────────────────────────

  useEffect(() => {
    if (selectedIndex >= 0 && listRef.current) {
      listRef.current.children[selectedIndex]?.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex]);

  // ── Reset page on filter change ──────────────────────────────────────────

  useEffect(() => { setCurrentPage(1); }, [filters, advancedFilters, sortBy]);

  // ── Keyboard navigation ──────────────────────────────────────────────────

  const handleKeyDown = (e) => {
    if (showSuggestions && suggestions.length > 0) {
      if (e.key === 'ArrowDown') { e.preventDefault(); setSelectedIndex((p) => (p < suggestions.length - 1 ? p + 1 : 0)); return; }
      if (e.key === 'ArrowUp') { e.preventDefault(); setSelectedIndex((p) => (p > 0 ? p - 1 : suggestions.length - 1)); return; }
      if (e.key === 'Escape') { setShowSuggestions(false); setSelectedIndex(-1); return; }
      if (e.key === 'Enter') {
        e.preventDefault();
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          handleSuggestionSelect(suggestions[selectedIndex].id);
        } else if (searchQuery.trim()) {
          handleSuggestionSelect(searchQuery.includes('/') ? searchQuery.trim() : suggestions[0].id);
          setShowSuggestions(false);
        }
        return;
      }
    } else if (e.key === 'Enter' && searchQuery.includes('/')) {
      e.preventDefault();
      onSearch(searchQuery.trim());
    }
  };

  const handleSuggestionSelect = (id) => {
    setSearchQuery(id);
    onSearch(id);
    setShowSuggestions(false);
    setSelectedIndex(-1);
  };

  const highlightMatch = (text, query) => {
    if (!query || query.length < 2) return text;
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.split(regex).map((part, i) =>
      regex.test(part) ? (
        <mark key={i} className="rounded bg-[var(--accent-soft)] px-0.5 text-[var(--accent)]">{part}</mark>
      ) : part
    );
  };

  // ── Filter logic ─────────────────────────────────────────────────────────

  const filterOptions = useMemo(() => {
    const unique = (items, fallback) => {
      const vals = Array.from(new Set(items.filter(Boolean)));
      return vals.length > 0 ? vals.sort((a, b) => a.localeCompare(b)) : fallback;
    };
    return {
      architecture: unique(popularModels.map((m) => m.architectureLabel), DEFAULT_FILTER_OPTIONS.architecture),
      parameters: Object.keys(PARAMETER_RANGES),
      license: unique(popularModels.map((m) => m.licenseInfo?.name || 'Other'), DEFAULT_FILTER_OPTIONS.license),
      pipeline: unique(popularModels.map((m) => m.pipelineText || 'Other'), DEFAULT_FILTER_OPTIONS.pipeline),
    };
  }, [popularModels]);

  const filteredModels = useMemo(() => {
    let result = [...popularModels];

    if (filters.architecture.length > 0)
      result = result.filter((m) => filters.architecture.includes(m.architectureLabel || 'Transformer'));

    if (filters.parameters.length > 0)
      result = result.filter((m) => {
        if (!m.vramEstimates?.totalParams) return false;
        return filters.parameters.some((p) => PARAMETER_RANGES[p]?.(m.vramEstimates.totalParams));
      });

    if (filters.license.length > 0)
      result = result.filter((m) => {
        const lic = m.licenseInfo?.name || 'Other';
        return filters.license.some((l) =>
          l === 'Other' ? !['Apache-2.0', 'MIT', 'Llama-3', 'CreativeML', 'Gemma'].includes(lic) : lic === l
        );
      });

    if (filters.pipeline.length > 0)
      result = result.filter((m) => {
        const pt = m.pipelineText || 'Other';
        if (filters.pipeline.includes(pt)) return true;
        if (filters.pipeline.includes('Other') && !filterOptions.pipeline.includes(pt)) return true;
        return false;
      });

    if (advancedFilters.maxVram)
      result = result.filter((m) => Number(m.vramEstimates?.fp16) > 0 && Number(m.vramEstimates.fp16) <= Number(advancedFilters.maxVram));

    if (advancedFilters.minContext)
      result = result.filter((m) => (m.config?.max_position_embeddings || 0) >= Number(advancedFilters.minContext));

    if (advancedFilters.commercialOnly)
      result = result.filter((m) => m.licenseInfo?.commercial);

    if (sortBy === 'downloads') result.sort((a, b) => (b.downloads || 0) - (a.downloads || 0));
    else if (sortBy === 'likes') result.sort((a, b) => (b.likes || 0) - (a.likes || 0));
    else if (sortBy === 'parameters') result.sort((a, b) => (b.vramEstimates?.totalParams || 0) - (a.vramEstimates?.totalParams || 0));

    return result;
  }, [popularModels, filters, advancedFilters, sortBy, filterOptions]);

  const totalPages = Math.ceil(filteredModels.length / MODELS_PER_PAGE);
  const startIndex = (currentPage - 1) * MODELS_PER_PAGE;
  const displayModels = filteredModels.slice(startIndex, startIndex + MODELS_PER_PAGE);

  const getOptionCounts = useCallback(
    (type) => {
      return filterOptions[type].map((option) => ({
        option,
        count: filteredModels.filter((m) => {
          if (type === 'architecture') return (m.architectureLabel || 'Transformer') === option;
          if (type === 'parameters') return PARAMETER_RANGES[option]?.(m.vramEstimates?.totalParams || 0);
          if (type === 'license') {
            const lic = m.licenseInfo?.name || 'Other';
            return option === 'Other' ? !filterOptions.license.filter((v) => v !== 'Other').includes(lic) : lic === option;
          }
          if (type === 'pipeline') {
            const pt = m.pipelineText || 'Other';
            return option === 'Other' ? !filterOptions.pipeline.filter((v) => v !== 'Other').includes(pt) : pt === option;
          }
          return false;
        }).length,
      })).filter(({ count }) => count > 0)
        .sort((a, b) => {
          const aSelected = filters[type].includes(a.option);
          const bSelected = filters[type].includes(b.option);
          if (aSelected !== bSelected) return aSelected ? -1 : 1;
          return b.count - a.count;
        });
    },
    [filteredModels, filterOptions, filters]
  );

  const toggleFilter = (type, value) => {
    setActivePreset(null);
    setFilters((prev) => ({
      ...prev,
      [type]: prev[type].includes(value) ? prev[type].filter((v) => v !== value) : [...prev[type], value],
    }));
  };

  const clearFilter = (type) => {
    setActivePreset(null);
    setFilters((prev) => ({ ...prev, [type]: [] }));
  };

  const clearAllFilters = () => {
    setActivePreset(null);
    setFilters({ architecture: [], parameters: [], license: [], pipeline: [] });
    setAdvancedFilters({ maxVram: '', minContext: '', commercialOnly: false });
    setSortBy('latest');
  };

  const applyPreset = (preset) => {
    if (activePreset === preset.id) {
      clearAllFilters();
      return;
    }
    setActivePreset(preset.id);
    setFilters(preset.filters);
    setAdvancedFilters(preset.advanced);
  };

  const activeBasicCount = Object.values(filters).reduce((n, v) => n + v.length, 0);
  const activeAdvancedCount = [advancedFilters.maxVram, advancedFilters.minContext, advancedFilters.commercialOnly].filter(Boolean).length;
  const totalActiveCount = activeBasicCount + activeAdvancedCount;

  const currentSortLabel = SORT_OPTIONS.find((s) => s.id === sortBy)?.label ?? 'Latest Trending';

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <>
      {/* ── Structured Data ──────────────────────────────────────────────── */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD_WEBSITE) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD_FAQ) }}
      />

      <div>

        <section className="shell-container studio-hero" aria-labelledby="hero-heading">
          <div className="hero-copy">
            <h1 id="hero-heading">Model <em>explorer.</em></h1>
            <p className="hero-summary">Explore open models, compare their capabilities, and find the hardware to run them.</p>
              {/* Search */}
              <div className="hero-search relative z-[80]" ref={searchContainerRef}>
                <div className="group relative">
                  <label htmlFor="model-search" className="sr-only">
                    Search open-source AI models
                  </label>
                  <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-faint)] transition-colors group-focus-within:text-[var(--accent)] sm:left-6 sm:h-5 sm:w-5" />
                  <input
                    id="model-search"
                    type="search"
                    autoComplete="off"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                    onKeyDown={handleKeyDown}
                    className="w-full rounded-[20px] border border-[var(--border-soft)] bg-white px-12 py-4 text-base font-medium text-[var(--text-main)] shadow-[0_16px_40px_rgba(48,67,95,0.08)] outline-none transition-all placeholder:text-[var(--text-faint)] focus:border-[var(--border-strong)] focus:ring-4 focus:ring-[rgba(53,87,132,0.08)] sm:rounded-[22px] sm:px-16 sm:py-5 sm:text-lg"
                    placeholder="Search Hugging Face models…"
                    disabled={loading}
                    // role="combobox" is required for these three attributes to be
                    // valid. Without it Lighthouse flags "[aria-*] attributes do not
                    // match their roles" and the accessibility tree is malformed for
                    // screen readers and agent browsers alike.
                    role="combobox"
                    aria-autocomplete="list"
                    aria-activedescendant={showSuggestions && selectedIndex >= 0 ? `model-option-${selectedIndex}` : undefined}
                    aria-controls="search-suggestions"
                    aria-expanded={showSuggestions}
                  />

                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => { setSearchQuery(''); setSuggestions([]); setShowSuggestions(false); }}
                      aria-label="Clear search"
                      className="absolute right-12 top-1/2 -translate-y-1/2 rounded-lg p-1.5 transition-colors hover:bg-[var(--panel-muted)] sm:right-16"
                    >
                      <X className="h-4 w-4 text-[var(--text-faint)] hover:text-[var(--text-main)] sm:h-5 sm:w-5" />
                    </button>
                  )}

                  {(loading || searchLoading) && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 sm:right-6" aria-label="Loading…">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--accent)] border-t-transparent sm:h-5 sm:w-5" />
                    </div>
                  )}

                  {/* Suggestion dropdown */}
                  {showSuggestions && (
                    <div
                      id="search-suggestions"
                      role="listbox"
                      className="absolute top-[calc(100%+12px)] z-[90] w-full overflow-hidden rounded-[22px] border border-[var(--border-soft)] bg-white shadow-[0_24px_60px_rgba(48,67,95,0.12)]"
                    >
                      {suggestions.length > 0 ? (
                        <>
                          <div className="flex flex-col gap-1 border-b border-[var(--border-soft)] bg-[var(--panel-muted)] px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                            <span className="text-xs font-bold uppercase tracking-[0.15em] text-[var(--text-muted)]">
                              {suggestions.length} models found
                            </span>
                            <span className="text-[11px] text-[var(--text-faint)]">↑↓ navigate · Enter select · Esc close</span>
                          </div>
                          <div ref={listRef} className="max-h-[400px] overflow-y-auto">
                            {suggestions.map((model, index) => {
                              const modelSize = parseModelSize(model.id);
                              const isSelected = index === selectedIndex;
                              return (
                                <button
                                  key={model.id}
                                  id={`model-option-${index}`}
                                  role="option"
                                  aria-selected={isSelected}
                                  onClick={() => handleSuggestionSelect(model.id)}
                                  className={`group w-full cursor-pointer border-b border-[var(--border-soft)] px-4 py-4 text-left transition-colors last:border-b-0 sm:px-6 ${
                                    isSelected ? 'border-l-4 border-l-[var(--accent)] bg-[var(--panel-muted)]' : 'border-l-4 border-l-transparent hover:bg-[rgba(243,247,252,0.8)]'
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
                                            <Cpu className="h-3 w-3" />{modelSize}
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
                                    <span className={`hidden self-center text-[var(--accent)] transition-opacity sm:block ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                                      →
                                    </span>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </>
                      ) : (
                        !searchLoading && searchQuery.length >= 2 && (
                          <div className="px-4 py-10 text-center sm:px-6 sm:py-12">
                            <Search className="mx-auto mb-4 h-8 w-8 text-[var(--text-faint)]" />
                            <p className="mb-1 text-[15px] font-bold text-[var(--text-main)]">No models found for &ldquo;{searchQuery}&rdquo;</p>
                            <p className="text-sm text-[var(--text-muted)]">Try a different keyword or search with the full model ID (e.g., author/model-name)</p>
                          </div>
                        )
                      )}
                    </div>
                  )}
                </div>
              </div>
            <div className="example-models"><span>Try</span>{[
              ['Llama 3.3', 'meta-llama/Llama-3.3-70B-Instruct'],
              ['Qwen3', 'Qwen/Qwen3-32B'],
              ['DeepSeek-R1', 'deepseek-ai/DeepSeek-R1'],
            ].map(([name, id]) => <Link key={id} href={modelPath(id)} prefetch={false}>{name}</Link>)}</div>
          </div>
          <figure className="hardware-plate">
            <Image src="/images/memory-stack.webp" alt="Exploded view of a GPU compute module" width={1140} height={855} sizes="(max-width: 680px) 100vw, 45vw" loading="eager" />
            <figcaption><Cpu size={15} aria-hidden="true" /> GPU compute module <span>Exploded view</span></figcaption>
          </figure>
        </section>
        <nav className="shell-container workbenches" aria-label="Model planning tools">
          {[
            [<BarChart3 aria-hidden="true" />, '/compare', 'Compare models', 'Review specs side by side'],
            [<Cpu aria-hidden="true" />, '/gpu/tools/vram-calculator', 'VRAM calculator', 'Estimate GPU memory'],
            [<SlidersHorizontal aria-hidden="true" />, '/recommender', 'Model recommender', 'Find a fit for your workload'],
          ].map(([icon, href, title, detail]) => <Link href={href} key={href}><i>{icon}</i><span><strong>{title}</strong><small>{detail}</small></span></Link>)}
        </nav>
        <section className="shell-container catalog" id="search" aria-labelledby="explorer-heading">
          <div className="catalog-heading"><h2 id="explorer-heading">Trending models</h2><span>Hugging Face catalog</span></div>
          <div className="preset-tabs" aria-label="Quick filters">
            <button aria-pressed={totalActiveCount === 0} onClick={clearAllFilters}>All models</button>
            {QUICK_PRESETS.map(preset => <button key={preset.id} title={preset.description} aria-pressed={activePreset === preset.id} onClick={() => applyPreset(preset)}>{preset.label}</button>)}
          </div>
          {/* ── Filter Bar ───────────────────────────────────────────────── */}
          <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            {/* Left: primary filters */}
            <div className="flex flex-wrap items-center gap-2.5">
              {['architecture', 'parameters', 'license', 'pipeline'].map((type) => (
                <FilterDropdown
                  key={type}
                  type={type}
                  label={FILTER_LABELS[type]}
                  options={getOptionCounts(type)}
                  selected={filters[type]}
                  onToggle={(v) => toggleFilter(type, v)}
                  onClear={() => clearFilter(type)}
                  description={FILTER_DESCRIPTIONS[type]}
                  emptyState={FILTER_EMPTY_STATES[type]}
                />
              ))}
            </div>

            {/* Right: sort + advanced */}
            <div className="flex flex-wrap items-center gap-4 md:flex-nowrap">
              {/* Sort */}
              <div ref={sortRef} className="relative">
                <button
                  onClick={() => { setSortOpen((o) => !o); setAdvancedOpen(false); }}
                  aria-expanded={sortOpen}
                  aria-haspopup="listbox"
                  className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--accent)] hover:text-[var(--accent-strong)] transition-colors sm:text-xs"
                >
                  <ArrowUpDown className="h-3.5 w-3.5" />
                  Sort: {currentSortLabel}
                </button>
                {sortOpen && (
                  <div role="listbox" className="absolute right-0 top-[calc(100%+10px)] z-[60] w-52 rounded-xl border border-[var(--border-soft)] bg-white py-2 shadow-xl">
                    {SORT_OPTIONS.map((opt) => (
                      <button
                        key={opt.id}
                        role="option"
                        aria-selected={sortBy === opt.id}
                        onClick={() => { setSortBy(opt.id); setSortOpen(false); }}
                        className={`w-full px-4 py-2.5 text-left text-sm font-semibold transition-colors hover:bg-[var(--panel-muted)] ${
                          sortBy === opt.id ? 'bg-[var(--accent-soft)] text-[var(--accent)]' : 'text-[var(--text-main)]'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Divider */}
              <span className="hidden h-4 w-px bg-[var(--border-soft)] sm:block" />

              {/* Advanced */}
              <div ref={advancedRef} className="relative">
                <button
                  onClick={() => { setAdvancedOpen((o) => !o); setSortOpen(false); }}
                  aria-expanded={advancedOpen}
                  className={`flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] transition-colors sm:text-xs ${
                    advancedOpen || activeAdvancedCount > 0 ? 'text-[var(--accent)]' : 'text-[var(--text-muted)] hover:text-[var(--text-strong)]'
                  }`}
                >
                  <SlidersHorizontal className="h-3.5 w-3.5" />
                  Advanced{activeAdvancedCount > 0 ? ` (${activeAdvancedCount})` : ''}
                </button>

                {advancedOpen && (
                  <div className="absolute right-0 top-[calc(100%+10px)] z-[60] w-[min(26rem,calc(100vw-2rem))] rounded-2xl border border-[var(--border-soft)] bg-white p-5 shadow-xl">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--accent)]">Advanced Filters</div>
                        <p className="mt-1 text-sm text-[var(--text-muted)]">Refine by VRAM, context, and commercial use.</p>
                      </div>
                      {totalActiveCount > 0 && (
                        <button onClick={clearAllFilters} className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--accent)] hover:text-[var(--accent-strong)]">
                          Clear All
                        </button>
                      )}
                    </div>

                    <div className="mt-5 grid gap-4">
                      {/* VRAM slider + input */}
                      <fieldset>
                        <legend className="mb-2 text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--text-muted)]">
                          Max VRAM{advancedFilters.maxVram ? ` — ${advancedFilters.maxVram} GB` : ''}
                        </legend>
                        <input
                          type="range"
                          min="1"
                          max="80"
                          step="1"
                          value={advancedFilters.maxVram || 80}
                          onChange={(e) => setAdvancedFilters((p) => ({ ...p, maxVram: e.target.value === '80' ? '' : e.target.value }))}
                          className="w-full accent-[var(--accent)]"
                          aria-label="Max VRAM in GB"
                        />
                        <div className="mt-1 flex justify-between text-[10px] text-[var(--text-faint)]">
                          <span>1 GB</span><span>No limit (80 GB)</span>
                        </div>
                      </fieldset>

                      {/* Context select */}
                      <label className="grid gap-2">
                        <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--text-muted)]">Minimum Context</span>
                        <select
                          value={advancedFilters.minContext}
                          onChange={(e) => setAdvancedFilters((p) => ({ ...p, minContext: e.target.value }))}
                          className="rounded-xl border border-[var(--border-soft)] bg-white px-4 py-3 text-sm text-[var(--text-main)] outline-none focus:border-[var(--accent)]"
                        >
                          {CONTEXT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                      </label>

                      {/* Commercial toggle */}
                      <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-[var(--border-soft)] bg-[var(--panel-muted)] px-4 py-3">
                        <div>
                          <div className="text-sm font-semibold text-[var(--text-main)]">Commercial-friendly only</div>
                          <div className="mt-0.5 text-xs text-[var(--text-muted)]">Hide models restricted from commercial deployment.</div>
                        </div>
                        <div className={`relative flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${advancedFilters.commercialOnly ? 'bg-[var(--accent)]' : 'bg-[var(--border-strong)]'}`}>
                          <input
                            type="checkbox"
                            checked={advancedFilters.commercialOnly}
                            onChange={(e) => setAdvancedFilters((p) => ({ ...p, commercialOnly: e.target.checked }))}
                            className="sr-only"
                          />
                          <span className={`absolute h-4 w-4 rounded-full bg-white shadow transition-transform ${advancedFilters.commercialOnly ? 'translate-x-6' : 'translate-x-1'}`} />
                        </div>
                      </label>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── Active filter pills ───────────────────────────────────────── */}
          {/* No list roles below: role="listitem" on a <button> replaces its button
              role, so assistive tech stops announcing these as clickable. A labelled
              group conveys the same grouping without breaking the controls. */}
          {totalActiveCount > 0 && (
            <div className="mb-5 flex flex-wrap items-center gap-2" role="group" aria-label="Active filters">
              {Object.entries(filters).flatMap(([type, values]) =>
                values.map((value) => (
                  <button
                    key={`${type}-${value}`}
                    onClick={() => toggleFilter(type, value)}
                    className="inline-flex items-center gap-1.5 rounded-full bg-[var(--accent-soft)] px-3 py-1.5 text-xs font-bold text-[var(--accent)] hover:bg-[rgba(53,87,132,0.15)] transition-colors"
                  >
                    <span className="text-[var(--accent)] opacity-60">{FILTER_LABELS[type]}:</span> {value}
                    <X className="h-3 w-3" />
                  </button>
                ))
              )}
              {advancedFilters.maxVram && (
                <button
                  onClick={() => setAdvancedFilters((p) => ({ ...p, maxVram: '' }))}
                  className="inline-flex items-center gap-1.5 rounded-full bg-[var(--panel-muted)] px-3 py-1.5 text-xs font-bold text-[var(--text-main)] hover:bg-[var(--border-soft)] transition-colors"
                >
                  VRAM ≤ {advancedFilters.maxVram} GB <X className="h-3 w-3" />
                </button>
              )}
              {advancedFilters.minContext && (
                <button
                  onClick={() => setAdvancedFilters((p) => ({ ...p, minContext: '' }))}
                  className="inline-flex items-center gap-1.5 rounded-full bg-[var(--panel-muted)] px-3 py-1.5 text-xs font-bold text-[var(--text-main)] hover:bg-[var(--border-soft)] transition-colors"
                >
                  Context ≥ {CONTEXT_OPTIONS.find((o) => o.value === advancedFilters.minContext)?.label} <X className="h-3 w-3" />
                </button>
              )}
              {advancedFilters.commercialOnly && (
                <button
                  onClick={() => setAdvancedFilters((p) => ({ ...p, commercialOnly: false }))}
                  className="inline-flex items-center gap-1.5 rounded-full bg-[var(--panel-muted)] px-3 py-1.5 text-xs font-bold text-[var(--text-main)] hover:bg-[var(--border-soft)] transition-colors"
                >
                  Commercial only <X className="h-3 w-3" />
                </button>
              )}
              <button onClick={clearAllFilters} className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--accent)] hover:text-[var(--accent-strong)] transition-colors">
                Reset all
              </button>
            </div>
          )}

          {/* ── Model Table ───────────────────────────────────────────────── */}
          <div className="model-index">
            {modelsLoading ? <p role="status" className="index-empty">Loading trending models…</p> : displayModels.length === 0 ? (
              <div className="index-empty"><p>{popularModels.length ? 'No models match these filters.' : 'The trending feed is currently unavailable.'}</p>
                {totalActiveCount > 0 && <button onClick={clearAllFilters}>Clear filters</button>}
              </div>
            ) : <div className="index-scroll"><table>
              <thead><tr>{['Model', 'Task', 'Parameters', 'FP16 VRAM', 'Downloads'].map(label => <th key={label} scope="col">{label}</th>)}</tr></thead>
              <tbody>{displayModels.map(model => {
                const Icon = getPipelineIcon(model.pipelineText || '');
                return <tr key={model.modelId}><th scope="row"><Link href={modelPath(model.modelId)} prefetch={false}>
                  <span className="model-symbol"><Icon size={18} aria-hidden="true" /></span>
                  <span><strong>{model.name}</strong><small>{model.modelId.split('/')[0]} · {model.licenseInfo?.name || 'License unavailable'}</small></span>
                </Link></th><td>{model.pipelineText || '—'}</td><td>{model.rawParams && model.rawParams !== 'Unknown' ? model.rawParams : '—'}</td><td>{model.vramEstimates?.fp16 ? `${model.vramEstimates.fp16} GB` : '—'}</td><td>{formatNumber(model.downloads)}</td></tr>;
              })}</tbody></table></div>}
            {/* Table footer + pagination */}
            <div className="flex flex-col items-stretch justify-between gap-4 border-t border-[var(--border-soft)] bg-[rgba(245,248,251,0.92)] px-4 py-5 sm:px-6 md:flex-row md:items-center">
              <div className="text-center text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)] md:text-left">
                Showing{' '}
                {filteredModels.length > 0 ? `${startIndex + 1}–${Math.min(startIndex + MODELS_PER_PAGE, filteredModels.length)}` : 0}{' '}
                of {filteredModels.length}{totalActiveCount > 0 ? ' filtered' : ''} models
              </div>
              <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            </div>
          </div>
        </section>

        <section className="shell-container reference-faq" aria-labelledby="faq-heading">
          <h2 id="faq-heading">Explorer FAQ</h2>
          <div>{faqItems.map(({ question, answer }) => <details key={question}><summary>{question}</summary><p>{answer}</p></details>)}</div>
        </section>
      </div>
    </>
  );
};

export default HomePage;
