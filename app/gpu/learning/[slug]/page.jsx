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
  { key: "tools", label: "Tool" },
];

const PHYSICAL_HARDWARE_THEORY = [
  {
    id: "01",
    title: "Streaming Multiprocessor (SM)",
    what: "An SM is the main execution unit in an NVIDIA GPU. It runs CUDA programs and executes warps every cycle.",
    points: [
      "Responsible for instruction execution, warp scheduling, and thread-state management.",
      "Contains CUDA cores, Tensor cores, SFUs, register file, shared memory/L1, and LSUs.",
      "CPU core focuses on low-latency serial work; SM focuses on massive parallel throughput.",
      "H100-level scale: high SM count and large concurrent-thread capacity for AI kernels.",
    ],
    formula: "GPU -> SMs -> warps -> instruction execution",
  },
  {
    id: "02",
    title: "CUDA Cores",
    what: "CUDA cores are scalar arithmetic units inside the SM for FP32/INT32/FP64-style operations.",
    points: [
      "Execute arithmetic, indexing, elementwise ops, normalization math, and control-heavy compute.",
      "Run under SIMT model where one instruction is issued to a warp (32 threads).",
      "Modern designs can mix FP32 and INT32 pipelines for better throughput.",
      "Total CUDA-core count drives FP32 peak rate but memory behavior still determines real speed.",
    ],
    formula: "Peak FP32 ~= total CUDA cores x clock x ops-per-cycle",
  },
  {
    id: "03",
    title: "Tensor Cores",
    what: "Tensor cores are specialized units for matrix multiply-accumulate (MMA): D = A x B + C.",
    points: [
      "Designed for deep learning workloads where GEMM dominates compute.",
      "Process matrix tiles in one instruction, unlike scalar CUDA cores.",
      "Support low-precision formats (FP16/BF16/FP8/INT8 paths by architecture).",
      "Key reason modern GPUs achieve high training/inference throughput.",
    ],
    formula: "Tensor core primitive: D = A x B + C",
  },
  {
    id: "04",
    title: "Warp Scheduler & SFU",
    what: "Warp schedulers select eligible warps each cycle, while SFUs handle transcendental operations like sin/cos/sqrt/exp.",
    points: [
      "Scheduler hides memory latency by rapidly switching across ready warps.",
      "Divergence and stalls reduce scheduler efficiency if warps are not eligible.",
      "SFUs accelerate special math without occupying regular arithmetic paths.",
      "Well-structured kernels maximize scheduler issue rate and minimize stall reasons.",
    ],
    formula: "Higher eligible-warps-per-cycle -> better utilization",
  },
  {
    id: "05",
    title: "Tensor Memory Accelerator (TMA)",
    what: "TMA (Hopper+) performs asynchronous bulk transfer from global memory directly to shared memory.",
    points: [
      "Bypasses register-heavy manual load paths for tile movement.",
      "Enables overlap of compute and data movement in pipelined kernels.",
      "Critical for modern attention and tiled GEMM implementations.",
      "Not available on older generations like Ampere/Ada.",
    ],
    formula: "Global memory -> Shared memory (asynchronous copy path)",
  },
  {
    id: "06",
    title: "Register File",
    what: "Fastest memory inside SM; each active thread uses private registers for live values and state.",
    points: [
      "High register usage per thread causes register pressure and lowers occupancy.",
      "Spilling pushes values to slower memory and can severely hurt performance.",
      "Registers are central to latency hiding because active warp context stays resident.",
      "Tuning launch config and kernel structure helps balance register footprint.",
    ],
    formula: "Max active threads ~= registers per SM / registers per thread",
  },
  {
    id: "07",
    title: "Shared Memory",
    what: "Shared memory is fast block-level memory used for cooperative data reuse and tiling.",
    points: [
      "Much faster than VRAM, ideal for reused data in matrix/attention kernels.",
      "Main pitfall is bank conflicts when access patterns map many threads to same bank.",
      "Shared-memory use per block can cap resident blocks and reduce occupancy.",
      "Strong tiling + conflict-aware indexing usually gives large speedups.",
    ],
    formula: "Blocks per SM ~= shared memory per SM / shared memory per block",
  },
  {
    id: "08",
    title: "GPU RAM (VRAM / Global Memory)",
    what: "Largest GPU memory tier storing model weights, KV cache, activations, gradients, and optimizer states.",
    points: [
      "HBM provides much higher bandwidth than GDDR, especially for large-model workloads.",
      "Inference latency often becomes memory-bandwidth bound at low batch sizes.",
      "Capacity decides whether workload fits; bandwidth decides how fast it runs.",
      "Practical sizing needs weights + cache + activations + overhead (or training extras).",
    ],
    formula: "Token latency floor ~= model bytes / memory bandwidth",
  },
];

