import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import FineTuneCalculatorClient from '../../../../src/components/fine-tune/FineTuneCalculatorClient';
import { pageMetadata } from '../../../../src/lib/seo';

export const metadata = pageMetadata({
  title: 'Fine-Tuning VRAM Calculator: Full, LoRA and QLoRA',
  description:
    'Work out whether you can fine-tune an LLM on your GPU. Compares full fine-tuning, LoRA and QLoRA memory, including optimizer states, gradients and activations.',
  path: '/gpu/tools/fine-tuning-calculator',
  keywords: [
    'fine-tuning VRAM calculator',
    'QLoRA memory requirements',
    'LoRA VRAM',
    'can I fine-tune LLM on my GPU',
    'training memory calculator',
    'LLM fine-tuning GPU requirements',
  ],
  type: 'article',
});

const faq = [
  {
    q: 'How much VRAM does fine-tuning need compared with inference?',
    a: 'Roughly eight times more for a full fine-tune. Inference needs about 2 bytes per parameter for bf16 weights. Full fine-tuning with AdamW needs about 16: 2 for weights, 2 for gradients, 4 for fp32 master weights, and 8 for the two Adam moments. An 8B model that serves happily in 16 GB needs around 128 GB to train fully.',
  },
  {
    q: 'Why does QLoRA use so much less memory?',
    a: 'It attacks both large terms at once. The base model is frozen and stored in 4-bit rather than 16-bit, cutting the weight term by about four times. Because the base is frozen, gradients, master weights and optimizer state exist only for the small adapter — typically well under 1% of the parameters. What remains is mostly activations, which gradient checkpointing keeps modest.',
  },
  {
    q: 'What LoRA rank should I use?',
    a: 'Start at 16. Rank controls adapter capacity, and its memory cost is almost negligible compared with the base model, so the trade-off is quality and overfitting rather than VRAM. Ranks of 8 to 32 cover most instruction-tuning and style-adaptation work; go higher only when you are teaching genuinely new capability and have the data to support it.',
  },
  {
    q: 'Does sequence length or batch size matter more?',
    a: 'Sequence length, by a wide margin. Activation memory contains a term that grows with the square of sequence length because of attention, while batch size scales it linearly. Doubling the sequence length costs far more than doubling the batch. If you are out of memory, cut sequence length first, then use gradient accumulation to keep the effective batch size you wanted.',
  },
  {
    q: 'Should I turn gradient checkpointing on?',
    a: 'Almost always yes. It discards intermediate activations during the forward pass and recomputes them during the backward pass, trading roughly 20 to 30 percent extra compute for an order of magnitude less activation memory. Without it, activations rather than weights are usually what exhausts VRAM on long sequences.',
  },
  {
    q: 'How accurate are these numbers?',
    a: 'They are planning estimates built from the standard memory model, and they track published results closely — QLoRA on a 70B lands near 44 GB here, consistent with the QLoRA paper fitting a 65B on a single 48 GB card. Real usage varies with framework, attention implementation, fragmentation and whether Flash Attention is active. Treat a comfortable fit as a green light and a tight fit as something to test before relying on it.',
  },
];

