import { notFound } from "next/navigation";
import RagTutorialContent from "../../../src/components/rag-tutorial/RagTutorialContent";
import { pageMetadata } from "../../../src/lib/seo";
import { getTutorialFromFirestore } from "../../../src/lib/tutorialsFirestore";

export const revalidate = 3600;

export const metadata = pageMetadata({
  title: "Complete RAG Tutorial for Developers",
  description:
    "Learn retrieval-augmented generation from beginner concepts to production: chunking, embeddings, vector databases, retrieval, prompts, citations, code examples, RAGAS evaluation, and deployment.",
  path: "/ai-tutorials/rag",
  keywords: ["RAG tutorial", "retrieval augmented generation", "vector database", "LLM retrieval", "RAGAS evaluation"],
});

export default async function RagTutorialPage() {
  const tutorial = await getTutorialFromFirestore("rag");
  const hasChapters = Array.isArray(tutorial?.chapters) && tutorial.chapters.length > 0;

  if (!tutorial || tutorial.published === false || !hasChapters) notFound();

  return <RagTutorialContent tutorial={tutorial} />;
}
