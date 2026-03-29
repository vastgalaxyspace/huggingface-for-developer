"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Cpu } from "lucide-react";
import ModelSearchBar from "./ModelSearchBar";
import ModelDetectedCard from "./ModelDetectedCard";
import UsageIntentSelector from "./UsageIntentSelector";
import BudgetSelector from "./BudgetSelector";
import GpuResultsList from "./GpuResultsList";
import QuantizedAlternatives from "./QuantizedAlternatives";
import { detectModelProfile } from "../../utils/gpuPickerModelDetection";
import { useGpuPicker } from "../../hooks/useGpuPicker";

const PRECISION_BYTES = {
  fp16: 2,
  int8: 1,
  int4: 0.5,
  q4_km: 0.45,
  q3_km: 0.375,
  q2_k: 0.25,
};

export default function GpuPickerPage() {
  const [modelId, setModelId] = useState("");
  const [fetchState, setFetchState] = useState("idle");
  const [error, setError] = useState("");
  const [rawModelData, setRawModelData] = useState(null);
  const [configError, setConfigError] = useState("");
  const [overrideOpen, setOverrideOpen] = useState(false);
  const [overrides, setOverrides] = useState({ precision: "", sequenceLength: 2048, batchSize: 1 });
  const [usageIntent, setUsageIntent] = useState("");
  const [budgetTier, setBudgetTier] = useState("any");
  const [vendorPreference, setVendorPreference] = useState("all");
  const [compareIds, setCompareIds] = useState([]);

  const modelProfile = useMemo(() => {
    if (!rawModelData) return null;
    return detectModelProfile({
      modelId: rawModelData.metadata.id || modelId,
      metadata: rawModelData.metadata,
      config: rawModelData.config,
      configAvailable: rawModelData.config_available,
      overrides: {
        bytesPerParam: overrides.precision ? PRECISION_BYTES[overrides.precision] : undefined,
        sequenceLength: overrides.sequenceLength,
        batchSize: overrides.batchSize,
      },
    });
  }, [modelId, overrides, rawModelData]);

  const normalizedIntent = modelProfile?.current_precision.toLowerCase().includes("gguf") && usageIntent !== "inference"
    ? "inference"
    : usageIntent;
  const phase = fetchState === "loading" ? "loading" : error ? "error" : modelProfile && !normalizedIntent ? "detected" : modelProfile && normalizedIntent ? "ready" : "idle";
  const pickerState = useGpuPicker({ modelProfile, usageIntent: normalizedIntent, budgetTier, vendorPreference });
  const visibleCompareIds = useMemo(
    () => compareIds.filter((id) => pickerState.results.some((result) => result.gpu.id === id)),
    [compareIds, pickerState.results],
  );

  const fetchModel = async (manualValue) => {
    const inputValue = typeof manualValue === "string" ? manualValue : modelId;
    const target = inputValue.trim();
    if (!target) return;

    setFetchState("loading");
    setError("");
    setConfigError("");
    setUsageIntent("");
    setCompareIds([]);

    try {
      const response = await fetch(`/api/hf-model?modelId=${encodeURIComponent(target)}`);
      const payload = await response.json();

      if (!response.ok) {
        setFetchState("error");
        setError(payload.error || "Failed to reach HuggingFace API.");
        return;
      }

      setRawModelData(payload);
      setConfigError(payload.config_error || "");
      setFetchState("detected");
      setModelId(target);
    } catch {
      setFetchState("error");
      setError("Failed to reach HuggingFace API.");
    }
  };

  const onOverrideChange = (key, value) => {
    setOverrides((current) => ({ ...current, [key]: value }));
  };

  const toggleCompare = (gpuId) => {
    setCompareIds((current) => {
      if (current.includes(gpuId)) return current.filter((id) => id !== gpuId);
      if (current.length >= 3) return current;
      return [...current, gpuId];
    });
  };

  return (
    <div className="min-h-[calc(100vh-78px)] bg-slate-100 py-8 md:py-12">
      <div className="shell-container space-y-6">
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
          <Link href="/gpu" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-[#274867]">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to GPU
          </Link>
          <p className="mt-5 text-xs font-semibold uppercase tracking-widest text-gray-400">Precision Tool</p>
          <div className="mt-3 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-4xl font-black tracking-tight text-gray-900 md:text-5xl">GPU Picker</h1>
              <p className="mt-4 max-w-[760px] text-sm leading-7 text-gray-600">
                Enter a HuggingFace model ID and let the app auto-detect parameters, precision, and VRAM needs before ranking the best GPUs.
              </p>
            </div>
          </div>
        </section>

        <ModelSearchBar value={modelId} onChange={setModelId} onSubmit={fetchModel} loading={fetchState === "loading"} error={error} />

        {modelProfile ? (
          <div className="transition-all duration-300 ease-in-out">
            <ModelDetectedCard
              profile={modelProfile}
              configError={configError}
              overrideOpen={overrideOpen}
              onToggleOverride={() => setOverrideOpen((current) => !current)}
              overrides={overrides}
              onOverrideChange={onOverrideChange}
            />
          </div>
        ) : null}

        {modelProfile ? (
          <div className="grid gap-6 transition-all duration-300 ease-in-out md:grid-cols-2">
            <UsageIntentSelector profile={modelProfile} usageIntent={normalizedIntent} onSelect={setUsageIntent} />
            <BudgetSelector
              budgetTier={budgetTier}
              vendorPreference={vendorPreference}
              onBudgetChange={setBudgetTier}
              onVendorChange={setVendorPreference}
            />
          </div>
        ) : null}

        <GpuResultsList pickerState={pickerState} phase={phase} compareIds={visibleCompareIds} onToggleCompare={toggleCompare} />

        {phase === "ready" ? (
          <QuantizedAlternatives alternatives={pickerState.quantizedAlternatives} profile={modelProfile} />
        ) : null}

        <section className="mt-2 grid gap-4 md:grid-cols-3">
          <Link href="/gpu/hardware" className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white px-5 py-4 text-xs font-bold uppercase tracking-[0.14em] text-[#23425f] hover:bg-[#f7faff]">
            Hardware <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="/gpu/execution" className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white px-5 py-4 text-xs font-bold uppercase tracking-[0.14em] text-[#23425f] hover:bg-[#f7faff]">
            Execution <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="/gpu/performance" className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white px-5 py-4 text-xs font-bold uppercase tracking-[0.14em] text-[#23425f] hover:bg-[#f7faff]">
            Performance <Cpu className="h-4 w-4" />
          </Link>
        </section>
      </div>
    </div>
  );
}
