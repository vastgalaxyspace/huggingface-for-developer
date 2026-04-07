"use client";
import Link from 'next/link';
import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  AlignLeft,
  ArrowRight,
  BarChart3,
  Briefcase,
  Building2,
  CheckCircle,
  ChevronDown,
  Cloud,
  Code2,
  Cpu,
  FlaskConical,
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
  Workflow,
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
import { getTrendingModels, searchModels } from '../services/huggingface';
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

const coreTools = [
  {
    href: '/compare',
    icon: BarChart3,
    title: 'LLM Comparison',
    body: 'Compare architecture, VRAM, context window, downloads, licenses, and deployment signals side by side.',
    cta: 'Compare Models',
  },
  {
    href: '/recommender',
    icon: Sparkles,
    title: 'AI Model Recommender',
    body: 'Match open-source models to your use case, hardware limits, budget, and deployment preferences.',
    cta: 'Open Recommender',
  },
  {
    href: '/gpu/tools/vram-calculator',
    icon: Cpu,
    title: 'VRAM Calculator',
    body: 'Estimate memory requirements for 7B, 13B, 70B, quantized, and longer-context workloads before deployment.',
    cta: 'Estimate VRAM',
  },
  {
    href: '/gpu/tools/gpu-picker',
    icon: Cloud,
    title: 'GPU Sizing Tool',
    body: 'Choose the right GPU for inference, fine-tuning, or production serving with practical hardware guidance.',
    cta: 'Pick a GPU',
  },
  {
    href: '/gpu',
    icon: Workflow,
    title: 'GPU Learning Hub',
    body: 'Learn how GPU architecture, execution, memory, and performance affect real AI deployment decisions.',
    cta: 'Explore GPU Hub',
  },
  {
    href: '/ai-updates',
    icon: TrendingUp,
    title: 'AI Updates',
    body: 'Follow the latest AI model updates, releases, and ecosystem changes from one place.',
    cta: 'Read Updates',
  },
];

const audienceGroups = [
  {
    icon: Code2,
    title: 'Developers',
    body: 'Search models quickly, inspect technical details, and shortlist candidates for apps or APIs.',
  },
  {
    icon: FlaskConical,
    title: 'Researchers',
    body: 'Review model families, capabilities, context windows, and licensing for evaluation and benchmarking.',
  },
  {
    icon: Building2,
    title: 'Startups',
    body: 'Compare models by cost, VRAM estimates, and deployment fit before choosing infrastructure.',
  },
  {
    icon: Briefcase,
    title: 'ML Engineers',
    body: 'Handle GPU sizing, LLM comparison, and production planning built for practical inference decisions.',
  },
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
  url: 'https://www.innoai.com',
  potentialAction: {
    '@type': 'SearchAction',
    target: 'https://www.innoai.com/?q={search_term_string}',
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

const FeatureItem = ({ icon, text }) => {
  const Icon = icon;
  return (
    <div className="group flex cursor-default items-center justify-center gap-3 px-3 py-5 text-center text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--text-muted)] transition-colors sm:py-6 sm:text-xs sm:tracking-[0.24em]">
      <Icon className="h-4 w-4 shrink-0 text-[var(--text-faint)] group-hover:text-[var(--accent)] transition-colors" />
      <span>{text}</span>
    </div>
  );
};

const SectionHeading = ({ kicker, title, body, id }) => (
  <div className="mx-auto max-w-3xl text-center">
    <p className="text-xs font-bold uppercase tracking-[0.24em] text-[var(--accent)]">{kicker}</p>
    <h2 id={id} className="mt-3 text-3xl font-black tracking-tight text-[var(--text-strong)] sm:text-4xl">
      {title}
    </h2>
    <p className="mt-4 text-base leading-7 text-[var(--text-muted)] sm:text-lg">{body}</p>
  </div>
);

const CardLink = ({ href, icon, title, body, cta }) => {
  const Icon = icon;
  return (
    <Link
      href={href}
      aria-label={`${title} — ${cta}`}
      className="group rounded-[24px] border border-[var(--border-soft)] bg-white p-6 shadow-[0_12px_32px_rgba(48,67,95,0.06)] transition-all hover:-translate-y-1 hover:border-[var(--border-strong)] hover:shadow-[0_18px_38px_rgba(48,67,95,0.1)]"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--accent-soft)] text-[var(--accent)]">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="mt-5 text-xl font-black tracking-tight text-[var(--text-strong)]">{title}</h3>
      <p className="mt-3 text-sm leading-7 text-[var(--text-muted)]">{body}</p>
      <span className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-[var(--accent)]">
        {cta}
        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
};

const AudienceCard = ({ icon, title, body }) => {
  const Icon = icon;
  return (
    <div className="rounded-[24px] border border-[var(--border-soft)] bg-[rgba(255,255,255,0.86)] p-6">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--panel-muted)] text-[var(--accent)]">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="mt-5 text-xl font-black tracking-tight text-[var(--text-strong)]">{title}</h3>
      <p className="mt-3 text-sm leading-7 text-[var(--text-muted)]">{body}</p>
    </div>
  );
};

