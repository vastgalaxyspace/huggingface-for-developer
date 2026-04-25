import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AlertTriangle, Cpu, DollarSign, Layers3, ListChecks, Users } from 'lucide-react';
import { absoluteUrl, pageMetadata, SITE_NAME } from '../../../src/lib/seo';
import { getAllGuides, getGuideBySlug } from '../../../src/data/guidesContent';
import SelectionPitfallsWorksheet from '../../../src/components/guides/SelectionPitfallsWorksheet';
import BudgetPlannerWorkbench from '../../../src/components/guides/BudgetPlannerWorkbench';
import PrecisionStrategyWorkbench from '../../../src/components/guides/PrecisionStrategyWorkbench';

function SelectionPitfallsLayout({ guide }) {
  const practicalScorecard = [
    { metric: 'Correctness', weight: '35%', how: 'Pass/fail against expected output on real repo tasks' },
    { metric: 'Latency', weight: '20%', how: 'Track TTFT and full response time at p95' },
    { metric: 'Cost', weight: '15%', how: 'Monthly cost at expected token volume' },
    { metric: 'Codebase Fit', weight: '20%', how: 'Performance on internal conventions/APIs' },
    { metric: 'Security Fit', weight: '10%', how: 'Retention policy + compliance check' },
  ];

  const sevenDayPlan = [
    { day: 'Day 1', action: 'Define primary use case + hard constraints (latency, budget, privacy).' },
    { day: 'Day 2', action: 'Collect 10 to 20 real tasks from your repo (bug, feature, tests).' },
    { day: 'Day 3', action: 'Run same prompts on top 3 models and log raw outputs.' },
    { day: 'Day 4', action: 'Score each output using the weighted scorecard.' },
    { day: 'Day 5', action: 'Review results with at least 2 different team roles.' },
    { day: 'Day 6', action: 'Pilot winner behind feature flag on low-risk traffic.' },
    { day: 'Day 7', action: 'Decide: adopt, keep fallback, or rerun with improved prompts.' },
  ];

  const redFlags = [
    'Model looks great on benchmarks but fails your internal naming/API patterns.',
    'Autocomplete feels laggy even though output quality is strong.',
    'Prompts/completions retention terms are unclear for proprietary code.',
    'New model version breaks existing prompt format or response schema.',
    'Open model infra costs exceed managed API costs at team concurrency.',
  ];

  const sectionLinks = guide.sections.map((section, index) => ({
    id: `section-${index + 1}`,
    label: section.heading,
  }));

  return (
    <div className="shell-container py-10">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-start">
        <div className="min-w-0 space-y-8">
          <section className="relative overflow-hidden rounded-[30px] border border-[var(--border-soft)] bg-white px-6 py-8 shadow-[0_18px_50px_rgba(48,67,95,0.08)] sm:px-10 sm:py-10">
            <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-[rgba(54,87,132,0.12)] blur-3xl" />
            <div className="pointer-events-none absolute -bottom-20 -left-16 h-56 w-56 rounded-full bg-[rgba(37,99,235,0.10)] blur-3xl" />

            <p className="section-kicker">{guide.category}</p>
            <h1 className="mt-3 max-w-4xl text-3xl font-black tracking-tight text-[var(--text-strong)] sm:text-5xl">
              {guide.title}
            </h1>
            <p className="mt-4 max-w-4xl text-sm leading-7 text-[var(--text-muted)] sm:text-base">
              {guide.description}
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-2xl border border-[var(--border-soft)] bg-[var(--panel-muted)] p-4">
                <div className="flex items-center gap-2 text-[var(--accent)]">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="text-xs font-bold uppercase tracking-[0.12em]">Pitfalls Covered</span>
                </div>
                <p className="mt-2 text-2xl font-black text-[var(--text-strong)]">12</p>
              </div>
              <div className="rounded-2xl border border-[var(--border-soft)] bg-[var(--panel-muted)] p-4">
                <div className="flex items-center gap-2 text-[var(--accent)]">
                  <ListChecks className="h-4 w-4" />
                  <span className="text-xs font-bold uppercase tracking-[0.12em]">Checklist Ready</span>
                </div>
                <p className="mt-2 text-2xl font-black text-[var(--text-strong)]">Yes</p>
              </div>
              <div className="rounded-2xl border border-[var(--border-soft)] bg-[var(--panel-muted)] p-4 sm:col-span-2 lg:col-span-1">
                <div className="flex items-center gap-2 text-[var(--accent)]">
                  <Users className="h-4 w-4" />
                  <span className="text-xs font-bold uppercase tracking-[0.12em]">Audience</span>
                </div>
                <p className="mt-2 text-2xl font-black text-[var(--text-strong)]">Teams + Leads</p>
              </div>
            </div>
          </section>

          {Array.isArray(guide.whatYouWillLearn) && guide.whatYouWillLearn.length > 0 && (
            <section className="editorial-panel rounded-[26px] border border-[var(--border-soft)] p-6 sm:p-8">
              <h2 className="text-2xl font-black tracking-tight text-[var(--text-strong)] sm:text-3xl">
                What You Will Learn
              </h2>
              <ul className="mt-4 space-y-2 text-sm leading-7 text-[var(--text-main)] sm:text-base">
                {guide.whatYouWillLearn.map((point) => (
                  <li key={point}>- {point}</li>
                ))}
              </ul>
            </section>
          )}

          <section className="editorial-panel rounded-[26px] border border-[var(--border-soft)] p-6 sm:p-8">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--accent-soft)] px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-[var(--accent)]">
              Practical View
            </div>
            <h2 className="text-2xl font-black tracking-tight text-[var(--text-strong)] sm:text-3xl">
              1) Model Evaluation Scorecard (Use This Template)
            </h2>
            <div className="mt-5 overflow-x-auto rounded-2xl border border-[var(--border-soft)] bg-white/85">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-[var(--panel-muted)] text-xs uppercase tracking-[0.12em] text-[var(--text-faint)]">
                  <tr>
                    <th className="px-4 py-3 font-bold">Metric</th>
                    <th className="px-4 py-3 font-bold">Weight</th>
                    <th className="px-4 py-3 font-bold">How To Measure</th>
                  </tr>
                </thead>
                <tbody>
                  {practicalScorecard.map((row) => (
                    <tr key={row.metric} className="border-t border-[var(--border-soft)] odd:bg-white even:bg-[#f8fbff]">
                      <td className="px-4 py-3 font-semibold text-[var(--text-strong)]">{row.metric}</td>
                      <td className="px-4 py-3 text-[var(--text-main)]">{row.weight}</td>
                      <td className="px-4 py-3 text-[var(--text-main)]">{row.how}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <SelectionPitfallsWorksheet />
          </section>

          <section className="editorial-panel rounded-[26px] border border-[var(--border-soft)] p-6 sm:p-8">
            <h2 className="text-2xl font-black tracking-tight text-[var(--text-strong)] sm:text-3xl">
              2) 7-Day Practical Rollout Plan
            </h2>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {sevenDayPlan.map((item) => (
                <article key={item.day} className="rounded-xl border border-[var(--border-soft)] bg-[var(--panel-muted)] p-4">
                  <p className="text-sm font-black text-[var(--text-strong)]">{item.day}</p>
                  <p className="mt-1 text-sm text-[var(--text-main)]">{item.action}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="editorial-panel rounded-[26px] border border-[var(--border-soft)] p-6 sm:p-8">
            <h2 className="text-2xl font-black tracking-tight text-[var(--text-strong)] sm:text-3xl">
              3) Red-Flag Checklist (Stop and Re-evaluate)
            </h2>
            <ul className="mt-4 space-y-2 text-sm leading-7 text-[var(--text-main)] sm:text-base">
              {redFlags.map((flag) => (
                <li key={flag}>- {flag}</li>
              ))}
            </ul>
          </section>

          {guide.sections.map((section, index) => (
            <section
              id={`section-${index + 1}`}
              key={section.heading}
              className="editorial-panel rounded-[26px] border border-[var(--border-soft)] p-6 sm:p-8"
            >
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--accent-soft)] px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-[var(--accent)]">
                Section {index + 1}
              </div>
              <h2 className="text-2xl font-black tracking-tight text-[var(--text-strong)] sm:text-3xl">
                {section.heading}
              </h2>
              <p className="mt-4 text-sm leading-7 text-[var(--text-main)] sm:text-base">{section.content}</p>
            </section>
          ))}

          <section className="editorial-panel rounded-[26px] border border-[var(--border-soft)] p-6 sm:p-8">
            <h2 className="text-2xl font-black tracking-tight text-[var(--text-strong)] sm:text-3xl">
              Pre-Selection Checklist
            </h2>
            <ul className="mt-4 space-y-2 text-sm leading-7 text-[var(--text-main)] sm:text-base">
              {guide.checklist.map((item) => (
                <li key={item}>- {item}</li>
              ))}
            </ul>
          </section>

          <section className="editorial-panel rounded-[26px] border border-[var(--border-soft)] p-6 sm:p-8">
            <h2 className="text-2xl font-black tracking-tight text-[var(--text-strong)] sm:text-3xl">FAQ</h2>
            <div className="mt-4 space-y-4">
              {guide.faq.map((entry) => (
                <article key={entry.q} className="rounded-2xl border border-[var(--border-soft)] bg-[var(--panel-muted)] p-4">
                  <h3 className="font-bold text-[var(--text-strong)]">{entry.q}</h3>
                  <p className="mt-2 text-sm leading-7 text-[var(--text-main)]">{entry.a}</p>
                </article>
              ))}
            </div>
          </section>

          {Array.isArray(guide.endLinks) && guide.endLinks.length > 0 && (
            <section className="editorial-panel rounded-[26px] border border-[var(--border-soft)] p-6 sm:p-8">
              <h2 className="text-2xl font-black tracking-tight text-[var(--text-strong)] sm:text-3xl">
                Continue with Decision Resources
              </h2>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                {guide.endLinks.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="rounded-xl border border-[var(--border-soft)] bg-[var(--panel-muted)] p-4 transition-colors hover:border-[var(--border-strong)] hover:bg-white"
                  >
                    <h3 className="text-sm font-black tracking-tight text-[var(--text-strong)]">{item.title}</h3>
                    <p className="mt-2 text-xs leading-6 text-[var(--text-muted)]">{item.body}</p>
                  </Link>
                ))}
              </div>
            </section>
          )}

          <section className="editorial-panel rounded-[26px] border border-[var(--border-soft)] p-6 sm:p-8">
            <h2 className="text-2xl font-black tracking-tight text-[var(--text-strong)] sm:text-3xl">
              Sources and Last Updated Date
            </h2>
            <p className="mt-3 text-sm text-[var(--text-main)]">Last updated: {guide.lastUpdated}</p>
            <ul className="mt-4 space-y-2 text-sm leading-7 text-[var(--text-main)]">
              {guide.sources.map((source) =>
                source.href.startsWith('http') ? (
                  <li key={source.href}>
                    <a href={source.href} target="_blank" rel="noopener noreferrer" className="font-semibold text-[var(--accent)] hover:text-[var(--accent-strong)]">
                      {source.label}
                    </a>
                  </li>
                ) : (
                  <li key={source.href}>
                    <Link href={source.href} className="font-semibold text-[var(--accent)] hover:text-[var(--accent-strong)]">
                      {source.label}
                    </Link>
                  </li>
                ),
              )}
            </ul>
          </section>
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
          </div>
        </aside>
      </div>
    </div>
  );
}

