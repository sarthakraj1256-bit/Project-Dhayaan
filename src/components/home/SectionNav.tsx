import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

const sections = [
  { id: 'hero', label: 'Home' },
  { id: 'explore', label: 'Explore' },
  { id: 'relaxation', label: 'Relax' },
  { id: 'darshan', label: 'Darshan' },
  { id: 'highlights', label: 'Highlights' },
];

export default function SectionNav() {
  const [active, setActive] = useState('hero');
  const [visible, setVisible] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);
  const pillRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  useEffect(() => {
    const handleScroll = () => {
      // Show nav after scrolling past hero
      setVisible(window.scrollY > 120);

      // Find current section
      let current = 'hero';
      for (const section of sections) {
        const el = document.getElementById(section.id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 100) current = section.id;
        }
      }
      setActive(current);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Scroll active pill into view
  useEffect(() => {
    const btn = pillRefs.current[active];
    if (btn && navRef.current) {
      btn.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
  }, [active]);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div
      className={cn(
        'fixed top-0 left-0 right-0 z-40 transition-all duration-300',
        visible
          ? 'translate-y-0 opacity-100'
          : '-translate-y-full opacity-0 pointer-events-none'
      )}
    >
      <div className="bg-[hsl(216,55%,14%)]/80 backdrop-blur-xl border-b border-white/[0.08]">
        <div
          ref={navRef}
          className="flex items-center gap-1.5 px-4 py-2.5 overflow-x-auto scrollbar-hide"
        >
          {sections.map((section) => (
            <button
              key={section.id}
              ref={(el) => { pillRefs.current[section.id] = el; }}
              onClick={() => scrollTo(section.id)}
              className={cn(
                'shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 whitespace-nowrap',
                active === section.id
                  ? 'bg-white/[0.15] text-white shadow-[0_0_12px_rgba(255,255,255,0.08)]'
                  : 'text-white/40 hover:text-white/60 hover:bg-white/[0.06]'
              )}
            >
              {section.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
