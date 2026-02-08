import { memo } from 'react';
import { Users, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ViewerCountBadgeProps {
  viewerCount: number | null;
  isLive: boolean;
  isLoading: boolean;
  className?: string;
}

const ViewerCountBadge = memo(({
  viewerCount,
  isLive,
  isLoading,
  className = '',
}: ViewerCountBadgeProps) => {
  // Only show for live streams with viewer data
  if (!isLive && viewerCount === null) {
    return null;
  }

  const formatViewerCount = (count: number): string => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toLocaleString();
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className={`flex items-center gap-1.5 text-sm bg-background/70 backdrop-blur-sm px-3 py-1.5 rounded-full border border-border/50 ${className}`}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
        ) : (
          <Users className="w-4 h-4 text-primary" />
        )}
        
        <span className="text-foreground/90 font-medium">
          {isLoading ? (
            'Loading...'
          ) : viewerCount !== null ? (
            <>
              <motion.span
                key={viewerCount}
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-block"
              >
                {formatViewerCount(viewerCount)}
              </motion.span>
              <span className="text-muted-foreground ml-1">
                {viewerCount === 1 ? 'devotee' : 'devotees'}
              </span>
            </>
          ) : isLive ? (
            <span className="text-muted-foreground">Live</span>
          ) : null}
        </span>
      </motion.div>
    </AnimatePresence>
  );
});

ViewerCountBadge.displayName = 'ViewerCountBadge';

export default ViewerCountBadge;
