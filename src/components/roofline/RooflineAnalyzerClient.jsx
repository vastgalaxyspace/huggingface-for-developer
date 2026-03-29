"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, ChartNoAxesCombined } from "lucide-react";
import { rooflineGpuById, rooflineGpuGroups } from "../../data/rooflineGpuDatabase";
import { PRECISION_OPTIONS, computeRoofline, formatCompactNumber, getPrecisionPeak, useRooflineAnalysis } from "../../hooks/useRooflineModel";
import GpuSelector from "./GpuSelector";
import KernelInputPanel from "./KernelInputPanel";
import MetricsSidebar from "./MetricsSidebar";
import PrecisionToggle from "./PrecisionToggle";
import RooflinePlot from "./RooflinePlot";

function createDraftState() {
  return {
    mode: "direct",
    modePreset: "gemm",
    kernelName: "Kernel",
    collapsed: false,
    direct: {
      flopsValue: "1.5",
      flopsUnit: "gflop",
      bytesValue: "400",
      bytesUnit: "mb",
      timeValue: "2.5",
      timeUnit: "ms",
    },
    presetFields: {
      gemm: { m: 4096, n: 4096, k: 4096, bytesPerElem: 2 },
      convolution: { batch: 1, cin: 64, cout: 128, height: 112, width: 112, kh: 3, kw: 3, bytesPerElem: 2 },
      elementwise: { elements: 16777216, opsPerElement: 2, bytesPerElem: 2 },
      reduction: { elements: 16777216, reductionDim: 1024, bytesPerElem: 2 },
      attention: { seqLen: 2048, numHeads: 32, headDim: 128, batchSize: 1, bytesPerElem: 2 },
      custom: { ai: 4, gflops: 1500 },
    },
  };
}

function parseKernelQuery(value) {
  if (!value) return [];
  return value.split(";").slice(0, 5).map((chunk, index) => {
    const [name, flops, bytes, timeMs] = chunk.split(",");
    return {
      id: `shared-${index}-${name || "kernel"}`,
      name: decodeURIComponent(name || `Kernel ${index + 1}`),
      flops: Number(flops) || 0,
      bytes: Number(bytes) || 0,
      timeMs: Number(timeMs) || 0,
    };
  }).filter((kernel) => kernel.flops > 0 && kernel.bytes > 0 && kernel.timeMs > 0);
}

function buildKernelQuery(kernels) {
  return kernels.map((kernel) => [encodeURIComponent(kernel.name), kernel.flops, kernel.bytes, kernel.timeMs].join(",")).join(";");
}