function BudgetFrameworkLayout({ guide }) {
  const sectionLinks = guide.sections.map((section, index) => ({
    id: `budget-section-${index + 1}`,
    label: section.heading,
  }));

  return (
    <div className="shell-container py-10">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-start">
        <div className="min-w-0 space-y-8">
          <section className="relative overflow-hidden rounded-[30px] border border-[var(--border-soft)] bg-white px-6 py-8 shadow-[0_18px_50px_rgba(48,67,95,0.08)] sm:px-10 sm:py-10">
            <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-[rgba(54,87,132,0.12)] blur-3xl" />
            <div className="pointer-events-none absolute -bottom-20 -left-16 h-56 w-56 rounded-full bg-[rgba(37,99,235,0.10)] blur-3xl" />

            <p className="section-kicker">{guide.category}</p>
            <h1 className="mt-3 max-w-4xl text-3xl font-black tracking-tight text-[var(--text-strong)] sm:text-5xl">
              {guide.title}
            </h1>
            <p className="mt-4 max-w-4xl text-sm leading-7 text-[var(--text-muted)] sm:text-base">
              {guide.description}
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-2xl border border-[var(--border-soft)] bg-[var(--panel-muted)] p-4">
                <div className="flex items-center gap-2 text-[var(--accent)]">
                  <DollarSign className="h-4 w-4" />
                  <span className="text-xs font-bold uppercase tracking-[0.12em]">Budget Tiers</span>
                </div>
                <p className="mt-2 text-2xl font-black text-[var(--text-strong)]">3</p>
              </div>
              <div className="rounded-2xl border border-[var(--border-soft)] bg-[var(--panel-muted)] p-4">
                <div className="flex items-center gap-2 text-[var(--accent)]">
                  <Cpu className="h-4 w-4" />
                  <span className="text-xs font-bold uppercase tracking-[0.12em]">GPU Focus</span>
                </div>
                <p className="mt-2 text-2xl font-black text-[var(--text-strong)]">Practical</p>
              </div>
              <div className="rounded-2xl border border-[var(--border-soft)] bg-[var(--panel-muted)] p-4 sm:col-span-2 lg:col-span-1">
                <div className="flex items-center gap-2 text-[var(--accent)]">
                  <ListChecks className="h-4 w-4" />
                  <span className="text-xs font-bold uppercase tracking-[0.12em]">Includes</span>
                </div>
                <p className="mt-2 text-2xl font-black text-[var(--text-strong)]">Calculator + Table</p>
              </div>
            </div>
          </section>

          <BudgetPlannerWorkbench />

          {guide.sections.map((section, index) => (
            <section
              id={`budget-section-${index + 1}`}
              key={section.heading}
              className="editorial-panel rounded-[26px] border border-[var(--border-soft)] p-6 sm:p-8"
            >
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--accent-soft)] px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-[var(--accent)]">
                Section {index + 1}
              </div>
              <h2 className="text-2xl font-black tracking-tight text-[var(--text-strong)] sm:text-3xl">
                {section.heading}
              </h2>
              <p className="mt-4 text-sm leading-7 text-[var(--text-main)] sm:text-base">{section.content}</p>
            </section>
          ))}

          <section className="editorial-panel rounded-[26px] border border-[var(--border-soft)] p-6 sm:p-8">
            <h2 className="text-2xl font-black tracking-tight text-[var(--text-strong)] sm:text-3xl">
              Budget Planning Checklist
            </h2>
            <ul className="mt-4 space-y-2 text-sm leading-7 text-[var(--text-main)] sm:text-base">
              {guide.checklist.map((item) => (
                <li key={item}>- {item}</li>
              ))}
            </ul>
          </section>

          <section className="editorial-panel rounded-[26px] border border-[var(--border-soft)] p-6 sm:p-8">
            <h2 className="text-2xl font-black tracking-tight text-[var(--text-strong)] sm:text-3xl">FAQ</h2>
            <div className="mt-4 space-y-4">
              {guide.faq.map((entry) => (
                <article key={entry.q} className="rounded-2xl border border-[var(--border-soft)] bg-[var(--panel-muted)] p-4">
                  <h3 className="font-bold text-[var(--text-strong)]">{entry.q}</h3>
                  <p className="mt-2 text-sm leading-7 text-[var(--text-main)]">{entry.a}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="editorial-panel rounded-[26px] border border-[var(--border-soft)] p-6 sm:p-8">
            <h2 className="text-2xl font-black tracking-tight text-[var(--text-strong)] sm:text-3xl">
              Sources and Last Updated Date
            </h2>
            <p className="mt-3 text-sm text-[var(--text-main)]">Last updated: {guide.lastUpdated}</p>
            <ul className="mt-4 space-y-2 text-sm leading-7 text-[var(--text-main)]">
              {guide.sources.map((source) =>
                source.href.startsWith('http') ? (
                  <li key={source.href}>
                    <a href={source.href} target="_blank" rel="noopener noreferrer" className="font-semibold text-[var(--accent)] hover:text-[var(--accent-strong)]">
                      {source.label}
                    </a>
                  </li>
                ) : (
                  <li key={source.href}>
                    <Link href={source.href} className="font-semibold text-[var(--accent)] hover:text-[var(--accent-strong)]">
                      {source.label}
                    </Link>
                  </li>
                ),
              )}
            </ul>
          </section>
        </div>

        <aside className="hidden lg:sticky lg:top-24 lg:block">
          <div className="editorial-panel rounded-[24px] border border-[var(--border-soft)] p-4">
            <div className="mb-3 flex items-center gap-2 text-[var(--accent)]">
              <Layers3 className="h-4 w-4" />
              <p className="text-xs font-bold uppercase tracking-[0.12em]">On this page</p>
            </div>
            <nav className="max-h-[70vh] space-y-2 overflow-auto pr-1">
              <a
                href="#interactive-planner"
                className="block rounded-lg px-2 py-1.5 text-xs font-semibold text-[var(--text-main)] transition hover:bg-[var(--panel-muted)] hover:text-[var(--accent)]"
              >
                Interactive Planner
              </a>
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
          </div>
        </aside>
      </div>
    </div>
  );
}

function RagVsFineTuningLayout({ guide }) {
  const decisionMatrix = [
    { signal: 'Knowledge changes often', rag: 'Strong fit', tuning: 'Weak fit', hybrid: 'Possible later', note: 'Use retrieval when facts, docs, pricing, or policies change frequently.' },
    { signal: 'Need strict JSON / schema', rag: 'Limited help', tuning: 'Strong fit', hybrid: 'Strong fit', note: 'Behavior and output consistency usually point toward fine-tuning.' },
    { signal: 'Need source citations', rag: 'Strong fit', tuning: 'Weak fit', hybrid: 'Strong fit', note: 'Citations are naturally handled by retrieval plus source-grounded prompting.' },
    { signal: 'Need branded tone', rag: 'Limited help', tuning: 'Strong fit', hybrid: 'Strong fit', note: 'Retrieval does not reliably change tone by itself.' },
    { signal: 'Private internal documents', rag: 'Strong fit', tuning: 'Weak fit', hybrid: 'Possible later', note: 'Keep documents external to the model and refresh indexes as content changes.' },
    { signal: 'High-volume repeated classification', rag: 'Maybe', tuning: 'Strong fit', hybrid: 'Maybe', note: 'Repeated, stable tasks often justify dataset-driven tuning.' },
  ];

  const failureMap = [
    { problem: 'Model gives outdated answers', likelyFix: 'RAG', why: 'The issue is missing or stale knowledge, not behavior.' },
    { problem: 'Model ignores exact response format', likelyFix: 'Fine-tuning', why: 'This is a behavior consistency issue.' },
    { problem: 'Answer lacks citations or references', likelyFix: 'RAG', why: 'Retrieved source snippets should be supplied at runtime.' },
    { problem: 'Support tone feels inconsistent', likelyFix: 'Fine-tuning', why: 'Training on approved examples improves style stability.' },
    { problem: 'Retrieved docs are wrong or noisy', likelyFix: 'Improve RAG pipeline', why: 'The retrieval layer is failing before generation even starts.' },
    { problem: 'Need current docs plus strict output policy', likelyFix: 'Hybrid', why: 'One layer supplies knowledge, the other shapes behavior.' },
  ];

  const sevenDayPilot = [
    { day: 'Day 1', action: 'Collect 30 to 50 real user prompts and tag each by task type.' },
    { day: 'Day 2', action: 'Run a prompt-only baseline and log failures.' },
    { day: 'Day 3', action: 'Add basic RAG with source chunks and compare failure categories.' },
    { day: 'Day 4', action: 'Improve chunking, metadata filters, and reranking if retrieval is weak.' },
    { day: 'Day 5', action: 'List the failures RAG did not fix and isolate behavior-only issues.' },
    { day: 'Day 6', action: 'Decide whether a small fine-tuning dataset is justified.' },
    { day: 'Day 7', action: 'Choose: prompt-only, RAG, or RAG plus fine-tuning, then define rollout metrics.' },
  ];

  const sectionLinks = [
    { id: 'rag-learn', label: 'What You Will Learn' },
    { id: 'rag-matrix', label: 'Decision Matrix' },
    { id: 'rag-failure-map', label: 'Failure Map' },
    { id: 'rag-pilot', label: '7-Day Pilot' },
    ...guide.sections.map((section, index) => ({
      id: `rag-section-${index + 1}`,
      label: section.heading,
    })),
  ];

  return (
    <div className="shell-container py-10">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-start">
        <div className="min-w-0 space-y-8">
          <section className="relative overflow-hidden rounded-[30px] border border-[var(--border-soft)] bg-white px-6 py-8 shadow-[0_18px_50px_rgba(48,67,95,0.08)] sm:px-10 sm:py-10">
            <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-[rgba(54,87,132,0.12)] blur-3xl" />
            <div className="pointer-events-none absolute -bottom-20 -left-16 h-56 w-56 rounded-full bg-[rgba(37,99,235,0.10)] blur-3xl" />

            <p className="section-kicker">{guide.category}</p>
            <h1 className="mt-3 max-w-4xl text-3xl font-black tracking-tight text-[var(--text-strong)] sm:text-5xl">
              {guide.title}
            </h1>
            <p className="mt-4 max-w-4xl text-sm leading-7 text-[var(--text-muted)] sm:text-base">
              {guide.description}
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-2xl border border-[var(--border-soft)] bg-[var(--panel-muted)] p-4">
                <div className="flex items-center gap-2 text-[var(--accent)]">
                  <ListChecks className="h-4 w-4" />
                  <span className="text-xs font-bold uppercase tracking-[0.12em]">Decision Focus</span>
                </div>
                <p className="mt-2 text-2xl font-black text-[var(--text-strong)]">RAG vs Tune</p>
              </div>
              <div className="rounded-2xl border border-[var(--border-soft)] bg-[var(--panel-muted)] p-4">
                <div className="flex items-center gap-2 text-[var(--accent)]">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="text-xs font-bold uppercase tracking-[0.12em]">Main Risk</span>
                </div>
                <p className="mt-2 text-2xl font-black text-[var(--text-strong)]">Wrong Fix</p>
              </div>
              <div className="rounded-2xl border border-[var(--border-soft)] bg-[var(--panel-muted)] p-4 sm:col-span-2 lg:col-span-1">
                <div className="flex items-center gap-2 text-[var(--accent)]">
                  <Users className="h-4 w-4" />
                  <span className="text-xs font-bold uppercase tracking-[0.12em]">Best For</span>
                </div>
                <p className="mt-2 text-2xl font-black text-[var(--text-strong)]">Builders</p>
              </div>
            </div>
          </section>

          {Array.isArray(guide.whatYouWillLearn) && guide.whatYouWillLearn.length > 0 && (
            <section id="rag-learn" className="editorial-panel rounded-[26px] border border-[var(--border-soft)] p-6 sm:p-8">
              <h2 className="text-2xl font-black tracking-tight text-[var(--text-strong)] sm:text-3xl">
                What You Will Learn
              </h2>
              <ul className="mt-4 space-y-2 text-sm leading-7 text-[var(--text-main)] sm:text-base">
                {guide.whatYouWillLearn.map((point) => (
                  <li key={point}>- {point}</li>
                ))}
              </ul>
            </section>
          )}

          <section id="rag-matrix" className="editorial-panel rounded-[26px] border border-[var(--border-soft)] p-6 sm:p-8">
            <h2 className="text-2xl font-black tracking-tight text-[var(--text-strong)] sm:text-3xl">
              1) Practical Decision Matrix
            </h2>
            <div className="mt-5 overflow-x-auto rounded-2xl border border-[var(--border-soft)] bg-white/85">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-[var(--panel-muted)] text-xs uppercase tracking-[0.12em] text-[var(--text-faint)]">
                  <tr>
                    <th className="px-4 py-3 font-bold">Signal</th>
                    <th className="px-4 py-3 font-bold">RAG</th>
                    <th className="px-4 py-3 font-bold">Fine-Tuning</th>
                    <th className="px-4 py-3 font-bold">Hybrid</th>
                    <th className="px-4 py-3 font-bold">Interpretation</th>
                  </tr>
                </thead>
                <tbody>
                  {decisionMatrix.map((row) => (
                    <tr key={row.signal} className="border-t border-[var(--border-soft)] odd:bg-white even:bg-[#f8fbff]">
                      <td className="px-4 py-3 font-semibold text-[var(--text-strong)]">{row.signal}</td>
                      <td className="px-4 py-3 text-[var(--text-main)]">{row.rag}</td>
                      <td className="px-4 py-3 text-[var(--text-main)]">{row.tuning}</td>
                      <td className="px-4 py-3 text-[var(--text-main)]">{row.hybrid}</td>
                      <td className="px-4 py-3 text-[var(--text-main)]">{row.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section id="rag-failure-map" className="editorial-panel rounded-[26px] border border-[var(--border-soft)] p-6 sm:p-8">
            <h2 className="text-2xl font-black tracking-tight text-[var(--text-strong)] sm:text-3xl">
              2) Failure-to-Fix Map
            </h2>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {failureMap.map((item) => (
                <article key={item.problem} className="rounded-xl border border-[var(--border-soft)] bg-[var(--panel-muted)] p-4">
                  <p className="text-sm font-black text-[var(--text-strong)]">{item.problem}</p>
                  <p className="mt-2 text-xs font-bold uppercase tracking-[0.12em] text-[var(--accent)]">
                    Best first fix: {item.likelyFix}
                  </p>
                  <p className="mt-2 text-sm text-[var(--text-main)]">{item.why}</p>
                </article>
              ))}
            </div>
          </section>

          <section id="rag-pilot" className="editorial-panel rounded-[26px] border border-[var(--border-soft)] p-6 sm:p-8">
            <h2 className="text-2xl font-black tracking-tight text-[var(--text-strong)] sm:text-3xl">
              3) 7-Day Practical Pilot Plan
            </h2>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {sevenDayPilot.map((item) => (
                <article key={item.day} className="rounded-xl border border-[var(--border-soft)] bg-[var(--panel-muted)] p-4">
                  <p className="text-sm font-black text-[var(--text-strong)]">{item.day}</p>
                  <p className="mt-1 text-sm text-[var(--text-main)]">{item.action}</p>
                </article>
              ))}
            </div>
          </section>

          {guide.sections.map((section, index) => (
            <section
              id={`rag-section-${index + 1}`}
              key={section.heading}
              className="editorial-panel rounded-[26px] border border-[var(--border-soft)] p-6 sm:p-8"
            >
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--accent-soft)] px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-[var(--accent)]">
                Section {index + 1}
              </div>
              <h2 className="text-2xl font-black tracking-tight text-[var(--text-strong)] sm:text-3xl">
                {section.heading}
              </h2>
              <p className="mt-4 text-sm leading-7 text-[var(--text-main)] sm:text-base">{section.content}</p>
            </section>
          ))}

          <section className="editorial-panel rounded-[26px] border border-[var(--border-soft)] p-6 sm:p-8">
            <h2 className="text-2xl font-black tracking-tight text-[var(--text-strong)] sm:text-3xl">
              Implementation Checklist
            </h2>
            <ul className="mt-4 space-y-2 text-sm leading-7 text-[var(--text-main)] sm:text-base">
              {guide.checklist.map((item) => (
                <li key={item}>- {item}</li>
              ))}
            </ul>
          </section>

          <section className="editorial-panel rounded-[26px] border border-[var(--border-soft)] p-6 sm:p-8">
            <h2 className="text-2xl font-black tracking-tight text-[var(--text-strong)] sm:text-3xl">FAQ</h2>
            <div className="mt-4 space-y-4">
              {guide.faq.map((entry) => (
                <article key={entry.q} className="rounded-2xl border border-[var(--border-soft)] bg-[var(--panel-muted)] p-4">
                  <h3 className="font-bold text-[var(--text-strong)]">{entry.q}</h3>
                  <p className="mt-2 text-sm leading-7 text-[var(--text-main)]">{entry.a}</p>
                </article>
              ))}
            </div>
          </section>

          {Array.isArray(guide.endLinks) && guide.endLinks.length > 0 && (
            <section className="editorial-panel rounded-[26px] border border-[var(--border-soft)] p-6 sm:p-8">
              <h2 className="text-2xl font-black tracking-tight text-[var(--text-strong)] sm:text-3xl">
                Continue with Decision Resources
              </h2>
              <div className="mt-4 grid gap-4 md:grid-cols-3">
                {guide.endLinks.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="rounded-xl border border-[var(--border-soft)] bg-[var(--panel-muted)] p-4 transition-colors hover:border-[var(--border-strong)] hover:bg-white"
                  >
                    <h3 className="text-sm font-black tracking-tight text-[var(--text-strong)]">{item.title}</h3>
                    <p className="mt-2 text-xs leading-6 text-[var(--text-muted)]">{item.body}</p>
                  </Link>
                ))}
              </div>
            </section>
          )}

          <section className="editorial-panel rounded-[26px] border border-[var(--border-soft)] p-6 sm:p-8">
            <h2 className="text-2xl font-black tracking-tight text-[var(--text-strong)] sm:text-3xl">
              Sources and Last Updated Date
            </h2>
            <p className="mt-3 text-sm text-[var(--text-main)]">Last updated: {guide.lastUpdated}</p>
            <ul className="mt-4 space-y-2 text-sm leading-7 text-[var(--text-main)]">
              {guide.sources.map((source) =>
                source.href.startsWith('http') ? (
                  <li key={source.href}>
                    <a href={source.href} target="_blank" rel="noopener noreferrer" className="font-semibold text-[var(--accent)] hover:text-[var(--accent-strong)]">
                      {source.label}
                    </a>
                  </li>
                ) : (
                  <li key={source.href}>
                    <Link href={source.href} className="font-semibold text-[var(--accent)] hover:text-[var(--accent-strong)]">
                      {source.label}
                    </Link>
                  </li>
                ),
              )}
            </ul>
          </section>
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
          </div>
        </aside>
      </div>
    </div>
  );
}

