"use client";

import { useMemo, useState } from "react";
import { gpuArchById, gpuArchDatabase } from "../data/gpuArchDatabase";
import { useKernelOccupancy } from "../hooks/useKernelOccupancy";
import ArchInfoCard from "./kernel_ArchInfoCard";
import GpuArchSelector from "./kernel_GpuArchSelector";
import HeatmapChart from "./kernel_HeatmapChart";
import KernelConfigPanel from "./kernel_KernelConfigPanel";
import LatencyHidingCard from "./kernel_LatencyHidingCard";
import OccupancyResultCard from "./kernel_OccupancyResultCard";
import RecommendationsPanel from "./kernel_RecommendationsPanel";
import SweepChart from "./kernel_SweepChart";

const DEFAULT_CONFIG = {
  blockDimX: 256,
  blockDimY: 1,
  blockDimZ: 1,
  registersPerThread: 32,
  staticSmemBytes: 0,
  dynamicSmemBytes: 0,
  showLaunchConfig: false,
  totalBlocks: 0,
  totalSms: 0,
  blockSize: 128,
  numWarps: 4,
  numStages: 3,
  elementSizeBytes: 2,
  tritonRegistersPerThread: 32
};

function Banner({ warning }) {
  const styles = warning.type === "error" ? "border-red-200 bg-red-50 text-red-800" : "border-yellow-200 bg-yellow-50 text-yellow-800";
  return (
    <div className={`rounded-xl border p-4 ${styles}`}>
      <p className="text-sm font-medium">{warning.message}</p>
    </div>
  );
}

export default function KernelOccupancyEstimatorClient() {
  const [selection, setSelection] = useState({ vendor: "nvidia", kernelMode: "cuda", archId: "", gpuModel: "" });
  const [config, setConfig] = useState(DEFAULT_CONFIG);

  const arch = selection.archId ? gpuArchById[selection.archId] : null;
  const result = useKernelOccupancy({ arch, kernelMode: selection.kernelMode, config });
  const errorWarnings = useMemo(() => result?.warnings?.filter((warning) => warning.type === "error") || [], [result]);
  const infoWarnings = useMemo(() => result?.warnings?.filter((warning) => warning.type !== "error") || [], [result]);
  const showResults = Boolean(arch && result?.threads_per_block > 0);

  const handleConfigChange = (field, value) => setConfig((current) => ({ ...current, [field]: value }));

  const handleApplyFix = (action) => {
    if (!action) return;
    if (action.type === "setThreadsPerBlock") {
      setConfig((current) => ({ ...current, blockDimX: action.value, blockDimY: 1, blockDimZ: 1, numWarps: Math.max(1, Math.round(action.value / Math.max(1, arch?.warp_size || 32))) }));
      return;
    }
    if (action.type === "setRegistersPerThread") {
      setConfig((current) => ({ ...current, registersPerThread: action.value, tritonRegistersPerThread: action.value }));
      return;
    }
    if (action.type === "setTotalSmem") {
      setConfig((current) => ({ ...current, staticSmemBytes: action.value, dynamicSmemBytes: 0 }));
      return;
    }
    if (action.type === "setNumWarps") setConfig((current) => ({ ...current, numWarps: action.value }));
  };

  const handlePresetLoad = (preset) => {
    setSelection({ vendor: preset.vendor, kernelMode: preset.kernelMode, archId: preset.archId, gpuModel: preset.label });
    setConfig((current) => ({ ...DEFAULT_CONFIG, ...current, ...preset.config, showLaunchConfig: current.showLaunchConfig, totalBlocks: current.totalBlocks, totalSms: current.totalSms }));
  };

  return (
    <div className="mt-6 space-y-6">
      <GpuArchSelector
        key={`${selection.vendor}-${selection.kernelMode}-${selection.archId}-${selection.gpuModel}`}
        architectures={gpuArchDatabase}
        selection={selection}
        onConfirm={setSelection}
      />

      {arch ? <ArchInfoCard arch={arch} bottleneckNames={result?.bottleneck?.names || []} /> : null}

      {showResults ? (
        <div className="space-y-6 opacity-100 transition-opacity duration-300">
          {errorWarnings.length ? <div className="space-y-3">{errorWarnings.map((warning, index) => <Banner key={`${warning.message}-${index}`} warning={warning} />)}</div> : null}

          <div className="grid gap-6 lg:grid-cols-[minmax(0,0.45fr)_minmax(0,0.55fr)]">
            <KernelConfigPanel arch={arch} kernelMode={selection.kernelMode} config={config} onConfigChange={handleConfigChange} onPresetLoad={handlePresetLoad} />
            <div className="space-y-3">
              {infoWarnings.map((warning, index) => <Banner key={`${warning.message}-${index}`} warning={warning} />)}
              <OccupancyResultCard arch={arch} result={result} blocked={Boolean(errorWarnings.length)} />
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <SweepChart result={result} />
            <HeatmapChart result={result} />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <RecommendationsPanel recommendations={result?.recommendations || []} onApplyFix={handleApplyFix} />
            <LatencyHidingCard arch={arch} result={result} launchConfig={config} />
          </div>
        </div>
      ) : arch ? (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,0.45fr)_minmax(0,0.55fr)]">
          <KernelConfigPanel arch={arch} kernelMode={selection.kernelMode} config={config} onConfigChange={handleConfigChange} onPresetLoad={handlePresetLoad} />
          <div className="rounded-xl border border-dashed border-gray-300 bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">Set a valid thread block configuration to unlock occupancy analysis.</p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
