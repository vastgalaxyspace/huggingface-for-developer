import Link from "next/link";
import RecommenderPage from "../../src/views/RecommenderPage";
import { pageMetadata } from "../../src/lib/seo";

export const metadata = pageMetadata({
  title: "AI Model Recommender",
  description:
    "Get a practical shortlist of AI models based on use case, constraints, hardware, and deployment goals.",
  path: "/recommender",
  keywords: ["AI model recommender", "best LLM for my use case", "model selection wizard"],
});

const faq = [
  {
    q: "How does the recommender choose models?",
    a: "It filters before it ranks. Your task, context length, and licence constraints remove models that cannot do the job at all, then the remaining candidates are scored on memory fit against your hardware, capability signals for that task, and deployment practicality. A model that scores brilliantly but needs three times your VRAM is not a recommendation, so fit acts as a gate rather than one factor among many.",
  },
  {
    q: "Why does it sometimes suggest a smaller model than I expected?",
    a: "Because the largest model that technically fits is rarely the right default. Once weights and KV cache leave under about ten percent headroom, the deployment becomes fragile the moment context or concurrency grows. The recommender prefers a model that leaves room to operate over one that only fits on a short prompt with a single user.",
  },
  {
    q: "Should I trust the shortlist without testing?",
    a: "No, and it is not meant to be used that way. The shortlist narrows thousands of candidates to a handful worth your evaluation time. Which of those handful is actually best for your prompts, your output format, and your latency budget is something only your own test set can answer.",
  },
  {
    q: "What does it not account for?",
    a: "Anything it cannot measure from model metadata: the quality of a specific fine-tune, how a model behaves inside your agent loop, provider reliability, and how your prompts interact with a particular instruction-tuning style. It also assumes a single-GPU deployment unless you tell it otherwise.",
  },
];

export default function RecommenderRoute() {
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
      <RecommenderPage />

      {/* Server-rendered editorial beneath the wizard. The wizard itself is a
          client-side flow with nothing crawlable in it, which left this page at
          ~283 rendered words despite being linked from the header and footer. */}
      <div className="bg-gray-100 py-8 md:py-12">
        <div className="shell-container space-y-6">
          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
            <h2 className="text-2xl font-black tracking-tight text-gray-900">How to choose an AI model</h2>
            <p className="mt-4 text-sm leading-7 text-gray-600">
              Model selection goes wrong in a predictable way: teams start from a leaderboard, pick the highest-scoring
              open model they recognise, and discover weeks later that it does not fit their card, that its licence
              carries obligations they cannot meet, or that it is excellent at benchmarks and mediocre at the one task
              they actually need. The order of the questions matters more than the answer to any single one.
            </p>
            <p className="mt-4 text-sm leading-7 text-gray-600">
              Start with the constraint that cannot be negotiated. For most teams that is memory: a model either fits
              your GPU at an acceptable precision or it does not, and no amount of prompt engineering changes that.
              Work out your real budget first — weights plus KV cache at the context length you actually serve, not the
              model maximum — and use it to eliminate candidates before you compare quality. This is why the wizard
              asks about hardware early rather than last.
            </p>
            <p className="mt-4 text-sm leading-7 text-gray-600">
              Second comes the task. &quot;Good at everything&quot; is not a useful category, and general capability
              rankings hide large differences on specific work. Coding, multilingual output, long-document reasoning,
              structured extraction, and tool calling each have models that punch well above their size and models
              that disappoint relative to theirs. A 7B tuned for your task will frequently beat a 34B that was not.
            </p>
            <p className="mt-4 text-sm leading-7 text-gray-600">
              Third is the licence, and it is the one most often discovered too late. Apache 2.0 and MIT models impose
              essentially nothing. Open-weight licences such as Llama and Gemma permit commercial use but add
              acceptable-use terms, attribution requirements, and in some cases thresholds that apply at scale — and
              those obligations travel with the weights into anything you fine-tune or redistribute. Read the terms
              before a model becomes load-bearing, not after.
            </p>
          </section>

          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
            <h2 className="text-2xl font-black tracking-tight text-gray-900">What a shortlist is for</h2>
            <p className="mt-4 text-sm leading-7 text-gray-600">
              The output here is a starting point, not a verdict. Its job is to take an unmanageable field down to
              three or four candidates that are all plausible, so your evaluation effort goes into comparing real
              options rather than surveying the field. The decision that follows should be made on your own prompts.
            </p>
            <p className="mt-4 text-sm leading-7 text-gray-600">
              A workable evaluation is smaller than most teams expect. Assemble ten to twenty tasks drawn from real
              usage, including several that your current approach handles badly, and score each candidate on
              correctness and on format-validity separately — a model that is right but returns unparseable output is
              a different problem from one that is well-formed and wrong. Run them at the quantization and context
              length you would actually deploy, because a model evaluated at FP16 and shipped at 4-bit has not really
              been evaluated. Then confirm the memory numbers with the{" "}
              <Link href="/gpu/tools/vram-calculator" className="font-semibold text-[#23425f] hover:text-[#18324f]">
                VRAM Calculator
              </Link>{" "}
              and check the specific card with{" "}
              <Link href="/can-i-run" className="font-semibold text-[#23425f] hover:text-[#18324f]">
                Can I Run It
              </Link>
              .
            </p>
            <p className="mt-4 text-sm leading-7 text-gray-600">
              If two candidates land within noise of each other, stop optimizing for quality and decide on the
              operational questions instead: which has better runtime support, a more permissive licence, a more
              active maintenance history, and a clearer upgrade path. Those differences compound over a deployment&apos;s
              life in a way that a two-point benchmark gap does not.
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
