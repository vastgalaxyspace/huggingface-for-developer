"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Cpu } from "lucide-react";
import ModelSearchBar from "./ModelSearchBar";
import ModelDetectedCard from "./ModelDetectedCard";
import UsageIntentSelector from "./UsageIntentSelector";
import BudgetSelector from "./BudgetSelector";
import GpuResultsList from "./GpuResultsList";
import QuantizedAlternatives from "./QuantizedAlternatives";
import ShareButton from "../common/ShareButton";
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
  // Defaults must match on server and client to avoid a hydration mismatch; the
  // URL is applied after mount in the effect below.
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
  const initializedRef = useRef(false);

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

  // Restore state from the URL on first load so a shared link lands on the same
  // shortlist. Runs after mount (not in useState initializers) so server and
  // client render the same defaults and hydration stays clean.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const m = params.get("model");
    const use = params.get("use") || "";
    const budget = params.get("budget");
    const vendor = params.get("vendor");
    if (budget) setBudgetTier(budget);
    if (vendor) setVendorPreference(vendor);
    let cancelled = false;

    (async () => {
      if (m) {
        await fetchModel(m);
        if (!cancelled && use) setUsageIntent(use);
      }
      if (!cancelled) initializedRef.current = true;
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep the URL in sync with the fetched model + filters so it stays copyable.
  useEffect(() => {
    if (!initializedRef.current) return;
    const params = new URLSearchParams();
    const fetchedId = rawModelData?.metadata?.id;
    if (fetchedId) params.set("model", fetchedId);
    if (usageIntent) params.set("use", usageIntent);
    if (budgetTier !== "any") params.set("budget", budgetTier);
    if (vendorPreference !== "all") params.set("vendor", vendorPreference);
    const qs = params.toString();
    window.history.replaceState(null, "", `${window.location.pathname}${qs ? `?${qs}` : ""}`);
  }, [rawModelData, usageIntent, budgetTier, vendorPreference]);

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
                Enter a HuggingFace model ID and let the app auto-detect parameters, precision, and VRAM needs before
                ranking practical GPU options for inference or deployment.
              </p>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap gap-3 text-xs font-semibold text-gray-500">
            <span>Model-aware GPU shortlist</span>
            <span>Budget and intent filters</span>
            <span>Useful after model choice, before infra commitment</span>
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

        {phase === "ready" ? (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-white px-5 py-4 shadow-sm">
            <p className="text-sm font-semibold text-gray-600">
              Share this shortlist — the link keeps the model, intent, and budget filters.
            </p>
            <ShareButton label="Share link" />
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

        <section className="grid gap-5 md:grid-cols-3">
          <article className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-black tracking-tight text-gray-900">Use with real traffic assumptions</h2>
            <p className="mt-3 text-sm leading-7 text-gray-600">
              The right GPU for one-user local testing may be the wrong GPU for concurrent production traffic. Always
              connect the result to expected request volume and context length.
            </p>
          </article>
          <article className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-black tracking-tight text-gray-900">Pair with comparison</h2>
            <p className="mt-3 text-sm leading-7 text-gray-600">
              If multiple models fit your hardware budget, move back to{' '}
              <Link href="/compare" className="font-semibold text-[#23425f] hover:text-[#18324f]">
                compare
              </Link>{' '}
              and choose based on license, context, and ecosystem rather than GPU fit alone.
            </p>
          </article>
          <article className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-black tracking-tight text-gray-900">Related reading</h2>
            <p className="mt-3 text-sm leading-7 text-gray-600">
              Read{' '}
              <Link href="/guides/choose-ai-model-by-gpu-budget" className="font-semibold text-[#23425f] hover:text-[#18324f]">
                Choose an AI Model by GPU and Budget
              </Link>{' '}
              for the broader framework behind these recommendations.
            </p>
          </article>
        </section>
      </div>
    </div>
  );
}
