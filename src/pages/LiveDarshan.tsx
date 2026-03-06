import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Bell, Landmark } from 'lucide-react';
import { LIVE_TEMPLES, type LiveTemple } from '@/data/liveDarshanTemples';
import LiveTempleCard from '@/components/live-darshan/LiveTempleCard';
import DarshanConfirmSheet, { shouldSkipConfirm } from '@/components/live-darshan/DarshanConfirmSheet';
import { openLiveDarshan } from '@/lib/openLiveDarshan';
import BottomNav from '@/components/BottomNav';
import PageTransition from '@/components/PageTransition';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';

const LiveDarshan = () => {
  const navigate = useNavigate();
  const [confirmTemple, setConfirmTemple] = useState<LiveTemple | null>(null);
  const isOnline = useNetworkStatus();

  const handleTap = useCallback((temple: LiveTemple) => {
    if (shouldSkipConfirm()) {
      openLiveDarshan(temple);
    } else {
      setConfirmTemple(temple);
    }
  }, []);

  return (
    <PageTransition>
      <div className="min-h-screen bg-[#F5F0EA] dark:bg-[#0C0A09]">
        {/* Header */}
        <header className="sticky top-0 z-[1000] h-16 md:h-[72px] flex items-center justify-between px-4 bg-[#E9E2D9]/95 dark:bg-[#1C1917]/95 backdrop-blur-xl border-b border-[#5C5145]/10 dark:border-[#E9E2D9]/10">
          <button
            onClick={() => navigate('/')}
            className="w-11 h-11 flex items-center justify-center rounded-full hover:bg-[#5C5145]/8 dark:hover:bg-[#E9E2D9]/6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-[#5C5145] dark:text-[#E9E2D9]" />
          </button>

          <div className="text-center">
            <h1 className="text-lg font-bold text-[#3C2F1F] dark:text-[#E9E2D9] tracking-wide">
              Live Darshan
            </h1>
          </div>

          <button className="w-11 h-11 flex items-center justify-center rounded-full hover:bg-[#5C5145]/8 dark:hover:bg-[#E9E2D9]/6 transition-colors">
            <Bell className="w-5 h-5 text-[#5C5145] dark:text-[#E9E2D9]" />
          </button>
        </header>

        {/* Subtitle */}
        <p className="text-center text-sm text-[#9C8C7C] italic pt-3 px-4">
          Join the sacred stream, live 🙏
        </p>

        <main className="px-4 pt-4 pb-28 md:pb-8 max-w-5xl mx-auto">
          {/* Info banner */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 p-3.5 rounded-xl border mb-6"
            style={{
              background: 'rgba(211,154,42,0.1)',
              borderColor: 'rgba(211,154,42,0.3)',
            }}
          >
            <Landmark className="w-5 h-5 text-[hsl(38_60%_55%)] shrink-0" />
            <div>
              <p className="text-sm font-medium text-[#3C2F1F] dark:text-[#E9E2D9]">
                {LIVE_TEMPLES.length} Temples · Streaming 24/7
              </p>
              <p className="text-xs text-[#9C8C7C]">
                Tap any temple to join live darshan
              </p>
            </div>
          </motion.div>

          {/* Offline state */}
          {!isOnline ? (
            <div className="text-center py-20">
              <p className="text-3xl mb-3">🛕</p>
              <p className="text-base font-medium text-[#3C2F1F] dark:text-[#E9E2D9]">No connection</p>
              <p className="text-sm text-[#9C8C7C] mt-1 mb-5">
                Please check your internet to join live darshan.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="px-5 py-2.5 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-[hsl(38_60%_48%)] to-[hsl(38_70%_58%)]"
              >
                Retry
              </button>
            </div>
          ) : (
            /* Temple cards grid */
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              {LIVE_TEMPLES.map((temple, i) => (
                <LiveTempleCard key={temple.id} temple={temple} index={i} onTap={handleTap} />
              ))}
            </div>
          )}
        </main>

        {/* Confirmation sheet */}
        <DarshanConfirmSheet temple={confirmTemple} onClose={() => setConfirmTemple(null)} />

        <BottomNav />
      </div>
    </PageTransition>
  );
};

export default LiveDarshan;
