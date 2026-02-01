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
            Exploring the intersection of ancient wisdom, sacred geometry, 
            and scientific principles in Indian temple architecture.
          </p>

          {/* Status Card */}
          <div className="glass-card p-6 max-w-md mx-auto mt-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </span>
              <span className="font-display text-sm tracking-wider text-foreground">
                LIVE ON NETLIFY
              </span>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-4">
              <a
                href="https://github.com/sarthakraj8790/Project-Dhyaan"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-2 px-5 py-2.5 glass-card border border-border/50 hover:border-primary/50 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary/10"
              >
                <svg 
                  className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors duration-300" 
                  fill="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                <span className="font-display text-xs tracking-wider text-muted-foreground group-hover:text-primary transition-colors duration-300">
                  VIEW SOURCE
                </span>
              </a>
              
              <a
                href="https://dhyaan-cosmos.lovable.app"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-2 px-5 py-2.5 glass-card border border-border/50 hover:border-primary/50 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary/10"
              >
                <svg 
                  className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors duration-300" 
                  fill="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                </svg>
                <span className="font-display text-xs tracking-wider text-muted-foreground group-hover:text-primary transition-colors duration-300">
                  VISIT SITE
                </span>
              </a>
            </div>
          </div>

          {/* Team Credits */}
          <div className="pt-8 border-t border-border/10 mt-8 space-y-4">
            <p className="font-display text-sm tracking-widest text-muted-foreground uppercase">
              Crafted by
            </p>
            <p className="font-display text-xl text-gold-gradient tracking-wider">
              Team Sutradhara
            </p>
            <p className="font-display text-sm text-foreground tracking-wider">
              © 2026 Project Dhyaan
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
