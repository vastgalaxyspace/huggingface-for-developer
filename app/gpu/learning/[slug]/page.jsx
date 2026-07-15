import LearningTopicClient from "./LearningTopicClient";
import { pageMetadata } from "../../../../src/lib/seo";
import { getTutorialFromFirestore } from "../../../../src/lib/tutorialsFirestore";

const GPU_TUTORIAL_ID = "gpu";

// Mirrors the learning path advertised in app/sitemap.js. Used when Firestore is
// unreachable at build time so the routes still prerender instead of vanishing.
const FALLBACK_TOPIC_SLUGS = [
  "physical-hardware",
  "memory-hierarchy",
  "execution-model",
  "compilation-pipeline",
  "cuda-programming",
  "driver-stack",
  "libraries-frameworks",
];

export const revalidate = 3600;

// Firestore Timestamps are not serializable across the server/client boundary.
const toPlain = (value) => (value ? JSON.parse(JSON.stringify(value)) : null);

async function loadTopic(slug) {
  const tutorial = await getTutorialFromFirestore(GPU_TUTORIAL_ID);
  return { tutorial, topic: tutorial?.topics?.[slug] || null };
}

export async function generateStaticParams() {
  const tutorial = await getTutorialFromFirestore(GPU_TUTORIAL_ID);
  const slugs = Object.keys(tutorial?.topics || {});
  return (slugs.length > 0 ? slugs : FALLBACK_TOPIC_SLUGS).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const { topic } = await loadTopic(slug);
  const path = `/gpu/learning/${slug}`;

  if (!topic) {
    return pageMetadata({
      title: "GPU Learning Path",
      description:
        "Learn how GPUs execute AI workloads: hardware, memory hierarchy, the execution model, the compilation pipeline, and CUDA.",
      path,
    });
  }

  return pageMetadata({
    title: `${topic.title} for AI Developers`,
    description:
      topic.subtitle ||
      `Understand ${topic.title} and how it shapes GPU performance for AI training and inference.`,
    path,
    keywords: [topic.title, "GPU", "CUDA", "AI inference", "GPU architecture"],
    type: "article",
  });
}

export default async function LearningTopicPage({ params }) {
  const { slug } = await params;
  const { tutorial, topic } = await loadTopic(slug);

  // Deliberately not notFound() on a missing topic: a transient Firestore outage
  // would otherwise bake 404s into the static output. The client renders its own
  // unavailable state and retries the fetch itself.
  return (
    <LearningTopicClient
      slug={slug}
      initialTutorial={toPlain(tutorial)}
      initialTopic={toPlain(topic)}
    />
  );
}
