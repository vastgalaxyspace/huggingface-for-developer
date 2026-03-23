"use client";
import { useState } from 'react';
import { ArrowLeft, ArrowRight, Lightbulb, Cpu, MonitorPlay, Smartphone, Download, ExternalLink, BarChart3, Database } from 'lucide-react';

const RecommenderPage = ({ onBack }) => {
  const [activeStep, setActiveStep] = useState(1);

  return (
    <div className="min-h-[calc(100vh-78px)] py-12">
      <div className="mx-auto max-w-[1120px] px-6">
        <div className="mb-12 text-center">
          <p className="section-kicker mb-4">Decision Assistant</p>
          <h1 className="mb-3 text-[2.8rem] font-black tracking-tight text-[var(--text-strong)]">
            Smart Recommender Wizard
          </h1>
          <p className="text-lg font-medium text-[var(--text-muted)]">
            Find the optimal model for your specific architectural constraints.
          </p>
        </div>

        <div className="relative mx-auto mb-14 flex w-full max-w-[780px] items-center justify-between">
          <div className="absolute left-6 right-6 top-5 h-px bg-[var(--border-strong)]"></div>

          <div className="flex flex-col items-center gap-2 px-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--accent)] text-[14px] font-bold text-white shadow-sm">1</div>
            <span className="text-[12px] font-bold uppercase tracking-[0.18em] text-[var(--accent)]">Task</span>
          </div>
          <div className="flex flex-col items-center gap-2 px-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-[var(--border-soft)] bg-white text-[14px] font-bold text-[var(--text-faint)]">2</div>
            <span className="text-[12px] font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">Compute</span>
          </div>
          <div className="flex flex-col items-center gap-2 px-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-[var(--border-soft)] bg-white text-[14px] font-bold text-[var(--text-faint)]">3</div>
            <span className="text-[12px] font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">Metrics</span>
          </div>
          <div className="flex flex-col items-center gap-2 px-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-[var(--border-soft)] bg-white text-[14px] font-bold text-[var(--text-faint)]">4</div>
            <span className="text-[12px] font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">Results</span>
          </div>
        </div>

        <div className="mb-16 grid gap-8 lg:grid-cols-[1fr_300px]">
          <div className="editorial-panel rounded-[28px] p-8">
            <h2 className="mb-2 text-[2rem] font-black tracking-tight text-[var(--text-strong)]">
              Define Model Scope
            </h2>
            <p className="mb-8 text-[15px] font-medium text-[var(--text-muted)]">
              Select the fundamental requirements for your deployment environment.
            </p>

            <div className="mb-8 grid grid-cols-2 gap-5">
              <div>
                <label className="mb-2.5 block text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--text-main)]">
                  Primary Task
                </label>
                <div className="relative">
                  <select className="w-full appearance-none rounded-2xl border border-[var(--border-strong)] bg-white px-4 py-3.5 text-[15px] font-medium text-[var(--text-main)] outline-none transition-colors focus:border-[var(--accent)]">
                    <option>Natural Language Processing</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4">
                    <svg className="h-4 w-4 text-[var(--text-faint)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
              </div>
              <div>
                <label className="mb-2.5 block text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--text-main)]">
                  Data Type
                </label>
                <div className="relative">
                  <select className="w-full appearance-none rounded-2xl border border-[var(--border-strong)] bg-white px-4 py-3.5 text-[15px] font-medium text-[var(--text-main)] outline-none transition-colors focus:border-[var(--accent)]">
                    <option>Text (Unstructured)</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4">
                    <svg className="h-4 w-4 text-[var(--text-faint)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-10">
              <label className="mb-4 block text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--text-main)]">
                Target Hardware Architecture
              </label>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="cursor-pointer rounded-[20px] border border-[var(--border-soft)] bg-white p-5 transition-colors hover:border-[rgba(54,87,132,0.32)]">
                  <Cpu className="mb-3 h-4 w-4 text-[var(--text-main)]" />
                  <h4 className="mb-1 text-[13px] font-extrabold text-[var(--text-strong)]">NVIDIA GPU</h4>
                  <p className="text-[12px] font-medium leading-relaxed text-[var(--text-muted)]">CUDA-enabled enterprise clusters</p>
                </div>

                <div className="relative cursor-pointer rounded-[20px] border border-[var(--accent)] bg-[rgba(239,245,252,0.92)] p-5 shadow-sm">
                  <div className="absolute right-3 top-3 h-2.5 w-2.5 rounded-full bg-[var(--accent)]"></div>
                  <MonitorPlay className="mb-3 h-4 w-4 text-[var(--accent)]" />
                  <h4 className="mb-1 text-[13px] font-extrabold text-[var(--text-strong)]">Apple Silicon</h4>
                  <p className="text-[12px] font-medium leading-relaxed text-[var(--text-muted)]">M1/M2/M3 Metal optimization</p>
                </div>

                <div className="cursor-pointer rounded-[20px] border border-[var(--border-soft)] bg-white p-5 transition-colors hover:border-[rgba(54,87,132,0.32)]">
                  <Smartphone className="mb-3 h-4 w-4 text-[var(--text-main)]" />
                  <h4 className="mb-1 text-[13px] font-extrabold text-[var(--text-strong)]">Mobile Edge</h4>
                  <p className="text-[12px] font-medium leading-relaxed text-[var(--text-muted)]">Android/iOS NPU accelerators</p>
                </div>
              </div>
            </div>

            <div className="mt-auto flex items-center justify-between border-t border-[var(--border-soft)] pt-6">
              <button
                onClick={onBack}
                className="flex items-center gap-2 rounded-2xl border border-[var(--border-strong)] bg-white px-5 py-3 text-[15px] font-bold text-[var(--text-main)] transition-colors hover:bg-[rgba(243,247,252,0.8)]"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
              <button
                className="flex items-center gap-2 rounded-2xl bg-[var(--accent)] px-7 py-3.5 text-[15px] font-bold text-white shadow-sm transition-colors hover:bg-[var(--accent-strong)]"
                onClick={() => setActiveStep(Math.min(activeStep + 1, 4))}
              >
                Next Step
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div className="editorial-panel rounded-[24px] bg-[rgba(235,243,250,0.95)] p-6">
              <div className="mb-3 flex items-center gap-2">
                <Lightbulb className="h-[14px] w-[14px] fill-current text-[var(--accent)]" />
                <h4 className="text-[12px] font-extrabold tracking-[0.14em] text-[var(--text-strong)]">Architect&apos;s Tip</h4>
              </div>
              <p className="text-[14px] font-medium leading-relaxed text-[var(--text-main)]">
                For Apple Silicon deployments, we recommend models quantized to 4-bit or 8-bit using <strong>MLX</strong> or <strong>CoreML</strong> to maximize efficiency without losing significant perplexity.
              </p>
            </div>

            <div className="editorial-panel rounded-[24px] p-6">
              <h4 className="mb-4 text-[11px] font-bold uppercase tracking-[0.24em] text-[var(--text-main)]">
                Live Insights
              </h4>
              <div className="mb-2">
                <p className="mb-1 text-[10px] font-extrabold uppercase tracking-[0.22em] text-[var(--text-faint)]">POTENTIAL MATCH COUNT</p>
                <div className="flex items-end justify-between">
                  <span className="text-5xl font-black tracking-tight text-[var(--accent)]">1,248</span>
                  <BarChart3 className="mb-1 h-4 w-4 text-[var(--text-faint)]" />
                </div>
              </div>
              <div className="mt-4 h-1.5 w-full rounded-full bg-[rgba(150,170,194,0.22)]">
                <div className="h-1.5 w-[65%] rounded-full bg-[var(--accent)]"></div>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-12">
          <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h3 className="mb-1 text-[2rem] font-black tracking-tight text-[var(--text-strong)]">Recommended Models</h3>
              <p className="text-[14px] font-medium text-[var(--text-muted)]">Ranked results based on Performance vs. Efficiency scores.</p>
            </div>
            <button className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--accent)] transition-colors hover:text-[var(--accent-strong)]">
              <Download className="h-[14px] w-[14px]" /> EXPORT CSV
            </button>
          </div>

          <div className="editorial-panel overflow-hidden rounded-[26px]">
            <table className="w-full text-left text-[14px]">
              <thead className="border-b border-[var(--border-soft)] bg-[rgba(237,243,249,0.92)] text-[10px] font-bold uppercase tracking-[0.24em] text-[var(--text-main)]">
                <tr>
                  <th className="w-16 px-6 py-4">RANK</th>
                  <th className="px-6 py-4">MODEL NAME</th>
                  <th className="px-6 py-4">ARCHITECTURE</th>
                  <th className="px-6 py-4">LATENCY (MS)</th>
                  <th className="px-6 py-4">SCORE</th>
                  <th className="px-6 py-4 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="font-semibold text-[var(--text-main)]">
                <tr className="transition-colors hover:bg-[rgba(243,247,252,0.75)]">
                  <td className="px-6 py-6 text-[16px] font-extrabold text-[var(--text-strong)]">01</td>
                  <td className="flex items-center gap-4 px-6 py-5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent)]">
                      <Database className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-[15px] font-extrabold text-[var(--text-strong)]">Mistral-7B-Instruct-v0.2</div>
                      <div className="mt-0.5 text-[12px] font-medium text-[var(--text-muted)]">mistralai / apache-2.0</div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="rounded-full bg-[var(--accent-soft)] px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.18em] text-[var(--accent)]">TRANSFORMER</span>
                  </td>
                  <td className="px-6 py-5 font-medium text-[var(--text-main)]">42.5</td>
                  <td className="px-6 py-5 text-[22px] font-black text-[var(--accent)]">98.4</td>
                  <td className="px-6 py-5 text-right">
                    <button className="text-[var(--text-muted)] transition-colors hover:text-[var(--accent)]">
                      <ExternalLink className="inline-block h-[15px] w-[15px]" />
                    </button>
                  </td>
                </tr>
                <tr className="border-t border-[var(--border-soft)] transition-colors hover:bg-[rgba(243,247,252,0.75)]">
                  <td className="px-6 py-6 text-[16px] font-extrabold text-[var(--text-strong)]">02</td>
                  <td className="flex items-center gap-4 px-6 py-5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[rgba(239,243,247,0.88)] text-[var(--text-muted)]">
                      <Database className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-[15px] font-extrabold text-[var(--text-strong)]">Llama-3-8B-Quantized</div>
                      <div className="mt-0.5 text-[12px] font-medium text-[var(--text-muted)]">meta-llama / llama-3-license</div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="rounded-full bg-[var(--accent-soft)] px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.18em] text-[var(--accent)]">TRANSFORMER</span>
                  </td>
                  <td className="px-6 py-5 font-medium text-[var(--text-main)]">51.2</td>
                  <td className="px-6 py-5 text-[22px] font-black text-[var(--accent)]">96.1</td>
                  <td className="px-6 py-5 text-right">
                    <button className="text-[var(--text-muted)] transition-colors hover:text-[var(--accent)]">
                      <ExternalLink className="inline-block h-[15px] w-[15px]" />
                    </button>
                  </td>
                </tr>
                <tr className="border-t border-[var(--border-soft)] transition-colors hover:bg-[rgba(243,247,252,0.75)]">
                  <td className="px-6 py-6 text-[16px] font-extrabold text-[var(--text-strong)]">03</td>
                  <td className="flex items-center gap-4 px-6 py-5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[rgba(239,243,247,0.88)] text-[var(--text-muted)]">
                      <Database className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-[15px] font-extrabold text-[var(--text-strong)]">Phi-3-Mini-4K-Instruct</div>
                      <div className="mt-0.5 text-[12px] font-medium text-[var(--text-muted)]">microsoft / mit</div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="rounded-full border border-[var(--border-soft)] bg-[rgba(243,245,248,0.88)] px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.18em] text-[var(--text-muted)]">SML</span>
                  </td>
                  <td className="px-6 py-5 font-medium text-[var(--text-main)]">18.9</td>
                  <td className="px-6 py-5 text-[22px] font-black text-[var(--accent)]">94.8</td>
                  <td className="px-6 py-5 text-right">
                    <button className="text-[var(--text-muted)] transition-colors hover:text-[var(--accent)]">
                      <ExternalLink className="inline-block h-[15px] w-[15px]" />
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecommenderPage;
