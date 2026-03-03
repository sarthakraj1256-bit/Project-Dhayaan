import { ChevronLeft } from 'lucide-react';
import { useSmartBack } from '@/hooks/useSmartBack';
import { cn } from '@/lib/utils';

interface BackButtonProps {
  /** Optional confirmation before navigating (for active sessions). */
  onBeforeBack?: () => Promise<boolean> | boolean;
  className?: string;
}

export default function BackButton({ onBeforeBack, className }: BackButtonProps) {
  const { goBack, showBack } = useSmartBack();

  if (!showBack) return null;

  const handleClick = async () => {
    if (onBeforeBack) {
      const allowed = await onBeforeBack();
      if (!allowed) return;
    }
    goBack();
  };

  return (
    <button
      onClick={handleClick}
      aria-label="Go back"
      className={cn(
        'inline-flex items-center justify-center',
        'min-w-[44px] min-h-[44px] rounded-full',
        'text-foreground/70 hover:text-foreground',
        'hover:bg-muted/60 active:bg-muted',
        'transition-colors duration-200',
        className,
      )}
    >
      <ChevronLeft className="w-6 h-6" />
    </button>
  );
}
