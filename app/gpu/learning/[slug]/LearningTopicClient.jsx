"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import { PHYSICAL_HARDWARE_THEORY } from "../../../../src/data/physicalHardwareTheory";
import { MEMORY_HIERARCHY_THEORY } from "../../../../src/data/memoryHierarchyTheory";
import { EXECUTION_MODEL_THEORY } from "../../../../src/data/executionModelTheory";
import { COMPILATION_PIPELINE_THEORY } from "../../../../src/data/compilationPipelineTheory";
import { CUDA_PROGRAMMING_THEORY } from "../../../../src/data/cudaProgrammingTheory";
import { DRIVER_STACK_THEORY } from "../../../../src/data/driverStackTheory";
import { LIBRARIES_FRAMEWORKS_THEORY } from "../../../../src/data/librariesFrameworksTheory";
import PhysicalHardwareVisuals from "../../../../src/components/gpu/visuals/PhysicalHardwareVisuals";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../src/components/ui/card";

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
      "Register file - fastest storage, 65536 per SM, and spill behavior",
      "Shared memory / L1 cache - scratchpad model, programmer control, and H100 sizing",
      "L2 cache - shared across SMs between L1 and VRAM",
      "GPU RAM (VRAM / global memory) - HBM2e/HBM3 and model-state placement",
      "HBM vs GDDR - bandwidth and data-center trade-offs",
      "Memory banks and bank conflicts - 32-bank mapping and serialization",
      "Memory coalescing - consecutive vs strided transaction behavior",
      "Tensor memory (Blackwell) - dedicated memory path for Tensor cores",
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
      "Thread - smallest unit with private PC and registers",
      "Warp - 32 threads and scheduler issue unit",
      "Thread Block (CTA) - shared memory and synchronization",
      "Grid - full kernel launch of independent blocks",
      "SIMT - one instruction across many threads",
      "Warp divergence - masking, predication, and cost",
      "Latency hiding - switching warps to cover memory wait",
      "Occupancy - active warps versus theoretical maximum",
      "Warpgroup (Hopper+) - 4-warps wgmma execution",
      "Thread Block Cluster (Hopper+) - inter-block cooperation",
      "Warp execution states - active, eligible, selected, stalled",
      "Scoreboard stalls - short versus long latency dependencies",
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
      "CUDA C++ -> PTX -> SASS -> Binary pipeline",
      "PTX portability and virtual ISA",
      "SASS architecture-specific instruction layer",
      "nvcc flow and compute capability mapping",
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
      "CUDA keywords and memory qualifiers",
      "Kernel launch dimensions and mapping",
      "cudaMalloc / cudaMemcpy / cudaFree fundamentals",
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
      "cuBLAS GEMM and Tensor Core usage",
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
];

const TOPIC_THEME = {
  "h-sm": { header: "bg-[#e6f2ff]", badge: "bg-[#0f5ea8]" },
  "h-cuda": { header: "bg-[#eaf8ff]", badge: "bg-[#0a7298]" },
  "h-tens": { header: "bg-[#eef0ff]", badge: "bg-[#3149b8]" },
  "h-warp": { header: "bg-[#fff2e8]", badge: "bg-[#b45309]" },
  "h-sfu": { header: "bg-[#ecfbf8]", badge: "bg-[#0f766e]" },
  "h-tma": { header: "bg-[#f3f5ff]", badge: "bg-[#4c1d95]" },
  "h-reg": { header: "bg-[#edf9ef]", badge: "bg-[#166534]" },
  "h-shmem": { header: "bg-[#edf8ff]", badge: "bg-[#0369a1]" },
  "h-vram": { header: "bg-[#eaf2ff]", badge: "bg-[#1d4ed8]" },
};

