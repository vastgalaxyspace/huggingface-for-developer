"use client";
import { useState, useEffect } from 'react';
import {
  ArrowLeft, Database, Cpu, Shield, Server, Puzzle, Code,
  DollarSign, Settings, Star, Download, Calendar, ExternalLink,
  Copy, Check, Gauge, CheckCircle, PanelLeftClose, PanelLeftOpen, X
} from 'lucide-react';

import VRAMSection from '../components/model/VRAMSection';
import LicenseSection from '../components/model/LicenseSection';
import HardwareSection from '../components/model/HardwareSection';
import CompatibilitySection from '../components/model/CompatibilitySection';
import CodeSnippetsSection from '../components/model/CodeSnippetsSection';
import TCOSection from '../components/model/TCOSection';
import DeploymentScoreSection from '../components/model/DeploymentScoreSection';
import ParametersSection from '../components/model/ParametersSection';

const NAV_ITEMS = [
  { id: 'section-overview', label: 'Overview', icon: Database },
  { id: 'section-score', label: 'Deployment Readiness', icon: Gauge },
  { id: 'section-vram', label: 'VRAM & Memory', icon: Cpu },
  { id: 'section-license', label: 'License Analysis', icon: Shield },
  { id: 'section-hardware', label: 'Hardware & GPUs', icon: Server },
  { id: 'section-compatibility', label: 'Compatibility', icon: Puzzle },
  { id: 'section-code', label: 'Usage Examples', icon: Code },
  { id: 'section-tco', label: 'Cost of Ownership', icon: DollarSign },
  { id: 'section-params', label: 'Parameters', icon: Settings },
];

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

const stripEmoji = (str) => {
  if (!str) return '';
  return str.replace(/[\u{1F000}-\u{1FFFF}]|[\u{2600}-\u{27BF}]|[\u{2700}-\u{27BF}]|[\u{FE00}-\u{FEFF}]|[\u{1F900}-\u{1F9FF}]|[\u2714\u2716\u2713\u2717\u2611\u2612\u26A1\uD83D\uDD34\uD83D\uDCA1\uD83E\uDD17\uD83E\uDD99\uD83D\uDCBB\uD83D\uDE80\uD83C\uDFAE\uD83D\uDCBC\u2601\uFE0F\uD83D\uDDA5\uFE0F\uD83C\uDFAF\uD83D\uDCE6\uD83D\uDCBE\uD83C\uDF10\uD83C\uDFF7\uFE0F]/gu, '').replace(/^[^\w\s]+\s*/, '').trim();
};