function PrecisionStrategyLayout({ guide }) {
  const sectionLinks = [
    { id: 'precision-families', label: 'Precision Families' },
    { id: 'comparison-table', label: 'Comparison Table' },
    { id: 'memory-calculator', label: 'Memory Calculator' },
    { id: 'benchmark-results', label: 'Practical Benchmarks' },
    { id: 'benchmark-runner', label: 'Benchmark Runner' },
    { id: 'tradeoff-chart', label: 'Tradeoff Chart' },
    { id: 'compatibility-matrix', label: 'Compatibility Matrix' },
    { id: 'cost-estimator', label: 'Cost Estimator' },
    { id: 'scenario-mapping', label: 'Scenario Mapping' },
    { id: 'precision-recommender', label: 'Recommender' },
    { id: 'regression-pack', label: 'Regression Pack' },
    { id: 'response-diff', label: 'Response Diff' },
    { id: 'sources-methodology', label: 'Sources' },
  ];

  return (
    <div className="shell-container py-10">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-start">
        <div className="min-w-0 space-y-8">
          <section className="relative overflow-hidden rounded-[30px] border border-[var(--border-soft)] bg-white px-6 py-8 shadow-[0_18px_50px_rgba(48,67,95,0.08)] sm:px-10 sm:py-10">
            <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-[rgba(54,87,132,0.12)] blur-3xl" />
            <div className="pointer-events-none absolute -bottom-20 -left-16 h-56 w-56 rounded-full bg-[rgba(37,99,235,0.10)] blur-3xl" />

            <p className="section-kicker">{guide.category}</p>
            <h1 className="mt-3 max-w-4xl text-3xl font-black tracking-tight text-[var(--text-strong)] sm:text-5xl">
              Precision Strategy
            </h1>
            <p className="mt-4 max-w-4xl text-sm leading-7 text-[var(--text-muted)] sm:text-base">
              Understand deployment tradeoffs across FP32, TF32, BF16, FP16, INT8, INT4, GPTQ, AWQ, and GGUF quantizations.
              Precision decides the balance between memory, speed, cost, and output quality.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <a
                href="#comparison-table"
                className="rounded-xl bg-[var(--accent)] px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] text-white transition hover:bg-[var(--accent-strong)]"
              >
                Compare Precisions
              </a>
              <a
                href="#memory-calculator"
                className="rounded-xl border border-[var(--border-strong)] bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] text-[var(--text-strong)] transition hover:bg-[var(--panel-muted)]"
              >
                Run Memory Calculator
              </a>
              <a
                href="#benchmark-results"
                className="rounded-xl border border-[var(--border-strong)] bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] text-[var(--text-strong)] transition hover:bg-[var(--panel-muted)]"
              >
                View Benchmarks
              </a>
            </div>
          </section>

          {Array.isArray(guide.whatYouWillLearn) && guide.whatYouWillLearn.length > 0 && (
            <section className="editorial-panel rounded-[26px] border border-[var(--border-soft)] p-6 sm:p-8">
              <h2 className="text-2xl font-black tracking-tight text-[var(--text-strong)] sm:text-3xl">
                What You Will Learn
              </h2>
              <ul className="mt-4 space-y-2 text-sm leading-7 text-[var(--text-main)] sm:text-base">
                {guide.whatYouWillLearn.map((point) => (
                  <li key={point}>- {point}</li>
                ))}
              </ul>
            </section>
          )}

          <PrecisionStrategyWorkbench />

          <section className="editorial-panel rounded-[26px] border border-[var(--border-soft)] p-6 sm:p-8">
            <h2 className="text-2xl font-black tracking-tight text-[var(--text-strong)] sm:text-3xl">
              Deployment Checklist
            </h2>
            <ul className="mt-4 space-y-2 text-sm leading-7 text-[var(--text-main)] sm:text-base">
              {guide.checklist.map((item) => (
                <li key={item}>- {item}</li>
              ))}
            </ul>
          </section>

          <section className="editorial-panel rounded-[26px] border border-[var(--border-soft)] p-6 sm:p-8">
            <h2 className="text-2xl font-black tracking-tight text-[var(--text-strong)] sm:text-3xl">FAQ</h2>
            <div className="mt-4 space-y-4">
              {guide.faq.map((entry) => (
                <article key={entry.q} className="rounded-2xl border border-[var(--border-soft)] bg-[var(--panel-muted)] p-4">
                  <h3 className="font-bold text-[var(--text-strong)]">{entry.q}</h3>
                  <p className="mt-2 text-sm leading-7 text-[var(--text-main)]">{entry.a}</p>
                </article>
              ))}
            </div>
          </section>
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
          </div>
        </aside>
      </div>
    </div>
  );
}

