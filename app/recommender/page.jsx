import RecommenderPage from "../../src/views/RecommenderPage";
import { pageMetadata } from "../../src/lib/seo";

export const metadata = pageMetadata({
  title: "AI Model Recommender",
  description:
    "Get a practical shortlist of AI models based on use case, constraints, hardware, and deployment goals.",
  path: "/recommender",
  keywords: ["AI model recommender", "best LLM for my use case", "model selection wizard"],
});

export default function RecommenderRoute() {
  return <RecommenderPage />;
}
