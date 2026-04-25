import { Code2, Gauge, ShieldCheck, DollarSign, Clock3, Layers3 } from 'lucide-react';

const LAST_UPDATED = 'April 15, 2026';

const sectionLinks = [
  { id: 'section-1', label: '1. Purpose' },
  { id: 'section-2', label: '2. AI Coding Model' },
  { id: 'section-3', label: '3. Models Covered' },
  { id: 'section-4', label: '4. Comparison Table' },
  { id: 'section-5', label: '5. Benchmarks' },
  { id: 'section-6', label: '6. Real-World Tasks' },
  { id: 'section-7', label: '7. Languages' },
  { id: 'section-8', label: '8. Context Window' },
  { id: 'section-9', label: '9. Speed & Latency' },
  { id: 'section-10', label: '10. Pricing Analysis' },
  { id: 'section-11', label: '11. Hosting Options' },
  { id: 'section-12', label: '12. Privacy' },
  { id: 'section-13', label: '13. Integrations' },
  { id: 'section-14', label: '14. Best by Use Case' },
  { id: 'section-15', label: '15. How to Evaluate' },
  { id: 'section-16', label: '16. FAQ' },
  { id: 'section-17', label: '17. Sources' },
];

const modelsCovered = [
  ['OpenAI GPT-4.1', 'OpenAI', '2025-04-14', 'Closed / proprietary', 'API'],
  ['Claude Sonnet 4.6', 'Anthropic', '2026-02-17', 'Closed / proprietary', 'API'],
  ['Gemini 2.5 Pro', 'Google', '2025 (2.5 generation)', 'Closed / proprietary', 'API'],
  ['Codestral 25.08', 'Mistral AI', '2025-07-30', 'Commercial model', 'API'],
  ['DeepSeek-Coder-V2-Instruct', 'DeepSeek', '2024-06', 'Open weights', 'Local + hosted endpoints'],
  ['Qwen2.5-Coder-7B-Instruct', 'Alibaba (Qwen Team)', '2024-09', 'Open weights', 'Local + hosted endpoints'],
  ['Code Llama 70B Instruct', 'Meta', '2023-08', 'Open weights', 'Local + cloud providers'],
];

const comparisonRows = [
  ['OpenAI GPT-4.1', '1,047,576', '$2.00', '$8.00', 'Not officially published', '32,768', 'Yes', 'Yes (snapshot fine-tuning)', 'Commercial'],
  ['Claude Sonnet 4.6', 'Up to 1M (beta)', '$3.00', '$15.00', 'Not officially published', 'Not publicly standardized', 'Yes', 'No', 'Commercial'],
  ['Gemini 2.5 Pro', 'Up to 1,048,576', '$1.25 to $2.50', '$10.00 to $15.00', 'Not officially published', 'Not publicly standardized', 'Yes', 'Limited / product-specific', 'Commercial'],
  ['Codestral 25.08', '128,000', '$0.30', '$0.90', 'Not officially published', 'Provider-dependent', 'No', 'No public API FT', 'Commercial'],
  ['DeepSeek-Coder-V2-Instruct', '128,000', '$0 self-hosted / varies by host', '$0 self-hosted / varies by host', 'Hardware-dependent', 'Serving-stack dependent', 'No', 'Yes (self-managed)', 'Open weights'],
  ['Qwen2.5-Coder-7B-Instruct', '131,072', '$0 self-hosted / varies by host', '$0 self-hosted / varies by host', 'Hardware-dependent', 'Serving-stack dependent', 'No', 'Yes (self-managed)', 'Open weights'],
  ['Code Llama 70B Instruct', '16,000 (common deployment default)', '$0 self-hosted / varies by host', '$0 self-hosted / varies by host', 'Hardware-dependent', 'Serving-stack dependent', 'No', 'Yes (self-managed)', 'Open weights'],
];

