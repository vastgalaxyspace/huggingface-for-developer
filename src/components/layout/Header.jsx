"use client";
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import {
  Menu,
  X,
  ChevronDown,
  ArrowRight,
  Scale,
  BarChart3,
  AlertTriangle,
  Sparkles,
  Target,
  BrainCircuit,
  BookOpen,
  Cpu,
  MemoryStick,
  Gauge,
  Cloud,
  Layers,
  Box,
} from 'lucide-react';

const PRIMARY_NAV_ITEMS = [
  {
    href: '/compare',
    label: 'Compare',
    items: [
      {
        href: '/compare',
        title: 'Model Comparison',
        description: 'Side-by-side model specs and capability checks',
        icon: Scale,
      },
      {
        href: '/guides/llama-vs-qwen-vs-gemma-coding',
        title: 'Coding Model Analysis',
        description: 'Practical comparison for code workflows',
        icon: BarChart3,
      },
      {
        href: '/guides/model-selection-mistakes',
        title: 'Selection Pitfalls',
        description: 'Avoid costly model choice mistakes',
        icon: AlertTriangle,
      },
      {
        href: '/guides/choose-ai-model-by-gpu-budget',
        title: 'Budget Framework',
        description: 'Choose models by GPU and cost limits',
        icon: Target,
      },
    ],
  },
  {
    href: '/recommender',
    label: 'Recommender',
    items: [
      {
        href: '/recommender',
        title: 'AI Recommender',
        description: 'Match models to your task and constraints',
        icon: Sparkles,
      },
      {
        href: '/gpu/tools/gpu-picker',
        title: 'GPU Picker',
        description: 'Find suitable hardware for selected models',
        icon: Cpu,
      },
      {
        href: '/guides/rag-vs-fine-tuning',
        title: 'RAG vs Fine-Tuning',
        description: 'Use the right architecture path',
        icon: BrainCircuit,
      },
      {
        href: '/guides/prompt-patterns-that-work',
        title: 'Prompt Patterns',
        description: 'Reliable prompt structures for production',
        icon: BookOpen,
      },
    ],
  },
  {
    href: '/gpu',
    label: 'GPU Hub',
    items: [
      {
        href: '/gpu',
        title: 'GPU Learning Hub',
        description: 'Architecture, execution, and performance basics',
        icon: Cpu,
      },
      {
        href: '/gpu/tools/vram-calculator',
        title: 'VRAM Calculator',
        description: 'Estimate memory requirements quickly',
        icon: MemoryStick,
      },
      {
        href: '/gpu/tools/gpu-picker',
        title: 'GPU Picker',
        description: 'Hardware selection for deployment',
        icon: Layers,
      },
      {
        href: '/gpu/tools/roofline-model-analyzer',
        title: 'Roofline Analyzer',
        description: 'Identify memory vs compute bottlenecks',
        icon: Gauge,
      },
    ],
  },
  {
    href: '/ai-inference',
    label: 'AI Inference',
    items: [
      {
        href: '/ai-inference',
        title: 'Inference Overview',
        description: 'Providers, workflow, and deployment options',
        icon: Cloud,
      },
      {
        href: '/ai-inference/tutorial',
        title: 'Inference Tutorial',
        description: 'Chapter-based practical learning path',
        icon: BookOpen,
      },
      {
        href: '/guides/deploy-small-rag-app',
        title: 'Deploy Small RAG',
        description: 'Ship a compact RAG system end-to-end',
        icon: Layers,
      },
      {
        href: '/guides/quantization-4bit-8bit-fp16',
        title: 'Precision Strategy',
        description: '4-bit, 8-bit, and FP16 deployment tradeoffs',
        icon: Box,
      },
    ],
  },
];

const NAV_ITEMS = [
  { href: '/', label: 'Home' },
  { href: '/guides', label: 'Guides' },
  { href: '/ai-updates', label: 'AI Updates' },
  { href: '/about', label: 'About Us' },
];

const DUMMY_SUB_ITEMS = [
  {
    href: '#',
    title: 'Coming Soon',
    description: 'This section will be updated with real content shortly',
    icon: Box,
  },
  {
    href: '#',
    title: 'Draft Module',
    description: 'Placeholder card while final data is being prepared',
    icon: Layers,
  },
  {
    href: '#',
    title: 'Sample Entry',
    description: 'Temporary link for navigation layout testing',
    icon: BookOpen,
  },
  {
    href: '#',
    title: 'Planned Resource',
    description: 'You can replace this item with production data later',
    icon: Cpu,
  },
];

function getMenuItems(items = []) {
  const safeItems = Array.isArray(items) ? items.filter(Boolean) : [];
  if (safeItems.length >= 4) return safeItems.slice(0, 4);

  const merged = [...safeItems];
  for (let i = 0; merged.length < 4; i += 1) {
    merged.push(DUMMY_SUB_ITEMS[i % DUMMY_SUB_ITEMS.length]);
  }
  return merged;
}

