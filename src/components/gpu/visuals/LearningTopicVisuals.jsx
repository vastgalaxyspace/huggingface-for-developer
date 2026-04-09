"use client";

import { useEffect, useMemo, useState } from "react";

function VisualCard({ title, subtitle, children }) {
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

function MetricPill({ label, value }) {
  return (
    <div className="rounded-lg border border-[#dbe3ed] bg-[#f8fbff] px-3 py-2">
      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#7d93ab]">{label}</p>
      <p className="mt-1 text-sm font-black text-[#1d3f62]">{value}</p>
    </div>
  );
}

function MemoryLatencyFlow() {
  const levels = [
    { name: "Registers", latency: "1 cycle", color: "bg-[#10b981]" },
    { name: "Shared / L1", latency: "20 cycles", color: "bg-[#3b82f6]" },
    { name: "L2 Cache", latency: "200 cycles", color: "bg-[#f59e0b]" },
    { name: "VRAM", latency: "500+ cycles", color: "bg-[#ef4444]" },
  ];
  const [active, setActive] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setActive((prev) => (prev + 1) % levels.length), 1200);
    return () => clearInterval(timer);
  }, [levels.length]);

  return (
    <VisualCard title="01 - Latency Flow" subtitle="Registers to VRAM latency progression with an animated access pointer.">
      <div className="space-y-3">
        {levels.map((level, index) => (
          <div key={level.name} className="relative">
            <div className="flex items-center justify-between rounded-lg border border-[#dbe3ed] bg-[#fbfdff] px-3 py-2.5">
              <div className="flex items-center gap-2">
                <span className={`h-2.5 w-2.5 rounded-full ${level.color}`} />
                <span className="text-sm font-bold text-[#1d3f62]">{level.name}</span>
              </div>
              <span className="text-xs font-semibold text-[#5f7891]">{level.latency}</span>
            </div>
            {active === index ? (
              <div className="mt-1 text-xs font-semibold text-[#2563eb]">Current access stage</div>
            ) : null}
          </div>
        ))}
      </div>
    </VisualCard>
  );
}

function MemoryPyramid() {
  const rows = [
    { label: "Registers", speed: "Fastest", size: "Tiny", width: "w-[55%]" },
    { label: "Shared / L1", speed: "Very Fast", size: "Small", width: "w-[70%]" },
    { label: "L2 Cache", speed: "Fast", size: "Medium", width: "w-[84%]" },
    { label: "VRAM", speed: "Slower", size: "Large", width: "w-[100%]" },
  ];

  return (
    <VisualCard title="02 - Memory Pyramid" subtitle="Speed drops while capacity grows as you move down the hierarchy.">
      <div className="flex flex-col items-center gap-2">
        {rows.map((row) => (
          <div key={row.label} className={`${row.width} rounded-lg border border-[#dbe3ed] bg-[#f8fbff] px-3 py-2`}>
            <div className="flex items-center justify-between text-sm">
              <span className="font-black text-[#1d3f62]">{row.label}</span>
              <span className="font-semibold text-[#5f7891]">
                {row.speed} / {row.size}
              </span>
            </div>
          </div>
        ))}
      </div>
    </VisualCard>
  );
}

function CoalescingVisualizer() {
  const [stride, setStride] = useState(1);
  const addresses = useMemo(() => Array.from({ length: 32 }, (_, lane) => lane * stride), [stride]);
  const uniqueSegments = useMemo(() => new Set(addresses.map((addr) => Math.floor(addr / 32))).size, [addresses]);
  const efficiency = Math.max(6, Math.round((100 / uniqueSegments) * 100) / 100);

  return (
    <VisualCard title="03 - Coalescing Visualizer" subtitle="Stride controls how many memory segments a warp touches.">
      <div>
        <label className="text-xs font-bold uppercase tracking-[0.12em] text-[#6f859d]">Stride: {stride}</label>
        <input
          type="range"
          min="1"
          max="16"
          value={stride}
          onChange={(e) => setStride(Number(e.target.value))}
          className="mt-2 w-full"
        />
        <div className="mt-3 grid grid-cols-2 gap-2">
          <MetricPill label="Transactions" value={`${uniqueSegments}`} />
          <MetricPill label="Relative Efficiency" value={`${efficiency}%`} />
        </div>
        <div className="mt-3 grid grid-cols-8 gap-1">
          {addresses.map((addr, lane) => (
            <div key={lane} className="rounded border border-[#dbe3ed] bg-[#fbfdff] px-1 py-1 text-center text-[10px] font-semibold text-[#4f6882]">
              {addr}
            </div>
          ))}
        </div>
      </div>
    </VisualCard>
  );
}

