import Link from "next/link";
import { ArrowRight, Calculator, Cpu, Info, SearchCheck } from "lucide-react";

export default function GpuToolsPage() {
  const recommendations = [
    { rank: "#1", name: "NVIDIA H100 PCIe", vram: "80GB", perf: "1513 FP16 TFLOPS", note: "Best for 70B+ training and heavy throughput." },
    { rank: "#2", name: "RTX 6000 Ada", vram: "48GB", perf: "91 FP16 TFLOPS", note: "Great enterprise inference node." },
    { rank: "#3", name: "NVIDIA A100", vram: "40GB", perf: "312 FP16 TFLOPS", note: "Reliable for medium-scale training." },
  ];

  return (
    <div className="min-h-[calc(100vh-78px)] bg-[#f2f6fb] py-8 md:py-12">
      <div className="shell-container">
        <section className="rounded-[20px] border border-[#d7dfe8] bg-white p-6 shadow-[0_12px_30px_rgba(31,45,61,0.08)] md:p-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#71859b]">Tools / Decision Panel</p>
          <h1 className="mt-3 text-4xl font-black leading-[0.95] tracking-[-0.02em] text-[#16202b] sm:text-5xl">GPU Picker</h1>
          <p className="mt-5 max-w-[760px] text-base leading-8 text-[#536b83]">
            Provide workload context and quickly shortlist compatible GPUs with practical guidance.
          </p>
        </section>

        <section className="mt-8 grid gap-4 lg:grid-cols-[0.42fr_0.58fr]">
          <div className="space-y-4">
            <ToolPanel title="Execution Context" icon={Cpu} options={["LLM Training", "Inference", "Data Science", "Rendering"]} />
            <ToolPanel title="Parameter Scale" icon={Calculator} options={["7B-13B", "30B-70B", "175B+"]} />
            <ToolPanel title="Budget Tier" icon={SearchCheck} options={["Consumer", "Workstation", "Enterprise"]} />

            <button className="flex w-full items-center justify-center gap-2 bg-[#173654] px-4 py-3 text-sm font-black uppercase tracking-[0.16em] text-white">
              Find GPUs <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-4">
            {recommendations.map((item) => (
              <article key={item.rank} className="border border-[#d7dfe8] bg-white p-5">
                <div className="flex items-center justify-between">
                  <span className="border border-[#cae5d8] bg-[#ecfaf3] px-2 py-1 text-xs font-black tracking-[0.12em] text-[#2d6a4c]">{item.rank}</span>
                  <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#6f849b]">Recommended</span>
                </div>
                <h2 className="mt-4 text-4xl font-black tracking-[-0.02em] text-[#172e46]">{item.name}</h2>
                <div className="mt-3 flex flex-wrap gap-x-8 gap-y-2 text-sm text-[#5f758d]">
                  <span>VRAM: {item.vram}</span>
                  <span>Perf: {item.perf}</span>
                </div>
                <p className="mt-3 text-sm leading-6 text-[#4f6a83]">{item.note}</p>
              </article>
            ))}

            <div className="flex items-start gap-2 border border-[#dbe3ed] bg-[#f8fbff] p-4 text-sm leading-6 text-[#597189]">
              <Info className="mt-0.5 h-4 w-4 text-[#325779]" />
              Top pick assumes cluster-level training and high memory bandwidth requirement.
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          <Jump href="/gpu/hardware" label="Hardware" />
          <Jump href="/gpu/execution" label="Execution" />
          <Jump href="/gpu/performance" label="Performance" />
        </section>
      </div>
    </div>
  );
}

function ToolPanel({ title, icon, options }) {
  const IconComponent = icon;
  return (
    <article className="border border-[#d7dfe8] bg-white p-5">
      <div className="flex items-center justify-between text-[#2a455f]">
        <h2 className="text-xs font-black uppercase tracking-[0.14em]">{title}</h2>
        <IconComponent className="h-4 w-4" />
      </div>
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {options.map((option, index) => (
          <button key={option} className={`border px-3 py-2 text-xs font-bold uppercase tracking-[0.12em] ${index === 0 ? "border-[#cae5d8] bg-[#ecfaf3] text-[#2d6a4c]" : "border-[#dbe3ed] bg-[#f9fbfe] text-[#5f758d]"}`}>
            {option}
          </button>
        ))}
      </div>
    </article>
  );
}

function Jump({ href, label }) {
  return (
    <Link href={href} className="flex items-center justify-between border border-[#d7dfe8] bg-white px-5 py-4 text-xs font-bold uppercase tracking-[0.14em] text-[#23425f] hover:bg-[#f7faff]">
      {label}
      <ArrowRight className="h-4 w-4" />
    </Link>
  );
}
