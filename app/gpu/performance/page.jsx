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

        <section className="rounded-[24px] border border-[var(--border-soft)] bg-white p-6 shadow-[0_10px_24px_rgba(45,67,92,0.05)] md:p-8">
          <h2 className="text-2xl font-black tracking-tight text-[var(--text-strong)]">Arithmetic intensity decides your ceiling</h2>
          <p className="mt-4 text-sm leading-7 text-[var(--text-muted)]">
            The roofline model rests on one ratio: <strong>arithmetic intensity</strong>, the number of floating-point
            operations a kernel performs per byte it moves from memory (FLOPs/byte). Every kernel sits somewhere on
            that axis, and where it sits determines which hardware limit it hits first. Below the ridge point — where
            the memory-bandwidth roof meets the peak-compute roof — you are bandwidth-bound and adding FLOPs is free.
            Above it you are compute-bound and only more math throughput helps.
          </p>
          <p className="mt-4 text-sm leading-7 text-[var(--text-muted)]">
            The numbers are stark for AI workloads. An H100 delivers roughly 3.3 TB/s of HBM3 bandwidth against
            hundreds of teraflops of tensor-core throughput, putting the ridge point far to the right. That means most
            LLM inference kernels are firmly memory-bound. Token-by-token decoding is the clearest case: each new token
            requires reading the entire weight matrix from memory to perform a single matrix-vector product, giving an
            arithmetic intensity close to 1 — hopeless on a machine that wants hundreds. This is why decode speed
            tracks memory bandwidth almost linearly and barely responds to a faster compute unit.
          </p>
          <p className="mt-4 text-sm leading-7 text-[var(--text-muted)]">
            The practical consequence is that batching is the single most effective optimization in LLM serving. Running
            one request reads the weights to produce one token. Running thirty-two requests together reads the same
            weights once and produces thirty-two tokens, multiplying arithmetic intensity by thirty-two and shifting the
            kernel toward the compute roof where the hardware is actually fast. That is the entire reason continuous
            batching exists, and why an idle-but-quantized model can still be slow while a busy one is efficient.
          </p>
        </section>

        <section className="rounded-[24px] border border-[var(--border-soft)] bg-white p-6 shadow-[0_10px_24px_rgba(45,67,92,0.05)] md:p-8">
          <h2 className="text-2xl font-black tracking-tight text-[var(--text-strong)]">Reading a roofline plot without fooling yourself</h2>
          <p className="mt-4 text-sm leading-7 text-[var(--text-muted)]">
            A point far below both roofs is not automatically a bandwidth problem. It usually means something else is
            wasting cycles: uncoalesced memory access, where threads in a warp read scattered addresses and force the
            memory system to issue many transactions instead of one; low occupancy that leaves no warps available to
            hide latency; or warp divergence serializing execution. Fix those before concluding the hardware is the
            limit — they move the measured point upward without any change to the roofs.
          </p>
          <p className="mt-4 text-sm leading-7 text-[var(--text-muted)]">
            Be careful which roof you compare against, too. Peak FLOPs figures quoted by vendors usually assume tensor
            cores at low precision with perfect utilization. If your kernel runs FP32 on the standard CUDA cores, the
            relevant ceiling is far lower than the marketing number, and a kernel that looks like it is achieving 10%
            of peak may already be near its real limit. Use the{' '}
            <Link href="/gpu/tools/roofline-model-analyzer" className="font-semibold text-[var(--accent)] hover:text-[var(--accent-strong)]">
              roofline analyzer
            </Link>{' '}
            with the precision your kernel actually uses, and confirm with measured timings rather than trusting a
            single plotted point.
          </p>
        </section>

        <section className="rounded-[24px] border border-[var(--border-soft)] bg-white p-6 shadow-[0_10px_24px_rgba(45,67,92,0.05)] md:p-8">
          <h2 className="text-2xl font-black tracking-tight text-[var(--text-strong)]">Frequently asked questions</h2>
          <div className="mt-6 divide-y divide-[var(--border-soft)]">
            <div className="py-5 first:pt-0">
              <h3 className="text-base font-black text-[var(--text-strong)]">What is arithmetic intensity?</h3>
              <p className="mt-2 text-sm leading-7 text-[var(--text-muted)]">
                Floating-point operations performed per byte moved from memory. It places a kernel on the roofline plot
                and determines whether bandwidth or compute is the binding constraint.
              </p>
            </div>
            <div className="py-5">
              <h3 className="text-base font-black text-[var(--text-strong)]">Why is LLM inference memory-bound?</h3>
              <p className="mt-2 text-sm leading-7 text-[var(--text-muted)]">
                Generating one token requires reading every weight once to do a single matrix-vector multiply, so
                arithmetic intensity is near 1 while modern GPUs need hundreds of FLOPs per byte to saturate compute.
                Decoding speed therefore scales with memory bandwidth, not peak FLOPs.
              </p>
            </div>
            <div className="py-5">
              <h3 className="text-base font-black text-[var(--text-strong)]">Does batching change the bottleneck?</h3>
              <p className="mt-2 text-sm leading-7 text-[var(--text-muted)]">
                Yes. Batch size multiplies arithmetic intensity because the same weights serve many sequences per read,
                moving the kernel from the memory roof toward the compute roof. It is the highest-leverage change in
                most serving stacks.
              </p>
            </div>
            <div className="py-5 last:pb-0">
              <h3 className="text-base font-black text-[var(--text-strong)]">My kernel is below both roofs — what now?</h3>
              <p className="mt-2 text-sm leading-7 text-[var(--text-muted)]">
                Look for uncoalesced memory access, insufficient occupancy to hide latency, or warp divergence. Those
                waste cycles without changing arithmetic intensity, and fixing them raises the measured point.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
