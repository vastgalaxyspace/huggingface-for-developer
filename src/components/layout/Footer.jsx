import Link from 'next/link';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    { href: '/about', label: 'About' },
    { href: '/editorial-policy', label: 'Editorial Policy' },
    { href: '/guides', label: 'Guides' },
    { href: '/compare', label: 'Compare Models' },
    { href: '/recommender', label: 'Recommender' },
    { href: '/gpu', label: 'GPU Tools' },
    { href: '/ai-updates', label: 'AI Updates' },
    { href: '/privacy', label: 'Privacy' },
    { href: '/terms', label: 'Terms' },
    { href: '/contact', label: 'Contact' },
  ];

  return (
    <footer className="mt-16 border-t border-[var(--border-soft)] bg-[rgba(251,253,255,0.9)]">
      <div className="shell-container py-10">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-xl">
            <div className="flex flex-col gap-2 text-sm text-[var(--text-muted)] md:flex-row md:items-center">
              <span className="font-extrabold uppercase tracking-[0.28em] text-[var(--text-faint)]">InnoAI AI Explorer</span>
              <span className="hidden text-[var(--border-strong)] md:inline">|</span>
              <span>&copy; {currentYear} InnoAI AI Explorer. All rights reserved.</span>
            </div>
            <p className="mt-4 text-sm leading-7 text-[var(--text-muted)]">
              Research open-source AI models, compare LLMs, estimate VRAM, and plan GPU infrastructure with tools built for developers, researchers, and ML teams.
            </p>
            <p className="mt-3 text-sm leading-7 text-[var(--text-muted)]">
              We publish original guides, practical calculators, and editorial analysis focused on real model selection
              and deployment decisions.
            </p>
          </div>

          <div className="grid gap-2.5 text-sm font-semibold text-[var(--text-muted)] sm:grid-cols-2 lg:min-w-[420px]">
            {footerLinks.map((link) => (
              <Link key={link.href} href={link.href} prefetch={false} className="transition-colors hover:text-[var(--text-main)]">
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

