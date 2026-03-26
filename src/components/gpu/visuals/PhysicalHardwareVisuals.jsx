"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";

const MotionDiv = motion.div;

const SM_BLOCKS = [
  {
    key: "warp",
    label: "Warp Scheduler",
    x: 24,
    y: 16,
    w: 180,
    h: 52,
    description:
      "The Warp Scheduler is the traffic cop of the SM. In NVIDIA's architecture, threads are managed in groups of 32 called warps.",
    details: [
      "Role: it decides which warp is ready to execute next and issues instructions to functional units like CUDA or Tensor cores.",
      "Efficiency: if one warp is waiting for data from memory, the scheduler quickly swaps it out for another warp that is ready to work, ensuring the hardware stays busy.",
    ],
  },
  {
    key: "cuda",
    label: "CUDA Cores",
    x: 24,
    y: 84,
    w: 180,
    h: 92,
    description: "These are the standard worker bees of the GPU.",
    details: [
      "Role: they handle general-purpose mathematical operations, specifically FP32 and INT32 arithmetic.",
      "Use case: almost every task, from rendering pixels in a game to basic physics simulations, relies heavily on CUDA cores.",
    ],
  },
  {
    key: "tensor",
    label: "Tensor Cores",
    x: 220,
    y: 84,
    w: 180,
    h: 92,
    description:
      "These are specialized hardware units designed for deep learning and high-performance matrix math.",
    details: [
      "Role: while CUDA cores do one calculation at a time, Tensor Cores can multiply and add entire matrices in a single clock cycle via fused operations.",
      "Use case: they are the reason modern AI runs fast, and they are also used for DLSS in gaming.",
    ],
  },
  {
    key: "register",
    label: "Register File",
    x: 220,
    y: 16,
    w: 180,
    h: 52,
    description:
      "The Register File is the fastest memory on the GPU, located directly within the SM.",
    details: [
      "Role: it stores the local variables and data that each individual thread is currently working on.",
      "Capacity: because GPUs run thousands of threads simultaneously, the Register File is massive compared to a CPU register set.",
      "Register pressure: if a program uses too many registers per thread, fewer threads can run at once.",
    ],
  },
  {
    key: "l1",
    label: "L1 Cache / Shared",
    x: 24,
    y: 192,
    w: 376,
    h: 64,
    description:
      "This block is the scratchpad for the SM and acts as a bridge between the cores and the rest of the memory system.",
    details: [
      "L1 Cache: automatically stores frequently accessed data to reduce waiting on slower global memory (VRAM).",
      "Shared Memory: a user-defined memory space that lets threads in the same block communicate and share data at high speed.",
      "Note: in Hopper/Blackwell-class designs, L1 Cache and Shared Memory share the same physical pool and the split is tunable.",
    ],
  },
];

// Old spec arrays removed, replaced by GEN_SPECS further down in the file.

export default function PhysicalHardwareVisuals({ selectedIndex = 0 }) {
  const visuals = useMemo(
    () => [
      <ClickableSMDiagram key="sm" />,
      <HierarchyTree key="tree" />,
      <CudaTensorRace key="race" />,
      <GenerationSlider key="slider" />,
    ],
    []
  );

  const index = Math.min(Math.max(selectedIndex, 0), visuals.length - 1);
  return <div>{visuals[index]}</div>;
}

function Card({ title, subtitle, children }) {
  return (
    <article className="overflow-hidden rounded-xl border border-[#dbe3ed] bg-white">
      <header className="border-b border-[#dbe3ed] bg-[#f8fbff] px-4 py-3">
        <h3 className="text-sm font-black uppercase tracking-[0.14em] text-[#1c344d]">{title}</h3>
        <p className="mt-1 text-xs text-[#627a92]">{subtitle}</p>
      </header>
      <div className="p-4">{children}</div>
    </article>
  );
}

