"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Bell, Menu, X } from 'lucide-react';
<<<<<<< HEAD

const NAV_ITEMS = [
  { href: '/', label: 'Home' },
  { href: '/compare', label: 'Compare' },
  { href: '/recommender', label: 'Recommender' },
  { href: '/gpu', label: 'GPU Hub' },
  { href: '/ai-updates', label: 'AI Updates' },
  { href: '/about', label: 'About Us' },
];

const Header = () => {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
=======

const Header = () => {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const navItems = [
    { href: '/', label: 'Home' },
    { href: '/compare', label: 'Compare' },
    { href: '/recommender', label: 'Recommender' },
    { href: '/gpu', label: 'GPU Hub' },
    { href: '/ai-updates', label: 'AI Updates' },
    { href: '/about', label: 'About Us' },
  ];
>>>>>>> bac7edc (added the seo info)

  const isActive = (path) => {
    if (path === '/' && pathname === '/') return true;
    if (path !== '/' && pathname?.startsWith(path)) return true;
    return false;
  };

  return (
<<<<<<< HEAD
    <header className="sticky top-0 z-50 border-b border-[var(--border-soft)] bg-[rgba(251,253,255,0.88)] backdrop-blur-xl">
      <div className="shell-container flex min-h-[72px] items-center justify-between gap-4 py-3 md:min-h-[78px]">
        <div className="flex min-w-0 items-center gap-4 lg:gap-12">
          <Link href="/" className="flex min-w-0 items-center">
            <span className="text-[1rem] font-extrabold leading-tight tracking-tight text-[var(--text-strong)] sm:text-[1.1rem] md:text-[1.15rem]">
              InnoAI <span className="hidden sm:inline">AI Explorer</span>
=======
    <header className="sticky top-0 z-50 border-b border-[var(--border-soft)] bg-[rgba(251,253,255,0.92)] backdrop-blur-xl">
      <div className="shell-container flex min-h-[72px] items-center justify-between gap-3 py-3 lg:h-[78px] lg:py-0">
        <div className="flex min-w-0 h-full items-center gap-4 lg:gap-12">
          <Link href="/" className="flex min-w-0 items-center" onClick={() => setMenuOpen(false)}>
            <span className="text-base font-extrabold leading-tight tracking-tight text-[var(--text-strong)] sm:text-[1.05rem] lg:text-[1.15rem]">
              InnoAI AI Explorer
>>>>>>> bac7edc (added the seo info)
            </span>
          </Link>

          <nav className="hidden h-full items-center gap-6 text-[15px] font-medium text-[var(--text-muted)] lg:flex lg:gap-8">
<<<<<<< HEAD
            {NAV_ITEMS.map((item) => (
=======
            {navItems.map((item) => (
>>>>>>> bac7edc (added the seo info)
              <Link
                key={item.href}
                href={item.href}
                className={`flex h-full items-center border-b-[3px] pt-[3px] transition-colors ${
                  isActive(item.href)
                    ? 'border-[var(--text-strong)] text-[var(--text-strong)]'
                    : 'border-transparent hover:text-[var(--text-strong)]'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

<<<<<<< HEAD
        <div className="flex items-center gap-3 text-[var(--text-muted)]">
          <button className="hidden h-10 w-10 items-center justify-center rounded-xl border border-transparent transition-colors hover:border-[var(--border-soft)] hover:bg-white hover:text-[var(--text-strong)] sm:flex">
=======
        <div className="flex items-center gap-2 text-[var(--text-muted)]">
          <button className="hidden h-10 w-10 items-center justify-center rounded-xl border border-transparent transition-colors hover:border-[var(--border-soft)] hover:bg-white hover:text-[var(--text-strong)] lg:flex">
>>>>>>> bac7edc (added the seo info)
            <Bell className="h-[18px] w-[18px]" />
          </button>
          <button
            type="button"
<<<<<<< HEAD
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen((open) => !open)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border-soft)] bg-white text-[var(--text-main)] transition-colors hover:text-[var(--text-strong)] lg:hidden"
          >
            {mobileMenuOpen ? <X className="h-[18px] w-[18px]" /> : <Menu className="h-[18px] w-[18px]" />}
=======
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((prev) => !prev)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border-soft)] bg-white text-[var(--text-main)] transition-colors hover:text-[var(--text-strong)] lg:hidden"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
>>>>>>> bac7edc (added the seo info)
          </button>
        </div>
      </div>

<<<<<<< HEAD
      {mobileMenuOpen && (
        <div className="border-t border-[var(--border-soft)] bg-[rgba(251,253,255,0.96)] lg:hidden">
          <div className="shell-container py-4">
            <nav className="grid gap-2">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition-colors ${
                    isActive(item.href)
                      ? 'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]'
                      : 'border-[var(--border-soft)] bg-white text-[var(--text-main)]'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}
=======
      {menuOpen ? (
        <div className="border-t border-[var(--border-soft)] bg-[rgba(251,253,255,0.98)] lg:hidden">
          <nav className="shell-container grid gap-1 py-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className={`rounded-2xl px-4 py-3 text-sm font-semibold transition-colors ${
                  isActive(item.href)
                    ? 'bg-[var(--accent-soft)] text-[var(--accent)]'
                    : 'text-[var(--text-main)] hover:bg-[var(--panel-muted)]'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      ) : null}
>>>>>>> bac7edc (added the seo info)
    </header>
  );
};

export default Header;

