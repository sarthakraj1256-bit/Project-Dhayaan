import { forwardRef, ButtonHTMLAttributes } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useHapticFeedback, HapticType } from '@/hooks/useHapticFeedback';

interface HapticButtonProps extends Omit<HTMLMotionProps<"button">, 'ref'> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'gold' | 'outline';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  hapticType?: HapticType;
  hapticEnabled?: boolean;
  fullWidth?: boolean;
  children: React.ReactNode;
}

const HapticButton = forwardRef<HTMLButtonElement, HapticButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      hapticType = 'button',
      hapticEnabled = true,
      fullWidth = false,
      children,
      onClick,
      ...props
    },
    ref
  ) => {
    const { trigger, isEnabled } = useHapticFeedback({ enabled: hapticEnabled });

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (isEnabled) {
        trigger(hapticType);
      }
      onClick?.(e);
    };

    const baseStyles = cn(
      // Touch-friendly minimum size (44x44 per Apple HIG)
      'min-h-[44px] min-w-[44px]',
      // Touch manipulation
      'touch-manipulation select-none',
      // Flex centering
      'inline-flex items-center justify-center gap-2',
      // Transitions
      'transition-all duration-200 ease-out',
      // Font
      'font-body tracking-wide',
      // Focus styles
      'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background',
      // Disabled state
      'disabled:opacity-50 disabled:pointer-events-none',
      // Full width option
      fullWidth && 'w-full',
    );

    const variantStyles = {
      primary: cn(
        'bg-primary text-primary-foreground',
        'hover:bg-primary/90',
        'active:bg-primary/80',
      ),
      secondary: cn(
        'bg-secondary text-secondary-foreground',
        'hover:bg-secondary/80',
        'active:bg-secondary/70',
      ),
      ghost: cn(
        'bg-transparent text-foreground',
        'hover:bg-muted',
        'active:bg-muted/80',
      ),
      gold: cn(
        'bg-gradient-to-r from-gold to-gold-light text-void',
        'hover:opacity-90',
        'active:opacity-80',
        'shadow-[0_0_20px_hsl(var(--gold)/0.3)]',
      ),
      outline: cn(
        'bg-transparent text-foreground',
        'border border-gold/30',
        'hover:border-gold/60 hover:bg-gold/5',
        'active:bg-gold/10',
      ),
    };

    const sizeStyles = {
      sm: 'px-3 py-2 text-sm rounded-lg',
      md: 'px-4 py-3 text-base rounded-xl',
      lg: 'px-6 py-4 text-lg rounded-2xl',
      icon: 'p-3 rounded-xl',
    };

    return (
      <motion.button
        ref={ref}
        className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
        onClick={handleClick}
        whileTap={{ scale: 0.97 }}
        whileHover={{ scale: 1.02 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        {...props}
      >
        {children}
      </motion.button>
    );
  }
);

HapticButton.displayName = 'HapticButton';

export default HapticButton;