function BankConflictDetector() {
  const [stride, setStride] = useState(1);
  const banks = useMemo(() => Array.from({ length: 32 }, (_, lane) => (lane * stride) % 32), [stride]);
  const counts = useMemo(() => banks.reduce((acc, bank) => ({ ...acc, [bank]: (acc[bank] || 0) + 1 }), {}), [banks]);
  const maxConflict = Math.max(...Object.values(counts));

  return (
    <VisualCard title="04 - Bank Conflict Detector" subtitle="Higher stride can map many lanes to the same bank and serialize access.">
      <label className="text-xs font-bold uppercase tracking-[0.12em] text-[#6f859d]">Shared Memory Stride: {stride}</label>
      <input type="range" min="1" max="16" value={stride} onChange={(e) => setStride(Number(e.target.value))} className="mt-2 w-full" />
      <div className="mt-3">
        <MetricPill label="Max Conflict Degree" value={`${maxConflict}x`} />
      </div>
      <div className="mt-3 grid grid-cols-8 gap-1">
        {banks.map((bank, lane) => (
          <div key={lane} className={`rounded border px-1 py-1 text-center text-[10px] font-semibold ${counts[bank] > 1 ? "border-[#fecaca] bg-[#fff1f2] text-[#b91c1c]" : "border-[#dbe3ed] bg-[#fbfdff] text-[#4f6882]"}`}>
            B{bank}
          </div>
        ))}
      </div>
    </VisualCard>
  );
}

function WarpStepper() {
  const [step, setStep] = useState(0);
  const masks = [
    Array.from({ length: 32 }, () => true),
    Array.from({ length: 32 }, (_, i) => i % 2 === 0),
    Array.from({ length: 32 }, (_, i) => i % 4 < 2),
    Array.from({ length: 32 }, () => true),
  ];
  const activeCount = masks[step].filter(Boolean).length;

  return (
    <VisualCard title="01 - Warp Execution Stepper" subtitle="Step through active lane masks as control flow changes.">
      <div className="flex items-center justify-between">
        <MetricPill label="Step" value={`${step + 1} / ${masks.length}`} />
        <MetricPill label="Active Lanes" value={`${activeCount} / 32`} />
      </div>
      <div className="mt-3 grid grid-cols-8 gap-1">
        {masks[step].map((isActive, lane) => (
          <div key={lane} className={`rounded border px-1 py-1 text-center text-[10px] font-bold ${isActive ? "border-[#93c5fd] bg-[#eff6ff] text-[#1d4ed8]" : "border-[#e5e7eb] bg-[#f8fafc] text-[#94a3b8]"}`}>
            {lane}
          </div>
        ))}
      </div>
      <button type="button" onClick={() => setStep((prev) => (prev + 1) % masks.length)} className="mt-3 rounded-lg bg-[#1d4ed8] px-3 py-2 text-xs font-bold uppercase tracking-[0.12em] text-white">
        Next Step
      </button>
    </VisualCard>
  );
}

function DivergenceSimulator() {
  const [threshold, setThreshold] = useState(16);
  const branchA = threshold;
  const branchB = 32 - threshold;
  const utilization = Math.round((Math.max(branchA, branchB) / 32) * 100);

  return (
    <VisualCard title="02 - Divergence Simulator" subtitle="Move branch split and see warp underutilization cost.">
      <label className="text-xs font-bold uppercase tracking-[0.12em] text-[#6f859d]">Threads taking branch A: {threshold}</label>
      <input type="range" min="1" max="31" value={threshold} onChange={(e) => setThreshold(Number(e.target.value))} className="mt-2 w-full" />
      <div className="mt-3 grid grid-cols-3 gap-2">
        <MetricPill label="Branch A" value={`${branchA}`} />
        <MetricPill label="Branch B" value={`${branchB}`} />
        <MetricPill label="Best-pass Utilization" value={`${utilization}%`} />
      </div>
    </VisualCard>
  );
}