export default function LearningTopicClient({ slug }) {
  const topic = TOPICS[slug];
  const [activeTab, setActiveTab] = useState("learning");
  const [selectedTopicIndex, setSelectedTopicIndex] = useState(0);

  if (!topic) {
    notFound();
  }

  const items = useMemo(() => topic[activeTab], [topic, activeTab]);
  const isPhysicalLearning = slug === "physical-hardware" && activeTab === "learning";
  const isMemoryLearning = slug === "memory-hierarchy" && activeTab === "learning";
  const isExecutionLearning = slug === "execution-model" && activeTab === "learning";
  const isCompilationLearning = slug === "compilation-pipeline" && activeTab === "learning";
  const isCudaProgrammingLearning = slug === "cuda-programming" && activeTab === "learning";
  const isDriverStackLearning = slug === "driver-stack" && activeTab === "learning";
  const isLibrariesFrameworksLearning = slug === "libraries-frameworks" && activeTab === "learning";
  const isPhysicalVisuals = slug === "physical-hardware" && activeTab === "visuals";
  const sidebarTopics = useMemo(
    () =>
      isPhysicalLearning
        ? PHYSICAL_HARDWARE_THEORY.map((item) => item.title)
        : isMemoryLearning
          ? MEMORY_HIERARCHY_THEORY.map((item) => item.title)
          : isExecutionLearning
            ? EXECUTION_MODEL_THEORY.map((item) => item.title)
            : isCompilationLearning
              ? COMPILATION_PIPELINE_THEORY.map((item) => item.title)
              : isCudaProgrammingLearning
                ? CUDA_PROGRAMMING_THEORY.map((item) => item.title)
                : isDriverStackLearning
                  ? DRIVER_STACK_THEORY.map((item) => item.title)
                  : isLibrariesFrameworksLearning
                    ? LIBRARIES_FRAMEWORKS_THEORY.map((item) => item.title)
                    : items,
    [
      isPhysicalLearning,
      isMemoryLearning,
      isExecutionLearning,
      isCompilationLearning,
      isCudaProgrammingLearning,
      isDriverStackLearning,
      isLibrariesFrameworksLearning,
      items,
    ]
  );

  const safeIndex = Math.min(selectedTopicIndex, Math.max(sidebarTopics.length - 1, 0));
  const selectedPhysicalTopic = isPhysicalLearning ? PHYSICAL_HARDWARE_THEORY[safeIndex] : null;
  const selectedMemoryTopic = isMemoryLearning ? MEMORY_HIERARCHY_THEORY[safeIndex] : null;
  const selectedExecutionTopic = isExecutionLearning ? EXECUTION_MODEL_THEORY[safeIndex] : null;
  const selectedCompilationTopic = isCompilationLearning ? COMPILATION_PIPELINE_THEORY[safeIndex] : null;
  const selectedCudaProgrammingTopic = isCudaProgrammingLearning ? CUDA_PROGRAMMING_THEORY[safeIndex] : null;
  const selectedDriverStackTopic = isDriverStackLearning ? DRIVER_STACK_THEORY[safeIndex] : null;
  const selectedLibrariesFrameworksTopic = isLibrariesFrameworksLearning ? LIBRARIES_FRAMEWORKS_THEORY[safeIndex] : null;
  const selectedListTopic =
    !isPhysicalLearning &&
    !isMemoryLearning &&
    !isExecutionLearning &&
    !isCompilationLearning &&
    !isCudaProgrammingLearning &&
    !isDriverStackLearning &&
    !isLibrariesFrameworksLearning
      ? items[safeIndex]
      : null;

  return (
    <div className="min-h-[calc(100vh-78px)] bg-[#f2f6fb] py-8 md:py-12">
      <div className="shell-container">
        <Card className="rounded-[20px] border-[#cddaea] bg-gradient-to-b from-white via-[#fbfdff] to-[#f7fbff] p-6 md:p-8">
          <Link href="/gpu" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-[#274867]">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to GPU Hub
          </Link>

          <p className="mt-5 text-[11px] font-bold uppercase tracking-[0.2em] text-[#647c95]">{topic.id} / Learning Path</p>
          <h1 className="mt-2 text-4xl font-black tracking-[-0.02em] text-[#152a40] md:text-5xl">{topic.title}</h1>
          <p className="mt-3 max-w-[760px] text-sm leading-7 text-[#5a728a]">{topic.subtitle}</p>

          <div className="mt-6 grid gap-4 lg:grid-cols-[250px_1fr]">
            <Card className="rounded border-[#d7e5f4] bg-[#f6fbff] p-3">
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
                              key={`${item}-${index}`}
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
            </Card>

            <div className="space-y-3">
              {isPhysicalLearning && selectedPhysicalTopic ? (
                <PhysicalHardwareTopic topic={selectedPhysicalTopic} />
              ) : isMemoryLearning && selectedMemoryTopic ? (
                <PhysicalHardwareTopic topic={selectedMemoryTopic} />
              ) : isExecutionLearning && selectedExecutionTopic ? (
                <PhysicalHardwareTopic topic={selectedExecutionTopic} />
              ) : isCompilationLearning && selectedCompilationTopic ? (
                <PhysicalHardwareTopic topic={selectedCompilationTopic} />
              ) : isCudaProgrammingLearning && selectedCudaProgrammingTopic ? (
                <PhysicalHardwareTopic topic={selectedCudaProgrammingTopic} />
              ) : isDriverStackLearning && selectedDriverStackTopic ? (
                <PhysicalHardwareTopic topic={selectedDriverStackTopic} />
              ) : isLibrariesFrameworksLearning && selectedLibrariesFrameworksTopic ? (
                <PhysicalHardwareTopic topic={selectedLibrariesFrameworksTopic} />
              ) : isPhysicalVisuals ? (
                <PhysicalHardwareVisuals selectedIndex={safeIndex} />
              ) : selectedListTopic ? (
                <Card className="rounded border-[#d7e5f4] bg-[#f8fcff] px-4 py-3 text-sm leading-6 text-[#4f6882]">
                  <Sparkles className="mr-2 inline h-3.5 w-3.5 text-[#6f849b]" />
                  {selectedListTopic}
                </Card>
              ) : null}

              <SubTopicNavigator
                total={sidebarTopics.length}
                currentIndex={safeIndex}
                onSelect={setSelectedTopicIndex}
              />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

function PhysicalHardwareTopic({ topic }) {
  const theme = TOPIC_THEME[topic.toneClass] || TOPIC_THEME["h-sm"];

  return (
    <Card className="overflow-hidden rounded-xl border-[#d7e5f4] bg-white">
      <CardHeader className={`border-b border-[#d7e5f4] px-4 py-3 ${theme.header}`}>
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#51687f]">Topic {topic.id}</p>
        <div className="mt-1 flex items-center gap-2">
          <span className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.1em] text-white ${theme.badge}`}>
            {topic.id}
          </span>
          <CardTitle className="text-lg">{topic.title}</CardTitle>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 px-4 py-4">
        {topic.blocks.map((block, blockIndex) => (
          <Card key={`${topic.id}-${blockIndex}`} className="rounded border-[#d7e5f4] bg-[#fbfdff] p-3">
            <h4 className="text-[11px] font-black uppercase tracking-[0.14em] text-[#5c7590]">{block.title}</h4>
            <div className="mt-3 space-y-3">
              {block.sections.map((section, sectionIndex) => (
                <RenderSection key={`${topic.id}-${blockIndex}-${section.type}-${sectionIndex}`} section={section} />
              ))}
            </div>
          </Card>
        ))}
      </CardContent>
    </Card>
  );
}

function RenderSection({ section }) {
  if (section.type === "content") {
    return (
      <div className="space-y-2">
        {section.paragraphs.map((paragraph, index) => (
          <p key={index} className="text-sm leading-7 text-[#4f6882]">
            {paragraph}
          </p>
        ))}
      </div>
    );
  }

  if (section.type === "list") {
    return (
      <ul className="space-y-1.5">
        {section.items.map((item, index) => (
          <li key={index} className="rounded border border-[#dbe3ed] bg-white px-3 py-2 text-sm leading-6 text-[#4f6882]">
            {item}
          </li>
        ))}
      </ul>
    );
  }

  if (section.type === "compare") {
    return (
      <div className="grid gap-3 md:grid-cols-2">
        {section.columns.map((column, index) => (
          <div key={index} className="rounded border border-[#dbe3ed] bg-white p-3">
            <p className="text-[11px] font-black uppercase tracking-[0.12em] text-[#5f7891]">{column.label}</p>
            <ul className="mt-2 space-y-1.5">
              {column.items.map((item, itemIndex) => (
                <li key={itemIndex} className="border-t border-[#e7edf4] pt-1.5 text-[13px] leading-6 text-[#4f6882] first:border-t-0 first:pt-0">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    );
  }

  if (section.type === "formula") {
    return (
      <Card className="rounded border-[#d7e5f4] bg-[#f8fbff] px-3 py-3">
        <pre className="whitespace-pre-wrap break-words font-mono text-xs leading-6 text-[#3f5b77]">{section.main}</pre>
        {section.sub ? (
          <p className="mt-2 whitespace-pre-wrap text-[11px] leading-6 text-[#647c95]">{section.sub}</p>
        ) : null}
      </Card>
    );
  }

  if (section.type === "kv") {
    return (
      <div className="grid gap-2 sm:grid-cols-2">
        {section.items.map((kv, index) => (
          <div key={index} className="rounded border border-[#dbe3ed] bg-white px-3 py-2.5">
            <p className="text-[11px] text-[#6c839b]">{kv.key}</p>
            <p className="mt-1 whitespace-pre-wrap font-mono text-sm text-[#3f5b77]">{kv.value}</p>
          </div>
        ))}
      </div>
    );
  }

  if (section.type === "tags") {
    return (
      <div className="flex flex-wrap gap-2">
        {section.items.map((tag, index) => (
          <span key={index} className="rounded border border-[#dbe3ed] bg-white px-2.5 py-1 text-[11px] font-semibold text-[#5f7891]">
            {tag}
          </span>
        ))}
      </div>
    );
  }

  if (section.type === "table") {
    return (
      <Card className="overflow-x-auto rounded border-[#d7e5f4] bg-white">
        <table className="w-full min-w-[640px] text-left">
          <thead className="bg-[#f4f8fc]">
            <tr>
              {section.headers.map((header, index) => (
                <th key={index} className="whitespace-nowrap border-b border-[#dbe3ed] px-3 py-2 text-[10px] font-black uppercase tracking-[0.12em] text-[#617b95]">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {section.rows.map((row, rowIndex) => (
              <tr key={rowIndex} className="border-b border-[#edf2f7] last:border-b-0">
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex} className="whitespace-pre-wrap px-3 py-2 text-[13px] text-[#4f6882]">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    );
  }

  return null;
}

function SubTopicNavigator({ total, currentIndex, onSelect }) {
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < total - 1;

  return (
    <Card className="rounded border-[#d7e5f4] bg-[#f6fbff] p-3">
      <div className="grid gap-2 sm:grid-cols-2">
        <button
          type="button"
          disabled={!hasPrev}
          onClick={() => hasPrev && onSelect(currentIndex - 1)}
          className="inline-flex items-center justify-center gap-2 rounded border border-[#cfdcea] bg-white px-3 py-2 text-xs font-bold uppercase tracking-[0.12em] text-[#355371] disabled:cursor-not-allowed disabled:opacity-45"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Previous
        </button>
        <button
          type="button"
          disabled={!hasNext}
          onClick={() => hasNext && onSelect(currentIndex + 1)}
          className="inline-flex items-center justify-center gap-2 rounded border border-[#cfdcea] bg-white px-3 py-2 text-xs font-bold uppercase tracking-[0.12em] text-[#355371] disabled:cursor-not-allowed disabled:opacity-45"
        >
          Next
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </Card>
  );
}