export default function FineTuningCalculatorPage() {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  };

  return (
    <div className="bg-gray-100 py-8 md:py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <div className="shell-container space-y-6">
        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
          <Link
            href="/gpu"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-[#274867]"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to GPU
          </Link>
          <p className="mt-5 text-xs font-semibold uppercase tracking-widest text-gray-400">Training tool</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-gray-900 md:text-5xl">
            Fine-tuning VRAM calculator
          </h1>
          <p className="mt-4 max-w-[760px] text-sm leading-7 text-gray-600">
            Can you fine-tune this model on your GPU? Compare full fine-tuning, LoRA and QLoRA with every memory term
            accounted for — weights, gradients, fp32 master copies, optimizer state and activations — at your real
            sequence length and batch size.
          </p>
          <div className="mt-5 flex flex-wrap gap-3 text-xs font-semibold text-gray-500">
            <span>Training needs ~8x the memory of inference</span>
            <span>QLoRA can cut that by 20x</span>
            <span>Activations are usually the surprise</span>
          </div>
        </section>

        <FineTuneCalculatorClient />

        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
          <h2 className="text-2xl font-black tracking-tight text-gray-900">How training memory is calculated</h2>
          <p className="mt-4 text-sm leading-7 text-gray-600">
            The reason fine-tuning surprises people is that weights are the smallest part of the bill. Serving a model
            needs one copy of the parameters. Training needs that copy plus everything the optimizer requires to
            update it, and with mixed-precision AdamW that adds up to roughly eight times the inference figure.
          </p>

          <h3 className="mt-6 text-lg font-black text-gray-900">The four terms</h3>
          <p className="mt-2 text-sm leading-7 text-gray-600">
            <strong className="font-semibold text-gray-900">Weights</strong> are 2 bytes per parameter in bf16, or
            about 0.55 in 4-bit once quantization constants are counted.{' '}
            <strong className="font-semibold text-gray-900">Gradients</strong> add another 2 bytes for every parameter
            being trained. <strong className="font-semibold text-gray-900">Master weights</strong> add 4 more: mixed
            precision keeps an fp32 copy so that small updates are not lost to rounding.{' '}
            <strong className="font-semibold text-gray-900">Optimizer state</strong> is the largest single term at 8
            bytes per trainable parameter, because AdamW stores two fp32 moments — a running mean and a running
            variance — for each one. Add those and a full fine-tune costs about 16 bytes per parameter before a single
            activation is stored.
          </p>

          <h3 className="mt-6 text-lg font-black text-gray-900">Why LoRA and QLoRA change the picture</h3>
          <p className="mt-2 text-sm leading-7 text-gray-600">
            Three of those four terms scale with the number of parameters you are <em>training</em>, not the number
            the model has. LoRA freezes the base model and inserts small low-rank matrices, so gradients, master
            weights and optimizer state apply to well under one percent of the parameters. The base model still sits
            in memory at 2 bytes per parameter, which is why LoRA on an 8B still needs roughly 18 GB. QLoRA goes
            further by storing that frozen base in 4-bit, cutting the last large term and bringing the same job under
            7 GB — the difference between needing a data-center card and using the one already in your desktop.
          </p>

          <h3 className="mt-6 text-lg font-black text-gray-900">Activations, and why sequence length hurts</h3>
          <p className="mt-2 text-sm leading-7 text-gray-600">
            Activations are the intermediate tensors kept from the forward pass so gradients can be computed on the
            way back. Their size depends on sequence length, batch size, hidden dimension and layer count — and
            crucially, attention contributes a term proportional to the square of sequence length. That is why moving
            from 2,048 to 8,192 tokens costs far more than four times the memory, and why cutting sequence length is
            the most effective response to an out-of-memory error. Gradient checkpointing discards most activations
            and recomputes them during the backward pass, trading roughly a quarter more compute for an order of
            magnitude less memory. Leave it on unless you have a specific reason not to.
          </p>

          <h3 className="mt-6 text-lg font-black text-gray-900">A worked example</h3>
          <p className="mt-2 text-sm leading-7 text-gray-600">
            Take Llama 3.1 8B at 2,048 tokens, batch size 1, with checkpointing on. A full fine-tune needs about{' '}
            <strong className="font-semibold text-gray-900">128 GB</strong>: 16 GB of bf16 weights, 16 GB of
            gradients, 32 GB of fp32 master weights and 64 GB of Adam state. That is two 80 GB cards minimum. LoRA at
            rank 16 drops it to about <strong className="font-semibold text-gray-900">18 GB</strong>, because the
            trainable set collapses to roughly 17 million adapter parameters and only the frozen 16 GB base remains
            large — that fits a single 24 GB card. QLoRA quantizes that base to 4-bit and lands near{' '}
            <strong className="font-semibold text-gray-900">7 GB</strong>, which runs on an 8 GB laptop GPU. Same
            model, same data, an eighteen-fold spread driven entirely by method.
          </p>

          <h3 className="mt-6 text-lg font-black text-gray-900">What these estimates do not cover</h3>
          <p className="mt-2 text-sm leading-7 text-gray-600">
            The model assumes single-GPU training with standard mixed precision. It does not account for DeepSpeed
            ZeRO or FSDP, which shard optimizer state and gradients across devices and change the arithmetic
            substantially. It also assumes an efficient attention implementation; older kernels that materialize the
            full attention matrix use considerably more. Framework overhead, memory fragmentation, and whether your
            trainer keeps a separate evaluation batch in memory all move the real number. Treat a comfortable fit as a
            green light, and a tight fit as something to verify on the actual hardware before committing to a run.
          </p>
          <p className="mt-4 text-sm leading-7 text-gray-600">
            For the inference side of the same decision, size the deployment with the{' '}
            <Link href="/gpu/tools/vram-calculator" className="font-semibold text-[#23425f] hover:text-[#18324f]">
              VRAM Calculator
            </Link>{' '}
            and check which card runs the finished model in{' '}
            <Link href="/can-i-run" className="font-semibold text-[#23425f] hover:text-[#18324f]">
              Can I Run It
            </Link>
            . If you are still deciding whether to fine-tune at all,{' '}
            <Link
              href="/guides/rag-vs-fine-tuning"
              className="font-semibold text-[#23425f] hover:text-[#18324f]"
            >
              RAG vs Fine-Tuning
            </Link>{' '}
            covers when each approach is the right one.
          </p>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
          <h2 className="text-xl font-black tracking-tight text-gray-900">Frequently asked questions</h2>
          <div className="mt-6 divide-y divide-gray-200">
            {faq.map((item) => (
              <div key={item.q} className="py-5 first:pt-0 last:pb-0">
                <h3 className="text-base font-black text-gray-900">{item.q}</h3>
                <p className="mt-2 text-sm leading-7 text-gray-600">{item.a}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
