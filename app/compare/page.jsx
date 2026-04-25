import ComparisonPage from "../../src/views/ComparisonPage";
import { pageMetadata } from "../../src/lib/seo";

export const metadata = pageMetadata({
  title: "Model Comparison Tool",
  description:
    "Compare AI models side by side across context, parameters, licensing, deployment fit, and practical operator signals.",
  path: "/compare",
  keywords: ["AI model comparison", "LLM compare tool", "model benchmark workspace"],
});

export default function ComparePage() {
  return <ComparisonPage />;
}
