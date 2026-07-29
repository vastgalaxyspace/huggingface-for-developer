import Link from "next/link";
import ComparisonPage from "../../src/views/ComparisonPage";
import { pageMetadata } from "../../src/lib/seo";

export const metadata = pageMetadata({
  title: "Model Comparison Tool",
  description:
    "Compare AI models side by side across context, parameters, licensing, deployment fit, and practical operator signals.",
  path: "/compare",
  keywords: ["AI model comparison", "LLM compare tool", "model benchmark workspace"],
});

const faq = [
  {
    q: "Which specs actually matter when comparing two models?",
    a: "Memory footprint at your context length, the attention layout, the licence, and the tokenizer. Parameter count alone is a poor predictor: two models of identical size can differ several-fold in KV cache depending on whether they use multi-head, grouped-query, or latent attention, and that difference often decides which card you need.",
  },
  {
    q: "Why compare tokenizers?",
    a: "Because the same text costs different numbers of tokens in different models. On non-Latin scripts the gap is frequently two to four times, which multiplies your per-token cost, consumes your context window faster, and gives the model a weaker signal. If you serve languages other than English, tokenizer fertility can matter more than a few benchmark points.",
  },
  {
    q: "Is a bigger context window always better?",
    a: "No. Advertised context is a maximum, not a promise of quality, and most models degrade noticeably before reaching it. The KV cache also grows linearly with context, so a large window you actually use can push a comfortable deployment into out-of-memory territory. Compare usable context at your memory budget rather than the headline number.",
  },
  {
    q: "What can a spec comparison not tell me?",
    a: "How the models behave on your prompts. Instruction adherence, refusal behaviour, structured-output reliability, and tool-calling discipline vary enormously between models with near-identical specifications, and none of it appears in metadata. Use this to build a shortlist, then evaluate that shortlist on your own tasks.",
  },
];

export default function ComparePage() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <ComparisonPage />

      {/* Server-rendered editorial beneath the workspace. The comparison table is
          built client-side from user-selected models, so without this the page
          rendered ~416 words despite being linked from the header and footer. */}
      <div className="bg-gray-100 py-8 md:py-12">
        <div className="shell-container space-y-6">
          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
            <h2 className="text-2xl font-black tracking-tight text-gray-900">How to compare AI models properly</h2>
            <p className="mt-4 text-sm leading-7 text-gray-600">
              Model comparison usually starts in the wrong place. Parameter count is the number everyone reaches for,
              and it is among the least informative things you can know. It does not tell you how much memory the
              model needs in practice, how fast it will generate, what you are permitted to do with it, or whether it
              is any good at your task. Four other properties carry far more weight.
            </p>
            <p className="mt-4 text-sm leading-7 text-gray-600">
              The first is real memory footprint, which is weights plus KV cache at the context you actually serve.
              The cache term is where models of the same size diverge sharply: a model using grouped-query attention
              stores one key-value pair per group of heads instead of per head, cutting cache by that ratio, and newer
              latent-attention designs compress it further. Two 7B models can therefore differ by gigabytes, which is
              frequently the difference between fitting a 12 GB card and not.
            </p>
            <p className="mt-4 text-sm leading-7 text-gray-600">
              The second is the licence, and it is binary in a way benchmarks are not. Apache 2.0 and MIT impose
              almost nothing. Open-weight licences permit commercial use but attach acceptable-use terms, attribution
              requirements, and sometimes scale thresholds — and those obligations follow the weights into any
              fine-tune you produce or redistribute. A model you cannot legally ship is not a candidate, however well
              it scores.
            </p>
            <p className="mt-4 text-sm leading-7 text-gray-600">
              The third is the tokenizer, which quietly sets your cost and your effective context. The fourth is
              task-specific capability, which general leaderboards obscure: coding, multilingual work, long-document
              reasoning, and structured extraction each have models that outperform their size class and models that
              disappoint. Compare within the task you care about, not in the abstract.
            </p>
          </section>

          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
            <h2 className="text-2xl font-black tracking-tight text-gray-900">From comparison to decision</h2>
            <p className="mt-4 text-sm leading-7 text-gray-600">
              A specification comparison is a filter, not a verdict. It reliably tells you which models are
              impossible — too large for your hardware, licensed in a way you cannot accept, or built with a context
              window too short for your documents. It cannot tell you which of the survivors is best, because the
              things that decide that are behavioural and do not appear in metadata.
            </p>
            <p className="mt-4 text-sm leading-7 text-gray-600">
              So use the table to get to three or four candidates, then move to measurement. Confirm what each one
              actually costs in memory with the{" "}
              <Link href="/gpu/tools/vram-calculator" className="font-semibold text-[#23425f] hover:text-[#18324f]">
                VRAM Calculator
              </Link>
              , check them against a specific card in{" "}
              <Link href="/can-i-run" className="font-semibold text-[#23425f] hover:text-[#18324f]">
                Can I Run It
              </Link>
              , and run them against your own prompts in the{" "}
              <Link href="/validation-lab" className="font-semibold text-[#23425f] hover:text-[#18324f]">
                Validation Lab
              </Link>
              . If you are not sure which models belong in the comparison to begin with, the{" "}
              <Link href="/recommender" className="font-semibold text-[#23425f] hover:text-[#18324f]">
                Recommender
              </Link>{" "}
              will narrow the field by task and constraint first.
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
    </>
  );
}
