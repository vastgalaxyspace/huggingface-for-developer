import Link from 'next/link';
import { ContentCard, FaqList, FaqSchema, InfoTile, Prose, SectionHeading } from '../gpu/toolContentPrimitives';

const FAQ_ITEMS = [
  {
    q: 'What is the roofline model?',
    a: 'The roofline model is a visual performance model that plots achievable compute throughput (FLOP/s) against arithmetic intensity (FLOPs per byte of memory traffic). It has two limits: a slanted "memory roof" set by memory bandwidth and a flat "compute roof" set by peak FLOP/s. Where a kernel lands under these roofs tells you instantly whether it is limited by memory bandwidth or by compute — and therefore which optimization will actually help.',
  },
  {
    q: 'What is arithmetic intensity?',
    a: 'Arithmetic intensity is the ratio of arithmetic operations to bytes moved from memory, measured in FLOPs per byte. A kernel that does a lot of math on a little data (like a dense matrix multiply) has high intensity; one that touches a lot of memory per operation (like a vector add or an attention softmax) has low intensity. The roofline ridge point — where the memory roof meets the compute roof — is the intensity a kernel must exceed to become compute bound.',
  },
  {
    q: 'How do I know if my kernel is memory bound or compute bound?',
    a: 'Compute the kernel\'s arithmetic intensity and compare it to the GPU\'s ridge point (peak FLOP/s divided by peak bandwidth). If the kernel\'s intensity is below the ridge point it is memory bound, and you should focus on data reuse, fusion, caching, and reducing precision of memory traffic. If it is above the ridge point it is compute bound, and you should focus on using tensor cores, better instruction mix, and higher occupancy.',
  },
  {
    q: 'Why are most LLM inference kernels memory bound?',
    a: 'Autoregressive token generation processes one token at a time against large weight matrices, so each weight is read from memory but used for very little arithmetic — a low arithmetic intensity. This is why generation speed tracks memory bandwidth closely and why batching (which reuses weights across many tokens) raises intensity and shifts the workload toward the compute roof. It also explains why quantization, which cuts bytes moved, speeds up generation.',
  },
  {
    q: 'How does batching change the roofline position?',
    a: 'Increasing batch size reuses the same weights across more tokens, so more FLOPs are performed per byte read. This raises arithmetic intensity and moves the kernel to the right on the roofline chart, from the memory-bound region toward the compute roof. That is the core reason batched serving achieves far higher total throughput than single-stream generation, and why inference servers like vLLM invest heavily in continuous batching.',
  },
  {
    q: 'Does the roofline model apply to tensor cores?',
    a: 'Yes, but tensor cores raise the compute roof dramatically for the precisions they support (FP16, BF16, INT8, FP8), so the ridge point moves to a higher arithmetic intensity. A kernel that looked compute bound against FP32 CUDA cores can become memory bound once tensor cores multiply the available FLOP/s. When analyzing modern workloads, use the tensor-core peak for the roof, not the general FP32 peak.',
  },
];

export default function RooflineContent() {
  return (
    <>
      <FaqSchema items={FAQ_ITEMS} />

      <ContentCard>
        <SectionHeading>Understanding the roofline model for GPU performance</SectionHeading>
        <Prose>
          When a GPU kernel runs slower than you hoped, there are only two fundamental reasons: it is waiting on
          memory, or it is waiting on the arithmetic units. The roofline model is the single clearest way to tell
          which. By plotting a kernel&apos;s arithmetic intensity against the two hardware ceilings — memory bandwidth
          and peak compute — it turns a vague "the kernel is slow" into a precise diagnosis and a specific
          optimization strategy. Chasing the wrong ceiling wastes days; the roofline stops you from optimizing
          compute on a kernel that was starved for bandwidth all along.
        </Prose>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <InfoTile title="The memory roof">
            The slanted line set by peak memory bandwidth. Kernels under it are limited by how fast data moves,
            not by how fast the GPU can compute. Improve them with reuse, fusion, and lower-precision transfers.
          </InfoTile>
          <InfoTile title="The compute roof">
            The flat line set by peak FLOP/s (higher when tensor cores apply). Kernels near it are compute bound;
            further gains come from a better instruction mix and higher occupancy, not from touching memory less.
          </InfoTile>
          <InfoTile title="The ridge point">
            Where the two roofs meet. Its arithmetic intensity is the threshold a kernel must exceed to become
            compute bound. It is the number you compare your kernel against.
          </InfoTile>
        </div>
      </ContentCard>

      <ContentCard>
        <SectionHeading>From diagnosis to optimization</SectionHeading>
        <Prose>
          Once the analyzer places your workload on the chart, the fix follows directly from which region it lands
          in. A memory-bound kernel benefits from operator fusion (doing more work per memory pass), caching data
          in shared memory or registers, and reducing the precision of the data you move — which is exactly why
          quantized inference is faster even when the math is identical. A compute-bound kernel instead benefits
          from mapping work onto tensor cores, improving arithmetic unit utilization, and raising occupancy so the
          scheduler can hide latency.
        </Prose>
        <Prose>
          The most valuable insight the roofline gives is negative: it tells you what will not help. If a kernel is
          firmly memory bound, buying a GPU with more raw FLOPS or hand-tuning the inner math loop will do nothing —
          only bandwidth or reduced memory traffic moves the needle. That saves you from expensive, fruitless
          optimization.
        </Prose>
      </ContentCard>

      <FaqList items={FAQ_ITEMS} />

      <ContentCard>
        <SectionHeading>Keep going</SectionHeading>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          <li><Link href="/gpu/tools/kernel-occupancy-estimator" className="font-semibold text-[#23425f] hover:text-[#18324f]">Kernel Occupancy Estimator →</Link></li>
          <li><Link href="/gpu/learning/memory-hierarchy" className="font-semibold text-[#23425f] hover:text-[#18324f]">GPU Memory Hierarchy explained →</Link></li>
          <li><Link href="/gpu/learning/execution-model" className="font-semibold text-[#23425f] hover:text-[#18324f]">GPU Execution Model →</Link></li>
          <li><Link href="/gpu/performance" className="font-semibold text-[#23425f] hover:text-[#18324f]">GPU performance overview →</Link></li>
        </ul>
      </ContentCard>
    </>
  );
}
