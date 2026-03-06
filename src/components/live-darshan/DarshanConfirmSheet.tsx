import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import type { LiveTemple } from '@/data/liveDarshanTemples';
import { openLiveDarshan } from '@/lib/openLiveDarshan';

interface Props {
  temple: LiveTemple | null;
  onClose: () => void;
}

const SKIP_KEY = 'dhyaan_darshan_skip_confirm';

export function shouldSkipConfirm() {
  return localStorage.getItem(SKIP_KEY) === 'true';
}

export default function DarshanConfirmSheet({ temple, onClose }: Props) {
  const [dontShow, setDontShow] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (!temple) return;
    timerRef.current = setTimeout(onClose, 10000);
    return () => clearTimeout(timerRef.current);
  }, [temple, onClose]);

  const handleJoin = () => {
    if (!temple) return;
    if (dontShow) localStorage.setItem(SKIP_KEY, 'true');
    openLiveDarshan(temple);
    onClose();
  };

  return (
    <AnimatePresence>
      {temple && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1100] bg-black/50"
            onClick={onClose}
          />

          {/* Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-[1100] bg-[#F5F0EA] dark:bg-[#1C1917] rounded-t-3xl p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))]"
          >
            <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5">
              <X className="w-5 h-5 text-[#5C5145] dark:text-[#E9E2D9]" />
            </button>

            <p className="text-2xl mb-0.5">🛕</p>
            <h3 className="text-lg font-bold text-[#3C2F1F] dark:text-[#E9E2D9]">{temple.name}</h3>
            <p className="text-sm text-[#9C8C7C] mb-4">{temple.subtitle}</p>

            <p className="text-sm text-[#5C5145] dark:text-[#E9E2D9]/80 mb-5">
              You are about to join the live darshan. This will open YouTube.
            </p>

            <label className="flex items-center gap-2 mb-5 cursor-pointer text-xs text-[#9C8C7C]">
              <input
                type="checkbox"
                checked={dontShow}
                onChange={(e) => setDontShow(e.target.checked)}
                className="rounded accent-[hsl(38_60%_55%)]"
              />
              Don't show this again
            </label>

            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 h-12 rounded-xl text-sm font-medium text-[#5C5145] dark:text-[#9C8C7C] bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleJoin}
                className="flex-1 h-12 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-[hsl(38_60%_48%)] to-[hsl(38_70%_58%)] hover:brightness-110 transition-all flex items-center justify-center gap-2"
              >
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                Join Live Darshan
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