export async function generateStaticParams() {
  return getAllGuides().map((guide) => ({ slug: guide.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const guide = getGuideBySlug(slug);
  if (!guide) {
    return pageMetadata({
      title: 'Guide Not Found',
      description: 'The guide you requested could not be found.',
      path: `/guides/${slug}`,
    });
  }

  return pageMetadata({
    title: guide.title,
    description: guide.description,
    path: `/guides/${guide.slug}`,
    keywords: [guide.category, 'AI guide', 'InnoAI'],
    type: 'article',
  });
}

export default async function GuideDetailPage({ params }) {
  const { slug } = await params;
  const guide = getGuideBySlug(slug);
  if (!guide) notFound();
  const guidePath = `/guides/${guide.slug}`;
  const guideUrl = absoluteUrl(guidePath);
  const publishedIso = new Date(guide.publishedDate || guide.lastUpdated).toISOString();
  const updatedIso = new Date(guide.lastUpdated).toISOString();

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: guide.title,
    description: guide.description,
    datePublished: publishedIso,
    dateModified: updatedIso,
    author: {
      '@type': 'Organization',
      name: guide.author,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
    },
    mainEntityOfPage: guideUrl,
    articleSection: guide.category,
    keywords: [guide.category, 'AI guide', 'deployment guide'],
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: absoluteUrl('/'),
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Guides',
        item: absoluteUrl('/guides'),
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: guide.title,
        item: guideUrl,
      },
    ],
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: guide.faq.map((entry) => ({
      '@type': 'Question',
      name: entry.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: entry.a,
      },
    })),
  };

  const journeyLinks = [
    {
      href: '/compare',
      title: 'Compare shortlisted models',
      body: 'Validate architecture, context, and adoption signals side by side.',
    },
    {
      href: '/recommender',
      title: 'Get a personalized recommendation',
      body: 'Match model options to your budget, hardware, and deployment goals.',
    },
    {
      href: '/gpu/tools/vram-calculator',
      title: 'Estimate deployment memory',
      body: 'Calculate VRAM needs before production rollout and avoid sizing mistakes.',
    },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      {guide.slug === 'model-selection-mistakes' ? (
        <SelectionPitfallsLayout guide={guide} />
      ) : guide.slug === 'choose-ai-model-by-gpu-budget' ? (
        <BudgetFrameworkLayout guide={guide} />
      ) : guide.slug === 'rag-vs-fine-tuning' ? (
        <RagVsFineTuningLayout guide={guide} />
      ) : guide.slug === 'quantization-4bit-8bit-fp16' ? (
        <PrecisionStrategyLayout guide={guide} />
      ) : (
        <div className="shell-container py-10">
          <article className="w-full">
        <div className="editorial-panel rounded-[24px] px-6 py-8 sm:px-10">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-[var(--accent)]">{guide.category}</p>
          <h1 className="mt-3 text-4xl font-black tracking-tight text-[var(--text-strong)] sm:text-5xl">
            {guide.title}
          </h1>
          <p className="mt-5 text-[15px] leading-8 text-[var(--text-muted)]">{guide.description}</p>
          <div className="mt-6 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-[var(--accent-soft)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--accent)]">
              {guide.difficulty}
            </span>
            <span className="rounded-full bg-[var(--panel-muted)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--text-muted)]">
              Quality {guide.qualityVersion}
            </span>
          </div>
          <div className="mt-4 flex flex-wrap gap-4 text-xs font-semibold text-[var(--text-faint)]">
            <span>Author: {guide.author}</span>
            <span>Reviewed by: {guide.reviewedBy}</span>
            <span>{guide.readTime}</span>
            <span>Published: {guide.publishedDate}</span>
            <span>Last updated: {guide.lastUpdated}</span>
          </div>
        </div>

        <section className="mt-8 rounded-2xl border border-[var(--border-soft)] bg-white p-6">
          <h2 className="text-2xl font-black tracking-tight text-[var(--text-strong)]">What You Will Learn</h2>
          <ul className="mt-4 space-y-3 text-sm leading-7 text-[var(--text-muted)]">
            {guide.whatYouWillLearn.map((point) => (
              <li key={point}>- {point}</li>
            ))}
          </ul>
        </section>

        <section className="mt-8 rounded-2xl border border-[var(--border-soft)] bg-white p-6">
          <h2 className="text-2xl font-black tracking-tight text-[var(--text-strong)]">Author and Review</h2>
          <div className="mt-4 space-y-3 text-sm leading-7 text-[var(--text-muted)]">
            <p>Author: {guide.author}</p>
            <p>Technical review: {guide.reviewedBy}</p>
            <p>
              Review process: Content is reviewed for technical clarity, deployment realism, and consistency with
              currently published product pages and tools.
            </p>
          </div>
        </section>

        <section className="mt-8 rounded-2xl border border-[var(--border-soft)] bg-white p-6">
          <h2 className="text-2xl font-black tracking-tight text-[var(--text-strong)]">Key Takeaways</h2>
          <ul className="mt-4 space-y-3 text-sm leading-7 text-[var(--text-muted)]">
            {guide.keyTakeaways.map((point) => (
              <li key={point}>- {point}</li>
            ))}
          </ul>
        </section>

        <section className="mt-8 space-y-6">
          {guide.sections.map((section) => (
            <div key={section.heading} className="rounded-2xl border border-[var(--border-soft)] bg-white p-6">
              <h2 className="text-2xl font-black tracking-tight text-[var(--text-strong)]">{section.heading}</h2>
              <p className="mt-4 text-sm leading-8 text-[var(--text-muted)]">{section.content}</p>
            </div>
          ))}
        </section>

        <section className="mt-8 rounded-2xl border border-[var(--border-soft)] bg-white p-6">
          <h2 className="text-2xl font-black tracking-tight text-[var(--text-strong)]">Implementation Checklist</h2>
          <ul className="mt-4 space-y-3 text-sm leading-7 text-[var(--text-muted)]">
            {guide.checklist.map((item) => (
              <li key={item}>- {item}</li>
            ))}
          </ul>
        </section>

        <section className="mt-8 rounded-2xl border border-[var(--border-soft)] bg-white p-6">
          <h2 className="text-2xl font-black tracking-tight text-[var(--text-strong)]">FAQ</h2>
          <div className="mt-4 space-y-5">
            {guide.faq.map((entry) => (
              <div key={entry.q}>
                <h3 className="text-base font-bold text-[var(--text-strong)]">{entry.q}</h3>
                <p className="mt-2 text-sm leading-7 text-[var(--text-muted)]">{entry.a}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-8 rounded-2xl border border-[var(--border-soft)] bg-white p-6">
          <h2 className="text-2xl font-black tracking-tight text-[var(--text-strong)]">Related Guides</h2>
          <div className="mt-4 flex flex-wrap gap-3">
            {guide.related.map((slug) => (
              <Link
                key={slug}
                href={`/guides/${slug}`}
                className="rounded-xl border border-[var(--border-soft)] px-4 py-2 text-sm font-semibold text-[var(--accent)] hover:text-[var(--accent-strong)]"
              >
                {slug.replace(/-/g, ' ')}
              </Link>
            ))}
          </div>
        </section>

        {Array.isArray(guide.endLinks) && guide.endLinks.length > 0 && (
          <section className="mt-8 rounded-2xl border border-[var(--border-soft)] bg-white p-6">
            <h2 className="text-2xl font-black tracking-tight text-[var(--text-strong)]">Decision Resources</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {guide.endLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-xl border border-[var(--border-soft)] bg-[var(--panel-muted)] p-4 transition-colors hover:border-[var(--border-strong)] hover:bg-white"
                >
                  <h3 className="text-sm font-black tracking-tight text-[var(--text-strong)]">{item.title}</h3>
                  <p className="mt-2 text-xs leading-6 text-[var(--text-muted)]">{item.body}</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        <section className="mt-8 rounded-2xl border border-[var(--border-soft)] bg-white p-6">
          <h2 className="text-2xl font-black tracking-tight text-[var(--text-strong)]">Sources and Methodology</h2>
          <p className="mt-3 text-sm leading-7 text-[var(--text-muted)]">
            This guide combines public model metadata with practical deployment heuristics used in InnoAI tools.
          </p>
          <ul className="mt-4 space-y-2 text-sm leading-7 text-[var(--text-muted)]">
            {guide.sources.map((source) => {
              const isExternal = source.href.startsWith('http');
              if (isExternal) {
                return (
                  <li key={source.href}>
                    <a href={source.href} target="_blank" rel="noopener noreferrer" className="font-semibold text-[var(--accent)] hover:text-[var(--accent-strong)]">
                      {source.label}
                    </a>
                  </li>
                );
              }

              return (
                <li key={source.href}>
                  <Link href={source.href} className="font-semibold text-[var(--accent)] hover:text-[var(--accent-strong)]">
                    {source.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="mt-8 rounded-2xl border border-[var(--border-soft)] bg-white p-6">
          <h2 className="text-2xl font-black tracking-tight text-[var(--text-strong)]">Continue Your Journey</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {journeyLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-xl border border-[var(--border-soft)] bg-[var(--panel-muted)] p-4 transition-colors hover:border-[var(--border-strong)] hover:bg-white"
              >
                <h3 className="text-sm font-black tracking-tight text-[var(--text-strong)]">{item.title}</h3>
                <p className="mt-2 text-xs leading-6 text-[var(--text-muted)]">{item.body}</p>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-8 rounded-2xl border border-[var(--border-soft)] bg-[var(--panel-muted)] p-6">
          <h2 className="text-xl font-black tracking-tight text-[var(--text-strong)]">Editorial Disclaimer</h2>
          <p className="mt-3 text-sm leading-7 text-[var(--text-muted)]">
            This guide is for informational and educational purposes only. Validate assumptions against your own
            workload, compliance requirements, and production environment before implementation.
          </p>
        </section>

          <div className="mt-8">
            <Link href="/guides" className="text-sm font-bold text-[var(--accent)] hover:text-[var(--accent-strong)]">
              Back to all guides
            </Link>
          </div>
        </article>
        </div>
      )}
    </>
  );
}
