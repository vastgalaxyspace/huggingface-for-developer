"use client";
import { useState, useEffect } from 'react';
import {
  ArrowLeft, Database, Cpu, Shield, Server, Puzzle, Code,
  DollarSign, Settings, Star, Download, Calendar, ExternalLink,
  Copy, Check, Gauge, CheckCircle, PanelLeftClose, PanelLeftOpen, X,
  AlertTriangle, Info, Box, Layers, Hash, Zap
} from 'lucide-react';

import VRAMSection from '../components/model/VRAMSection';
import LicenseSection from '../components/model/LicenseSection';
import HardwareSection from '../components/model/HardwareSection';
import CompatibilitySection from '../components/model/CompatibilitySection';
import CodeSnippetsSection from '../components/model/CodeSnippetsSection';
import TCOSection from '../components/model/TCOSection';
import DeploymentScoreSection from '../components/model/DeploymentScoreSection';
import ParametersSection from '../components/model/ParametersSection';
import SMDiagramSection from '../components/model/SMDiagramSection';

const NAV_ITEMS = [
  { id: 'section-overview', label: 'Overview', icon: Database },
  { id: 'section-score', label: 'Deployment Readiness', icon: Gauge },
  { id: 'section-vram', label: 'VRAM & Memory', icon: Cpu },
  { id: 'section-license', label: 'License Analysis', icon: Shield },
  { id: 'section-hardware', label: 'Hardware & GPUs', icon: Server },
  { id: 'section-sm', label: 'SM Architecture', icon: Cpu },
  { id: 'section-compatibility', label: 'Compatibility', icon: Puzzle },
  { id: 'section-code', label: 'Usage Examples', icon: Code },
  { id: 'section-tco', label: 'Cost of Ownership', icon: DollarSign },
  { id: 'section-params', label: 'Parameters', icon: Settings },
];

/* ── Utility functions ── */
const fmt = (num) => {
  if (!num) return '0';
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
};

const fmtDate = (ds) => {
  if (!ds) return 'Unknown';
  return new Date(ds).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

const safeValue = (val, fallback = 'Not available') => {
  if (val === null || val === undefined || val === 'Unknown' || val === 'unknown') return fallback;
  return val;
};

/* ── Score Ring SVG Component ── */
const ScoreRing = ({ score, size = 72, strokeWidth = 5 }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 70 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444';

  return (
    <div className="score-ring" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth={strokeWidth} />
        <circle
          cx={size / 2} cy={size / 2} r={radius} fill="none"
          stroke={color} strokeWidth={strokeWidth}
          strokeDasharray={circumference} strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.16, 1, 0.3, 1)' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[18px] font-black leading-none" style={{ color }}>{score}</span>
        <span className="text-[8px] font-bold uppercase tracking-wider text-[var(--text-faint)] mt-0.5">/ 100</span>
      </div>
    </div>
  );
};