const benchmarkRows = [
  ['OpenAI GPT-4.1', 'Not disclosed in official 4.1 post', '54.6% (SWE-bench Verified, OpenAI-reported)', 'Not disclosed in official 4.1 post', 'Not disclosed in official 4.1 post'],
  ['Claude Sonnet 4.6', 'Not published in text benchmark table on release page', 'Not published in text benchmark table on release page', 'Not published in text benchmark table on release page', 'Not published in text benchmark table on release page'],
  ['Gemini 2.5 Pro', 'No stable official cross-vendor number in one canonical report', 'No stable official cross-vendor number in one canonical report', 'No stable official cross-vendor number in one canonical report', 'No stable official cross-vendor number in one canonical report'],
  ['Codestral-22B (Qwen2.5 report table)', '78.1', 'Not reported in that table', '32.9', '73.3'],
  ['DeepSeek-Coder-V2-Instruct (DeepSeek report)', '90.2', '12.7 (SWE-Bench in DeepSeek V2 table)', '43.4', '76.2 (MBPP+)'],
  ['Qwen2.5-Coder-7B-Instruct (Qwen report)', '88.4', 'Not reported in that table', '37.6', '83.5'],
  ['Code Llama 70B Instruct (Mistral Codestral-2501 table)', '67.1', 'Not reported in that table', '20.0', '70.8'],
];

const benchmarkChartData = [
  { model: 'GPT-4.1', humaneval: null, swebench: 54.6, livecodebench: null, mbpp: null },
  { model: 'Claude 4.6', humaneval: null, swebench: null, livecodebench: null, mbpp: null },
  { model: 'Gemini 2.5 Pro', humaneval: null, swebench: null, livecodebench: null, mbpp: null },
  { model: 'Codestral-22B', humaneval: 78.1, swebench: null, livecodebench: 32.9, mbpp: 73.3 },
  { model: 'DeepSeek-V2', humaneval: 90.2, swebench: 12.7, livecodebench: 43.4, mbpp: 76.2 },
  { model: 'Qwen2.5-7B', humaneval: 88.4, swebench: null, livecodebench: 37.6, mbpp: 83.5 },
  { model: 'Code Llama 70B', humaneval: 67.1, swebench: null, livecodebench: 20.0, mbpp: 70.8 },
];

const realWorldRows = [
  ['Code completion / autocomplete', 'Excellent', 'Excellent', 'Good', 'Excellent', 'Good', 'Good'],
  ['Debugging and error explanation', 'Excellent', 'Excellent', 'Good', 'Good', 'Good', 'Average'],
  ['Writing unit tests', 'Excellent', 'Excellent', 'Good', 'Good', 'Good', 'Average'],
  ['Refactoring existing code', 'Excellent', 'Excellent', 'Good', 'Average', 'Good', 'Average'],
  ['Explain code in plain English', 'Excellent', 'Excellent', 'Excellent', 'Good', 'Good', 'Good'],
  ['Boilerplate/scaffolding', 'Excellent', 'Excellent', 'Good', 'Good', 'Good', 'Average'],
  ['Large codebase multi-file work', 'Excellent', 'Excellent', 'Excellent', 'Average', 'Good', 'Average'],
];

const languageRows = [
  ['Python', 'GPT-4.1, Claude Sonnet 4.6, DeepSeek-Coder-V2'],
  ['JavaScript / TypeScript', 'GPT-4.1, Claude Sonnet 4.6, Codestral'],
  ['Java', 'GPT-4.1, Gemini 2.5 Pro, Claude Sonnet 4.6'],
  ['C / C++', 'DeepSeek-Coder-V2, Qwen2.5-Coder, GPT-4.1'],
  ['Rust', 'Claude Sonnet 4.6, GPT-4.1, Qwen2.5-Coder'],
  ['Go', 'GPT-4.1, Claude Sonnet 4.6, DeepSeek-Coder-V2'],
  ['PHP', 'GPT-4.1, Claude Sonnet 4.6, Codestral'],
  ['Ruby', 'GPT-4.1, Claude Sonnet 4.6'],
  ['SQL', 'GPT-4.1, Gemini 2.5 Pro, Claude Sonnet 4.6'],
  ['Shell scripting', 'Claude Sonnet 4.6, GPT-4.1, DeepSeek-Coder-V2'],
];

