import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Copy, Bookmark, RotateCcw, ChevronDown, ChevronUp, Trash2, Share2, MessageCircle, Download, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/backend/client';
import { toast } from '@/hooks/use-toast';
import BottomNav from '@/components/BottomNav';
import PageTransition from '@/components/PageTransition';

/* ═══ Types ═══ */
interface KrishnaVerse {
  chapter: number;
  number: number;
  sanskrit: string;
  translation: string;
  meaning: string;
}

interface KrishnaResponse {
  greeting: string;
  guidance: string;
  verse: KrishnaVerse;
  closing: string;
}

interface Exchange {
  question: string;
  response: KrishnaResponse;
  timestamp: number;
}

interface SavedGuidance {
  id: string;
  question: string;
  guidance: string;
  verse_chapter: number;
  verse_number: number;
  created_at: string;
}

/* ═══ Daily Verses ═══ */
const DAILY_VERSES = [
  { chapter: 2, verse: 47, text: "You have the right to perform your duties, but never to the fruits." },
  { chapter: 6, verse: 5, text: "Elevate yourself through your own mind, not degrade yourself." },
  { chapter: 2, verse: 14, text: "The contacts between the senses and objects give rise to heat and cold. They are transient — endure them." },
  { chapter: 18, verse: 66, text: "Surrender unto Me alone. I shall deliver you from all sinful reactions; do not fear." },
  { chapter: 4, verse: 7, text: "Whenever righteousness wanes, I manifest myself to restore dharma." },
  { chapter: 3, verse: 27, text: "All actions are performed by the modes of nature, but the fool thinks himself the doer." },
  { chapter: 9, verse: 22, text: "For those who worship Me with devotion, I carry what they lack and preserve what they have." },
];

const QUICK_CHIPS = [
  { emoji: '😰', text: "I'm feeling anxious" },
  { emoji: '💔', text: "I'm heartbroken" },
  { emoji: '😤', text: "I'm very angry" },
  { emoji: '😕', text: "I feel lost in life" },
  { emoji: '💼', text: "Work stress is too much" },
  { emoji: '🤔', text: "What is my purpose?" },
];

const SESSION_KEY = 'krishna_ai_session';
const SESSION_MAX_AGE = 30 * 60 * 1000; // 30 min

function loadSession(): Exchange[] {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return [];
    const data = JSON.parse(raw);
    if (Date.now() - (data.timestamp || 0) > SESSION_MAX_AGE) {
      localStorage.removeItem(SESSION_KEY);
      return [];
    }
    return data.exchanges || [];
  } catch { return []; }
}

function saveSession(exchanges: Exchange[]) {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify({ exchanges, timestamp: Date.now() }));
  } catch {}
}

