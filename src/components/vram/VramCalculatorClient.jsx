"use client";

import { useEffect, useRef, useState } from "react";
import { useVramCalculator } from "../../hooks/useVramCalculator";
import BreakdownChart from "./BreakdownChart";
import ConfigPanel from "./ConfigPanel";
import GpuCompatibilityGrid from "./GpuCompatibilityGrid";
import ModelInfoCard from "./ModelInfoCard";
import ModelSearchBar from "./ModelSearchBar";
import ShareButton from "../common/ShareButton";
import { buildVramSearch, parseVramParams } from "./shareState";
import { formatGb } from "./utils";

const DEFAULT_MODEL = "meta-llama/Meta-Llama-3-8B";

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

  const initializedRef = useRef(false);
  const [shareHref, setShareHref] = useState("");

  // Restore state from the URL on first load so a shared link reproduces the
  // estimate; fall back to the default model when no params are present.
  useEffect(() => {
    const { modelId, runtime } = parseVramParams(window.location.search);
    let cancelled = false;

    (async () => {
      await searchModel(modelId || DEFAULT_MODEL);
      if (cancelled) return;
      // URL runtime values win over the model-derived defaults searchModel set.
      for (const [field, value] of Object.entries(runtime)) {
        updateRuntimeConfig(field, value);
      }
      initializedRef.current = true;
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep the URL in sync with the current model + runtime so it is always
  // copyable. Runs only after the initial restore to avoid clobbering params.
  const currentModelId = resolvedModel?.modelId;
  useEffect(() => {
    if (!initializedRef.current) return;
    const search = buildVramSearch(currentModelId, runtimeConfig);
    window.history.replaceState(null, "", `${window.location.pathname}${search}`);
    setShareHref(window.location.href);
  }, [currentModelId, runtimeConfig]);

  const shareSummary =
    resolvedModel && breakdown && shareHref
      ? `${resolvedModel.modelId}: ~${formatGb(breakdown.total)} total VRAM (${runtimeConfig.precision}, ${runtimeConfig.sequenceLength} ctx${
          runtimeConfig.numGpus > 1 ? `, ${runtimeConfig.numGpus} GPUs` : ""
        }) — estimated with the InnoAI VRAM Calculator ${shareHref}`
      : "";

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
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">Results</p>
                    <h2 className="mt-2 text-2xl font-bold text-gray-900">VRAM estimate</h2>
                  </div>
                  {breakdown ? (
                    <div className="flex flex-wrap gap-2">
                      <ShareButton label="Share link" />
                      {shareSummary ? (
                        <ShareButton text={shareSummary} label="Copy summary" copiedLabel="Summary copied!" />
                      ) : null}
                    </div>
                  ) : null}
                </div>
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

