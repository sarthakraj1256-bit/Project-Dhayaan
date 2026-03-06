import { Sun, Moon, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { triggerHaptic } from '@/hooks/useHapticFeedback';
import LanguageToggle from '@/components/LanguageToggle';

export default function SettingsPage() {
  const { theme, toggleTheme } = useTheme();
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 h-14 flex items-center gap-3 px-4 border-b border-border/40 bg-background/95 backdrop-blur-xl">
        <Link to="/" className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-foreground/[0.06] transition-colors touch-target">
          <ArrowLeft className="w-5 h-5 text-foreground/70" />
        </Link>
        <h1 className="text-lg font-semibold text-foreground">{t('drawer.settings')}</h1>
      </header>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Appearance */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Appearance</h2>
          <div className="flex items-center justify-between p-4 rounded-xl bg-card border border-border/50">
            <div className="flex items-center gap-3">
              {theme === 'light' ? <Sun className="w-5 h-5 text-primary" /> : <Moon className="w-5 h-5 text-primary" />}
              <div>
                <p className="text-sm font-medium text-foreground">{theme === 'light' ? 'Light Mode' : 'Dark Mode'}</p>
                <p className="text-xs text-muted-foreground">Switch app appearance</p>
              </div>
            </div>
            <button
              onClick={() => { triggerHaptic('selection'); toggleTheme(); }}
              className={cn(
                'relative w-[52px] h-7 rounded-full transition-colors duration-300',
                theme === 'dark' ? 'bg-foreground/20' : 'bg-primary'
              )}
            >
              <motion.div
                className="absolute top-[3px] w-[22px] h-[22px] rounded-full bg-white shadow-sm"
                animate={{ left: theme === 'dark' ? 27 : 3 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            </button>
          </div>
        </section>

        {/* Language */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Language</h2>
          <div className="flex items-center justify-between p-4 rounded-xl bg-card border border-border/50">
            <p className="text-sm font-medium text-foreground">App Language</p>
            <LanguageToggle />
          </div>
        </section>
      </div>
    </div>
  );
}
