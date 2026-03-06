import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { TranslationKey } from '@/i18n/translations';

const sections = [
  { id: 'hero', labelKey: 'sectionNav.home' as TranslationKey },
  { id: 'explore', labelKey: 'sectionNav.explore' as TranslationKey },
  { id: 'relaxation', labelKey: 'sectionNav.relax' as TranslationKey },
  { id: 'darshan', labelKey: 'sectionNav.darshan' as TranslationKey },
  { id: 'daily-aarti', labelKey: 'sectionNav.aarti' as TranslationKey },
  { id: 'cartoons', labelKey: 'sectionNav.cartoons' as TranslationKey },
  { id: 'highlights', labelKey: 'sectionNav.highlights' as TranslationKey },
  { id: 'philosophy', labelKey: 'sectionNav.philosophy' as TranslationKey },
];

export default function SectionNav() {
  const [active, setActive] = useState('hero');
  const [scrolled, setScrolled] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);
  const pillRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const { t } = useLanguage();

  useEffect(() => {
    const handleScroll = () => {
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

  useEffect(() => {
    const btn = pillRefs.current[active];
    if (btn && navRef.current) {
      btn.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
  }, [active]);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const offset = 52;
      const y = el.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[1000]"
      style={{ backgroundColor: '#E9E2D9' }}
    >
      <div className="border-b border-border/50 shadow-sm">
        <div
          ref={navRef}
          className="flex items-center gap-1.5 px-4 pr-28 sm:pr-36 py-2.5 overflow-x-auto scrollbar-hide"
        >
          {sections.map((section) => (
            <button
              key={section.id}
              ref={(el) => { pillRefs.current[section.id] = el; }}
              onClick={() => scrollTo(section.id)}
              className={cn(
                'shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 whitespace-nowrap',
                active === section.id
                  ? 'bg-primary/15 text-primary shadow-sm'
                  : 'text-foreground/40 hover:text-foreground/60 hover:bg-foreground/[0.04]'
              )}
            >
              {t(section.labelKey)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
