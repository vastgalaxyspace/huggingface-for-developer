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

          <div className="mt-6 space-y-2">
            {items.map((item) => (
              <article key={item} className="rounded border border-[#dbe3ed] bg-[#fbfdff] px-4 py-3 text-sm leading-6 text-[#4f6882]">
                <Sparkles className="mr-2 inline h-3.5 w-3.5 text-[#6f849b]" />
                {item}
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
