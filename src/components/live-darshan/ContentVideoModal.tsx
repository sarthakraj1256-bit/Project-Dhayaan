import { motion, AnimatePresence } from 'framer-motion';
import { X, Share2, Heart, ExternalLink, Clock, User } from 'lucide-react';
import { useState } from 'react';
import { SpiritualContent } from '@/data/templeStreams';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { toast } from 'sonner';

interface ContentVideoModalProps {
  content: SpiritualContent;
  onClose: () => void;
}

const typeLabels: Record<SpiritualContent['type'], string> = {
  bhajan: '🎵 Bhajan',
  discourse: '📖 Discourse',
  aarti: '🪔 Aarati',
  meditation: '🧘 Meditation',
  short: '📱 Short',
  mantra: '🕉️ Mantra',
  pravachan: '🎙️ Pravachan'
};

const ContentVideoModal = ({ content, onClose }: ContentVideoModalProps) => {
  const [isLiked, setIsLiked] = useState(false);

  const handleShare = async () => {
    try {
      await navigator.share({
        title: content.title,
        text: `Watch ${content.title} on Dhyaan`,
        url: window.location.href
      });
    } catch {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    toast.success(isLiked ? 'Removed from favorites' : 'Added to favorites');
  };

  const youtubeEmbedUrl = `https://www.youtube.com/embed/${content.youtubeVideoId}?autoplay=1&rel=0&modestbranding=1`;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-background/95 backdrop-blur-xl p-4 md:p-8 flex items-start md:items-center justify-center overflow-y-auto"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="w-full max-w-4xl my-4"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex-1 min-w-0">
              <h2 className="font-display text-lg md:text-2xl text-foreground leading-snug break-words">
                {content.title}
              </h2>
              <Badge variant="secondary" className="mt-1.5 text-xs">{typeLabels[content.type]}</Badge>
            </div>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="shrink-0 hover:bg-destructive/20"
            >
              <X className="w-6 h-6" />
            </Button>
          </div>

          {/* Video – strict 16:9 */}
          <div className="rounded-xl overflow-hidden border border-border/50 shadow-2xl">
            <AspectRatio ratio={16 / 9}>
              <iframe
                src={youtubeEmbedUrl}
                title={content.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            </AspectRatio>
          </div>

          {/* Info & Actions */}
          <div className="mt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              {content.duration && (
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{content.duration}</span>
                </div>
              )}
              {content.speaker && (
                <div className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  <span>{content.speaker}</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={handleLike} className={isLiked ? 'text-red-500' : ''}>
                <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
              </Button>
              <Button variant="ghost" size="icon" onClick={handleShare}>
                <Share2 className="w-5 h-5" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(`https://www.youtube.com/watch?v=${content.youtubeVideoId}`, '_blank')}
                className="gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                YouTube
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ContentVideoModal;
