"use client";
import { use, useMemo, useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Sparkles } from "lucide-react";

const TOPICS = {
  "physical-hardware": {
    id: "01",
    title: "Physical Hardware",
    subtitle: "GPU chip structure, SM internals, and compute building blocks.",
    learning: [
      "GPU hierarchy: GPC -> TPC -> SM",
      "SM internals across generations",
      "CUDA cores, Tensor cores, and SFU roles",
      "Warp scheduler behavior and switching",
      "TMA overview for Hopper+",
    ],
    visuals: [
      "Clickable SM diagram",
      "Hierarchy tree: GPU -> GPC -> TPC -> SM",
      "CUDA core vs Tensor core race simulation",
      "Generation comparison slider",
    ],
    tools: [
      "FLOP counter for matrix operations",
      "Compute capability lookup",
      "Peak TFLOP calculator",
      "Architecture timeline explorer",
    ],
  },
  "memory-hierarchy": {
    id: "02",
    title: "Memory Hierarchy",
    subtitle: "Data movement from registers to VRAM and bottlenecks.",
    learning: [
      "Register file and spilling behavior",
      "Shared memory and L1 cache interplay",
      "L2 cache role and sizing impact",
      "HBM vs GDDR trade-offs",
      "Coalescing and bank conflict fundamentals",
    ],
    visuals: [
      "Latency animation: registers -> shared -> L2 -> VRAM",
      "Memory pyramid with speed/size levels",
      "Coalescing visualizer with 32 threads",
      "Bank conflict detector",
    ],
    tools: [
      "VRAM calculator",
      "Register pressure checker",
      "Effective bandwidth calculator",
      "Shared memory usage estimator",
    ],
  },
  "execution-model": {
    id: "03",
    title: "Execution Model",
    subtitle: "Threads, warps, occupancy, and scheduler behavior.",
    learning: [
      "Thread, warp, block, and grid model",
      "SIMT mechanics",
      "Warp divergence and predication",
      "Occupancy and limiting resources",
      "Warp states and scoreboard stalls",
    ],
    visuals: [
      "Warp execution stepper",
      "Divergence simulator",
      "Latency hiding timeline",
      "Thread -> warp -> block -> grid builder",
    ],
    tools: [
      "Occupancy calculator",
      "Warp count estimator",
      "Divergence cost estimator",
      "Concurrent threads counter",
    ],
  },
  "compilation-pipeline": {
    id: "04",
    title: "Compilation Pipeline",
    subtitle: "From CUDA source to PTX/SASS and architecture execution.",
    learning: [
      "CUDA C++ -> PTX -> SASS -> binary pipeline",
      "PTX portability and virtual ISA",
      "SASS architecture-specific instruction layer",
      "nvcc flow and compute capability mapping",
      "NVRTC runtime compilation",
    ],
    visuals: [
      "Pipeline walkthrough side-by-side",
      "PTX vs SASS diff explorer",
      "SM feature matrix by capability",
    ],
    tools: [
      "Compute capability lookup",
      "CUDA toolkit compatibility checker",
      "Architecture version reference table",
    ],
  },
  "cuda-programming": {
    id: "05",
    title: "CUDA Programming",
    subtitle: "Kernel design, memory access, and runtime optimization.",
    learning: [
      "CUDA language keywords and memory qualifiers",
      "Kernel launch dimensions and mapping",
      "cudaMalloc/cudaMemcpy/cudaFree fundamentals",
      "Shared memory tiling and synchronization",
      "Streams and CUDA graphs",
    ],
    visuals: [
      "Kernel launch configurator",
      "Memory access pattern visualizer",
      "Shared memory tiling animation",
      "Stream overlap timeline",
    ],
    tools: [
      "Kernel config optimizer",
      "Tiling calculator",
      "cudaMemcpy time estimator",
    ],
  },
  "driver-stack": {
    id: "06",
    title: "Driver Stack",
    subtitle: "Runtime, driver, and system-level GPU software flow.",
    learning: [
      "NVIDIA driver module responsibilities",
      "Driver API vs Runtime API",
      "NVML and nvidia-smi metric semantics",
      "CUPTI role for profiling",
      "Full app-to-hardware software stack",
    ],
    visuals: [
      "Layer diagram from framework to silicon",
      "Kernel launch flow animation",
      "Annotated nvidia-smi output guide",
    ],
    tools: [
      "nvidia-smi metric explainer",
      "Driver vs Runtime API mapping table",
      "GPU util vs SM util explainer",
    ],
  },
  "libraries-frameworks": {
    id: "07",
    title: "Libraries & Frameworks",
    subtitle: "cuBLAS/cuDNN/Triton/PyTorch and profiling workflow.",
    learning: [
      "cuBLAS GEMM and Tensor core usage",
      "cuDNN operator acceleration",
      "Triton custom kernel workflow",
      "PyTorch runtime integration",
      "Nsight and binary inspection tooling",
    ],
    visuals: [
      "Library call chain visualization",
      "Nsight timeline reader",
      "cuBLAS vs naive GEMM simulation",
      "Roofline map for common operations",
    ],
    tools: [
      "Roofline plotter",
      "Batch-size bound transition tool",
      "Arithmetic intensity reference",
      "torch.compile impact estimator",
    ],
  },
};