const integrations = [
  ['GitHub Copilot', 'OpenAI family (vendor managed)', 'VS Code, JetBrains, Neovim'],
  ['Cursor', 'Claude + OpenAI + others (plan dependent)', 'Cursor IDE'],
  ['Sourcegraph Cody', 'Anthropic / OpenAI / others', 'VS Code, JetBrains, Web'],
  ['Continue.dev', 'OpenAI, Anthropic, Google, Mistral, local OSS', 'VS Code, JetBrains'],
  ['Tabnine', 'Tabnine + provider models', 'VS Code, JetBrains, Vim/Neovim'],
  ['Amazon Q Developer', 'AWS-managed model stack', 'VS Code, JetBrains, AWS IDE tooling'],
];

const decisionPaths = [
  {
    title: 'Fastest safe default',
    body: 'Start with GPT-4.1 or Claude Sonnet for high-stakes coding tasks, then benchmark cheaper alternatives against your own repository.',
    icon: ShieldCheck,
  },
  {
    title: 'Cost-sensitive coding assistant',
    body: 'Use Codestral or a smaller open coding model for autocomplete and boilerplate, reserving frontier models for review and refactors.',
    icon: DollarSign,
  },
  {
    title: 'Private codebase workflow',
    body: 'Prefer self-hosted DeepSeek-Coder, Qwen Coder, or another open-weight model when source-code privacy is the primary constraint.',
    icon: Layers3,
  },
];

const faq = [
  ['Which AI model is best for coding in 2025/2026?', 'For broad production coding, GPT-4.1 and Claude Sonnet 4.6 are usually top picks; for self-hosting, DeepSeek-Coder-V2 and Qwen2.5-Coder are practical choices.'],
  ['Is GPT-4.1 better than Claude for code?', 'It depends on workload. GPT-4.1 is very consistent in tooling/API workflows, while Claude often shines in long-context repo analysis and complex refactor sessions.'],
  ['Can I use AI coding models for free?', 'Yes, through limited free tiers and open-weight local models. Free tiers usually have request and rate caps.'],
  ['Which models can I run locally?', 'DeepSeek-Coder-V2, Qwen2.5-Coder, and Code Llama can be self-hosted with adequate GPU resources and inference tooling.'],
  ['How accurate are AI coding benchmarks?', 'Useful for baseline comparison, but they do not fully capture IDE workflow fit, debugging behavior, and project-specific edge cases.'],
  ['Does context window size matter for coding?', 'Yes, especially for multi-file tasks. But retrieval quality and long-context reasoning stability matter as much as raw token count.'],
];

function Section({ id, number, title, children }) {
  return (
    <section id={id} className="editorial-panel rounded-[26px] border border-[var(--border-soft)] p-6 sm:p-8">
      <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--accent-soft)] px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-[var(--accent)]">
        Section {number}
      </div>
      <h2 className="text-2xl font-black tracking-tight text-[var(--text-strong)] sm:text-3xl">{title}</h2>
      <div className="mt-4 text-sm leading-7 text-[var(--text-main)] sm:text-base">{children}</div>
    </section>
  );
}

