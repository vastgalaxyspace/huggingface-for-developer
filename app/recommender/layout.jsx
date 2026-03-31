import { pageMetadata } from '../../src/lib/seo';

export const metadata = pageMetadata({
  title: 'AI Model Recommender',
  description:
    'Answer a few quick questions and get model recommendations matched to your hardware, latency, and use case.',
  path: '/recommender',
  keywords: ['AI model recommender', 'LLM recommender', 'model selection tool'],
});

export default function RecommenderLayout({ children }) {
  return <>{children}</>;
}
