"use client";

import Link from "next/link";
import SmartWizard from "../components/SmartWizard";

export default function RecommenderPage() {
  return (
    <div className="min-h-[calc(100vh-78px)] py-8 sm:py-12">
      <div className="shell-container space-y-8">
        <section className="editorial-panel rounded-[28px] px-6 py-8 sm:px-10 sm:py-10">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-[var(--accent)]">Decision Wizard</p>
          <h1 className="mt-3 text-4xl font-black tracking-tight text-[var(--text-strong)] sm:text-5xl">
            AI Model Recommender
          </h1>
          <p className="mt-4 max-w-4xl text-[15px] leading-8 text-[var(--text-muted)]">
            Use this workflow when you do not want to manually browse hundreds of models. The recommender narrows the
            field using your task, constraints, and practical deployment priorities so you can move faster from idea to
            shortlist.
          </p>
          <div className="mt-6 flex flex-wrap gap-3 text-xs font-semibold text-[var(--text-faint)]">
            <span>Best for early-stage model selection</span>
            <span>Use case + constraints + priorities</span>
            <span>Works well before side-by-side comparison</span>
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
          <article className="rounded-[24px] border border-[var(--border-soft)] bg-white p-6 shadow-[0_12px_28px_rgba(48,67,95,0.06)]">
            <h2 className="text-2xl font-black tracking-tight text-[var(--text-strong)]">How to use this wizard</h2>
            <ol className="mt-4 space-y-3 text-sm leading-7 text-[var(--text-muted)]">
              <li>1. Define the actual job you need the model to do, not the model family you already like.</li>
              <li>2. Set hardware, budget, privacy, and deployment constraints honestly.</li>
              <li>3. Use the result as a shortlist, then verify finalists with the comparison and GPU tools.</li>
              <li>4. Validate the top option on your own prompts before treating it as production-ready.</li>
            </ol>
          </article>

          <article className="rounded-[24px] border border-[var(--border-soft)] bg-[var(--panel-muted)] p-6">
            <h2 className="text-2xl font-black tracking-tight text-[var(--text-strong)]">When not to use it</h2>
            <div className="mt-4 space-y-3 text-sm leading-7 text-[var(--text-muted)]">
              <p>
                If you already have 2 or 3 finalists, skip straight to{' '}
                <Link href="/compare" className="font-semibold text-[var(--accent)] hover:text-[var(--accent-strong)]">
                  model comparison
                </Link>.
              </p>
              <p>
                If you already know the model and just need hardware guidance, go directly to the{' '}
                <Link href="/gpu/tools/gpu-picker" className="font-semibold text-[var(--accent)] hover:text-[var(--accent-strong)]">
                  GPU picker
                </Link>{' '}
                or{' '}
                <Link href="/gpu/tools/vram-calculator" className="font-semibold text-[var(--accent)] hover:text-[var(--accent-strong)]">
                  VRAM calculator
                </Link>.
              </p>
            </div>
          </article>
        </section>

        <SmartWizard />

        <section className="grid gap-5 md:grid-cols-3">
          <article className="rounded-[24px] border border-[var(--border-soft)] bg-white p-6 shadow-[0_12px_28px_rgba(48,67,95,0.05)]">
            <h2 className="text-lg font-black tracking-tight text-[var(--text-strong)]">What the output means</h2>
            <p className="mt-3 text-sm leading-7 text-[var(--text-muted)]">
              Treat the output as a ranked starting point, not a final verdict. The right model still depends on your
              own prompts, throughput targets, and downstream workflow.
            </p>
          </article>
          <article className="rounded-[24px] border border-[var(--border-soft)] bg-white p-6 shadow-[0_12px_28px_rgba(48,67,95,0.05)]">
            <h2 className="text-lg font-black tracking-tight text-[var(--text-strong)]">Best follow-up workflow</h2>
            <p className="mt-3 text-sm leading-7 text-[var(--text-muted)]">
              Take the top recommendation into the comparison workspace, then confirm memory and GPU fit before
              adopting it for a real app or deployment pipeline.
            </p>
          </article>
          <article className="rounded-[24px] border border-[var(--border-soft)] bg-white p-6 shadow-[0_12px_28px_rgba(48,67,95,0.05)]">
            <h2 className="text-lg font-black tracking-tight text-[var(--text-strong)]">Related guides</h2>
            <p className="mt-3 text-sm leading-7 text-[var(--text-muted)]">
              Read{' '}
              <Link href="/guides/model-selection-mistakes" className="font-semibold text-[var(--accent)] hover:text-[var(--accent-strong)]">
                Selection Pitfalls
              </Link>{' '}
              and{' '}
              <Link href="/guides/open-vs-closed-models" className="font-semibold text-[var(--accent)] hover:text-[var(--accent-strong)]">
                Open vs Closed Models
              </Link>{' '}
              if you want the reasoning framework behind the recommendation flow.
            </p>
          </article>
        </section>
      </div>
    </div>
  );
}
