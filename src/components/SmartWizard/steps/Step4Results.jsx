"use client";

import ModelResultCard from "../results/ModelResultCard";

const SORT_OPTIONS = [
  { id: "best", label: "Best Match" },
  { id: "downloads", label: "Downloads" },
  { id: "smallest", label: "Smallest" },
  { id: "fastest", label: "Fastest" },
];

function LoadingSequence() {
  const lines = [
    "Searching HuggingFace...",
    "Fetching model configs...",
    "Scoring candidate models...",
    "Ranking results...",
  ];

  return (
    <div className="flex min-h-[360px] flex-col items-center justify-center">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-gray-900" />
      <div className="mt-8 space-y-3 text-center">
        {lines.map((line, index) => (
          <div
            key={line}
            className="animate-pulse text-sm font-medium text-gray-500"
            style={{ animationDelay: `${index * 120}ms` }}
          >
            {line}
          </div>
        ))}
      </div>
      <div className="mt-8 grid w-full max-w-3xl gap-4">
        {[1, 2, 3].map((item) => (
          <div key={item} className="h-36 animate-pulse rounded-2xl border border-gray-200 bg-gray-50" />
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
      <div className="flex min-h-[320px] flex-col items-center justify-center text-center">
        <h2 className="text-2xl font-black text-gray-900">Unable to fetch models from HuggingFace.</h2>
        <p className="mt-3 max-w-lg text-sm text-gray-500">{state.results.error}</p>
        <button
          type="button"
          onClick={onRetry}
          className="mt-6 rounded-xl bg-gray-900 px-6 py-3 font-semibold text-white hover:bg-gray-800"
        >
          Try again
        </button>
      </div>
    );
  }

  if (!sortedModels.length) {
    return (
      <div className="flex min-h-[320px] flex-col items-center justify-center text-center">
        <h2 className="text-2xl font-black text-gray-900">No models found.</h2>
        <p className="mt-3 max-w-lg text-sm text-gray-500">
          Try broadening your criteria or revisiting task, compute, or metric settings.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-3xl font-black text-gray-900">
            {sortedModels.length} models found for {taskLabel}
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            Filtered from {state.results.total_searched} candidates | Scored against your priorities
          </p>
        </div>

        <div className="w-full max-w-[220px] self-start lg:self-auto">
          <label
            htmlFor="smart-wizard-sort"
            className="mb-2 block text-[11px] font-bold uppercase tracking-[0.18em] text-gray-400"
          >
            Sort Results
          </label>
          <div className="relative">
            <select
              id="smart-wizard-sort"
              value={sortKey}
              onChange={(event) => setSortKey(event.target.value)}
              className="w-full appearance-none rounded-2xl border border-[var(--border-strong)] bg-white px-4 py-3.5 pr-11 text-sm font-semibold text-[var(--text-strong)] shadow-[0_8px_20px_rgba(59,83,114,0.08)] outline-none transition-all focus:border-[var(--accent)] focus:ring-4 focus:ring-[rgba(54,87,132,0.14)]"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
            <svg
              className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]"
              viewBox="0 0 20 20"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M5 7.5L10 12.5L15 7.5"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {[taskLabel, hardwareLabel, `${state.compute.vram_gb}GB VRAM`, `${topPriorityLabel} Priority`].map((chip) => (
          <span
            key={chip}
            className="rounded-full bg-gray-100 px-3 py-2 text-xs font-bold uppercase tracking-wide text-gray-600"
          >
            {chip}
          </span>
        ))}
        <button
          type="button"
          onClick={() => onEditStep(3)}
          className="ml-auto text-sm font-semibold text-gray-600 hover:text-gray-900"
        >
          Edit
        </button>
      </div>

      <div className="space-y-4">
        {sortedModels.map((model, index) => (
          <ModelResultCard
            key={model.modelId}
            model={model}
            index={index}
            taskLabel={taskLabel}
            hardwareLabel={hardwareLabel}
          />
        ))}
      </div>
    </div>
  );
}
