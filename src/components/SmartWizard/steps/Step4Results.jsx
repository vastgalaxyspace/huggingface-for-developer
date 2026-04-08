"use client";

import ModelResultCard from "../results/ModelResultCard";
import { Loader2 } from "lucide-react";

const SORT_OPTIONS = [
  { id: "best", label: "Best Match Score" },
  { id: "quality", label: "Highest Quality" },
  { id: "downloads", label: "Most Downloads" },
  { id: "smallest", label: "Smallest Size" },
  { id: "fastest", label: "Fastest Inference" },
];

function LoadingSequence() {
  const lines = [
    "Searching HuggingFace API...",
    "Analyzing architecture families...",
    "Estimating quantized VRAM budgets...",
    "Running multi-factor scoring engine...",
    "Ranking best model alternatives...",
  ];

  return (
    <div className="flex min-h-[460px] flex-col items-center justify-center p-8">
      <div className="relative flex h-24 w-24 items-center justify-center">
        <div className="absolute inset-0 rounded-full border-[6px] border-slate-100" />
        <div className="absolute inset-0 animate-[spin_1.5s_linear_infinite] rounded-full border-[6px] border-blue-600 border-t-transparent" />
        <Loader2 className="h-8 w-8 animate-pulse text-blue-600" />
      </div>
      
      <div className="mt-8 space-y-3 text-center">
        {lines.map((line, index) => (
          <div
            key={line}
            className="animate-pulse text-sm font-medium text-slate-500"
            style={{ animationDelay: `${index * 150}ms`, opacity: 0, animation: "wiz-count-up 0.5s forwards" }}
          >
            {line}
          </div>
        ))}
      </div>
      
      <div className="mt-12 grid w-full max-w-3xl gap-4">
        {[1, 2, 3].map((item) => (
          <div key={item} className="wiz-skeleton h-[280px] w-full" />
        ))}
      </div>
    </div>
  );
}

export default function Step4Results({
  state,
  sortedModels,
  sortKey,
  setSortKey,
  topPriorityLabel,
  onEditStep,
  onRetry,
}) {
  const taskLabel = state.task.task_label || "selected task";
  const hardwareLabel = state.compute.gpu_model || state.compute.hardware_type || "hardware";

  if (state.results.loading) {
    return <LoadingSequence />;
  }

  if (state.results.error) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center text-center p-8">
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 mb-6">
          <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-2xl font-black text-slate-900">Unable to fetch models</h2>
        <p className="mt-3 max-w-lg text-[15px] leading-relaxed text-slate-500">{state.results.error}</p>
        <button
          type="button"
          onClick={onRetry}
          className="wiz-cta mt-8"
        >
          Try again
        </button>
      </div>
    );
  }

  if (!sortedModels.length) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center text-center p-8">
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-amber-100 text-amber-600 mb-6">
          <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <h2 className="text-2xl font-black text-slate-900">No models found</h2>
        <p className="mt-3 max-w-lg text-[15px] leading-relaxed text-slate-500">
          We couldn't find any models that perfectly match your strict hardware and metric requirements.
        </p>
        <button
          type="button"
          onClick={() => onEditStep(3)}
          className="wiz-cta mt-8"
        >
          Adjust Constraints
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 fade-in-section">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700">
              {sortedModels.length}
            </span>
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-600">
              Models Recommemded
            </span>
          </div>
          <h2 className="text-3xl font-black tracking-tight text-slate-900">
            Best matches for {taskLabel}
          </h2>
          <p className="mt-2 text-[15px] text-slate-500">
            Filtered from {state.results.total_searched} initial candidates and scored against your priorities.
          </p>
        </div>

        <div className="w-full max-w-[240px] shrink-0">
          <label
            htmlFor="smart-wizard-sort"
            className="mb-2 block text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400"
          >
            Sort Results By
          </label>
          <div className="relative">
            <select
              id="smart-wizard-sort"
              value={sortKey}
              onChange={(event) => setSortKey(event.target.value)}
              className="w-full appearance-none rounded-2xl border border-slate-200 bg-white px-5 py-3.5 pr-12 text-[15px] font-bold text-blue-700 shadow-sm outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-blue-500">
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="none" stroke="currentColor">
                <path d="M5 7.5L10 12.5L15 7.5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Chips Summary */}
      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200 bg-white/50 p-3">
        <span className="pl-2 text-xs font-bold uppercase tracking-widest text-slate-400">Context:</span>
        {[
          hardwareLabel,
          `${state.compute.vram_gb}GB VRAM`,
          `${topPriorityLabel} Focus`,
          state.metrics.quantization_ok ? "Quantization OK" : "FP16 Only",
        ].map((chip) => (
          <span
            key={chip}
            className="rounded-lg bg-slate-100 px-3 py-1.5 text-[11px] font-bold text-slate-600"
          >
            {chip}
          </span>
        ))}
        <button
          type="button"
          onClick={() => onEditStep(1)}
          className="ml-auto px-3 text-[11px] font-bold uppercase tracking-widest text-blue-600 hover:text-blue-700"
        >
          Edit Constraints
        </button>
      </div>

      <div className="space-y-6">
        {sortedModels.map((model, index) => (
          <div
            key={model.modelId}
            className="wiz-card-enter"
            style={{ animationDelay: `${index * 80}ms` }}
          >
            <ModelResultCard
              model={model}
              index={index}
              taskLabel={taskLabel}
              hardwareLabel={hardwareLabel}
              sortKey={sortKey}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
