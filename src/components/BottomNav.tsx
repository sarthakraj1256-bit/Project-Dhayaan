import { forwardRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Radio, BookOpen, Sparkles, Play, User, Clapperboard } from 'lucide-react';
import { cn } from '@/lib/utils';
import { triggerHaptic } from '@/hooks/useHapticFeedback';
import { useLanguage } from '@/contexts/LanguageContext';
import { TranslationKey } from '@/i18n/translations';

interface NavItem {
  path: string;
  labelKey: TranslationKey;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  { path: '/', labelKey: 'nav.home', icon: Home },
  { path: '/sonic-lab', labelKey: 'nav.sonic', icon: Radio },
  { path: '/bhakti-shorts', labelKey: 'nav.shorts', icon: Clapperboard },
  { path: '/live-darshan', labelKey: 'nav.darshan', icon: Play },
  { path: '/profile', labelKey: 'nav.profile', icon: User },
];

const BottomNav = forwardRef<HTMLElement>((_, ref) => {
  const location = useLocation();
  const { t } = useLanguage();

  const handleNavClick = (path: string) => {
    if (location.pathname !== path) {
      triggerHaptic('selection');
    }
  };

  return (
    <nav ref={ref} className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      <div
        className="mx-0 overflow-hidden touch-manipulation border-t border-border/50"
        style={{
          background: 'hsl(36, 33%, 97%)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        }}
      >
        <div className="flex items-center justify-around py-2 px-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => handleNavClick(item.path)}
                className="relative flex flex-col items-center justify-center py-1.5 px-3 min-w-[56px] min-h-[44px] touch-target tap-transparent select-none"
              >
                {isActive && (
                  <motion.div
                    layoutId="bottomNavDot"
                    className="absolute -top-0.5 w-1 h-1 rounded-full bg-primary"
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}

                 <Icon
                   className={cn(
                     'w-5 h-5 transition-colors duration-150',
                     isActive ? 'text-primary' : 'text-foreground/30'
                   )}
                />

                <span
                  className={cn(
                     'text-[10px] mt-0.5 font-medium transition-colors duration-150',
                     isActive ? 'text-primary' : 'text-foreground/30'
                  )}
                >
                  {t(item.labelKey)}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
});

BottomNav.displayName = 'BottomNav';

export default BottomNav;
