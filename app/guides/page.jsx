import Link from 'next/link';
import { pageMetadata } from '../../src/lib/seo';
import { getAllGuides } from '../../src/data/guidesContent';

export const metadata = pageMetadata({
  title: 'AI Guides and Tutorials',
  description:
    'Explore practical AI deployment guides on model selection, RAG, quantization, latency, and GPU-aware production workflows.',
  path: '/guides',
  keywords: ['AI guides', 'LLM tutorials', 'model selection guide', 'RAG tutorial'],
});

export default function GuidesPage() {
  const guides = getAllGuides();
  return (
    <div className="shell-container guides-index">
      <header><h1>Deployment guides</h1>
        <p>Field guides to model selection, GPU sizing, and production inference. Choose a topic that matches the decision you are working on.</p>
      </header>
      <div className="guide-list">
        {guides.map(guide => <article key={guide.slug}>
          <span>{guide.category}</span>
          <div><h2><Link href={`/guides/${guide.slug}`}>{guide.title}</Link></h2><p>{guide.description}</p></div>
          <small>{guide.readTime}<br/>{guide.difficulty}</small>
        </article>)}
      </div>
    </div>
  );
}
