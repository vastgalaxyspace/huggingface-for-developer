import Link from "next/link";
import { ArrowRight, LineChart, TriangleAlert } from "lucide-react";

export default function GpuPerformancePage() {
  return (
    <div className="min-h-[calc(100vh-78px)] bg-[#f2f6fb] py-8 md:py-12">
      <div className="shell-container">
        <section className="rounded-[20px] border border-[#d7dfe8] bg-white p-6 shadow-[0_12px_30px_rgba(31,45,61,0.08)] md:p-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#71859b]">Performance / Roofline</p>
          <h1 className="mt-3 text-4xl font-black leading-[0.95] tracking-[-0.02em] text-[#16202b] sm:text-5xl">Roofline Model Analyzer</h1>
          <p className="mt-5 max-w-[760px] text-base leading-8 text-[#536b83]">
            Compare arithmetic intensity against memory and compute roofs to identify if your kernel is memory-bound or compute-bound.
          </p>
        </section>

        <section className="mt-8 grid gap-4 lg:grid-cols-[0.72fr_0.28fr]">
          <div className="border border-[#d7dfe8] bg-white p-5">
            <div className="flex items-center justify-between border-b border-[#e2e8f0] pb-3">
              <p className="text-xs font-black uppercase tracking-[0.14em] text-[#1f3853]">Roofline Plot</p>
              <LineChart className="h-4 w-4 text-[#4e6988]" />
            </div>
            <div className="gpu-grid-light mt-5 h-[420px] rounded border border-[#dbe3ed] bg-[#f9fcff] p-4">
              <div className="relative h-full w-full border border-[#cfe1f1] bg-white/70">
                <div className="absolute left-[10%] top-[88%] h-[2px] w-[44%] rotate-[-56deg] bg-[#35a8ff]" />
                <div className="absolute left-[53%] top-[31%] h-[2px] w-[38%] bg-[#ffb347]" />
                <div className="absolute left-[48%] top-[61%] h-4 w-4 rounded-sm border border-[#59b98f] bg-[#dff6e8]" />
                <p className="absolute left-[52%] top-[58%] text-[10px] font-bold uppercase tracking-[0.12em] text-[#2f5b43]">Kernel</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <aside className="border border-[#d7dfe8] bg-white p-5">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#6f849b]">Arithmetic Intensity</p>
              <p className="mt-2 text-5xl font-black text-[#1a334e]">4.0</p>
              <p className="text-sm text-[#5f758d]">FLOP/B</p>
            </aside>

            <aside className="border border-[#d7dfe8] bg-white p-5">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#6f849b]">Primary Bottleneck</p>
              <p className="mt-3 inline-block border border-[#c9dff0] bg-[#edf7ff] px-3 py-1 text-xs font-black uppercase tracking-[0.14em] text-[#1f5682]">Memory Bound</p>
              <p className="mt-3 text-sm leading-6 text-[#5f758d]">HBM bandwidth saturation is limiting throughput for this kernel.</p>
            </aside>

            <aside className="border border-[#f0c7c8] bg-[#fff5f5] p-5">
              <div className="flex items-center gap-2 text-[#8a2f35]">
                <TriangleAlert className="h-4 w-4" />
                <p className="text-xs font-black uppercase tracking-[0.14em]">Optimization Hint</p>
              </div>
              <p className="mt-3 text-sm leading-6 text-[#7f4247]">Increase data reuse and fuse adjacent kernels to move toward the compute roof.</p>
            </aside>
          </div>
        </section>

        <section className="mt-8 grid gap-4 md:grid-cols-2">
          <Link href="/gpu/execution" className="flex items-center justify-between border border-[#d7dfe8] bg-white px-5 py-4 text-xs font-bold uppercase tracking-[0.14em] text-[#23425f] hover:bg-[#f7faff]">
            Go to Execution
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="/gpu/tools" className="flex items-center justify-between border border-[#d7dfe8] bg-white px-5 py-4 text-xs font-bold uppercase tracking-[0.14em] text-[#23425f] hover:bg-[#f7faff]">
            Go to Tools
            <ArrowRight className="h-4 w-4" />
          </Link>
        </section>
      </div>
    </div>
  );
}