const TABS = [
  { key: "learning", label: "Learning" },
  { key: "visuals", label: "Visuals" },
  { key: "tools", label: "Tools" },
];

const PHYSICAL_CONCEPTS = [
  { name: "CUDA (Device Architecture)" },
  { name: "Streaming Multiprocessor", tag: "SM" },
  { name: "Core" },
  { name: "Special Function Unit", tag: "SFU" },
  { name: "Load/Store Unit", tag: "LSU" },
  { name: "Warp Scheduler" },
  { name: "CUDA Core" },
  { name: "Tensor Core" },
  { name: "Tensor Memory Accelerator", tag: "TMA" },
  { name: "Streaming Multiprocessor Architecture" },
  { name: "Texture Processing Cluster", tag: "TPC" },
  { name: "Graphics/GPU Processing Cluster", tag: "GPC" },
  { name: "Register File" },
  { name: "L1 Data Cache" },
  { name: "Tensor Memory" },
];

export default function LearningTopicPage({ params }) {
  const { slug } = use(params);
  const topic = TOPICS[slug];
  const [activeTab, setActiveTab] = useState("learning");

  if (!topic) {
    notFound();
  }

  const items = useMemo(() => topic[activeTab], [topic, activeTab]);

  return (
    <div className="min-h-[calc(100vh-78px)] bg-[#f2f6fb] py-8 md:py-12">
      <div className="shell-container max-w-[1100px]">
        <section className="rounded-[20px] border border-[#d7dfe8] bg-white p-6 shadow-[0_12px_30px_rgba(31,45,61,0.08)] md:p-8">
          <Link href="/gpu" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-[#274867]">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to GPU Hub
          </Link>

          <p className="mt-5 text-[11px] font-bold uppercase tracking-[0.2em] text-[#647c95]">{topic.id} / Learning Path</p>
          <h1 className="mt-2 text-4xl font-black tracking-[-0.02em] text-[#152a40] md:text-5xl">{topic.title}</h1>
          <p className="mt-3 max-w-[760px] text-sm leading-7 text-[#5a728a]">{topic.subtitle}</p>

          <div className="mt-6 flex flex-wrap gap-2">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] transition-colors ${
                  activeTab === tab.key
                    ? "border border-[#bdd4ea] bg-[#eaf4ff] text-[#1f4b73]"
                    : "border border-[#d9e2ec] bg-white text-[#617991] hover:bg-[#f5f9fd]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {slug === "physical-hardware" && activeTab === "learning" ? (
            <PhysicalHardwareLearning />
          ) : (
            <div className="mt-6 space-y-2">
              {items.map((item) => (
                <article key={item} className="rounded border border-[#dbe3ed] bg-[#fbfdff] px-4 py-3 text-sm leading-6 text-[#4f6882]">
                  <Sparkles className="mr-2 inline h-3.5 w-3.5 text-[#6f849b]" />
                  {item}
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function PhysicalHardwareLearning() {
  return (
    <div className="mt-6 space-y-6">
      <section className="overflow-hidden rounded-xl border border-[#0f3d1f] bg-[#041b09]">
        <header className="border-b border-[#0f3d1f] px-4 py-3 text-[11px] font-bold uppercase tracking-[0.18em] text-[#7adb8e]">
          Physical Hardware Concepts
        </header>
        <div className="px-4 py-4">
          <ul className="grid gap-2 md:grid-cols-2">
            {PHYSICAL_CONCEPTS.map((concept) => (
              <li key={concept.name} className="flex items-center gap-2 text-sm text-[#58d978]">
                <span className="text-base leading-none">{"->"}</span>
                <span>{concept.name}</span>
                {concept.tag ? (
                  <span className="rounded bg-[#0f3b1b] px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-[#7aea92]">
                    {concept.tag}
                  </span>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="rounded-xl border border-[#dbe3ed] bg-[#f7fafd] p-4 md:p-6">
        <div className="grid gap-4 lg:grid-cols-[1.45fr_0.55fr]">
          <article className="rounded-lg border border-[#d8e2ed] bg-white p-5">
            <h2 className="text-2xl font-black tracking-[-0.01em] text-[#172a3e]">Architecture Hierarchy</h2>
            <p className="mt-3 text-sm leading-7 text-[#587089]">
              Modern GPUs are built as modular clusters. Top-level GPCs contain TPCs, and each TPC contains SMs where CUDA, Tensor, and scheduler resources execute kernels.
            </p>

            <div className="mt-5 rounded border border-[#d9e2ec] bg-[#f8fbff] p-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#607b96]">Silicon Structure</p>
              <ul className="mt-3 space-y-2 text-sm leading-6 text-[#4f6882]">
                <li><strong>GPC:</strong> Largest cluster with raster/graphics + compute control.</li>
                <li><strong>TPC:</strong> Sub-cluster grouping SMs and front-end execution logic.</li>
                <li><strong>SM:</strong> Main compute unit containing CUDA cores, Tensor cores, and register file.</li>
              </ul>
            </div>
          </article>

          <div className="space-y-4">
            <aside className="rounded-lg border border-[#d8e2ed] bg-[#eef4fa] p-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#3d5b78]">Hardware Specs (H100)</p>
              <div className="mt-3 space-y-2 text-sm text-[#425f7c]">
                <SpecRow label="Max GPCs" value="8" />
                <SpecRow label="SMs per TPC" value="2" />
                <SpecRow label="CUDA Cores/SM" value="128" />
                <SpecRow label="Registers/SM" value="256 KB" />
                <SpecRow label="L1 Cache/SM" value="256 KB" />
              </div>
            </aside>

            <aside className="rounded-lg border border-[#345887] bg-[#3e6393] p-4 text-white">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#cfe1ff]">Peak TFLOP Calculator</p>
              <div className="mt-3 space-y-2 text-sm">
                <SpecRow label="Clock (MHz)" value="1755" dark />
                <SpecRow label="SM Count" value="128" dark />
                <SpecRow label="Precision" value="FP32" dark />
              </div>
              <p className="mt-4 text-xs uppercase tracking-[0.14em] text-[#d5e5ff]">Estimated Peak</p>
              <p className="text-4xl font-black tracking-tight">42.2 TFLOPS</p>
            </aside>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-[#dbe3ed] bg-[#f7fafd] p-4 md:p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-2xl font-black tracking-[-0.01em] text-[#172a3e]">SM Architecture Simulator</h3>
            <p className="text-sm text-[#607990]">Interactive diagram of a single Streaming Multiprocessor.</p>
          </div>
          <div className="flex gap-2">
            <button type="button" className="border border-[#d6e0eb] bg-white px-3 py-2 text-xs font-bold uppercase tracking-[0.14em] text-[#3c5877]">
              Reset Layout
            </button>
            <button type="button" className="border border-[#345887] bg-[#3e6393] px-3 py-2 text-xs font-bold uppercase tracking-[0.14em] text-white">
              Download SVG
            </button>
          </div>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-[1.5fr_0.5fr]">
          <div className="rounded border border-[#d8e2ed] bg-white p-4">
            <div className="rounded border border-[#cddae8] bg-[#f8fbff] p-4">
              <div className="mb-3 rounded border border-[#d6e0ec] bg-[#eff4fa] px-3 py-2 text-center text-[10px] font-bold uppercase tracking-[0.2em] text-[#637d97]">
                Instruction Cache & Scheduler
              </div>
              <div className="grid gap-2 md:grid-cols-4">
                <SimBlock label="Core Quad 0" />
                <SimBlock label="Core Quad 1" />
                <SimBlock label="Core Quad 2" />
                <SimBlock label="Core Quad 3" />
              </div>
              <div className="mt-3 grid gap-2 md:grid-cols-2">
                <SimBlock label="Shared Memory / L1" />
                <SimBlock label="Polymorph Engine" />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <aside className="rounded border border-[#d8e2ed] bg-white p-3">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#3e5a77]">Sector Breakdown</p>
              <ul className="mt-2 space-y-1.5 text-xs text-[#59728a]">
                <li>FP32 Cores: 16 per quad</li>
                <li>INT32 Cores: 16 per quad</li>
                <li>Tensor Cores: 1 (Gen 4)</li>
              </ul>
            </aside>
            <aside className="rounded border border-[#d8e2ed] bg-white p-3 text-xs leading-6 text-[#5a738c]">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#3e5a77]">Hot Tip</p>
              Over-allocating registers can lead to register pressure and reduce active warps.
            </aside>
          </div>
        </div>
      </section>
    </div>
  );
}

function SpecRow({ label, value, dark = false }) {
  return (
    <div className={`flex items-center justify-between rounded px-2 py-1.5 ${dark ? "bg-[#345887]/60" : "bg-white/65"}`}>
      <span>{label}</span>
      <span className="font-bold">{value}</span>
    </div>
  );
}

function SimBlock({ label }) {
  return (
    <div className="rounded border border-[#d4dfeb] bg-[#eef4fb] px-3 py-4 text-center text-[10px] font-bold uppercase tracking-[0.16em] text-[#5f7a95]">
      {label}
    </div>
  );
}
