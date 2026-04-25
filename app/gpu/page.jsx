import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ChartNoAxesCombined, Cpu, GitBranch, Gauge, Layers, MemoryStick, Wrench } from "lucide-react";
import { pageMetadata } from "../../src/lib/seo";

export const metadata = pageMetadata({
  title: "GPU Hub for AI Inference and Performance",
  description:
    "Learn GPU architecture, explore practical AI hardware tools, and connect model choices to VRAM, throughput, and deployment fit.",
  path: "/gpu",
  keywords: ["GPU hub", "AI GPU guide", "VRAM tools", "GPU performance for AI"],
});

export default function GpuPage() {
  const learningPath = [
    {
      id: "01",
      title: "Physical Hardware",
      subtitle: "Physical hardware foundations: SMs, cores, memory buses, and board design.",
      href: "/gpu/learning/physical-hardware",
    },
    {
      id: "02",
      title: "Memory Hierarchy",
      subtitle: "Registers, shared memory, L2, VRAM, and how data moves across tiers.",
      href: "/gpu/learning/memory-hierarchy",
    },
    {
      id: "03",
      title: "Execution Model",
      subtitle: "Warps, blocks, grids, scheduling behavior, and runtime execution flow.",
      href: "/gpu/learning/execution-model",
    },
    {
      id: "04",
      title: "Compilation Pipeline",
      subtitle: "From CUDA source to PTX, SASS, and final kernel binaries.",
      href: "/gpu/learning/compilation-pipeline",
    },
    {
      id: "05",
      title: "CUDA Programming",
      subtitle: "Kernel design, memory access patterns, synchronization, and tuning.",
      href: "/gpu/learning/cuda-programming",
    },
    {
      id: "06",
      title: "Driver Stack",
      subtitle: "CUDA driver/runtime interactions, scheduling layers, and device control.",
      href: "/gpu/learning/driver-stack",
    },
    {
      id: "07",
      title: "Libraries & Frameworks",
      subtitle: "CUDA libraries and ML frameworks that map workloads onto GPU kernels.",
      href: "/gpu/learning/libraries-frameworks",
    },
  ];

  const precisionTools = [
    {
      icon: MemoryStick,
      name: "VRAM Calculator",
      body: "Estimate memory footprint by parameters, precision, sequence length, and mode.",
      cta: "Open VRAM Tool",
      href: "/gpu/tools/vram-calculator",
    },
    {
      icon: Gauge,
      name: "Kernel Occupancy Estimator",
      body: "Model active warps and identify register/shared-memory pressure quickly.",
      cta: "Open Occupancy Tool",
      href: "/gpu/tools/kernel-occupancy-estimator",
    },
    {
      icon: Wrench,
      name: "GPU Picker",
      body: "Shortlist GPU options for training, fine-tune, and high-throughput inference.",
      cta: "Open GPU Picker",
      href: "/gpu/tools/gpu-picker",
    },
    {
      icon: GitBranch,
      name: "Warp Divergence Visualizer",
      body: "See how branch conditions split a warp into active and waiting execution passes.",
      cta: "Open Divergence Tool",
      href: "/gpu/tools/warp-divergence",
    },
    {
      icon: ChartNoAxesCombined,
      name: "Roofline Model Analyzer",
      body: "Plot kernels against memory and compute ceilings to see the real bottleneck fast.",
      cta: "Open Roofline Tool",
      href: "/gpu/tools/roofline-model-analyzer",
    },
  ];

  const gpuIndex = [
    { gpu: "NVIDIA H100 SXM5", arch: "Hopper", vram: "80GB HBM3", fp16: "1,979", memBW: "3.3 TB/s", compute: "9.0", useFor: "Large-scale training" },
    { gpu: "NVIDIA A100 SXM4", arch: "Ampere", vram: "80GB HBM2e", fp16: "312", memBW: "2.0 TB/s", compute: "8.0", useFor: "General DL workloads" },
    { gpu: "RTX 4090", arch: "Ada Lovelace", vram: "24GB GDDR6X", fp16: "82.6", memBW: "1.0 TB/s", compute: "8.9", useFor: "Local inference" },
    { gpu: "L40S", arch: "Ada Lovelace", vram: "48GB GDDR6", fp16: "183", memBW: "0.8 TB/s", compute: "8.9", useFor: "Multi-model serving" },
  ];

  return (
    <div className="min-h-[calc(100vh-78px)] bg-[#f2f6fb] py-6 md:py-12">
      <div className="shell-container">
        <section className="overflow-hidden rounded-[22px] border border-[#d7e0ea] bg-white shadow-[0_12px_30px_rgba(31,45,61,0.08)]">
          <div className="border-b border-[#d7e0ea] bg-[#f8fbff] px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#6f8298] sm:px-6 sm:text-[11px] sm:tracking-[0.22em]">
            Main GPU Hub / Hardware + Execution + Performance + Tools
          </div>

          <div className="gpu-grid-light grid gap-8 px-4 py-6 md:grid-cols-[1.12fr_0.88fr] md:px-10 md:py-10">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#4e647b]">For AI Developers</p>
              <h1 className="mt-3 max-w-[680px] text-3xl font-black leading-[0.95] tracking-[-0.02em] text-[#132336] sm:text-5xl lg:text-[62px]">
                GPU HUB
                <br />
                START HERE
              </h1>
              <p className="mt-5 max-w-[620px] text-sm leading-6 text-[#5a6d83]">
                This is your main GPU page. From here you can jump into architecture,
                execution internals, performance analysis, and practical GPU tools.
                The UI is intentionally clean white while keeping the technical style.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link href="/gpu/learning/physical-hardware" className="inline-flex items-center gap-2 bg-[#18324f] px-4 py-2.5 text-xs font-bold uppercase tracking-[0.18em] text-white transition-colors hover:bg-[#11253b]">
                  Start Learning <ArrowRight className="h-3.5 w-3.5" />
                </Link>
                <Link href="/gpu/tools/gpu-picker" className="border border-[#d2dae5] bg-white px-4 py-2.5 text-xs font-bold uppercase tracking-[0.18em] text-[#2a3b50] transition-colors hover:bg-[#f4f7fb]">
                  Open GPU Tools
                </Link>
              </div>
            </div>

            <div className="relative min-h-[220px] overflow-hidden rounded-[14px] border border-[#dde4ec] bg-[linear-gradient(130deg,#fbfdff_0%,#f2f6fb_45%,#e9f1f9_100%)]">
              <Image
                src="/images/gpu-hub-hero.svg"
                alt="GPU board illustration for GPU Hub"
                fill
                priority
                className="object-cover"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 divide-y divide-[#d7dfe8] border-t border-[#d7dfe8] bg-white sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            <Metric label="Learning Tracks" value="7 sections" />
            <Metric label="Interactive Tools" value="15+ tools" />
            <Metric label="Supported GPUs" value="50+ GPUs" />
          </div>
        </section>

        <section className="mt-10 rounded-[20px] border border-[#d7dfe8] bg-[#f8fafc] p-6 md:p-8">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-2xl font-extrabold tracking-[-0.01em] text-[#1a2635]">
              GPU LEARNING PATH
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {learningPath.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className="group relative min-h-[220px] overflow-hidden rounded-[22px] border border-[#d9e1ea] bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] p-6 shadow-[0_10px_24px_rgba(45,67,92,0.06)] transition-all duration-200 hover:-translate-y-1 hover:border-[#bfd0e2] hover:shadow-[0_18px_36px_rgba(31,45,61,0.1)]"
              >
                <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-[radial-gradient(circle,#e8f1fb_0%,rgba(232,241,251,0)_72%)]" />
                <div className="inline-flex rounded-full border border-[#d7e6f5] bg-[#eef5fc] px-3 py-1 text-sm font-black tracking-tight text-[#365784]">
                  {item.id}
                </div>
                <h3 className="mt-5 text-lg font-black leading-snug tracking-[-0.02em] text-[var(--text-strong)]">
                  {item.title}
                </h3>
                <p className="mt-3 text-[15px] leading-7 text-[#698096]">{item.subtitle}</p>
                <span className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-[#143458] transition-transform group-hover:translate-x-0.5">
                  Explore <ArrowRight className="h-3 w-3" />
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-10 grid gap-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
          <article className="rounded-[20px] border border-[#d7dfe8] bg-white p-6 shadow-[0_10px_24px_rgba(45,67,92,0.05)]">
            <h2 className="text-2xl font-extrabold tracking-[-0.01em] text-[#1a2635]">How to use this hub</h2>
            <ol className="mt-4 space-y-3 text-sm leading-7 text-[#5a6d83]">
              <li>1. Learn the hardware and memory basics if you are still building intuition.</li>
              <li>2. Use the VRAM and GPU tools once you have a model or workload in mind.</li>
              <li>3. Validate performance bottlenecks with the roofline and occupancy tools when tuning kernels or inference.</li>
              <li>4. Move between learning pages and tools instead of treating them as separate tracks.</li>
            </ol>
          </article>

          <article className="rounded-[20px] border border-[#d7dfe8] bg-white p-6 shadow-[0_10px_24px_rgba(45,67,92,0.05)]">
            <h2 className="text-2xl font-extrabold tracking-[-0.01em] text-[#1a2635]">Why this matters for AI teams</h2>
            <div className="mt-4 space-y-3 text-sm leading-7 text-[#5a6d83]">
              <p>
                Model choice without hardware understanding leads to expensive mistakes. This hub exists to connect
                architecture concepts with the decisions teams actually make around VRAM, latency, throughput, and cost.
              </p>
              <p>
                The goal is not to memorize GPU theory. It is to make better deployment calls with less guesswork.
              </p>
            </div>
          </article>
        </section>

        <section className="mt-10 rounded-[20px] border border-[#d7dfe8] bg-white p-6 md:p-8">
          <h2 className="mb-6 text-2xl font-extrabold tracking-[-0.01em] text-[#1b2737]">PRECISION TOOLS</h2>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            {precisionTools.map((tool) => (
              <Link
                key={tool.name}
                href={tool.href}
                className="group block rounded-[22px] border border-[#dde4ec] bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] p-6 shadow-[0_10px_24px_rgba(45,67,92,0.05)] transition-all duration-200 hover:-translate-y-1 hover:border-[#bfd0e2] hover:bg-[#f7faff] hover:shadow-[0_18px_36px_rgba(31,45,61,0.08)]"
              >
                <div className="mb-6 flex items-center justify-between text-[#62768f]">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#edf4fb] text-[#365784]">
                    <tool.icon className="h-5 w-5" />
                  </div>
                  <span className="rounded-full bg-[#f3f7fb] px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-[#6c8197]">
                    Tool
                  </span>
                </div>
                <h3 className="text-lg font-black leading-snug tracking-[-0.02em] text-[var(--text-strong)]">
                  {tool.name}
                </h3>
                <p className="mt-3 text-[15px] leading-7 text-[#687f95]">{tool.body}</p>
                <span className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-[#1f3a59] transition-transform group-hover:translate-x-0.5 group-hover:text-[#15395c]">
                  {tool.cta}
                  <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section className="editorial-panel overflow-hidden rounded-[20px]">
          <h2 className="border-b border-[var(--border-soft)] px-5 py-4 text-2xl font-black tracking-tight text-[var(--text-strong)] sm:px-6 sm:py-5 sm:text-3xl md:px-8">
            HARDWARE INDEX
          </h2>
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[980px] text-left">
              <thead className="bg-[var(--panel-muted)] text-[10px] uppercase tracking-[0.16em] text-[var(--text-muted)]">
                <tr>
                  <th className="px-6 py-4 md:px-8">GPU</th>
                  <th className="px-4 py-4">Arch</th>
                  <th className="px-4 py-4">VRAM</th>
                  <th className="px-4 py-4">FP16 TFLOP</th>
                  <th className="px-4 py-4">Mem BW</th>
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
                    <td className="px-4 py-4">{row.fp16}</td>
                    <td className="px-4 py-4">{row.memBW}</td>
                    <td className="px-4 py-4">{row.compute}</td>
                    <td className="px-4 py-4 text-[var(--text-muted)]">{row.useFor}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-4 p-4 md:hidden">
            {gpuIndex.map((row) => (
              <div key={row.gpu} className="rounded-[20px] border border-[#d7dfe8] bg-white p-4">
                <h3 className="text-base font-black tracking-tight text-[#132336]">{row.gpu}</h3>
                <p className="mt-1 text-sm text-[#5a6d83]">{row.useFor}</p>
                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <InfoItem label="Arch" value={row.arch} />
                  <InfoItem label="VRAM" value={row.vram} />
                  <InfoItem label="FP16" value={row.fp16} />
                  <InfoItem label="Mem BW" value={row.memBW} />
                  <InfoItem label="Compute" value={row.compute} />
                  <InfoItem label="Best For" value={row.useFor} />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-10 grid gap-4 md:grid-cols-4">
          <QuickLink icon={Layers} title="Hardware" href="/gpu/hardware" />
          <QuickLink icon={Gauge} title="Execution" href="/gpu/execution" />
          <QuickLink icon={Cpu} title="Performance" href="/gpu/performance" />
          <QuickLink icon={Wrench} title="Tools" href="/gpu/tools/gpu-picker" />
        </section>

        <section className="mt-10 grid gap-5 md:grid-cols-3">
          <article className="rounded-[20px] border border-[#d7dfe8] bg-white p-6 shadow-[0_10px_24px_rgba(45,67,92,0.05)]">
            <h2 className="text-lg font-black tracking-tight text-[#132336]">Start here if you are new</h2>
            <p className="mt-3 text-sm leading-7 text-[#5a6d83]">
              Follow Physical Hardware, Memory Hierarchy, then Execution Model before jumping into tuning tools. That
              sequence makes the later pages much easier to interpret.
            </p>
          </article>
          <article className="rounded-[20px] border border-[#d7dfe8] bg-white p-6 shadow-[0_10px_24px_rgba(45,67,92,0.05)]">
            <h2 className="text-lg font-black tracking-tight text-[#132336]">Start here if you already deploy models</h2>
            <p className="mt-3 text-sm leading-7 text-[#5a6d83]">
              Open the VRAM calculator and GPU picker first, then use the learning pages only where you need more
              explanation about bottlenecks or architecture tradeoffs.
            </p>
          </article>
          <article className="rounded-[20px] border border-[#d7dfe8] bg-white p-6 shadow-[0_10px_24px_rgba(45,67,92,0.05)]">
            <h2 className="text-lg font-black tracking-tight text-[#132336]">Related decision guides</h2>
            <p className="mt-3 text-sm leading-7 text-[#5a6d83]">
              Pair this hub with{' '}
              <Link href="/guides/choose-ai-model-by-gpu-budget" className="font-semibold text-[#143458] hover:text-[#102d48]">
                the GPU and budget framework
              </Link>{' '}
              and{' '}
              <Link href="/guides/best-models-low-vram" className="font-semibold text-[#143458] hover:text-[#102d48]">
                low-VRAM model planning
              </Link>{' '}
              for end-to-end hardware decisions.
            </p>
          </article>
        </section>
      </div>
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div className="py-2 text-center sm:px-4">
      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[var(--text-faint)]">
        {label}
      </p>
      <p className="mt-1 text-[28px] font-black tracking-tight text-[var(--accent)]">{value}</p>
    </div>
  );
}

function InfoItem({ label, value }) {
  return (
    <div>
      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#7b90a6]">{label}</p>
      <p className="mt-1 text-sm font-semibold text-[#20364f]">{value}</p>
    </div>
  );
}

function QuickLink({ icon, title, href }) {
  const IconComponent = icon;
  return (
    <Link
      href={href}
      className="flex items-center justify-between border border-[#d7dfe8] bg-white px-5 py-4 transition-colors hover:bg-[#f7faff]"
    >
      <span className="flex items-center gap-3 text-sm font-bold uppercase tracking-[0.14em] text-[#20364f]">
        <IconComponent className="h-4 w-4" />
        {title}
      </span>
      <ArrowRight className="h-4 w-4 text-[#4d667f]" />
    </Link>
  );
}
