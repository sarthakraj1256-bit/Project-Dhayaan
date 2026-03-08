import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/backend/client';
import { useLanguage } from '@/contexts/LanguageContext';

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

export default function KrishnaFloatingChat() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [exchanges, setExchanges] = useState<Exchange[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { language } = useLanguage();

  const scrollToBottom = useCallback(() => {
    setTimeout(() => scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' }), 100);
  }, []);

  useEffect(() => { if (open) setTimeout(() => inputRef.current?.focus(), 300); }, [open]);
  useEffect(scrollToBottom, [exchanges, scrollToBottom]);

  const askKrishna = async () => {
    const q = input.trim();
    if (!q || loading) return;
    setInput('');
    setLoading(true);

    try {
      const history = exchanges.slice(-5).map(e => ({
        question: e.question,
        greeting: e.response.greeting,
        guidance: e.response.guidance,
        verse: e.response.verse,
        closing: e.response.closing,
      }));

      const { data, error } = await supabase.functions.invoke('krishna-ai', {
        body: { question: q, history },
      });

      if (error) throw error;

      const response: KrishnaResponse = {
        greeting: data.greeting || '🙏',
        guidance: data.guidance || 'Seek within, dear soul.',
        verse: data.verse || { chapter: 2, number: 47, sanskrit: '', translation: '', meaning: '' },
        closing: data.closing || '🪷',
      };

      setExchanges(prev => [...prev, { question: q, response, timestamp: Date.now() }]);
    } catch {
      setExchanges(prev => [...prev, {
        question: q,
        response: {
          greeting: 'Beloved seeker 🙏',
          guidance: 'I am taking a moment of divine silence. Please try again shortly.',
          verse: { chapter: 18, number: 66, sanskrit: '', translation: '', meaning: '' },
          closing: 'I am always with you. 🪷',
        },
        timestamp: Date.now(),
      }]);
    } finally {
      setLoading(false);
    }
  };

  const chips = language === 'hi'
    ? ['मुझे शांति चाहिए', 'डर लगता है', 'मार्गदर्शन दो']
    : ['I feel lost', 'Give me peace', 'I am afraid'];

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setOpen(true)}
            className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-lg"
            style={{
              background: 'linear-gradient(135deg, #0D1B3E, #1A3A6B)',
              border: '2px solid rgba(245,200,66,0.4)',
              boxShadow: '0 4px 20px rgba(13,27,62,0.6), 0 0 20px rgba(245,200,66,0.15)',
            }}
            whileTap={{ scale: 0.9 }}
          >
            <span className="text-2xl">🪷</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-20 right-3 md:bottom-6 md:right-6 z-50 w-[calc(100vw-24px)] max-w-[380px] rounded-2xl overflow-hidden flex flex-col"
            style={{
              height: 'min(520px, 70dvh)',
              background: 'linear-gradient(180deg, #0D1B3E 0%, #0A1428 100%)',
              border: '1px solid rgba(245,200,66,0.2)',
              boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid rgba(245,200,66,0.15)' }}>
              <div className="flex items-center gap-2.5">
                <span className="text-xl">🪷</span>
                <div>
                  <h3 className="text-sm font-bold" style={{ color: '#F5C842' }}>My Krishna AI</h3>
                  <p className="text-[10px]" style={{ color: '#93B4E8' }}>
                    {language === 'hi' ? 'गीता का दिव्य मार्गदर्शन' : 'Divine guidance from the Gita'}
                  </p>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="p-1.5 rounded-full hover:bg-white/10 transition-colors">
                <X className="w-4 h-4" style={{ color: '#93B4E8' }} />
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-4" style={{ scrollbarWidth: 'thin' }}>
              {exchanges.length === 0 && !loading && (
                <div className="text-center pt-6 space-y-4">
                  <p className="text-sm" style={{ color: '#93B4E8' }}>
                    {language === 'hi' ? 'कृष्ण से अपना प्रश्न पूछें' : 'Ask Krishna your question'}
                  </p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {chips.map(c => (
                      <button
                        key={c}
                        onClick={() => { setInput(c); setTimeout(() => inputRef.current?.focus(), 50); }}
                        className="text-xs px-3 py-1.5 rounded-full transition-colors hover:bg-white/10"
                        style={{ color: '#D4B483', border: '1px solid rgba(212,180,131,0.3)' }}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {exchanges.map((ex, i) => (
                <div key={i} className="space-y-3">
                  {/* User message */}
                  <div className="flex justify-end">
                    <div className="max-w-[80%] px-3 py-2 rounded-2xl rounded-br-md text-sm"
                      style={{ background: 'rgba(245,200,66,0.15)', color: '#F5C842' }}>
                      {ex.question}
                    </div>
                  </div>
                  {/* Krishna response */}
                  <div className="space-y-2">
                    <p className="text-xs italic" style={{ color: '#D4B483' }}>{ex.response.greeting}</p>
                    <p className="text-sm leading-relaxed" style={{ color: '#E8E0D0' }}>{ex.response.guidance}</p>
                    {ex.response.verse.sanskrit && (
                      <div className="rounded-xl p-3 space-y-1.5" style={{ background: 'rgba(245,200,66,0.08)', border: '1px solid rgba(245,200,66,0.12)' }}>
                        <p className="text-xs font-medium" style={{ color: '#F5C842' }}>
                          Gita {ex.response.verse.chapter}.{ex.response.verse.number}
                        </p>
                        <p className="text-xs italic" style={{ color: '#D4B483' }}>{ex.response.verse.sanskrit}</p>
                        <p className="text-xs" style={{ color: '#93B4E8' }}>{ex.response.verse.translation}</p>
                      </div>
                    )}
                    <p className="text-xs" style={{ color: '#D4B483' }}>{ex.response.closing}</p>
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex items-center gap-2 py-2">
                  <Loader2 className="w-4 h-4 animate-spin" style={{ color: '#F5C842' }} />
                  <span className="text-xs" style={{ color: '#93B4E8' }}>
                    {language === 'hi' ? 'कृष्ण विचार कर रहे हैं...' : 'Krishna is contemplating...'}
                  </span>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="px-3 pb-3 pt-2" style={{ borderTop: '1px solid rgba(245,200,66,0.1)' }}>
              <div className="flex items-end gap-2 rounded-xl px-3 py-2" style={{ background: 'rgba(255,255,255,0.06)' }}>
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value.slice(0, 500))}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); askKrishna(); } }}
                  placeholder={language === 'hi' ? 'अपना प्रश्न पूछें...' : 'Ask your question...'}
                  rows={1}
                  className="flex-1 bg-transparent text-sm resize-none outline-none placeholder:text-white/30"
                  style={{ color: '#E8E0D0', fontSize: '16px', maxHeight: '80px' }}
                  enterKeyHint="send"
                />
                <button
                  onClick={askKrishna}
                  disabled={!input.trim() || loading}
                  className="p-2 rounded-full transition-colors disabled:opacity-30"
                  style={{ background: input.trim() ? 'rgba(245,200,66,0.2)' : 'transparent' }}
                >
                  <Send className="w-4 h-4" style={{ color: '#F5C842' }} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
