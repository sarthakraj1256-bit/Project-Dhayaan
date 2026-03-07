import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { logError, logWarn } from '@/lib/logger';
import { getVersionString } from '@/lib/version';
import { useLanguage } from '@/contexts/LanguageContext';
import { getInitialStress } from './StressCheckInModal';
import FinalStressModal from './FinalStressModal';
import type { IntentTag } from './IntentTagSelector';
import { motion, AnimatePresence } from 'framer-motion';

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

const MOODS = [
  { id: 'anxiety', emoji: '🧘', label: 'Anxiety Relief' },
  { id: 'focus', emoji: '🎯', label: 'Focus' },
  { id: 'sleep', emoji: '🌙', label: 'Sleep' },
  { id: 'spiritual', emoji: '✨', label: 'Spiritual Growth' },
  { id: 'stress', emoji: '🌿', label: 'Stress Relief' },
  { id: 'healing', emoji: '💛', label: 'Healing' },
];

const STAR_LABELS = ['', "Didn't help", 'It was okay', 'Felt good 🙂', 'Loved it! 😊', 'Life changing! 🌟'];

const MOOD_TO_INTENT: Record<string, IntentTag> = {
  anxiety: 'anxiety_relief',
  stress: 'anxiety_relief',
  focus: 'focus',
  sleep: 'sleep',
  spiritual: 'spiritual_growth',
  healing: 'anxiety_relief',
};

const slideIn = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } },
};