function ClickableSMDiagram() {
  const [active, setActive] = useState("warp");
  const activeBlock = SM_BLOCKS.find((b) => b.key === active) || SM_BLOCKS[0];

  /* Color map per block */
  const colorMap = {
    warp: { fill: "#ede9fe", stroke: "#7c3aed", glow: "rgba(124,58,237,0.18)" },
    register: { fill: "#e0f2fe", stroke: "#0284c7", glow: "rgba(2,132,199,0.18)" },
    cuda: { fill: "#dcfce7", stroke: "#16a34a", glow: "rgba(22,163,74,0.18)" },
    tensor: { fill: "#fef3c7", stroke: "#d97706", glow: "rgba(217,119,6,0.18)" },
    l1: { fill: "#fce7f3", stroke: "#db2777", glow: "rgba(219,39,119,0.18)" },
  };

  /* Connection lines between blocks (from → to center points) */
  const connections = [
    { from: "warp", to: "cuda" },
    { from: "register", to: "tensor" },
    { from: "cuda", to: "l1" },
    { from: "tensor", to: "l1" },
  ];

  return (
    <Card
      title="01 - Clickable SM Diagram"
      subtitle="Click any component block to inspect details. Blocks animate on load."
    >
      <div className="grid gap-4 lg:grid-cols-[420px_1fr]" data-visual="sm-diagram">
        <svg
          viewBox="0 0 424 280"
          className="w-full rounded-xl border border-[#dbe3ed] bg-[#f8fbff]"
          role="img"
          aria-label="SM diagram"
        >
          {/* Outer SM container with subtle grid pattern */}
          <defs>
            <pattern id="sm-grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e8eef5" strokeWidth="0.5" />
            </pattern>
            {/* Glow filter for active block */}
            <filter id="sm-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            {/* Animated dash for connections */}
            <style>{`
              @keyframes sm-dash-flow {
                to { stroke-dashoffset: -20; }
              }
              .sm-conn-line {
                stroke-dasharray: 6 4;
                animation: sm-dash-flow 1.2s linear infinite;
              }
              @keyframes sm-block-enter {
                from { opacity: 0; transform: scale(0.85); }
                to { opacity: 1; transform: scale(1); }
              }
            `}</style>
          </defs>

          {/* Background */}
          <rect x="10" y="10" width="404" height="260" rx="12" fill="url(#sm-grid)" stroke="#dbe3ed" />
          <rect x="10" y="10" width="404" height="260" rx="12" fill="#ffffff" fillOpacity="0.7" />

          {/* SM label */}
          <text x="212" y="278" textAnchor="middle" style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.18em", fill: "#a0b3c6" }}>
            STREAMING MULTIPROCESSOR
          </text>

          {/* Connection lines (animated dashes) */}
          {connections.map((conn, i) => {
            const fromB = SM_BLOCKS.find(b => b.key === conn.from);
            const toB = SM_BLOCKS.find(b => b.key === conn.to);
            if (!fromB || !toB) return null;
            const x1 = fromB.x + fromB.w / 2;
            const y1 = fromB.y + fromB.h;
            const x2 = toB.x + toB.w / 2;
            const y2 = toB.y;
            return (
              <line
                key={i}
                x1={x1} y1={y1} x2={x2} y2={y2}
                className="sm-conn-line"
                stroke={active === conn.from || active === conn.to ? "#6366f1" : "#c8d5e3"}
                strokeWidth={active === conn.from || active === conn.to ? 1.8 : 1}
                opacity={active === conn.from || active === conn.to ? 0.8 : 0.4}
              />
            );
          })}

          {/* SM Blocks with staggered entrance */}
          {SM_BLOCKS.map((block, idx) => {
            const isActive = block.key === active;
            const colors = colorMap[block.key] || colorMap.cuda;

            return (
              <g
                key={block.key}
                onClick={() => setActive(block.key)}
                style={{
                  cursor: "pointer",
                  animation: `sm-block-enter 0.45s ease-out ${idx * 0.12}s both`,
                  transformOrigin: `${block.x + block.w / 2}px ${block.y + block.h / 2}px`,
                }}
              >
                {/* Glow behind active block */}
                {isActive && (
                  <rect
                    x={block.x - 3}
                    y={block.y - 3}
                    width={block.w + 6}
                    height={block.h + 6}
                    rx="11"
                    fill={colors.glow}
                    filter="url(#sm-glow)"
                  >
                    <animate
                      attributeName="opacity"
                      values="0.5;0.9;0.5"
                      dur="2s"
                      repeatCount="indefinite"
                    />
                  </rect>
                )}

                {/* Block rect */}
                <rect
                  x={block.x}
                  y={block.y}
                  width={block.w}
                  height={block.h}
                  rx="8"
                  fill={isActive ? colors.fill : "#f3f7fb"}
                  stroke={isActive ? colors.stroke : "#cad5e2"}
                  strokeWidth={isActive ? 2.2 : 1.2}
                >
                  {/* Subtle hover pulse */}
                  {!isActive && (
                    <animate
                      attributeName="stroke-opacity"
                      values="1;0.5;1"
                      dur="3s"
                      repeatCount="indefinite"
                      begin={`${idx * 0.5}s`}
                    />
                  )}
                </rect>

                {/* Label */}
                <text
                  x={block.x + block.w / 2}
                  y={block.y + block.h / 2 + (block.h > 60 ? -2 : 4)}
                  textAnchor="middle"
                  style={{
                    fontSize: isActive ? 12 : 11,
                    fontWeight: 800,
                    letterSpacing: "0.04em",
                    fill: isActive ? colors.stroke : "#3d5a78",
                  }}
                >
                  {block.label}
                </text>

                {/* Sub-label for larger blocks */}
                {block.h > 60 && (
                  <text
                    x={block.x + block.w / 2}
                    y={block.y + block.h / 2 + 16}
                    textAnchor="middle"
                    style={{ fontSize: 8, fontWeight: 600, fill: "#8a9fb5", letterSpacing: "0.08em" }}
                  >
                    {block.key === "cuda" ? "FP32 / INT32" : block.key === "tensor" ? "Matrix FMA" : ""}
                  </text>
                )}

                {/* Tiny dot grid inside CUDA / Tensor blocks */}
                {block.key === "cuda" && Array.from({ length: 16 }).map((_, di) => (
                  <circle
                    key={di}
                    cx={block.x + 30 + (di % 8) * 16}
                    cy={block.y + 58 + Math.floor(di / 8) * 14}
                    r="3"
                    fill={isActive ? colors.stroke : "#b8c8d8"}
                    opacity={isActive ? 0.5 : 0.25}
                  >
                    <animate
                      attributeName="opacity"
                      values={isActive ? "0.3;0.7;0.3" : "0.15;0.3;0.15"}
                      dur={`${1.5 + di * 0.08}s`}
                      repeatCount="indefinite"
                    />
                  </circle>
                ))}
                {block.key === "tensor" && Array.from({ length: 4 }).map((_, di) => (
                  <rect
                    key={di}
                    x={block.x + 30 + (di % 2) * 80}
                    y={block.y + 52 + Math.floor(di / 2) * 20}
                    width="18"
                    height="14"
                    rx="3"
                    fill={isActive ? colors.stroke : "#c5d2e0"}
                    opacity={isActive ? 0.35 : 0.18}
                  >
                    <animate
                      attributeName="opacity"
                      values={isActive ? "0.2;0.5;0.2" : "0.1;0.22;0.1"}
                      dur={`${2 + di * 0.3}s`}
                      repeatCount="indefinite"
                    />
                  </rect>
                ))}
              </g>
            );
          })}
        </svg>

        {/* Info panel with animated transition */}
        <MotionDiv
          key={active}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, ease: "easeOut" }}
          className="rounded-xl border border-[#dbe3ed] bg-[#fbfdff] p-4"
        >
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#6f859d]">Active Component</p>
          <h4 className="mt-1 text-lg font-black text-[#1d3f62]">{activeBlock.label}</h4>
          <p className="mt-3 text-sm leading-7 text-[#506a84]">{activeBlock.description}</p>
          <div className="mt-4 space-y-2">
            {activeBlock.details.map((detail, idx) => (
              <MotionDiv
                key={detail}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.25, delay: idx * 0.08 }}
                className="rounded-lg border border-[#dbe3ed] bg-white px-3 py-2 text-sm leading-6 text-[#4f6882]"
              >
                {detail}
              </MotionDiv>
            ))}
          </div>
          <div
            className="mt-4 flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold"
            style={{
              background: (colorMap[active]?.fill || "#edf5ff"),
              border: `1px solid ${colorMap[active]?.stroke || "#bfd3eb"}33`,
              color: colorMap[active]?.stroke || "#24507a",
            }}
          >
            <span
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{ background: colorMap[active]?.stroke || "#2563eb" }}
            />
            {activeBlock.label} is highlighted in the diagram
          </div>
        </MotionDiv>
      </div>
    </Card>
  );
}

