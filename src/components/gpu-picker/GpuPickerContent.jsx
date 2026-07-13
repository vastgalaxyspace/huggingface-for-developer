import Link from 'next/link';
import { ContentCard, FaqList, FaqSchema, InfoTile, Prose, SectionHeading } from '../gpu/toolContentPrimitives';

const FAQ_ITEMS = [
  {
    q: 'What is the best GPU for running LLMs locally?',
    a: 'For local inference the RTX 4090 (24 GB) and RTX 3090 (24 GB) are the sweet spot in 2024–2025: they run 7B–13B models in FP16 and up to ~34B models in 4-bit. If you only run small models, a 16 GB RTX 4060 Ti or a used RTX 3060 12 GB is enough. For 70B-class models you need a 48 GB workstation card (RTX A6000) or a data-center 80 GB card (A100/H100). The picker above matches a specific model to concrete cards rather than guessing.',
  },
  {
    q: 'How much GPU memory headroom should I leave?',
    a: 'Never size a GPU to exactly the weight requirement. Leave 20–30% headroom for the KV cache (which grows with context length), activations, and memory fragmentation in the inference runtime. A model whose 4-bit weights are 22 GB will not run reliably on a 24 GB card once you add a long prompt. The picker applies a safety margin automatically.',
  },
  {
    q: 'Should I buy a GPU or rent one in the cloud?',
    a: 'Rent when your usage is spiky, experimental, or below roughly 15–20 hours per week; the pay-per-hour math usually beats hardware depreciation. Buy when you have steady, high-utilization workloads or strict data-residency needs — a 24 GB consumer card pays for itself in a few months of heavy use versus cloud A10/L4 instances. Consider power and cooling costs in the buy case.',
  },
  {
    q: 'Is one big GPU better than two smaller ones?',
    a: 'A single GPU with enough VRAM is almost always simpler and faster than two smaller cards, because splitting a model across GPUs (tensor parallelism) adds inter-GPU communication overhead. Use multiple GPUs only when the model genuinely does not fit on one card, or when you need the extra cards to raise throughput with data parallelism. Two 24 GB cards do not cleanly equal one 48 GB card for a single large model.',
  },
  {
    q: 'Do AMD GPUs work for AI inference?',
    a: 'Yes, increasingly. AMD data-center cards (MI250/MI300) and consumer RDNA cards run PyTorch and llama.cpp through ROCm, and vLLM has growing ROCm support. The ecosystem is still narrower than NVIDIA CUDA, so some quantization kernels and libraries may lag. If tooling breadth matters more than price, NVIDIA is the safer default; if raw VRAM per dollar matters, AMD is worth evaluating.',
  },
  {
    q: 'What GPU do I need to fine-tune a model?',
    a: 'Fine-tuning needs far more memory than inference because you also store gradients and optimizer states. Full fine-tuning of a 7B model can need 60–80 GB, while parameter-efficient methods like LoRA or QLoRA bring a 7B model down to a single 16–24 GB consumer card. If your goal is fine-tuning, filter for the QLoRA-friendly cards and expect to trade some quality for the memory savings.',
  },
];

export default function GpuPickerContent() {
  return (
    <>
      <FaqSchema items={FAQ_ITEMS} />

      <ContentCard>
        <SectionHeading>How to choose the right GPU for an AI model</SectionHeading>
        <Prose>
          Picking a GPU for AI work is a balance of four constraints that rarely point at the same card: how much
          memory the model needs, how fast you want tokens generated, how much you can spend, and whether you are
          running inference or training. A card that is perfect for serving a quantized 13B chatbot is wildly
          over- or under-specified for fine-tuning a 7B model or batching thousands of embedding requests. This
          tool starts from the model you actually want to run and works backwards to the hardware.
        </Prose>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <InfoTile title="Memory comes first">
            If the model plus its KV cache does not fit in VRAM, nothing else matters — the workload will not run.
            Always confirm the fit at your target precision and context length before comparing speed or price.
          </InfoTile>
          <InfoTile title="Then throughput">
            Once several cards fit, memory bandwidth and compute (TFLOPS) decide tokens per second. Generation is
            usually memory-bandwidth bound, so bandwidth often matters more than raw FLOPS for chat workloads.
          </InfoTile>
          <InfoTile title="Then budget tier">
            Consumer cards (RTX 3060–4090) offer the best value per GB; workstation and data-center cards buy you
            capacity, ECC memory, and multi-GPU scaling at a steep premium.
          </InfoTile>
          <InfoTile title="Finally, intent">
            Inference, batch serving, and fine-tuning have very different memory profiles. Tell the picker your
            intent so it does not hand you an inference-sized card for a training job.
          </InfoTile>
        </div>
      </ContentCard>

      <ContentCard>
        <SectionHeading>Reading the recommendations</SectionHeading>
        <Prose>
          Each recommended card shows the precision it was matched at and the resulting VRAM utilization. A card at
          95% utilization technically fits but leaves no room for longer prompts or larger batches — prefer options
          in the 60–80% range for production. The quantized alternatives panel shows how dropping from FP16 to INT8
          or 4-bit changes which cards become viable, which is often the difference between a $1,600 consumer card
          and a $15,000 data-center card. When several cards fit comfortably, decide on price-to-performance and
          availability rather than squeezing into the smallest possible option.
        </Prose>
        <Prose>
          If no consumer card fits even at 4-bit, the model is genuinely large and you should plan for a workstation
          card, a data-center GPU, or a multi-GPU server. In that case, weigh a hosted inference API against
          self-hosting: for occasional use, per-token pricing is usually cheaper than owning 80 GB of GPU.
        </Prose>
      </ContentCard>

      <FaqList items={FAQ_ITEMS} />

      <ContentCard>
        <SectionHeading>Keep going</SectionHeading>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          <li><Link href="/gpu/tools/vram-calculator" className="font-semibold text-[#23425f] hover:text-[#18324f]">VRAM Calculator: exact memory footprint →</Link></li>
          <li><Link href="/guides/choose-ai-model-by-gpu-budget" className="font-semibold text-[#23425f] hover:text-[#18324f]">Choose an AI Model by GPU and Budget →</Link></li>
          <li><Link href="/guides/best-models-low-vram" className="font-semibold text-[#23425f] hover:text-[#18324f]">Best Models for Low VRAM →</Link></li>
          <li><Link href="/compare" className="font-semibold text-[#23425f] hover:text-[#18324f]">Compare models side by side →</Link></li>
        </ul>
      </ContentCard>
    </>
  );
}