const ModelDetailPage = ({
  modelData, onBack, compatibility, deploymentScore, gpuRecommendations, cloudCosts,
  multiGPU, tco, codeSnippets, frameworks, parameterCategories, licenseDisplay, deploymentRec,
}) => {
  const [activeSection, setActiveSection] = useState('section-overview');
  const [copiedId, setCopiedId] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Scroll spy — listen on window
  useEffect(() => {
    const onScroll = () => {
      for (const item of NAV_ITEMS) {
        const el = document.getElementById(item.id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 140 && rect.bottom > 140) { setActiveSection(item.id); break; }
        }
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Responsive
  useEffect(() => {
    const check = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) setSidebarOpen(false);
      else setSidebarOpen(true);
    };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const handleCopyId = () => {
    navigator.clipboard.writeText(modelData?.modelId || '');
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (!el) return;

    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setActiveSection(id);
    if (isMobile) setSidebarOpen(false);
  };

  // ── Derived data ──
  const nameParts = modelData?.modelId ? modelData.modelId.split('/') : ['unknown', 'Unknown'];
  const author = nameParts[0];
  const modelName = nameParts.length > 1 ? nameParts[1] : nameParts[0];
  const paramCount = modelData?.vramEstimates?.totalParams || 0;
  const paramString = paramCount > 0
    ? (paramCount >= 1000 ? `${(paramCount / 1000).toFixed(1)}T` : `${paramCount}B`)
    : null;
  const hasVram = modelData?.vramEstimates?.fp16 && modelData.vramEstimates.fp16 > 0;

  // License color mapping
  const licenseColorClass = modelData?.licenseInfo?.color === 'green'
    ? 'insight-card--green' : modelData?.licenseInfo?.color === 'red'
    ? 'insight-card--red' : modelData?.licenseInfo?.color === 'yellow'
    ? 'insight-card--yellow' : 'insight-card--blue';

  // Config table rows
  const configRows = [
    { label: 'Architecture', value: safeValue(modelData?.config?.model_type), icon: Layers },
    { label: 'Context Window', value: modelData?.config?.max_position_embeddings ? `${modelData.config.max_position_embeddings.toLocaleString()} tokens` : 'Not available', icon: Hash },
    { label: 'Hidden Size', value: modelData?.config?.hidden_size ? modelData.config.hidden_size.toLocaleString() : 'Not available', icon: Box },
    { label: 'Layers', value: safeValue(modelData?.config?.num_hidden_layers), icon: Layers },
    { label: 'Attention Heads', value: safeValue(modelData?.config?.num_attention_heads), icon: Zap },
    { label: 'KV Heads (GQA)', value: (() => {
      const kv = modelData?.config?.num_key_value_heads;
      const attn = modelData?.config?.num_attention_heads;
      if (!kv || !attn) return 'Not available';
      if (kv !== attn) return `${kv} (${Math.round(attn / kv)}x GQA)`;
      return `${kv} (Standard MHA)`;
    })(), icon: Zap },
    { label: 'Vocabulary Size', value: modelData?.config?.vocab_size ? modelData.config.vocab_size.toLocaleString() : 'Not available', icon: Database },
    { label: 'Precision', value: safeValue(modelData?.config?.torch_dtype), icon: Cpu },
  ];

  // Add MoE row if applicable
  if (modelData?.config?.num_experts) {
    configRows.push({
      label: 'MoE Experts',
      value: `${modelData.config.num_experts} experts, ${modelData.config.num_experts_per_tok || '?'} active per token`,
      icon: Puzzle,
    });
  }

  // Add sliding window if applicable
  if (modelData?.config?.sliding_window) {
    configRows.push({
      label: 'Sliding Window',
      value: `${modelData.config.sliding_window.toLocaleString()} tokens`,
      icon: Hash,
    });
  }

  return (
    <div className="min-h-screen">
      <div className="shell-container">

        {/* ── TOP BAR ── */}
        <div className="mb-4 flex items-center justify-between">
          <button
            onClick={onBack}
            className="group inline-flex items-center gap-2 rounded-xl border border-[var(--border-soft)] bg-white px-4 py-2.5 text-[12px] font-bold text-[var(--text-muted)] shadow-[0_2px_8px_rgba(45,63,88,0.06)] transition-all hover:shadow-[0_4px_16px_rgba(45,63,88,0.1)] hover:text-[var(--text-strong)]"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
            Back to Search
          </button>

          <div className="flex items-center gap-3">
            <a
              href={`https://huggingface.co/${modelData?.modelId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-[var(--accent)] px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.15em] text-white shadow-[0_2px_12px_rgba(99,102,241,0.25)] transition-all hover:shadow-[0_4px_20px_rgba(99,102,241,0.35)]"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">View on HuggingFace</span>
              <span className="sm:hidden">HF</span>
            </a>

            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="inline-flex items-center justify-center rounded-xl border border-[var(--border-soft)] bg-white p-2.5 text-[var(--text-muted)] shadow-[0_2px_8px_rgba(45,63,88,0.06)] transition-all hover:text-[var(--text-strong)] hover:shadow-[0_4px_16px_rgba(45,63,88,0.1)]"
              aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
            >
              {sidebarOpen ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeftOpen className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* ── MAIN LAYOUT ── */}
        <div className="editorial-panel overflow-hidden rounded-[28px]">
          <div className="relative flex min-h-[calc(100vh-200px)]">

            {/* Mobile overlay */}
            {isMobile && sidebarOpen && (
              <div
                className="fixed inset-0 z-40 bg-[rgba(15,23,42,0.35)] backdrop-blur-[2px] transition-opacity"
                onClick={() => setSidebarOpen(false)}
              />
            )}

            {/* ── SIDEBAR ── */}
            <aside
              className={`
                ${isMobile
                  ? `fixed inset-y-0 left-0 z-50 w-[280px] shadow-[0_0_60px_rgba(15,23,42,0.18)] transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`
                  : `${sidebarOpen ? 'w-[260px] min-w-[260px]' : 'w-0 min-w-0 overflow-hidden'} transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]`
                }
                flex flex-col justify-between border-r border-[var(--border-soft)] bg-[rgba(249,251,254,0.97)]
                ${!isMobile ? 'sticky top-0 self-start max-h-screen overflow-y-auto' : ''}
              `}
            >
              <div className="py-6">
                {/* Sidebar header */}
                <div className="mb-5 flex items-center justify-between px-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border-soft)] bg-gradient-to-br from-[var(--accent-soft)] to-white">
                      <Database className="h-4 w-4 text-[var(--accent)]" />
                    </div>
                    <div>
                      <h2 className="text-[11px] font-extrabold leading-tight text-[var(--text-strong)]">Navigation</h2>
                      {deploymentScore && (
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <div className={`h-1.5 w-1.5 rounded-full ${deploymentScore.total >= 70 ? 'bg-emerald-500' : deploymentScore.total >= 50 ? 'bg-amber-500' : 'bg-red-500'}`} />
                          <span className={`text-[10px] font-bold ${deploymentScore.total >= 70 ? 'text-emerald-600' : deploymentScore.total >= 50 ? 'text-amber-600' : 'text-red-500'}`}>
                            Score: {deploymentScore.total}/100
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  {isMobile && (
                    <button onClick={() => setSidebarOpen(false)} className="rounded-lg p-1.5 text-[var(--text-faint)] transition-colors hover:bg-[rgba(0,0,0,0.05)] hover:text-[var(--text-strong)]">
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {/* Nav items */}
                <nav className="flex flex-col px-3 space-y-0.5">
                  {NAV_ITEMS.map(item => {
                    const Icon = item.icon;
                    const active = activeSection === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => scrollTo(item.id)}
                        className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[12px] font-semibold transition-all text-left ${
                          active
                            ? 'bg-[var(--accent)] text-white shadow-[0_2px_10px_rgba(99,102,241,0.22)]'
                            : 'text-[var(--text-muted)] hover:bg-[rgba(0,0,0,0.04)] hover:text-[var(--text-strong)]'
                        }`}
                      >
                        <Icon className={`h-[14px] w-[14px] flex-shrink-0 ${active ? 'text-white' : ''}`} />
                        <span className="truncate">{item.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* Sidebar footer */}
              <div className="border-t border-[var(--border-soft)] px-5 py-4">
                <p className="text-[10px] font-medium text-[var(--text-faint)] leading-relaxed">
                  {modelData?.modelId}
                </p>
              </div>
            </aside>

            {/* ── MAIN CONTENT ── */}
            <main className="flex-1 min-w-0">
              <div
                className={`w-full transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                  sidebarOpen && !isMobile ? 'mx-auto max-w-[920px]' : 'max-w-[1120px]'
                }`}
              >

                {/* ══════════════════════════════════════════════
                    SECTION: HERO / OVERVIEW
                    ══════════════════════════════════════════════ */}
                <section id="section-overview" className="fade-in-section scroll-mt-28">
                  {/* Hero area with accent bar */}
                  <div className="model-hero px-6 py-8 md:px-10 lg:px-14 lg:py-10">
                    {/* Badges row */}
                    <div className="mb-4 flex flex-wrap items-center gap-2">
                      {modelData?.pipelineTag && (
                        <span className="rounded-full border border-[rgba(54,87,132,0.12)] bg-[var(--accent-soft)] px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.2em] text-[var(--accent)]">
                          {modelData.pipelineTag}
                        </span>
                      )}
                      {modelData?.config?.model_type && modelData.config.model_type !== 'unknown' && (
                        <span className="rounded-full border border-[var(--border-soft)] bg-[rgba(243,245,248,0.88)] px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.2em] text-[var(--text-muted)]">
                          {modelData.config.model_type}
                        </span>
                      )}
                      {modelData?.quantization?.quantized && (
                        <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.2em] text-emerald-700">
                          Quantized ({modelData.quantization.method})
                        </span>
                      )}
                      {paramString && (
                        <span className="rounded-full border border-purple-200 bg-purple-50 px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.15em] text-purple-700">
                          {paramString} params
                        </span>
                      )}
                      {modelData?.gated && (
                        <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.15em] text-amber-700">
                          Gated Model
                        </span>
                      )}
                    </div>

                    {/* Model Name */}
                    <h1 className="mb-2 text-3xl font-black tracking-tight text-[var(--text-strong)] lg:text-4xl">
                      {modelName}
                    </h1>

                    {/* Meta row */}
                    <div className="mb-5 flex flex-wrap items-center gap-3 text-[13px] text-[var(--text-muted)]">
                      <span>by <strong className="text-[var(--accent)]">{author}</strong></span>
                      {modelData?.lastModified && (
                        <>
                          <span className="text-[var(--border-soft)]">|</span>
                          <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {fmtDate(modelData.lastModified)}</span>
                        </>
                      )}
                      <span className="text-[var(--border-soft)]">|</span>
                      <span className="flex items-center gap-1"><Download className="h-3.5 w-3.5" /> {fmt(modelData?.downloads)}</span>
                      <span className="flex items-center gap-1"><Star className="h-3.5 w-3.5 text-amber-500" /> {fmt(modelData?.likes)}</span>
                      <button onClick={handleCopyId} className="flex items-center gap-1 rounded-lg bg-[rgba(0,0,0,0.04)] px-2.5 py-1 text-[11px] font-bold hover:bg-[rgba(0,0,0,0.08)] transition-colors">
                        {copiedId ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                        {copiedId ? 'Copied' : 'Copy ID'}
                      </button>
                    </div>

                    {/* Description */}
                    {modelData?.card?.description && (
                      <p className="mb-0 text-[14px] font-medium leading-relaxed text-[var(--text-muted)] max-w-[720px]">
                        {modelData.card.description}
                      </p>
                    )}
                  </div>

                  {/* Quick Insight Cards */}
                  <div className="px-6 py-6 md:px-10 lg:px-14">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-8">

                      {/* License Card */}
                      <div className={`insight-card ${licenseColorClass}`}>
                        <div className="flex items-center gap-2 mb-2">
                          <Shield className="h-4 w-4 text-[var(--text-muted)]" />
                          <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--text-faint)]">License</span>
                        </div>
                        <p className="text-[17px] font-black text-[var(--text-strong)] mb-1">
                          {modelData?.licenseInfo?.name || 'Unknown'}
                        </p>
                        <p className="text-[11px] font-medium text-[var(--text-muted)] leading-relaxed">
                          {modelData?.licenseInfo?.summary || 'Review license details below'}
                        </p>
                      </div>

                      {/* VRAM Card */}
                      <div className={`insight-card ${hasVram ? 'insight-card--blue' : ''}`}>
                        <div className="flex items-center gap-2 mb-2">
                          <Cpu className="h-4 w-4 text-blue-500" />
                          <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--text-faint)]">VRAM (FP16)</span>
                        </div>
                        {hasVram ? (
                          <>
                            <p className="text-[17px] font-black text-[var(--text-strong)] mb-1">
                              ~{modelData.vramEstimates.fp16} GB
                            </p>
                            <p className="text-[11px] font-medium text-blue-600">
                              INT8: ~{modelData.vramEstimates.int8}GB &middot; INT4: ~{modelData.vramEstimates.int4}GB
                            </p>
                          </>
                        ) : (
                          <>
                            <p className="text-[17px] font-black text-[var(--text-muted)] mb-1">Pending</p>
                            <p className="text-[11px] font-medium text-[var(--text-faint)]">
                              Insufficient config data to estimate
                            </p>
                          </>
                        )}
                      </div>

                      {/* Parameters Card */}
                      <div className={`insight-card ${paramString ? 'insight-card--purple' : ''}`}>
                        <div className="flex items-center gap-2 mb-2">
                          <Database className="h-4 w-4 text-purple-500" />
                          <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--text-faint)]">Parameters</span>
                        </div>
                        {paramString ? (
                          <>
                            <p className="text-[17px] font-black text-[var(--text-strong)] mb-1">{paramString}</p>
                            <p className="text-[11px] font-medium text-purple-600 flex items-center gap-1">
                              {modelData.vramEstimates?.paramSource === 'safetensors'
                                ? <><CheckCircle className="h-3 w-3" /> Verified (safetensors)</>
                                : 'Estimated from config'}
                            </p>
                          </>
                        ) : (
                          <>
                            <p className="text-[17px] font-black text-[var(--text-muted)] mb-1">Pending</p>
                            <p className="text-[11px] font-medium text-[var(--text-faint)]">
                              Parameter count unavailable
                            </p>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Deployment Score Mini Preview */}
                    {deploymentScore && (
                      <div className="mb-8 flex items-center gap-5 rounded-2xl border border-[var(--border-soft)] bg-white p-5 shadow-[0_2px_12px_rgba(59,83,114,0.04)]">
                        <ScoreRing score={deploymentScore.total} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-[15px] font-bold text-[var(--text-strong)]">Deployment Readiness</h3>
                            <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                              deploymentScore.total >= 70 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                              deploymentScore.total >= 50 ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                              'bg-red-50 text-red-700 border border-red-200'
                            }`}>
                              {deploymentScore.rating?.label}
                            </span>
                          </div>
                          <p className="text-[12px] text-[var(--text-muted)]">
                            {deploymentScore.readyForProduction
                              ? 'This model meets the criteria for production deployment.'
                              : 'Review the detailed assessment below for areas to evaluate.'}
                          </p>
                        </div>
                        <button
                          onClick={() => scrollTo('section-score')}
                          className="hidden sm:flex items-center gap-1 rounded-lg bg-[rgba(0,0,0,0.04)] px-3 py-2 text-[11px] font-bold text-[var(--text-muted)] hover:bg-[rgba(0,0,0,0.08)] transition-colors"
                        >
                          View Details
                          <ArrowLeft className="h-3 w-3 rotate-180" />
                        </button>
                      </div>
                    )}

                    {/* Model Configuration Table */}
                    <div className="overflow-hidden rounded-[22px] border border-[var(--border-soft)] bg-white shadow-[0_2px_12px_rgba(59,83,114,0.04)]">
                      <div className="bg-gradient-to-r from-[rgba(245,248,252,0.95)] to-[rgba(237,243,249,0.95)] border-b border-[var(--border-soft)] px-6 py-3.5">
                        <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--text-faint)]">
                          Model Configuration
                        </h3>
                      </div>
                      <div className="divide-y divide-[rgba(124,147,178,0.08)]">
                        {configRows.map((row) => {
                          const RowIcon = row.icon;
                          const isAvailable = row.value !== 'Not available';
                          return (
                            <div key={row.label} className="grid grid-cols-[minmax(140px,2fr)_3fr] transition-colors hover:bg-[rgba(245,248,252,0.6)]">
                              <div className="flex items-center gap-2.5 px-6 py-3 bg-[rgba(245,248,252,0.4)] border-r border-[rgba(124,147,178,0.08)] text-[13px] font-semibold text-[var(--text-muted)]">
                                <RowIcon className="h-3.5 w-3.5 flex-shrink-0 text-[var(--text-faint)]" />
                                <span>{row.label}</span>
                              </div>
                              <div className={`px-6 py-3 text-[13px] font-bold tabular-nums ${
                                isAvailable ? 'text-[var(--text-strong)]' : 'text-[var(--text-faint)] font-medium italic'
                              }`}>
                                {row.value}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </section>

                {/* ── REMAINING SECTIONS ── */}
                <div className="px-6 md:px-10 lg:px-14 pb-10">
                  <div className="section-divider" />
                  <DeploymentScoreSection deploymentScore={deploymentScore} />

                  <div className="section-divider" />
                  <VRAMSection vramEstimates={modelData?.vramEstimates} />

                  <div className="section-divider" />
                  <LicenseSection licenseInfo={modelData?.licenseInfo} licenseDisplay={licenseDisplay} deploymentRec={deploymentRec} />

                  <div className="section-divider" />
                  <HardwareSection gpuRecommendations={gpuRecommendations} cloudCosts={cloudCosts} multiGPU={multiGPU} vramEstimates={modelData?.vramEstimates} />

                  <div className="section-divider" />
                  <SMDiagramSection />

                  <div className="section-divider" />
                  <CompatibilitySection compatibility={compatibility} />

                  <div className="section-divider" />
                  <CodeSnippetsSection codeSnippets={codeSnippets} frameworks={frameworks} modelId={modelData?.modelId} />

                  <div className="section-divider" />
                  <TCOSection tco={tco} />

                  <div className="section-divider" />
                  <ParametersSection parameterCategories={parameterCategories} config={modelData?.config} />
                </div>

              </div>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModelDetailPage;
