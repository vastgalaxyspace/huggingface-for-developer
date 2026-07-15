import TutorialTestClient from "../../../src/components/routes/TutorialTestClient";
import { pageMetadata } from "../../../src/lib/seo";

// Interactive quiz page — thin for search and gated behind sign-in. Keep it out
// of the index (also stops it inheriting the root layout's homepage canonical).
export const metadata = {
  ...pageMetadata({
    title: "GPU Tutorial Final Test",
    description: "Take the final test for the GPU tutorial learning path.",
    path: "/gpu/test",
  }),
  robots: { index: false, follow: true },
};

export default function GpuTutorialTestPage() {
  return <TutorialTestClient tutorialId="gpu" />;
}
