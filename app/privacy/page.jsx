import { pageMetadata } from '../../src/lib/seo';

export const metadata = pageMetadata({
  title: 'Privacy Policy',
  description:
    'Read the InnoAI privacy policy covering analytics, site usage, and how to contact us about data handling questions.',
  path: '/privacy',
  keywords: ['InnoAI privacy policy', 'privacy policy'],
});

export default function PrivacyPage() {
  return (
    <div className="shell-container py-16">
      <div className="editorial-panel rounded-[28px] px-6 py-10 sm:px-10">
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-[var(--accent)]">Privacy</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight text-[var(--text-strong)]">Privacy Policy</h1>
        <div className="mt-6 max-w-3xl space-y-5 text-[15px] leading-8 text-[var(--text-muted)]">
          <p>
            InnoAI AI Explorer is designed to help users research open-source AI models, compare LLMs, and estimate
            deployment needs. We aim to collect as little personal information as possible while keeping the product
            useful and secure.
          </p>
          <p>
            If analytics are enabled, they may be used to understand page visits, tool usage, and general site
            performance. Do not submit sensitive personal, financial, or regulated data into any search field or tool.
          </p>
          <p>
            If you need details about data handling, analytics, or deletion requests, use the contact page and include
            enough information for follow-up.
          </p>
        </div>
      </div>
    </div>
  );
}