const StepCard = ({ number, title, body }) => (
  <div className="rounded-[24px] border border-[var(--border-soft)] bg-white p-6 shadow-[0_12px_28px_rgba(48,67,95,0.06)]">
    <div className="inline-flex rounded-full bg-[var(--accent-soft)] px-3 py-1 text-sm font-black text-[var(--accent)]">
      {number}
    </div>
    <h3 className="mt-5 text-xl font-black tracking-tight text-[var(--text-strong)]">{title}</h3>
    <p className="mt-3 text-sm leading-7 text-[var(--text-muted)]">{body}</p>
  </div>
);

const FaqCard = ({ question, answer }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-[24px] border border-[var(--border-soft)] bg-white overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left"
      >
        <h3 className="text-base font-semibold tracking-tight text-[var(--text-strong)]">{question}</h3>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-[var(--accent)] transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <div className="px-6 pb-5">
          <p className="text-sm leading-7 text-[var(--text-muted)]">{answer}</p>
        </div>
      )}
    </div>
  );
};

/** Resolves a pipeline label to an icon component */
const getPipelineIcon = (pText = '') => {
  if (pText.includes('Image') || pText.includes('Vision') || pText.includes('Detection')) return ImageIcon;
  if (pText.includes('Speech') || pText.includes('Audio')) return Mic;
  if (pText.includes('Classification')) return Scan;
  if (pText.includes('Conversational')) return MessageSquare;
  if (pText.includes('Generation') || pText.includes('Text') || pText.includes('Code')) return Terminal;
  return MessageSquare;
};

/** Compact pill badge */
const Badge = ({ children, variant = 'accent' }) => {
  const styles = {
    accent: 'bg-[var(--accent-soft)] text-[var(--accent)]',
    muted: 'bg-[var(--panel-muted)] text-[var(--text-main)]',
    green: 'bg-[rgba(34,197,94,0.1)] text-[rgb(21,128,61)]',
  };
  return (
    <span className={`inline-block rounded-full px-3 py-1 text-[11px] font-bold tracking-[0.12em] ${styles[variant]}`}>
      {children}
    </span>
  );
};

// ─── Pagination Component ─────────────────────────────────────────────────────

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

// ─── Main Component ───────────────────────────────────────────────────────────