/* ── Hierarchy node data with real specs ── */
const HIERARCHY_NODES = {
  gpu: {
    label: "GPU",
    count: "1 Die",
    color: "#3b82f6",
    bgColor: "#dbeafe",
    textColor: "#1e3a8a",
    borderColor: "#93c5fd",
    tooltip: "The entire graphics processing unit — the top-level chip",
    analogy: "City",
    description: "The GPU is the top-level processing unit. A modern NVIDIA GPU (e.g. RTX 4090 / H100) is a single monolithic die containing billions of transistors, organized into a strict hierarchy.",
    specs: [
      ["Total SMs", "Up to 128+ (H100: 132)"],
      ["Total CUDA Cores", "Up to 16,384+"],
      ["Total Tensor Cores", "Up to 528+ (4th gen)"],
      ["Memory", "Up to 80 GB HBM3"],
      ["TDP", "300 W – 700 W"],
    ],
    children: ["gpc"],
  },
  gpc: {
    label: "GPC",
    count: "7 per GPU  (typical)",
    color: "#0ea5e9",
    bgColor: "#e0f2fe",
    textColor: "#0b4d74",
    borderColor: "#7dd3fc",
    tooltip: "Graphics Processing Cluster — groups of TPCs with a shared raster engine",
    analogy: "District",
    description: "A Graphics Processing Cluster groups multiple TPCs together and includes a shared raster engine plus a ROP (Render Output Unit) partition. The GPU distributes workloads across GPCs for parallelism.",
    specs: [
      ["Contains", "2 TPCs (typical)"],
      ["Raster Engine", "1 per GPC"],
      ["Total per GPU", "7 GPCs (e.g. GA102)"],
      ["ROP Partition", "Shared within GPC"],
    ],
    children: ["tpc"],
  },
  tpc: {
    label: "TPC",
    count: "2 per GPC",
    color: "#22c55e",
    bgColor: "#dcfce7",
    textColor: "#166534",
    borderColor: "#86efac",
    tooltip: "Texture Processing Cluster — pairs of SMs sharing a texture unit",
    analogy: "Block",
    description: "A Texture Processing Cluster pairs two SMs and shares a texture filtering unit between them. The TPC-level grouping allows efficient texture memory access for graphics workloads.",
    specs: [
      ["Contains", "2 SMs"],
      ["Texture Units", "Shared between SMs"],
      ["PolyMorph Engine", "1 per TPC (vertex fetch, tessellation)"],
      ["Total per GPC", "2 TPCs"],
    ],
    children: ["sm"],
  },
  sm: {
    label: "SM",
    count: "2 per TPC",
    color: "#f59e0b",
    bgColor: "#fef3c7",
    textColor: "#92400e",
    borderColor: "#fcd34d",
    tooltip: "Streaming Multiprocessor — the fundamental compute building block",
    analogy: "Building",
    description: "The Streaming Multiprocessor is the fundamental compute building block. Each SM contains its own warp schedulers, register file, CUDA cores, Tensor cores, and L1/shared memory. This is where threads actually execute.",
    specs: [
      ["CUDA Cores", "128 (FP32) per SM (Ampere/Hopper)"],
      ["Tensor Cores", "4 per SM (4th gen)"],
      ["Warp Schedulers", "4 per SM"],
      ["Register File", "64K × 32-bit registers"],
      ["L1 / Shared Mem", "192–256 KB configurable"],
    ],
    children: [],
    zoomable: true,
  },
};

const HIERARCHY_ORDER = ["gpu", "gpc", "tpc", "sm"];

