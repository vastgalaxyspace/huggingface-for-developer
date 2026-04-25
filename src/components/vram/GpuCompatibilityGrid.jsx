"use client";

import { useMemo, useState } from "react";
import { gpuDatabase, gpuTabs } from "../../data/gpuDatabase";
import { getStatusClasses } from "./utils";

function getGpuStatus(requirement, gpuVram) {
  if (requirement <= gpuVram * 0.9) return "Fits";
  if (requirement <= gpuVram) return "Tight";
  return "Insufficient";
}

export default function GpuCompatibilityGrid({ breakdown, runtimeConfig }) {
  const [activeTab, setActiveTab] = useState(gpuTabs[0].key);
  const [showAll, setShowAll] = useState(false);

  const cards = useMemo(() => {
    if (!breakdown) {
      return [];
    }

    const requirement =
      runtimeConfig.numGpus > 1 &&
      runtimeConfig.parallelismStrategy !== "Single GPU" &&
      runtimeConfig.parallelismStrategy !== "Data Parallel"
        ? breakdown.per_gpu
        : breakdown.total;

    return gpuDatabase
      .filter((gpu) => gpu.tier === activeTab)
      .map((gpu) => ({
        ...gpu,
        status: getGpuStatus(requirement, gpu.vram),
        utilization: Math.min((requirement / gpu.vram) * 100, 100),
        requiredGpuCount: Math.ceil(breakdown.total / gpu.vram)
      }));
  }, [activeTab, breakdown, runtimeConfig.numGpus, runtimeConfig.parallelismStrategy]);

  const fittingCards = cards.filter((gpu) => gpu.status !== "Insufficient");
  const visibleCards = showAll || fittingCards.length === 0 ? cards : fittingCards;
  const showingInsufficientFallback = !showAll && fittingCards.length === 0 && cards.length > 0;

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">Hardware Match</p>
          <h2 className="mt-2 text-2xl font-bold text-gray-900">GPU compatibility</h2>
          <p className="mt-2 text-sm text-gray-600">
            Cards are evaluated against {runtimeConfig.numGpus > 1 ? "per-GPU VRAM" : "total VRAM"} for the active setup.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowAll((current) => !current)}
          className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
        >
          {showAll ? "Show Only Fitting GPUs" : "Show All GPUs"}
        </button>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {gpuTabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              activeTab === tab.key ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {showingInsufficientFallback ? (
        <div className="mt-5 rounded-xl border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800">
          No GPUs in this category fit the current estimate, so all GPUs are shown with the number of cards needed.
          Try a larger GPU category, lower precision, shorter context, or tensor parallelism.
        </div>
      ) : null}

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {visibleCards.length > 0 ? (
          visibleCards.map((gpu) => {
            const styles = getStatusClasses(gpu.status);

            return (
              <article key={`${gpu.name}-${gpu.vram}`} className="rounded-xl border border-gray-200 bg-gray-50 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      {gpu.name} <span className="text-gray-500">{gpu.vram} GB</span>
                    </h3>
                    <p className="mt-1 text-sm text-gray-600">{gpu.label}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${styles.badge}`}>{gpu.status}</span>
                </div>

                <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-gray-200">
                  <div className={`h-full ${styles.bar}`} style={{ width: `${gpu.utilization}%` }} />
                </div>

                <div className="mt-3 flex items-center justify-between text-sm">
                  <span className="text-gray-600">Utilization</span>
                  <span className="font-semibold text-gray-900">{gpu.utilization.toFixed(0)}%</span>
                </div>

                {gpu.status === "Insufficient" ? (
                  <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                    Need {gpu.requiredGpuCount}x for {runtimeConfig.parallelismStrategy === "Single GPU" ? "Tensor Parallel" : runtimeConfig.parallelismStrategy}
                  </p>
                ) : null}
              </article>
            );
          })
        ) : (
          <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-6 text-sm text-gray-500">
            {breakdown ? `No ${activeTab.replaceAll("_", " ")} GPUs currently fit this setup.` : "Run a calculation to compare GPUs."}
          </div>
        )}
      </div>
    </section>
  );
}
