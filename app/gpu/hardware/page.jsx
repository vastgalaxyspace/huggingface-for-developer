import Link from 'next/link';
import { ArrowRight, Cpu, Layers, MemoryStick } from 'lucide-react';
import { pageMetadata } from '../../../src/lib/seo';

export const metadata = pageMetadata({
  title: 'GPU Hardware Fundamentals',
  description:
    'Learn the GPU hardware blocks that matter for AI workloads, including SMs, Tensor Cores, and memory hierarchy.',
  path: '/gpu/hardware',
  keywords: ['GPU hardware', 'Streaming Multiprocessor', 'Tensor Cores'],
});

export default function GpuHardwarePage() {
  const blocks = [
    { title: 'Streaming Multiprocessor', body: 'Core execution block where warps are scheduled and tensor pipelines execute.' },
    { title: 'Tensor Cores', body: 'Specialized matrix units for BF16/FP16/FP8 workloads and high-throughput AI kernels.' },
    { title: 'Memory Hierarchy', body: 'Registers, shared memory, L2, and HBM/GDDR bandwidth shape achievable performance.' },
  ];

  const decisions = [
    {
      title: 'Why hardware knowledge matters',
      body: 'AI teams often jump straight to model benchmarks, but hardware limits are what decide whether a model can actually run, how much it costs, and where latency problems show up.',
    },
    {
      title: 'What this page helps decide',
      body: 'Use this page to build intuition around the blocks that determine throughput, memory pressure, and deployment feasibility before moving into execution or performance tuning.',
    },
    {
      title: 'Best next step',
      body: 'After this overview, continue to Execution for warp behavior or Performance for roofline reasoning. If you already have a workload, jump to the VRAM calculator and GPU picker.',
    },
  ];

  return (
    <div className="bg-[#f2f6fb] py-8 md:py-12">
      <div className="shell-container space-y-10">
        <section className="overflow-hidden rounded-[20px] border border-[#d7dfe8] bg-white shadow-[0_12px_30px_rgba(31,45,61,0.08)]">
          <div className="gpu-grid-light px-6 py-8 md:px-10 md:py-10">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#71859b]">Hardware / Architecture</p>
            <h1 className="mt-3 text-4xl font-black leading-[0.95] tracking-[-0.02em] text-[#16202b] sm:text-5xl lg:text-[58px]">
              Streaming Multiprocessor
            </h1>
            <p className="mt-5 max-w-[760px] text-base leading-8 text-[#536b83]">
              The SM is the main architectural unit in modern GPUs. This page summarizes the key hardware blocks that matter most for AI and inference performance tuning.
            </p>
          </div>
        </section>

        <section className="grid gap-5 md:grid-cols-3">
          {decisions.map((item) => (
            <article key={item.title} className="rounded-[20px] border border-[#d7dfe8] bg-white p-6 shadow-[0_10px_24px_rgba(45,67,92,0.05)]">
              <h2 className="text-lg font-black tracking-tight text-[#1c3148]">{item.title}</h2>
              <p className="mt-3 text-sm leading-7 text-[#5f758d]">{item.body}</p>
            </article>
          ))}
        </section>

        <section className="mt-10 grid gap-4 md:grid-cols-3">
          {blocks.map((item) => (
            <article key={item.title} className="border border-[#d7dfe8] bg-white p-6">
              <h2 className="text-sm font-black uppercase tracking-[0.16em] text-[#1c3148]">{item.title}</h2>
              <p className="mt-3 text-sm leading-6 text-[#5f758d]">{item.body}</p>
            </article>
          ))}
        </section>

        <section className="mt-10 rounded-[20px] border border-[#d7dfe8] bg-white p-6 md:p-8">
          <h2 className="text-lg font-black uppercase tracking-[0.16em] text-[#1e3248]">SM Diagram Snapshot</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-[1.25fr_0.75fr]">
            <div className="border border-[#dbe3ed] bg-[#f8fbff] p-5">
              <div className="grid gap-3 sm:grid-cols-2">
                <Panel title="Warp Schedulers" value="4x" icon={Layers} />
                <Panel title="Dispatch Units" value="8x" icon={Cpu} />
                <Panel title="CUDA Cores" value="128x" icon={Cpu} />
                <Panel title="Tensor Cores" value="4x" icon={MemoryStick} />
              </div>
            </div>
            <div className="border border-[#dbe3ed] bg-[#f8fbff] p-5">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#6f849b]">Related Navigation</p>
              <div className="mt-4 space-y-2">
                <NavLink href="/gpu/execution" label="Go to Execution" />
                <NavLink href="/gpu/performance" label="Go to Performance" />
                <NavLink href="/gpu/tools/gpu-picker" label="Go to Tools" />
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[20px] border border-[#d7dfe8] bg-white p-6 md:p-8">
          <h2 className="text-2xl font-extrabold tracking-[-0.01em] text-[#1a2635]">How to read GPU hardware pages</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="rounded-[18px] border border-[#dbe3ed] bg-[#f8fbff] p-5">
              <p className="text-sm font-black uppercase tracking-[0.14em] text-[#1c3148]">Start with blocks</p>
              <p className="mt-3 text-sm leading-7 text-[#5f758d]">
                Focus first on what each hardware block does: scheduling, matrix math, caches, and memory transport.
                That foundation makes later performance discussions much easier to understand.
              </p>
            </div>
            <div className="rounded-[18px] border border-[#dbe3ed] bg-[#f8fbff] p-5">
              <p className="text-sm font-black uppercase tracking-[0.14em] text-[#1c3148]">Then connect to workload</p>
              <p className="mt-3 text-sm leading-7 text-[#5f758d]">
                The useful question is always: which of these blocks is likely limiting my model, kernel, or serving
                pattern? This page is meant to build that habit.
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-[20px] border border-[#d7dfe8] bg-white p-6 md:p-8">
          <h2 className="text-2xl font-extrabold tracking-[-0.01em] text-[#1a2635]">The memory hierarchy is the real constraint</h2>
          <p className="mt-4 text-sm leading-7 text-[#5f758d]">
            GPU specifications lead with core counts and teraflops, but for AI workloads the memory system decides
            almost everything. Each level of the hierarchy trades capacity for speed. Registers sit closest to the
            arithmetic units and are effectively free to access, but there are only tens of kilobytes per streaming
            multiprocessor and they are divided among every resident thread. Shared memory — a programmer-managed
            scratchpad inside the SM — offers roughly a hundred kilobytes per block at latency measured in tens of
            cycles. Global memory (HBM or GDDR) holds gigabytes but costs hundreds of cycles per access.
          </p>
          <p className="mt-4 text-sm leading-7 text-[#5f758d]">
            That last gap is the one that matters. A read from global memory can cost several hundred cycles, during
            which the arithmetic units would sit idle if the scheduler had nothing else to run. Every major GPU
            optimization technique is, at bottom, an attempt to avoid paying that cost: tiling data into shared memory
            so it is read from HBM once and reused many times, coalescing accesses so 32 threads fetch one contiguous
            block instead of 32 scattered ones, and keeping enough warps resident that the SM always has other work
            available while one warp waits.
          </p>
          <p className="mt-4 text-sm leading-7 text-[#5f758d]">
            For running language models this shows up immediately in a practical form. Weights must live in VRAM, and
            the KV cache grows alongside them with context length — which is why a card is chosen by capacity first and
            speed second. Once the model fits, generation speed tracks memory <em>bandwidth</em> far more closely than
            it tracks peak FLOPs, because producing each token means streaming the whole weight matrix out of memory
            again. A card with more bandwidth generates faster even at identical compute. You can size the capacity
            side precisely with the{' '}
            <Link href="/gpu/tools/vram-calculator" className="font-semibold text-[#21405f] hover:text-[#16324d]">
              VRAM calculator
            </Link>{' '}
            or check a specific pairing in{' '}
            <Link href="/can-i-run" className="font-semibold text-[#21405f] hover:text-[#16324d]">
              can I run it
            </Link>
            .
          </p>
        </section>

        <section className="rounded-[20px] border border-[#d7dfe8] bg-white p-6 md:p-8">
          <h2 className="text-2xl font-extrabold tracking-[-0.01em] text-[#1a2635]">SMs and tensor cores in practice</h2>
          <p className="mt-4 text-sm leading-7 text-[#5f758d]">
            The streaming multiprocessor is the unit that actually does work. A GPU is essentially many SMs plus a
            memory system to feed them, and each SM contains CUDA cores for general arithmetic, tensor cores for matrix
            math, a register file, shared memory, schedulers, and load/store units. Work arrives as thread blocks
            assigned to an SM, and each block is subdivided into 32-thread warps that the schedulers issue from. How
            many blocks an SM can hold at once depends on how much of its register file and shared memory each block
            claims, which is why resource usage in your kernel translates directly into how well latency can be hidden.
          </p>
          <p className="mt-4 text-sm leading-7 text-[#5f758d]">
            Tensor cores are the reason modern GPUs are fast at AI specifically. Rather than computing one
            multiply-accumulate per cycle per lane, a tensor core performs a small matrix multiply-accumulate as a
            single operation, delivering an order-of-magnitude throughput increase on exactly the operation that
            dominates transformer workloads. The catch is that they only engage under the right conditions: reduced
            precision (BF16, FP16, FP8, or INT8 depending on generation), and tensor shapes that align to the
            hardware&apos;s expected tile sizes. A model running in FP32, or with awkward dimensions, quietly falls back
            to the standard cores and gives up most of the advertised performance — one of the most common reasons real
            throughput lands far below a datasheet figure.
          </p>
        </section>

        <section className="rounded-[20px] border border-[#d7dfe8] bg-white p-6 md:p-8">
          <h2 className="text-2xl font-extrabold tracking-[-0.01em] text-[#1a2635]">Frequently asked questions</h2>
          <div className="mt-6 divide-y divide-[#dbe3ed]">
            <div className="py-5 first:pt-0">
              <h3 className="text-base font-black text-[#1a2635]">What is a streaming multiprocessor?</h3>
              <p className="mt-2 text-sm leading-7 text-[#5f758d]">
                The core execution block of a GPU. It contains CUDA cores, tensor cores, a register file, shared
                memory, and warp schedulers. A GPU is many SMs plus the memory system that feeds them.
              </p>
            </div>
            <div className="py-5">
              <h3 className="text-base font-black text-[#1a2635]">Why does VRAM bandwidth matter more than FLOPs for LLMs?</h3>
              <p className="mt-2 text-sm leading-7 text-[#5f758d]">
                Generating each token requires reading the full set of weights from memory to perform relatively little
                arithmetic. That makes decoding memory-bound, so bandwidth sets the speed while peak compute goes
                largely unused until you batch requests together.
              </p>
            </div>
            <div className="py-5">
              <h3 className="text-base font-black text-[#1a2635]">When do tensor cores actually get used?</h3>
              <p className="mt-2 text-sm leading-7 text-[#5f758d]">
                When the operation is a matrix multiply in a supported reduced precision (BF16, FP16, FP8, or INT8 by
                generation) with shapes that match the hardware tile sizes. FP32 kernels or misaligned dimensions fall
                back to standard CUDA cores.
              </p>
            </div>
            <div className="py-5 last:pb-0">
              <h3 className="text-base font-black text-[#1a2635]">How much VRAM do I need for a given model?</h3>
              <p className="mt-2 text-sm leading-7 text-[#5f758d]">
                Roughly two bytes per parameter in FP16, one at INT8, and about half at 4-bit, plus the KV cache which
                grows with context length and concurrency. Add headroom for activations and fragmentation rather than
                sizing to the exact weight footprint.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function Panel({ title, value, icon }) {
  const IconComponent = icon;
  return (
    <div className="border border-[#dbe3ed] bg-white p-4">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#6f849a]">{title}</p>
        <IconComponent className="h-4 w-4 text-[#4e6988]" />
      </div>
      <p className="mt-4 text-2xl font-black text-[#1a3048]">{value}</p>
    </div>
  );
}

function NavLink({ href, label }) {
  return (
    <Link href={href} className="flex items-center justify-between border border-[#dbe3ed] bg-white px-4 py-3 text-xs font-bold uppercase tracking-[0.14em] text-[#21405f] hover:bg-[#f4f9ff]">
      {label}
      <ArrowRight className="h-3.5 w-3.5" />
    </Link>
  );
}
