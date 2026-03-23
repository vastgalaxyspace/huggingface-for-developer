"use client";
import { Copy, Check, Info, FileText, FolderOpen, Users, Settings, Database } from 'lucide-react';
import { useState } from 'react';

const SidebarItem = ({ icon: Icon, text, active }) => (
  <button className={`w-full flex items-center gap-3 rounded-r-xl px-4 py-3 text-[13px] font-bold transition-colors ${
    active
      ? 'bg-[var(--panel-muted)] text-[var(--accent)] border-l-[3px] border-[var(--accent)]'
      : 'text-[var(--text-muted)] hover:bg-[rgba(243,247,252,0.8)] hover:text-[var(--text-strong)] border-l-[3px] border-transparent'
  }`}>
    <Icon className={`h-[15px] w-[15px] ${active ? 'text-[var(--accent)]' : 'text-[var(--text-muted)]'}`} />
    {text}
  </button>
);

const ModelDetailPage = ({ modelData }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const nameParts = modelData?.modelId ? modelData.modelId.split('/') : ['meta-llama', 'Meta-Llama-3-8B'];
  const modelName = nameParts.length > 1 ? nameParts[1] : nameParts[0];

  const paramCount = modelData?.vramEstimates?.totalParams || 7;
  const paramString = paramCount >= 1000
    ? `${(paramCount / 1000).toFixed(1)} Trillion`
    : `${paramCount} Billion`;

  const codeSnippet = `from transformers import AutoModelForCausalLM, AutoTokenizer

model_id = "${modelData?.modelId || 'precision/architect-7b-instruct'}"
tokenizer = AutoTokenizer.from_pretrained(model_id)
model = AutoModelForCausalLM.from_pretrained(model_id, device_map="auto")

prompt = "Analyze this blueprint structure: [JSON DATA]"
inputs = tokenizer(prompt, return_tensors="pt").to("cuda")
outputs = model.generate(**inputs, max_new_tokens=512)

print(tokenizer.decode(outputs[0]))`;

  return (
    <div className="min-h-screen">
      <div className="shell-container">
        <div className="editorial-panel overflow-hidden rounded-[32px]">
          <div className="flex min-h-[calc(100vh-170px)] flex-col md:flex-row">
            <aside className="hidden min-h-full w-full border-r border-[var(--border-soft)] bg-[rgba(249,251,254,0.88)] py-6 md:flex md:w-[248px] md:flex-col md:justify-between">
              <div>
                <div className="mb-8 flex items-center gap-3 px-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border-soft)] bg-[var(--panel-muted)]">
                    <Database className="h-4 w-4 text-[var(--accent)]" />
                  </div>
                  <div>
                    <h2 className="flex flex-col text-[12px] font-extrabold leading-tight text-[var(--text-strong)]">
                      <span>Model Details</span>
                      <span className="mt-0.5 text-[9px] font-bold uppercase tracking-[0.22em] text-[var(--text-faint)]">V2.4.0-STABLE</span>
                    </h2>
                  </div>
                </div>

                <nav className="flex flex-col pr-4">
                  <SidebarItem icon={FileText} text="Model Card" active={true} />
                  <SidebarItem icon={FolderOpen} text="Files" active={false} />
                  <SidebarItem icon={Users} text="Community" active={false} />
                  <SidebarItem icon={Settings} text="Settings" active={false} />
                </nav>
              </div>

              <div className="space-y-4 px-6 pb-8">
                <button className="w-full rounded-xl bg-[var(--accent)] py-3 text-[11px] font-bold uppercase tracking-[0.2em] text-white transition-colors hover:bg-[var(--accent-strong)]">
                  Deploy Model
                </button>
                <div className="flex flex-col gap-3.5 pt-6">
                  <button className="flex items-center gap-2.5 text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--text-muted)] transition-colors hover:text-[var(--text-strong)]">
                    <FileText className="h-3.5 w-3.5" /> Documentation
                  </button>
                  <button className="flex items-center gap-2.5 text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--text-muted)] transition-colors hover:text-[var(--text-strong)]">
                    <Info className="h-3.5 w-3.5" /> Support
                  </button>
                </div>
              </div>
            </aside>

            <main className="w-full flex-1 px-6 py-10 md:px-12 lg:px-16 lg:py-12">
              <div className="mx-auto max-w-[860px]">
                <div className="mb-8">
                  <div className="mb-5 flex items-center gap-2.5">
                    <span className="rounded-full border border-[rgba(54,87,132,0.12)] bg-[var(--accent-soft)] px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.2em] text-[var(--accent)]">
                      NATURAL LANGUAGE
                    </span>
                    <span className="rounded-full border border-[var(--border-soft)] bg-[rgba(243,245,248,0.88)] px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.2em] text-[var(--text-muted)]">
                      TRANSFORMER
                    </span>
                  </div>
                  <h1 className="mb-4 text-4xl font-black tracking-tight text-[var(--text-strong)] lg:text-5xl">
                    {modelName}
                  </h1>
                  <p className="text-lg font-medium leading-relaxed text-[var(--text-muted)]">
                    A high-precision instruction-following model optimized for technical documentation generation and architectural reasoning. Fine-tuned on 1.2T tokens of specialized structural data.
                  </p>
                </div>

                <div className="mb-10 flex gap-3 border-l-4 border-[#35a2f3] bg-[rgba(228,243,255,0.9)] p-5">
                  <Info className="mt-0.5 h-[18px] w-[18px] flex-shrink-0 text-[#1180d1]" />
                  <div>
                    <h4 className="mb-1 text-[13px] font-bold text-[var(--text-strong)]">Stability Notice</h4>
                    <p className="text-[13px] font-medium leading-relaxed text-[var(--text-main)]">
                      This model version is currently in stable release. Expect deterministic performance across all architectural benchmarks. Version 2.5.0-beta is available for testing.
                    </p>
                  </div>
                </div>

                <div className="mb-14">
                  <h3 className="section-kicker mb-4">Model Metadata</h3>
                  <div className="overflow-hidden rounded-[22px] border border-[var(--border-soft)] bg-white">
                    <div className="grid grid-cols-1 text-[14px] md:grid-cols-12">
                      <div className="bg-[rgba(245,248,252,0.92)] px-5 py-4 font-semibold text-[var(--text-faint)] md:col-span-4">Parameters</div>
                      <div className="px-5 py-4 font-bold text-[var(--text-main)] md:col-span-8">{paramString}</div>
                    </div>
                    <div className="grid grid-cols-1 border-t border-[var(--border-soft)] text-[14px] md:grid-cols-12">
                      <div className="bg-[rgba(245,248,252,0.92)] px-5 py-4 font-semibold text-[var(--text-faint)] md:col-span-4">Architecture</div>
                      <div className="px-5 py-4 font-bold text-[var(--text-main)] md:col-span-8">Decoder-only Transformer</div>
                    </div>
                    <div className="grid grid-cols-1 border-t border-[var(--border-soft)] text-[14px] md:grid-cols-12">
                      <div className="bg-[rgba(245,248,252,0.92)] px-5 py-4 font-semibold text-[var(--text-faint)] md:col-span-4">Context Window</div>
                      <div className="px-5 py-4 font-bold text-[var(--text-main)] md:col-span-8">
                        {modelData?.config?.max_position_embeddings ? modelData.config.max_position_embeddings.toLocaleString() : '128,000'} Tokens
                      </div>
                    </div>
                    <div className="grid grid-cols-1 border-t border-[var(--border-soft)] text-[14px] md:grid-cols-12">
                      <div className="bg-[rgba(245,248,252,0.92)] px-5 py-4 font-semibold text-[var(--text-faint)] md:col-span-4">Precision</div>
                      <div className="px-5 py-4 font-bold text-[var(--text-main)] md:col-span-8">BFloat16 / INT8</div>
                    </div>
                    <div className="grid grid-cols-1 border-t border-[var(--border-soft)] text-[14px] md:grid-cols-12">
                      <div className="bg-[rgba(245,248,252,0.92)] px-5 py-4 font-semibold text-[var(--text-faint)] md:col-span-4">License</div>
                      <div className="px-5 py-4 font-bold text-[var(--text-main)] md:col-span-8">
                        {modelData?.licenseInfo?.name || 'Apache 2.0'}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mb-14">
                  <h2 className="mb-4 text-[2rem] font-black tracking-tight text-[var(--text-strong)]">Technical Summary</h2>
                  <p className="mb-8 text-[15px] font-medium leading-relaxed text-[var(--text-muted)]">
                    {modelName} leverages a novel attention mechanism designed to maintain high coherence over long-form structural documents. Unlike general-purpose models, it prioritizes logical consistency and hierarchical adherence in its output.
                  </p>

                  <div className="overflow-hidden rounded-[22px] border border-[var(--border-soft)] bg-white shadow-[0_10px_24px_rgba(59,83,114,0.05)]">
                    <div className="flex items-center justify-between border-b border-[var(--border-soft)] px-5 py-4">
                      <div>
                        <h4 className="text-[14px] font-bold text-[var(--text-strong)]">Quick Start Usage</h4>
                        <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.24em] text-[var(--text-faint)]">PYTHON IMPLEMENTATION</p>
                      </div>
                      <button
                        onClick={() => handleCopy(codeSnippet)}
                        className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--text-muted)] transition-colors hover:text-[var(--text-strong)]"
                      >
                        {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                        {copied ? 'COPIED' : 'COPY'}
                      </button>
                    </div>
                    <div className="overflow-x-auto bg-[#0f172a] p-5">
                      <pre className="text-[12px] leading-relaxed text-[#e2e8f0]">
                        <code>{codeSnippet}</code>
                      </pre>
                    </div>
                  </div>
                </div>

                <div className="mb-14">
                  <h2 className="mb-5 text-[2rem] font-black tracking-tight text-[var(--text-strong)]">Benchmark Performance</h2>
                  <div className="overflow-hidden rounded-[22px] border border-[var(--border-soft)] bg-white">
                    <table className="w-full text-left text-[13px]">
                      <thead className="border-b border-[var(--border-soft)] bg-[rgba(245,248,252,0.92)] text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--text-faint)]">
                        <tr>
                          <th className="px-5 py-3.5">METRIC</th>
                          <th className="w-24 px-5 py-3.5 text-right">SCORE</th>
                        </tr>
                      </thead>
                      <tbody className="font-semibold text-[var(--text-main)]">
                        <tr className="transition-colors hover:bg-[rgba(243,247,252,0.8)]">
                          <td className="px-5 py-4">MMLU (STEM Focus)</td>
                          <td className="px-5 py-4 text-right font-bold text-[var(--text-strong)]">82.4%</td>
                        </tr>
                        <tr className="border-t border-[var(--border-soft)] transition-colors hover:bg-[rgba(243,247,252,0.8)]">
                          <td className="px-5 py-4">HumanEval (Structural Code)</td>
                          <td className="px-5 py-4 text-right font-bold text-[var(--text-strong)]">74.1%</td>
                        </tr>
                        <tr className="border-t border-[var(--border-soft)] transition-colors hover:bg-[rgba(243,247,252,0.8)]">
                          <td className="px-5 py-4">ARC-Challenge</td>
                          <td className="px-5 py-4 text-right font-bold text-[var(--text-strong)]">89.9%</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="mb-6">
                  <h2 className="mb-5 text-[2rem] font-black tracking-tight text-[var(--text-strong)]">Model Assets</h2>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="group flex cursor-pointer flex-col justify-between rounded-[20px] border border-[var(--border-soft)] bg-white p-5 transition-colors hover:border-[rgba(54,87,132,0.26)]">
                      <div className="mb-2 flex items-start justify-between">
                        <FileText className="h-[18px] w-[18px] text-[var(--text-faint)] transition-colors group-hover:text-[var(--accent)]" />
                        <span className="text-[10px] font-bold text-[var(--text-faint)]">1.2 KB</span>
                      </div>
                      <h4 className="text-[14px] font-bold text-[var(--text-main)] transition-colors group-hover:text-[var(--accent)]">config.json</h4>
                    </div>
                    <div className="group flex cursor-pointer flex-col justify-between rounded-[20px] border border-[var(--border-soft)] bg-white p-5 transition-colors hover:border-[rgba(54,87,132,0.26)]">
                      <div className="mb-2 flex items-start justify-between">
                        <Database className="h-[18px] w-[18px] text-[var(--text-faint)] transition-colors group-hover:text-[var(--accent)]" />
                        <span className="text-[10px] font-bold text-[var(--text-faint)]">14.5 GB</span>
                      </div>
                      <h4 className="text-[14px] font-bold text-[var(--text-main)] transition-colors group-hover:text-[var(--accent)]">model.safetensors</h4>
                    </div>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModelDetailPage;
