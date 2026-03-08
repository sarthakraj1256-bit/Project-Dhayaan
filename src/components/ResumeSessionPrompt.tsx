import { motion, AnimatePresence } from 'framer-motion';
import { Play, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ROUTE_LABELS: Record<string, string> = {
  '/sonic-lab': 'Sonic Lab',
  '/lakshya': 'Lakshya',
};

interface Props {
  open: boolean;
  routePath: string;
  onResume: () => void;
  onDecline: () => void;
}

export const ResumeSessionPrompt = ({ open, routePath, onResume, onDecline }: Props) => {
  const label = ROUTE_LABELS[routePath] || 'your session';

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm px-6"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 24 }}
            transition={{ type: 'spring', damping: 22, stiffness: 260 }}
            className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-xl"
          >
            {/* Icon */}
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <Play className="h-6 w-6 text-primary" />
            </div>

            {/* Copy */}
            <h2 className="text-center font-display text-lg text-foreground">
              Resume session?
            </h2>
            <p className="mt-2 text-center text-sm text-muted-foreground leading-relaxed">
              You were in <span className="font-medium text-foreground">{label}</span> last time.
              Would you like to continue where you left off?
            </p>

            {/* Buttons */}
            <div className="mt-6 flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={onDecline}
              >
                <X className="mr-1.5 h-4 w-4" />
                Start fresh
              </Button>
              <Button
                className="flex-1"
                onClick={onResume}
              >
                <Play className="mr-1.5 h-4 w-4" />
                Resume
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
