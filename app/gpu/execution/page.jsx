import Link from "next/link";
import { ArrowRight, BarChart3, GitBranch, Play } from "lucide-react";

export default function GpuExecutionPage() {
  const warpGrid = Array.from({ length: 32 }, (_, index) => index.toString().padStart(2, "0"));

  return (
    <div className="min-h-[calc(100vh-78px)] bg-[#f2f6fb] py-8 md:py-12">
      <div className="shell-container">
        <section className="rounded-[20px] border border-[#d7dfe8] bg-white p-6 shadow-[0_12px_30px_rgba(31,45,61,0.08)] md:p-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#71859b]">Execution / Warp Behavior</p>
          <h1 className="mt-3 text-4xl font-black leading-[0.95] tracking-[-0.02em] text-[#16202b] sm:text-5xl">Warp Divergence</h1>
          <p className="mt-5 max-w-[760px] text-base leading-8 text-[#536b83]">
            Divergent branches force a warp to serialize paths. Understanding active, waiting, and inactive lanes helps explain kernel inefficiencies.
          </p>
        </section>

        <section className="mt-8 grid gap-4 lg:grid-cols-[0.36fr_0.64fr]">
          <aside className="border border-[#d7dfe8] bg-white p-5">
            <h2 className="text-xs font-black uppercase tracking-[0.14em] text-[#243b53]">Kernel Conditional</h2>
            <div className="mt-4 border border-[#dbe3ed] bg-[#f7fbff] p-4 font-mono text-sm text-[#1f3f61]">
              if (threadIdx.x % 3 == 0)
            </div>
            <button className="mt-4 flex w-full items-center justify-center gap-2 bg-[#163453] px-4 py-2.5 text-xs font-bold uppercase tracking-[0.15em] text-white">
              <Play className="h-3.5 w-3.5" /> Evaluate Path
            </button>

            <div className="mt-8 border border-[#dbe3ed] bg-[#f8fbff] p-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#6f849b]">Execution Metrics</p>
              <p className="mt-3 text-sm text-[#5f758d]">Efficiency Ratio</p>
              <p className="text-3xl font-black text-[#17395a]">33.3%</p>
            </div>
          </aside>

          <div className="border border-[#d7dfe8] bg-white p-5">
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">
              {warpGrid.map((item, idx) => (
                <div
                  key={item}
                  className={`h-16 border p-2 text-[11px] font-semibold ${idx % 3 === 0 ? "border-[#8ec4a8] bg-[#eaf9f0] text-[#24593f]" : "border-[#dbe3ed] bg-[#f9fbfe] text-[#6f839a]"}`}
                >
                  {item}
                </div>
              ))}
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="border border-[#dbe3ed] bg-[#f8fbff] p-4">
                <p className="text-xs font-black uppercase tracking-[0.14em] text-[#1f3853]">Pass 1</p>
                <p className="mt-2 text-sm leading-6 text-[#5f758d]">Executing the if-branch. Non-matching threads are waiting.</p>
              </div>
              <div className="border border-[#dbe3ed] bg-[#f8fbff] p-4">
                <p className="text-xs font-black uppercase tracking-[0.14em] text-[#1f3853]">Pass 2</p>
                <p className="mt-2 text-sm leading-6 text-[#5f758d]">Executing the else-branch. Previously active threads become idle.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          <NavCard href="/gpu/hardware" title="Hardware" icon={GitBranch} />
          <NavCard href="/gpu/performance" title="Performance" icon={BarChart3} />
          <NavCard href="/gpu/tools/gpu-picker" title="Tools" icon={ArrowRight} />
        </section>
      </div>
    </div>
  );
}

function NavCard({ href, title, icon }) {
  const IconComponent = icon;
  return (
    <Link href={href} className="flex items-center justify-between border border-[#d7dfe8] bg-white px-5 py-4 text-sm font-bold uppercase tracking-[0.14em] text-[#23425f] hover:bg-[#f7faff]">
      {title}
      <IconComponent className="h-4 w-4" />
    </Link>
  );
}