export default function LearningTopicPage({ params }) {
  const { slug } = use(params);
  const topic = TOPICS[slug];
  const [activeTab, setActiveTab] = useState("learning");
  const [selectedTopicIndex, setSelectedTopicIndex] = useState(0);

  if (!topic) {
    notFound();
  }

  const items = useMemo(() => topic[activeTab], [topic, activeTab]);
  const isPhysicalLearning = slug === "physical-hardware" && activeTab === "learning";
  const sidebarTopics = useMemo(
    () => (isPhysicalLearning ? PHYSICAL_HARDWARE_THEORY.map((item) => item.title) : items),
    [isPhysicalLearning, items]
  );

  const safeIndex = Math.min(selectedTopicIndex, Math.max(sidebarTopics.length - 1, 0));
  const selectedPhysicalTopic = isPhysicalLearning ? PHYSICAL_HARDWARE_THEORY[safeIndex] : null;
  const selectedListTopic = !isPhysicalLearning ? items[safeIndex] : null;

  return (
    <div className="min-h-[calc(100vh-78px)] bg-[#f2f6fb] py-8 md:py-12">
      <div className="shell-container">
        <section className="rounded-[20px] border border-[#d7dfe8] bg-white p-6 shadow-[0_12px_30px_rgba(31,45,61,0.08)] md:p-8">
          <Link href="/gpu" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-[#274867]">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to GPU Hub
          </Link>

          <p className="mt-5 text-[11px] font-bold uppercase tracking-[0.2em] text-[#647c95]">{topic.id} / Learning Path</p>
          <h1 className="mt-2 text-4xl font-black tracking-[-0.02em] text-[#152a40] md:text-5xl">{topic.title}</h1>
          <p className="mt-3 max-w-[760px] text-sm leading-7 text-[#5a728a]">{topic.subtitle}</p>

          <div className="mt-6 grid gap-4 lg:grid-cols-[250px_1fr]">
            <aside className="rounded border border-[#dbe3ed] bg-[#f8fbff] p-3">
              <p className="mb-2 px-1 text-[10px] font-black uppercase tracking-[0.2em] text-[#7b90a6]">
                Main Sections
              </p>
              <div className="space-y-1">
                {TABS.map((tab) => (
                  <div key={tab.key}>
                    <button
                      type="button"
                      onClick={() => {
                        if (activeTab !== tab.key) {
                          setActiveTab(tab.key);
                          setSelectedTopicIndex(0);
                        }
                      }}
                      className={`w-full text-left text-xs font-black uppercase tracking-[0.18em] ${
                        activeTab === tab.key
                          ? "border border-[#adc9e4] bg-[#edf5ff] px-3 py-2.5 text-[#163e66]"
                          : "border border-transparent bg-[#f8fbff] px-3 py-2.5 text-[#5f7891] hover:bg-white"
                      }`}
                    >
                      {tab.label}
                    </button>

                    {activeTab === tab.key ? (
                      <div className="mt-2 border-l-2 border-[#d7e1ec] pl-2">
                        <p className="mb-1 px-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[#7a90a7]">
                          Sub Topics
                        </p>
                        <div className="space-y-1">
                        {sidebarTopics.map((item, index) => (
                          <button
                            key={item}
                            type="button"
                            onClick={() => setSelectedTopicIndex(index)}
                            className={`w-full text-left text-[11px] font-semibold tracking-[0.02em] ${
                              safeIndex === index
                                ? "border border-[#bed3e8] bg-white px-2 py-2 text-[#1d4468]"
                                : "border border-transparent px-2 py-2 text-[#5f7891] hover:bg-white"
                            }`}
                          >
                            {String(index + 1).padStart(2, "0")} - {item}
                          </button>
                        ))}
                        </div>
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            </aside>

            <div>
              {isPhysicalLearning && selectedPhysicalTopic ? (
                <PhysicalHardwareTopic topic={selectedPhysicalTopic} />
              ) : selectedListTopic ? (
                <article className="rounded border border-[#dbe3ed] bg-[#fbfdff] px-4 py-3 text-sm leading-6 text-[#4f6882]">
                  <Sparkles className="mr-2 inline h-3.5 w-3.5 text-[#6f849b]" />
                  {selectedListTopic}
                </article>
              ) : null}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function PhysicalHardwareTopic({ topic }) {
  return (
    <article className="overflow-hidden rounded-xl border border-[#dbe3ed] bg-white">
      <header className="border-b border-[#dbe3ed] bg-[#f8fbff] px-4 py-3">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#6c839b]">Topic {topic.id}</p>
        <h3 className="text-lg font-black tracking-[-0.01em] text-[#1c344d]">{topic.title}</h3>
      </header>
      <div className="space-y-4 px-4 py-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#6c839b]">What it is</p>
          <p className="mt-1 text-sm leading-7 text-[#587089]">{topic.what}</p>
        </div>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#6c839b]">Key points</p>
          <ul className="mt-2 space-y-2">
            {topic.points.map((point) => (
              <li key={point} className="rounded border border-[#dbe3ed] bg-[#fbfdff] px-3 py-2 text-sm leading-6 text-[#4f6882]">
                {point}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded border border-[#dbe3ed] bg-[#f8fbff] px-3 py-3">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#6c839b]">Formula / model</p>
          <p className="mt-1 font-mono text-xs text-[#3f5b77]">{topic.formula}</p>
        </div>
      </div>
    </article>
  );
}
