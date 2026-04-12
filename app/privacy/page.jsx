import { pageMetadata } from '../../src/lib/seo';

export const metadata = pageMetadata({
  title: 'Privacy Policy',
  description:
    'Read the InnoAI privacy policy covering data collection, analytics, cookies, retention, and contact process for privacy requests.',
  path: '/privacy',
  keywords: ['InnoAI privacy policy', 'privacy policy'],
});

export default function PrivacyPage() {
  return (
    <div className="shell-container py-16">
      <div className="editorial-panel rounded-[28px] px-6 py-10 sm:px-10">
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-[var(--accent)]">Privacy</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight text-[var(--text-strong)]">Privacy Policy</h1>
        <p className="mt-5 text-sm leading-8 text-[var(--text-muted)]">Last updated: April 12, 2026</p>
        <div className="mt-6 max-w-3xl space-y-5 text-[15px] leading-8 text-[var(--text-muted)]">
          <p>
            InnoAI is designed to help users research open-source AI models and deployment workflows. We aim to collect
            minimal information needed to operate, improve, and secure the website.
          </p>
          <p>
            We may process basic technical information such as browser type, device information, page paths, and
            interaction events for analytics and reliability monitoring. This helps us understand which content and tools
            are useful and where user experience can be improved.
          </p>
          <p>
            Do not submit sensitive personal, financial, healthcare, or regulated data through site tools or forms. Any
            information submitted should be limited to what is necessary for support and content feedback.
          </p>
          <p>
            Cookies or similar technologies may be used for analytics, session functionality, and security controls.
            You can manage cookies through your browser settings.
          </p>
          <p>
            We may update this policy when product functionality, legal requirements, or service providers change.
            Continued use of the website after updates indicates acceptance of the revised policy.
          </p>
          <p>
            For privacy questions, correction requests, or data handling inquiries, use the contact details listed on
            the contact page and include enough context for follow-up.
          </p>
        </div>
      </div>
    </div>
  );
}