export default function DevoteeExperiences() {
  const { t, language } = useLanguage();
  const { toast } = useToast();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [step, setStep] = useState(1);
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [selectedMoods, setSelectedMoods] = useState<string[]>([]);
  const [name, setName] = useState('');
  const [text, setText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Stress modal
  const [showFinalStressModal, setShowFinalStressModal] = useState(false);
  const [pendingSubmission, setPendingSubmission] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try { setReviews(JSON.parse(stored)); } catch (e) { logError('Failed to parse reviews', e); }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reviews));
  }, [reviews]);

  const toggleMood = (id: string) =>
    setSelectedMoods((p) => (p.includes(id) ? p.filter((m) => m !== id) : [...p, id]));

  const handleSubmitPress = () => {
    if (!text.trim() || rating === 0) return;
    setPendingSubmission(true);
    setShowFinalStressModal(true);
  };

  const handleFinalStressSubmit = async (finalStress: number, stressReduction: number | null) => {
    if (!pendingSubmission) return;
    setIsSubmitting(true);

    const initialStress = getInitialStress();
    const locale = language === 'hi' ? 'hi-IN' : 'en-IN';
    const createdAt = new Date().toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' });

    const intentTag: IntentTag | null = selectedMoods.length > 0 ? (MOOD_TO_INTENT[selectedMoods[0]] ?? null) : null;

    const newReview: Review = {
      id: Date.now().toString(),
      name: name.trim() || 'Anonymous',
      message: text.trim(),
      rating,
      createdAt,
      intentTag,
      stressReduction,
    };

    setReviews((prev) => [newReview, ...prev]);

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
            createdAt,
          },
        });
        if (error) logError('Error submitting to backend', error);
      }

      toast({
        title: t('devotee.sharedSuccess'),
        description:
          stressReduction !== null && stressReduction > 0
            ? t('devotee.stressReduced').replace('{value}', String(stressReduction))
            : t('devotee.thankYou'),
      });
    } catch (err) {
      logError('Review submission error', err);
      toast({ title: t('devotee.savedLocally'), description: t('devotee.thankYou') });
    }

    setIsSubmitting(false);
    setPendingSubmission(false);
    setStep(4); // success
  };

  const reset = () => {
    setStep(1);
    setRating(0);
    setHovered(0);
    setSelectedMoods([]);
    setName('');
    setText('');
  };

  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

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

        {/* Average Rating */}
        {reviews.length > 0 && (
          <div className="glass-card p-6 mb-10 text-center">
            <p className="text-sm text-muted-foreground uppercase tracking-widest mb-2">
              {t('devotee.communityRating')}
            </p>
            <div className="flex items-center justify-center gap-3">
              <span className="font-display text-4xl text-gold-gradient">
                {averageRating.toFixed(1)}
              </span>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <span key={s} className={`text-xl ${s <= Math.round(averageRating) ? 'opacity-100' : 'opacity-20'}`}>⭐</span>
                ))}
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {t('devotee.basedOn')} {reviews.length} {reviews.length === 1 ? t('devotee.experience') : t('devotee.experiences')}
            </p>
          </div>
        )}

        {/* Final Stress Modal */}
        <FinalStressModal
          isOpen={showFinalStressModal}
          onClose={() => { setShowFinalStressModal(false); setPendingSubmission(false); }}
          onSubmit={handleFinalStressSubmit}
        />

        {/* ─── Step Card ─── */}
        <div className="max-w-[420px] mx-auto">
          <div className="rounded-3xl p-7 bg-card border border-border shadow-xl">
            <AnimatePresence mode="wait">
              {/* ── Step 4: Success ── */}
              {step === 4 && (
                <motion.div key="success" {...slideIn} className="text-center py-6 space-y-5">
                  <div className="text-6xl">🙏</div>
                  <h3 className="font-display text-2xl tracking-wider text-foreground">Thank You!</h3>
                  <p className="text-sm text-muted-foreground">
                    Your experience has been shared with the Dhyaan community.
                  </p>
                  <div className="flex justify-center gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <span key={s} className={`text-2xl transition-opacity ${s <= rating ? 'opacity-100' : 'opacity-20'}`}>⭐</span>
                    ))}
                  </div>
                  <button
                    onClick={reset}
                    className="mt-4 px-7 py-2.5 rounded-xl border border-primary text-primary text-sm font-semibold hover:bg-primary/10 transition-colors"
                  >
                    Share Again
                  </button>
                </motion.div>
              )}

              {step < 4 && (
                <motion.div key={`step-${step}`} {...slideIn}>
                  {/* Progress bar */}
                  <div className="flex gap-1.5 mb-7">
                    {[1, 2, 3].map((s) => (
                      <div
                        key={s}
                        className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                          s <= step ? 'bg-primary' : 'bg-muted'
                        }`}
                      />
                    ))}
                  </div>

                  {/* ── Step 1: Rating ── */}
                  {step === 1 && (
                    <div className="text-center space-y-5">
                      <h3 className="font-display text-xl tracking-wider text-foreground">
                        How was your experience?
                      </h3>
                      <p className="text-sm text-muted-foreground">Tap a star below</p>

                      <div className="flex justify-center gap-2">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <button
                            key={s}
                            onMouseEnter={() => setHovered(s)}
                            onMouseLeave={() => setHovered(0)}
                            onClick={() => { setRating(s); setTimeout(() => setStep(2), 320); }}
                            className="text-[42px] p-1 border-none bg-transparent cursor-pointer transition-all duration-150 hover:scale-125"
                            style={{
                              filter: (hovered || rating) >= s ? 'none' : 'grayscale(1) opacity(0.3)',
                              transform: (hovered || rating) >= s ? 'scale(1.15)' : 'scale(1)',
                            }}
                          >
                            ⭐
                          </button>
                        ))}
                      </div>

                      <p className="text-sm font-medium text-primary h-5">
                        {STAR_LABELS[hovered || rating]}
                      </p>
                    </div>
                  )}

                  {/* ── Step 2: Mood ── */}
                  {step === 2 && (
                    <div className="space-y-5">
                      <div className="text-center">
                        <h3 className="font-display text-xl tracking-wider text-foreground">
                          What brought you here?
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">Select all that apply (optional)</p>
                      </div>

                      <div className="grid grid-cols-3 gap-2.5">
                        {MOODS.map((m) => {
                          const on = selectedMoods.includes(m.id);
                          return (
                            <button
                              key={m.id}
                              onClick={() => toggleMood(m.id)}
                              className={`flex flex-col items-center gap-1.5 py-3.5 px-1.5 rounded-2xl border-2 transition-all duration-200 cursor-pointer
                                ${on
                                  ? 'bg-primary/10 border-primary shadow-md shadow-primary/10 -translate-y-0.5'
                                  : 'bg-muted/40 border-border hover:border-primary/30'
                                }`}
                            >
                              <span className="text-2xl">{m.emoji}</span>
                              <span className="text-xs font-medium text-foreground">{m.label}</span>
                            </button>
                          );
                        })}
                      </div>

                      <div className="flex gap-2.5 pt-2">
                        <button
                          onClick={() => setStep(1)}
                          className="px-5 py-3 rounded-xl border border-border text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                          ← Back
                        </button>
                        <button
                          onClick={() => setStep(3)}
                          className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-bold shadow-lg shadow-primary/25 hover:bg-primary/90 transition-colors"
                        >
                          {selectedMoods.length > 0 ? 'Continue →' : 'Skip →'}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* ── Step 3: Write ── */}
                  {step === 3 && (
                    <div className="space-y-5">
                      <div className="text-center">
                        <h3 className="font-display text-xl tracking-wider text-foreground">
                          Share your story
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">A few words go a long way 🌿</p>
                      </div>

                      {/* Name */}
                      <div>
                        <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                          Your Name (optional)
                        </label>
                        <input
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="e.g. Priya, Rahul..."
                          className="w-full rounded-xl bg-muted/40 border border-border px-3.5 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                        />
                      </div>

                      {/* Experience */}
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-xs font-semibold text-muted-foreground">
                            Your Experience
                          </label>
                          <span className={`text-xs ${text.length > 220 ? 'text-primary' : 'text-muted-foreground/50'}`}>
                            {text.length}/300
                          </span>
                        </div>
                        <textarea
                          value={text}
                          onChange={(e) => e.target.value.length <= 300 && setText(e.target.value)}
                          placeholder="How did this session make you feel? What shifted for you?..."
                          rows={5}
                          className="w-full rounded-xl bg-muted/40 border border-border px-3.5 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                        />
                      </div>

                      <div className="flex gap-2.5">
                        <button
                          onClick={() => setStep(2)}
                          className="px-5 py-3 rounded-xl border border-border text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                          ← Back
                        </button>
                        <button
                          onClick={handleSubmitPress}
                          disabled={!text.trim() || isSubmitting}
                          className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all
                            ${text.trim()
                              ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary/90 cursor-pointer'
                              : 'bg-muted text-muted-foreground cursor-not-allowed'
                            }`}
                        >
                          {isSubmitting ? 'Submitting…' : 'Submit 🙏'}
                        </button>
                      </div>

                      {!text.trim() && (
                        <p className="text-center text-xs text-muted-foreground">Write something to submit ✍️</p>
                      )}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Reviews List */}
        {reviews.length > 0 && (
          <div className="space-y-6 mt-12">
            <h3 className="font-display text-xl text-foreground tracking-wider text-center mb-8">
              {t('devotee.recentExperiences')}
            </h3>
            {reviews.map((review) => (
              <div key={review.id} className="glass-card p-6 transition-all duration-300 hover:border-primary/30">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-display text-foreground tracking-wider">{review.name}</h4>
                    <p className="text-xs text-muted-foreground mt-1">{review.createdAt}</p>
                  </div>
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <span key={s} className={`text-sm ${s <= review.rating ? 'opacity-100' : 'opacity-20'}`}>⭐</span>
                    ))}
                  </div>
                </div>
                <p className="font-body text-muted-foreground leading-relaxed">{review.message}</p>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="mt-20 pt-7 border-t border-primary/15 text-center space-y-2">
          <h3 className="font-display text-[22px] text-primary tracking-[4px]">DHYAAN</h3>
          <p className="font-display text-[15px] text-muted-foreground tracking-wide">ध्यान</p>
          <div className="w-10 h-px bg-primary/30 mx-auto my-1.5" />
          <p className="text-[12.5px] text-muted-foreground/70 leading-relaxed">
            {t('footer.craftedBy')}{' '}
            <span className="text-primary font-medium">Team Dhyaan</span>
            <span className="text-primary/50 mx-1.5">·</span>
            {t('footer.guidanceOf')}{' '}
            <span className="text-primary font-medium">Manish Sir &amp; Shashank Sir</span>
          </p>
          <div className="flex items-center justify-center gap-1.5 pt-1 text-[11px] text-muted-foreground/50">
            <span>© 2026 Project Dhyaan</span>
            <span className="text-primary/50">·</span>
            <span className="bg-primary/10 border border-primary/20 rounded-md px-1.5 py-px text-[10px] text-primary">
              {getVersionString()}
            </span>
          </div>
          <p className="text-xs text-muted-foreground/40 pt-2 tracking-wide">{t('footer.allBrahman')}</p>
        </div>
      </div>
    </section>
  );
}