function DataTable({ headers, rows }) {
  return (
    <div className="mt-5 overflow-x-auto rounded-2xl border border-[var(--border-soft)] bg-white/85">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-[var(--panel-muted)] text-xs uppercase tracking-[0.12em] text-[var(--text-faint)]">
          <tr>
            {headers.map((h) => (
              <th key={h} className="px-4 py-3 font-bold">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr key={`${idx}-${row[0]}`} className="border-t border-[var(--border-soft)] odd:bg-white even:bg-[#f8fbff]">
              {row.map((cell, cellIdx) => (
                <td key={cellIdx} className="px-4 py-3 align-top text-[var(--text-main)]">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function BenchmarkCharts() {
  const chartA = benchmarkChartData.filter((item) => item.humaneval !== null || item.mbpp !== null);
  const chartB = benchmarkChartData.filter((item) => item.swebench !== null || item.livecodebench !== null);

  const BarRow = ({ label, value, color }) => (
    <div className="space-y-1">
      <div className="flex items-center justify-between gap-3">
        <span className="truncate text-xs font-semibold text-[var(--text-main)]">{label}</span>
        <span className="text-xs font-bold text-[var(--text-strong)]">{value === null ? 'N/A' : `${value}%`}</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--panel-muted)]">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: value === null ? '0%' : `${value}%`, background: color }}
        />
      </div>
    </div>
  );

  return (
    <div className="mt-5 grid gap-4 lg:grid-cols-2">
      <article className="rounded-2xl border border-[var(--border-soft)] bg-white p-4">
        <p className="mb-3 text-sm font-bold text-[var(--text-strong)]">HumanEval and MBPP (pass@1)</p>
        <div className="space-y-4">
          {chartA.map((item) => (
            <div key={`a-${item.model}`} className="rounded-xl border border-[var(--border-soft)] p-3">
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.12em] text-[var(--text-faint)]">{item.model}</p>
              <div className="space-y-2">
                <BarRow label="HumanEval" value={item.humaneval} color="#365784" />
                <BarRow label="MBPP" value={item.mbpp} color="#7ba4d4" />
              </div>
            </div>
          ))}
        </div>
      </article>

      <article className="rounded-2xl border border-[var(--border-soft)] bg-white p-4">
        <p className="mb-3 text-sm font-bold text-[var(--text-strong)]">SWE-bench and LiveCodeBench</p>
        <div className="space-y-4">
          {chartB.map((item) => (
            <div key={`b-${item.model}`} className="rounded-xl border border-[var(--border-soft)] p-3">
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.12em] text-[var(--text-faint)]">{item.model}</p>
              <div className="space-y-2">
                <BarRow label="SWE-bench" value={item.swebench} color="#1e3f68" />
                <BarRow label="LiveCodeBench" value={item.livecodebench} color="#9cbfe4" />
              </div>
            </div>
          ))}
        </div>
      </article>
    </div>
  );
}

export default function CodingModelAnalysisPage() {
  return (
    <main className="pb-20 pt-8 sm:pt-12">
      <div className="shell-container grid gap-8 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-start">
        <div className="min-w-0 space-y-8">
          <section className="relative overflow-hidden rounded-[30px] border border-[var(--border-soft)] bg-white px-6 py-8 shadow-[0_18px_50px_rgba(48,67,95,0.08)] sm:px-10 sm:py-10">
            <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-[rgba(54,87,132,0.12)] blur-3xl" />
            <div className="pointer-events-none absolute -bottom-20 -left-16 h-56 w-56 rounded-full bg-[rgba(37,99,235,0.10)] blur-3xl" />

            <p className="section-kicker">Coding Model Analysis Hub</p>
            <h1 className="mt-3 max-w-4xl text-3xl font-black tracking-tight text-[var(--text-strong)] sm:text-5xl">
              AI Coding Model Comparison for Developers
            </h1>
            <p className="mt-4 max-w-4xl text-sm leading-7 text-[var(--text-muted)] sm:text-base">
              One-stop reference guide for developers comparing AI coding models before selecting a model for IDE
              autocomplete, code review, test generation, refactoring, and agent workflows. This page covers benchmarks,
              pricing, speed, context, strengths, and real-world use cases.
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-2xl border border-[var(--border-soft)] bg-[var(--panel-muted)] p-4">
                <div className="flex items-center gap-2 text-[var(--accent)]"><Code2 className="h-4 w-4" /><span className="text-xs font-bold uppercase tracking-[0.12em]">Model Count</span></div>
                <p className="mt-2 text-2xl font-black text-[var(--text-strong)]">7</p>
              </div>
              <div className="rounded-2xl border border-[var(--border-soft)] bg-[var(--panel-muted)] p-4">
                <div className="flex items-center gap-2 text-[var(--accent)]"><Gauge className="h-4 w-4" /><span className="text-xs font-bold uppercase tracking-[0.12em]">Comparison Axes</span></div>
                <p className="mt-2 text-2xl font-black text-[var(--text-strong)]">17 sections</p>
              </div>
              <div className="rounded-2xl border border-[var(--border-soft)] bg-[var(--panel-muted)] p-4 sm:col-span-2 lg:col-span-1">
                <div className="flex items-center gap-2 text-[var(--accent)]"><Clock3 className="h-4 w-4" /><span className="text-xs font-bold uppercase tracking-[0.12em]">Last Updated</span></div>
                <p className="mt-2 text-2xl font-black text-[var(--text-strong)]">{LAST_UPDATED}</p>
              </div>
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-3">
            {decisionPaths.map((path) => {
              const Icon = path.icon;
              return (
                <article key={path.title} className="rounded-[24px] border border-[var(--border-soft)] bg-white p-5 shadow-sm">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--accent-soft)] text-[var(--accent)]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h2 className="mt-4 text-lg font-black text-[var(--text-strong)]">{path.title}</h2>
                  <p className="mt-3 text-sm leading-7 text-[var(--text-main)]">{path.body}</p>
                </article>
              );
            })}
          </section>

          <Section id="section-1" number="1" title="Introduction / Purpose of the Page">
            <p>
              This page is built as a practical decision guide for developers and teams evaluating AI coding models. It
              is designed to help you quickly compare benchmark quality, cost, latency, context size, privacy tradeoffs,
              and tooling ecosystem fit before choosing a model.
            </p>
          </Section>

          <Section id="section-2" number="2" title="What Is an AI Coding Model?">
            <p>
              AI coding models are large language models trained or adapted for programming tasks like completion,
              debugging, refactoring, and code explanation. Some are general-purpose frontier models that code very well
              (for example GPT and Claude families), while others are code-specialized models (for example DeepSeek
              Coder, Code Llama, Qwen Coder) optimized for software engineering workflows.
            </p>
          </Section>

          <Section id="section-3" number="3" title="List of Models Covered">
            <p>Quick reference list including developer, version timing, openness, and access path.</p>
            <DataTable
              headers={['Model', 'Developer', 'Release / Version', 'Open or Closed', 'Access']}
              rows={modelsCovered}
            />
          </Section>

          <Section id="section-4" number="4" title="Model Comparison Table">
            <p>
              Core side-by-side table for context size, pricing, speed, max output, multimodality, fine-tuning, and
              licensing.
            </p>
            <DataTable
              headers={[
                'Model',
                'Context Window',
                'Input Price / 1M',
                'Output Price / 1M',
                'Speed (tokens/sec)',
                'Max Output',
                'Multimodal',
                'Fine-Tuning',
                'License',
              ]}
              rows={comparisonRows}
            />
            <p className="mt-3 text-xs text-[var(--text-faint)]">
              Throughput numbers are often not published as one stable value because they vary by region, queue, output
              length, and tooling overhead.
            </p>
          </Section>

          <Section id="section-5" number="5" title="Benchmark Scores Section">
            <p>
              HumanEval tests function correctness from docstrings. SWE-bench evaluates fixing real GitHub issues.
              LiveCodeBench focuses on fresh competitive-style coding tasks to reduce contamination. MBPP measures basic
              Python problem-solving.
            </p>
            <BenchmarkCharts />
            <DataTable
              headers={['Model', 'HumanEval (pass@1)', 'SWE-bench', 'LiveCodeBench', 'MBPP']}
              rows={benchmarkRows}
            />
            <p className="mt-3 text-xs text-[var(--text-faint)]">
              Important: these figures come from different papers/eval harnesses and are not perfectly apples-to-apples.
            </p>
          </Section>

          <Section id="section-6" number="6" title="Real-World Coding Task Performance">
            <p>
              Practical rating grid for day-to-day developer workflows. Ratings are qualitative and intended as
              directional guidance.
            </p>
            <DataTable
              headers={['Task', 'GPT-4.1', 'Claude 4.6', 'Gemini 2.5 Pro', 'Codestral', 'DeepSeek V2', 'Code Llama 70B']}
              rows={realWorldRows}
            />
          </Section>

          <Section id="section-7" number="7" title="Language and Framework Support">
            <DataTable headers={['Language', 'Models That Typically Perform Well']} rows={languageRows} />
            <div className="mt-4 rounded-2xl border border-[var(--border-soft)] bg-[var(--panel-muted)] p-4">
              <p className="font-semibold text-[var(--text-strong)]">Framework notes</p>
              <ul className="mt-2 list-disc pl-5 text-sm text-[var(--text-main)]">
                <li>React/Next.js: GPT-4.1, Claude Sonnet 4.6, Codestral</li>
                <li>Django/FastAPI: GPT-4.1, Claude Sonnet 4.6, DeepSeek-Coder-V2</li>
                <li>Spring Boot: GPT-4.1, Gemini 2.5 Pro, Claude Sonnet 4.6</li>
                <li>Node/Nest/Express: GPT-4.1, Claude Sonnet 4.6, Codestral</li>
              </ul>
            </div>
          </Section>

          <Section id="section-8" number="8" title="Context Window Deep Dive">
            <p>
              Context window is how much text (code, docs, prompts) a model can consider in one request. Rough mapping:
              8K tokens can fit about 500-600 lines of code, while 100K+ can cover multiple files. Very large context
              can still degrade retrieval quality when important details are buried in the middle ('lost in the
              middle').
            </p>
            <p className="mt-3">
              For production use, retrieval strategy and prompt structure often matter as much as raw context size.
            </p>
          </Section>

          <Section id="section-9" number="9" title="Speed and Latency Analysis">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-[var(--border-soft)] bg-[var(--panel-muted)] p-4">
                <p className="font-bold text-[var(--text-strong)]">First Token Latency</p>
                <p className="mt-2 text-sm">Critical for interactive coding and chat-driven debugging loops.</p>
              </div>
              <div className="rounded-2xl border border-[var(--border-soft)] bg-[var(--panel-muted)] p-4">
                <p className="font-bold text-[var(--text-strong)]">Tokens per Second</p>
                <p className="mt-2 text-sm">Determines how fast full patches, explanations, and generated files stream.</p>
              </div>
              <div className="rounded-2xl border border-[var(--border-soft)] bg-[var(--panel-muted)] p-4">
                <p className="font-bold text-[var(--text-strong)]">Batch Throughput</p>
                <p className="mt-2 text-sm">Important for offline tasks like codebase scanning and large test generation.</p>
              </div>
            </div>
          </Section>

          <Section id="section-10" number="10" title="Pricing and Cost Analysis">
            <p>
              Example estimate: 1M input tokens/day and 250K output tokens/day over 30 days.
            </p>
            <DataTable
              headers={['Model', 'Approx Monthly Cost (example)', 'Typical Tier Fit']}
              rows={[
                ['GPT-4.1', '~$120/month', 'Medium-heavy engineering usage'],
                ['Claude Sonnet 4.6', '~$202.5/month', 'Higher spend, high-quality workflows'],
                ['Gemini 2.5 Pro', '~$112.5 to $187.5/month (prompt-size dependent)', 'Flexible depending on prompt size'],
                ['Codestral 25.08', '~$15.75/month', 'Cost-sensitive coding tooling'],
                ['Self-hosted open models', 'No per-token fee; infra cost only', 'Teams with GPU/ops control'],
              ]}
            />
            <p className="mt-3 text-xs text-[var(--text-faint)]">Free tiers and enterprise discounts vary by provider and can change frequently.</p>
          </Section>

          <Section id="section-11" number="11" title="Hosting and Access Options">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-[var(--border-soft)] bg-[var(--panel-muted)] p-4"><p className="font-bold text-[var(--text-strong)]">API Access</p><p className="mt-2 text-sm">Fastest setup, token-based billing, external processing.</p></div>
              <div className="rounded-2xl border border-[var(--border-soft)] bg-[var(--panel-muted)] p-4"><p className="font-bold text-[var(--text-strong)]">Self-Hosted</p><p className="mt-2 text-sm">No token billing, full control, requires GPU infrastructure.</p></div>
              <div className="rounded-2xl border border-[var(--border-soft)] bg-[var(--panel-muted)] p-4"><p className="font-bold text-[var(--text-strong)]">Cloud GPU Hosts</p><p className="mt-2 text-sm">Run open models without owning hardware (Together, Fireworks, Groq, Replicate, etc.).</p></div>
            </div>
          </Section>

          <Section id="section-12" number="12" title="Privacy and Data Security">
            <p>
              API models process prompts on vendor infrastructure; enterprise plans may offer stricter retention controls
              and contractual guarantees. Self-hosted open models keep code fully within your own environment, which is
              often preferred for proprietary and regulated workloads.
            </p>
          </Section>

          <Section id="section-13" number="13" title="IDE and Tool Integrations">
            <DataTable headers={['Tool', 'Model Support', 'Editor Coverage']} rows={integrations} />
          </Section>

          <Section id="section-14" number="14" title="Best Model for Each Use Case">
            <ul className="list-disc pl-5">
              <li>Best autocomplete: Codestral (cost/speed) and GPT-4.1 (quality consistency).</li>
              <li>Best code review/explanation: Claude Sonnet 4.6 and GPT-4.1.</li>
              <li>Best test generation: GPT-4.1 and Claude Sonnet 4.6.</li>
              <li>Best for large codebases: Claude Sonnet 4.6, Gemini 2.5 Pro, GPT-4.1.</li>
              <li>Best free/open option: DeepSeek-Coder-V2 or Qwen2.5-Coder.</li>
              <li>Best for low-latency budget pipelines: Codestral or quantized local open models.</li>
              <li>Best for cost-sensitive projects: Codestral API or self-hosted open weights.</li>
            </ul>
          </Section>

          <Section id="section-15" number="15" title="How to Evaluate a Model on Your Own Codebase">
            <ol className="list-decimal pl-5">
              <li>Select 10 real tasks from recent work.</li>
              <li>Run identical prompts across 3-4 candidate models.</li>
              <li>Score correctness, relevance, and explanation clarity.</li>
              <li>Include edge cases specific to your language and framework.</li>
              <li>Compare speed and monthly cost at your expected volume.</li>
            </ol>
          </Section>

          <Section id="section-16" number="16" title="Frequently Asked Questions">
            <div className="space-y-4">
              {faq.map(([q, a]) => (
                <article key={q} className="rounded-2xl border border-[var(--border-soft)] bg-[var(--panel-muted)] p-4">
                  <h3 className="font-bold text-[var(--text-strong)]">{q}</h3>
                  <p className="mt-2 text-sm text-[var(--text-main)]">{a}</p>
                </article>
              ))}
            </div>
          </Section>

          <Section id="section-17" number="17" title="Sources and Last Updated Date">
            <p className="font-semibold text-[var(--text-strong)]">Last updated: {LAST_UPDATED}</p>
            <ul className="mt-3 list-disc pl-5">
              <li><a className="text-[var(--accent)] underline" href="https://platform.openai.com/docs/models/gpt-4.1" target="_blank" rel="noopener noreferrer">OpenAI GPT-4.1 model page (pricing, context, max output)</a></li>
              <li><a className="text-[var(--accent)] underline" href="https://openai.com/index/gpt-4-1/" target="_blank" rel="noopener noreferrer">OpenAI GPT-4.1 release post (SWE-bench 54.6%)</a></li>
              <li><a className="text-[var(--accent)] underline" href="https://platform.openai.com/docs/pricing/" target="_blank" rel="noopener noreferrer">OpenAI API pricing page</a></li>
              <li><a className="text-[var(--accent)] underline" href="https://www.anthropic.com/news/claude-sonnet-4-6" target="_blank" rel="noopener noreferrer">Anthropic Sonnet 4.6 release (context + pricing statement)</a></li>
              <li><a className="text-[var(--accent)] underline" href="https://ai.google.dev/pricing" target="_blank" rel="noopener noreferrer">Google Gemini API pricing</a></li>
              <li><a className="text-[var(--accent)] underline" href="https://docs.mistral.ai/models/codestral-25-08" target="_blank" rel="noopener noreferrer">Mistral Codestral 25.08 model page</a></li>
              <li><a className="text-[var(--accent)] underline" href="https://github.com/deepseek-ai/DeepSeek-Coder-V2" target="_blank" rel="noopener noreferrer">DeepSeek-Coder-V2 official repo benchmark tables</a></li>
              <li><a className="text-[var(--accent)] underline" href="https://ar5iv.labs.arxiv.org/html/2409.12186" target="_blank" rel="noopener noreferrer">Qwen2.5-Coder technical report (tables with HumanEval/MBPP/LiveCodeBench)</a></li>
              <li><a className="text-[var(--accent)] underline" href="https://mistral.ai/news/codestral-2501" target="_blank" rel="noopener noreferrer">Mistral Codestral-2501 benchmark table (includes Code Llama row)</a></li>
              <li><a className="text-[var(--accent)] underline" href="https://www.swebench.com/verified.html" target="_blank" rel="noopener noreferrer">SWE-bench official benchmark documentation</a></li>
              <li><a className="text-[var(--accent)] underline" href="https://evalplus.github.io/leaderboard.html" target="_blank" rel="noopener noreferrer">EvalPlus leaderboard (HumanEval / MBPP methodology)</a></li>
              <li><a className="text-[var(--accent)] underline" href="https://livecodebench.github.io/leaderboard.html" target="_blank" rel="noopener noreferrer">LiveCodeBench official leaderboard</a></li>
            </ul>
          </Section>
        </div>

        <aside className="hidden lg:sticky lg:top-24 lg:block">
          <div className="editorial-panel rounded-[24px] border border-[var(--border-soft)] p-4">
            <div className="mb-3 flex items-center gap-2 text-[var(--accent)]">
              <Layers3 className="h-4 w-4" />
              <p className="text-xs font-bold uppercase tracking-[0.12em]">On this page</p>
            </div>
            <nav className="max-h-[70vh] space-y-2 overflow-auto pr-1">
              {sectionLinks.map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className="block rounded-lg px-2 py-1.5 text-xs font-semibold text-[var(--text-main)] transition hover:bg-[var(--panel-muted)] hover:text-[var(--accent)]"
                >
                  {item.label}
                </a>
              ))}
            </nav>
            <div className="mt-4 space-y-2 rounded-xl border border-[var(--border-soft)] bg-[var(--panel-muted)] p-3 text-xs">
              <div className="flex items-center gap-2"><DollarSign className="h-3.5 w-3.5 text-[var(--accent)]" /><span className="font-semibold">Pricing changes fast</span></div>
              <div className="flex items-center gap-2"><ShieldCheck className="h-3.5 w-3.5 text-[var(--accent)]" /><span className="font-semibold">Verify privacy policy per vendor</span></div>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