/* ═══ Page Component ═══ */
const MyKrishna = () => {
  const navigate = useNavigate();
  const [question, setQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [exchanges, setExchanges] = useState<Exchange[]>(loadSession);
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);
  const [savedList, setSavedList] = useState<SavedGuidance[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const dailyVerse = DAILY_VERSES[new Date().getDate() % DAILY_VERSES.length];
  const showChips = question.length === 0 && exchanges.length === 0;

  // Auth
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setUserId(data.session?.user?.id ?? null));
  }, []);

  // Load saved guidance
  useEffect(() => {
    if (!userId) return;
    supabase.from('saved_krishna_guidance').select('id, question, guidance, verse_chapter, verse_number, created_at')
      .eq('user_id', userId).order('created_at', { ascending: false }).limit(3)
      .then(({ data }) => { if (data) setSavedList(data); });
  }, [userId]);

  // Auto-resize textarea
  const handleInput = useCallback((val: string) => {
    if (val.length <= 500) setQuestion(val);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const max = 8 * 24; // ~8 rows
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, max) + 'px';
    }
  }, []);

  const askKrishna = async () => {
    if (!question.trim() || isLoading) return;
    setIsLoading(true);

    const history = exchanges.slice(-5).map(e => ({
      question: e.question,
      greeting: e.response.greeting,
      guidance: e.response.guidance,
      verse: e.response.verse,
      closing: e.response.closing,
    }));

    try {
      const { data, error } = await supabase.functions.invoke('krishna-ai', {
        body: { question: question.trim(), history },
      });

      if (error) throw error;

      // Handle rate limit / payment errors
      if (data?.error) {
        toast({ title: 'Krishna says...', description: data.error, variant: 'destructive' });
        setIsLoading(false);
        return;
      }

      const response: KrishnaResponse = data;
      const newExchange: Exchange = { question: question.trim(), response, timestamp: Date.now() };
      const updated = [...exchanges, newExchange].slice(-3);
      setExchanges(updated);
      saveSession(updated);
      setQuestion('');
      if (textareaRef.current) textareaRef.current.style.height = 'auto';

      // Scroll to result
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 300);
    } catch (err) {
      console.error('Krishna AI error:', err);
      toast({ title: 'Unable to reach Krishna', description: 'Please try again in a moment.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const copyGuidance = (exchange: Exchange) => {
    const text = `${exchange.response.greeting}\n\n${exchange.response.guidance}\n\n📖 Bhagavad Gita · Chapter ${exchange.response.verse.chapter}, Verse ${exchange.response.verse.number}\n${exchange.response.verse.translation}\n\n${exchange.response.closing}`;
    navigator.clipboard.writeText(text);
    toast({ title: 'Copied to clipboard 📋' });
  };

  const saveGuidance = async (exchange: Exchange) => {
    if (!userId) {
      toast({ title: 'Please sign in to save guidance', variant: 'destructive' });
      return;
    }
    const { error } = await supabase.from('saved_krishna_guidance').insert({
      user_id: userId,
      question: exchange.question,
      greeting: exchange.response.greeting,
      guidance: exchange.response.guidance,
      verse_chapter: exchange.response.verse.chapter,
      verse_number: exchange.response.verse.number,
      verse_sanskrit: exchange.response.verse.sanskrit,
      verse_translation: exchange.response.verse.translation,
      verse_meaning: exchange.response.verse.meaning,
      closing: exchange.response.closing,
    });
    if (error) {
      toast({ title: 'Could not save', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Guidance saved 🔖' });
      // Refresh saved list
      const { data } = await supabase.from('saved_krishna_guidance').select('id, question, guidance, verse_chapter, verse_number, created_at')
        .eq('user_id', userId).order('created_at', { ascending: false }).limit(3);
      if (data) setSavedList(data);
    }
  };

  const clearHistory = () => {
    setExchanges([]);
    localStorage.removeItem(SESSION_KEY);
  };

  return (
    <PageTransition>
      <div className="min-h-screen relative" style={{ background: 'linear-gradient(180deg, #060D1F 0%, #0D1B3E 40%, #060D1F 100%)' }}>
        {/* Floating particles */}
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full pointer-events-none"
            style={{
              background: '#F5C842',
              opacity: 0.15,
              top: `${15 + i * 18}%`,
              left: `${10 + i * 20}%`,
            }}
            animate={{ y: [-10, 10, -10], opacity: [0.1, 0.2, 0.1] }}
            transition={{ duration: 4 + i, repeat: Infinity, ease: 'easeInOut' }}
          />
        ))}

        {/* Header */}
        <header className="relative overflow-hidden" style={{ background: 'linear-gradient(160deg, #0D1B3E 0%, #1A2F5A 100%)' }}>
          {/* Peacock watermark */}
          <span className="absolute inset-0 flex items-center justify-center text-[120px] opacity-[0.06] pointer-events-none select-none">🦚</span>

          <div className="relative z-10 px-4 pt-4 pb-5">
            <button onClick={() => navigate(-1)} className="w-11 h-11 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors mb-2">
              <ArrowLeft className="w-5 h-5" style={{ color: '#93B4E8' }} />
            </button>
            <div className="text-center">
              <span className="text-3xl mb-1 block">🪷</span>
              <h1 className="text-[22px] font-bold" style={{ color: '#F5C842' }}>My Krishna AI</h1>
              <p className="text-[13px] italic mt-1" style={{ color: '#93B4E8' }}>Seeking answers in the light of the Gita 🙏</p>
            </div>
          </div>
        </header>

        <main className="px-4 pt-5 pb-28 max-w-[640px] mx-auto space-y-5">

          {/* Daily Verse */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl p-4"
            style={{ background: 'rgba(245,200,66,0.04)', border: '1px solid rgba(245,200,66,0.15)' }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] uppercase tracking-[1.5px] font-semibold" style={{ color: '#F5C842' }}>🌅 Today's Verse</span>
              <span className="text-[11px]" style={{ color: '#93B4E8' }}>Chapter {dailyVerse.chapter} · Verse {dailyVerse.verse}</span>
            </div>
            <p className="text-[13px] italic leading-relaxed" style={{ color: '#D4B483' }}>{dailyVerse.text}</p>
          </motion.div>

          {/* Intro Quote (show once, before any exchanges) */}
          {exchanges.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-2xl p-5 text-center"
              style={{ background: 'rgba(245,200,66,0.06)', border: '1px solid rgba(245,200,66,0.2)' }}
            >
              <span className="text-[28px] block mb-3">🪷</span>
              <p className="text-[14px] italic leading-relaxed" style={{ color: '#D4B483' }}>
                "Whenever dharma declines and the purpose of life is forgotten, I manifest myself on earth."
              </p>
              <p className="text-[11px] mt-3" style={{ color: '#7A9CC4' }}>— Bhagavad Gita 4.7</p>
            </motion.div>
          )}

          {/* Conversation History */}
          {exchanges.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] uppercase tracking-[1.5px] font-semibold" style={{ color: '#93B4E8' }}>Previous Guidance</span>
                <button onClick={clearHistory} className="flex items-center gap-1 text-[11px] hover:opacity-80 transition-opacity" style={{ color: '#5A7A9C' }}>
                  <Trash2 className="w-3 h-3" /> Clear All
                </button>
              </div>
              {exchanges.map((ex, idx) => (
                <div key={idx} ref={idx === exchanges.length - 1 ? resultRef : undefined}>
                  {/* Compact view for older exchanges */}
                  {idx < exchanges.length - 1 ? (
                    <motion.button
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      onClick={() => setExpandedIdx(expandedIdx === idx ? null : idx)}
                      className="w-full text-left rounded-xl p-3 transition-colors"
                      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(147,180,232,0.15)' }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-[12px] truncate" style={{ color: '#93B4E8' }}>{ex.question}</p>
                          <p className="text-[10px] mt-0.5" style={{ color: '#5A7A9C' }}>· Gita {ex.response.verse.chapter}.{ex.response.verse.number}</p>
                        </div>
                        {expandedIdx === idx ? <ChevronUp className="w-4 h-4 shrink-0" style={{ color: '#5A7A9C' }} /> : <ChevronDown className="w-4 h-4 shrink-0" style={{ color: '#5A7A9C' }} />}
                      </div>
                      <AnimatePresence>
                        {expandedIdx === idx && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <ResponseCard exchange={ex} onCopy={copyGuidance} onSave={saveGuidance} compact />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.button>
                  ) : (
                    /* Full response card for latest exchange */
                    <ResponseCard exchange={ex} onCopy={copyGuidance} onSave={saveGuidance} onAskAnother={() => { setQuestion(''); textareaRef.current?.focus(); }} />
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Input Section */}
          <div className="space-y-3">
            <p className="text-[15px]" style={{ color: '#D4B483' }}>What weighs on your heart, dear soul? 🙏</p>

            <div className="relative">
              <textarea
                ref={textareaRef}
                value={question}
                onChange={(e) => handleInput(e.target.value)}
                placeholder={"Share your problem, doubt, fear, or question...\nKrishna listens to all who seek with a pure heart."}
                rows={5}
                maxLength={500}
                aria-label="Ask Krishna your question"
                className="w-full resize-none rounded-2xl p-4 text-[14px] leading-relaxed transition-all duration-200 outline-none"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1.5px solid rgba(245,200,66,0.2)',
                  color: '#E8DCC8',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(245,200,66,0.6)';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(245,200,66,0.08)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(245,200,66,0.2)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
              {question.length > 400 && (
                <span className="absolute bottom-3 right-3 text-[11px]" style={{ color: '#D4B483' }}>
                  {question.length}/500
                </span>
              )}
            </div>

            {/* Quick Chips */}
            <AnimatePresence>
              {showChips && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide"
                >
                  {QUICK_CHIPS.map((chip) => (
                    <button
                      key={chip.text}
                      onClick={() => handleInput(chip.text)}
                      className="shrink-0 px-3 py-2 rounded-[20px] text-[12px] transition-all duration-150 hover:-translate-y-0.5 active:scale-95"
                      style={{
                        background: 'rgba(245,200,66,0.06)',
                        border: '1px solid rgba(245,200,66,0.2)',
                        color: '#93B4E8',
                      }}
                    >
                      {chip.emoji} {chip.text}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Ask Button / Loading */}
            {isLoading ? (
              <div className="flex flex-col items-center py-4 gap-3">
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                  className="text-3xl"
                >🪷</motion.span>
                <p className="text-[14px] italic" style={{ color: '#D4B483' }}>Krishna is reflecting...</p>
                <div className="flex gap-1.5">
                  {[0, 1, 2].map(i => (
                    <motion.div
                      key={i}
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ background: '#F5C842' }}
                      animate={{ y: [-3, 3, -3] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <button
                onClick={askKrishna}
                disabled={!question.trim()}
                className="w-full h-[52px] rounded-[14px] text-[16px] font-bold tracking-[0.5px] transition-all duration-200"
                style={{
                  background: question.trim() ? 'linear-gradient(135deg, #1A3A6B 0%, #2E5FA3 50%, #1A3A6B 100%)' : 'rgba(26,58,107,0.4)',
                  border: '1px solid rgba(245,200,66,0.4)',
                  color: '#F5C842',
                  boxShadow: question.trim() ? '0 4px 20px rgba(26,58,107,0.5)' : 'none',
                  opacity: question.trim() ? 1 : 0.5,
                  cursor: question.trim() ? 'pointer' : 'not-allowed',
                }}
              >
                🪷  Ask Krishna
              </button>
            )}
          </div>

          {/* Saved Guidance Section */}
          {savedList.length > 0 && (
            <div className="space-y-3 pt-4" style={{ borderTop: '1px solid rgba(245,200,66,0.1)' }}>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[13px] font-semibold" style={{ color: '#F5C842' }}>🔖 Saved Guidance</span>
                  <p className="text-[11px] mt-0.5" style={{ color: '#5A7A9C' }}>Revisit Krishna's wisdom anytime</p>
                </div>
              </div>
              {savedList.map((saved) => (
                <div
                  key={saved.id}
                  className="rounded-xl p-3"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(147,180,232,0.12)' }}
                >
                  <p className="text-[12px] truncate" style={{ color: '#E8DCC8' }}>{saved.question}</p>
                  <div className="flex items-center justify-between mt-1.5">
                    <span className="text-[10px]" style={{ color: '#93B4E8' }}>Chapter {saved.verse_chapter} · Verse {saved.verse_number}</span>
                    <span className="text-[10px]" style={{ color: '#5A7A9C' }}>{new Date(saved.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty saved state */}
          {savedList.length === 0 && userId && exchanges.length > 0 && (
            <div className="text-center py-4">
              <p className="text-[12px] italic" style={{ color: '#5A7A9C' }}>Your saved guidance will appear here 🪷</p>
            </div>
          )}
        </main>

        <BottomNav />
      </div>
    </PageTransition>
  );
};

/* ═══ Response Card ═══ */
function ResponseCard({
  exchange,
  onCopy,
  onSave,
  onAskAnother,
  compact,
}: {
  exchange: Exchange;
  onCopy: (e: Exchange) => void;
  onSave: (e: Exchange) => void;
  onAskAnother?: () => void;
  compact?: boolean;
}) {
  const { response } = exchange;
  const pad = compact ? 'p-3 mt-3' : 'p-6';

  return (
    <motion.div
      initial={compact ? {} : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      role="article"
      aria-label="Krishna's guidance"
      className={`rounded-[20px] ${pad}`}
      style={{
        background: 'linear-gradient(160deg, rgba(13,27,62,0.95) 0%, rgba(26,47,90,0.95) 100%)',
        border: '1px solid rgba(245,200,66,0.3)',
        boxShadow: compact ? 'none' : '0 8px 40px rgba(0,0,0,0.4), 0 0 60px rgba(245,200,66,0.05)',
      }}
    >
      {/* Title */}
      {!compact && (
        <div className="flex items-center gap-2 mb-4">
          <span className="text-lg">🪷</span>
          <span className="text-[14px] font-bold" style={{ color: '#F5C842' }}>Krishna's Guidance</span>
        </div>
      )}

      {/* Greeting */}
      <p className="text-[13px] italic mb-3" style={{ color: '#93B4E8' }}>{response.greeting}</p>

      {/* Guidance */}
      <p className="text-[15px] leading-[1.8] mb-5" style={{ color: '#E8DCC8' }}>{response.guidance}</p>

      {/* Divider */}
      <div className="mb-4" style={{ borderTop: '1px solid rgba(245,200,66,0.15)' }} />

      {/* Verse */}
      <div className="mb-5">
        <p className="text-[11px] uppercase tracking-[1.5px] mb-3 font-semibold" style={{ color: '#F5C842' }}>
          📖 Bhagavad Gita · Chapter {response.verse.chapter}, Verse {response.verse.number}
        </p>

        {response.verse.sanskrit && (
          <div className="rounded-r-lg mb-3 py-2.5 px-3.5" style={{ background: 'rgba(245,200,66,0.04)', borderLeft: '3px solid #F5C842' }}>
            <p className="text-[14px] italic" style={{ color: '#D4B483' }}>❝ {response.verse.sanskrit} ❞</p>
          </div>
        )}

        <p className="text-[14px] leading-[1.7] mb-2" style={{ color: '#B8C8D8' }}>{response.verse.translation}</p>

        {response.verse.meaning && (
          <p className="text-[13px] italic leading-relaxed" style={{ color: '#7A9CC4' }}>{response.verse.meaning}</p>
        )}
      </div>

      {/* Closing */}
      <div className="text-center pt-4" style={{ borderTop: '1px solid rgba(245,200,66,0.1)' }}>
        <p className="text-[14px] italic" style={{ color: '#F5C842' }}>✨ {response.closing}</p>
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-5 justify-center">
        {onAskAnother && (
          <button
            onClick={onAskAnother}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[12px] transition-all hover:border-[rgba(245,200,66,0.5)]"
            style={{ border: '1px solid rgba(245,200,66,0.25)', color: '#93B4E8' }}
          >
            <RotateCcw className="w-3.5 h-3.5" /> Ask Another
          </button>
        )}
        <button
          onClick={() => onCopy(exchange)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[12px] transition-all hover:border-[rgba(245,200,66,0.5)]"
          style={{ border: '1px solid rgba(245,200,66,0.25)', color: '#93B4E8' }}
        >
          <Copy className="w-3.5 h-3.5" /> Copy
        </button>
        <button
          onClick={() => onSave(exchange)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[12px] transition-all hover:border-[rgba(245,200,66,0.5)]"
          style={{ border: '1px solid rgba(245,200,66,0.25)', color: '#93B4E8' }}
        >
          <Bookmark className="w-3.5 h-3.5" /> Save
        </button>
      </div>
    </motion.div>
  );
}

export default MyKrishna;
