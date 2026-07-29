import Link from "next/link";
import ModelValidationLab from "../../src/components/validation-lab/ModelValidationLab";
import { pageMetadata } from "../../src/lib/seo";

export const metadata = pageMetadata({
  title: "Model Validation Lab",
  description:
    "Generate model test prompts, runtime snippets, VRAM warnings, and validation notes before choosing an AI model for deployment.",
  path: "/validation-lab",
  keywords: ["AI model validation", "LLM test prompts", "Hugging Face model testing", "model deployment validation"],
});

const faq = [
  {
    q: "What should a model validation set actually contain?",
    a: "Ten to twenty tasks drawn from real usage, weighted toward the cases your current approach handles badly. Include at least one trivially easy case as a regression canary, one long-context case, one malformed or adversarial input, and one high-value scenario where a wrong answer would be expensive. A set that only contains representative average cases will pass almost any model.",
  },
  {
    q: "Why test at the deployment precision rather than FP16?",
    a: "Because quantization degrades unevenly. Conversational fluency survives 4-bit well, while exact arithmetic, strict JSON adherence, and tool-call argument construction degrade first and degrade quietly. A model validated at full precision and shipped quantized has not been validated for what you are actually running.",
  },
  {
    q: "How do I know whether a failure is the model or the prompt?",
    a: "Change one variable at a time and keep a baseline. If a stronger model fixes it, the issue was capability. If a clearer instruction or an explicit output schema fixes it, the issue was the prompt. If neither helps but supplying the answer in context does, the issue is retrieval, not generation.",
  },
  {
    q: "What should be recorded for a validation run to be reproducible?",
    a: "The exact model repository and revision, the quantization method, the runtime and its version, the GPU and driver, the context length, batch settings, sampling parameters, and the prompt set itself. Changing any one of these can change behaviour, and without them a result cannot be compared against a later run.",
  },
];

export default function ValidationLabPage() {
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
    <div className="bg-gray-100 py-8 md:py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <div className="shell-container space-y-6">
        <ModelValidationLab />

        {/* Server-rendered editorial beneath the tool. The lab generates its
            output client-side, which left this page at ~139 rendered words. */}
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
          <h2 className="text-2xl font-black tracking-tight text-gray-900">
            How to validate a model before you deploy it
          </h2>
          <p className="mt-4 text-sm leading-7 text-gray-600">
            Most model regressions reach production because the thing that was tested was not the thing that shipped.
            A model is evaluated at full precision and deployed at 4-bit. It is tested on short prompts and then sent
            long documents. It is checked by one person interactively and then serves twenty concurrent users. Each of
            these changes behaviour in ways that a benchmark score cannot predict, which is why validation has to
            happen against your own workload at your own settings.
          </p>
          <p className="mt-4 text-sm leading-7 text-gray-600">
            Start by writing down what &quot;working&quot; means before you look at any output. For a summarizer that
            might be factual accuracy against the source and a length ceiling. For an extraction task it is
            schema-valid output and correct field values, scored separately, because a model that returns perfect data
            in a broken envelope has a different problem from one that returns well-formed nonsense. Defining this
            first is what stops evaluation from collapsing into reading a few responses and forming an impression.
          </p>
          <p className="mt-4 text-sm leading-7 text-gray-600">
            Then hold everything constant except the variable you are testing. The most common analysis error is
            changing the model and the prompt together, then attributing the whole difference to the model. Keep a
            baseline run — the current model, the current prompt, the current settings — and compare against it every
            time. When a change improves average quality but worsens the worst case, treat that as a product risk
            rather than a win, because users experience the worst case far more memorably than the average one.
          </p>
          <p className="mt-4 text-sm leading-7 text-gray-600">
            Finally, separate the memory question from the quality question. A model that passes every quality check
            and then runs out of VRAM under real concurrency has not passed validation. Size the deployment with the{" "}
            <Link href="/gpu/tools/vram-calculator" className="font-semibold text-[#23425f] hover:text-[#18324f]">
              VRAM Calculator
            </Link>{" "}
            at your actual context length, confirm the card in{" "}
            <Link href="/can-i-run" className="font-semibold text-[#23425f] hover:text-[#18324f]">
              Can I Run It
            </Link>
            , and re-check both whenever you change quantization — the two questions interact, since freeing memory is
            usually what tempts teams into the precision drop that costs them quality.
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
