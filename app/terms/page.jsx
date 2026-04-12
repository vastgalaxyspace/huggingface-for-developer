import { pageMetadata } from '../../src/lib/seo';

export const metadata = pageMetadata({
  title: 'Terms of Service',
  description:
    'Read the InnoAI Terms of Service covering acceptable use, informational limitations, intellectual property, and liability.',
  path: '/terms',
  keywords: ['InnoAI terms', 'terms of service', 'website terms'],
});

export default function TermsPage() {
  return (
    <div className="shell-container py-16">
      <div className="editorial-panel rounded-[28px] px-6 py-10 sm:px-10">
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-[var(--accent)]">Legal</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight text-[var(--text-strong)]">Terms of Service</h1>
        <p className="mt-5 text-sm leading-8 text-[var(--text-muted)]">Last updated: April 12, 2026</p>

        <div className="mt-8 space-y-7 text-[15px] leading-8 text-[var(--text-muted)]">
          <section>
            <h2 className="text-xl font-bold text-[var(--text-strong)]">1. Scope</h2>
            <p className="mt-2">
              InnoAI provides educational and informational content, model comparison utilities, and interactive tools
              related to AI model exploration and deployment planning. By accessing this site, you agree to these
              terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[var(--text-strong)]">2. Informational Use</h2>
            <p className="mt-2">
              Tool outputs, model summaries, and calculators are provided for research and planning support. They do
              not constitute legal, financial, medical, or compliance advice. You are responsible for validating
              results before business or production decisions.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[var(--text-strong)]">3. Acceptable Use</h2>
            <p className="mt-2">
              You agree not to abuse, disrupt, reverse engineer, or attempt unauthorized access to site systems or
              APIs. You also agree not to use this website for unlawful activity or automated scraping that negatively
              impacts service availability.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[var(--text-strong)]">4. Intellectual Property</h2>
            <p className="mt-2">
              Site design, editorial content, and original analysis are property of InnoAI unless otherwise stated.
              Third-party model names, logos, and trademarks belong to their respective owners and are used for
              identification and comparison purposes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[var(--text-strong)]">5. Third-Party Links and Data</h2>
            <p className="mt-2">
              The website may reference external model repositories, documentation, or APIs. InnoAI is not responsible
              for third-party website availability, terms, policies, or content changes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[var(--text-strong)]">6. Warranty Disclaimer</h2>
            <p className="mt-2">
              The service is provided on an "as is" and "as available" basis without warranties of any kind. InnoAI
              does not guarantee uninterrupted access, complete accuracy, or fitness for a particular purpose.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[var(--text-strong)]">7. Limitation of Liability</h2>
            <p className="mt-2">
              To the fullest extent allowed by law, InnoAI will not be liable for indirect, incidental, special, or
              consequential damages arising from use of this site or reliance on informational outputs.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[var(--text-strong)]">8. Updates to Terms</h2>
            <p className="mt-2">
              We may revise these terms to reflect product, legal, or operational updates. Continued use of the site
              after changes indicates acceptance of the revised terms.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
