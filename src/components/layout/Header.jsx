"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bell } from 'lucide-react';

const Header = () => {
  const pathname = usePathname();

  const isActive = (path) => {
    if (path === '/' && pathname === '/') return true;
    if (path !== '/' && pathname?.startsWith(path)) return true;
    return false;
  };

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border-soft)] bg-[rgba(251,253,255,0.88)] backdrop-blur-xl">
      <div className="shell-container flex h-[78px] items-center justify-between gap-6">
        <div className="flex h-full items-center gap-8 lg:gap-12">
          <Link href="/" className="flex items-center">
            <span className="text-[1.15rem] font-extrabold tracking-tight text-[var(--text-strong)]">
              Model Explorer
            </span>
          </Link>

          <nav className="flex h-full items-center gap-6 text-[15px] font-medium text-[var(--text-muted)] lg:gap-8">
            <Link
              href="/"
              className={`flex h-full items-center border-b-[3px] pt-[3px] transition-colors ${
                isActive('/')
                  ? 'border-[var(--text-strong)] text-[var(--text-strong)]'
                  : 'border-transparent hover:text-[var(--text-strong)]'
              }`}
            >
              Home
            </Link>
            <Link
              href="/compare"
              className={`flex h-full items-center border-b-[3px] pt-[3px] transition-colors ${
                isActive('/compare')
                  ? 'border-[var(--text-strong)] text-[var(--text-strong)]'
                  : 'border-transparent hover:text-[var(--text-strong)]'
              }`}
            >
              Compare
            </Link>
            <Link
              href="/recommender"
              className={`flex h-full items-center border-b-[3px] pt-[3px] transition-colors ${
                isActive('/recommender')
                  ? 'border-[var(--text-strong)] text-[var(--text-strong)]'
                  : 'border-transparent hover:text-[var(--text-strong)]'
              }`}
            >
              Recommender
            </Link>
            <Link
              href="/gpu"
              className={`flex h-full items-center border-b-[3px] pt-[3px] transition-colors ${
                isActive('/gpu')
                  ? 'border-[var(--text-strong)] text-[var(--text-strong)]'
                  : 'border-transparent hover:text-[var(--text-strong)]'
              }`}
            >
              GPU Hub
            </Link>
            <Link
              href="/ai-updates"
              className={`flex h-full items-center border-b-[3px] pt-[3px] transition-colors ${
                isActive('/ai-updates')
                  ? 'border-[var(--text-strong)] text-[var(--text-strong)]'
                  : 'border-transparent hover:text-[var(--text-strong)]'
              }`}
            >
              AI Updates
            </Link>
            <Link
              href="/about"
              className={`flex h-full items-center border-b-[3px] pt-[3px] transition-colors ${
                isActive('/about')
                  ? 'border-[var(--text-strong)] text-[var(--text-strong)]'
                  : 'border-transparent hover:text-[var(--text-strong)]'
              }`}
            >
              About Us
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3 text-[var(--text-muted)]">
          <button className="flex h-10 w-10 items-center justify-center rounded-xl border border-transparent transition-colors hover:border-[var(--border-soft)] hover:bg-white hover:text-[var(--text-strong)]">
            <Bell className="h-[18px] w-[18px]" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
