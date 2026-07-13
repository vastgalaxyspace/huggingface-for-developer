import Link from 'next/link';

// Original, long-form editorial content rendered server-side so both readers and
// crawlers see substantial unique material around the interactive calculator.
// Worked examples use the same architecture-aware math as the calculator engine
// (weights + FP16 KV cache + runtime overhead).

const FAQ_ITEMS = [
  {
    q: 'How much VRAM do I need to run an LLM?',
    a: 'As a fast rule of thumb, weight memory equals the parameter count multiplied by the bytes per parameter: 2 bytes for FP16/BF16, 1 byte for INT8, and roughly 0.5 bytes for INT4. A 7B model therefore needs about 14 GB in FP16, 7 GB in INT8, and 3.5 GB in INT4 for the weights alone. On top of that you must budget for the KV cache, which grows with context length and batch size, plus 1–2 GB of framework and CUDA overhead. The calculator above computes all three terms for a specific model.',
  },
  {
    q: 'Why is the KV cache so important for long context?',
    a: 'The KV cache stores the key and value tensors for every token already in the context window. Its size is 2 × layers × kv_heads × head_dim × context_length × batch_size × 2 bytes (it stays in FP16 even when the weights are quantized). Because it scales linearly with context length, a model that fits comfortably at 4K tokens can run out of memory at 128K tokens. This is why two models with identical parameter counts can have very different memory profiles at long context.',
  },
  {
    q: 'Does quantizing to 4-bit cut my total VRAM by 4x?',
    a: 'No. Quantization shrinks the weights (from 2 bytes to about 0.5 bytes per parameter), but the KV cache and activations usually stay in FP16. At short context the weights dominate, so 4-bit gets close to a 4x reduction. At long context or high batch size the KV cache dominates, and 4-bit weights barely change the total. Always size the KV cache separately before assuming a quantization saving.',
  },
  {
    q: 'What is the difference between grouped-query attention (GQA) and multi-head attention for memory?',
    a: 'GQA shares key/value heads across multiple query heads, so the KV cache scales with the smaller number of key-value heads rather than the full attention head count. A model with 64 attention heads but only 8 key-value heads has an 8x smaller KV cache than a naive estimate would suggest. The calculator reads num_key_value_heads from the model config to get this right.',
  },
  {
    q: 'Can I run a 70B model on a single 24 GB GPU?',
    a: 'Not in FP16 — a 70B model needs roughly 140 GB just for FP16 weights. In 4-bit it drops to about 40 GB, which still exceeds 24 GB. On a single 24 GB card you are realistically limited to models up to about 13B in 4-bit, or 7B in FP16, once you leave headroom for the KV cache. For 70B you need either an 80 GB GPU in 4-bit, or multiple GPUs with tensor parallelism.',
  },
  {
    q: 'Are these numbers exact?',
    a: 'They are planning estimates, not a substitute for profiling. Real usage is affected by the inference runtime (vLLM, TGI, llama.cpp), memory fragmentation, paged-attention efficiency, CUDA graph capture, and optimizer state during training. Treat the estimate as a lower bound and keep 10–20% headroom before committing to hardware.',
  },
];

function WorkedExample({ title, params, children }) {
  return (
    <article className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="text-lg font-black tracking-tight text-gray-900">{title}</h3>
        <span className="shrink-0 rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-600">{params}</span>
      </div>
      <div className="mt-3 space-y-2 text-sm leading-7 text-gray-600">{children}</div>
    </article>
  );
}

