import { motion } from 'framer-motion';
import { Radio, Film, Music } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { VideoStreamStatus } from '@/hooks/useVideoFallback';

interface VideoStatusBadgeProps {
  streamStatus: VideoStreamStatus;
  templeName: string;
  compact?: boolean;
}

const VideoStatusBadge = ({ streamStatus, templeName, compact = false }: VideoStatusBadgeProps) => {
  const getStatusConfig = () => {
    switch (streamStatus) {
      case 'live':
        return {
          icon: Radio,
          text: 'LIVE',
          label: `Live Aarti from ${templeName}`,
          className: 'bg-destructive text-destructive-foreground',
          animate: true,
        };
      case 'recorded':
        return {
          icon: Film,
          text: 'Recorded',
          label: `Recorded Darshan from ${templeName}`,
          className: 'bg-amber-500 text-white',
          animate: false,
        };
      case 'ambience':
        return {
          icon: Music,
          text: 'Ambience',
          label: 'Darshan will resume shortly 🙏',
          className: 'bg-primary/80 text-primary-foreground',
          animate: false,
        };
      case 'loading':
        return {
          icon: Radio,
          text: 'Loading',
          label: 'Connecting to darshan...',
          className: 'bg-muted text-muted-foreground',
          animate: true,
        };
      default:
        return {
          icon: Radio,
          text: '',
          label: '',
          className: 'bg-muted',
          animate: false,
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  if (streamStatus === 'loading') {
    return (
      <Badge className={`${config.className} border-0 gap-1`}>
        <div className="w-3 h-3 rounded-full bg-current animate-pulse" />
        <span className="text-xs">Connecting...</span>
      </Badge>
    );
  }

  if (compact) {
    return (
      <Badge className={`${config.className} border-0 gap-1`}>
        <Icon className={`w-3 h-3 ${config.animate ? 'animate-pulse' : ''}`} />
        <span className="text-xs">{config.text}</span>
      </Badge>
    );
  }

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="flex items-center gap-2"
    >
      <Badge className={`${config.className} border-0 gap-1.5 px-3 py-1`}>
        <Icon className={`w-3.5 h-3.5 ${config.animate ? 'animate-pulse' : ''}`} />
        <span className="font-medium">{config.text}</span>
      </Badge>
      {!compact && streamStatus === 'recorded' && (
        <span className="text-xs text-muted-foreground hidden md:inline">
          Live stream will resume automatically
        </span>
      )}
    </motion.div>
  );
};

export default VideoStatusBadge;