function LatencyHidingTimeline() {
  const [warps, setWarps] = useState(8);
  const [latency, setLatency] = useState(400);
  const score = Math.min(100, Math.round((warps * 64) / (latency / 10)));

  return (
    <VisualCard title="03 - Latency Hiding Timeline" subtitle="More eligible warps generally hide memory stalls better.">
      <div className="space-y-3">
        <label className="block text-xs font-bold uppercase tracking-[0.12em] text-[#6f859d]">Active Warps: {warps}</label>
        <input type="range" min="1" max="32" value={warps} onChange={(e) => setWarps(Number(e.target.value))} className="w-full" />
        <label className="block text-xs font-bold uppercase tracking-[0.12em] text-[#6f859d]">Memory Latency (cycles): {latency}</label>
        <input type="range" min="100" max="800" step="50" value={latency} onChange={(e) => setLatency(Number(e.target.value))} className="w-full" />
        <div className="rounded-full border border-[#dbe3ed] bg-[#f1f5f9]">
          <div className="h-3 rounded-full bg-gradient-to-r from-[#2563eb] to-[#10b981]" style={{ width: `${score}%` }} />
        </div>
        <p className="text-xs font-semibold text-[#5f7891]">Estimated stall coverage: {score}%</p>
      </div>
    </VisualCard>
  );
}

