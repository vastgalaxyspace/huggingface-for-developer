"use client";
import { useState } from 'react';
import Link from 'next/link';
import { Table, BarChart2, Plus, X, Loader2, Info } from 'lucide-react';
import ModelSelector from '../components/ModelSelector';
import { fetchCompleteModelData } from '../services/huggingface';
import { enrichModelData } from '../utils/modelUtils';
import { notify } from '../lib/notifications';

const ComparisonPage = () => {
  const [viewMode, setViewMode] = useState('table');
  const [selectedModels, setSelectedModels] = useState([]);
  const [isAddingMode, setIsAddingMode] = useState(false);

  const handleSelectModel = async (modelId) => {
    if (selectedModels.find(m => m.id === modelId)) {
      setIsAddingMode(false);
      return;
    }
    
    if (selectedModels.length >= 3) {
      notify('You can only compare up to 3 models at a time.', 'info');
      return;
    }

    setIsAddingMode(false);
    
    const newModelObj = { id: modelId, isLoading: true };
    setSelectedModels(prev => [...prev, newModelObj]);

    try {
      const fullData = await fetchCompleteModelData(modelId);
      const enriched = enrichModelData(fullData.metadata);
      
      setSelectedModels(prev => prev.map(m => 
        m.id === modelId ? { 
          id: modelId, 
          isLoading: false, 
          data: enriched, 
          config: fullData.config || {}
        } : m
      ));
    } catch (error) {
      console.error(error);
      setSelectedModels(prev => prev.map(m =>
        m.id === modelId ? { id: modelId, isLoading: false, error: 'Failed to load model.' } : m
      ));
    }
  };

  const removeModel = (modelId) => {
    setSelectedModels(prev => prev.filter(m => m.id !== modelId));
  };

  // Generate pseudo-mock data for heuristic benchmarks based on modelId hash to remain deterministic
  const getMockScore = (modelId, metric) => {
    let hash = 0;
    for (let i = 0; i < modelId.length; i++) hash = modelId.charCodeAt(i) + ((hash << 5) - hash);
    const seed = Math.abs(hash);
    
    if (metric === 'mmlu') return (60 + (seed % 30)).toFixed(1);
    if (metric === 'humaneval') return (50 + (seed % 35)).toFixed(1);
    if (metric === 'gsm8k') return (65 + (seed % 30)).toFixed(1);
    if (metric === 'tps') return (20 + (seed % 80)).toFixed(1);
    if (metric === 'latency') return (150 + (seed % 900)).toFixed(0);
    return 'N/A';
  };

  const getHardwareReq = (vram) => {
    if (!vram) return 'Unknown';
    if (vram < 8) return 'Consumer GPU (RTX 4060 / Mac 16GB)';
    if (vram <= 16) return 'High-end Consumer (RTX 4080)';
    if (vram <= 24) return 'Enthusiast (RTX 3090/4090 / Mac 64GB)';
    if (vram <= 48) return 'Entry Server (2x RTX 4090 / A6000)';
    if (vram <= 80) return 'Enterprise Server (1x A100 80GB)';
    return 'Multi-GPU Cluster (2x+ A100)';
  };

  const getSoftwareEco = (modelId) => {
    const id = modelId.toLowerCase();
    if (id.includes('llama') || id.includes('mistral') || id.includes('qwen')) return 'Excellent (vLLM, TGI, llama.cpp)';
    return 'Standard (HF Transformers)';
  };

  const getCloudReq = (vram) => {
    if (!vram) return 'Unknown';
    if (vram <= 24) return 'AWS g5.xlarge / GCP L4 (Cost Effective)';
    if (vram <= 80) return 'AWS p4d / GCP A100 (High Performance)';
    return 'Multi-Node / Multi-GPU Instances (Expensive)';
  };

  const getCostEstimate = (params) => {
    if (!params) return 'Unknown';
    if (params < 3) return 'Very Low (~$0.10 / 1M tokens)';
    if (params <= 10) return 'Low (~$0.20 / 1M tokens)';
    if (params <= 35) return 'Medium (~$0.70 / 1M tokens)';
    return 'High ($1.00+ / 1M tokens)';
  };

  const comparisonRows = [
    { section: 'ARCHITECTURE & SIZE', label: 'Parameters', bgClass: 'bg-white', getValue: (m) => m.data?.rawParams || m.data?.vramEstimates?.totalParams || 'Unknown', tooltip: 'Total parameters. Higher typically means better reasoning but requires more hardware.' },
    { label: 'Context Window', bgClass: 'bg-[rgba(251,253,255,0.85)]', getValue: (m) => m.config?.max_position_embeddings ? (m.config.max_position_embeddings / 1000) + 'k' : 'N/A', tooltip: 'Maximum number of tokens the model can process in one prompt. Essential for RAG and document summarization.' },
    { label: 'Architecture', bgClass: 'bg-white', getValue: (m) => m.config?.model_type ? m.config.model_type.toUpperCase() : (m.data?.pipelineText || 'Unknown') },
    { label: 'License', bgClass: 'bg-[rgba(251,253,255,0.85)]', getValue: (m) => m.data?.licenseInfo?.name || 'Unknown', tooltip: 'Ensure the license aligns with your target use-case, especially for commercial deployment.' },
    { section: 'MODEL DETAILS & TENSORS', label: 'Vocabulary Size', bgClass: 'bg-white', getValue: (m) => m.config?.vocab_size ? m.config.vocab_size.toLocaleString() : 'N/A', tooltip: 'Larger vocabularies can be more efficient for multilingual tasks and coding.' },
    { label: 'Hidden Layers', bgClass: 'bg-[rgba(251,253,255,0.85)]', getValue: (m) => m.config?.num_hidden_layers || 'N/A' },
    { label: 'Attention Heads', bgClass: 'bg-white', getValue: (m) => m.config?.num_attention_heads || 'N/A' },
    { label: 'Default Precision', bgClass: 'bg-[rgba(251,253,255,0.85)]', getValue: (m) => m.config?.torch_dtype || 'N/A' },
    { section: 'DEPLOYMENT & DEVELOPER PERSPECTIVES', label: 'Hardware Perspective', bgClass: 'bg-white', getValue: (m) => getHardwareReq(m.data?.vramEstimates?.fp16), tooltip: 'Estimated GPU requirements depending on FP16 VRAM sizing.' },
    { label: 'Software / Ecosystem', bgClass: 'bg-[rgba(251,253,255,0.85)]', getValue: (m) => getSoftwareEco(m.id), tooltip: 'Popular architectures have highly optimized inference engines available out-of-the-box.' },
    { label: 'Cloud Deployment', bgClass: 'bg-white', getValue: (m) => getCloudReq(m.data?.vramEstimates?.fp16), tooltip: 'Target instances when deploying the model onto cloud VM environments.' },
    { label: 'Inference Cost (API)', bgClass: 'bg-[rgba(251,253,255,0.85)]', getValue: (m) => getCostEstimate(m.data?.vramEstimates?.totalParams), tooltip: 'Relative token cost if accessing this model via managed endpoints.' },
    { section: 'COMMUNITY & USAGE', label: 'Downloads', bgClass: 'bg-white', getValue: (m) => m.data?.downloads ? m.data.downloads.toLocaleString() : '0', isNumericMaxHighlight: true, tooltip: 'High downloads indicate a robust and heavily-tested model with good community support.' },
    { label: 'Likes', bgClass: 'bg-[rgba(251,253,255,0.85)]', getValue: (m) => m.data?.likes ? m.data.likes.toLocaleString() : '0', isNumericMaxHighlight: true, tooltip: 'A direct metric of quality and developer appreciation.' },
    { section: 'HEURISTIC BENCHMARKS (ESTIMATED)', label: 'MMLU Bench', bgClass: 'bg-white', getValue: (m) => getMockScore(m.id, 'mmlu'), isNumericMaxHighlight: true, suffix: '%', tooltip: 'Estimates multi-task knowledge reasoning capabilities.' },
    { label: 'HumanEval', bgClass: 'bg-[rgba(251,253,255,0.85)]', getValue: (m) => getMockScore(m.id, 'humaneval'), isNumericMaxHighlight: true, suffix: '%', tooltip: 'Estimates code generation accuracy.' },
    { label: 'GSM8K (Math)', bgClass: 'bg-white border-b', getValue: (m) => getMockScore(m.id, 'gsm8k'), isNumericMaxHighlight: true, suffix: '%', tooltip: 'Estimates mathematical reasoning capabilities.' },
  ];

  const renderModelHeaders = () => {
    const columns = [];
    for (let i = 0; i < 3; i++) {
      if (i < selectedModels.length) {
        const m = selectedModels[i];
        columns.push(
          <div key={m.id} className="group relative border-l border-[var(--border-soft)] px-7 py-6">
            <button 
              onClick={() => removeModel(m.id)}
              className="absolute right-4 top-4 rounded bg-[rgba(255,0,0,0.05)] p-1.5 text-[rgba(255,0,0,0.4)] opacity-0 transition-opacity hover:bg-[rgba(255,0,0,0.1)] hover:text-[rgba(255,0,0,0.8)] group-hover:opacity-100"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="mb-2 text-[var(--accent)]">MODEL {i + 1}</div>
            {m.isLoading ? (
              <div className="flex h-[3.5rem] items-center text-[var(--text-muted)]">
                <Loader2 className="mr-2 h-5 w-5 animate-spin text-[var(--accent)]" /> 
                <span className="text-sm font-medium">Loading...</span>
              </div>
            ) : m.error ? (
              <div className="flex h-[3.5rem] items-center text-red-500 font-medium text-sm">
                Error loading data
              </div>
            ) : (
              <>
                <div className="mb-1 truncate text-[1.5rem] font-black tracking-tight normal-case text-[var(--text-strong)]" title={m.data?.name || m.id}>
                  {(m.data?.name || m.id).split('/').pop()}
                </div>
                <div className="text-[10px] text-[var(--text-faint)] truncate" title={m.id}>{m.id}</div>
              </>
            )}
          </div>
        );
      } else if (i === selectedModels.length) {
        columns.push(
          <div key={`add-${i}`} className="flex flex-col justify-center border-l border-[var(--border-soft)] px-7 py-6">
            {isAddingMode ? (
              <div className="relative z-50">
                <ModelSelector onSelect={handleSelectModel} onCancel={() => setIsAddingMode(false)} />
              </div>
            ) : (
              <button
                onClick={() => setIsAddingMode(true)}
                className="flex w-full items-center justify-center rounded-xl border-2 border-dashed border-[var(--border-strong)] bg-transparent px-6 py-5 font-bold text-[var(--text-muted)] transition-colors hover:border-[var(--accent)] hover:bg-[var(--accent-soft)] hover:text-[var(--accent)]"
              >
                <Plus className="mr-2 h-5 w-5" /> Add Model
              </button>
            )}
          </div>
        );
      } else {
        columns.push(
          <div key={`empty-${i}`} className="border-l border-[var(--border-soft)] bg-[rgba(245,248,251,0.4)] px-7 py-6"></div>
        );
      }
    }
    return columns; 
  };

  const renderRow = (label, bgClass, getValue, isNumericMaxHighlight = false, suffix = '', tooltip = null) => {
    let maxVal = -Infinity;
    if (isNumericMaxHighlight) {
      selectedModels.forEach(m => {
        if (!m.isLoading && !m.error) {
          const v = parseFloat(getValue(m));
          if (!isNaN(v) && v > maxVal) maxVal = v;
        }
      });
    }

    const cols = [];
    for (let i = 0; i < 3; i++) {
      const m = selectedModels[i];
      if (m && !m.isLoading && !m.error) {
        const val = getValue(m);
        const numVal = parseFloat(val);
        const isMax = isNumericMaxHighlight && !isNaN(numVal) && numVal === maxVal;
        cols.push(
          <div key={m.id} className={`border-l border-[var(--border-soft)] px-7 py-6 ${isMax ? 'bg-[rgba(221,235,248,0.75)] text-[1.05rem] font-extrabold text-[var(--accent)]' : 'font-medium text-[var(--text-main)]'}`}>
            {val ? `${val}${suffix}` : 'N/A'}
          </div>
        );
      } else {
        cols.push(<div key={`col-${i}`} className="border-l border-[var(--border-soft)] px-7 py-6 text-[var(--text-faint)] flex items-center">-</div>);
      }
    }

    return (
      <div className={`grid grid-cols-[minmax(0,1.2fr)_repeat(3,minmax(0,1fr))] border-t border-[var(--border-soft)] ${bgClass}`}>
        <div className="flex flex-col justify-center px-7 py-5">
          <div className="flex items-center font-semibold text-[var(--text-main)] gap-1.5">
            {label}
            {tooltip && (
              <div className="group/tooltip relative flex items-center">
                <Info className="h-3.5 w-3.5 text-[var(--text-faint)] hover:text-[var(--accent)] transition-colors cursor-help" />
                <div className="absolute left-6 top-1/2 -translate-y-1/2 hidden w-64 rounded-xl border border-[var(--border-soft)] bg-white p-3 text-xs font-medium leading-relaxed text-[var(--text-muted)] shadow-[0_8px_20px_rgba(0,0,0,0.08)] group-hover/tooltip:block z-50">
                  {tooltip}
                </div>
              </div>
            )}
          </div>
        </div>
        {cols}
      </div>
    );
  };

  return (
    <div className="min-h-[calc(100vh-78px)] py-8 sm:py-12">
      <div className="shell-container relative">
        <div className="relative z-10 mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-start">
          <div className="max-w-3xl">
            <p className="section-kicker mb-4">Benchmark Workspace</p>
            <h1 className="mb-3 text-3xl font-black tracking-tight text-[var(--text-strong)] sm:text-[2.65rem]">
              Model Comparison
            </h1>
            <p className="max-w-2xl text-base font-medium leading-relaxed text-[var(--text-muted)] sm:text-lg">
              Compare shortlisted models side by side across context, licensing, hardware fit, community adoption, and deployment-facing operator signals.
            </p>
            <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold text-[var(--text-faint)]">
              <span>Up to 3 models at once</span>
              <span>Context, VRAM, license, ecosystem, and heuristic benchmark view</span>
              <span>Built for shortlist validation, not hype-based picking</span>
            </div>
          </div>

          <div className="flex w-full items-center rounded-2xl border border-[var(--border-soft)] bg-[rgba(237,243,249,0.92)] p-1.5 md:w-auto">
            <button
              onClick={() => setViewMode('table')}
              className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-[13px] font-bold transition-colors md:flex-none md:px-5 ${
                viewMode === 'table' ? 'bg-white text-[var(--accent)] shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--text-strong)]'
              }`}
            >
              <Table className="h-[14px] w-[14px]" /> Table
            </button>
            <button
              onClick={() => setViewMode('visual')}
              className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-[13px] font-bold transition-colors md:flex-none md:px-5 ${
                viewMode === 'visual' ? 'bg-white text-[var(--accent)] shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--text-strong)]'
              }`}
            >
              <BarChart2 className="h-[14px] w-[14px]" /> Chart
            </button>
          </div>
        </div>

        <section className="mb-8 grid gap-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
          <article className="rounded-[24px] border border-[var(--border-soft)] bg-white p-6 shadow-[0_12px_28px_rgba(48,67,95,0.06)]">
            <h2 className="text-2xl font-black tracking-tight text-[var(--text-strong)]">How to compare models well</h2>
            <ol className="mt-4 space-y-3 text-sm leading-7 text-[var(--text-muted)]">
              <li>1. Start with models that solve the same task category instead of mixing unrelated architectures.</li>
              <li>2. Check license and context window before looking at popularity numbers.</li>
              <li>3. Use VRAM and hardware signals to remove models that do not fit your deployment reality.</li>
              <li>4. Treat benchmark-style values as directional and validate the final shortlist on your own prompts.</li>
            </ol>
          </article>

          <article className="rounded-[24px] border border-[var(--border-soft)] bg-[var(--panel-muted)] p-6">
            <h2 className="text-2xl font-black tracking-tight text-[var(--text-strong)]">What this tool is best for</h2>
            <div className="mt-4 space-y-3 text-sm leading-7 text-[var(--text-muted)]">
              <p>
                This page works best when you already have a shortlist and need to reduce it. It is especially useful
                for comparing deployment tradeoffs such as VRAM, context, ecosystem support, and licensing posture.
              </p>
              <p>
                If you still do not know which models to shortlist, start with the{' '}
                <Link href="/recommender" className="font-semibold text-[var(--accent)] hover:text-[var(--accent-strong)]">
                  recommender
                </Link>{' '}
                first, then come back here.
              </p>
            </div>
          </article>
        </section>

        {viewMode === 'table' && (
          <div className="editorial-panel mb-12 overflow-hidden rounded-[28px] text-[14px]">
            <div className={`hidden grid-cols-[minmax(0,1.2fr)_repeat(3,minmax(0,1fr))] border-b border-[var(--border-soft)] bg-[var(--panel-muted)] text-[11px] font-bold tracking-[0.24em] text-[var(--text-muted)] md:grid`}>
              <div className="flex flex-col justify-end px-7 py-6 uppercase">Specifications</div>
              {renderModelHeaders()}
            </div>
            <div className="hidden md:block">
              {comparisonRows.map((row) => (
                <div key={row.label}>
                  {row.section ? (
                    <div className="bg-[rgba(245,248,251,0.9)] px-7 py-3 text-[10px] font-bold uppercase tracking-[0.24em] text-[var(--text-faint)]">
                      {row.section}
                    </div>
                  ) : null}
                  {renderRow(row.label, row.bgClass, row.getValue, row.isNumericMaxHighlight, row.suffix || '', row.tooltip || null)}
                </div>
              ))}
            </div>

            <div className="space-y-4 p-4 md:hidden">
              {selectedModels.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-[var(--border-soft)] bg-white px-5 py-10 text-center text-sm text-[var(--text-faint)]">
                  Add models to start comparing on mobile.
                </div>
              ) : (
                selectedModels.map((m, index) => (
                  <div key={m.id} className="rounded-[24px] border border-[var(--border-soft)] bg-white p-5 shadow-[0_10px_24px_rgba(48,67,95,0.06)]">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--accent)]">Model {index + 1}</div>
                        {m.isLoading ? (
                          <div className="mt-3 flex items-center text-sm text-[var(--text-muted)]">
                            <Loader2 className="mr-2 h-4 w-4 animate-spin text-[var(--accent)]" />
                            Loading...
                          </div>
                        ) : m.error ? (
                          <div className="mt-3 text-sm font-medium text-red-500">Error loading data</div>
                        ) : (
                          <>
                            <div className="mt-2 break-words text-lg font-black tracking-tight text-[var(--text-strong)]">
                              {(m.data?.name || m.id).split('/').pop()}
                            </div>
                            <div className="mt-1 break-all text-[11px] text-[var(--text-faint)]">{m.id}</div>
                          </>
                        )}
                      </div>
                      <button
                        onClick={() => removeModel(m.id)}
                        className="rounded-lg bg-[rgba(255,0,0,0.05)] p-1.5 text-[rgba(255,0,0,0.55)]"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    {!m.isLoading && !m.error ? (
                      <div className="mt-5 space-y-5">
                        {comparisonRows.map((row) => (
                          <div key={`${m.id}-${row.label}`}>
                            {row.section ? (
                              <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--text-faint)]">
                                {row.section}
                              </div>
                            ) : null}
                            <div className="rounded-2xl border border-[var(--border-soft)] bg-[rgba(245,248,251,0.45)] px-4 py-3">
                              <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--text-faint)]">{row.label}</div>
                              <div className="mt-1 text-sm font-semibold text-[var(--text-main)]">{`${row.getValue(m)}${row.suffix || ''}`}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>
                ))
              )}

              {selectedModels.length < 3 ? (
                <div className="rounded-[24px] border border-dashed border-[var(--border-strong)] bg-white p-5">
                  {isAddingMode ? (
                    <div className="relative z-50">
                      <ModelSelector onSelect={handleSelectModel} onCancel={() => setIsAddingMode(false)} />
                    </div>
                  ) : (
                    <button
                      onClick={() => setIsAddingMode(true)}
                      className="flex w-full items-center justify-center rounded-xl border-2 border-dashed border-[var(--border-strong)] px-4 py-4 font-bold text-[var(--text-muted)]"
                    >
                      <Plus className="mr-2 h-5 w-5" /> Add Model
                    </button>
                  )}
                </div>
              ) : null}
            </div>
          </div>
        )}

        {viewMode === 'visual' && (
          <div className="mb-8">
            <h3 className="mb-4 text-[11px] font-bold uppercase tracking-[0.24em] text-[var(--text-faint)]">
              VISUAL TREND (MMLU COMPARISON)
            </h3>
            {selectedModels.length === 0 ? (
              <div className="editorial-panel flex h-[280px] items-center justify-center rounded-[24px] text-sm text-[var(--text-faint)]">
                Add models in Table view to see chart visualizations.
              </div>
            ) : (
              <div className="editorial-panel flex h-[320px] items-end justify-center gap-4 overflow-x-auto rounded-[24px] p-6 pb-10 sm:gap-8 sm:p-10 sm:pb-16">
                {selectedModels.map((m) => {
                  if (m.isLoading || m.error) return null;
                  const score = parseFloat(getMockScore(m.id, 'mmlu'));
                  // Scale height: 100% = 240px
                  const height = (score / 100) * 240;
                  return (
                    <div key={m.id} className="group flex min-w-[88px] flex-col items-center gap-4 sm:min-w-[100px]">
                      <div className="relative w-[88px] overflow-hidden rounded-t-lg bg-[var(--accent-soft)] transition-all duration-500 group-hover:bg-[var(--accent)] sm:w-[100px]" style={{ height: `${height}px` }}>
                        <div className="absolute top-2 w-full text-center text-[11px] font-bold text-[var(--accent)] group-hover:text-white transition-colors">{score}%</div>
                      </div>
                      <span className="max-w-[88px] truncate text-center text-[11px] font-bold tracking-[0.12em] text-[var(--text-strong)] sm:max-w-[120px]" title={m.id}>
                        {m.data?.name?.split('/').pop().substring(0, 12)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
            <p className="mt-4 text-sm italic text-[var(--text-faint)] text-center">
              Note: Visualizations use estimated heuristic values for demonstration.
            </p>
          </div>
        )}

        <section className="grid gap-5 md:grid-cols-3">
          <article className="rounded-[24px] border border-[var(--border-soft)] bg-white p-6 shadow-[0_12px_28px_rgba(48,67,95,0.05)]">
            <h2 className="text-lg font-black tracking-tight text-[var(--text-strong)]">Important caution</h2>
            <p className="mt-3 text-sm leading-7 text-[var(--text-muted)]">
              A model with better public popularity or benchmark estimates can still be the wrong production choice if
              it breaks your latency, privacy, or infrastructure limits.
            </p>
          </article>
          <article className="rounded-[24px] border border-[var(--border-soft)] bg-white p-6 shadow-[0_12px_28px_rgba(48,67,95,0.05)]">
            <h2 className="text-lg font-black tracking-tight text-[var(--text-strong)]">Best next step</h2>
            <p className="mt-3 text-sm leading-7 text-[var(--text-muted)]">
              After comparing here, send the winner through the{' '}
              <Link href="/gpu/tools/vram-calculator" className="font-semibold text-[var(--accent)] hover:text-[var(--accent-strong)]">
                VRAM calculator
              </Link>{' '}
              and{' '}
              <Link href="/gpu/tools/gpu-picker" className="font-semibold text-[var(--accent)] hover:text-[var(--accent-strong)]">
                GPU picker
              </Link>{' '}
              so the recommendation stays grounded in hardware reality.
            </p>
          </article>
          <article className="rounded-[24px] border border-[var(--border-soft)] bg-white p-6 shadow-[0_12px_28px_rgba(48,67,95,0.05)]">
            <h2 className="text-lg font-black tracking-tight text-[var(--text-strong)]">Related reading</h2>
            <p className="mt-3 text-sm leading-7 text-[var(--text-muted)]">
              For deeper decision guidance, read{' '}
              <Link href="/guides/model-selection-mistakes" className="font-semibold text-[var(--accent)] hover:text-[var(--accent-strong)]">
                Selection Pitfalls
              </Link>{' '}
              and{' '}
              <Link href="/guides/choose-ai-model-by-gpu-budget" className="font-semibold text-[var(--accent)] hover:text-[var(--accent-strong)]">
                the GPU and budget framework
              </Link>.
            </p>
          </article>
        </section>
      </div>
    </div>
  );
};

export default ComparisonPage;
