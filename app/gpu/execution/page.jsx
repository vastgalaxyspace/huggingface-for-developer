import { breadcrumbSchema, pageMetadata } from '../../../src/lib/seo';
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
  const breadcrumb = breadcrumbSchema([
    { name: 'Home', path: '/' },
    { name: 'GPU', path: '/gpu' },
    { name: 'Execution Model', path: '/gpu/execution' },
  ]);

  return (
    <div className="bg-slate-100 py-8 md:py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
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

        <section className="rounded-[24px] border border-[var(--border-soft)] bg-white p-6 shadow-[0_10px_24px_rgba(45,67,92,0.05)] md:p-8">
          <h2 className="text-2xl font-black tracking-tight text-[var(--text-strong)]">How a warp actually executes</h2>
          <p className="mt-4 text-sm leading-7 text-[var(--text-muted)]">
            A GPU does not schedule individual threads. On NVIDIA hardware it schedules <strong>warps</strong> — groups
            of 32 threads that issue the same instruction in the same cycle. This is the SIMT (single instruction,
            multiple thread) model, and it is the single most important thing to understand about GPU performance,
            because almost every surprising result traces back to it. Thirty-two threads share one instruction pointer,
            so they move through your kernel together whether or not that is what your code implies. AMD hardware uses
            the same idea with a 64-thread wavefront (32 on RDNA), so the reasoning transfers.
          </p>
          <p className="mt-4 text-sm leading-7 text-[var(--text-muted)]">
            When threads inside one warp hit a branch and disagree — some take the <code>if</code>, others the{' '}
            <code>else</code> — the hardware cannot run both at once. It executes one path with the disagreeing lanes
            masked off, then the other path with the mask inverted. Both paths cost full time, and the masked lanes
            contribute nothing. That is warp divergence. A two-way branch can halve throughput; a 32-way switch where
            every lane picks a different case can, in the worst case, cost 32× the time of a uniform warp while doing
            the same amount of useful work. Since Volta, independent thread scheduling lets warps reconverge more
            flexibly, but the cost of executing both sides remains.
          </p>
          <p className="mt-4 text-sm leading-7 text-[var(--text-muted)]">
            The critical detail people miss: divergence only costs you <em>within</em> a warp. If threads 0–31 all take
            the true branch and threads 32–63 all take the false branch, those are two different warps and there is no
            penalty at all. This is why the fix for divergence is almost never removing the branch — it is reorganizing
            the data so that threads that will take the same path land in the same warp. Sorting or bucketing work by
            branch condition before launching the kernel routinely recovers most of the loss.
          </p>
        </section>

        <section className="rounded-[24px] border border-[var(--border-soft)] bg-white p-6 shadow-[0_10px_24px_rgba(45,67,92,0.05)] md:p-8">
          <h2 className="text-2xl font-black tracking-tight text-[var(--text-strong)]">Occupancy and latency hiding</h2>
          <p className="mt-4 text-sm leading-7 text-[var(--text-muted)]">
            A GPU tolerates slow memory not by making it faster but by having enough other work queued to run while it
            waits. A read from global memory costs hundreds of cycles. Rather than stall, the streaming multiprocessor
            swaps to another resident warp and issues its instruction instead. Occupancy — the ratio of resident warps
            to the hardware maximum — measures how much of that alternative work is available.
          </p>
          <p className="mt-4 text-sm leading-7 text-[var(--text-muted)]">
            Occupancy is capped by whichever per-SM resource runs out first: registers per thread, shared memory per
            block, or the block and warp limits themselves. A kernel using many registers per thread lets fewer warps
            stay resident, which reduces the pool available to hide latency. This is why register pressure shows up as
            a memory-latency problem even though nothing about the memory changed.
          </p>
          <p className="mt-4 text-sm leading-7 text-[var(--text-muted)]">
            The common misconception is that higher occupancy is always better. It is not. Occupancy only needs to be
            high enough to cover the latency actually present; past that point, pushing it higher usually means cutting
            registers per thread, which forces spills to local memory and makes the kernel slower. Treat occupancy as a
            floor to clear, not a number to maximize. Measure with the{' '}
            <Link href="/gpu/tools/kernel-occupancy-estimator" className="font-semibold text-[var(--accent)] hover:text-[var(--accent-strong)]">
              occupancy estimator
            </Link>
            , then confirm against real kernel timings rather than trusting the ratio alone.
          </p>
        </section>

        <section className="rounded-[24px] border border-[var(--border-soft)] bg-white p-6 shadow-[0_10px_24px_rgba(45,67,92,0.05)] md:p-8">
          <h2 className="text-2xl font-black tracking-tight text-[var(--text-strong)]">Frequently asked questions</h2>
          <div className="mt-6 divide-y divide-[var(--border-soft)]">
            <div className="py-5 first:pt-0">
              <h3 className="text-base font-black text-[var(--text-strong)]">What is a warp?</h3>
              <p className="mt-2 text-sm leading-7 text-[var(--text-muted)]">
                A group of 32 threads that execute the same instruction together on NVIDIA GPUs. It is the smallest
                unit the hardware actually schedules. AMD calls the equivalent a wavefront, sized 64 or 32 depending on
                architecture.
              </p>
            </div>
            <div className="py-5">
              <h3 className="text-base font-black text-[var(--text-strong)]">Does every if statement cause divergence?</h3>
              <p className="mt-2 text-sm leading-7 text-[var(--text-muted)]">
                No. A branch is free when all 32 threads in the warp evaluate it the same way — the warp simply takes
                one path. Divergence only occurs when threads inside the same warp disagree.
              </p>
            </div>
            <div className="py-5">
              <h3 className="text-base font-black text-[var(--text-strong)]">How do I fix warp divergence?</h3>
              <p className="mt-2 text-sm leading-7 text-[var(--text-muted)]">
                Reorganize data so threads taking the same path share a warp — sort or bucket by the branch condition
                before launching. Replacing short branches with predicated arithmetic also helps, since the hardware
                can compute both results and select without serializing.
              </p>
            </div>
            <div className="py-5 last:pb-0">
              <h3 className="text-base font-black text-[var(--text-strong)]">Is 100% occupancy the goal?</h3>
              <p className="mt-2 text-sm leading-7 text-[var(--text-muted)]">
                No. You need enough resident warps to hide memory latency; beyond that, raising occupancy usually means
                fewer registers per thread and spills to local memory, which costs more than the extra warps gain.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
