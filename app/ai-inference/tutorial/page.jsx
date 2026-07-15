import AiInferenceTutorialClient from "../../../src/components/routes/AiInferenceTutorialClient";
import { pageMetadata } from "../../../src/lib/seo";

export const metadata = pageMetadata({
  title: "AI Inference Tutorial: Run and Serve LLMs Step by Step",
  description:
    "A practical AI inference tutorial: how model serving works, batching and KV cache, quantization, choosing hardware, and deploying LLMs for production with realistic latency and cost.",
  path: "/ai-inference/tutorial",
  keywords: [
    "AI inference tutorial",
    "LLM inference",
    "model serving",
    "how to deploy LLM",
    "LLM latency and throughput",
  ],
  type: "article",
});

export default function AiInferenceTutorialPage() {
  return <AiInferenceTutorialClient />;
}
