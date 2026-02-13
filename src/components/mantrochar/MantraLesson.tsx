import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Volume2, Headphones, Eye, Mic, Info, Target, Loader2 } from 'lucide-react';
import type { Mantra, MantraSyllable } from '@/data/mantraLibrary';
import LearningStep from './LearningStep';
import SyllableBreakdown from './SyllableBreakdown';
import RepetitionCounter from './RepetitionCounter';
import PronunciationFeedback from './PronunciationFeedback';
import { useGuruVoice } from '@/hooks/useGuruVoice';

interface MantraLessonProps {
  mantra: Mantra;
  onBack: () => void;
  onComplete: (reps: number) => void;
  onSyllableProgress?: (syllableIndices: number[]) => void;
}

const STEPS = [
  { id: 'listen', label: 'Listen', icon: <Headphones className="w-4 h-4" /> },
  { id: 'wordview', label: 'Word View', icon: <Eye className="w-4 h-4" /> },
  { id: 'speak', label: 'Speak', icon: <Mic className="w-4 h-4" /> },
  { id: 'info', label: 'Info', icon: <Info className="w-4 h-4" /> },
  { id: 'japa', label: 'Japa', icon: <Target className="w-4 h-4" /> },
];

const MantraLesson = ({ mantra, onBack, onComplete, onSyllableProgress }: MantraLessonProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [currentSyllableIndex, setCurrentSyllableIndex] = useState(0);
  const [completedSyllables, setCompletedSyllables] = useState<number[]>([]);
  const [selectedReps, setSelectedReps] = useState(mantra.recommendedReps[0]);
  const [currentReps, setCurrentReps] = useState(0);

  const guruVoice = useGuruVoice();

  const handlePlayFullMantra = useCallback(() => {
    guruVoice.speak(mantra.transliteration);
  }, [mantra.transliteration, guruVoice]);

  const handlePlaySyllable = useCallback((syllable: MantraSyllable) => {
    guruVoice.speak(syllable.transliteration);
  }, [guruVoice]);

  const handleSyllableComplete = useCallback((index: number) => {
    if (!completedSyllables.includes(index)) {
      const updated = [...completedSyllables, index];
      setCompletedSyllables(updated);
      onSyllableProgress?.(updated);
    }
    if (index < mantra.syllables.length - 1) {
      setCurrentSyllableIndex(index + 1);
    }
  }, [completedSyllables, mantra.syllables.length, onSyllableProgress]);

  const handleNextStep = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleRepetitionComplete = useCallback(() => {
    onComplete(currentReps);
  }, [currentReps, onComplete]);

  // Split mantra text into words for Word View
  const getMantraWords = () => {
    return mantra.syllables.map((s) => ({
      original: s.text,
      transliteration: s.transliteration,
      pronunciation: s.pronunciation,
    }));
  };

  const renderStepContent = () => {
    switch (STEPS[currentStep].id) {
      case 'listen':
        return (
          <div className="text-center space-y-6">
            <div className="p-8 rounded-2xl bg-white/5 border border-white/10">
              <p className="text-2xl md:text-3xl font-sanskrit text-foreground mb-4 leading-relaxed whitespace-pre-line">
                {mantra.sanskrit}
              </p>
              <p className="text-base md:text-lg text-primary/80 font-mono mb-6 whitespace-pre-line">
                {mantra.transliteration}
              </p>
              
              <div className="flex flex-col items-center gap-2">
                <motion.button
                  onClick={handlePlayFullMantra}
                  disabled={guruVoice.isLoading || guruVoice.isPlaying}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`
                    px-8 py-4 rounded-full border-2 transition-all
                    ${guruVoice.isPlaying 
                      ? 'bg-primary/20 border-primary text-primary' 
                      : 'bg-white/10 border-white/20 hover:border-primary/50 text-foreground'
                    }
                  `}
                >
                  <span className="flex items-center gap-3">
                    {guruVoice.isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Volume2 className={`w-5 h-5 ${guruVoice.isPlaying ? 'animate-pulse' : ''}`} />
                    )}
                    {guruVoice.isLoading ? 'Generating...' : guruVoice.isPlaying ? 'Playing...' : 'Listen to Guru Voice'}
                  </span>
                </motion.button>
                
                {guruVoice.isPlaying && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`
                      flex items-center gap-1.5 px-3 py-1 rounded-full text-xs
                      ${guruVoice.isCached 
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }
                    `}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${guruVoice.isCached ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                    {guruVoice.isCached ? 'Playing from cache' : 'Freshly generated'}
                  </motion.div>
                )}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
              <p className="text-sm text-foreground/80">
                <strong>Tip:</strong> Close your eyes and focus on the authentic pronunciation.
                {guruVoice.isCached && ' Audio is cached for instant replay.'}
              </p>
            </div>
          </div>
        );

      case 'wordview':
        return (
          <div className="space-y-6">
            <div className="text-center mb-4">
              <p className="text-muted-foreground text-sm">
                Each word of the mantra, displayed for study. Tap a word to hear it.
              </p>
            </div>

            {/* Full mantra text for reference */}
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-center">
              <p className="text-lg font-sanskrit text-foreground/60 whitespace-pre-line leading-relaxed">
                {mantra.sanskrit}
              </p>
            </div>
            
            {/* Word-by-word grid */}
            <div className="flex flex-wrap gap-3 justify-center">
              {getMantraWords().map((word, i) => (
                <motion.button
                  key={i}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handlePlaySyllable(mantra.syllables[i])}
                  className="group flex flex-col items-center gap-1.5 p-3 rounded-xl bg-white/5 border border-white/10 hover:border-primary/40 hover:bg-primary/5 transition-all min-w-[80px]"
                >
                  <span className="text-xl font-sanskrit text-foreground group-hover:text-primary transition-colors">
                    {word.original}
                  </span>
                  <span className="text-xs text-primary/70 font-mono">
                    {word.transliteration}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {word.pronunciation}
                  </span>
                </motion.button>
              ))}
            </div>

            <div className="text-center text-xs text-muted-foreground">
              {mantra.syllables.length} words • Tap any word to hear pronunciation
            </div>
          </div>
        );

      case 'speak':
        return (
          <div className="space-y-6">
            <div className="text-center mb-4">
              <p className="text-muted-foreground text-sm">
                Practice speaking each word with microphone feedback.
              </p>
              <p className="text-xs text-muted-foreground/70 mt-1">
                Word {currentSyllableIndex + 1} of {mantra.syllables.length}
              </p>
            </div>

            <PronunciationFeedback
              expectedText={mantra.syllables[currentSyllableIndex]?.text || ''}
              expectedTransliteration={mantra.syllables[currentSyllableIndex]?.transliteration || ''}
              onSuccess={() => handleSyllableComplete(currentSyllableIndex)}
              onPlayReference={() => handlePlaySyllable(mantra.syllables[currentSyllableIndex])}
            />

            {/* Progress */}
            <div className="flex gap-1 justify-center flex-wrap">
              {mantra.syllables.map((_, i) => (
                <div
                  key={i}
                  className={`
                    w-2 h-2 rounded-full transition-all
                    ${completedSyllables.includes(i) 
                      ? 'bg-emerald-500' 
                      : i === currentSyllableIndex 
                        ? 'bg-primary w-4' 
                        : 'bg-white/20'
                    }
                  `}
                />
              ))}
            </div>

            {/* Skip / Manual Complete */}
            <div className="flex items-center justify-center gap-4 pt-4">
              <button
                onClick={() => {
                  if (currentSyllableIndex > 0) {
                    setCurrentSyllableIndex(currentSyllableIndex - 1);
                  }
                }}
                disabled={currentSyllableIndex === 0}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
              >
                ← Previous word
              </button>
              <button
                onClick={() => handleSyllableComplete(currentSyllableIndex)}
                className="text-xs text-primary/70 hover:text-primary transition-colors"
              >
                Skip this word →
              </button>
            </div>
          </div>
        );

      case 'info':
        return (
          <div className="space-y-6">
            <div className="p-6 rounded-xl bg-white/5 border border-white/10">
              <h4 className="font-display text-sm tracking-wider text-muted-foreground mb-2">
                MEANING
              </h4>
              <p className="text-foreground leading-relaxed">{mantra.meaning}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
                <h4 className="font-display text-xs tracking-wider text-primary mb-2">
                  PURPOSE
                </h4>
                <p className="text-sm text-foreground/80">{mantra.purpose}</p>
              </div>

              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <h4 className="font-display text-xs tracking-wider text-amber-400 mb-2">
                  WHEN TO CHANT
                </h4>
                <p className="text-sm text-foreground/80">{mantra.whenToChant}</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-violet-500/10 border border-violet-500/20">
              <h4 className="font-display text-xs tracking-wider text-violet-400 mb-2">
                MENTAL FOCUS
              </h4>
              <p className="text-sm text-foreground/80">{mantra.mentalFocus}</p>
            </div>
          </div>
        );

      case 'japa':
        return (
          <div className="space-y-6">
            {/* Repetition Target Selection */}
            <div className="text-center mb-4">
              <p className="text-muted-foreground text-sm mb-4">
                Choose your japa count
              </p>
              <div className="flex items-center justify-center gap-2 flex-wrap">
                {mantra.recommendedReps.map((reps) => (
                  <button
                    key={reps}
                    onClick={() => {
                      setSelectedReps(reps);
                      setCurrentReps(0);
                    }}
                    className={`
                      px-4 py-2 rounded-full border transition-all text-sm
                      ${selectedReps === reps 
                        ? 'bg-primary/20 border-primary/50 text-primary' 
                        : 'bg-white/5 border-white/10 text-muted-foreground hover:bg-white/10'
                      }
                    `}
                  >
                    {reps}×
                  </button>
                ))}
              </div>
            </div>

            <RepetitionCounter
              targetReps={selectedReps}
              currentReps={currentReps}
              onIncrement={() => setCurrentReps(prev => prev + 1)}
              onReset={() => setCurrentReps(0)}
              onComplete={handleRepetitionComplete}
            />

            {/* Full Mantra for Reference */}
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-center">
              <p className="text-xs text-muted-foreground mb-2">Chant</p>
              <p className="text-lg font-sanskrit text-foreground whitespace-pre-line">{mantra.sanskrit}</p>
              <button
                onClick={handlePlayFullMantra}
                className="mt-3 text-xs text-primary/70 hover:text-primary transition-colors flex items-center gap-1 mx-auto"
              >
                <Volume2 className="w-3 h-3" />
                Play Reference
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back to Library</span>
        </button>

        <h2 className="font-display text-2xl text-foreground mb-2">{mantra.name}</h2>
        <p className="text-sm text-muted-foreground">{mantra.category} • {mantra.durationMinutes} min</p>
      </div>

      {/* Step Indicator */}
      <div className="mb-8">
        <LearningStep
          steps={STEPS}
          currentStep={currentStep}
          onStepClick={setCurrentStep}
        />
      </div>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="mb-8"
        >
          {renderStepContent()}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-4 border-t border-white/10">
        <button
          onClick={handlePrevStep}
          disabled={currentStep === 0}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/10 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Previous
        </button>

        <span className="text-xs text-muted-foreground">
          Step {currentStep + 1} of {STEPS.length}
        </span>

        <button
          onClick={handleNextStep}
          disabled={currentStep === STEPS.length - 1}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 border border-primary/50 text-primary text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/30 transition-colors"
        >
          Next
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default MantraLesson;
