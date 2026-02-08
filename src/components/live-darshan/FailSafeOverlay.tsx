import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FailSafeOverlayProps {
  show: boolean;
  templeName: string;
  thumbnailUrl?: string;
  onRetry: () => void;
}

// Temple bell/ambience audio for fail-safe mode
const AMBIENT_AUDIO_URL = 'https://www.soundjay.com/misc/bell-ringing-04.mp3';

const FailSafeOverlay = ({ 
  show, 
  templeName, 
  thumbnailUrl,
  onRetry 
}: FailSafeOverlayProps) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [audioMuted, setAudioMuted] = useState(true);

  useEffect(() => {
    if (show && !audioRef.current) {
      // Create ambient audio element
      audioRef.current = new Audio(AMBIENT_AUDIO_URL);
      audioRef.current.loop = true;
      audioRef.current.volume = 0.3;
      audioRef.current.muted = true;
    }

    if (show && audioRef.current) {
      audioRef.current.play().then(() => {
        setIsAudioPlaying(true);
      }).catch(() => {
        // Autoplay blocked, user needs to interact
        setIsAudioPlaying(false);
      });
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
        setIsAudioPlaying(false);
      }
    };
  }, [show]);

  const toggleAudio = () => {
    if (audioRef.current) {
      audioRef.current.muted = !audioRef.current.muted;
      setAudioMuted(!audioMuted);
      
      if (!isAudioPlaying) {
        audioRef.current.play().then(() => setIsAudioPlaying(true)).catch(() => {});
      }
    }
  };

  if (!show) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-10 flex items-center justify-center"
    >
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ 
          backgroundImage: thumbnailUrl 
            ? `url(${thumbnailUrl})` 
            : 'linear-gradient(135deg, hsl(var(--primary)/0.2), hsl(var(--background)))'
        }}
      >
        <div className="absolute inset-0 bg-background/70 backdrop-blur-sm" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center space-y-6 p-8">
        {/* Om Symbol with Glow */}
        <motion.div
          animate={{ 
            scale: [1, 1.05, 1],
            opacity: [0.8, 1, 0.8]
          }}
          transition={{ 
            duration: 3, 
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="text-7xl text-primary drop-shadow-[0_0_20px_hsl(var(--primary)/0.5)]"
        >
          🕉️
        </motion.div>

        {/* Message */}
        <div className="space-y-2">
          <h3 className="text-xl font-display text-foreground">
            Darshan will resume shortly 🙏
          </h3>
          <p className="text-muted-foreground text-sm max-w-xs mx-auto">
            {templeName} stream is temporarily unavailable. Please wait while we reconnect.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            className="gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Retry Connection
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleAudio}
            className="bg-background/50"
            title={audioMuted ? 'Unmute ambient audio' : 'Mute ambient audio'}
          >
            {audioMuted ? (
              <VolumeX className="w-4 h-4" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </Button>
        </div>

        {/* Pulsating indicator */}
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <motion.span
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-2 h-2 rounded-full bg-primary"
          />
          Checking connection...
        </div>
      </div>
    </motion.div>
  );
};

export default FailSafeOverlay;
