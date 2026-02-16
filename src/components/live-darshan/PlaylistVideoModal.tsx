import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AspectRatio } from '@/components/ui/aspect-ratio';

interface PlaylistVideoModalProps {
  title: string;
  playlistId: string;
  onClose: () => void;
}

const PlaylistVideoModal = ({ title, playlistId, onClose }: PlaylistVideoModalProps) => {
  const embedUrl = `https://www.youtube.com/embed/videoseries?list=${playlistId}&autoplay=1&rel=0&modestbranding=1`;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-background/95 backdrop-blur-xl p-4 md:p-8 flex items-center justify-center"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="w-full max-w-4xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl md:text-2xl text-foreground line-clamp-1">{title}</h2>
            <Button variant="ghost" size="icon" onClick={onClose} className="hover:bg-destructive/20">
              <X className="w-6 h-6" />
            </Button>
          </div>

          <div className="rounded-xl overflow-hidden border border-border/50 shadow-2xl">
            <AspectRatio ratio={16 / 9}>
              <iframe
                src={embedUrl}
                title={title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            </AspectRatio>
          </div>

          <div className="mt-4 flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(`https://www.youtube.com/playlist?list=${playlistId}`, '_blank', 'noopener,noreferrer')}
              className="gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              Open on YouTube
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PlaylistVideoModal;
