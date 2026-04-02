import LearningTopicClient from "./LearningTopicClient";

export default async function LearningTopicPage({ params }) {
  const resolvedParams = await params;

  return <LearningTopicClient slug={resolvedParams.slug} />;
}
