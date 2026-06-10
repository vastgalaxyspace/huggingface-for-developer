import RagTutorialContent from "../../../src/components/rag-tutorial/RagTutorialContent";
import { pageMetadata } from "../../../src/lib/seo";

export const metadata = pageMetadata({
  title: "RAG Tutorial for AI Apps",
  description:
    "Learn how to build a retrieval-augmented generation app with document ingestion, chunking, embeddings, retrieval, grounded prompts, citations, and evaluation.",
  path: "/ai-tutorials/rag",
  keywords: ["RAG tutorial", "retrieval augmented generation", "AI app tutorial", "vector database", "LLM retrieval"],
});

export default function RagTutorialPage() {
  return (
    <div className="shell-container py-10">
      <RagTutorialContent />
    </div>
  );
}
