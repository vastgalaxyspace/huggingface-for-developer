import Link from 'next/link';
import { ContentCard, FaqList, FaqSchema, InfoTile, Prose, SectionHeading } from '../gpu/toolContentPrimitives';

const FAQ_ITEMS = [
  {
    q: 'What is warp divergence?',
    a: 'Warp divergence happens when threads within the same warp (a group of 32 threads on NVIDIA GPUs that execute in lockstep) take different branches of a conditional. Because the warp shares one instruction pointer, the hardware must execute each taken path serially while masking off the threads that did not take it. The result is that a divergent branch effectively runs the if and else paths one after another instead of in parallel, wasting execution slots.',
  },
  {
    q: 'Why does warp divergence slow down GPU kernels?',
    a: 'A GPU\'s efficiency comes from 32 threads executing the same instruction at once. When a branch splits the warp, the SIMT hardware serializes the divergent paths: while one subset of threads runs the taken path, the others sit idle under a mask, then they swap. A warp split evenly across two paths can lose up to half its throughput; more paths mean more serialization. The cost is proportional to how many distinct paths the warp must execute, not to how many threads diverge.',
  },
  {
    q: 'How do I avoid warp divergence?',
    a: 'Structure branches so that all 32 threads in a warp tend to take the same path. Techniques include aligning conditionals to warp boundaries (branch on threadIdx.x / 32 rather than threadIdx.x % 2), sorting or bucketing data so similar work lands in the same warp, replacing small branches with predication or arithmetic (for example min/max or select instead of if), and moving data-dependent branches out of the innermost loop. The visualizer above shows exactly which threads diverge for a given condition.',
  },
  {
    q: 'Is all branching bad on a GPU?',
    a: 'No. A branch where every thread in the warp evaluates the condition the same way (a "uniform" branch) costs almost nothing, because the whole warp takes one path with no serialization. Divergence only occurs when threads within the same warp disagree. So branches on values that are constant across a warp — like a kernel-wide flag or a block-level decision — are cheap; branches on per-thread data are the ones to scrutinize.',
  },
  {
    q: 'What is predication and how does it help?',
    a: 'Predication replaces a short branch with unconditional instructions that are conditionally committed per thread using a predicate mask. Instead of jumping, every thread executes both sides but only writes the result for its active predicate. For small conditional bodies this is faster than a real branch because it avoids the serialization of divergence entirely. Compilers apply predication automatically for tiny branches, but you can encourage it by keeping conditional bodies short and side-effect-light.',
  },
  {
    q: 'Does warp divergence matter for AI and tensor workloads?',
    a: 'For dense tensor operations like matrix multiply it rarely matters, because those kernels are branch-free and uniform. It becomes relevant in sparse operations, mixture-of-experts routing, custom sampling and top-k kernels, and data-dependent attention variants, where per-element decisions can split a warp. If you write custom CUDA or Triton kernels for these cases, divergence is worth checking; for standard library operators it is usually already optimized away.',
  },
];

export default function WarpDivergenceContent() {
  return (
    <>
      <FaqSchema items={FAQ_ITEMS} />

      <ContentCard>
        <SectionHeading>Why warp divergence limits GPU efficiency</SectionHeading>
        <Prose>
          A GPU gets its throughput from executing the same instruction across 32 threads at once. That model is
          extraordinarily efficient right up until the threads disagree. When a conditional sends some threads down
          the if path and others down the else path, the warp can no longer run as one — the hardware serializes the
          paths, running each while masking off the threads that did not take it. Understanding when this happens,
          and how much it costs, is the difference between a custom kernel that approaches peak throughput and one
          that quietly runs at half speed. This visualizer maps a branch condition onto a warp and shows exactly
          which threads split off.
        </Prose>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <InfoTile title="Lockstep execution">
            The 32 threads of a warp share one instruction pointer. They are fastest when they all do the same
            thing on the same cycle — the SIMT execution model that makes GPUs efficient.
          </InfoTile>
          <InfoTile title="Serialized paths">
            When a branch splits a warp, the taken and not-taken paths run one after another under a thread mask.
            An even split can halve throughput; more paths cost proportionally more.
          </InfoTile>
          <InfoTile title="Uniform branches are free">
            If every thread in the warp evaluates a condition the same way, there is no divergence and no penalty.
            The problem is disagreement within a warp, not branching itself.
          </InfoTile>
        </div>
      </ContentCard>

      <ContentCard>
        <SectionHeading>Writing divergence-friendly kernels</SectionHeading>
        <Prose>
          The core technique is to make threads in the same warp agree. Branching on <code className="rounded bg-gray-100 px-1 py-0.5 text-[13px]">threadIdx.x / 32</code> keeps
          a whole warp on one path, whereas branching on <code className="rounded bg-gray-100 px-1 py-0.5 text-[13px]">threadIdx.x % 2</code> splits every warp in half. Sorting or
          bucketing data so that similar work lands together, replacing tiny branches with predication or arithmetic
          selects, and hoisting data-dependent conditionals out of hot inner loops all reduce the number of distinct
          paths a warp must execute. Try a few conditions in the visualizer to build intuition for which patterns
          diverge and which stay uniform.
        </Prose>
        <Prose>
          Keep the optimization in perspective: dense, branch-free kernels like matrix multiply never diverge, so
          this matters most for custom sparse, routing, sampling, and attention kernels. Profile first — if a kernel
          is memory bound, eliminating divergence may not change its runtime at all.
        </Prose>
      </ContentCard>

      <FaqList items={FAQ_ITEMS} />

      <ContentCard>
        <SectionHeading>Keep going</SectionHeading>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          <li><Link href="/gpu/tools/kernel-occupancy-estimator" className="font-semibold text-[#23425f] hover:text-[#18324f]">Kernel Occupancy Estimator →</Link></li>
          <li><Link href="/gpu/learning/execution-model" className="font-semibold text-[#23425f] hover:text-[#18324f]">GPU Execution Model →</Link></li>
          <li><Link href="/gpu/learning/cuda-programming" className="font-semibold text-[#23425f] hover:text-[#18324f]">CUDA Programming model →</Link></li>
          <li><Link href="/gpu/tools/roofline-model-analyzer" className="font-semibold text-[#23425f] hover:text-[#18324f]">Roofline Model Analyzer →</Link></li>
        </ul>
      </ContentCard>
    </>
  );
}
