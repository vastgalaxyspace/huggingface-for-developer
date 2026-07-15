import TutorialTestClient from "../../../../src/components/routes/TutorialTestClient";
import { pageMetadata } from "../../../../src/lib/seo";

// Interactive quiz page — thin for search and gated behind sign-in. Keep it out
// of the index (also stops it inheriting the root layout's homepage canonical).
export const metadata = {
  ...pageMetadata({
    title: "AI Inference Tutorial Final Test",
    description: "Take the final test for the AI inference tutorial.",
    path: "/ai-inference/tutorial/test",
  }),
  robots: { index: false, follow: true },
};

export default function AiInferenceTutorialTestPage() {
  return <TutorialTestClient tutorialId="ai-inference" />;
}
