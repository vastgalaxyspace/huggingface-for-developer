"use client";
import { ArrowRight, BookOpen, Eye, Server, SquareStack } from "lucide-react";

export default function GpuPage() {
  const learningPath = [
    {
      id: "01",
      title: "Physical Hardware",
      subtitle: "Understanding Cores, AI chips and memory buses",
    },
    {
      id: "02",
      title: "Memory Research",
      subtitle: "From VRAM limits to active KV cache behavior",
    },
    {
      id: "03",
      title: "Execution Modes",
      subtitle: "Batch sizing, kernel choices and runtime tuning",
    },
  ];

  const precisionTools = [
    {
      icon: BookOpen,
      name: "Memory Bandwidth Calc",
      body: "Compute effective throughput under mixed precision and cache pressure conditions.",
      cta: "Open Tool",
      tag: "Ready",
    },
    {
      icon: Eye,
      name: "VRAM Scheduler Sim",
      body: "Visualize memory snapshots by context windows, batch size and quantization.",
      cta: "Launch Sim",
      tag: "Tools",
    },
    {
      icon: SquareStack,
      name: "GPU Code Dictionary",
      body: "Reference architecture names, CUDA class mapping and deployment labels.",
      cta: "Explore",
      tag: "Glossary",
    },
  ];

  const gpuIndex = [
    { gpu: "NVIDIA H100", arch: "Hopper", vram: "80GB HBM3", fp16: "1,979", tdp: "700W", compute: "DC", useFor: "LLM training" },
    { gpu: "NVIDIA A100", arch: "Ampere", vram: "80GB HBM2e", fp16: "312", tdp: "400W", compute: "DC", useFor: "Finetune" },
    { gpu: "RTX 6000 Ada", arch: "Ada Lovelace", vram: "48GB GDDR6", fp16: "182", tdp: "300W", compute: "WS", useFor: "Enterprise nodes" },
    { gpu: "RTX 4090", arch: "Ada Lovelace", vram: "24GB GDDR6X", fp16: "82.6", tdp: "450W", compute: "CL", useFor: "Consumer inference" },
  ];

  return (
    <div className="min-h-[calc(100vh-78px)] bg-[#eef2f6] py-8 md:py-12">
      <div className="shell-container max-w-[1200px]">
        <section className="overflow-hidden rounded-[20px] border border-[#d7dfe8] bg-[#f8fafc] shadow-[0_12px_30px_rgba(31,45,61,0.08)]">
          <div className="border-b border-[#d7dfe8] bg-[#222b35] px-6 py-2.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#c8d3de]">
            / Hardware + Execution + Performance + Optimization
          </div>

          <div className="grid gap-10 px-6 py-8 md:grid-cols-[1.12fr_0.88fr] md:px-10 md:py-10">
            <div>
              <h1 className="max-w-[680px] text-4xl font-black leading-[0.95] tracking-[-0.02em] text-[#16202b] sm:text-5xl lg:text-[62px]">
                UNDERSTAND THE GPU
                <br />
                COMPLETELY
              </h1>
              <p className="mt-5 max-w-[620px] text-sm leading-6 text-[#5a6d83]">
                A comprehensive technical reference and toolset for low-level GPU
                programming. From CUDA internals and memory orchestration to real-time
                compute scaling for LLM pipelines.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <button className="inline-flex items-center gap-2 bg-[#1f2f45] px-4 py-2.5 text-xs font-bold uppercase tracking-[0.18em] text-white transition-colors hover:bg-[#172436]">
                  Start Learning <ArrowRight className="h-3.5 w-3.5" />
                </button>
                <button className="border border-[#d2dae5] bg-white px-4 py-2.5 text-xs font-bold uppercase tracking-[0.18em] text-[#2a3b50] transition-colors hover:bg-[#f4f7fb]">
                  GPU Tools
                </button>
              </div>
            </div>

            <div className="relative flex min-h-[190px] items-center justify-center overflow-hidden rounded-[14px] border border-[#dde4ec] bg-[linear-gradient(130deg,#f7fafd_0%,#eef3f8_45%,#e5edf6_100%)]">
              <div className="absolute -left-16 top-8 h-28 w-28 rounded-full bg-[#dfe7f1]/60 blur-md" />
              <div className="absolute right-8 top-6 h-44 w-44 rounded-full border border-[#cfd9e5]" />
              <div className="absolute left-12 bottom-9 h-10 w-36 rounded-sm border border-[#ccd7e4] bg-white/55" />
              <Server className="relative h-20 w-20 text-[#657b92]" />
            </div>
          </div>

          <div className="grid grid-cols-3 divide-x divide-[#d7dfe8] border-t border-[#d7dfe8] bg-white">
            <Metric label="Instruments" value="7 years" />
            <Metric label="Tech Tools" value="15+ tools" />
            <Metric label="Supported GPUs" value="50+ GPUs" />
          </div>
        </section>

        <section className="mt-10 rounded-[20px] border border-[#d7dfe8] bg-[#f8fafc] p-6 md:p-8">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-2xl font-extrabold tracking-[-0.01em] text-[#1a2635]">
              LEARNING PATH
            </h2>
            <div className="flex gap-2">
              <button className="h-8 w-8 border border-[#d7dfe8] bg-white text-[#60748b]">{"<"}</button>
              <button className="h-8 w-8 border border-[#d7dfe8] bg-white text-[#60748b]">{">"}</button>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {learningPath.map((item) => (
              <article
                key={item.id}
                className="min-h-[132px] border border-[#d9e1ea] bg-white p-5"
              >
                <p className="text-[28px] font-black leading-none text-[#d5dce6]">{item.id}</p>
                <h3 className="mt-5 text-xs font-black uppercase tracking-[0.14em] text-[#233346]">
                  {item.title}
                </h3>
                <p className="mt-2 text-xs leading-5 text-[#698096]">{item.subtitle}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-10 rounded-[20px] border border-[#d7dfe8] bg-white p-6 md:p-8">
          <h2 className="mb-6 text-center text-2xl font-extrabold tracking-[-0.01em] text-[#1b2737]">
            PRECISION TOOLS
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            {precisionTools.map((tool) => (
              <article key={tool.name} className="border border-[#dde4ec] p-5">
                <div className="mb-6 flex items-center justify-between text-[#62768f]">
                  <tool.icon className="h-4 w-4" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.18em]">
                    {tool.tag}
                  </span>
                </div>
                <h3 className="text-xs font-black uppercase tracking-[0.12em] text-[#223244]">
                  {tool.name}
                </h3>
                <p className="mt-3 text-xs leading-5 text-[#687f95]">{tool.body}</p>
                <button className="mt-5 text-[10px] font-bold uppercase tracking-[0.16em] text-[#1f3a59]">
                  {tool.cta}
                </button>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-10 overflow-hidden rounded-[20px] border border-[#d7dfe8] bg-white">
          <h2 className="border-b border-[#e2e8f0] px-6 py-5 text-2xl font-extrabold tracking-[-0.01em] text-[#1b2737] md:px-8">
            HARDWARE INDEX
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-left">
              <thead className="bg-[#f8fbff] text-[10px] uppercase tracking-[0.16em] text-[#71859b]">
                <tr>
                  <th className="px-6 py-4 md:px-8">GPU</th>
                  <th className="px-4 py-4">Arch</th>
                  <th className="px-4 py-4">VRAM</th>
                  <th className="px-4 py-4">FP16 TFLOP</th>
                  <th className="px-4 py-4">TDP</th>
                  <th className="px-4 py-4">Compute</th>
                  <th className="px-4 py-4">Best For</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e3e9f0] text-[13px] text-[#33495f]">
                {gpuIndex.map((row) => (
                  <tr key={row.gpu} className="hover:bg-[#f9fbfe]">
                    <td className="px-6 py-4 font-bold text-[#1f2e41] md:px-8">{row.gpu}</td>
                    <td className="px-4 py-4">{row.arch}</td>
                    <td className="px-4 py-4">{row.vram}</td>
                    <td className="px-4 py-4">{row.fp16}</td>
                    <td className="px-4 py-4">{row.tdp}</td>
                    <td className="px-4 py-4">{row.compute}</td>
                    <td className="px-4 py-4 text-[#607991]">{row.useFor}</td>
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

function Metric({ label, value }) {
  return (
    <div className="px-4 py-4 text-center md:px-6 md:py-5">
      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#7d90a4]">
        {label}
      </p>
      <p className="mt-1 text-xl font-extrabold text-[#1f2f42] md:text-2xl">{value}</p>
    </div>
  );
}
