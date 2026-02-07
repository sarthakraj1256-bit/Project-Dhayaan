import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Radio, BookOpen, Sparkles, Play } from 'lucide-react';
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
  { path: '/mantrochar', label: 'Mantra', icon: BookOpen },
  { path: '/lakshya', label: 'Lakshya', icon: Sparkles },
  { path: '/live-darshan', label: 'Darshan', icon: Play },
];

const BottomNav = () => {
  const location = useLocation();

  const handleNavClick = (path: string) => {
    // Only trigger haptic if navigating to a different page
    if (location.pathname !== path) {
      triggerHaptic('selection');
    }
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden safe-bottom">
      {/* Backdrop blur container */}
      <div 
        className="mx-2 mb-2 rounded-2xl overflow-hidden touch-manipulation"
        style={{
          background: 'hsl(var(--void-light) / 0.85)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid hsl(var(--gold) / 0.2)',
          boxShadow: '0 -4px 30px hsl(var(--void) / 0.5), 0 0 20px hsl(var(--gold) / 0.1)',
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
                className="relative flex flex-col items-center justify-center py-2 px-3 min-w-[60px] min-h-[44px] touch-target tap-transparent select-none"
              >
                {/* Active indicator */}
                {isActive && (
                  <motion.div
                    layoutId="bottomNavIndicator"
                    className="absolute inset-0 rounded-xl"
                    style={{
                      background: 'linear-gradient(135deg, hsl(var(--gold) / 0.2), hsl(var(--gold) / 0.1))',
                      border: '1px solid hsl(var(--gold) / 0.3)',
                    }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}

                {/* Icon */}
                <motion.div
                  whileTap={{ scale: 0.85 }}
                  className="relative z-10"
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                >
                  <Icon
                    className={cn(
                      'w-5 h-5 transition-colors duration-200',
                      isActive ? 'text-primary' : 'text-muted-foreground'
                    )}
                  />
                </motion.div>

                {/* Label */}
                <span
                  className={cn(
                    'relative z-10 text-[10px] mt-1 font-medium tracking-wide transition-colors duration-200',
                    isActive ? 'text-primary' : 'text-muted-foreground'
                  )}
                >
                  {item.label}
                </span>

                {/* Glow effect for active item */}
                {isActive && (
                  <div 
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full pointer-events-none"
                    style={{
                      background: 'radial-gradient(circle, hsl(var(--gold) / 0.3), transparent 70%)',
                    }}
                  />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default BottomNav;
