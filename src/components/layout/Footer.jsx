import Link from 'next/link';

const sections = {
  Workspace: [['Explorer', '/'], ['Compare models', '/compare'], ['Recommender', '/recommender'], ['GPU tools', '/gpu']],
  Library: [['Guides', '/guides'], ['AI tutorials', '/ai-tutorials'], ['AI updates', '/ai-updates']],
  InnoAI: [['About', '/about'], ['Editorial policy', '/editorial-policy'], ['Contact', '/contact']],
};

export default function Footer() {
  return <footer className="studio-footer"><div className="shell-container">
    <div className="footer-columns"><div><Link href="/" className="wordmark">InnoAI</Link><p>Model research and hardware planning.</p></div>
      {Object.entries(sections).map(([title, links]) => <nav aria-label={title + ' footer links'} key={title}><strong>{title}</strong>{links.map(([name, href]) => <Link key={href} prefetch={false} href={href}>{name}</Link>)}</nav>)}
    </div>
    <div className="footer-base"><span>© {new Date().getFullYear()} InnoAI</span><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link></div>
  </div></footer>;
}
