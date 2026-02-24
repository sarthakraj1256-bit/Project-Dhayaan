import { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import IntentTagSelector, { type IntentTag } from './IntentTagSelector';
import FinalStressModal from './FinalStressModal';
import { getInitialStress } from './StressCheckInModal';
import { useToast } from '@/hooks/use-toast';
import { logError, logWarn } from '@/lib/logger';
import { getVersionString } from '@/lib/version';
import { useLanguage } from '@/contexts/LanguageContext';

// Lazy load Supabase to prevent initialization errors
const getSupabase = async () => {
  try {
    const { supabase } = await import('@/integrations/backend/client');
    return supabase;
  } catch (e) {
    logWarn('Supabase not available', e);
    return null;
  }
};

interface Review {
  id: string;
  name: string;
  message: string;
  rating: number;
  createdAt: string;
  intentTag?: IntentTag | null;
  stressReduction?: number | null;
}

const STORAGE_KEY = 'devalaya-devotee-reviews';

export default function DevoteeExperiences() {
  const { t, language } = useLanguage();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [intentTag, setIntentTag] = useState<IntentTag | null>(null);
  const [showFinalStressModal, setShowFinalStressModal] = useState(false);
  const [pendingSubmission, setPendingSubmission] = useState(false);
  const { toast } = useToast();

  // Load reviews from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setReviews(JSON.parse(stored));
      } catch (e) {
        logError('Failed to parse reviews', e);
      }
    }
  }, []);

  // Save reviews to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reviews));
  }, [reviews]);

  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !message.trim() || rating === 0) return;
    
    setPendingSubmission(true);
    setShowFinalStressModal(true);
  };

  const handleFinalStressSubmit = async (finalStress: number, stressReduction: number | null) => {
    if (!pendingSubmission) return;
    
    setIsSubmitting(true);
    
    const initialStress = getInitialStress();
    const locale = language === 'hi' ? 'hi-IN' : 'en-IN';
    const createdAt = new Date().toLocaleDateString(locale, {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });

    const newReview: Review = {
      id: Date.now().toString(),
      name: name.trim(),
      message: message.trim(),
      rating,
      createdAt,
      intentTag,
      stressReduction
    };

    setReviews(prev => [newReview, ...prev]);

    try {
      const supabase = await getSupabase();
      if (supabase) {
        const { error } = await supabase.functions.invoke('submit-review', {
          body: {
            name: newReview.name,
            message: newReview.message,
            rating: newReview.rating,
            initialStress,
            finalStress,
            stressReduction,
            intentTag,
            createdAt
          }
        });

        if (error) {
           logError('Error submitting to backend', error);
        }
      }

      toast({
        title: t('devotee.sharedSuccess'),
        description: stressReduction !== null && stressReduction > 0 
          ? t('devotee.stressReduced').replace('{value}', String(stressReduction))
          : t('devotee.thankYou'),
      });
    } catch (err) {
       logError('Review submission error', err);
      toast({
        title: t('devotee.savedLocally'),
        description: t('devotee.thankYou'),
      });
    }

    setName('');
    setMessage('');
    setRating(0);
    setIntentTag(null);
    setIsSubmitting(false);
    setPendingSubmission(false);
  };

  const renderStars = (count: number, interactive = false, size = 'w-5 h-5') => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={!interactive}
            className={`transition-all duration-200 ${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'}`}
            onClick={() => interactive && setRating(star)}
            onMouseEnter={() => interactive && setHoveredRating(star)}
            onMouseLeave={() => interactive && setHoveredRating(0)}
          >
            <Star
              className={`${size} transition-colors duration-200 ${
                star <= (interactive ? (hoveredRating || count) : count)
                  ? 'fill-primary text-primary'
                  : 'fill-transparent text-muted-foreground/40'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  return (
    <section id="experiences" className="relative z-10 py-24 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl md:text-4xl text-gold-gradient tracking-wider mb-4">
            {t('devotee.title')}
          </h2>
          <p className="font-body text-muted-foreground max-w-2xl mx-auto">
            {t('devotee.subtitle')}
          </p>
        </div>

        {/* Average Rating Display */}
        {reviews.length > 0 && (
          <div className="glass-card p-6 mb-10 text-center">
            <p className="text-sm text-muted-foreground uppercase tracking-widest mb-2">
              {t('devotee.communityRating')}
            </p>
            <div className="flex items-center justify-center gap-3">
              <span className="font-display text-4xl text-gold-gradient">
                {averageRating.toFixed(1)}
              </span>
              {renderStars(Math.round(averageRating), false, 'w-6 h-6')}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {t('devotee.basedOn')} {reviews.length} {reviews.length === 1 ? t('devotee.experience') : t('devotee.experiences')}
            </p>
          </div>
        )}

        {/* Final Stress Modal */}
        <FinalStressModal
          isOpen={showFinalStressModal}
          onClose={() => {
            setShowFinalStressModal(false);
            setPendingSubmission(false);
          }}
          onSubmit={handleFinalStressSubmit}
        />

        {/* Submit Form */}
        <form onSubmit={handleFormSubmit} className="glass-card p-8 mb-12">
          <h3 className="font-display text-xl text-foreground tracking-wider mb-6">
            {t('devotee.shareExperience')}
          </h3>

          <div className="space-y-6">
            {/* Star Rating */}
            <div>
              <label className="block text-sm text-muted-foreground mb-2 tracking-wider">
                {t('devotee.yourRating')}
              </label>
              {renderStars(rating, true, 'w-8 h-8')}
            </div>

            {/* Intent Tag Selector */}
            <IntentTagSelector
              selectedTag={intentTag}
              onChange={setIntentTag}
            />

            {/* Name Input */}
            <div>
              <label htmlFor="name" className="block text-sm text-muted-foreground mb-2 tracking-wider">
                {t('devotee.yourName')}
              </label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('devotee.enterName')}
                className="bg-background/50 border-border/50 focus:border-primary/50"
                required
              />
            </div>

            {/* Message Input */}
            <div>
              <label htmlFor="message" className="block text-sm text-muted-foreground mb-2 tracking-wider">
                {t('devotee.yourExperience')}
              </label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={t('devotee.experiencePlaceholder')}
                className="bg-background/50 border-border/50 focus:border-primary/50 min-h-[120px]"
                required
              />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={!name.trim() || !message.trim() || rating === 0 || isSubmitting}
              className={`
                w-full font-display tracking-wider uppercase text-sm
                bg-primary/90 hover:bg-primary text-primary-foreground
                transition-all duration-300 ease-out
                ${isSubmitting ? 'scale-95 opacity-80' : 'hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/20'}
                disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
              `}
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  {t('devotee.submitting')}
                </span>
              ) : (
                t('devotee.submit')
              )}
            </Button>
          </div>
        </form>

        {/* Reviews List */}
        {reviews.length > 0 && (
          <div className="space-y-6">
            <h3 className="font-display text-xl text-foreground tracking-wider text-center mb-8">
              {t('devotee.recentExperiences')}
            </h3>
            {reviews.map((review) => (
              <div
                key={review.id}
                className="glass-card p-6 transition-all duration-300 hover:border-primary/30"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-display text-foreground tracking-wider">
                      {review.name}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      {review.createdAt}
                    </p>
                  </div>
                  {renderStars(review.rating)}
                </div>
                <p className="font-body text-muted-foreground leading-relaxed">
                  {review.message}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Footer Credits */}
        <div className="mt-20 pt-12 border-t border-border/20 text-center space-y-8">
          {/* Brand Section */}
          <div className="temple-divider mb-8">
            <svg className="w-8 h-8 text-primary" viewBox="0 0 32 32" fill="currentColor">
              <polygon points="16,4 4,28 28,28" fillOpacity="0.3" />
              <polygon points="16,8 8,24 24,24" fillOpacity="0.5" />
              <polygon points="16,12 12,20 20,20" fillOpacity="0.8" />
            </svg>
          </div>

          <h3 className="font-display text-3xl text-gold-gradient gold-glow tracking-wider">
            DHYAAN
          </h3>
          <p className="font-display text-lg text-muted-foreground tracking-widest">
            ध्यान
          </p>
          <p className="font-body text-sm text-muted-foreground max-w-md mx-auto">
            {t('footer.exploringIntersection')}
          </p>


          {/* Team Credits */}
          <div className="pt-8 border-t border-border/10 mt-8 space-y-4">
            <p className="font-display text-sm tracking-widest text-muted-foreground uppercase">
              {t('footer.craftedBy')}
            </p>
            <p className="font-display text-xl text-gold-gradient tracking-wider">
              Team Dhyaan
            </p>
            
            {/* Mentorship Credits */}
            <div className="pt-4 mt-2">
              <p className="font-display text-xs tracking-widest text-muted-foreground uppercase mb-2">
                {t('footer.guidanceOf')}
              </p>
              <p className="font-display text-sm text-foreground tracking-wider">
                Manish Sir & Shashank Sir
              </p>
            </div>
            
            <div className="flex items-center justify-center gap-3 pt-4">
              <p className="font-display text-sm text-foreground tracking-wider">
                © 2026 Project Dhyaan
              </p>
              <span className="text-muted-foreground/30">•</span>
              <span 
                className="font-mono text-xs text-muted-foreground/60 px-2 py-0.5 rounded bg-muted/20 border border-border/20"
                title="App version"
              >
                {getVersionString()}
              </span>
            </div>
          </div>

          <p className="text-xs text-muted-foreground/50 pt-4 tracking-wide">
            {t('footer.allBrahman')}
          </p>
        </div>
      </div>
    </section>
  );
}