function GridBuilder() {
  const [threadsPerBlock, setThreadsPerBlock] = useState(256);
  const [blocks, setBlocks] = useState(80);
  const totalThreads = threadsPerBlock * blocks;
  const totalWarps = Math.ceil(totalThreads / 32);

  return (
    <VisualCard title="04 - Grid Builder" subtitle="Build thread-block-grid shape and inspect warp count instantly.">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-xs font-bold uppercase tracking-[0.12em] text-[#6f859d]">
          Threads / Block: {threadsPerBlock}
          <input type="range" min="32" max="1024" step="32" value={threadsPerBlock} onChange={(e) => setThreadsPerBlock(Number(e.target.value))} className="mt-2 w-full" />
        </label>
        <label className="text-xs font-bold uppercase tracking-[0.12em] text-[#6f859d]">
          Blocks: {blocks}
          <input type="range" min="1" max="256" value={blocks} onChange={(e) => setBlocks(Number(e.target.value))} className="mt-2 w-full" />
        </label>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <MetricPill label="Total Threads" value={`${totalThreads.toLocaleString()}`} />
        <MetricPill label="Total Warps" value={`${totalWarps.toLocaleString()}`} />
      </div>
    </VisualCard>
  );
}

function PipelineWalkthrough() {
  const stages = ["CUDA C++", "PTX", "SASS", "Binary"];
  return (
    <VisualCard title="01 - Pipeline Walkthrough" subtitle="Compilation stages from source to architecture-specific machine code.">
      <div className="flex flex-wrap items-center gap-2">
        {stages.map((stage, index) => (
          <div key={stage} className="flex items-center gap-2">
            <span className="rounded-lg border border-[#dbe3ed] bg-[#f8fbff] px-3 py-2 text-xs font-black uppercase tracking-[0.12em] text-[#1d3f62]">{stage}</span>
            {index < stages.length - 1 ? <span className="text-[#8aa2bb]">{"->"}</span> : null}
          </div>
        ))}
      </div>
    </VisualCard>
  );
}

function PtxSassDiff() {
  return (
    <VisualCard title="02 - PTX vs SASS Diff" subtitle="PTX is virtual ISA; SASS is the real final instruction stream.">
      <div className="grid gap-3 md:grid-cols-2">
        <pre className="rounded-lg border border-[#dbe3ed] bg-[#fbfdff] p-3 text-xs text-[#415d78]">
{`// PTX
ld.global.f32 %f1, [%rd1];
fma.rn.f32 %f2, %f1, %f3, %f4;
st.global.f32 [%rd2], %f2;`}
        </pre>
        <pre className="rounded-lg border border-[#dbe3ed] bg-[#fbfdff] p-3 text-xs text-[#415d78]">
{`// SASS
LDG.E.SYS R4, [R12];
FFMA R6, R4, R8, R10;
STG.E.SYS [R14], R6;`}
        </pre>
      </div>
    </VisualCard>
  );
}

function CapabilityMatrix() {
  const [cc, setCc] = useState("8.0");
  const rows = {
    "7.5": ["Tensor Cores (v2)", "No TMA", "No Warpgroup MMA"],
    "8.0": ["Tensor Cores (v3)", "Async copy", "Structured sparsity support"],
    "9.0": ["Tensor Cores (v4)", "TMA", "Warpgroup MMA"],
  };
  return (
    <VisualCard title="03 - SM Feature Matrix" subtitle="Capabilities differ by compute capability generation.">
      <select value={cc} onChange={(e) => setCc(e.target.value)} className="w-full rounded-lg border border-[#dbe3ed] bg-white px-3 py-2 text-sm text-[#334e68]">
        <option value="7.5">CC 7.5 (Turing)</option>
        <option value="8.0">CC 8.0 (Ampere)</option>
        <option value="9.0">CC 9.0 (Hopper)</option>
      </select>
      <ul className="mt-3 space-y-2">
        {rows[cc].map((item) => (
          <li key={item} className="rounded border border-[#dbe3ed] bg-[#fbfdff] px-3 py-2 text-sm text-[#4f6882]">
            {item}
          </li>
        ))}
      </ul>
    </VisualCard>
  );
}

function KernelLaunchConfigurator() {
  const [gx, setGx] = useState(128);
  const [bx, setBx] = useState(256);
  const totalThreads = gx * bx;

  return (
    <VisualCard title="01 - Kernel Launch Configurator" subtitle="Tune grid/block dimensions and inspect total thread count.">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-xs font-bold uppercase tracking-[0.12em] text-[#6f859d]">
          Grid.x: {gx}
          <input type="range" min="1" max="1024" value={gx} onChange={(e) => setGx(Number(e.target.value))} className="mt-2 w-full" />
        </label>
        <label className="text-xs font-bold uppercase tracking-[0.12em] text-[#6f859d]">
          Block.x: {bx}
          <input type="range" min="32" max="1024" step="32" value={bx} onChange={(e) => setBx(Number(e.target.value))} className="mt-2 w-full" />
        </label>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <MetricPill label="Total Threads" value={`${totalThreads.toLocaleString()}`} />
        <MetricPill label="Warps" value={`${Math.ceil(totalThreads / 32).toLocaleString()}`} />
      </div>
    </VisualCard>
  );
}

function AccessPatternVisualizer() {
  const [stride, setStride] = useState(1);
  const transactions = Math.ceil((32 * stride) / 32);
  return (
    <VisualCard title="02 - Access Pattern Visualizer" subtitle="Contiguous access coalesces better than strided access.">
      <label className="text-xs font-bold uppercase tracking-[0.12em] text-[#6f859d]">Stride: {stride}</label>
      <input type="range" min="1" max="16" value={stride} onChange={(e) => setStride(Number(e.target.value))} className="mt-2 w-full" />
      <div className="mt-3 grid grid-cols-2 gap-2">
        <MetricPill label="Estimated Transactions" value={`${transactions}`} />
        <MetricPill label="Pattern" value={stride === 1 ? "Coalesced" : "Strided"} />
      </div>
    </VisualCard>
  );
}

function TilingAnimation() {
  const [tile, setTile] = useState(16);
  const reuse = Math.round((tile * tile) / (tile + tile));
  return (
    <VisualCard title="03 - Shared Memory Tiling" subtitle="Larger tiles improve data reuse but increase shared memory pressure.">
      <label className="text-xs font-bold uppercase tracking-[0.12em] text-[#6f859d]">Tile Size: {tile} x {tile}</label>
      <input type="range" min="8" max="64" step="8" value={tile} onChange={(e) => setTile(Number(e.target.value))} className="mt-2 w-full" />
      <div className="mt-3 grid grid-cols-2 gap-2">
        <MetricPill label="Reuse Factor" value={`${reuse}x`} />
        <MetricPill label="Shared Footprint" value={`${Math.round((tile * tile * 4) / 1024)} KB`} />
      </div>
    </VisualCard>
  );
}

function StreamOverlapTimeline() {
  const [streams, setStreams] = useState(2);
  const overlap = Math.min(95, 30 + streams * 14);
  return (
    <VisualCard title="04 - Stream Overlap Timeline" subtitle="More independent streams can overlap copy and compute phases.">
      <label className="text-xs font-bold uppercase tracking-[0.12em] text-[#6f859d]">Streams: {streams}</label>
      <input type="range" min="1" max="6" value={streams} onChange={(e) => setStreams(Number(e.target.value))} className="mt-2 w-full" />
      <div className="mt-3 rounded-full border border-[#dbe3ed] bg-[#f1f5f9]">
        <div className="h-3 rounded-full bg-gradient-to-r from-[#0ea5e9] to-[#2563eb]" style={{ width: `${overlap}%` }} />
      </div>
      <p className="mt-2 text-xs font-semibold text-[#5f7891]">Approximate overlap: {overlap}%</p>
    </VisualCard>
  );
}

function DriverLayers() {
  const layers = ["Framework", "CUDA Runtime", "Driver API", "Kernel Driver", "GPU Silicon"];
  return (
    <VisualCard title="01 - Layer Diagram" subtitle="Software layers from high-level framework calls down to hardware execution.">
      <div className="space-y-2">
        {layers.map((layer) => (
          <div key={layer} className="rounded-lg border border-[#dbe3ed] bg-[#fbfdff] px-3 py-2 text-sm font-bold text-[#1d3f62]">
            {layer}
          </div>
        ))}
      </div>
    </VisualCard>
  );
}

function LaunchFlowAnimation() {
  const steps = ["Kernel launch API", "Driver queues work", "Command buffer submit", "SM dispatch", "Completion signal"];
  const [active, setActive] = useState(0);
  return (
    <VisualCard title="02 - Launch Flow Animation" subtitle="Step-by-step kernel launch path through runtime and driver layers.">
      <div className="space-y-2">
        {steps.map((step, index) => (
          <div key={step} className={`rounded-lg border px-3 py-2 text-sm ${active === index ? "border-[#93c5fd] bg-[#eff6ff] text-[#1d4ed8]" : "border-[#dbe3ed] bg-[#fbfdff] text-[#4f6882]"}`}>
            {index + 1}. {step}
          </div>
        ))}
      </div>
      <button type="button" onClick={() => setActive((prev) => (prev + 1) % steps.length)} className="mt-3 rounded-lg bg-[#1d4ed8] px-3 py-2 text-xs font-bold uppercase tracking-[0.12em] text-white">
        Next Stage
      </button>
    </VisualCard>
  );
}

function NvidiaSmiGuide() {
  const [metric, setMetric] = useState("util");
  const explain = {
    util: "GPU-Util can be high even when tensor cores are not saturated.",
    mem: "Memory usage reflects allocations, not always active bandwidth.",
    temp: "Thermal throttling can reduce sustained clocks under load.",
  };
  return (
    <VisualCard title="03 - nvidia-smi Guide" subtitle="Select a metric to see what it really means in practice.">
      <div className="rounded-lg border border-[#dbe3ed] bg-[#0f172a] p-3 font-mono text-xs text-[#dbeafe]">
        GPU 0  A100 40GB  | GPU-Util 82% | Mem 29.1/40.0 GB | Temp 68C
      </div>
      <div className="mt-3 flex gap-2">
        <button type="button" onClick={() => setMetric("util")} className="rounded border border-[#dbe3ed] bg-white px-2.5 py-1.5 text-xs font-bold text-[#355371]">GPU-Util</button>
        <button type="button" onClick={() => setMetric("mem")} className="rounded border border-[#dbe3ed] bg-white px-2.5 py-1.5 text-xs font-bold text-[#355371]">Memory</button>
        <button type="button" onClick={() => setMetric("temp")} className="rounded border border-[#dbe3ed] bg-white px-2.5 py-1.5 text-xs font-bold text-[#355371]">Temp</button>
      </div>
      <p className="mt-3 text-sm text-[#4f6882]">{explain[metric]}</p>
    </VisualCard>
  );
}

function LibraryCallChain() {
  const chain = ["PyTorch", "ATen", "cuBLAS/cuDNN", "CUDA Driver", "GPU Kernel"];
  return (
    <VisualCard title="01 - Library Call Chain" subtitle="Typical framework call flow down to GPU kernel execution.">
      <div className="flex flex-wrap items-center gap-2">
        {chain.map((item, index) => (
          <div key={item} className="flex items-center gap-2">
            <span className="rounded-lg border border-[#dbe3ed] bg-[#f8fbff] px-3 py-2 text-xs font-black uppercase tracking-[0.1em] text-[#1d3f62]">{item}</span>
            {index < chain.length - 1 ? <span className="text-[#8aa2bb]">{"->"}</span> : null}
          </div>
        ))}
      </div>
    </VisualCard>
  );
}

function NsightTimelineReader() {
  const [zoom, setZoom] = useState(1);
  const kernelWidth = 30 * zoom;
  return (
    <VisualCard title="02 - Nsight Timeline Reader" subtitle="Simple timeline view to interpret overlap between kernels and memcpy.">
      <label className="text-xs font-bold uppercase tracking-[0.12em] text-[#6f859d]">Zoom: {zoom}x</label>
      <input type="range" min="1" max="4" value={zoom} onChange={(e) => setZoom(Number(e.target.value))} className="mt-2 w-full" />
      <div className="mt-3 space-y-2">
        <div className="h-6 rounded bg-[#f1f5f9] p-1">
          <div className="h-full rounded bg-[#2563eb]" style={{ width: `${kernelWidth}%` }} />
        </div>
        <div className="h-6 rounded bg-[#f1f5f9] p-1">
          <div className="h-full rounded bg-[#10b981]" style={{ width: `${Math.max(20, 55 - zoom * 5)}%` }} />
        </div>
      </div>
    </VisualCard>
  );
}

function GemmSimulation() {
  const [size, setSize] = useState(1024);
  const naive = Math.round(size / 48);
  const cublas = Math.round(size / 10);
  return (
    <VisualCard title="03 - cuBLAS vs Naive GEMM" subtitle="Larger matrices amplify the benefit of tuned tensor-core kernels.">
      <label className="text-xs font-bold uppercase tracking-[0.12em] text-[#6f859d]">Matrix Size: {size}</label>
      <input type="range" min="256" max="4096" step="256" value={size} onChange={(e) => setSize(Number(e.target.value))} className="mt-2 w-full" />
      <div className="mt-3 space-y-2">
        <div>
          <p className="mb-1 text-xs font-semibold text-[#5f7891]">Naive Kernel</p>
          <div className="h-3 rounded-full bg-[#f1f5f9]">
            <div className="h-full rounded-full bg-[#94a3b8]" style={{ width: `${Math.min(100, naive)}%` }} />
          </div>
        </div>
        <div>
          <p className="mb-1 text-xs font-semibold text-[#5f7891]">cuBLAS</p>
          <div className="h-3 rounded-full bg-[#f1f5f9]">
            <div className="h-full rounded-full bg-[#2563eb]" style={{ width: `${Math.min(100, cublas)}%` }} />
          </div>
        </div>
      </div>
    </VisualCard>
  );
}

function RooflineMap() {
  const points = [
    { op: "LayerNorm", x: 18, y: 30, color: "#f59e0b" },
    { op: "GEMM", x: 72, y: 82, color: "#2563eb" },
    { op: "Softmax", x: 35, y: 42, color: "#10b981" },
  ];
  return (
    <VisualCard title="04 - Roofline Map" subtitle="Operations with low arithmetic intensity are typically memory-bound.">
      <div className="relative h-48 rounded-lg border border-[#dbe3ed] bg-[#fbfdff]">
        {points.map((point) => (
          <div
            key={point.op}
            className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full px-2 py-1 text-[10px] font-bold text-white"
            style={{ left: `${point.x}%`, top: `${100 - point.y}%`, background: point.color }}
          >
            {point.op}
          </div>
        ))}
      </div>
    </VisualCard>
  );
}

const VISUALS_BY_SLUG = {
  "memory-hierarchy": [MemoryLatencyFlow, MemoryPyramid, CoalescingVisualizer, BankConflictDetector],
  "execution-model": [WarpStepper, DivergenceSimulator, LatencyHidingTimeline, GridBuilder],
  "compilation-pipeline": [PipelineWalkthrough, PtxSassDiff, CapabilityMatrix],
  "cuda-programming": [KernelLaunchConfigurator, AccessPatternVisualizer, TilingAnimation, StreamOverlapTimeline],
  "driver-stack": [DriverLayers, LaunchFlowAnimation, NvidiaSmiGuide],
  "libraries-frameworks": [LibraryCallChain, NsightTimelineReader, GemmSimulation, RooflineMap],
};

export default function LearningTopicVisuals({ slug, selectedIndex }) {
  const visuals = VISUALS_BY_SLUG[slug];
  if (!visuals || visuals.length === 0) {
    return null;
  }

  const safeIndex = Math.min(Math.max(selectedIndex, 0), visuals.length - 1);
  const VisualComponent = visuals[safeIndex];

  return <VisualComponent />;
}
