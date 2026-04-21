"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  CartesianGrid,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from 'recharts';
import {
  benchmarkRows,
  estimateModelMemory,
  memoryFormula,
  methodologySources,
  PRECISION_STRATEGY_LAST_UPDATED,
  precisionEntries,
  recommendPrecision,
  scenarioCards,
} from '../../data/precisionStrategyData';
import {
  benchmarkRunnerRecipes,
  cloudGpuPricing,
  compatibilityMatrix,
  confidenceTags,
  generateDeploymentSnippet,
  kvPrecisionProfiles,
  regressionPromptPack,
  responseDiffSamples,
  runtimeOverheadProfiles,
} from '../../data/precisionDeveloperData';

const MODEL_SIZE_PRESETS = [1, 3, 7, 13, 34, 70];
const DEPLOYMENT_RUNTIMES = ['vllm', 'llama.cpp', 'tensorrt_llm', 'custom'];

function riskBadgeClass(riskBadge) {
  const value = String(riskBadge || '').toLowerCase();
  if (value.includes('research') || value.includes('experimental')) return 'bg-rose-50 text-rose-700 border border-rose-200';
  if (value.includes('balanced') || value.includes('default')) return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
  if (value.includes('quality')) return 'bg-blue-50 text-blue-700 border border-blue-200';
  return 'bg-amber-50 text-amber-700 border border-amber-200';
}

function confidenceClass(tag) {
  if (tag === 'source-reported') return 'bg-blue-50 text-blue-700 border border-blue-200';
  if (tag === 'locally reproducible recipe') return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
  return 'bg-amber-50 text-amber-700 border border-amber-200';
}

function formatMemory(value) {
  if (!Number.isFinite(value)) return 'N/A';
  return `${value.toFixed(2)} GB`;
}

function toCsv(rows) {
  if (!rows.length) return '';
  const headers = Object.keys(rows[0]);
  const escape = (value) => `"${String(value ?? '').replaceAll('"', '""')}"`;
  const lines = [headers.join(',')];
  for (const row of rows) {
    lines.push(headers.map((key) => escape(row[key])).join(','));
  }
  return lines.join('\n');
}

function downloadFile(name, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = name;
  anchor.click();
  URL.revokeObjectURL(url);
}

function statusClass(status) {
  if (status === 'native') return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
  if (status === 'partial' || status === 'model-dependent') return 'bg-amber-50 text-amber-700 border border-amber-200';
  if (status === 'no-native') return 'bg-rose-50 text-rose-700 border border-rose-200';
  return 'bg-blue-50 text-blue-700 border border-blue-200';
}

function highlightDiff(baseText, compareText) {
  const baseWords = new Set(baseText.split(/\s+/));
  return compareText.split(/\s+/).map((word, index) => {
    const changed = !baseWords.has(word);
    return (
      <span key={`${word}-${index}`} className={changed ? 'bg-yellow-100 text-yellow-900 px-0.5 rounded' : ''}>
        {word}{' '}
      </span>
    );
  });
}

function TradeoffTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const data = payload[0].payload;
  return (
    <div className="rounded-xl border border-[var(--border-soft)] bg-white p-3 shadow-lg">
      <p className="text-sm font-bold text-[var(--text-strong)]">{data.displayName}</p>
      <p className="text-xs text-[var(--text-main)]">Memory: {data.memoryGb.toFixed(2)} GB</p>
      <p className="text-xs text-[var(--text-main)]">Quality score: {data.qualityScore}</p>
      <p className="text-xs text-[var(--text-main)]">Speed score: {data.speedScore}</p>
    </div>
  );
}

