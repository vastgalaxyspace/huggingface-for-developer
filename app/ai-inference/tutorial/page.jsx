import AiInferenceTutorialClient from "../../../src/components/routes/AiInferenceTutorialClient";
import { pageMetadata } from "../../../src/lib/seo";
import { getTutorialFromFirestore } from "../../../src/lib/tutorialsFirestore";

const TUTORIAL_ID = "ai-inference";

// Rebuild hourly. The tutorial body is fetched here rather than in the client so
// the lesson is present in the server HTML; fetching it on mount left crawlers
// with an empty shell and parked the page in "Crawled - currently not indexed".
export const revalidate = 3600;

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

// Firestore Timestamps are not serializable across the server/client boundary.
const toPlain = (value) => (value ? JSON.parse(JSON.stringify(value)) : null);

export default async function AiInferenceTutorialPage() {
  const tutorial = await getTutorialFromFirestore(TUTORIAL_ID);
  const hasChapters = Array.isArray(tutorial?.chapters) && tutorial.chapters.length > 0;

  // Deliberately no notFound() here: if Firestore is unreachable at build time the
  // client falls back to its own fetch rather than the route 404-ing.
  const initialTutorial = hasChapters
    ? toPlain({ title: tutorial.title || "AI Inference Tutorial", chapters: tutorial.chapters })
    : null;

  return <AiInferenceTutorialClient initialTutorial={initialTutorial} />;
}