const ANALOGY_TEXT =
  "Think of a GPU as a city, GPCs as districts, TPCs as blocks, and SMs as individual buildings where the actual work happens.";

function HierarchyTree() {
  const [selectedNode, setSelectedNode] = useState(null);
  const [hasAnimated, setHasAnimated] = useState(false);
  const [visibleDepth, setVisibleDepth] = useState(0);
  const [hoveredNode, setHoveredNode] = useState(null);

  /* ── Animate build on first render ── */
  useEffect(() => {
    if (hasAnimated) return;
    const timers = HIERARCHY_ORDER.map((_, i) =>
      setTimeout(() => {
        setVisibleDepth(i + 1);
        if (i === HIERARCHY_ORDER.length - 1) setHasAnimated(true);
      }, 400 + i * 350)
    );
    return () => timers.forEach(clearTimeout);
  }, [hasAnimated]);

  /* ── Determine which ancestors are in the highlight path ── */
  const highlightPath = useMemo(() => {
    if (!selectedNode) return new Set();
    const idx = HIERARCHY_ORDER.indexOf(selectedNode);
    return new Set(HIERARCHY_ORDER.slice(0, idx + 1));
  }, [selectedNode]);

  const handleZoomSM = () => {
    const smSection = document.getElementById("section-sm");
    if (smSection) {
      smSection.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      /* Fallback: try visual 01 clickable SM */
      const clickable = document.querySelector("[data-visual='sm-diagram']");
      if (clickable) clickable.scrollIntoView({ behavior: "smooth" });
    }
  };

  const activeData = selectedNode ? HIERARCHY_NODES[selectedNode] : null;

  return (
    <Card
      title="02 - GPU Hierarchy Tree"
      subtitle="GPU → GPC → TPC → SM — click any node to explore. The tree animates on load."
    >
      <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
        {/* ── LEFT: Interactive tree ── */}
        <div className="rounded-xl border border-[#dbe3ed] bg-[#fbfdff] p-5">
          {/* Analogy banner */}
          <div className="mb-4 flex items-start gap-2 rounded-lg border border-[#bfd3eb] bg-[#edf5ff] px-3 py-2.5">
            <span className="mt-0.5 text-[11px] font-bold text-[#24507a]" style={{ lineHeight: 1 }}>i</span>
            <p className="text-[11px] leading-relaxed text-[#24507a]">{ANALOGY_TEXT}</p>
          </div>

          {/* Tree nodes */}
          {HIERARCHY_ORDER.map((nodeKey, depth) => {
            if (depth >= visibleDepth) return null;
            const node = HIERARCHY_NODES[nodeKey];
            const isHighlighted = highlightPath.has(nodeKey);
            const isSelected = selectedNode === nodeKey;
            const isHovered = hoveredNode === nodeKey;

            return (
              <MotionDiv
                key={nodeKey}
                initial={{ opacity: 0, x: -18 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
              >
                {depth > 0 && (
                  <div
                    className="ml-[18px] h-5 border-l-2 transition-colors duration-300"
                    style={{
                      borderColor: isHighlighted ? node.color : "#dbe3ed",
                      marginLeft: depth * 32 - 14,
                    }}
                  />
                )}
                <div style={{ marginLeft: depth * 32 }} className="relative">
                  {/* Tooltip on hover */}
                  {isHovered && !isSelected && (
                    <div
                      className="absolute -top-9 left-0 z-20 whitespace-nowrap rounded-lg border border-[#d5dfeb] bg-white px-3 py-1.5 text-[10px] font-semibold text-[#3c5a76] shadow-md"
                      style={{ pointerEvents: "none" }}
                    >
                      {node.tooltip}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => setSelectedNode(isSelected ? null : nodeKey)}
                    onMouseEnter={() => setHoveredNode(nodeKey)}
                    onMouseLeave={() => setHoveredNode(null)}
                    className="group flex items-center gap-3 rounded-xl border-2 px-4 py-3 transition-all duration-300"
                    style={{
                      borderColor: isSelected
                        ? node.color
                        : isHighlighted
                        ? `${node.color}88`
                        : "#e2e8f0",
                      background: isSelected
                        ? node.bgColor
                        : isHighlighted
                        ? `${node.bgColor}88`
                        : "#fff",
                      boxShadow: isSelected
                        ? `0 4px 16px ${node.color}22, 0 0 0 3px ${node.color}18`
                        : isHovered
                        ? `0 2px 8px ${node.color}15`
                        : "none",
                      transform: isHovered ? "translateX(4px)" : "none",
                    }}
                  >
                    {/* Color dot */}
                    <div
                      className="h-3 w-3 rounded-full flex-shrink-0 transition-transform duration-300"
                      style={{
                        background: node.color,
                        transform: isSelected ? "scale(1.3)" : "scale(1)",
                        boxShadow: isSelected ? `0 0 8px ${node.color}55` : "none",
                      }}
                    />

                    {/* Label + count */}
                    <div className="text-left">
                      <span
                        className="text-sm font-black uppercase tracking-[0.1em]"
                        style={{ color: node.textColor }}
                      >
                        {node.label}
                      </span>
                      <span className="ml-2 text-[10px] font-semibold text-[#8296a9]">
                        {node.count}
                      </span>
                    </div>

                    {/* Analogy badge */}
                    <span
                      className="ml-auto rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.1em]"
                      style={{
                        background: `${node.color}14`,
                        color: node.color,
                        border: `1px solid ${node.color}30`,
                      }}
                    >
                      {node.analogy}
                    </span>
                  </button>
                </div>
              </MotionDiv>
            );
          })}

          {/* Build progress indicator */}
          {!hasAnimated && (
            <div className="mt-4 flex items-center gap-2 text-[10px] text-[#8296a9]">
              <div className="h-1.5 w-1.5 rounded-full bg-[#3b82f6] animate-pulse" />
              Building hierarchy...
            </div>
          )}
        </div>

        {/* ── RIGHT: Info panel ── */}
        <div className="flex flex-col gap-3">
          {activeData ? (
            <MotionDiv
              key={selectedNode}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="flex-1 rounded-xl border-2 p-4"
              style={{
                borderColor: activeData.borderColor,
                background: `linear-gradient(135deg, ${activeData.bgColor}, #fff)`,
              }}
            >
              {/* Header */}
              <div className="flex items-center gap-2 mb-1">
                <div
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-[11px] font-black text-white"
                  style={{ background: activeData.color }}
                >
                  {activeData.label.charAt(0)}
                </div>
                <div>
                  <h4 className="text-base font-black" style={{ color: activeData.textColor }}>
                    {activeData.label}
                  </h4>
                  <p className="text-[10px] font-semibold text-[#8296a9]">{activeData.count}</p>
                </div>
              </div>

              {/* Description */}
              <p className="mt-3 text-[12px] leading-relaxed text-[#506a84]">{activeData.description}</p>

              {/* Specs table */}
              <div className="mt-4 space-y-1.5">
                <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#8296a9]">Specifications</p>
                {activeData.specs.map(([k, v]) => (
                  <div key={k} className="flex items-start justify-between rounded-lg border border-[#e2eaf3] bg-white/70 px-3 py-2">
                    <span className="text-[11px] font-semibold text-[#6d849b]">{k}</span>
                    <span className="text-[11px] font-bold text-[#1d3f62] text-right max-w-[55%]">{v}</span>
                  </div>
                ))}
              </div>

              {/* Path highlight indicator */}
              <div className="mt-4 flex items-center gap-1">
                <span className="text-[9px] font-bold uppercase tracking-[0.12em] text-[#8296a9]">Path:</span>
                {HIERARCHY_ORDER.slice(0, HIERARCHY_ORDER.indexOf(selectedNode) + 1).map((key, i) => {
                  const n = HIERARCHY_NODES[key];
                  return (
                    <span key={key} className="flex items-center gap-1">
                      {i > 0 && <span className="text-[10px] text-[#b0c0d0]">→</span>}
                      <span
                        className="rounded px-1.5 py-0.5 text-[10px] font-bold"
                        style={{ background: n.bgColor, color: n.textColor }}
                      >
                        {n.label}
                      </span>
                    </span>
                  );
                })}
              </div>

              {/* Zoom to SM link */}
              {activeData.zoomable && (
                <button
                  type="button"
                  onClick={handleZoomSM}
                  className="mt-4 w-full rounded-lg border-2 px-3 py-2.5 text-[11px] font-bold uppercase tracking-[0.12em] transition-all hover:shadow-md"
                  style={{
                    borderColor: activeData.color,
                    color: activeData.textColor,
                    background: activeData.bgColor,
                  }}
                >
                  Zoom Into SM Architecture →
                </button>
              )}
            </MotionDiv>
          ) : (
            <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-[#d5dfeb] bg-[#fbfdff] p-6">
              <div className="text-center">
                <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-[#edf3fb]">
                  <span className="text-base text-[#8da4bb]">?</span>
                </div>
                <p className="text-[12px] font-semibold text-[#6d849b]">Select a node</p>
                <p className="mt-1 text-[10px] text-[#9fb1c3]">Click any node in the tree to see details</p>
              </div>
            </div>
          )}

          {/* Summary counts card */}
          <div className="rounded-xl border border-[#dbe3ed] bg-white p-3">
            <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#8296a9] mb-2">Total Counts (Typical GPU)</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: "GPCs", value: "7", color: "#0ea5e9" },
                { label: "TPCs", value: "14", color: "#22c55e" },
                { label: "SMs", value: "28", color: "#f59e0b" },
                { label: "CUDA Cores", value: "3,584", color: "#3b82f6" },
              ].map((item) => (
                <div key={item.label} className="rounded-lg border border-[#e8eff7] bg-[#f8fbff] px-2.5 py-2 text-center">
                  <p className="text-[15px] font-black" style={{ color: item.color }}>{item.value}</p>
                  <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-[#8da4bb]">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

function CudaTensorRace() {
  const [matrixSize, setMatrixSize] = useState(4); // 2, 4, 8
  const [slowMo, setSlowMo] = useState(false);
  
  const [runId, setRunId] = useState(0);
  const [running, setRunning] = useState(false);
  const [winner, setWinner] = useState("");

  const [cudaOps, setCudaOps] = useState(0);
  const [tensorOps, setTensorOps] = useState(0);

  const totalElements = matrixSize * matrixSize;
  const cudaDuration = slowMo ? (totalElements * 0.4) : (totalElements * 0.15);
  const tensorDuration = slowMo ? 0.8 : 0.3; // Tensor core always does it in 1 chunk (conceptually)

  const speedMultiplier = Math.round(cudaDuration / tensorDuration);

  // Live counters during animation
  useEffect(() => {
    if (!running) return;
    
    // CUDA increments 1 by 1
    const cudaInterval = setInterval(() => {
      setCudaOps(prev => {
        if (prev >= totalElements) {
          clearInterval(cudaInterval);
          return totalElements;
        }
        return prev + 1;
      });
    }, (cudaDuration * 1000) / totalElements);

    // Tensor jumps to 1 operation immediately
    const tensorTimeout = setTimeout(() => {
      setTensorOps(1);
    }, (tensorDuration * 1000) * 0.8); // almost at the end of its fast bar

    return () => {
      clearInterval(cudaInterval);
      clearTimeout(tensorTimeout);
    };
  }, [running, runId, totalElements, cudaDuration, tensorDuration]);

  const startRace = () => {
    setWinner("");
    setCudaOps(0);
    setTensorOps(0);
    setRunning(false);
    setRunId((id) => id + 1);
    setTimeout(() => setRunning(true), 50);
  };

  return (
    <Card
      title="03 - CUDA vs Tensor Core Race"
      subtitle="Watch how scalar processing compares to matrix fusion."
    >
      <div className="space-y-5">
        
        {/* Controls */}
        <div className="flex flex-wrap items-center gap-4 rounded-xl border border-[#dbe3ed] bg-[#fbfdff] p-3">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#6f859d]">Matrix:</span>
            {[2, 4, 8].map(size => (
              <button
                key={size}
                onClick={() => { setMatrixSize(size); setRunning(false); setCudaOps(0); setWinner(""); }}
                className={`rounded border px-2 py-1 text-xs font-bold transition-colors ${
                  matrixSize === size 
                    ? "bg-[#2563eb] text-white border-[#2563eb]" 
                    : "bg-white text-[#4f6882] border-[#dbe3ed] hover:bg-[#f3f7fb]"
                }`}
              >
                {size}x{size}
              </button>
            ))}
          </div>
          
          <div className="h-4 w-px bg-[#dbe3ed]" />
          
          <label className="flex items-center gap-2 cursor-pointer">
            <input 
              type="checkbox" 
              checked={slowMo} 
              onChange={(e) => { setSlowMo(e.target.checked); setRunning(false); setCudaOps(0); setWinner(""); }}
              className="rounded border-[#dbe3ed] text-[#2563eb] focus:ring-[#2563eb]"
            />
            <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#6f859d]">Slow Motion</span>
          </label>

          <button
            type="button"
            onClick={startRace}
            disabled={running && !winner}
            className="ml-auto rounded-lg bg-[#10b981] px-4 py-2 text-[11px] font-black uppercase tracking-[0.14em] text-white transition-opacity disabled:opacity-50 hover:bg-[#059669]"
          >
            Start Race
          </button>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* CUDA Core Side */}
          <div className="rounded-xl border border-[#dbe3ed] bg-[#fbfdff] p-4 relative overflow-hidden">
            <div className="mb-3 flex items-start justify-between">
              <div>
                <h4 className="flex items-center gap-2 text-sm font-black text-[#1d3f62]">
                  <div className="h-2 w-2 rounded-full bg-[#3b82f6]" />
                  CUDA Core
                </h4>
                <p className="text-[10px] uppercase tracking-[0.1em] text-[#6f859d]">Scalar Processing (1 at a time)</p>
              </div>
            </div>

            {/* Visualizer */}
            <div className="mb-4 flex min-h-[160px] py-4 items-center justify-center rounded-lg border border-[#e2e8f0] bg-white">
              <div 
                className="grid gap-[2px]" 
                style={{ 
                  gridTemplateColumns: `repeat(${matrixSize}, minmax(0, 1fr))`,
                  width: matrixSize === 2 ? 40 : matrixSize === 4 ? 80 : 140
                }}
              >
                {Array.from({ length: totalElements }).map((_, i) => (
                  <div 
                    key={i} 
                    className="aspect-square rounded-[2px]"
                    style={{
                      background: i < cudaOps ? "#3b82f6" : "#f1f5f9",
                      border: "1px solid",
                      borderColor: i < cudaOps ? "#2563eb" : "#e2e8f0",
                      transition: "background 0.1s"
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Progress Bar */}
            <RaceBar
              key={`cuda-${runId}`}
              running={running}
              duration={cudaDuration}
              color="bg-[#3b82f6]"
              onDone={() => setWinner(w => w || "CUDA")}
            />
            
            <div className="mt-2 flex justify-between text-[11px] font-bold">
              <span className="text-[#6f859d]">Operations (FP32):</span>
              <span className="text-[#3b82f6]">{cudaOps} / {totalElements}</span>
            </div>
            {running && cudaOps < totalElements && (
              <p className="mt-2 text-center text-[10px] font-bold text-[#64748b] animate-pulse">
                Calculating element {cudaOps + 1}...
              </p>
            )}
          </div>

          {/* Tensor Core Side */}
          <div className="rounded-xl border border-[#fef3c7] bg-[#fffbeb] p-4 relative overflow-hidden">
            <div className="mb-3 flex items-start justify-between">
              <div>
                <h4 className="flex items-center gap-2 text-sm font-black text-[#92400e]">
                  <div className="h-2 w-2 rounded-full bg-[#f59e0b]" />
                  Tensor Core
                </h4>
                <p className="text-[10px] uppercase tracking-[0.1em] text-[#b45309]">Matrix Fusion (All at once)</p>
              </div>
            </div>

            {/* Visualizer */}
            <div className="mb-4 flex min-h-[160px] py-4 items-center justify-center rounded-lg border border-[#fde68a] bg-white">
              <div 
                className="relative grid gap-[2px]" 
                style={{ 
                  gridTemplateColumns: `repeat(${matrixSize}, minmax(0, 1fr))`,
                  width: matrixSize === 2 ? 40 : matrixSize === 4 ? 80 : 140
                }}
              >
                {Array.from({ length: totalElements }).map((_, i) => (
                  <div 
                    key={i} 
                    className="aspect-square rounded-[2px]"
                    style={{
                      background: tensorOps > 0 ? "#fcd34d" : "#f1f5f9",
                      border: "1px solid",
                      borderColor: tensorOps > 0 ? "#f59e0b" : "#e2e8f0",
                      transition: "background 0.2s"
                    }}
                  />
                ))}
                {/* Overlay flash on completion */}
                {tensorOps > 0 && (
                  <MotionDiv 
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: [0, 1, 0], scale: [0.8, 1.2, 1] }}
                    transition={{ duration: 0.5 }}
                    className="absolute inset-0 flex items-center justify-center font-black text-[#d97706] text-xl"
                  >
                    FMA!
                  </MotionDiv>
                )}
              </div>
            </div>

            {/* Progress Bar */}
            <RaceBar
              key={`tensor-${runId}`}
              running={running}
              duration={tensorDuration}
              color="bg-[#f59e0b]"
              onDone={() => setWinner(w => w || "Tensor")}
            />
            
            <div className="mt-2 flex justify-between text-[11px] font-bold">
              <span className="text-[#92400e]">Hardware Instructions:</span>
              <span className="text-[#d97706]">{tensorOps} / 1</span>
            </div>
            {running && tensorOps === 0 && (
              <p className="mt-2 text-center text-[10px] font-bold text-[#b45309] animate-pulse">
                Loading {matrixSize}x{matrixSize} matrix...
              </p>
            )}
          </div>
        </div>

        {/* Results Winner Banner */}
        {winner && (
          <MotionDiv 
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className={`rounded-xl border-2 p-4 text-center ${
              winner === "Tensor" ? "border-[#fcd34d] bg-[#fffbeb]" : "border-[#93c5fd] bg-[#eff6ff]"
            }`}
          >
            <h3 className={`text-lg font-black ${winner === "Tensor" ? "text-[#92400e]" : "text-[#1e3a8a]"}`}>
              {winner} Core Wins!
            </h3>
            {winner === "Tensor" && (
              <p className="mt-1 text-sm text-[#b45309]">
                Tensor Core was approximately <strong>{speedMultiplier}x faster</strong>. <br/>
                It calculates a full matrix block in one fused multiply-add (FMA) hardware instruction, whereas a scalar CUDA core must process each of the {totalElements} elements sequentially.
              </p>
            )}
          </MotionDiv>
        )}
      </div>
    </Card>
  );
}

function RaceBar({ running, duration, color, onDone }) {
  return (
    <div className="h-6 overflow-hidden rounded-full border border-[#d7e2ee] bg-[#f7fbff]">
      <MotionDiv
        className={`h-full ${color}`}
        initial={{ width: "0%" }}
        animate={{ width: running ? "100%" : "0%" }}
        transition={{ duration, ease: "linear" }}
        onAnimationComplete={() => {
          if (running) onDone();
        }}
      />
    </div>
  );
}

/* ── Generation Spec Data with structured values for charts ── */
const GEN_SPECS = [
  {
    key: "tflops",
    label: "FP16 Tensor TFLOPS",
    ampere: { val: 312, display: "312 TFLOPS (A100)" },
    hopper: { val: 989, display: "989 TFLOPS (H100)" },
    unit: "TFLOPS",
    max: 1000
  },
  {
    key: "smem",
    label: "SM Shared Memory",
    ampere: { val: 192, display: "192 KB" },
    hopper: { val: 256, display: "256 KB" },
    unit: "KB",
    max: 300
  },
  {
    key: "mem_bw",
    label: "Memory Bandwidth",
    ampere: { val: 2039, display: "2,039 GB/s" },
    hopper: { val: 3350, display: "3,350 GB/s" },
    unit: "GB/s",
    max: 4000
  },
  {
    key: "l2",
    label: "L2 Cache Size",
    ampere: { val: 40, display: "40 MB" },
    hopper: { val: 50, display: "50 MB" },
    unit: "MB",
    max: 60
  }
];

function GenerationSlider() {
  const [split, setSplit] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  // Auto-slide to 50% on mount to show it's interactive
  useEffect(() => {
    const timer = setTimeout(() => {
      // Simulate smooth CSS-like drag using an interval
      let current = 0;
      const target = 50;
      const steps = 30;
      const interval = setInterval(() => {
        current += (target - current) * 0.15;
        if (Math.abs(target - current) < 0.5) {
          setSplit(target);
          clearInterval(interval);
        } else {
          setSplit(current);
        }
      }, 16);
      return () => clearInterval(interval);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Card
      title="04 - Generation Comparison Slider"
      subtitle="Drag the slider to compare Ampere (Left) vs Hopper (Right) architectures."
    >
      <div className="space-y-4">
        
        {/* Slider Container */}
        <div className="relative h-[420px] overflow-hidden rounded-xl border border-[#dbe3ed] bg-white lg:h-[350px]">
          
          {/* Ampere Base Layer (Always underneath) */}
          <div className="absolute inset-0 bg-[#f8fbff] p-5">
            <div className="mb-4 flex items-center gap-3">
              <h4 className="text-xl font-black text-[#1e3a8a]">Ampere</h4>
              <span className="rounded-full bg-[#dbeafe] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-[#2563eb]">A100 Gen</span>
            </div>
            <SpecChart rows={GEN_SPECS} side="ampere" />
            <div className="mt-4 rounded-lg border border-[#dbe3ed] bg-white p-3 text-xs text-[#4f6882]">
              <strong className="text-[#1d3f62]">TMA:</strong> Not available
            </div>
          </div>

          {/* Hopper Overlay Layer (Clipped by split percentage) */}
          <div 
            className="absolute inset-y-0 right-0 bg-[#fefce8] p-5 shadow-[-10px_0_20px_rgba(0,0,0,0.05)]" 
            style={{ width: `${100 - split}%`, borderLeft: "2px solid #eab308" }}
          >
            {/* The content inside the overlay must be absolute positioned so it stays pinned left as the container shrinks, maintaining identical alignment with the base layer. Actually, it's easier to pin it to right edge. */}
            <div className="absolute inset-y-0 right-0 p-5 w-full max-w-[calc(100vw-32px)] lg:max-w-[calc(1440px-400px)]" style={{ width: "100%", paddingLeft: `calc(${split}% + 20px)` }}>
               <div className="mb-4 flex items-center justify-end gap-3 text-right">
                <span className="rounded-full bg-[#fef08a] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-[#a16207]">H100 Gen</span>
                <h4 className="text-xl font-black text-[#854d0e]">Hopper</h4>
              </div>
              <SpecChart rows={GEN_SPECS} side="hopper" alignRight />
              <div className="mt-4 rounded-lg border border-[#fde047] bg-white p-3 text-xs text-[#713f12] text-right ml-auto">
                <strong className="text-[#854d0e]">TMA (Tensor Memory Accelerator):</strong> Available (Async memory copies)
              </div>
            </div>
          </div>

          {/* Draggable Handle */}
          <div 
            className="pointer-events-none absolute inset-y-0 z-10 flex items-center justify-center cursor-col-resize hover:bg-[rgba(255,255,255,0.1)]" 
            style={{ left: `calc(${split}% - 14px)`, width: 28 }}
          >
            <div className="absolute h-full w-[2px] bg-[#eab308] shadow-[0_0_10px_rgba(234,179,8,0.5)]" />
            <div className="relative flex h-10 w-8 items-center justify-center rounded-lg border-2 border-[#eab308] bg-white shadow-lg pointer-events-auto">
              <div className="flex gap-1">
                <div className="h-4 w-px bg-[#ca8a04]" />
                <div className="h-4 w-px bg-[#ca8a04]" />
              </div>
            </div>
          </div>

          {/* Invisible range input overlaid on top for native interaction */}
          <input
            type="range"
            min={0}
            max={100}
            value={split}
            onMouseDown={() => setIsDragging(true)}
            onMouseUp={() => setIsDragging(false)}
            onTouchStart={() => setIsDragging(true)}
            onTouchEnd={() => setIsDragging(false)}
            onChange={(e) => setSplit(Number(e.target.value))}
            className="absolute inset-0 z-20 h-full w-full cursor-col-resize opacity-0"
            aria-label="Generation comparison slider"
          />
        </div>

        {/* Summary Card */}
        {split > 20 && split < 80 && !isDragging && (
          <MotionDiv 
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-lg border border-[#dbe3ed] bg-[#fbfdff] p-4 text-center text-sm text-[#4f6882]"
          >
            <strong className="text-[#1d3f62]">Key Takeaway:</strong> Hopper dramatically increases <strong className="text-[#15803d]">Tensor Core performance (over 3x)</strong> and <strong className="text-[#15803d]">Memory Bandwidth (over 1.5x)</strong> compared to Ampere, specifically targeting massive LLM training and inference bottlenecks.
          </MotionDiv>
        )}
      </div>
    </Card>
  );
}

function SpecChart({ rows, side, alignRight = false }) {
  return (
    <div className="space-y-4">
      {rows.map((spec) => {
        const val = side === "ampere" ? spec.ampere.val : spec.hopper.val;
        const display = side === "ampere" ? spec.ampere.display : spec.hopper.display;
        const pctWidth = Math.min(100, Math.max(5, (val / spec.max) * 100));
        
        // Calculate improvement
        const improvementRaw = ((spec.hopper.val - spec.ampere.val) / spec.ampere.val) * 100;
        const improvement = Math.round(improvementRaw);
        
        return (
          <div key={spec.key} className={`flex flex-col ${alignRight ? "items-end" : "items-start"}`}>
            <div className="mb-1 flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-[0.1em] text-[#64748b]">
                {spec.label}
              </span>
              {side === "hopper" && improvement > 0 && (
                <span className="rounded bg-[#dcfce7] px-1.5 py-0.5 text-[9px] font-black tracking-wider text-[#16a34a]">
                  +{improvement}%
                </span>
              )}
            </div>
            
            <div className={`flex items-center gap-3 ${alignRight ? "flex-row-reverse" : ""}`}>
              {/* Bar */}
              <div className="h-4 rounded-full bg-white border outline outline-1 outline-offset-[-1px] outline-black/5" style={{ width: 140 }}>
                <div 
                  className={`h-full rounded-full ${side === "ampere" ? "bg-[#93c5fd]" : "bg-[#fde047]"}`}
                  style={{ width: `${pctWidth}%`, float: alignRight ? 'right' : 'left' }}
                />
              </div>
              
              {/* Value Text */}
              <span className={`text-sm font-black ${side === "ampere" ? "text-[#1e3a8a]" : "text-[#854d0e]"}`}>
                {display}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
