"use client";

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useContext, useEffect, useRef, useState } from 'react';
import { Bookmark, ChevronDown, Menu, UserRound, X } from 'lucide-react';
import { AppContext } from '../providers/AppContext';

const groups = [
  { name: 'Model tools', links: [
    ['Compare models', '/compare'], ['Model recommender', '/recommender'],
    ['Validation lab', '/validation-lab'], ['Coding model analysis', '/coding-model-analysis'],
  ] },
  { name: 'GPU tools', links: [
    ['GPU hub', '/gpu'], ['Can I run it?', '/can-i-run'], ['GPU picker', '/gpu/tools/gpu-picker'],
    ['VRAM calculator', '/gpu/tools/vram-calculator'], ['Fine-tuning calculator', '/gpu/tools/fine-tuning-calculator'],
    ['Cost calculator', '/gpu/tools/cost-calculator'], ['Roofline analyzer', '/gpu/tools/roofline-model-analyzer'],
    ['Kernel occupancy', '/gpu/tools/kernel-occupancy-estimator'], ['Warp divergence', '/gpu/tools/warp-divergence'],
  ] },
  { name: 'Library', links: [
    ['Deployment guides', '/guides'], ['AI tutorials', '/ai-tutorials'], ['Inference overview', '/ai-inference'],
    ['Inference tutorial', '/ai-inference/tutorial'], ['RAG tutorial', '/ai-tutorials/rag'], ['AI updates', '/ai-updates'],
  ] },
];

export default function Header() {
  const pathname = usePathname();
  const { auth } = useContext(AppContext);
  const [openGroup, setOpenGroup] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const header = useRef(null);
  const mobileToggle = useRef(null);

  function close() {
    setOpenGroup('');
    setMobileOpen(false);
  }

  useEffect(() => {
    const outside = event => { if (!header.current?.contains(event.target)) close(); };
    const escape = event => {
      if (event.key !== 'Escape') return;
      if (openGroup) {
        header.current?.querySelector('[aria-controls="nav-' + groups.findIndex(group => group.name === openGroup) + '"]')?.focus();
        setOpenGroup('');
      } else if (mobileOpen) { close(); mobileToggle.current?.focus(); }
    };
    document.addEventListener('pointerdown', outside);
    document.addEventListener('keydown', escape);
    return () => {
      document.removeEventListener('pointerdown', outside);
      document.removeEventListener('keydown', escape);
    };
  }, [mobileOpen, openGroup]);

  useEffect(() => {
    function update(slider) {
      if (slider.type !== 'range') return;
      const min = Number(slider.min || 0), max = Number(slider.max || 100);
      slider.style.setProperty('--range-progress', ((slider.value - min) / (max - min)) * 100 + '%');
    }
    const handleInput = event => update(event.target);
    const init = () => document.querySelectorAll('input[type="range"]').forEach(update);
    init();
    const timeout = setTimeout(init, 300);
    document.addEventListener('input', handleInput);
    return () => { clearTimeout(timeout); document.removeEventListener('input', handleInput); };
  }, [pathname]);

  return <header className="masthead" ref={header} onBlur={event => {
    if (event.relatedTarget && !event.currentTarget.contains(event.relatedTarget)) close();
  }}>
    <div className="shell-container masthead-inner">
      <Link href="/" onClick={close} className="wordmark" aria-label="InnoAI home">
        <Image src="/images/innoai-logo-96.png" alt="" width={32} height={32} />InnoAI
      </Link>
      <nav id="main-navigation" className={'studio-nav' + (mobileOpen ? ' is-open' : '')} aria-label="Main navigation">
        <Link href="/" onClick={close} aria-current={pathname === '/' ? 'page' : undefined}>Explorer</Link>
        {groups.map(({ name, links }, index) => <div className="nav-group" key={name}>
          <button aria-controls={'nav-' + index} aria-expanded={openGroup === name} onClick={() => setOpenGroup(openGroup === name ? '' : name)}
            className={links.some(([, href]) => pathname === href || pathname.startsWith(href + '/')) ? 'in-section' : ''}>
            {name}<ChevronDown size={14} />
          </button>
          <div id={'nav-' + index} className="nav-popover" hidden={openGroup !== name}>
            {links.map(([label, href]) => <Link key={href} href={href} prefetch={false} onClick={close} aria-current={pathname === href ? 'page' : undefined}>{label}</Link>)}
          </div>
        </div>)}
      </nav>
      <div className="masthead-actions">
        <Link href="/favorites" aria-label="Saved models" title="Saved models"><Bookmark size={18} /><span>Saved</span></Link>
        <Link className="account-link" href={auth?.user ? '/profile' : '/login'}><UserRound size={15}/>{auth?.user ? 'Profile' : 'Sign in'}</Link>
        <button className="menu-toggle" ref={mobileToggle} aria-controls="main-navigation" aria-expanded={mobileOpen} aria-label={mobileOpen ? 'Close navigation' : 'Open navigation'} onClick={() => mobileOpen ? close() : setMobileOpen(true)}>
          {mobileOpen ? <X size={21}/> : <Menu size={21}/>}
        </button>
      </div>
    </div>
  </header>;
}
