"use client";

import { ArrowRight, ChevronDown, Calculator, Search, Table2 } from "lucide-react";
import {
  budgetTierConfig,
  executionContextConfig,
  parameterScaleConfig,
  quickPresets,
} from "../../data/gpuPickerData";

function FilterButton({ active, children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg border px-3 py-3 text-xs font-semibold uppercase tracking-wider transition ${
        active
          ? "border-emerald-400 bg-emerald-50 text-emerald-800"
          : "border-gray-300 bg-white text-gray-500 hover:border-gray-400"
      }`}
    >
      {children}
    </button>
  );
}

function Section({ title, icon, children }) {
  const Icon = icon;

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-bold uppercase tracking-widest text-emerald-800">{title}</h2>
        <Icon className="h-4 w-4 text-emerald-800" />
      </div>
      {children}
    </section>
  );
}

export default function FilterPanel({
  filters,
  onFiltersChange,
  onApplyNow,
  onPreset,
}) {
  const isRendering = filters.executionContext === "rendering";
  const isDataScience = filters.executionContext === "data_science";
  const scaleOptions = isDataScience
    ? parameterScaleConfig.data_science
    : parameterScaleConfig[filters.executionContext] ?? parameterScaleConfig.llm_training;

  const updateAdvanced = (key, value) => {
    onFiltersChange({
      ...filters,
      advanced: {
        ...filters.advanced,
        [key]: value,
      },
    });
  };

  const setExecutionContext = (nextContext) => {
    const nextScale = nextContext === "rendering"
      ? ""
      : (parameterScaleConfig[nextContext] ?? parameterScaleConfig.llm_training)[0]?.id ?? "";

    onFiltersChange({
      ...filters,
      executionContext: nextContext,
      parameterScale: filters.executionContext === nextContext ? filters.parameterScale : nextScale,
    });
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="space-y-6">
        <div>
          <h2 className="text-xs font-bold uppercase tracking-widest text-emerald-800">Quick Presets</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {quickPresets.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => onPreset(preset)}
                className="rounded-full border border-gray-300 bg-white px-3 py-1.5 text-[11px] font-semibold text-gray-600 transition hover:border-emerald-400 hover:text-emerald-800"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        <Section title="EXECUTION CONTEXT" icon={Calculator}>
          <div className="grid grid-cols-2 gap-2">
            {Object.values(executionContextConfig).map((context) => (
              <FilterButton
                key={context.id}
                active={filters.executionContext === context.id}
                onClick={() => setExecutionContext(context.id)}
              >
                {context.label}
              </FilterButton>
            ))}
          </div>
        </Section>

        {!isRendering ? (
          <Section title={isDataScience ? "DATASET SCALE" : "PARAMETER SCALE"} icon={Table2}>
            <div className={`grid gap-2 ${isDataScience ? "grid-cols-1 sm:grid-cols-3" : "grid-cols-2"}`}>
              {scaleOptions.map((scale) => (
                <FilterButton
                  key={scale.id}
                  active={filters.parameterScale === scale.id}
                  onClick={() => onFiltersChange({ ...filters, parameterScale: scale.id })}
                >
                  {scale.label}
                </FilterButton>
              ))}
            </div>
          </Section>
        ) : null}

        <Section title="BUDGET TIER" icon={Search}>
          <div className="grid grid-cols-2 gap-2">
            {Object.values(budgetTierConfig).map((tier) => (
              <FilterButton
                key={tier.id}
                active={filters.budgetTier === tier.id}
                onClick={() => onFiltersChange({ ...filters, budgetTier: tier.id })}
              >
                {tier.label}
              </FilterButton>
            ))}
          </div>
        </Section>

        <div className="border-t border-gray-200 pt-6">
          <button
            type="button"
            className="flex w-full items-center justify-between text-sm font-semibold text-gray-700"
            onClick={() => updateAdvanced("expanded", !filters.advanced.expanded)}
          >
            <span>Advanced Filters</span>
            <ChevronDown className={`h-4 w-4 transition ${filters.advanced.expanded ? "rotate-180" : ""}`} />
          </button>

          {filters.advanced.expanded ? (
            <div className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-emerald-800">Vendor</label>
                <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {[
                    ["all", "ALL"],
                    ["nvidia", "NVIDIA only"],
                    ["amd", "AMD only"],
                    ["apple", "Apple only"],
                  ].map(([value, label]) => (
                    <FilterButton key={value} active={filters.advanced.vendor === value} onClick={() => updateAdvanced("vendor", value)}>
                      {label}
                    </FilterButton>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="min-vram" className="text-xs font-bold uppercase tracking-widest text-emerald-800">
                  Min VRAM: {filters.advanced.minVram} GB
                </label>
                <input
                  id="min-vram"
                  type="range"
                  min="0"
                  max="200"
                  value={filters.advanced.minVram}
                  onChange={(event) => updateAdvanced("minVram", Number(event.target.value))}
                  className="mt-2 w-full accent-emerald-600"
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="flex items-center gap-3 rounded-xl border border-gray-200 px-3 py-3 text-sm text-gray-600">
                  <input type="checkbox" checked={filters.advanced.cloudOnly} onChange={(event) => updateAdvanced("cloudOnly", event.target.checked)} />
                  Cloud only
                </label>
                <label className="flex items-center gap-3 rounded-xl border border-gray-200 px-3 py-3 text-sm text-gray-600">
                  <input type="checkbox" checked={filters.advanced.multiGpuOnly} onChange={(event) => updateAdvanced("multiGpuOnly", event.target.checked)} />
                  Multi-GPU only
                </label>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label htmlFor="precision" className="text-xs font-bold uppercase tracking-widest text-emerald-800">
                    Precision
                  </label>
                  <select
                    id="precision"
                    value={filters.advanced.precision}
                    onChange={(event) => updateAdvanced("precision", event.target.value)}
                    className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-3 py-3 text-sm text-gray-600 outline-none"
                  >
                    <option value="">Auto</option>
                    <option value="fp32">fp32</option>
                    <option value="fp16">fp16</option>
                    <option value="bf16">bf16</option>
                    <option value="int8">int8</option>
                    <option value="int4">int4</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="min-tflops" className="text-xs font-bold uppercase tracking-widest text-emerald-800">
                    Min TFLOPS
                  </label>
                  <input
                    id="min-tflops"
                    type="number"
                    min="0"
                    value={filters.advanced.minTflops}
                    onChange={(event) => updateAdvanced("minTflops", event.target.value)}
                    className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-3 py-3 text-sm text-gray-600 outline-none"
                    placeholder="0"
                  />
                </div>
              </div>
            </div>
          ) : null}
        </div>

        <button
          type="button"
          onClick={onApplyNow}
          className="sticky bottom-4 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-4 text-sm font-bold uppercase tracking-widest text-white transition hover:bg-gray-700"
        >
          FIND GPUS <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
