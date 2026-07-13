import Link from 'next/link';
import { ContentCard, FaqList, FaqSchema, InfoTile, Prose, SectionHeading } from './gpu/toolContentPrimitives';

const FAQ_ITEMS = [
  {
    q: 'What is GPU kernel occupancy?',
    a: 'Occupancy is the ratio of active warps resident on a streaming multiprocessor (SM) to the maximum number of warps the SM can hold. It measures how much of the SM\'s warp scheduling capacity a kernel actually uses. High occupancy gives the scheduler many warps to switch between, which is how the GPU hides memory and instruction latency. It is expressed as a percentage of the hardware limit.',
  },
  {
    q: 'What limits occupancy?',
    a: 'Three per-SM resources compete: registers per thread, shared memory per block, and the hard limits on threads and blocks per SM. Whichever runs out first caps occupancy. A kernel that uses many registers per thread, or a large shared-memory allocation per block, will hit its limit with fewer resident warps. The estimator shows which of the three resources is your binding constraint.',
  },
  {
    q: 'Does higher occupancy always mean faster kernels?',
    a: 'No — this is the most common misconception. Occupancy is a means, not an end. Above roughly 50–60%, adding more occupancy often yields no speedup because the SM already has enough warps to hide latency. Some highly optimized kernels deliberately run at low occupancy while using many registers per thread for instruction-level parallelism. Treat occupancy as a diagnostic ceiling, not a target to maximize blindly.',
  },
  {
    q: 'How do I increase occupancy when registers are the limit?',
    a: 'Reduce register pressure by simplifying the kernel, splitting it into smaller kernels, or capping registers with a launch-bounds hint (or the compiler\'s max-registers flag). Fewer registers per thread lets more warps stay resident. The trade-off is that spilling registers to local memory can hurt more than the extra occupancy helps, so measure end-to-end runtime, not just the occupancy number.',
  },
  {
    q: 'How does block size affect occupancy?',
    a: 'Block size determines how threads pack into the SM\'s fixed warp and block slots. A block size that is not a multiple of the warp size (32) wastes lanes, and very large or very small blocks can leave SM slots unfilled. Common efficient choices are 128, 256, or 512 threads per block. The estimator lets you sweep block size to find the value that maximizes resident warps for your register and shared-memory usage.',
  },
  {
    q: 'Is occupancy the same on CUDA, ROCm, and Triton?',
    a: 'The concept is identical — active wavefronts (AMD) or warps (NVIDIA) versus the hardware maximum — but the exact resource limits differ by architecture. AMD wavefronts are 64 threads wide by default versus NVIDIA\'s 32-thread warps, and register files and shared/LDS memory sizes vary. Triton abstracts much of this but still compiles down to the same occupancy constraints. Always estimate against the specific target architecture.',
  },
];

export default function KernelOccupancyContent() {
  return (
    <>
      <FaqSchema items={FAQ_ITEMS} />

      <ContentCard>
        <SectionHeading>What kernel occupancy tells you about GPU performance</SectionHeading>
        <Prose>
          A GPU hides the long latency of memory access not by making any single operation fast, but by keeping
          many groups of threads — warps on NVIDIA, wavefronts on AMD — ready to run, so that whenever one stalls
          waiting on data, another can execute immediately. Occupancy measures how well a kernel fills that pool.
          Too few resident warps and the scheduler runs out of work to hide latency, leaving the arithmetic units
          idle. This estimator computes theoretical occupancy from your kernel&apos;s resource usage and, more usefully,
          tells you which resource is holding you back.
        </Prose>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <InfoTile title="Registers per thread">
            Every SM has a fixed register file. The more registers each thread claims, the fewer threads — and
            therefore warps — can be resident at once. This is the most common occupancy limiter for compute-heavy
            kernels.
          </InfoTile>
          <InfoTile title="Shared memory per block">
            Shared memory (LDS on AMD) is partitioned among resident blocks. A large per-block allocation reduces
            how many blocks fit on an SM, capping occupancy independently of register use.
          </InfoTile>
          <InfoTile title="Block and warp slots">
            Each SM has hard ceilings on resident blocks, warps, and threads. Even with plentiful registers and
            shared memory, an awkward block size can leave these slots partially empty.
          </InfoTile>
        </div>
      </ContentCard>

      <ContentCard>
        <SectionHeading>Using occupancy without over-optimizing it</SectionHeading>
        <Prose>
          The goal is enough occupancy to hide latency, not maximum occupancy. For memory-bound kernels, higher
          occupancy usually helps because there is a lot of latency to hide. For compute-bound kernels that already
          keep the arithmetic units busy, pushing occupancy higher can even hurt if it forces register spilling.
          The practical workflow is to check occupancy first, identify the binding resource, and only raise
          occupancy if profiling shows the SM is stalling for lack of eligible warps.
        </Prose>
        <Prose>
          Read the estimate alongside the roofline analysis: occupancy explains whether the SM has work to schedule,
          while the roofline explains whether the bottleneck is bandwidth or compute. Together they cover the two
          questions behind almost every slow kernel — is there enough parallelism, and which hardware ceiling is
          being hit.
        </Prose>
      </ContentCard>

      <FaqList items={FAQ_ITEMS} />

      <ContentCard>
        <SectionHeading>Keep going</SectionHeading>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          <li><Link href="/gpu/tools/roofline-model-analyzer" className="font-semibold text-[#23425f] hover:text-[#18324f]">Roofline Model Analyzer →</Link></li>
          <li><Link href="/gpu/tools/warp-divergence" className="font-semibold text-[#23425f] hover:text-[#18324f]">Warp Divergence Visualizer →</Link></li>
          <li><Link href="/gpu/learning/execution-model" className="font-semibold text-[#23425f] hover:text-[#18324f]">GPU Execution Model →</Link></li>
          <li><Link href="/gpu/learning/cuda-programming" className="font-semibold text-[#23425f] hover:text-[#18324f]">CUDA Programming model →</Link></li>
        </ul>
      </ContentCard>
    </>
  );
}
