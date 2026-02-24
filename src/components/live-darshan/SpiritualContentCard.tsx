import { motion } from 'framer-motion';
import { Play, Clock, User } from 'lucide-react';
import { SpiritualContent } from '@/data/templeStreams';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AspectRatio } from '@/components/ui/aspect-ratio';

interface SpiritualContentCardProps {
  content: SpiritualContent;
  onSelect: (content: SpiritualContent) => void;
}

const typeLabels: Record<SpiritualContent['type'], { label: string; color: string }> = {
  bhajan: { label: '🎵 Bhajan', color: 'bg-purple-600' },
  discourse: { label: '📖 Discourse', color: 'bg-blue-600' },
  aarti: { label: '🪔 Aarati', color: 'bg-orange-600' },
  meditation: { label: '🧘 Meditation', color: 'bg-green-600' },
  short: { label: '📱 Short', color: 'bg-pink-600' },
  mantra: { label: '🕉️ Mantra', color: 'bg-amber-600' },
  pravachan: { label: '🎙️ Pravachan', color: 'bg-teal-600' },
};

const SpiritualContentCard = ({ content, onSelect }: SpiritualContentCardProps) => {
  const typeInfo = typeLabels[content.type];
  
  return (
    <motion.div
      whileHover={{ scale: 1.03, y: -2 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card
        tabIndex={0}
        role="button"
        aria-label={`Play ${content.title}`}
        className="cursor-pointer overflow-hidden glass-card border border-border/50 hover:border-primary/50 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background outline-none transition-all duration-300"
        onClick={() => onSelect(content)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onSelect(content);
          }
        }}
      >
        <div className="relative">
          <AspectRatio ratio={16 / 9}>
            <img
              src={content.thumbnail}
              alt={content.title}
              className="w-full h-full object-cover"
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
            
            {/* Type Badge */}
            <div className="absolute top-2 left-2">
              <Badge className={`${typeInfo.color} text-white border-0 text-xs`}>
                {typeInfo.label}
              </Badge>
            </div>
            
            {/* Duration */}
            <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-background/80 backdrop-blur-sm px-2 py-0.5 rounded text-xs">
              <Clock className="w-3 h-3" />
              <span>{content.duration}</span>
            </div>
            
            {/* Play Button Overlay */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
              <motion.div
                whileHover={{ scale: 1.1 }}
                className="w-12 h-12 rounded-full bg-primary/90 flex items-center justify-center shadow-lg"
              >
                <Play className="w-6 h-6 text-primary-foreground ml-0.5" />
              </motion.div>
            </div>
          </AspectRatio>
        </div>
        
        <CardContent className="p-3 space-y-1">
          {/* Title */}
          <h4 className="font-medium text-foreground text-sm line-clamp-2">
            {content.title}
          </h4>
          
          {/* Speaker */}
          {content.speaker && (
            <div className="flex items-center gap-1 text-muted-foreground text-xs">
              <User className="w-3 h-3" />
              <span>{content.speaker}</span>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default SpiritualContentCard;
