import { pageMetadata } from '../../../src/lib/seo';
import WarpDivergencePage from '../../../src/components/warp-divergence/WarpDivergencePage';
import Link from 'next/link';

export const metadata = pageMetadata({
  title: 'GPU Execution Model',
  description:
    'Understand warps, divergence, and scheduling behavior with an interactive GPU execution model walkthrough.',
  path: '/gpu/execution',
  keywords: ['GPU execution model', 'warp divergence', 'CUDA warps'],
});

export default function Page() {
  return (
    <div className="bg-slate-100 py-8 md:py-12">
      <div className="shell-container space-y-6">
        <section className="rounded-[24px] border border-[var(--border-soft)] bg-white px-6 py-8 shadow-[0_12px_30px_rgba(31,45,61,0.08)] sm:px-10">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--text-faint)]">Execution / Warp Behavior</p>
          <h1 className="mt-3 text-4xl font-black tracking-tight text-[var(--text-strong)] sm:text-5xl">
            GPU Execution Model
          </h1>
          <p className="mt-5 max-w-4xl text-[15px] leading-8 text-[var(--text-muted)]">
            This page explains how warps, divergence, and scheduling behavior affect real GPU utilization. The goal is
            to connect abstract CUDA concepts to practical outcomes like underutilized lanes, hidden latency, and
            inconsistent kernel efficiency.
          </p>
        </section>

        <WarpDivergencePage />

        <section className="grid gap-5 md:grid-cols-3">
          <article className="rounded-[24px] border border-[var(--border-soft)] bg-white p-6 shadow-[0_10px_24px_rgba(45,67,92,0.05)]">
            <h2 className="text-lg font-black tracking-tight text-[var(--text-strong)]">Key concept</h2>
            <p className="mt-3 text-sm leading-7 text-[var(--text-muted)]">
              A warp does best when many lanes stay active together. The more lanes peel off into separate execution
              paths, the lower your effective utilization becomes.
            </p>
          </article>
          <article className="rounded-[24px] border border-[var(--border-soft)] bg-white p-6 shadow-[0_10px_24px_rgba(45,67,92,0.05)]">
            <h2 className="text-lg font-black tracking-tight text-[var(--text-strong)]">Common mistake</h2>
            <p className="mt-3 text-sm leading-7 text-[var(--text-muted)]">
              Developers often focus only on core count or clock speed while ignoring control-flow structure. Divergence
              can quietly dominate performance even when hardware looks strong on paper.
            </p>
          </article>
          <article className="rounded-[24px] border border-[var(--border-soft)] bg-white p-6 shadow-[0_10px_24px_rgba(45,67,92,0.05)]">
            <h2 className="text-lg font-black tracking-tight text-[var(--text-strong)]">Related pages</h2>
            <p className="mt-3 text-sm leading-7 text-[var(--text-muted)]">
              Pair this page with{' '}
              <Link href="/gpu/hardware" className="font-semibold text-[var(--accent)] hover:text-[var(--accent-strong)]">
                hardware fundamentals
              </Link>{' '}
              and{' '}
              <Link href="/gpu/performance" className="font-semibold text-[var(--accent)] hover:text-[var(--accent-strong)]">
                roofline analysis
              </Link>{' '}
              for a complete execution-to-performance path.
            </p>
          </article>
        </section>
      </div>
    </div>
  );
}
