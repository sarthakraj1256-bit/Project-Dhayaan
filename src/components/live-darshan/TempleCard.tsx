import { motion } from 'framer-motion';
import { Play, Users, Radio, MapPin, Clock } from 'lucide-react';
import { Temple, deityLabels } from '@/data/templeStreams';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import TempleSchedule from './TempleSchedule';

interface TempleCardProps {
  temple: Temple;
  onSelect: (temple: Temple) => void;
  isSelected?: boolean;
}

const TempleCard = ({ temple, onSelect, isSelected }: TempleCardProps) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card
        className={`cursor-pointer overflow-hidden glass-card border-2 transition-all duration-300 ${
          isSelected 
            ? 'border-primary shadow-[0_0_30px_hsl(var(--gold)/0.4)]' 
            : 'border-border/50 hover:border-primary/50'
        }`}
        onClick={() => onSelect(temple)}
      >
        <div className="relative">
          <AspectRatio ratio={16 / 9}>
            <img
              src={temple.thumbnail}
              alt={temple.name}
              className="w-full h-full object-cover"
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
            
            {/* Live Badge */}
            {temple.isLive && (
              <div className="absolute top-3 left-3">
                <Badge className="bg-red-600 text-white border-0 gap-1 animate-pulse">
                  <Radio className="w-3 h-3" />
                  LIVE
                </Badge>
              </div>
            )}
            
            {/* Featured Badge */}
            {temple.isFeatured && (
              <div className="absolute top-3 right-3">
                <Badge className="bg-primary text-primary-foreground border-0">
                  ⭐ Featured
                </Badge>
              </div>
            )}
            
            {/* Play Button Overlay */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
              <motion.div
                whileHover={{ scale: 1.1 }}
                className="w-16 h-16 rounded-full bg-primary/90 flex items-center justify-center shadow-lg"
              >
                <Play className="w-8 h-8 text-primary-foreground ml-1" />
              </motion.div>
            </div>
            
            {/* Viewer Count */}
            {temple.viewerCount && (
              <div className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-background/80 backdrop-blur-sm px-2 py-1 rounded-full text-xs">
                <Users className="w-3 h-3 text-primary" />
                <span className="text-foreground">{temple.viewerCount.toLocaleString()}</span>
              </div>
            )}
          </AspectRatio>
        </div>
        
        <CardContent className="p-4 space-y-3">
          {/* Temple Name */}
          <h3 className="font-display text-lg text-foreground font-semibold line-clamp-1">
            {temple.name}
          </h3>
          
          {/* Location */}
          <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
            <MapPin className="w-3.5 h-3.5" />
            <span className="line-clamp-1">{temple.location}</span>
          </div>
          
          {/* Deity Badge */}
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {deityLabels[temple.deity]}
            </Badge>
          </div>
          
          {/* Description */}
          <p className="text-sm text-muted-foreground line-clamp-2">
            {temple.description}
          </p>
          
          {/* Aarti Schedule Preview */}
          {temple.aartiSchedule && temple.aartiSchedule.length > 0 && (
            <div className="pt-2 border-t border-border/30">
              <TempleSchedule schedule={temple.aartiSchedule} compact />
            </div>
          )}

          {/* Live Features */}
          <div className="flex flex-wrap gap-1">
            {temple.liveFeatures.slice(0, 2).map((feature, index) => (
              <span
                key={index}
                className="text-xs px-2 py-0.5 bg-muted rounded-full text-muted-foreground"
              >
                {feature}
              </span>
            ))}
            {temple.liveFeatures.length > 2 && (
              <span className="text-xs px-2 py-0.5 bg-muted rounded-full text-muted-foreground">
                +{temple.liveFeatures.length - 2} more
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default TempleCard;