const HomePage = ({ onSearch, loading }) => {
  const [popularModels, setPopularModels] = useState([]);
  const [modelsLoading, setModelsLoading] = useState(true);
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

  // ── Data fetching ────────────────────────────────────────────────────────

  useEffect(() => {
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
  }, []);

  // ── Search debounce ──────────────────────────────────────────────────────

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
      } catch {
        setSuggestions([]);
      } finally {
        setSearchLoading(false);
      }
    }, 300);
    return () => clearTimeout(timer);
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
          onSearch(searchQuery.trim());
          setShowSuggestions(false);
        }
        return;
      }
    } else if (e.key === 'Enter' && searchQuery.trim()) {
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
      result = result.filter((m) => (m.vramEstimates?.fp16 || 0) <= Number(advancedFilters.maxVram));

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

  const TIMES = ['2h ago', '1d ago', '5h ago', '12h ago', '3d ago'];

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

      <div className="min-h-screen">

        {/* ══ 1. HERO ════════════════════════════════════════════════════════ */}
        <section aria-labelledby="hero-heading" className="shell-container pb-8 pt-8 text-center sm:pt-12 lg:pt-20">
          <div className="editorial-panel soft-grid rounded-[28px] px-4 py-10 sm:rounded-[36px] sm:px-8 sm:py-14 lg:px-16 lg:py-24">
            <div className="mx-auto max-w-5xl">
              <h1
                id="hero-heading"
                className="mx-auto max-w-4xl text-3xl font-black tracking-tight text-[var(--text-strong)] sm:text-5xl lg:text-[4.9rem] lg:leading-[1]"
              >
                The Architect&apos;s Workspace for LLMs
              </h1>
              <p className="mx-auto mt-4 max-w-3xl text-base font-medium leading-relaxed text-[var(--text-muted)] sm:mt-6 sm:text-xl lg:text-[2rem] lg:leading-[1.35]">
                Search across 500,000+ open-source models with high-precision technical metadata.
              </p>
              <p className="mx-auto mt-4 max-w-4xl text-sm leading-7 text-[var(--text-muted)] sm:mt-5 sm:text-lg sm:leading-8">
                InnoAI is a{' '}
                <strong className="text-[var(--text-strong)]">Hugging Face model explorer</strong> built for faster{' '}
                <strong className="text-[var(--text-strong)]">LLM comparison</strong>, accurate{' '}
                <strong className="text-[var(--text-strong)]">VRAM calculator</strong> planning, smarter{' '}
                <strong className="text-[var(--text-strong)]">AI model recommender</strong> workflows, and practical{' '}
                <strong className="text-[var(--text-strong)]">GPU sizing</strong> for deployment.
              </p>

              {/* Search */}
              <div className="mx-auto mt-8 max-w-4xl sm:mt-12" ref={searchContainerRef}>
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
                    placeholder="Search models by name, task, or architecture…"
                    disabled={loading}
                    aria-autocomplete="list"
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
                      className="absolute top-[calc(100%+12px)] z-[60] w-full overflow-hidden rounded-[22px] border border-[var(--border-soft)] bg-white shadow-[0_24px_60px_rgba(48,67,95,0.12)]"
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
            </div>
          </div>
        </section>

        {/* ══ 2. TRUST BAR ═══════════════════════════════════════════════════ */}
        <div className="border-y border-[var(--border-soft)] bg-[rgba(255,255,255,0.6)]" role="list" aria-label="Platform highlights">
          <div className="shell-container grid grid-cols-2 divide-y divide-[var(--border-soft)] md:grid-cols-4 md:divide-x md:divide-y-0">
            <FeatureItem icon={Terminal} text="CLI Access" />
            <FeatureItem icon={CheckCircle} text="Verified Models" />
            <FeatureItem icon={Cloud} text="Direct Weights" />
            <FeatureItem icon={BarChart3} text="Usage Metrics" />
          </div>
        </div>

        {/* ══ 3. MODEL EXPLORER (MAIN FEATURE — above the fold on desktop) ══ */}
        <section aria-labelledby="explorer-heading" className="shell-container py-10 sm:py-14">
          <div className="mb-7">
            <SectionHeading
              id="explorer-heading"
              kicker="Live Model Explorer"
              title="Browse trending open-source AI models"
              body="Filter by architecture, parameter size, license, and pipeline. Sort by downloads, likes, or recency to build your shortlist."
            />
          </div>

          {/* ── Quick Preset Filters ──────────────────────────────────────── */}
          <div className="mb-6" aria-label="Quick filter presets">
            <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--text-faint)]">
              Quick Presets
            </p>
            <div className="flex flex-wrap gap-2">
              {QUICK_PRESETS.map((preset) => {
                const Icon = preset.icon;
                const isActive = activePreset === preset.id;
                return (
                  <button
                    key={preset.id}
                    onClick={() => applyPreset(preset)}
                    aria-pressed={isActive}
                    title={preset.description}
                    className={`group flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-all ${
                      isActive
                        ? 'border-[var(--accent)] bg-[var(--accent)] text-white shadow-sm'
                        : 'border-[var(--border-soft)] bg-white text-[var(--text-main)] hover:border-[var(--accent)] hover:bg-[var(--accent-soft)] hover:text-[var(--accent)]'
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {preset.label}
                    {isActive && <X className="h-3 w-3 ml-0.5 opacity-70" />}
                  </button>
                );
              })}
            </div>
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
          {totalActiveCount > 0 && (
            <div className="mb-5 flex flex-wrap items-center gap-2" role="list" aria-label="Active filters">
              {Object.entries(filters).flatMap(([type, values]) =>
                values.map((value) => (
                  <button
                    key={`${type}-${value}`}
                    role="listitem"
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
          <div className="editorial-panel overflow-hidden rounded-[28px]">

            {/* Desktop table */}
            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full whitespace-nowrap text-left text-[15px]" aria-label="Trending AI models">
                <thead className="bg-[var(--panel-muted)] text-[11px] font-bold uppercase tracking-[0.24em] text-[var(--text-muted)]">
                  <tr>
                    <th scope="col" className="w-[360px] px-8 py-5">Model</th>
                    <th scope="col" className="px-5 py-5">Parameters</th>
                    <th scope="col" className="px-5 py-5">Downloads</th>
                    <th scope="col" className="px-5 py-5">License</th>
                    <th scope="col" className="px-5 py-5">VRAM (FP16)</th>
                    <th scope="col" className="px-5 py-5">Context</th>
                    <th scope="col" className="px-5 py-5">Pipeline</th>
                  </tr>
                </thead>
                <tbody>
                  {modelsLoading ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-16 text-center text-[var(--text-muted)]">
                        <div className="mb-3 inline-block h-6 w-6 animate-spin rounded-full border-2 border-[var(--accent)] border-t-transparent" />
                        <div>Loading trending models…</div>
                      </td>
                    </tr>
                  ) : displayModels.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-16 text-center">
                        <Filter className="mx-auto mb-3 h-8 w-8 text-[var(--text-faint)]" />
                        <p className="font-bold text-[var(--text-main)]">No models match your filters.</p>
                        <button onClick={clearAllFilters} className="mt-2 text-sm text-[var(--accent)] hover:underline">
                          Reset all filters
                        </button>
                      </td>
                    </tr>
                  ) : (
                    displayModels.map((model, i) => {
                      const PipelineIcon = getPipelineIcon(model.pipelineText);
                      const pText = model.pipelineText || 'Other';
                      return (
                        <tr
                          key={model.modelId}
                          className="group border-b border-[var(--border-soft)] bg-white transition-colors hover:bg-[rgba(243,247,252,0.8)]"
                        >
                          <td className="px-8 py-5">
                            <button
                              onClick={() => onSearch(model.modelId)}
                              className="block w-[300px] cursor-pointer truncate text-left text-[17px] font-extrabold text-[var(--accent)] transition-colors hover:text-[var(--accent-strong)]"
                              aria-label={`View details for ${model.name}`}
                            >
                              {model.name}
                            </button>
                            <div className="mt-1 text-[11px] font-medium text-[var(--text-faint)]">
                              Updated {TIMES[i % TIMES.length]}
                            </div>
                          </td>
                          <td className="px-5 py-4 font-medium text-[var(--text-main)]">{model.rawParams ?? 'N/A'}</td>
                          <td className="px-5 py-4">
                            <span className="flex items-center gap-1.5 font-medium text-[var(--text-main)]">
                              <TrendingUp className="h-3.5 w-3.5 text-[rgb(34,197,94)]" />
                              {formatNumber(model.downloads)}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <Badge variant="accent">{model.licenseInfo?.name ?? 'Unknown'}</Badge>
                          </td>
                          <td className="px-5 py-4 font-medium text-[var(--text-main)]">
                            {model.vramEstimates?.fp16 ? `${model.vramEstimates.fp16} GB` : 'N/A'}
                          </td>
                          <td className="px-5 py-4 font-medium text-[var(--text-main)]">
                            {model.config?.max_position_embeddings > 0
                              ? `${model.config.max_position_embeddings / 1000}k`
                              : 'N/A'}
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2 font-medium text-[var(--text-muted)]">
                              <PipelineIcon className="h-3.5 w-3.5 shrink-0" />
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

            {/* Mobile cards */}
            <div className="grid gap-0 lg:hidden">
              {modelsLoading ? (
                <div className="px-6 py-16 text-center text-[var(--text-muted)]">
                  <div className="mb-3 inline-block h-6 w-6 animate-spin rounded-full border-2 border-[var(--accent)] border-t-transparent" />
                  <div>Loading trending models…</div>
                </div>
              ) : displayModels.length === 0 ? (
                <div className="px-6 py-16 text-center">
                  <Filter className="mx-auto mb-3 h-8 w-8 text-[var(--text-faint)]" />
                  <p className="font-bold text-[var(--text-main)]">No models match your filters.</p>
                  <button onClick={clearAllFilters} className="mt-2 text-sm text-[var(--accent)] hover:underline">Reset all filters</button>
                </div>
              ) : (
                displayModels.map((model, i) => {
                  const PipelineIcon = getPipelineIcon(model.pipelineText);
                  const pText = model.pipelineText || 'Other';
                  return (
                    <article key={model.modelId} className="border-b border-[var(--border-soft)] bg-white p-5 last:border-b-0 sm:p-6">
                      <button
                        onClick={() => onSearch(model.modelId)}
                        className="block w-full text-left text-base font-extrabold text-[var(--accent)] transition-colors hover:text-[var(--accent-strong)] sm:text-lg"
                        aria-label={`View ${model.name}`}
                      >
                        <span className="line-clamp-2 break-words">{model.name}</span>
                      </button>
                      <div className="mt-1 text-[11px] font-medium text-[var(--text-faint)]">Updated {TIMES[i % TIMES.length]}</div>

                      <div className="mt-4 grid grid-cols-2 gap-2.5 text-sm sm:grid-cols-3">
                        {[
                          { label: 'Parameters', value: model.rawParams ?? 'N/A' },
                          { label: 'Downloads', value: formatNumber(model.downloads) },
                          { label: 'VRAM', value: model.vramEstimates?.fp16 ? `${model.vramEstimates.fp16} GB` : 'N/A' },
                          {
                            label: 'Context',
                            value: model.config?.max_position_embeddings > 0
                              ? `${model.config.max_position_embeddings / 1000}k`
                              : 'N/A',
                          },
                        ].map(({ label, value }) => (
                          <div key={label} className="rounded-2xl bg-[var(--panel-muted)] px-3 py-2">
                            <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--text-faint)]">{label}</div>
                            <div className="mt-1 font-semibold text-[var(--text-main)]">{value}</div>
                          </div>
                        ))}

                        <div className="col-span-2 rounded-2xl bg-[var(--panel-muted)] px-3 py-2 sm:col-span-1">
                          <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--text-faint)]">License</div>
                          <div className="mt-1 break-words font-semibold text-[var(--text-main)]">{model.licenseInfo?.name ?? 'Unknown'}</div>
                        </div>

                        <div className="col-span-2 rounded-2xl bg-[var(--panel-muted)] px-3 py-2 sm:col-span-3">
                          <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--text-faint)]">Pipeline</div>
                          <div className="mt-1 flex items-center gap-1.5 font-semibold text-[var(--text-main)]">
                            <PipelineIcon className="h-3.5 w-3.5 text-[var(--accent)]" />
                            {pText}
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })
              )}
            </div>

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

        {/* ══ 4. CORE TOOLS ══════════════════════════════════════════════════ */}
        <section aria-labelledby="tools-heading" className="shell-container py-12 sm:py-16">
          <SectionHeading
            id="tools-heading"
            kicker="Platform Tools"
            title="A complete AI model research and deployment workspace"
            body="Everything you need to go from model discovery to production deployment — in one place."
          />
          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {coreTools.map((tool) => <CardLink key={tool.title} {...tool} />)}
          </div>
        </section>

        {/* ══ 5. HOW IT WORKS ════════════════════════════════════════════════ */}
        <section aria-labelledby="how-heading" className="shell-container pb-12 sm:pb-16">
          <SectionHeading
            id="how-heading"
            kicker="How It Works"
            title="From model discovery to deployment in 3 steps"
            body="Follow the workflow most teams actually use when choosing open-source AI models."
          />
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            <StepCard number="01" title="Search the model" body="Filter Hugging Face models by task, architecture, license, downloads, or trending activity to build a strong candidate list." />
            <StepCard number="02" title="Compare the specs" body="Review parameters, licenses, context length, and popularity side by side with the LLM comparison tool." />
            <StepCard number="03" title="Estimate deployment needs" body="Use the VRAM calculator and GPU sizing tools to understand hardware fit and deployment cost before shipping." />
          </div>
        </section>

        {/* ══ 6. AUDIENCE ════════════════════════════════════════════════════ */}
        <section aria-labelledby="audience-heading" className="shell-container pb-12 sm:pb-16">
          <SectionHeading
            id="audience-heading"
            kicker="Who It Helps"
            title="Built for teams making real AI model decisions"
            body="Whether you are evaluating models for experiments, shipping products, or planning production inference — this shortens the research cycle."
          />
          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {audienceGroups.map((group) => <AudienceCard key={group.title} {...group} />)}
          </div>
        </section>

        {/* ══ 7. FAQ ═════════════════════════════════════════════════════════ */}
        <section aria-labelledby="faq-heading" className="shell-container pb-12 sm:pb-16">
          <SectionHeading
            id="faq-heading"
            kicker="FAQ"
            title="Common questions about model selection and deployment"
            body="Answers to the questions teams ask most before selecting a model, estimating VRAM, or planning GPU infrastructure."
          />
          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {faqItems.map((item) => <FaqCard key={item.question} {...item} />)}
          </div>
        </section>

        {/* ══ 8. CTA BANNER ══════════════════════════════════════════════════ */}
        <section aria-labelledby="cta-heading" className="shell-container pb-16">
          <div className="editorial-panel rounded-[28px] px-6 py-12 text-center sm:rounded-[36px] sm:px-12 sm:py-16">
            <Sparkles className="mx-auto mb-4 h-8 w-8 text-[var(--accent)]" aria-hidden="true" />
            <h2 id="cta-heading" className="text-2xl font-black tracking-tight text-[var(--text-strong)] sm:text-3xl">
              Find your next model in seconds
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-base text-[var(--text-muted)] sm:text-lg">
              Use the recommender to get a personalized shortlist based on your hardware, task, and deployment constraints.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/recommender"
                className="inline-flex items-center gap-2 rounded-2xl bg-[var(--accent)] px-6 py-3.5 text-sm font-black text-white shadow-[0_8px_24px_rgba(53,87,132,0.3)] transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(53,87,132,0.4)]"
              >
                <Sparkles className="h-4 w-4" /> Open Recommender
              </Link>
              <Link
                href="/compare"
                className="inline-flex items-center gap-2 rounded-2xl border border-[var(--border-strong)] bg-white px-6 py-3.5 text-sm font-black text-[var(--text-strong)] transition-all hover:border-[var(--accent)] hover:text-[var(--accent)]"
              >
                <BarChart3 className="h-4 w-4" /> Compare Models
              </Link>
            </div>
          </div>
        </section>

      </div>
    </>
  );
};

export default HomePage;
