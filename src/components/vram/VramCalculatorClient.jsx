"use client";

import { useEffect } from "react";
import { useVramCalculator } from "../../hooks/useVramCalculator";
import BreakdownChart from "./BreakdownChart";
import ConfigPanel from "./ConfigPanel";
import GpuCompatibilityGrid from "./GpuCompatibilityGrid";
import ModelInfoCard from "./ModelInfoCard";
import ModelSearchBar from "./ModelSearchBar";
import { formatGb } from "./utils";

function WarningBanner({ text }) {
  return (
    <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4">
      <p className="text-sm text-yellow-800">{text}</p>
    </div>
  );
}

export default function VramCalculatorClient() {
  const {
    inputValue,
    setInputValue,
    loading,
    error,
    resolvedModel,
    manualConfig,
    runtimeConfig,
    breakdown,
    warnings,
    searchModel,
    updateRuntimeConfig,
    updateManualConfig
  } = useVramCalculator();

  useEffect(() => {
    searchModel("meta-llama/Meta-Llama-3-8B");
  }, [searchModel]);

  return (
    <div className="mt-6 space-y-6">
      <ModelSearchBar value={inputValue} onChange={setInputValue} onSubmit={searchModel} loading={loading} error={error} />

      <ModelInfoCard model={resolvedModel} />

      {resolvedModel ? (
        <>
          <div className="grid gap-6 lg:grid-cols-5">
            <div className="lg:col-span-2">
              <ConfigPanel
                model={resolvedModel}
                manualConfig={manualConfig}
                runtimeConfig={runtimeConfig}
                onManualChange={updateManualConfig}
                onRuntimeChange={updateRuntimeConfig}
              />
            </div>

            <div className="lg:col-span-3">
              <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">Results</p>
                <h2 className="mt-2 text-2xl font-bold text-gray-900">VRAM estimate</h2>
                <p className="mt-2 text-sm text-gray-600">
                  Real-time estimate based on weights, KV cache, activations, optimizer state, gradients, and optional framework overhead.
                </p>

                <div className="mt-6">
                  <BreakdownChart breakdown={breakdown} numGpus={runtimeConfig.numGpus} />
                </div>

                {breakdown ? (
                  <div className="mt-6 grid gap-4 md:grid-cols-2">
                    <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
                      <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">Total VRAM</p>
                      <p className="mt-3 text-3xl font-bold text-gray-900">{formatGb(breakdown.total)}</p>
                    </div>
                    <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
                      <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">Per GPU</p>
                      <p className="mt-3 text-3xl font-bold text-gray-900">{formatGb(breakdown.per_gpu)}</p>
                    </div>
                  </div>
                ) : null}

                {warnings.length > 0 ? (
                  <div className="mt-6 space-y-3">
                    {warnings.map((warning) => (
                      <WarningBanner key={warning} text={warning} />
                    ))}
                  </div>
                ) : null}
              </section>
            </div>
          </div>

          <GpuCompatibilityGrid breakdown={breakdown} runtimeConfig={runtimeConfig} />
        </>
      ) : null}
    </div>
  );
}

