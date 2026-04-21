"use client";

import { useMemo, useState } from 'react';
import { gpuPickerGpus } from '../../data/gpuPickerData';

const modelPresets = [
  { id: 'claude-sonnet', label: 'Claude Sonnet', inputPer1M: 3, outputPer1M: 15 },
  { id: 'gpt-4o-mini', label: 'GPT-4o Mini', inputPer1M: 0.15, outputPer1M: 0.6 },
  { id: 'gemini-flash', label: 'Gemini Flash', inputPer1M: 0.35, outputPer1M: 1.05 },
  { id: 'custom', label: 'Custom Pricing', inputPer1M: 1, outputPer1M: 3 },
];

const workloadPresets = [
  {
    id: 'hobby',
    label: 'Hobby Solo',
    values: { teamSize: 1, requestsPerDevPerDay: 40, avgInputPerRequest: 1200, avgOutputPerRequest: 350 },
  },
  {
    id: 'freelancer',
    label: 'Freelancer Heavy',
    values: { teamSize: 1, requestsPerDevPerDay: 120, avgInputPerRequest: 1800, avgOutputPerRequest: 600 },
  },
  {
    id: 'startup',
    label: 'Startup Team',
    values: { teamSize: 5, requestsPerDevPerDay: 130, avgInputPerRequest: 1600, avgOutputPerRequest: 550 },
  },
  {
    id: 'scale',
    label: 'Scale Product',
    values: { teamSize: 20, requestsPerDevPerDay: 180, avgInputPerRequest: 2200, avgOutputPerRequest: 850 },
  },
];

const gpuProfiles = [
  { size: '7B', minVram: 8, recVram: 16, gpus: 'RTX 3080 / RTX 4080 / A10G', speed: 'Fast', cloudCostPerHour: 1.0 },
  { size: '13B', minVram: 16, recVram: 24, gpus: 'RTX 3090 / RTX 4090 / A10G', speed: 'Moderate', cloudCostPerHour: 1.5 },
  { size: '34B', minVram: 24, recVram: 40, gpus: 'A100 40GB / multi-GPU', speed: 'Slower', cloudCostPerHour: 3.2 },
  { size: '70B', minVram: 40, recVram: 80, gpus: 'A100 80GB / 2x A100 40GB', speed: 'Slow', cloudCostPerHour: 6.5 },
];

function applyQuantization(vram, quant) {
  if (quant === 'fp16') return vram;
  if (quant === 'int8') return Math.ceil(vram * 0.65);
  return Math.ceil(vram * 0.5);
}

function money(value) {
  return `$${value.toFixed(2)}`;
}

