"use client";
import {
  ArrowRight,
  BookOpen,
  Calculator,
  Eye,
  Grid2X2,
  MonitorCog,
  ScanSearch,
  SquareTerminal,
} from "lucide-react";

export default function GpuPage() {
  const learningPath = [
    {
      id: "01",
      title: "Physical Hardware",
      subtitle: "SM cores, tensor units and ray-tracing lanes.",
    },
    {
      id: "02",
      title: "Memory Hierarchy",
      subtitle: "L1, cache, shared memory and HBM handling.",
    },
    {
      id: "03",
      title: "Execution Model",
      subtitle: "Warps, threads, blocks and scheduling rules.",
    },
    {
      id: "04",
      title: "Compilation Flow",
      subtitle: "PTX assembly, SASS and runtime pipeline.",
    },
    {
      id: "05",
      title: "CUDA Programming",
      subtitle: "Kernels, memory transfer and launch configuration.",
    },
    {
      id: "06",
      title: "Driver Stack",
      subtitle: "Runtime, kernel driver and platform compatibility.",
    },
    {
      id: "07",
      title: "Libraries & Frameworks",
      subtitle: "cuBLAS, cuDNN, TensorRT and high-level bindings.",
    },
  ];

  const precisionTools = [
    {
      icon: Calculator,
      name: "Memory Bandwidth Calc",
      body: "Compute theoretical bandwidth across different HBM and GDDR stacks.",
      tag: "Calculator",
      action: "GB/s",
    },
    {
      icon: Eye,
      name: "Warp Scheduler Sim",
      body: "Visualize warp issue stalls and latency under different kernels.",
      tag: "Visual",
      action: "Timeline",
    },
    {
      icon: BookOpen,
      name: "Opcode Dictionary",
      body: "Search opcode semantics and cycle latency references.",
      tag: "Lookup",
      action: "Docs Ref",
    },
    {
      icon: Grid2X2,
      name: "Tensor Core Visualizer",
      body: "Interactive matrix layout to inspect tensor path utilization.",
      tag: "Visual",
      action: "ML Layout",
    },
    {
      icon: ScanSearch,
      name: "Occupancy Solver",
      body: "Estimate occupancy from registers, shared memory and block size.",
      tag: "Calculator",
      action: "Percent %",
    },
    {
      icon: SquareTerminal,
      name: "PTX Playground",
      body: "Write PTX inline and preview expected SASS-like mappings.",
      tag: "Lookup",
      action: "SASS ASM",
    },
  ];

  const gpuIndex = [
    {
      gpu: "H100 SXM5",
      arch: "Hopper",
      vram: "80GB HBM3",
      fp16: "1,979",
      memBw: "3.3 TB/s",
      tdp: "700W",
      compute: "9.0",
      bestFor: "LLM Training",
    },
    {
      gpu: "A100 SXM4",
      arch: "Ampere",
      vram: "80GB HBM2e",
      fp16: "312",
      memBw: "2.0 TB/s",
      tdp: "400W",
      compute: "8.0",
      bestFor: "General DL",
    },
    {
      gpu: "RTX 4090",
      arch: "Ada Lovelace",
      vram: "24GB GDDR6X",
      fp16: "82.6",
      memBw: "1.0 TB/s",
      tdp: "450W",
      compute: "8.9",
      bestFor: "Inference",
    },
    {
      gpu: "L40S",
      arch: "Ada Lovelace",
      vram: "48GB GDDR6",
      fp16: "183",
      memBw: "0.8 TB/s",
      tdp: "350W",
      compute: "8.9",
      bestFor: "Multi-model",
    },
    {
      gpu: "V100 SXM2",
      arch: "Volta",
      vram: "32GB HBM2",
      fp16: "125",
      memBw: "0.9 TB/s",
      tdp: "300W",
      compute: "7.0",
      bestFor: "Legacy HPC",
    },
  ];

  return (
    <div className="min-h-[calc(100vh-78px)] py-10 md:py-12">
      <div className="shell-container max-w-[1240px] space-y-10">
        <section className="editorial-panel soft-grid overflow-hidden rounded-[20px] border border-[var(--border-soft)] bg-[var(--panel-strong)] p-6 md:p-8 lg:p-10">
          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div>
              <p className="mb-5 inline-flex border border-[var(--accent)] bg-[var(--accent-soft)] px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-[var(--accent)]">
                For AI Developers
              </p>
              <h1 className="text-4xl font-black leading-[0.95] tracking-[-0.02em] text-[var(--text-strong)] sm:text-5xl lg:text-[72px]">
                UNDERSTAND THE <span className="text-[var(--accent)]">GPU</span>
                <br />
                COMPLETELY
              </h1>
              <p className="mt-4 text-sm font-semibold uppercase tracking-[0.12em] text-[var(--accent)]">
                Hardware to execution to performance to optimization
              </p>
              <p className="mt-5 max-w-[680px] text-base leading-7 text-[var(--text-muted)]">
                A comprehensive technical reference and toolset for low-level GPU
                programming. From transistor-level logic to CUDA kernel optimization,
                this hub gives a practical path for LLM workloads.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <button className="inline-flex items-center gap-2 bg-[var(--accent)] px-5 py-3 text-xs font-black uppercase tracking-[0.16em] text-white transition-colors hover:bg-[var(--accent-strong)]">
                  Start Learning <ArrowRight className="h-3.5 w-3.5" />
                </button>
                <button className="border border-[var(--accent)] bg-white px-5 py-3 text-xs font-black uppercase tracking-[0.16em] text-[var(--accent)] transition-colors hover:bg-[var(--accent-soft)]">
                  Open Tools
                </button>
              </div>
            </div>

            <div className="relative min-h-[220px] overflow-hidden rounded-2xl border border-[var(--border-soft)] bg-[linear-gradient(145deg,#f8fbff_0%,#edf3f9_100%)]">
              <div className="absolute -right-10 top-6 h-44 w-44 rounded-full border border-[var(--border-soft)]" />
              <div className="absolute left-7 top-10 h-12 w-52 rounded-md border border-[var(--border-soft)] bg-white/60" />
              <div className="absolute bottom-8 left-9 h-16 w-64 rounded-md border border-[var(--border-soft)] bg-white/70" />
              <MonitorCog className="absolute right-8 top-1/2 h-24 w-24 -translate-y-1/2 text-[var(--text-faint)]" />
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-2 border-t border-[var(--border-soft)] pt-6 sm:grid-cols-3 sm:gap-0 sm:divide-x sm:divide-[var(--border-soft)]">
            <Stat title="Architecture" value="7 layers" />
            <Stat title="Toolchain" value="15+ tools" />
            <Stat title="Hardware" value="50+ GPUs" />
          </div>
        </section>

        <section className="editorial-panel rounded-[20px] p-6 md:p-8">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-black tracking-tight text-[var(--text-strong)]">
                LEARNING PATH
              </h2>
              <p className="mt-1 text-xs font-bold uppercase tracking-[0.14em] text-[var(--text-faint)]">
                Mastery sequence 0.1 to 0.7
              </p>
            </div>
            <div className="flex gap-2">
              <button className="h-9 w-9 border border-[var(--border-soft)] bg-white text-[var(--text-muted)]">
                {"<"}
              </button>
              <button className="h-9 w-9 border border-[var(--border-soft)] bg-white text-[var(--text-muted)]">
                {">"}
              </button>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {learningPath.map((item) => (
              <article
                key={item.id}
                className="border border-[var(--border-soft)] bg-[var(--panel-strong)] p-5"
              >
                <p className="text-[36px] font-black leading-none text-[var(--panel-muted)]">
                  {item.id}
                </p>
                <h3 className="mt-4 text-xs font-black uppercase tracking-[0.13em] text-[var(--text-strong)]">
                  {item.title}
                </h3>
                <p className="mt-2 text-xs leading-5 text-[var(--text-muted)]">{item.subtitle}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="editorial-panel rounded-[20px] p-6 md:p-8">
          <h2 className="mb-6 text-3xl font-black tracking-tight text-[var(--text-strong)]">
            PRECISION TOOLS
          </h2>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {precisionTools.map((tool) => (
              <article
                key={tool.name}
                className="border border-[var(--border-soft)] bg-[var(--panel-strong)] p-5"
              >
                <div className="mb-5 flex items-center justify-between">
                  <tool.icon className="h-4 w-4 text-[var(--accent)]" />
                  <span className="bg-[var(--accent-soft)] px-2 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-[var(--accent)]">
                    {tool.tag}
                  </span>
                </div>
                <h3 className="text-xs font-black uppercase tracking-[0.13em] text-[var(--text-strong)]">
                  {tool.name}
                </h3>
                <p className="mt-3 text-xs leading-5 text-[var(--text-muted)]">{tool.body}</p>
                <div className="mt-5 flex items-center justify-between border border-[var(--border-soft)] bg-white px-3 py-2 text-[10px] font-black uppercase tracking-[0.1em] text-[var(--text-main)]">
                  <span>Open</span>
                  <span className="text-[var(--accent)]">{tool.action}</span>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="editorial-panel overflow-hidden rounded-[20px]">
          <h2 className="border-b border-[var(--border-soft)] px-6 py-5 text-3xl font-black tracking-tight text-[var(--text-strong)] md:px-8">
            HARDWARE INDEX
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-left">
              <thead className="bg-[var(--panel-muted)] text-[10px] uppercase tracking-[0.16em] text-[var(--text-muted)]">
                <tr>
                  <th className="px-6 py-4 md:px-8">GPU</th>
                  <th className="px-4 py-4">Arch</th>
                  <th className="px-4 py-4">VRAM</th>
                  <th className="px-4 py-4">FP16 TFLOP</th>
                  <th className="px-4 py-4">Mem BW</th>
                  <th className="px-4 py-4">TDP</th>
                  <th className="px-4 py-4">Compute</th>
                  <th className="px-4 py-4">Best For</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-soft)] text-[13px] text-[var(--text-main)]">
                {gpuIndex.map((row) => (
                  <tr key={row.gpu} className="bg-white hover:bg-[var(--panel-muted)]/60">
                    <td className="px-6 py-4 font-bold text-[var(--text-strong)] md:px-8">{row.gpu}</td>
                    <td className="px-4 py-4">{row.arch}</td>
                    <td className="px-4 py-4">{row.vram}</td>
                    <td className="px-4 py-4 font-bold text-[var(--accent)]">{row.fp16}</td>
                    <td className="px-4 py-4">{row.memBw}</td>
                    <td className="px-4 py-4">{row.tdp}</td>
                    <td className="px-4 py-4">{row.compute}</td>
                    <td className="px-4 py-4 text-[var(--text-muted)]">{row.bestFor}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}

function Stat({ title, value }) {
  return (
    <div className="py-2 text-center sm:px-4">
      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[var(--text-faint)]">
        {title}
      </p>
      <p className="mt-1 text-[28px] font-black tracking-tight text-[var(--accent)]">{value}</p>
    </div>
  );
}
