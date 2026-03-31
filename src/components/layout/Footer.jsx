import Link from 'next/link';

const Footer = () => {
  return (
    <footer className="mt-16 border-t border-[var(--border-soft)] bg-[rgba(251,253,255,0.9)]">
      <div className="shell-container py-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-2 text-sm text-[var(--text-muted)] md:flex-row md:items-center">
            <span className="font-extrabold uppercase tracking-[0.28em] text-[var(--text-faint)]">InnoAI AI Explorer</span>
            <span className="hidden text-[var(--border-strong)] md:inline">|</span>
            <span>&copy; 2024 InnoAI AI Explorer. All rights reserved.</span>
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-bold uppercase tracking-[0.2em] text-[var(--text-faint)]">
            <Link href="#" className="transition-colors hover:text-[var(--text-main)]">Documentation</Link>
            <Link href="#" className="transition-colors hover:text-[var(--text-main)]">Community</Link>
            <Link href="#" className="transition-colors hover:text-[var(--text-main)]">License</Link>
            <Link href="#" className="transition-colors hover:text-[var(--text-main)]">API Status</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

