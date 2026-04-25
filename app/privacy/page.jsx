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
        <div className="mt-8 space-y-7 text-[15px] leading-8 text-[var(--text-muted)]">
          <section>
            <h2 className="text-xl font-bold text-[var(--text-strong)]">1. Scope</h2>
            <p className="mt-2">
              InnoAI is designed to help users research open-source AI models and deployment workflows. We aim to
              collect only the information reasonably needed to operate, improve, and secure the website.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[var(--text-strong)]">2. Information We May Process</h2>
            <p className="mt-2">
              We may process basic technical information such as browser type, device information, approximate usage
              patterns, page paths, and interaction events for analytics and reliability monitoring. This helps us
              understand which content and tools are useful and where user experience can be improved.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[var(--text-strong)]">3. User Submissions and Support Requests</h2>
            <p className="mt-2">
              Do not submit sensitive personal, financial, healthcare, or regulated data through site tools or forms.
              Any information submitted should be limited to what is necessary for support, feedback, editorial
              corrections, or partnership inquiries.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[var(--text-strong)]">4. Cookies and Similar Technologies</h2>
            <p className="mt-2">
              Cookies or similar technologies may be used for analytics, session functionality, fraud prevention, and
              security controls. You can manage cookie behavior through your browser settings.
            </p>
            <p className="mt-2">
              Third-party vendors, including Google, may use cookies to serve ads based on a user&apos;s previous visits
              to this website or other websites. Google&apos;s use of advertising cookies enables Google and its partners
              to serve ads based on visits to this site and other sites on the internet.
            </p>
            <p className="mt-2">
              Users can opt out of personalized advertising through Google&apos;s{' '}
              <a
                href="https://www.google.com/settings/ads"
                className="font-semibold text-[var(--accent)] hover:text-[var(--accent-strong)]"
                target="_blank"
                rel="noreferrer"
              >
                Ads Settings
              </a>
              . Users can also learn about broader opt-out choices through{' '}
              <a
                href="https://www.aboutads.info/"
                className="font-semibold text-[var(--accent)] hover:text-[var(--accent-strong)]"
                target="_blank"
                rel="noreferrer"
              >
                aboutads.info
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[var(--text-strong)]">5. Third-Party Services</h2>
            <p className="mt-2">
              Some pages may rely on third-party services such as analytics, hosting infrastructure, or data tools.
              Those providers may process limited technical information according to their own policies.
            </p>
            <p className="mt-2">
              If third-party ad vendors or ad networks serve ads on InnoAI, they may use their own cookies or similar
              technologies under their own privacy policies and opt-out controls.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[var(--text-strong)]">6. Policy Updates and Contact</h2>
            <p className="mt-2">
              We may update this policy when product functionality, legal requirements, or service providers change.
              Continued use of the website after updates indicates acceptance of the revised policy. For privacy
              questions or data handling inquiries, use the contact details on the contact page and include enough
              context for follow-up.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
