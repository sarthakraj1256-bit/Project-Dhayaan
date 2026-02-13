import { forwardRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Radio, BookOpen, Sparkles, Play, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { triggerHaptic } from '@/hooks/useHapticFeedback';

interface NavItem {
  path: string;
  label: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/sonic-lab', label: 'Sonic', icon: Radio },
  { path: '/live-darshan', label: 'Darshan', icon: Play },
  { path: '/lakshya', label: 'Lakshya', icon: Sparkles },
  { path: '/profile', label: 'Profile', icon: User },
];

const BottomNav = forwardRef<HTMLElement>((_, ref) => {
  const location = useLocation();

  const handleNavClick = (path: string) => {
    if (location.pathname !== path) {
      triggerHaptic('selection');
    }
  };

  return (
    <nav ref={ref} className="fixed bottom-0 left-0 right-0 z-50 md:hidden safe-bottom">
      <div
        className="mx-0 overflow-hidden touch-manipulation border-t border-border/30"
        style={{
          background: '#0B1D3A',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
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
                {/* Active indicator dot */}
                {isActive && (
                  <motion.div
                    layoutId="bottomNavDot"
                    className="absolute -top-0.5 w-1 h-1 rounded-full" style={{ background: '#34D9A8' }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}

                 <Icon
                   className={cn(
                     'w-5 h-5 transition-colors duration-150',
                     isActive ? 'text-white' : 'text-white/35'
                   )}
                />

                <span
                  className={cn(
                     'text-[10px] mt-0.5 font-medium transition-colors duration-150',
                     isActive ? 'text-white' : 'text-white/35'
                  )}
                >
                  {item.label}
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