const ModelDetailPage = ({
  modelData, onBack, compatibility, deploymentScore, gpuRecommendations, cloudCosts,
  multiGPU, tco, codeSnippets, frameworks, parameterCategories, licenseDisplay, deploymentRec,
}) => {
  const [activeSection, setActiveSection] = useState('section-overview');
  const [copiedId, setCopiedId] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Scroll spy
  useEffect(() => {
    const onScroll = () => {
      for (const item of NAV_ITEMS) {
        const el = document.getElementById(item.id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 120 && rect.bottom > 120) { setActiveSection(item.id); break; }
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
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    if (isMobile) setSidebarOpen(false);
  };

  const nameParts = modelData?.modelId ? modelData.modelId.split('/') : ['unknown', 'Unknown'];
  const author = nameParts[0];
  const modelName = nameParts.length > 1 ? nameParts[1] : nameParts[0];
  const paramCount = modelData?.vramEstimates?.totalParams || 0;
  const paramString = paramCount >= 1000 ? `${(paramCount / 1000).toFixed(1)}T` : `${paramCount}B`;

  return (
    <div className="min-h-screen">
      <div className="shell-container">

        {/* ── TOP BAR ── Always visible, outside sidebar */}
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

            {/* Sidebar toggle - only visible on >= lg when sidebar is closed, or always on mobile */}
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
                        <div className="flex items-center gap-1">
                          <div className={`h-1.5 w-1.5 rounded-full ${deploymentScore.total >= 70 ? 'bg-emerald-500' : deploymentScore.total >= 50 ? 'bg-amber-500' : 'bg-red-500'}`} />
                          <span className={`text-[9px] font-bold ${deploymentScore.total >= 70 ? 'text-emerald-600' : deploymentScore.total >= 50 ? 'text-amber-600' : 'text-red-500'}`}>
                            {deploymentScore.total}/100
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
            <main className="flex-1 min-w-0 px-6 py-8 md:px-10 lg:px-14 lg:py-10 overflow-y-auto">
              <div className="mx-auto max-w-[900px]">

                {/* HEADER */}
                <section id="section-overview" className="mb-10">
                  <div className="mb-4 flex flex-wrap items-center gap-2">
                    {modelData?.pipelineTag && (
                      <span className="rounded-full border border-[rgba(54,87,132,0.12)] bg-[var(--accent-soft)] px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.2em] text-[var(--accent)]">{modelData.pipelineTag}</span>
                    )}
                    {modelData?.config?.model_type && (
                      <span className="rounded-full border border-[var(--border-soft)] bg-[rgba(243,245,248,0.88)] px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.2em] text-[var(--text-muted)]">{modelData.config.model_type}</span>
                    )}
                    {modelData?.quantization?.quantized && (
                      <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.2em] text-emerald-700">Quantized ({modelData.quantization.method})</span>
                    )}
                    <span className="rounded-full border border-purple-200 bg-purple-50 px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.15em] text-purple-700">{paramString} params</span>
                  </div>

                  <h1 className="mb-2 text-3xl font-black tracking-tight text-[var(--text-strong)] lg:text-4xl">{modelName}</h1>

                  <div className="mb-4 flex flex-wrap items-center gap-3 text-[13px] text-[var(--text-muted)]">
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

                  {modelData?.card?.description && (
                    <p className="mb-6 text-[15px] font-medium leading-relaxed text-[var(--text-muted)]">{modelData.card.description}</p>
                  )}

                  {/* Quick Decision Cards */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-8">
                    <div className={`rounded-2xl border-2 p-4 ${
                      modelData?.licenseInfo?.color === 'green' ? 'border-emerald-200 bg-emerald-50' :
                      modelData?.licenseInfo?.color === 'red' ? 'border-red-200 bg-red-50' :
                      'border-amber-200 bg-amber-50'
                    }`}>
                      <div className="flex items-center gap-2 mb-1"><Shield className="h-4 w-4" /><span className="text-[10px] font-bold uppercase tracking-wider opacity-70">License</span></div>
                      <p className="text-[18px] font-black text-[var(--text-strong)]">{modelData?.licenseInfo?.name || 'Unknown'}</p>
                      <p className="text-[11px] font-medium opacity-80">{stripEmoji(modelData?.licenseInfo?.summary || '')}</p>
                    </div>
                    <div className="rounded-2xl border-2 border-blue-200 bg-blue-50 p-4">
                      <div className="flex items-center gap-2 mb-1"><Cpu className="h-4 w-4 text-blue-600" /><span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">VRAM (FP16)</span></div>
                      <p className="text-[18px] font-black text-[var(--text-strong)]">~{modelData?.vramEstimates?.fp16 || '?'} GB</p>
                      <p className="text-[11px] font-medium text-blue-600">INT8: ~{modelData?.vramEstimates?.int8 || '?'}GB | INT4: ~{modelData?.vramEstimates?.int4 || '?'}GB</p>
                    </div>
                    <div className="rounded-2xl border-2 border-purple-200 bg-purple-50 p-4">
                      <div className="flex items-center gap-2 mb-1"><Database className="h-4 w-4 text-purple-600" /><span className="text-[10px] font-bold uppercase tracking-wider text-purple-600">Parameters</span></div>
                      <p className="text-[18px] font-black text-[var(--text-strong)]">{paramString}</p>
                      <p className="text-[11px] font-medium text-purple-600 flex items-center gap-1">
                        {modelData?.vramEstimates?.paramSource === 'safetensors'
                          ? <><CheckCircle className="h-3 w-3" /> Verified (safetensors)</>
                          : 'Estimated from config'}
                      </p>
                    </div>
                  </div>

                  {/* Model Metadata Table */}
                  <div className="overflow-hidden rounded-[22px] border border-[var(--border-soft)] bg-white">
                    <h3 className="px-5 py-3 text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--text-faint)] bg-[rgba(245,248,252,0.92)] border-b border-[var(--border-soft)]">Model Configuration</h3>
                    {[
                      ['Architecture', modelData?.config?.model_type || 'Unknown'],
                      ['Context Window', modelData?.config?.max_position_embeddings ? `${modelData.config.max_position_embeddings.toLocaleString()} tokens` : 'Unknown'],
                      ['Hidden Size', modelData?.config?.hidden_size?.toLocaleString() || 'Unknown'],
                      ['Layers', modelData?.config?.num_hidden_layers || 'Unknown'],
                      ['Attention Heads', modelData?.config?.num_attention_heads || 'Unknown'],
                      ['KV Heads (GQA)', modelData?.config?.num_key_value_heads !== modelData?.config?.num_attention_heads
                        ? `${modelData?.config?.num_key_value_heads} (${Math.round((modelData?.config?.num_attention_heads || 1) / (modelData?.config?.num_key_value_heads || 1))}x GQA)`
                        : `${modelData?.config?.num_key_value_heads || 'Unknown'} (Standard MHA)`],
                      ['Vocabulary Size', modelData?.config?.vocab_size?.toLocaleString() || 'Unknown'],
                      ['Precision', modelData?.config?.torch_dtype || 'Unknown'],
                      ...(modelData?.config?.num_experts ? [['MoE Experts', `${modelData.config.num_experts} experts, ${modelData.config.num_experts_per_tok || '?'} active per token`]] : []),
                      ...(modelData?.config?.sliding_window ? [['Sliding Window', `${modelData.config.sliding_window.toLocaleString()} tokens`]] : []),
                    ].map(([label, value], i) => (
                      <div key={label} className={`grid grid-cols-1 text-[13px] md:grid-cols-12 ${i > 0 ? 'border-t border-[var(--border-soft)]' : ''}`}>
                        <div className="bg-[rgba(245,248,252,0.92)] px-5 py-3 font-semibold text-[var(--text-faint)] md:col-span-4">{label}</div>
                        <div className="px-5 py-3 font-bold text-[var(--text-main)] md:col-span-8">{value}</div>
                      </div>
                    ))}
                  </div>
                </section>

                <DeploymentScoreSection deploymentScore={deploymentScore} />
                <VRAMSection vramEstimates={modelData?.vramEstimates} />
                <LicenseSection licenseInfo={modelData?.licenseInfo} licenseDisplay={licenseDisplay} deploymentRec={deploymentRec} />
                <HardwareSection gpuRecommendations={gpuRecommendations} cloudCosts={cloudCosts} multiGPU={multiGPU} vramEstimates={modelData?.vramEstimates} />
                <CompatibilitySection compatibility={compatibility} />
                <CodeSnippetsSection codeSnippets={codeSnippets} frameworks={frameworks} modelId={modelData?.modelId} />
                <TCOSection tco={tco} />
                <ParametersSection parameterCategories={parameterCategories} config={modelData?.config} />
              </div>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModelDetailPage;