export default function VramCalculatorContent() {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ_ITEMS.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* How the calculation works */}
      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
        <h2 className="text-2xl font-black tracking-tight text-gray-900">How GPU memory for an LLM is actually calculated</h2>
        <p className="mt-4 text-sm leading-7 text-gray-600">
          The memory a large language model needs on a GPU is not a single number — it is the sum of three
          components, and getting the balance right is what separates a deployment that works from one that
          crashes with an out-of-memory error on the first long prompt. This calculator breaks the estimate into
          model weights, the key-value (KV) cache, and runtime overhead, using the model&apos;s real architecture from
          its Hugging Face config rather than a generic multiplier.
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
            <h3 className="text-base font-black text-gray-900">1. Model weights</h3>
            <p className="mt-2 text-sm leading-7 text-gray-600">
              Parameter count × bytes per parameter. FP16/BF16 uses 2 bytes, INT8 uses 1 byte, and 4-bit formats
              (GPTQ, AWQ, GGUF Q4) use roughly 0.5 bytes. This term is fixed for a given precision and does not
              change with prompt length.
            </p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
            <h3 className="text-base font-black text-gray-900">2. KV cache</h3>
            <p className="mt-2 text-sm leading-7 text-gray-600">
              2 × layers × kv_heads × head_dim × context × batch × 2 bytes. It grows linearly with context length
              and batch size, stays in FP16 even for quantized models, and becomes the dominant cost at long
              context.
            </p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
            <h3 className="text-base font-black text-gray-900">3. Runtime overhead</h3>
            <p className="mt-2 text-sm leading-7 text-gray-600">
              CUDA context, framework buffers, activation working set, and memory fragmentation. Budget roughly
              1–2 GB plus 10–15% of the total as a safety margin before you commit to a card.
            </p>
          </div>
        </div>
      </section>

      {/* Worked examples */}
      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
        <h2 className="text-2xl font-black tracking-tight text-gray-900">Worked examples</h2>
        <p className="mt-4 text-sm leading-7 text-gray-600">
          These examples show how the same model can fit very different hardware depending on precision and
          context length. Run your own model through the calculator above to get exact numbers.
        </p>

        <div className="mt-6 grid gap-5 md:grid-cols-3">
          <WorkedExample title="Llama 3 8B" params="8B params">
            <p>
              FP16 weights are about 16 GB; with overhead this lands near 18 GB. At 8K context the KV cache
              (32 layers, 8 KV heads via GQA) adds only ~1 GB.
            </p>
            <p className="font-semibold text-gray-800">
              Fits a single 24 GB RTX 4090 comfortably in FP16, or an 8 GB card in 4-bit.
            </p>
          </WorkedExample>

          <WorkedExample title="Mixtral 8x7B" params="46.7B (MoE)">
            <p>
              A mixture-of-experts model holds all experts in memory even though only two are active per token.
              FP16 weights are roughly 90 GB, so a single 24 GB GPU is out of the question.
            </p>
            <p className="font-semibold text-gray-800">
              Needs 2× A100 80GB in FP16, or drops to ~24 GB in 4-bit for a single high-end card.
            </p>
          </WorkedExample>

          <WorkedExample title="Llama 3 70B" params="70B params">
            <p>
              FP16 weights are about 140 GB — firmly multi-GPU territory. In 4-bit the weights fall to roughly
              40 GB, which fits a single 80 GB card with room for the KV cache.
            </p>
            <p className="font-semibold text-gray-800">
              Single A100/H100 80GB in 4-bit, or 2× 48 GB GPUs with tensor parallelism.
            </p>
          </WorkedExample>
        </div>
      </section>

      {/* FAQ */}
      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
        <h2 className="text-2xl font-black tracking-tight text-gray-900">Frequently asked questions</h2>
        <div className="mt-6 divide-y divide-gray-200">
          {FAQ_ITEMS.map((item) => (
            <div key={item.q} className="py-5 first:pt-0 last:pb-0">
              <h3 className="text-base font-black text-gray-900">{item.q}</h3>
              <p className="mt-2 text-sm leading-7 text-gray-600">{item.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Related resources */}
      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
        <h2 className="text-2xl font-black tracking-tight text-gray-900">Keep going</h2>
        <p className="mt-4 text-sm leading-7 text-gray-600">
          Once you know the memory footprint, the next questions are which GPU to buy and whether to quantize.
          These guides go deeper:
        </p>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          <li>
            <Link href="/guides/best-models-low-vram" className="font-semibold text-[#274867] hover:text-[#18324f]">
              Best Models for Low VRAM →
            </Link>
          </li>
          <li>
            <Link href="/guides/quantization-4bit-8bit-fp16" className="font-semibold text-[#274867] hover:text-[#18324f]">
              Quantization: 4-bit vs 8-bit vs FP16 →
            </Link>
          </li>
          <li>
            <Link href="/gpu/tools/gpu-picker" className="font-semibold text-[#274867] hover:text-[#18324f]">
              GPU Picker: match a model to hardware →
            </Link>
          </li>
          <li>
            <Link href="/compare" className="font-semibold text-[#274867] hover:text-[#18324f]">
              Compare models side by side →
            </Link>
          </li>
        </ul>
      </section>
    </>
  );
}