const Header = () => {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openDesktopMenu, setOpenDesktopMenu] = useState(null);
  const closeTimerRef = useRef(null);

  const isActive = (path) => {
    if (path === '/' && pathname === '/') return true;
    if (path !== '/' && pathname?.startsWith(path)) return true;
    return false;
  };

  useEffect(() => {
    const updateSlider = (target) => {
      if (target && target.type === 'range') {
        const min = parseFloat(target.min || 0);
        const max = parseFloat(target.max || 100);
        const val = parseFloat(target.value);
        const p = ((val - min) / (max - min)) * 100;
        target.style.setProperty('--range-progress', `${p}%`);
      }
    };

    const handleInput = (e) => updateSlider(e.target);
    
    // Capture manual dragging
    document.addEventListener('input', handleInput);
    
    // Initialize current sliders
    const applyToAll = () => {
      document.querySelectorAll('input[type="range"]').forEach(updateSlider);
    };
    
    applyToAll();
    // Catch late-rendered elements after routing
    const timeout = setTimeout(applyToAll, 300);

    return () => {
      document.removeEventListener('input', handleInput);
      clearTimeout(timeout);
    };
  }, [pathname]);

  const openMenu = (href) => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    setOpenDesktopMenu(href);
  };

  const scheduleCloseMenu = () => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    closeTimerRef.current = setTimeout(() => {
      setOpenDesktopMenu(null);
      closeTimerRef.current = null;
    }, 180);
  };

  const cancelCloseMenu = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  return (
    <header className="sticky top-0 z-[200] border-b border-[var(--border-soft)] bg-white">
      <div className="shell-container flex min-h-[72px] items-center justify-between gap-4 py-3 md:min-h-[78px]">
        <div className="flex min-w-0 items-center gap-4 lg:gap-12">
          <Link href="/" prefetch={false} className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center sm:h-12 sm:w-12">
              <Image
                src="/images/innoai logo main.png"
                alt="InnoAI logo"
                width={48}
                height={48}
                unoptimized
                className="h-full w-full object-contain object-center"
                priority
              />
            </div>
            <span className="min-w-0 text-[0.98rem] font-extrabold leading-tight tracking-tight text-[var(--text-strong)] sm:text-[1.08rem] md:text-[1.15rem]">
              <span className="block truncate">InnoAI</span>
              <span className="block text-[0.78rem] font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)] sm:text-[0.8rem]">
                AI Explorer
              </span>
            </span>
          </Link>

          <div className="hidden h-full items-center lg:flex">
            <nav className="flex h-full items-center gap-8 text-[15px] font-medium text-[var(--text-muted)]">
              <Link
                href="/"
                prefetch={false}
                className={`flex h-full items-center border-b-[3px] pt-[3px] transition-colors ${
                  isActive('/')
                    ? 'border-[var(--text-strong)] text-[var(--text-strong)]'
                    : 'border-transparent hover:text-[var(--text-strong)]'
                }`}
              >
                Home
              </Link>
              {PRIMARY_NAV_ITEMS.map((item) => {
                const dropdownOpen = openDesktopMenu === item.href;
                return (
                  <div
                    key={item.href}
                    className="relative"
                    onMouseEnter={() => openMenu(item.href)}
                    onMouseLeave={scheduleCloseMenu}
                  >
                    <Link
                      href={item.href}
                      prefetch={false}
                      onFocus={() => openMenu(item.href)}
                      onBlur={scheduleCloseMenu}
                      className={`flex h-full items-center gap-1.5 border-b-[3px] pt-[3px] transition-colors ${
                        isActive(item.href)
                          ? 'border-[var(--text-strong)] text-[var(--text-strong)]'
                          : 'border-transparent hover:text-[var(--text-strong)]'
                      }`}
                    >
                      {item.label}
                      <ChevronDown className={`h-3.5 w-3.5 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                    </Link>

                    {dropdownOpen && (
                      <div
                        className="absolute left-0 top-full z-[260] w-[420px] pt-2"
                        onMouseEnter={cancelCloseMenu}
                        onMouseLeave={scheduleCloseMenu}
                      >
                        <div className="rounded-2xl border border-[var(--border-soft)] bg-white p-3 shadow-[0_18px_48px_rgba(24,39,75,0.16)]">
                          <div className="space-y-1.5">
                          {getMenuItems(item.items).map((subItem, index) => {
                            const Icon = subItem.icon;
                            return (
                              <Link
                                key={`${subItem.href}-${index}`}
                                href={subItem.href}
                                prefetch={false}
                                className="group flex items-start gap-3 rounded-xl px-3 py-3 transition-colors hover:bg-[var(--panel-muted)]"
                              >
                                <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#bceaf2] text-[#123f4c]">
                                  <Icon className="h-4.5 w-4.5" />
                                </span>
                                <span className="min-w-0">
                                  <span className="flex items-center gap-2 text-[1.06rem] font-bold leading-tight text-[var(--text-strong)]">
                                    {subItem.title}
                                    <ArrowRight className="h-3.5 w-3.5 text-[var(--text-faint)] opacity-0 transition-opacity group-hover:opacity-100" />
                                  </span>
                                  <span className="mt-0.5 block text-[0.96rem] leading-6 text-[var(--text-muted)]">
                                    {subItem.description}
                                  </span>
                                </span>
                              </Link>
                            );
                          })}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

            </nav>
          </div>
        </div>

        <div className="flex items-center gap-3 text-[var(--text-muted)]">
          <button
            type="button"
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen((open) => !open)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border-soft)] bg-white text-[var(--text-main)] transition-colors hover:text-[var(--text-strong)] lg:hidden"
          >
            {mobileMenuOpen ? <X className="h-[18px] w-[18px]" /> : <Menu className="h-[18px] w-[18px]" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="border-t border-[var(--border-soft)] bg-[rgba(251,253,255,0.96)] lg:hidden">
          <div className="shell-container py-4">
            <nav className="grid gap-2">
              {[...PRIMARY_NAV_ITEMS, ...NAV_ITEMS].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  prefetch={false}
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
    </header>
  );
};

export default Header;

