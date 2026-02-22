import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Bell, BellOff, MapPin, Clock, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { temples, Temple, deityLabels } from '@/data/templeStreams';
import { useTempleFavorites } from '@/hooks/useTempleFavorites';
import { useFavoriteAartiNotifications } from '@/hooks/useFavoriteAartiNotifications';
import ShareFavoritesButton from './ShareFavoritesButton';

interface FavoritesPanelProps {
  onSelectTemple: (temple: Temple) => void;
}

const formatTime = (time: string) => {
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
};

const getNextAarti = (temple: Temple): { name: string; time: string } | null => {
  if (!temple.aartiSchedule || temple.aartiSchedule.length === 0) return null;
  
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  
  for (const aarti of temple.aartiSchedule) {
    const [hours, minutes] = aarti.time.split(':').map(Number);
    const aartiMinutes = hours * 60 + minutes;
    if (aartiMinutes > currentMinutes) {
      return { name: aarti.name, time: aarti.time };
    }
  }
  
  // Return first aarti of tomorrow
  return { 
    name: temple.aartiSchedule[0].name, 
    time: temple.aartiSchedule[0].time 
  };
};

const FavoritesPanel = ({ onSelectTemple }: FavoritesPanelProps) => {
  const { 
    favorites, 
    loading, 
    toggleFavorite, 
    toggleNotifications,
    isAuthenticated 
  } = useTempleFavorites();
  
  const { 
    notificationPermission, 
    requestNotificationPermission 
  } = useFavoriteAartiNotifications();

  const favoriteTemples = useMemo(() => {
    return favorites.map(fav => ({
      ...fav,
      temple: temples.find(t => t.id === fav.temple_id)
    })).filter(fav => fav.temple);
  }, [favorites]);

  const favoritesWithNotifications = favorites.filter(f => f.notifications_enabled).length;

  return (
    <Sheet>
      <SheetTrigger asChild>
        <button className="w-9 h-9 rounded-full flex items-center justify-center bg-white/5 border border-white/10 hover:bg-white/10 transition-colors relative">
          <Heart className={`w-5 h-5 ${favoriteTemples.length > 0 ? 'fill-destructive text-destructive' : 'text-muted-foreground'}`} />
          {favoriteTemples.length > 0 && (
            <Badge className="absolute -top-1.5 -right-1.5 h-4 w-4 p-0 flex items-center justify-center text-[10px]">
              {favoriteTemples.length}
            </Badge>
          )}
        </button>
      </SheetTrigger>
      
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-destructive fill-destructive" />
              Favorite Temples
            </SheetTitle>
            <ShareFavoritesButton 
              favoriteTemples={favoriteTemples.filter(f => f.temple) as { temple: Temple }[]} 
            />
          </div>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          {/* Notification Permission Banner */}
          {notificationPermission !== 'granted' && favoriteTemples.length > 0 && (
            <div className="p-4 bg-primary/10 rounded-lg border border-primary/30">
              <p className="text-sm text-foreground mb-2">
                Enable notifications to get alerts when aarti is about to start
              </p>
              <Button 
                size="sm" 
                onClick={requestNotificationPermission}
                className="gap-2"
              >
                <Bell className="w-4 h-4" />
                Enable Notifications
              </Button>
            </div>
          )}

          {/* Stats */}
          {favoriteTemples.length > 0 && (
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>{favoriteTemples.length} temples saved</span>
              {favoritesWithNotifications > 0 && (
                <span className="flex items-center gap-1">
                  <Bell className="w-3 h-3" />
                  {favoritesWithNotifications} with alerts
                </span>
              )}
            </div>
          )}

          {!isAuthenticated && favoriteTemples.length > 0 && (
            <p className="text-xs text-muted-foreground bg-muted p-2 rounded">
              Sign in to sync favorites across devices
            </p>
          )}

          {/* Favorites List */}
          <ScrollArea className="h-[calc(100vh-280px)]">
            <AnimatePresence mode="popLayout">
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">
                  Loading favorites...
                </div>
              ) : favoriteTemples.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12"
                >
                  <Heart className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                  <p className="text-muted-foreground">No favorite temples yet</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Tap the heart icon on any temple to add it
                  </p>
                </motion.div>
              ) : (
                <div className="space-y-3 pr-2">
                  {favoriteTemples.map((fav, index) => {
                    const temple = fav.temple!;
                    const nextAarti = getNextAarti(temple);
                    
                    return (
                      <motion.div
                        key={fav.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Card 
                          className="cursor-pointer hover:border-primary/50 transition-colors"
                          onClick={() => onSelectTemple(temple)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <img 
                                src={temple.thumbnail} 
                                alt={temple.name}
                                className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                              />
                              
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                  <div>
                                    <h4 className="font-medium text-foreground truncate">
                                      {temple.name}
                                    </h4>
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                                      <MapPin className="w-3 h-3" />
                                      <span className="truncate">{temple.location}</span>
                                    </div>
                                  </div>
                                  
                                  <div className="flex items-center gap-1 flex-shrink-0">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        toggleNotifications(temple.id);
                                      }}
                                    >
                                      {fav.notifications_enabled ? (
                                        <Bell className="w-4 h-4 text-primary fill-primary" />
                                      ) : (
                                        <BellOff className="w-4 h-4 text-muted-foreground" />
                                      )}
                                    </Button>
                                    
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        toggleFavorite(temple.id);
                                      }}
                                    >
                                      <X className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                                    </Button>
                                  </div>
                                </div>
                                
                                <div className="flex items-center gap-2 mt-2">
                                  <Badge variant="secondary" className="text-xs">
                                    {deityLabels[temple.deity].split(' ')[0]}
                                  </Badge>
                                  
                                  {nextAarti && (
                                    <div className="flex items-center gap-1 text-xs text-primary">
                                      <Clock className="w-3 h-3" />
                                      <span>Next: {formatTime(nextAarti.time)}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </AnimatePresence>
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default FavoritesPanel;
