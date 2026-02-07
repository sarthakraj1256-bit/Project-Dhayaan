import { forwardRef } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';

interface TouchFriendlyCardProps extends Omit<HTMLMotionProps<"div">, 'ref'> {
  variant?: 'default' | 'glass' | 'elevated';
  interactive?: boolean;
  children: React.ReactNode;
}

const TouchFriendlyCard = forwardRef<HTMLDivElement, TouchFriendlyCardProps>(
  ({ className, variant = 'default', interactive = false, children, ...props }, ref) => {
    const baseStyles = cn(
      // Touch-friendly padding
      'p-4 sm:p-5 md:p-6',
      // Rounded corners
      'rounded-xl sm:rounded-2xl',
      // Touch manipulation
      'touch-manipulation',
      // Transition
      'transition-all duration-200',
    );

    const variantStyles = {
      default: cn(
        'bg-card text-card-foreground',
        'border border-border',
      ),
      glass: cn(
        'bg-void-light/60 backdrop-blur-xl',
        'border border-gold/20',
        'shadow-[0_0_30px_hsl(var(--gold)/0.1)]',
      ),
      elevated: cn(
        'bg-card text-card-foreground',
        'shadow-lg shadow-void/50',
        'border border-gold/10',
      ),
    };

    const interactiveStyles = interactive ? cn(
      'cursor-pointer',
      'hover:border-gold/40 hover:shadow-[0_0_40px_hsl(var(--gold)/0.15)]',
      'active:scale-[0.99]',
    ) : '';

    return (
      <motion.div
        ref={ref}
        className={cn(baseStyles, variantStyles[variant], interactiveStyles, className)}
        whileTap={interactive ? { scale: 0.98 } : undefined}
        whileHover={interactive ? { y: -2 } : undefined}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

TouchFriendlyCard.displayName = 'TouchFriendlyCard';

export default TouchFriendlyCard;
