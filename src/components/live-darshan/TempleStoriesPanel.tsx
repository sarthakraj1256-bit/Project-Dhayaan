import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Star, Calendar, Trash2, Send, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { useTempleStories, TempleStory } from '@/hooks/useTempleStories';
import { temples, deityLabels } from '@/data/templeStreams';
import { format, formatDistanceToNow } from 'date-fns';

interface TempleStoriesPanelProps {
  templeId?: string;
}

const StarRating = ({ 
  rating, 
  onChange, 
  readonly = false 
}: { 
  rating: number; 
  onChange?: (r: number) => void; 
  readonly?: boolean;
}) => {
  const [hover, setHover] = useState(0);
  
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => onChange?.(star)}
          onMouseEnter={() => !readonly && setHover(star)}
          onMouseLeave={() => !readonly && setHover(0)}
          className={`${readonly ? 'cursor-default' : 'cursor-pointer'} transition-transform hover:scale-110`}
        >
          <Star
            className={`w-5 h-5 ${
              star <= (hover || rating)
                ? 'fill-primary text-primary'
                : 'text-muted-foreground'
            }`}
          />
        </button>
      ))}
    </div>
  );
};

const StoryCard = ({ 
  story, 
  onDelete, 
  canDelete 
}: { 
  story: TempleStory; 
  onDelete: () => void;
  canDelete: boolean;
}) => {
  const temple = temples.find(t => t.id === story.temple_id);
  const initials = story.profile?.display_name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase() || 'D';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
    >
      <Card className="border-border/50 hover:border-primary/30 transition-colors">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Avatar className="w-10 h-10 flex-shrink-0">
              <AvatarImage src={story.profile?.avatar_url || undefined} />
              <AvatarFallback className="bg-primary/20 text-primary text-sm">
                {initials}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-sm text-foreground">
                    {story.profile?.display_name || 'Devotee'}
                  </span>
                  {story.rating && (
                    <div className="flex items-center gap-0.5">
                      {[...Array(story.rating)].map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-primary text-primary" />
                      ))}
                    </div>
                  )}
                </div>
                <span className="text-xs text-muted-foreground flex-shrink-0">
                  {formatDistanceToNow(new Date(story.created_at), { addSuffix: true })}
                </span>
              </div>

              {temple && (
                <Badge variant="secondary" className="text-xs mb-2">
                  {temple.name}
                </Badge>
              )}
              
              <p className="text-sm text-foreground/90 whitespace-pre-wrap break-words">
                {story.story}
              </p>
              
              <div className="flex items-center justify-between mt-2">
                {story.visit_date && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    <span>Visited {format(new Date(story.visit_date), 'MMM d, yyyy')}</span>
                  </div>
                )}
                
                {canDelete && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-muted-foreground hover:text-destructive"
                    onClick={onDelete}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const AddStoryForm = ({ 
  templeId,
  onSubmit, 
  onCancel 
}: { 
  templeId?: string;
  onSubmit: (templeId: string, story: string, rating?: number, visitDate?: string) => Promise<boolean>;
  onCancel: () => void;
}) => {
  const [selectedTemple, setSelectedTemple] = useState(templeId || '');
  const [story, setStory] = useState('');
  const [rating, setRating] = useState(0);
  const [visitDate, setVisitDate] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!selectedTemple || !story.trim()) return;
    
    setSubmitting(true);
    const success = await onSubmit(
      selectedTemple, 
      story, 
      rating > 0 ? rating : undefined,
      visitDate || undefined
    );
    setSubmitting(false);
    
    if (success) {
      onCancel();
    }
  };

  return (
    <div className="space-y-4">
      {!templeId && (
        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">
            Select Temple
          </label>
          <select
            value={selectedTemple}
            onChange={(e) => setSelectedTemple(e.target.value)}
            className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="">Choose a temple...</option>
            {temples.map(temple => (
              <option key={temple.id} value={temple.id}>
                {temple.name} - {temple.location}
              </option>
            ))}
          </select>
        </div>
      )}
      
      <div>
        <label className="text-sm font-medium text-foreground mb-2 block">
          Your Experience
        </label>
        <Textarea
          value={story}
          onChange={(e) => setStory(e.target.value)}
          placeholder="Share your divine experience at this temple..."
          className="min-h-[120px] resize-none"
          maxLength={1000}
        />
        <p className="text-xs text-muted-foreground mt-1 text-right">
          {story.length}/1000
        </p>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <label className="text-sm font-medium text-foreground mb-2 block">
            Rating (optional)
          </label>
          <StarRating rating={rating} onChange={setRating} />
        </div>
        
        <div className="flex-1">
          <label className="text-sm font-medium text-foreground mb-2 block">
            Visit Date (optional)
          </label>
          <Input
            type="date"
            value={visitDate}
            onChange={(e) => setVisitDate(e.target.value)}
            max={new Date().toISOString().split('T')[0]}
          />
        </div>
      </div>
      
      <DialogFooter className="gap-2 sm:gap-0">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          disabled={!selectedTemple || !story.trim() || submitting}
          className="gap-2"
        >
          <Send className="w-4 h-4" />
          {submitting ? 'Sharing...' : 'Share Experience'}
        </Button>
      </DialogFooter>
    </div>
  );
};

const TempleStoriesPanel = ({ templeId }: TempleStoriesPanelProps) => {
  const { 
    stories, 
    loading, 
    addStory, 
    deleteStory, 
    isAuthenticated,
    userId 
  } = useTempleStories(templeId);
  
  const [dialogOpen, setDialogOpen] = useState(false);

  const temple = templeId ? temples.find(t => t.id === templeId) : null;

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <MessageSquare className="w-4 h-4" />
          <span className="hidden sm:inline">Stories</span>
          {stories.length > 0 && (
            <Badge className="h-5 min-w-5 p-0 flex items-center justify-center text-xs">
              {stories.length}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary" />
              {temple ? `${temple.name} Stories` : 'Devotee Stories'}
            </SheetTitle>
            
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-2" disabled={!isAuthenticated}>
                  <Send className="w-4 h-4" />
                  Share
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-primary" />
                    Share Your Experience
                  </DialogTitle>
                </DialogHeader>
                <AddStoryForm 
                  templeId={templeId}
                  onSubmit={addStory}
                  onCancel={() => setDialogOpen(false)}
                />
              </DialogContent>
            </Dialog>
          </div>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          {!isAuthenticated && (
            <div className="p-4 bg-primary/10 rounded-lg border border-primary/30">
              <p className="text-sm text-foreground">
                Sign in to share your temple visit experiences with the community
              </p>
            </div>
          )}

          <ScrollArea className="h-[calc(100vh-200px)]">
            <AnimatePresence mode="popLayout">
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">
                  Loading stories...
                </div>
              ) : stories.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12"
                >
                  <User className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                  <p className="text-muted-foreground">No stories yet</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Be the first to share your experience!
                  </p>
                </motion.div>
              ) : (
                <div className="space-y-3 pr-2">
                  {stories.map((story) => (
                    <StoryCard
                      key={story.id}
                      story={story}
                      canDelete={userId === story.user_id}
                      onDelete={() => deleteStory(story.id)}
                    />
                  ))}
                </div>
              )}
            </AnimatePresence>
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default TempleStoriesPanel;
