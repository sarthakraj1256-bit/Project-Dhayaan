import { memo } from 'react';
import { Heart, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface DevoteesOnlineBadgeProps {
  count: number;
  isConnected: boolean;
  className?: string;
}

const DevoteesOnlineBadge = memo(({
  count,
  isConnected,
  className = '',
}: DevoteesOnlineBadgeProps) => {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className={`flex items-center gap-1.5 text-sm bg-primary/20 backdrop-blur-sm px-3 py-1.5 rounded-full border border-primary/30 ${className}`}
      >
        {!isConnected ? (
          <Loader2 className="w-4 h-4 animate-spin text-primary" />
        ) : (
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <Heart className="w-4 h-4 text-primary fill-primary" />
          </motion.div>
        )}
        
        <span className="text-foreground/90 font-medium">
          {!isConnected ? (
            'Connecting...'
          ) : (
            <>
              <motion.span
                key={count}
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-block"
              >
                {count}
              </motion.span>
              <span className="text-muted-foreground ml-1">
                {count === 1 ? 'devotee' : 'devotees'} here
              </span>
            </>
          )}
        </span>
      </motion.div>
    </AnimatePresence>
  );
});

DevoteesOnlineBadge.displayName = 'DevoteesOnlineBadge';

export default DevoteesOnlineBadge;