export default function BudgetPlannerWorkbench() {
  const [modelId, setModelId] = useState('claude-sonnet');
  const [inputPrice, setInputPrice] = useState(3);
  const [outputPrice, setOutputPrice] = useState(15);

  const [teamSize, setTeamSize] = useState(5);
  const [requestsPerDevPerDay, setRequestsPerDevPerDay] = useState(130);
  const [avgInputPerRequest, setAvgInputPerRequest] = useState(1600);
  const [avgOutputPerRequest, setAvgOutputPerRequest] = useState(550);

  const [modelSize, setModelSize] = useState('13B');
  const [quantization, setQuantization] = useState('fp16');
  const [cloudHoursPerDay, setCloudHoursPerDay] = useState(10);
  const [selfHostedHardwareCost, setSelfHostedHardwareCost] = useState(4000);
  const [selfHostedPowerAndOpsMonthly, setSelfHostedPowerAndOpsMonthly] = useState(280);
  const [gpuViewMode, setGpuViewMode] = useState('recommended');
  const [showAllGpus, setShowAllGpus] = useState(false);

  const selectedGpuProfile = useMemo(
    () => gpuProfiles.find((profile) => profile.size === modelSize) || gpuProfiles[1],
    [modelSize],
  );

  const dailyInputTokens = teamSize * requestsPerDevPerDay * avgInputPerRequest;
  const dailyOutputTokens = teamSize * requestsPerDevPerDay * avgOutputPerRequest;

  const monthly = useMemo(() => {
    const apiInput = (dailyInputTokens * 30 * inputPrice) / 1_000_000;
    const apiOutput = (dailyOutputTokens * 30 * outputPrice) / 1_000_000;
    const apiTotal = apiInput + apiOutput;

    const cloudGpu = selectedGpuProfile.cloudCostPerHour * cloudHoursPerDay * 30;
    const cloudWithOverhead = cloudGpu * 1.25;

    const selfHostedAmortized = selfHostedHardwareCost / 24;
    const selfHostedTotal = selfHostedAmortized + selfHostedPowerAndOpsMonthly;

    return {
      apiInput,
      apiOutput,
      apiTotal,
      cloudWithOverhead,
      selfHostedTotal,
    };
  }, [
    cloudHoursPerDay,
    dailyInputTokens,
    dailyOutputTokens,
    inputPrice,
    outputPrice,
    selectedGpuProfile.cloudCostPerHour,
    selfHostedHardwareCost,
    selfHostedPowerAndOpsMonthly,
  ]);

  const quantizedVram = useMemo(
    () => ({
      min: applyQuantization(selectedGpuProfile.minVram, quantization),
      rec: applyQuantization(selectedGpuProfile.recVram, quantization),
    }),
    [selectedGpuProfile, quantization],
  );

  const recommendation = useMemo(() => {
    const options = [
      { key: 'api', label: 'Managed API', cost: monthly.apiTotal },
      { key: 'cloud', label: 'Cloud GPU Hosting', cost: monthly.cloudWithOverhead },
      { key: 'self', label: 'Self-Hosted', cost: monthly.selfHostedTotal },
    ].sort((a, b) => a.cost - b.cost);

    const best = options[0];
    let reason = '';
    if (best.key === 'api') {
      reason = 'Best for speed of implementation and low ops overhead.';
    } else if (best.key === 'cloud') {
      reason = 'Best middle-ground for control with manageable complexity.';
    } else {
      reason = 'Best long-term cost profile if infra skills are available.';
    }

    const tier =
      best.cost < 50 ? 'Free/Hobby' : best.cost <= 500 ? 'Startup ($50-$500)' : 'Scale ($500+)';

    return { best, reason, tier, options };
  }, [monthly]);

  const decisionSummary = useMemo(() => {
    return {
      modelPricing: modelPresets.find((preset) => preset.id === modelId)?.label || 'Custom',
      monthlyTokens: {
        input: dailyInputTokens * 30,
        output: dailyOutputTokens * 30,
      },
      costs: {
        api: monthly.apiTotal,
        cloud: monthly.cloudWithOverhead,
        selfHosted: monthly.selfHostedTotal,
      },
      recommendedApproach: recommendation.best.label,
      recommendedTier: recommendation.tier,
      gpu: {
        modelSize,
        quantization,
        minVram: quantizedVram.min,
        recommendedVram: quantizedVram.rec,
        examples: selectedGpuProfile.gpus,
      },
      note: recommendation.reason,
    };
  }, [
    dailyInputTokens,
    dailyOutputTokens,
    modelId,
    modelSize,
    monthly.apiTotal,
    monthly.cloudWithOverhead,
    monthly.selfHostedTotal,
    quantization,
    quantizedVram.min,
    quantizedVram.rec,
    recommendation.best.label,
    recommendation.reason,
    recommendation.tier,
    selectedGpuProfile.gpus,
  ]);

  const matchingGpus = useMemo(() => {
    const threshold = gpuViewMode === 'minimum' ? quantizedVram.min : quantizedVram.rec;
    return gpuPickerGpus
      .filter((gpu) => Number(gpu.vram_gb || 0) >= threshold)
      .sort((a, b) => {
        const vramDiff = Number(a.vram_gb || 0) - Number(b.vram_gb || 0);
        if (vramDiff !== 0) return vramDiff;
        return Number(a.price_usd_approx || 0) - Number(b.price_usd_approx || 0);
      });
  }, [gpuViewMode, quantizedVram.min, quantizedVram.rec]);

  const applyWorkloadPreset = (presetId) => {
    const preset = workloadPresets.find((item) => item.id === presetId);
    if (!preset) return;
    setTeamSize(preset.values.teamSize);
    setRequestsPerDevPerDay(preset.values.requestsPerDevPerDay);
    setAvgInputPerRequest(preset.values.avgInputPerRequest);
    setAvgOutputPerRequest(preset.values.avgOutputPerRequest);
  };

  const exportDecisionJson = () => {
    const blob = new Blob([JSON.stringify(decisionSummary, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'budget-gpu-decision-summary.json';
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const copyDecision = async () => {
    const text = JSON.stringify(decisionSummary, null, 2);
    await navigator.clipboard.writeText(text);
  };

  return (
    <section id="interactive-planner" className="editorial-panel rounded-[24px] border border-[var(--border-soft)] p-6">
      <h2 className="text-2xl font-black tracking-tight text-[var(--text-strong)]">Practical Budget + GPU Workbench</h2>
      <p className="mt-2 text-sm text-[var(--text-muted)]">
        This is a working simulator. Enter your real usage numbers, compare hosting approaches, and export the decision
        summary for your team.
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {workloadPresets.map((preset) => (
          <button
            key={preset.id}
            type="button"
            onClick={() => applyWorkloadPreset(preset.id)}
            className="rounded-lg border border-[var(--border-soft)] bg-[var(--panel-muted)] px-3 py-1.5 text-xs font-semibold text-[var(--text-main)] hover:bg-white"
          >
            Use {preset.label}
          </button>
        ))}
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <article className="rounded-2xl border border-[var(--border-soft)] bg-[var(--panel-muted)] p-4">
          <h3 className="text-sm font-black uppercase tracking-[0.12em] text-[var(--text-faint)]">Step 1: Usage Inputs</h3>

          <label className="mt-3 block text-xs font-semibold text-[var(--text-main)]">
            Model Pricing Preset
            <select
              value={modelId}
              onChange={(e) => {
                const value = e.target.value;
                setModelId(value);
                const preset = modelPresets.find((item) => item.id === value);
                if (!preset) return;
                setInputPrice(preset.inputPer1M);
                setOutputPrice(preset.outputPer1M);
              }}
              className="mt-1 w-full rounded-lg border border-[var(--border-soft)] bg-white px-3 py-2 text-sm"
            >
              {modelPresets.map((preset) => (
                <option key={preset.id} value={preset.id}>
                  {preset.label}
                </option>
              ))}
            </select>
          </label>

          <div className="mt-3 grid grid-cols-2 gap-3">
            <label className="text-xs font-semibold text-[var(--text-main)]">
              Input $ / 1M
              <input
                type="number"
                min={0}
                step="0.01"
                value={inputPrice}
                onChange={(e) => setInputPrice(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-[var(--border-soft)] bg-white px-3 py-2 text-sm"
              />
            </label>
            <label className="text-xs font-semibold text-[var(--text-main)]">
              Output $ / 1M
              <input
                type="number"
                min={0}
                step="0.01"
                value={outputPrice}
                onChange={(e) => setOutputPrice(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-[var(--border-soft)] bg-white px-3 py-2 text-sm"
              />
            </label>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-3">
            <label className="text-xs font-semibold text-[var(--text-main)]">
              Team Size
              <input
                type="number"
                min={1}
                value={teamSize}
                onChange={(e) => setTeamSize(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-[var(--border-soft)] bg-white px-3 py-2 text-sm"
              />
            </label>
            <label className="text-xs font-semibold text-[var(--text-main)]">
              Requests / Dev / Day
              <input
                type="number"
                min={0}
                value={requestsPerDevPerDay}
                onChange={(e) => setRequestsPerDevPerDay(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-[var(--border-soft)] bg-white px-3 py-2 text-sm"
              />
            </label>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-3">
            <label className="text-xs font-semibold text-[var(--text-main)]">
              Avg Input Tokens / Request
              <input
                type="number"
                min={0}
                value={avgInputPerRequest}
                onChange={(e) => setAvgInputPerRequest(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-[var(--border-soft)] bg-white px-3 py-2 text-sm"
              />
            </label>
            <label className="text-xs font-semibold text-[var(--text-main)]">
              Avg Output Tokens / Request
              <input
                type="number"
                min={0}
                value={avgOutputPerRequest}
                onChange={(e) => setAvgOutputPerRequest(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-[var(--border-soft)] bg-white px-3 py-2 text-sm"
              />
            </label>
          </div>
        </article>

        <article className="rounded-2xl border border-[var(--border-soft)] bg-[var(--panel-muted)] p-4">
          <h3 className="text-sm font-black uppercase tracking-[0.12em] text-[var(--text-faint)]">Step 2: GPU Inputs</h3>

          <label className="mt-3 block text-xs font-semibold text-[var(--text-main)]">
            Model Size
            <select
              value={modelSize}
              onChange={(e) => setModelSize(e.target.value)}
              className="mt-1 w-full rounded-lg border border-[var(--border-soft)] bg-white px-3 py-2 text-sm"
            >
              {gpuProfiles.map((profile) => (
                <option key={profile.size} value={profile.size}>
                  {profile.size}
                </option>
              ))}
            </select>
          </label>

          <label className="mt-3 block text-xs font-semibold text-[var(--text-main)]">
            Quantization
            <select
              value={quantization}
              onChange={(e) => setQuantization(e.target.value)}
              className="mt-1 w-full rounded-lg border border-[var(--border-soft)] bg-white px-3 py-2 text-sm"
            >
              <option value="fp16">FP16</option>
              <option value="int8">8-bit</option>
              <option value="int4">4-bit</option>
            </select>
          </label>

          <div className="mt-3 grid grid-cols-2 gap-3">
            <label className="text-xs font-semibold text-[var(--text-main)]">
              Cloud GPU Hours / Day
              <input
                type="number"
                min={1}
                value={cloudHoursPerDay}
                onChange={(e) => setCloudHoursPerDay(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-[var(--border-soft)] bg-white px-3 py-2 text-sm"
              />
            </label>
            <label className="text-xs font-semibold text-[var(--text-main)]">
              Cloud $ / Hour (auto by model size)
              <input
                type="number"
                min={0}
                step="0.1"
                value={selectedGpuProfile.cloudCostPerHour}
                readOnly
                className="mt-1 w-full rounded-lg border border-[var(--border-soft)] bg-slate-100 px-3 py-2 text-sm"
              />
            </label>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-3">
            <label className="text-xs font-semibold text-[var(--text-main)]">
              Self-hosted Hardware Cost ($)
              <input
                type="number"
                min={0}
                value={selfHostedHardwareCost}
                onChange={(e) => setSelfHostedHardwareCost(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-[var(--border-soft)] bg-white px-3 py-2 text-sm"
              />
            </label>
            <label className="text-xs font-semibold text-[var(--text-main)]">
              Power + Ops / Month ($)
              <input
                type="number"
                min={0}
                value={selfHostedPowerAndOpsMonthly}
                onChange={(e) => setSelfHostedPowerAndOpsMonthly(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-[var(--border-soft)] bg-white px-3 py-2 text-sm"
              />
            </label>
          </div>
        </article>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        <article className="rounded-xl border border-[var(--border-soft)] bg-white p-4">
          <p className="text-xs font-bold uppercase tracking-[0.1em] text-[var(--text-faint)]">Managed API</p>
          <p className="mt-2 text-xl font-black text-[var(--text-strong)]">{money(monthly.apiTotal)}/mo</p>
          <p className="mt-1 text-xs text-[var(--text-muted)]">
            Input {money(monthly.apiInput)} + Output {money(monthly.apiOutput)}
          </p>
        </article>
        <article className="rounded-xl border border-[var(--border-soft)] bg-white p-4">
          <p className="text-xs font-bold uppercase tracking-[0.1em] text-[var(--text-faint)]">Cloud GPU</p>
          <p className="mt-2 text-xl font-black text-[var(--text-strong)]">{money(monthly.cloudWithOverhead)}/mo</p>
          <p className="mt-1 text-xs text-[var(--text-muted)]">Includes 25% overhead buffer for infra extras.</p>
        </article>
        <article className="rounded-xl border border-[var(--border-soft)] bg-white p-4">
          <p className="text-xs font-bold uppercase tracking-[0.1em] text-[var(--text-faint)]">Self-Hosted</p>
          <p className="mt-2 text-xl font-black text-[var(--text-strong)]">{money(monthly.selfHostedTotal)}/mo</p>
          <p className="mt-1 text-xs text-[var(--text-muted)]">Hardware amortized over 24 months + power/ops.</p>
        </article>
      </div>

      <div className="mt-5 rounded-xl border border-[var(--border-soft)] bg-[var(--panel-muted)] p-4">
        <p className="text-sm font-black text-[var(--text-strong)]">Step 3: Practical Recommendation</p>
        <p className="mt-1 text-sm text-[var(--text-main)]">
          Best estimated approach: <span className="font-bold">{recommendation.best.label}</span> ({money(recommendation.best.cost)}/mo)
        </p>
        <p className="text-sm text-[var(--text-main)]">
          Recommended budget tier by usage: <span className="font-bold">{recommendation.tier}</span>
        </p>
        <p className="text-sm text-[var(--text-main)]">{recommendation.reason}</p>
        <p className="mt-2 text-xs text-[var(--text-muted)]">
          GPU guidance for {modelSize} at {quantization}: minimum {quantizedVram.min}GB, recommended {quantizedVram.rec}GB ({selectedGpuProfile.gpus}).
        </p>

        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={copyDecision}
            className="rounded-lg border border-[var(--border-soft)] bg-white px-3 py-1.5 text-xs font-semibold text-[var(--text-main)] hover:bg-slate-50"
          >
            Copy Decision JSON
          </button>
          <button
            type="button"
            onClick={exportDecisionJson}
            className="rounded-lg border border-[var(--border-soft)] bg-white px-3 py-1.5 text-xs font-semibold text-[var(--text-main)] hover:bg-slate-50"
          >
            Export Decision JSON
          </button>
        </div>
      </div>

      <div className="mt-5 rounded-xl border border-[var(--border-soft)] bg-white p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-black text-[var(--text-strong)]">GPU Name Catalog (from your GPU dataset)</p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setGpuViewMode('minimum')}
              className={`rounded-md border px-2 py-1 text-xs font-semibold ${
                gpuViewMode === 'minimum'
                  ? 'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]'
                  : 'border-[var(--border-soft)] text-[var(--text-main)]'
              }`}
            >
              Meets Minimum VRAM
            </button>
            <button
              type="button"
              onClick={() => setGpuViewMode('recommended')}
              className={`rounded-md border px-2 py-1 text-xs font-semibold ${
                gpuViewMode === 'recommended'
                  ? 'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]'
                  : 'border-[var(--border-soft)] text-[var(--text-main)]'
              }`}
            >
              Meets Recommended VRAM
            </button>
            <button
              type="button"
              onClick={() => setShowAllGpus((prev) => !prev)}
              className="rounded-md border border-[var(--border-soft)] px-2 py-1 text-xs font-semibold text-[var(--text-main)]"
            >
              {showAllGpus ? 'Show Matching Only' : 'Show All GPUs'}
            </button>
          </div>
        </div>

        <p className="mt-2 text-xs text-[var(--text-muted)]">
          Showing {showAllGpus ? gpuPickerGpus.length : matchingGpus.length} GPU names for {modelSize} at {quantization}
          {' '}({gpuViewMode === 'minimum' ? `>= ${quantizedVram.min}GB` : `>= ${quantizedVram.rec}GB`}).
        </p>

        <div className="mt-3 overflow-x-auto rounded-lg border border-[var(--border-soft)]">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-[var(--panel-muted)] text-xs uppercase tracking-[0.1em] text-[var(--text-faint)]">
              <tr>
                <th className="px-3 py-2 font-bold">GPU Name</th>
                <th className="px-3 py-2 font-bold">VRAM</th>
                <th className="px-3 py-2 font-bold">Tier</th>
                <th className="px-3 py-2 font-bold">Approx Price</th>
                <th className="px-3 py-2 font-bold">Cloud</th>
              </tr>
            </thead>
            <tbody>
              {(showAllGpus ? gpuPickerGpus : matchingGpus).map((gpu) => (
                <tr key={gpu.id} className="border-t border-[var(--border-soft)]">
                  <td className="px-3 py-2 font-semibold text-[var(--text-strong)]">{gpu.name}</td>
                  <td className="px-3 py-2 text-[var(--text-main)]">{gpu.vram_gb} GB</td>
                  <td className="px-3 py-2 text-[var(--text-main)]">{gpu.tier}</td>
                  <td className="px-3 py-2 text-[var(--text-main)]">{gpu.price_label || `$${gpu.price_usd_approx}`}</td>
                  <td className="px-3 py-2 text-[var(--text-main)]">{gpu.cloud_available ? 'Yes' : 'No'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
