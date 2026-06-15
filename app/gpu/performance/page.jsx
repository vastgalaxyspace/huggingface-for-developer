import { Suspense } from 'react';
import RooflineAnalyzerClient from '../../../src/components/roofline/RooflineAnalyzerClient';
import { pageMetadata } from '../../../src/lib/seo';
import Link from 'next/link';

export const metadata = pageMetadata({
  title: 'GPU Performance Analysis',
  description:
    'Explore roofline analysis concepts and inspect whether your GPU workloads are compute-bound or memory-bound.',
  path: '/gpu/performance',
  keywords: ['GPU performance', 'roofline analysis', 'memory bound vs compute bound'],
});

export default function GpuPerformancePage() {
  return (
    <div className="bg-slate-100 py-8 md:py-12">
      <div className="shell-container space-y-6">
        <section className="rounded-[24px] border border-[var(--border-soft)] bg-white px-6 py-8 shadow-[0_12px_30px_rgba(31,45,61,0.08)] sm:px-10">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--text-faint)]">Performance / Bottleneck Analysis</p>
          <h1 className="mt-3 text-4xl font-black tracking-tight text-[var(--text-strong)] sm:text-5xl">
            GPU Performance Analysis
          </h1>
          <p className="mt-5 max-w-4xl text-[15px] leading-8 text-[var(--text-muted)]">
            Use this page to understand whether a workload is limited by memory bandwidth or compute throughput. The
            roofline model is useful because it turns low-level measurements into a decision you can act on: optimize
            memory movement, optimize arithmetic intensity, or accept that the kernel is already near a practical limit.
          </p>
        </section>

        <Suspense fallback={null}>
          <RooflineAnalyzerClient />
        </Suspense>

        <section className="grid gap-5 md:grid-cols-3">
          <article className="rounded-[24px] border border-[var(--border-soft)] bg-white p-6 shadow-[0_10px_24px_rgba(45,67,92,0.05)]">
            <h2 className="text-lg font-black tracking-tight text-[var(--text-strong)]">Memory-bound clue</h2>
            <p className="mt-3 text-sm leading-7 text-[var(--text-muted)]">
              If arithmetic intensity is low and bandwidth is saturated early, your biggest wins usually come from data
              movement, coalescing, caching, or tiling.
            </p>
          </article>
          <article className="rounded-[24px] border border-[var(--border-soft)] bg-white p-6 shadow-[0_10px_24px_rgba(45,67,92,0.05)]">
            <h2 className="text-lg font-black tracking-tight text-[var(--text-strong)]">Compute-bound clue</h2>
            <p className="mt-3 text-sm leading-7 text-[var(--text-muted)]">
              If arithmetic intensity is high and the roof is compute-limited, look at tensor core usage, instruction
              mix, occupancy, and whether your kernel is already close to hardware limits.
            </p>
          </article>
          <article className="rounded-[24px] border border-[var(--border-soft)] bg-white p-6 shadow-[0_10px_24px_rgba(45,67,92,0.05)]">
            <h2 className="text-lg font-black tracking-tight text-[var(--text-strong)]">Related workflows</h2>
            <p className="mt-3 text-sm leading-7 text-[var(--text-muted)]">
              Pair this page with the{' '}
              <Link href="/gpu/tools/kernel-occupancy-estimator" className="font-semibold text-[var(--accent)] hover:text-[var(--accent-strong)]">
                occupancy estimator
              </Link>{' '}
              and{' '}
              <Link href="/gpu/tools/warp-divergence" className="font-semibold text-[var(--accent)] hover:text-[var(--accent-strong)]">
                warp divergence visualizer
              </Link>{' '}
              to connect bottleneck analysis to kernel behavior.
            </p>
          </article>
        </section>
      </div>
    </div>
  );
}
