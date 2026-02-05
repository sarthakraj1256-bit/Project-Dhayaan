import { motion } from 'framer-motion';
import { Heart, Bell, BellOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useTempleFavorites } from '@/hooks/useTempleFavorites';

interface FavoriteButtonProps {
  templeId: string;
  templeName: string;
  size?: 'sm' | 'default';
  showNotificationToggle?: boolean;
}

const FavoriteButton = ({ 
  templeId, 
  templeName, 
  size = 'default',
  showNotificationToggle = false 
}: FavoriteButtonProps) => {
  const { 
    isFavorite, 
    isNotificationsEnabled, 
    toggleFavorite, 
    toggleNotifications 
  } = useTempleFavorites();

  const isFav = isFavorite(templeId);
  const notificationsOn = isNotificationsEnabled(templeId);

  const iconSize = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';
  const buttonSize = size === 'sm' ? 'icon' : 'icon';

  return (
    <div className="flex items-center gap-1">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size={buttonSize}
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(templeId);
            }}
            className={`transition-all ${isFav ? 'text-destructive hover:text-destructive/80' : 'hover:text-destructive'}`}
          >
            <motion.div
              initial={false}
              animate={isFav ? { scale: [1, 1.3, 1] } : { scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Heart className={`${iconSize} ${isFav ? 'fill-current' : ''}`} />
            </motion.div>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {isFav ? `Remove ${templeName} from favorites` : `Add ${templeName} to favorites`}
        </TooltipContent>
      </Tooltip>

      {showNotificationToggle && isFav && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size={buttonSize}
              onClick={(e) => {
                e.stopPropagation();
                toggleNotifications(templeId);
              }}
              className={`transition-all ${notificationsOn ? 'text-primary' : 'text-muted-foreground'}`}
            >
              {notificationsOn ? (
                <Bell className={`${iconSize} fill-current`} />
              ) : (
                <BellOff className={iconSize} />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {notificationsOn ? 'Disable aarti notifications' : 'Enable aarti notifications'}
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  );
};

export default FavoriteButton;
