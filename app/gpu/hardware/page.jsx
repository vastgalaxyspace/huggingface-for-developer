import Link from "next/link";
import { ArrowRight, Cpu, Layers, MemoryStick } from "lucide-react";

export default function GpuHardwarePage() {
  const blocks = [
    { title: "Streaming Multiprocessor", body: "Core execution block where warps are scheduled and tensor pipelines execute." },
    { title: "Tensor Cores", body: "Specialized matrix units for BF16/FP16/FP8 workloads and high-throughput AI kernels." },
    { title: "Memory Hierarchy", body: "Registers, shared memory, L2, and HBM/GDDR bandwidth shape achievable performance." },
  ];

  return (
    <div className="min-h-[calc(100vh-78px)] bg-[#f2f6fb] py-8 md:py-12">
      <div className="shell-container max-w-[1200px]">
        <section className="overflow-hidden rounded-[20px] border border-[#d7dfe8] bg-white shadow-[0_12px_30px_rgba(31,45,61,0.08)]">
          <div className="gpu-grid-light px-6 py-8 md:px-10 md:py-10">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#71859b]">Hardware / Architecture</p>
            <h1 className="mt-3 text-4xl font-black leading-[0.95] tracking-[-0.02em] text-[#16202b] sm:text-5xl lg:text-[58px]">
              Streaming Multiprocessor
            </h1>
            <p className="mt-5 max-w-[760px] text-base leading-8 text-[#536b83]">
              The SM is the main architectural unit in modern GPUs. This page summarizes the key hardware blocks that matter most for AI and inference performance tuning.
            </p>
          </div>
        </section>

        <section className="mt-10 grid gap-4 md:grid-cols-3">
          {blocks.map((item) => (
            <article key={item.title} className="border border-[#d7dfe8] bg-white p-6">
              <h2 className="text-sm font-black uppercase tracking-[0.16em] text-[#1c3148]">{item.title}</h2>
              <p className="mt-3 text-sm leading-6 text-[#5f758d]">{item.body}</p>
            </article>
          ))}
        </section>

        <section className="mt-10 rounded-[20px] border border-[#d7dfe8] bg-white p-6 md:p-8">
          <h2 className="text-lg font-black uppercase tracking-[0.16em] text-[#1e3248]">SM Diagram Snapshot</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-[1.25fr_0.75fr]">
            <div className="border border-[#dbe3ed] bg-[#f8fbff] p-5">
              <div className="grid gap-3 sm:grid-cols-2">
                <Panel title="Warp Schedulers" value="4x" icon={Layers} />
                <Panel title="Dispatch Units" value="8x" icon={Cpu} />
                <Panel title="CUDA Cores" value="128x" icon={Cpu} />
                <Panel title="Tensor Cores" value="4x" icon={MemoryStick} />
              </div>
            </div>
            <div className="border border-[#dbe3ed] bg-[#f8fbff] p-5">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#6f849b]">Related Navigation</p>
              <div className="mt-4 space-y-2">
                <NavLink href="/gpu/execution" label="Go to Execution" />
                <NavLink href="/gpu/performance" label="Go to Performance" />
                <NavLink href="/gpu/tools" label="Go to Tools" />
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function Panel({ title, value, icon }) {
  const IconComponent = icon;
  return (
    <div className="border border-[#dbe3ed] bg-white p-4">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#6f849a]">{title}</p>
        <IconComponent className="h-4 w-4 text-[#4e6988]" />
      </div>
      <p className="mt-4 text-2xl font-black text-[#1a3048]">{value}</p>
    </div>
  );
}

function NavLink({ href, label }) {
  return (
    <Link href={href} className="flex items-center justify-between border border-[#dbe3ed] bg-white px-4 py-3 text-xs font-bold uppercase tracking-[0.14em] text-[#21405f] hover:bg-[#f4f9ff]">
      {label}
      <ArrowRight className="h-3.5 w-3.5" />
    </Link>
  );
}
