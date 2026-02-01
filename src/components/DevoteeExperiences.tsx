import { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

interface Review {
  id: string;
  name: string;
  message: string;
  rating: number;
  createdAt: string;
}

const STORAGE_KEY = 'devalaya-devotee-reviews';

export default function DevoteeExperiences() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load reviews from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setReviews(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse reviews:', e);
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !message.trim() || rating === 0) return;

    setIsSubmitting(true);

    setTimeout(() => {
      const newReview: Review = {
        id: Date.now().toString(),
        name: name.trim(),
        message: message.trim(),
        rating,
        createdAt: new Date().toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric'
        })
      };

      setReviews(prev => [newReview, ...prev]);
      setName('');
      setMessage('');
      setRating(0);
      setIsSubmitting(false);
    }, 600);
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
            Devotee Experiences
          </h2>
          <p className="font-body text-muted-foreground max-w-2xl mx-auto">
            Share your spiritual journey and connect with fellow seekers exploring the sacred geometry of Indian temples.
          </p>
        </div>

        {/* Average Rating Display */}
        {reviews.length > 0 && (
          <div className="glass-card p-6 mb-10 text-center">
            <p className="text-sm text-muted-foreground uppercase tracking-widest mb-2">
              Community Rating
            </p>
            <div className="flex items-center justify-center gap-3">
              <span className="font-display text-4xl text-gold-gradient">
                {averageRating.toFixed(1)}
              </span>
              {renderStars(Math.round(averageRating), false, 'w-6 h-6')}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Based on {reviews.length} {reviews.length === 1 ? 'experience' : 'experiences'}
            </p>
          </div>
        )}

        {/* Submit Form */}
        <form onSubmit={handleSubmit} className="glass-card p-8 mb-12">
          <h3 className="font-display text-xl text-foreground tracking-wider mb-6">
            Share Your Experience
          </h3>

          <div className="space-y-6">
            {/* Star Rating */}
            <div>
              <label className="block text-sm text-muted-foreground mb-2 tracking-wider">
                Your Rating
              </label>
              {renderStars(rating, true, 'w-8 h-8')}
            </div>

            {/* Name Input */}
            <div>
              <label htmlFor="name" className="block text-sm text-muted-foreground mb-2 tracking-wider">
                Your Name
              </label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="bg-background/50 border-border/50 focus:border-primary/50"
                required
              />
            </div>

            {/* Message Input */}
            <div>
              <label htmlFor="message" className="block text-sm text-muted-foreground mb-2 tracking-wider">
                Your Experience
              </label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Share your thoughts on the sacred architecture..."
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
                  Submitting...
                </span>
              ) : (
                'Submit Experience'
              )}
            </Button>
          </div>
        </form>

        {/* Reviews List */}
        {reviews.length > 0 && (
          <div className="space-y-6">
            <h3 className="font-display text-xl text-foreground tracking-wider text-center mb-8">
              Recent Experiences
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
        <div className="mt-20 pt-12 border-t border-border/20 text-center space-y-6">
          <div className="temple-divider mb-8">
            <svg className="w-8 h-8 text-primary" viewBox="0 0 32 32" fill="currentColor">
              <polygon points="16,4 4,28 28,28" fillOpacity="0.3" />
              <polygon points="16,8 8,24 24,24" fillOpacity="0.5" />
              <polygon points="16,12 12,20 20,20" fillOpacity="0.8" />
            </svg>
          </div>

          <h3 className="font-display text-2xl text-gold-gradient gold-glow tracking-wider">
            ध्यान
          </h3>
          <p className="font-body text-sm text-muted-foreground max-w-md mx-auto">
            Exploring the intersection of ancient wisdom, sacred geometry, 
            and scientific principles in Indian temple architecture.
          </p>

          <div className="pt-8 border-t border-border/10 mt-8">
            <p className="font-display text-sm text-foreground tracking-wider">
              © 2026 Team Sutradhara | Project Dhyaan
            </p>
          </div>

          <p className="text-xs text-muted-foreground/50 pt-4 tracking-wide">
            "सर्वं खल्विदं ब्रह्म" — All this is indeed Brahman
          </p>
        </div>
      </div>
    </section>
  );
}
