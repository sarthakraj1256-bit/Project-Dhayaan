import { ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface OpenInYouTubeButtonProps {
  videoId: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

/**
 * Opens YouTube video in a new tab to avoid ERR_BLOCKED_BY_RESPONSE errors
 * that occur when trying to navigate within an iframe context.
 */
const OpenInYouTubeButton = ({ 
  videoId, 
  variant = 'outline',
  size = 'sm',
  className = ''
}: OpenInYouTubeButtonProps) => {
  const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`;

  return (
    <Button
      variant={variant}
      size={size}
      className={`gap-2 ${className}`}
      asChild
    >
      <a 
        href={youtubeUrl}
        target="_blank"
        rel="noopener noreferrer"
      >
        <ExternalLink className="w-4 h-4" />
        Open in YouTube
      </a>
    </Button>
  );
};

export default OpenInYouTubeButton;