export default function RooflineAnalyzerClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const svgRef = useRef(null);

  const initialGpuId = searchParams.get("gpu") || "a100_sxm_80";
  const initialPrecision = searchParams.get("precision")?.split(",").filter(Boolean) || ["fp32"];
  const initialMemoryMode = searchParams.get("memory") || "hbm";
  const initialKernels = parseKernelQuery(searchParams.get("kernels"));

  const [selectedGpuId, setSelectedGpuId] = useState(initialGpuId);
  const [activePrecisionIds, setActivePrecisionIds] = useState(initialPrecision.length ? initialPrecision : ["fp32"]);
  const [memoryMode, setMemoryMode] = useState(initialMemoryMode);
  const [kernels, setKernels] = useState(initialKernels);
  const [activeKernelId, setActiveKernelId] = useState(initialKernels[0]?.id || null);
  const [draftState, setDraftState] = useState(createDraftState);
  const [expandedHints, setExpandedHints] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);

  const gpu = rooflineGpuById[selectedGpuId] || rooflineGpuById.a100_sxm_80;
  const safePrecisionIds = activePrecisionIds.filter((precision) => getPrecisionPeak(gpu, precision) > 0);
  const primaryPrecision = safePrecisionIds[0] || "fp32";
  const precisionLabel = PRECISION_OPTIONS.find((option) => option.id === primaryPrecision)?.label || "FP32";
  const { roofline, rooflinesByPrecision, analyzedKernels } = useRooflineAnalysis({ gpu, activePrecisionIds: safePrecisionIds, kernels, primaryPrecision });
  const selectedKernel = analyzedKernels.find((kernel) => kernel.id === activeKernelId) || analyzedKernels[0] || null;

  const summary = useMemo(() => ({
    peakFp32Tflops: (gpu.peak_fp32_gflops || 0) / 1000,
    bandwidth: gpu.hbm_bandwidth_gbs || gpu.unified_bandwidth_gbs || 0,
    ridge: computeRoofline(gpu, "fp32").ridge_point_x,
  }), [gpu]);

  const addKernel = (payload) => {
    const nextKernel = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      ...payload,
    };
    setKernels((current) => [...current, nextKernel].slice(0, 5));
    setActiveKernelId(nextKernel.id);
  };

  const handleTogglePrecision = (precisionId) => {
    setActivePrecisionIds((current) => {
      const exists = current.includes(precisionId);
      const next = exists ? current.filter((item) => item !== precisionId) : [...current, precisionId];
      return next.length ? next : current;
    });
  };

  const handleQuickPreset = (preset) => {
    const rooflineForPreset = computeRoofline(gpu, primaryPrecision);
    const achieved = Math.min(rooflineForPreset.peak_flops * preset.performanceFactor, rooflineForPreset.bandwidth * preset.ai * 0.85);
    const timeMs = 1;
    const flops = achieved * 1e9 * (timeMs / 1000);
    const bytes = flops / preset.ai;
    addKernel({ name: preset.label, flops, bytes, timeMs });
    setDraftState((current) => ({
      ...current,
      kernelName: preset.label,
      direct: {
        flopsValue: formatCompactNumber(flops / 1e9, 3),
        flopsUnit: "gflop",
        bytesValue: formatCompactNumber(bytes / 1e6, 3),
        bytesUnit: "mb",
        timeValue: "1",
        timeUnit: "ms",
      },
    }));
  };

  const closeExport = () => setExportOpen(false);

  const handleDownloadSvg = () => {
    const svg = svgRef.current;
    if (!svg) return;
    const blob = new Blob([new XMLSerializer().serializeToString(svg)], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `roofline-${gpu.id}.svg`;
    link.click();
    URL.revokeObjectURL(url);
    closeExport();
  };

  const handleDownloadPng = () => {
    const svg = svgRef.current;
    if (!svg) return;
    const markup = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([markup], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 1600;
      canvas.height = 1000;
      const context = canvas.getContext("2d");
      if (!context) return;
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((pngBlob) => {
        if (!pngBlob) return;
        const pngUrl = URL.createObjectURL(pngBlob);
        const link = document.createElement("a");
        link.href = pngUrl;
        link.download = `roofline-${gpu.id}.png`;
        link.click();
        URL.revokeObjectURL(pngUrl);
      });
      URL.revokeObjectURL(url);
    };
    image.src = url;
    closeExport();
  };

  const copyText = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      return null;
    }
    return null;
  };

  const handleCopyMetrics = async () => {
    const text = `GPU: ${gpu.shortName} | Precision: ${precisionLabel}
AI: ${formatCompactNumber(selectedKernel?.arithmetic_intensity || 0, 2)} FLOP/B | Performance: ${formatCompactNumber(selectedKernel?.achieved_gflops || 0, 2)} GFLOP/s
Ridge: ${formatCompactNumber(roofline.ridge_point_x, 2)} FLOP/B | Bound: ${selectedKernel?.bound || "N/A"}
Memory Util: ${formatCompactNumber(selectedKernel?.memory_efficiency || 0, 1)}% | Compute Util: ${formatCompactNumber(selectedKernel?.compute_efficiency || 0, 1)}%`;
    await copyText(text);
    closeExport();
  };

  const handleShareLink = async () => {
    const params = new URLSearchParams();
    params.set("gpu", gpu.id);
    params.set("precision", safePrecisionIds.join(","));
    params.set("memory", memoryMode);
    if (kernels.length) params.set("kernels", buildKernelQuery(kernels));
    const query = params.toString();
    const url = `${window.location.origin}${pathname}?${query}`;
    await copyText(url);
    router.replace(`${pathname}?${query}`, { scroll: false });
    closeExport();
  };

  return (
    <div className="mt-6 space-y-6">
      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
        <Link href="/gpu" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-[#274867]">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to GPU
        </Link>
        <p className="mt-5 text-xs font-bold uppercase tracking-widest text-gray-400">Precision Tool</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight text-gray-900 md:text-5xl">Roofline Model Analyzer</h1>
        <p className="mt-4 max-w-[760px] text-sm leading-7 text-gray-600">
          Input kernel metrics and GPU specs, then map arithmetic intensity against multiple rooflines to see whether the workload is memory-bound or compute-bound.
        </p>
      </section>

      <GpuSelector
        gpuGroups={rooflineGpuGroups}
        selectedGpuId={selectedGpuId}
        onSelect={(gpuId) => {
          setSelectedGpuId(gpuId);
          setExpandedHints(false);
        }}
        summary={summary}
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.7fr)_minmax(320px,0.8fr)]">
        <div className="space-y-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Roofline Plot</p>
                <h2 className="mt-2 text-3xl font-black text-gray-900">Interactive Chart</h2>
              </div>
              <ChartNoAxesCombined className="h-5 w-5 text-gray-400" />
            </div>

            <PrecisionToggle
              gpu={gpu}
              activePrecisionIds={safePrecisionIds}
              onTogglePrecision={handleTogglePrecision}
              memoryMode={memoryMode}
              onChangeMemoryMode={setMemoryMode}
            />

            <div className="mt-6">
              <RooflinePlot
                key={`${gpu.id}-${memoryMode}-${safePrecisionIds.join("-")}`}
                svgRef={svgRef}
                gpu={gpu}
                primaryPrecision={primaryPrecision}
                activePrecisionIds={safePrecisionIds}
                memoryMode={memoryMode}
                rooflinesByPrecision={rooflinesByPrecision}
                kernels={analyzedKernels}
                exportOpen={exportOpen}
                onToggleExport={() => setExportOpen((current) => !current)}
                onDownloadSvg={handleDownloadSvg}
                onDownloadPng={handleDownloadPng}
                onCopyMetrics={handleCopyMetrics}
                onShareLink={handleShareLink}
              />
            </div>
          </div>

          <KernelInputPanel
            gpu={gpu}
            primaryRoofline={roofline}
            kernels={analyzedKernels}
            draftState={draftState}
            onChangeDraftState={setDraftState}
            onPlotKernel={addKernel}
            onQuickPreset={handleQuickPreset}
            onAddCurrentKernel={addKernel}
            onRenameKernel={(kernelId, name) => setKernels((current) => current.map((kernel) => (kernel.id === kernelId ? { ...kernel, name } : kernel)))}
            onRemoveKernel={(kernelId) => {
              setKernels((current) => current.filter((kernel) => kernel.id !== kernelId));
              if (activeKernelId === kernelId) setActiveKernelId(null);
            }}
          />
        </div>

        <MetricsSidebar
          key={`${selectedKernel?.id || "none"}-${gpu.id}-${primaryPrecision}`}
          kernel={selectedKernel}
          gpuName={gpu.shortName}
          precisionLabel={precisionLabel}
          ridgePoint={roofline.ridge_point_x}
          expandedHints={expandedHints}
          onToggleHints={() => setExpandedHints((current) => !current)}
        />
      </div>
    </div>
  );
}
