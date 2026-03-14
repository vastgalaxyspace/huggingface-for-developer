import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';

const StickyNav = ({ sections }) => {
  const [activeSection, setActiveSection] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  // Track which section is in view
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: '-100px 0px -60% 0px', threshold: 0 }
    );

    sections.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [sections]);

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setIsExpanded(false);
    }
  };

  return (
    <>
      {/* Desktop: Sticky sidebar */}
      <div className="hidden xl:block fixed right-6 top-1/2 -translate-y-1/2 z-40">
        <div className="bg-slate-800/90 backdrop-blur-xl border border-white/10 rounded-xl p-2 shadow-2xl">
          <div className="space-y-1">
            {sections.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => scrollToSection(id)}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                  activeSection === id
                    ? 'bg-purple-500/30 text-white border border-purple-500/40'
                    : 'text-gray-400 hover:bg-white/10 hover:text-white border border-transparent'
                }`}
                title={label}
              >
                {Icon && <Icon className="w-3.5 h-3.5 flex-shrink-0" />}
                <span className="truncate">{label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile: Floating toggle button */}
      <div className="xl:hidden fixed bottom-6 right-6 z-50">
        {isExpanded && (
          <div className="absolute bottom-14 right-0 bg-slate-800/95 backdrop-blur-xl border border-white/10 rounded-xl p-2 shadow-2xl mb-2 min-w-[180px]">
            <div className="space-y-1">
              {sections.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => scrollToSection(id)}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    activeSection === id
                      ? 'bg-purple-500/30 text-white'
                      : 'text-gray-400 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {Icon && <Icon className="w-3.5 h-3.5 flex-shrink-0" />}
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
        
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-12 h-12 bg-purple-500 hover:bg-purple-600 rounded-full shadow-lg shadow-purple-500/30 flex items-center justify-center transition-all"
        >
          {isExpanded ? (
            <X className="w-5 h-5 text-white" />
          ) : (
            <Menu className="w-5 h-5 text-white" />
          )}
        </button>
      </div>
    </>
  );
};

export default StickyNav;