export default function PrecisionStrategyWorkbench() {
  const [goalFilter, setGoalFilter] = useState('all');
  const [hardwareFilter, setHardwareFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [modelSizeB, setModelSizeB] = useState(7);
  const [confidenceFilter, setConfidenceFilter] = useState('all');

  const [calcPrecision, setCalcPrecision] = useState('fp16');
  const [calcContextLength, setCalcContextLength] = useState(4096);
  const [calcBatchSize, setCalcBatchSize] = useState(1);
  const [includeOverhead, setIncludeOverhead] = useState(true);
  const [runtimeProfileId, setRuntimeProfileId] = useState('generic');
  const [kvPrecisionId, setKvPrecisionId] = useState('fp16');

  const [wizardHardwareType, setWizardHardwareType] = useState('gpu');
  const [wizardGoal, setWizardGoal] = useState('inference');
  const [wizardPriority, setWizardPriority] = useState('balanced');
  const [wizardVram, setWizardVram] = useState(8);
  const [deployRuntime, setDeployRuntime] = useState('vllm');
  const [deployModelId, setDeployModelId] = useState('meta-llama/Llama-3-8B-Instruct');

  const [cloudGpuId, setCloudGpuId] = useState('l4');
  const [cloudUtilization, setCloudUtilization] = useState(65);
  const [avgTokensPerRequest, setAvgTokensPerRequest] = useState(1200);

  const [baseDiffId, setBaseDiffId] = useState('fp16');
  const [compareDiffId, setCompareDiffId] = useState('int4');

  const chartContainerRef = useRef(null);
  const [chartReady, setChartReady] = useState(false);
  const [chartSize, setChartSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const element = chartContainerRef.current;
    if (!element || typeof ResizeObserver === 'undefined') return undefined;
    const observer = new ResizeObserver(([entry]) => {
      const width = entry?.contentRect?.width || 0;
      const height = entry?.contentRect?.height || 0;
      setChartSize({
        width: Math.max(0, Math.floor(width - 24)),
        height: Math.max(0, Math.floor(height - 24)),
      });
      setChartReady(width > 0 && height > 0);
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const runtimeProfile = useMemo(
    () => runtimeOverheadProfiles.find((item) => item.id === runtimeProfileId) || runtimeOverheadProfiles[0],
    [runtimeProfileId],
  );
  const kvProfile = useMemo(
    () => kvPrecisionProfiles.find((item) => item.id === kvPrecisionId) || kvPrecisionProfiles[0],
    [kvPrecisionId],
  );

  const groupedFamilies = useMemo(() => {
    const map = new Map();
    for (const entry of precisionEntries) {
      const current = map.get(entry.family) || [];
      current.push(entry);
      map.set(entry.family, current);
    }
    return Array.from(map.entries()).map(([family, entries]) => ({ family, entries }));
  }, []);

  const filteredPrecisions = useMemo(() => {
    return precisionEntries
      .filter((entry) => {
        if (goalFilter === 'training' && !entry.supportsTraining) return false;
        if (goalFilter === 'inference' && !entry.supportsInference) return false;
        if (hardwareFilter !== 'all' && !entry.hardwareSupport.toLowerCase().includes(hardwareFilter)) return false;
        if (priorityFilter === 'quality' && entry.qualityScore < 90) return false;
        if (priorityFilter === 'balanced' && !(entry.qualityScore >= 80 && entry.memoryScore >= 70)) return false;
        if (priorityFilter === 'memory' && entry.memoryScore < 88) return false;
        return true;
      })
      .sort((a, b) => b.qualityScore - a.qualityScore);
  }, [goalFilter, hardwareFilter, priorityFilter]);

  const applyProfiledMemory = useCallback((precisionId, contextLength, batchSize) => {
    const base = estimateModelMemory({
      paramsB: Number(modelSizeB),
      precisionId,
      includeRuntimeOverhead: includeOverhead,
      contextLength: Number(contextLength),
      batchSize: Number(batchSize),
    });

    const weightedRuntime = includeOverhead ? base.weightsGb * runtimeProfile.overheadMultiplier : base.weightsGb;
    const kvAdjustedContext = Number(contextLength) * Number(batchSize) * runtimeProfile.contextOverheadGbPerTokenBatch * kvProfile.multiplier;
    return {
      weightsGb: base.weightsGb,
      runtimeAdjustedGb: Number(weightedRuntime.toFixed(2)),
      contextGb: Number(kvAdjustedContext.toFixed(2)),
      totalGb: Number((weightedRuntime + kvAdjustedContext).toFixed(2)),
    };
  }, [includeOverhead, kvProfile.multiplier, modelSizeB, runtimeProfile.contextOverheadGbPerTokenBatch, runtimeProfile.overheadMultiplier]);

  const memoryEstimates = useMemo(() => {
    const selected = applyProfiledMemory(calcPrecision, calcContextLength, calcBatchSize);
    const baselines = ['fp32', 'fp16', 'int8', 'int4'].map((id) => {
      const entry = precisionEntries.find((item) => item.id === id);
      const estimate = applyProfiledMemory(id, calcContextLength, calcBatchSize);
      return { id, displayName: entry?.displayName || id.toUpperCase(), totalGb: estimate.totalGb };
    });
    return { selected, baselines };
  }, [applyProfiledMemory, calcBatchSize, calcContextLength, calcPrecision]);

  const filteredBenchmarks = useMemo(() => {
    if (confidenceFilter === 'all') return benchmarkRows;
    return benchmarkRows.filter((row) => row.confidenceTag === confidenceFilter);
  }, [confidenceFilter]);

  const tradeoffData = useMemo(() => {
    return filteredPrecisions.map((entry) => {
      const estimate = applyProfiledMemory(entry.id, 4096, 1);
      return {
        id: entry.id,
        displayName: entry.displayName,
        memoryGb: estimate.totalGb,
        qualityScore: entry.qualityScore,
        speedScore: entry.speedScore,
      };
    });
  }, [applyProfiledMemory, filteredPrecisions]);

  const recommendation = useMemo(() => {
    return recommendPrecision({
      hardwareType: wizardHardwareType,
      vramGb: Number(wizardVram),
      goal: wizardGoal,
      priority: wizardPriority,
      modelSizeB: Number(modelSizeB),
    });
  }, [modelSizeB, wizardGoal, wizardHardwareType, wizardPriority, wizardVram]);

  const deploySnippet = useMemo(() => {
    return generateDeploymentSnippet({
      runtime: deployRuntime,
      modelId: deployModelId,
      precisionLabel: recommendation.recommended,
    });
  }, [deployModelId, deployRuntime, recommendation.recommended]);

  const cloudCost = useMemo(() => {
    const gpu = cloudGpuPricing.find((item) => item.id === cloudGpuId) || cloudGpuPricing[0];
    const benchmark = filteredBenchmarks.find((row) => Number.isFinite(row.throughputTokPerSec));
    const tps = benchmark?.throughputTokPerSec || 120;
    const effectiveTps = tps * (Number(cloudUtilization) / 100);
    const secondsPerMillion = 1_000_000 / Math.max(effectiveTps, 1);
    const hoursPerMillion = secondsPerMillion / 3600;
    const usdPerMillion = hoursPerMillion * gpu.usdPerHour;
    return {
      gpu,
      effectiveTps: Number(effectiveTps.toFixed(2)),
      usdPerMillion: Number(usdPerMillion.toFixed(3)),
      requestCost: Number(((avgTokensPerRequest / 1_000_000) * usdPerMillion).toFixed(4)),
    };
  }, [avgTokensPerRequest, cloudGpuId, cloudUtilization, filteredBenchmarks]);

  const baseDiff = responseDiffSamples[baseDiffId];
  const compareDiff = responseDiffSamples[compareDiffId];

  const exportBenchmarkJson = () => downloadFile('precision-benchmarks.json', JSON.stringify(filteredBenchmarks, null, 2), 'application/json');
  const exportBenchmarkCsv = () => downloadFile('precision-benchmarks.csv', toCsv(filteredBenchmarks), 'text/csv');

  return (
    <div className="space-y-8">
      <section id="precision-families" className="editorial-panel rounded-[26px] border border-[var(--border-soft)] p-6 sm:p-8">
        <h2 className="text-2xl font-black tracking-tight text-[var(--text-strong)] sm:text-3xl">Precision Families Overview</h2>
        <p className="mt-3 text-sm leading-7 text-[var(--text-main)] sm:text-base">
          Precision decides the balance between memory, speed, cost, and output quality.
        </p>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {groupedFamilies.map((group) => (
            <article key={group.family} className="rounded-2xl border border-[var(--border-soft)] bg-[var(--panel-muted)] p-4">
              <h3 className="text-base font-black text-[var(--text-strong)]">{group.family}</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {group.entries.map((entry) => (
                  <span key={entry.id} className={`rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.08em] ${riskBadgeClass(entry.riskBadge)}`}>
                    {entry.displayName}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="comparison-table" className="editorial-panel rounded-[26px] border border-[var(--border-soft)] p-6 sm:p-8">
        <h2 className="text-2xl font-black tracking-tight text-[var(--text-strong)] sm:text-3xl">Interactive Precision Comparison</h2>
        <div className="mt-5 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          <label className="text-xs font-semibold text-[var(--text-main)]">Goal
            <select className="mt-2 w-full rounded-xl border border-[var(--border-soft)] bg-white px-3 py-2 text-sm" value={goalFilter} onChange={(e) => setGoalFilter(e.target.value)}>
              <option value="all">All</option><option value="training">Training</option><option value="inference">Inference</option>
            </select>
          </label>
          <label className="text-xs font-semibold text-[var(--text-main)]">Hardware
            <select className="mt-2 w-full rounded-xl border border-[var(--border-soft)] bg-white px-3 py-2 text-sm" value={hardwareFilter} onChange={(e) => setHardwareFilter(e.target.value)}>
              <option value="all">All</option><option value="cpu">CPU</option><option value="gpu">GPU</option><option value="tpu">TPU</option>
            </select>
          </label>
          <label className="text-xs font-semibold text-[var(--text-main)]">Priority
            <select className="mt-2 w-full rounded-xl border border-[var(--border-soft)] bg-white px-3 py-2 text-sm" value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
              <option value="all">All</option><option value="quality">Quality</option><option value="balanced">Balanced</option><option value="memory">Low memory</option>
            </select>
          </label>
          <label className="text-xs font-semibold text-[var(--text-main)]">Model size
            <select className="mt-2 w-full rounded-xl border border-[var(--border-soft)] bg-white px-3 py-2 text-sm" value={modelSizeB} onChange={(e) => setModelSizeB(Number(e.target.value))}>
              {MODEL_SIZE_PRESETS.map((size) => (<option key={size} value={size}>{size}B</option>))}
            </select>
          </label>
        </div>
        <div className="mt-5 overflow-x-auto rounded-2xl border border-[var(--border-soft)] bg-white/85">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-[var(--panel-muted)] text-xs uppercase tracking-[0.12em] text-[var(--text-faint)]">
              <tr><th className="px-4 py-3 font-bold">Precision</th><th className="px-4 py-3 font-bold">Type</th><th className="px-4 py-3 font-bold">Bits</th><th className="px-4 py-3 font-bold">Memory</th><th className="px-4 py-3 font-bold">Best Use</th></tr>
            </thead>
            <tbody>
              {filteredPrecisions.map((entry) => {
                const estimate = applyProfiledMemory(entry.id, 4096, 1);
                return (
                  <tr key={entry.id} className="border-t border-[var(--border-soft)] odd:bg-white even:bg-[#f8fbff]">
                    <td className="px-4 py-3"><p className="font-semibold text-[var(--text-strong)]">{entry.displayName}</p><span className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em] ${riskBadgeClass(entry.riskBadge)}`}>{entry.riskBadge}</span></td>
                    <td className="px-4 py-3 text-[var(--text-main)]">{entry.representationType}</td>
                    <td className="px-4 py-3 text-[var(--text-main)]">{entry.bitsOrEffectiveBpw}</td>
                    <td className="px-4 py-3 font-semibold text-[var(--text-strong)]">{estimate.totalGb.toFixed(2)} GB</td>
                    <td className="px-4 py-3 text-[var(--text-main)]">{entry.bestUseCases[0]}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section id="memory-calculator" className="editorial-panel rounded-[26px] border border-[var(--border-soft)] p-6 sm:p-8">
        <h2 className="text-2xl font-black tracking-tight text-[var(--text-strong)] sm:text-3xl">Memory Calculator + Runtime Profiles + KV Cache Precision</h2>
        <div className="mt-5 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          <label className="text-xs font-semibold text-[var(--text-main)]">Precision
            <select className="mt-2 w-full rounded-xl border border-[var(--border-soft)] bg-white px-3 py-2 text-sm" value={calcPrecision} onChange={(e) => setCalcPrecision(e.target.value)}>
              {precisionEntries.map((entry) => (<option key={entry.id} value={entry.id}>{entry.displayName}</option>))}
            </select>
          </label>
          <label className="text-xs font-semibold text-[var(--text-main)]">Runtime profile
            <select className="mt-2 w-full rounded-xl border border-[var(--border-soft)] bg-white px-3 py-2 text-sm" value={runtimeProfileId} onChange={(e) => setRuntimeProfileId(e.target.value)}>
              {runtimeOverheadProfiles.map((item) => (<option key={item.id} value={item.id}>{item.label}</option>))}
            </select>
          </label>
          <label className="text-xs font-semibold text-[var(--text-main)]">KV precision
            <select className="mt-2 w-full rounded-xl border border-[var(--border-soft)] bg-white px-3 py-2 text-sm" value={kvPrecisionId} onChange={(e) => setKvPrecisionId(e.target.value)}>
              {kvPrecisionProfiles.map((item) => (<option key={item.id} value={item.id}>{item.label}</option>))}
            </select>
          </label>
          <label className="text-xs font-semibold text-[var(--text-main)]">Context length
            <input type="number" min="256" step="256" value={calcContextLength} onChange={(e) => setCalcContextLength(Number(e.target.value))} className="mt-2 w-full rounded-xl border border-[var(--border-soft)] bg-white px-3 py-2 text-sm" />
          </label>
        </div>
        <div className="mt-3 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          <label className="text-xs font-semibold text-[var(--text-main)]">Batch size
            <input type="number" min="1" max="128" value={calcBatchSize} onChange={(e) => setCalcBatchSize(Number(e.target.value))} className="mt-2 w-full rounded-xl border border-[var(--border-soft)] bg-white px-3 py-2 text-sm" />
          </label>
          <label className="text-xs font-semibold text-[var(--text-main)]">Model size (B)
            <input type="number" min="1" max="500" value={modelSizeB} onChange={(e) => setModelSizeB(Number(e.target.value))} className="mt-2 w-full rounded-xl border border-[var(--border-soft)] bg-white px-3 py-2 text-sm" />
          </label>
          <label className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-[var(--text-main)]">
            <input type="checkbox" checked={includeOverhead} onChange={(e) => setIncludeOverhead(e.target.checked)} />
            Apply runtime overhead
          </label>
        </div>
        <p className="mt-3 text-xs text-[var(--text-faint)]">Formula base: {memoryFormula.defaultRuntimeOverheadMultiplier}x overhead, context factor {memoryFormula.contextOverheadGbPerTokenBatch}. Active profile: {runtimeProfile.description}</p>
        <p className="mt-1 text-xs text-[var(--text-faint)]">KV note: {kvProfile.note}</p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <article className="rounded-2xl border border-[var(--border-soft)] bg-[var(--panel-muted)] p-4"><p className="text-xs font-bold uppercase tracking-[0.1em] text-[var(--text-faint)]">Weights</p><p className="mt-2 text-2xl font-black text-[var(--text-strong)]">{formatMemory(memoryEstimates.selected.weightsGb)}</p></article>
          <article className="rounded-2xl border border-[var(--border-soft)] bg-[var(--panel-muted)] p-4"><p className="text-xs font-bold uppercase tracking-[0.1em] text-[var(--text-faint)]">Runtime</p><p className="mt-2 text-2xl font-black text-[var(--text-strong)]">{formatMemory(memoryEstimates.selected.runtimeAdjustedGb)}</p></article>
          <article className="rounded-2xl border border-[var(--border-soft)] bg-[var(--panel-muted)] p-4"><p className="text-xs font-bold uppercase tracking-[0.1em] text-[var(--text-faint)]">KV + Context</p><p className="mt-2 text-2xl font-black text-[var(--text-strong)]">{formatMemory(memoryEstimates.selected.contextGb)}</p></article>
          <article className="rounded-2xl border border-[var(--border-soft)] bg-white p-4"><p className="text-xs font-bold uppercase tracking-[0.1em] text-[var(--text-faint)]">Total</p><p className="mt-2 text-2xl font-black text-[var(--accent)]">{formatMemory(memoryEstimates.selected.totalGb)}</p></article>
        </div>
      </section>

      <section id="benchmark-results" className="editorial-panel rounded-[26px] border border-[var(--border-soft)] p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-2xl font-black tracking-tight text-[var(--text-strong)] sm:text-3xl">Benchmarks + Confidence + Export</h2>
          <div className="flex gap-2">
            <button onClick={exportBenchmarkJson} className="rounded-xl border border-[var(--border-soft)] px-3 py-2 text-xs font-bold uppercase tracking-[0.08em] text-[var(--text-strong)]">Export JSON</button>
            <button onClick={exportBenchmarkCsv} className="rounded-xl border border-[var(--border-soft)] px-3 py-2 text-xs font-bold uppercase tracking-[0.08em] text-[var(--text-strong)]">Export CSV</button>
          </div>
        </div>
        <div className="mt-4 max-w-xs">
          <label className="text-xs font-semibold text-[var(--text-main)]">Confidence filter
            <select className="mt-2 w-full rounded-xl border border-[var(--border-soft)] bg-white px-3 py-2 text-sm" value={confidenceFilter} onChange={(e) => setConfidenceFilter(e.target.value)}>
              {confidenceTags.map((tag) => (<option key={tag} value={tag}>{tag}</option>))}
            </select>
          </label>
        </div>
        <div className="mt-5 overflow-x-auto rounded-2xl border border-[var(--border-soft)] bg-white/90">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-[var(--panel-muted)] text-xs uppercase tracking-[0.12em] text-[var(--text-faint)]"><tr><th className="px-4 py-3 font-bold">Precision</th><th className="px-4 py-3 font-bold">Workload</th><th className="px-4 py-3 font-bold">Tokens/s</th><th className="px-4 py-3 font-bold">Latency</th><th className="px-4 py-3 font-bold">Confidence</th><th className="px-4 py-3 font-bold">Source</th></tr></thead>
            <tbody>
              {filteredBenchmarks.map((row) => (
                <tr key={row.benchmarkId} className="border-t border-[var(--border-soft)] odd:bg-white even:bg-[#f8fbff]">
                  <td className="px-4 py-3 font-semibold text-[var(--text-strong)]">{row.precision}</td>
                  <td className="px-4 py-3 text-[var(--text-main)]"><p>{row.workload}</p><p className="text-xs text-[var(--text-faint)]">{row.hardware}</p></td>
                  <td className="px-4 py-3 text-[var(--text-main)]">{Number.isFinite(row.throughputTokPerSec) ? row.throughputTokPerSec.toLocaleString() : 'N/A'}</td>
                  <td className="px-4 py-3 text-[var(--text-main)]">{row.latencyMsOrBand}</td>
                  <td className="px-4 py-3"><span className={`inline-flex rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-[0.08em] ${confidenceClass(row.confidenceTag)}`}>{row.confidenceTag}</span></td>
                  <td className="px-4 py-3 text-xs"><a href={row.sourceUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-[var(--accent)] hover:text-[var(--accent-strong)]">Link</a></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section id="benchmark-runner" className="editorial-panel rounded-[26px] border border-[var(--border-soft)] p-6 sm:p-8">
        <h2 className="text-2xl font-black tracking-tight text-[var(--text-strong)] sm:text-3xl">Reproducible Benchmark Runner</h2>
        <div className="mt-5 grid gap-3">
          {benchmarkRunnerRecipes.map((recipe) => (
            <article key={recipe.id} className="rounded-2xl border border-[var(--border-soft)] bg-[var(--panel-muted)] p-4">
              <p className="text-sm font-black text-[var(--text-strong)]">{recipe.title}</p>
              <p className="mt-1 text-xs uppercase tracking-[0.1em] text-[var(--text-faint)]">{recipe.stack}</p>
              <pre className="mt-3 overflow-x-auto rounded-xl bg-white p-3 text-xs text-[var(--text-main)]">{recipe.command}</pre>
              <p className="mt-2 text-xs text-[var(--text-faint)]">Output schema: {recipe.outputSchema.join(', ')}</p>
              <button onClick={() => navigator.clipboard.writeText(recipe.command)} className="mt-3 rounded-lg border border-[var(--border-soft)] px-3 py-1.5 text-xs font-bold uppercase tracking-[0.08em] text-[var(--text-strong)]">Copy command</button>
            </article>
          ))}
        </div>
      </section>

      <section id="tradeoff-chart" className="editorial-panel rounded-[26px] border border-[var(--border-soft)] p-6 sm:p-8">
        <h2 className="text-2xl font-black tracking-tight text-[var(--text-strong)] sm:text-3xl">Accuracy vs Memory Tradeoff</h2>
        <div ref={chartContainerRef} className="mt-5 h-[340px] w-full rounded-2xl border border-[var(--border-soft)] bg-white p-3">
          {chartReady && chartSize.width > 0 && chartSize.height > 0 ? (
            <ScatterChart width={chartSize.width} height={chartSize.height} margin={{ top: 12, right: 18, bottom: 24, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(120,120,120,0.2)" />
              <XAxis type="number" dataKey="memoryGb" name="Memory" unit=" GB" stroke="#64748b" />
              <YAxis type="number" dataKey="qualityScore" name="Quality" stroke="#64748b" domain={[45, 101]} />
              <ZAxis type="number" dataKey="speedScore" range={[50, 400]} />
              <Tooltip content={<TradeoffTooltip />} />
              <Scatter data={tradeoffData} fill="#2563eb" />
            </ScatterChart>
          ) : (
            <div className="flex h-full items-center justify-center rounded-xl bg-[var(--panel-muted)] text-xs font-semibold uppercase tracking-[0.1em] text-[var(--text-faint)]">Preparing chart...</div>
          )}
        </div>
      </section>

      <section id="compatibility-matrix" className="editorial-panel rounded-[26px] border border-[var(--border-soft)] p-6 sm:p-8">
        <h2 className="text-2xl font-black tracking-tight text-[var(--text-strong)] sm:text-3xl">Deployment Compatibility Matrix</h2>
        <div className="mt-5 overflow-x-auto rounded-2xl border border-[var(--border-soft)] bg-white/90">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-[var(--panel-muted)] text-xs uppercase tracking-[0.12em] text-[var(--text-faint)]"><tr><th className="px-4 py-3 font-bold">Stack</th><th className="px-4 py-3 font-bold">Support Summary</th></tr></thead>
            <tbody>
              {compatibilityMatrix.map((row) => (
                <tr key={row.stack} className="border-t border-[var(--border-soft)] odd:bg-white even:bg-[#f8fbff]">
                  <td className="px-4 py-3 font-semibold text-[var(--text-strong)]">{row.stack}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(row.support).map(([precision, status]) => (
                        <span key={`${row.stack}-${precision}`} className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-[0.08em] ${statusClass(status)}`}>
                          {precision}: {status}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section id="cost-estimator" className="editorial-panel rounded-[26px] border border-[var(--border-soft)] p-6 sm:p-8">
        <h2 className="text-2xl font-black tracking-tight text-[var(--text-strong)] sm:text-3xl">Cloud Cost Estimator (Cost per 1M tokens)</h2>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          <label className="text-xs font-semibold text-[var(--text-main)]">GPU class
            <select className="mt-2 w-full rounded-xl border border-[var(--border-soft)] bg-white px-3 py-2 text-sm" value={cloudGpuId} onChange={(e) => setCloudGpuId(e.target.value)}>
              {cloudGpuPricing.map((gpu) => (<option key={gpu.id} value={gpu.id}>{gpu.label} (${gpu.usdPerHour}/h)</option>))}
            </select>
          </label>
          <label className="text-xs font-semibold text-[var(--text-main)]">Utilization %
            <input type="number" min="10" max="100" value={cloudUtilization} onChange={(e) => setCloudUtilization(Number(e.target.value))} className="mt-2 w-full rounded-xl border border-[var(--border-soft)] bg-white px-3 py-2 text-sm" />
          </label>
          <label className="text-xs font-semibold text-[var(--text-main)]">Avg tokens/request
            <input type="number" min="100" value={avgTokensPerRequest} onChange={(e) => setAvgTokensPerRequest(Number(e.target.value))} className="mt-2 w-full rounded-xl border border-[var(--border-soft)] bg-white px-3 py-2 text-sm" />
          </label>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <article className="rounded-2xl border border-[var(--border-soft)] bg-[var(--panel-muted)] p-4"><p className="text-xs font-bold uppercase tracking-[0.1em] text-[var(--text-faint)]">Effective tokens/sec</p><p className="mt-2 text-2xl font-black text-[var(--text-strong)]">{cloudCost.effectiveTps}</p></article>
          <article className="rounded-2xl border border-[var(--border-soft)] bg-[var(--panel-muted)] p-4"><p className="text-xs font-bold uppercase tracking-[0.1em] text-[var(--text-faint)]">USD per 1M tokens</p><p className="mt-2 text-2xl font-black text-[var(--text-strong)]">${cloudCost.usdPerMillion}</p></article>
          <article className="rounded-2xl border border-[var(--border-soft)] bg-white p-4"><p className="text-xs font-bold uppercase tracking-[0.1em] text-[var(--text-faint)]">USD per request</p><p className="mt-2 text-2xl font-black text-[var(--accent)]">${cloudCost.requestCost}</p></article>
        </div>
      </section>

      <section id="scenario-mapping" className="editorial-panel rounded-[26px] border border-[var(--border-soft)] p-6 sm:p-8">
        <h2 className="text-2xl font-black tracking-tight text-[var(--text-strong)] sm:text-3xl">Real-World Scenario Mapping</h2>
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {scenarioCards.map((scenario) => (
            <article key={scenario.id} className="rounded-2xl border border-[var(--border-soft)] bg-[var(--panel-muted)] p-4">
              <p className="text-sm font-black text-[var(--text-strong)]">{scenario.title}</p>
              <p className="mt-1 text-xs uppercase tracking-[0.1em] text-[var(--text-faint)]">{scenario.machine}</p>
              <p className="mt-3 text-sm font-semibold text-[var(--accent)]">Recommended: {scenario.suggestion}</p>
              <p className="mt-2 text-sm text-[var(--text-main)]">{scenario.rationale}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="precision-recommender" className="editorial-panel rounded-[26px] border border-[var(--border-soft)] p-6 sm:p-8">
        <h2 className="text-2xl font-black tracking-tight text-[var(--text-strong)] sm:text-3xl">Precision Recommender + Copy-Ready Deployment Snippets</h2>
        <div className="mt-5 grid gap-3 md:grid-cols-2 lg:grid-cols-5">
          <label className="text-xs font-semibold text-[var(--text-main)]">Hardware
            <select className="mt-2 w-full rounded-xl border border-[var(--border-soft)] bg-white px-3 py-2 text-sm" value={wizardHardwareType} onChange={(e) => setWizardHardwareType(e.target.value)}>
              <option value="cpu">CPU</option><option value="gpu">GPU</option><option value="cloud">Cloud</option>
            </select>
          </label>
          <label className="text-xs font-semibold text-[var(--text-main)]">Goal
            <select className="mt-2 w-full rounded-xl border border-[var(--border-soft)] bg-white px-3 py-2 text-sm" value={wizardGoal} onChange={(e) => setWizardGoal(e.target.value)}>
              <option value="inference">Inference</option><option value="training">Training</option>
            </select>
          </label>
          <label className="text-xs font-semibold text-[var(--text-main)]">Priority
            <select className="mt-2 w-full rounded-xl border border-[var(--border-soft)] bg-white px-3 py-2 text-sm" value={wizardPriority} onChange={(e) => setWizardPriority(e.target.value)}>
              <option value="quality">Quality</option><option value="balanced">Balanced</option><option value="memory">Low memory</option>
            </select>
          </label>
          <label className="text-xs font-semibold text-[var(--text-main)]">RAM/VRAM (GB)
            <input type="number" min="2" value={wizardVram} onChange={(e) => setWizardVram(Number(e.target.value))} className="mt-2 w-full rounded-xl border border-[var(--border-soft)] bg-white px-3 py-2 text-sm" />
          </label>
          <label className="text-xs font-semibold text-[var(--text-main)]">Runtime
            <select className="mt-2 w-full rounded-xl border border-[var(--border-soft)] bg-white px-3 py-2 text-sm" value={deployRuntime} onChange={(e) => setDeployRuntime(e.target.value)}>
              {DEPLOYMENT_RUNTIMES.map((item) => (<option key={item} value={item}>{item}</option>))}
            </select>
          </label>
        </div>
        <label className="mt-3 block text-xs font-semibold text-[var(--text-main)]">Model ID
          <input type="text" value={deployModelId} onChange={(e) => setDeployModelId(e.target.value)} className="mt-2 w-full rounded-xl border border-[var(--border-soft)] bg-white px-3 py-2 text-sm" />
        </label>
        <div className="mt-5 rounded-2xl border border-[var(--border-soft)] bg-white p-5">
          <p className="text-xs font-bold uppercase tracking-[0.1em] text-[var(--text-faint)]">Recommended precision</p>
          <p className="mt-2 text-2xl font-black text-[var(--accent)]">{recommendation.recommended}</p>
          <p className="mt-3 text-sm text-[var(--text-main)]">{recommendation.why}</p>
          <p className="mt-3 text-sm font-semibold text-[var(--text-strong)]">Fit badge: {recommendation.fitBadge}</p>
          <p className="mt-2 text-sm text-amber-700">Quality warning: {recommendation.qualityWarning}</p>
          <pre className="mt-4 overflow-x-auto rounded-xl bg-[var(--panel-muted)] p-3 text-xs text-[var(--text-main)]">{deploySnippet}</pre>
          <button onClick={() => navigator.clipboard.writeText(deploySnippet)} className="mt-3 rounded-lg border border-[var(--border-soft)] px-3 py-1.5 text-xs font-bold uppercase tracking-[0.08em] text-[var(--text-strong)]">Copy deployment snippet</button>
        </div>
      </section>

      <section id="regression-pack" className="editorial-panel rounded-[26px] border border-[var(--border-soft)] p-6 sm:p-8">
        <h2 className="text-2xl font-black tracking-tight text-[var(--text-strong)] sm:text-3xl">Prompt Regression Pack</h2>
        <div className="mt-5 grid gap-3">
          {regressionPromptPack.map((item) => (
            <article key={item.id} className="rounded-2xl border border-[var(--border-soft)] bg-[var(--panel-muted)] p-4">
              <p className="text-sm font-black text-[var(--text-strong)]">{item.category}</p>
              <p className="mt-2 text-sm text-[var(--text-main)]">{item.prompt}</p>
              <p className="mt-2 text-xs font-semibold text-[var(--text-faint)]">Pass criteria: {item.passCriteria}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="response-diff" className="editorial-panel rounded-[26px] border border-[var(--border-soft)] p-6 sm:p-8">
        <h2 className="text-2xl font-black tracking-tight text-[var(--text-strong)] sm:text-3xl">Response Diff Viewer (Sample)</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <label className="text-xs font-semibold text-[var(--text-main)]">Base output
            <select className="mt-2 w-full rounded-xl border border-[var(--border-soft)] bg-white px-3 py-2 text-sm" value={baseDiffId} onChange={(e) => setBaseDiffId(e.target.value)}>
              {Object.entries(responseDiffSamples).map(([id, sample]) => (<option key={id} value={id}>{sample.title}</option>))}
            </select>
          </label>
          <label className="text-xs font-semibold text-[var(--text-main)]">Compare output
            <select className="mt-2 w-full rounded-xl border border-[var(--border-soft)] bg-white px-3 py-2 text-sm" value={compareDiffId} onChange={(e) => setCompareDiffId(e.target.value)}>
              {Object.entries(responseDiffSamples).map(([id, sample]) => (<option key={id} value={id}>{sample.title}</option>))}
            </select>
          </label>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <article className="rounded-2xl border border-[var(--border-soft)] bg-[var(--panel-muted)] p-4">
            <p className="text-xs font-bold uppercase tracking-[0.1em] text-[var(--text-faint)]">{baseDiff.title}</p>
            <p className="mt-2 text-sm text-[var(--text-main)]">{baseDiff.text}</p>
          </article>
          <article className="rounded-2xl border border-[var(--border-soft)] bg-white p-4">
            <p className="text-xs font-bold uppercase tracking-[0.1em] text-[var(--text-faint)]">{compareDiff.title}</p>
            <p className="mt-2 text-sm text-[var(--text-main)]">{highlightDiff(baseDiff.text, compareDiff.text)}</p>
          </article>
        </div>
      </section>

      <section id="sources-methodology" className="editorial-panel rounded-[26px] border border-[var(--border-soft)] p-6 sm:p-8">
        <h2 className="text-2xl font-black tracking-tight text-[var(--text-strong)] sm:text-3xl">Sources and Methodology</h2>
        <p className="mt-3 text-sm text-[var(--text-main)]">Last updated: {PRECISION_STRATEGY_LAST_UPDATED}</p>
        <p className="mt-2 text-sm leading-7 text-[var(--text-main)]">
          Confidence tags distinguish source-reported, example baseline, and locally reproducible recipe rows.
        </p>
        <ul className="mt-4 space-y-2 text-sm leading-7 text-[var(--text-main)]">
          {methodologySources.map((source) => (
            <li key={source.href}>
              <span className="mr-2 inline-flex rounded-full bg-[var(--panel-muted)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em] text-[var(--text-faint)]">{source.provenance}</span>
              <a href={source.href} target="_blank" rel="noopener noreferrer" className="font-semibold text-[var(--accent)] hover:text-[var(--accent-strong)]">{source.label}</a>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
