import { forwardRef } from 'react';
import { ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface OpenInYouTubeButtonProps {
  videoId: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

/**
 * Opens YouTube video in a new tab using window.open to avoid 
 * ERR_BLOCKED_BY_RESPONSE errors from YouTube's security policies.
 * This must NEVER open inside an iframe or modal.
 */
const OpenInYouTubeButton = forwardRef<HTMLButtonElement, OpenInYouTubeButtonProps>(({ 
  videoId, 
  variant = 'outline',
  size = 'sm',
  className = ''
}, ref) => {
  const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`;

  const handleOpenInYouTube = () => {
    // Use window.open to ensure it opens in a new tab
    // This prevents YouTube's ERR_BLOCKED_BY_RESPONSE error
    window.open(youtubeUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <Button
      ref={ref}
      variant={variant}
      size={size}
      className={`gap-2 ${className}`}
      onClick={handleOpenInYouTube}
    >
      <ExternalLink className="w-4 h-4" />
      Open in YouTube
    </Button>
  );
});

OpenInYouTubeButton.displayName = 'OpenInYouTubeButton';

export default OpenInYouTubeButton;
