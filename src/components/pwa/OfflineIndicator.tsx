import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff, Wifi, CloudOff } from 'lucide-react';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';
import { useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

export const OfflineIndicator = () => {
  const { isOnline, wasOffline } = useNetworkStatus();
  const { trigger } = useHapticFeedback();
  const { t } = useLanguage();

  useEffect(() => {
    if (!isOnline) {
      trigger('warning');
    } else if (wasOffline) {
      trigger('success');
    }
  }, [isOnline, wasOffline, trigger]);

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ opacity: 0, y: -100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -100 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed top-0 left-0 right-0 z-[9998] safe-top"
        >
          <div 
            className="flex items-center justify-center gap-3 py-3 px-4 backdrop-blur-xl"
            style={{
              background: 'linear-gradient(135deg, hsl(var(--destructive) / 0.9), hsl(var(--destructive) / 0.8))',
              boxShadow: '0 4px 20px hsl(var(--destructive) / 0.3)',
            }}
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [1, 0.7, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            >
              <WifiOff className="w-5 h-5 text-white" />
            </motion.div>
            <span className="font-body text-sm text-white font-medium">
              {t('pwa.youreOffline')}
            </span>
            <span className="text-white/70 text-xs hidden sm:inline">
              {t('pwa.featuresLimited')}
            </span>
          </div>
        </motion.div>
      )}

      {isOnline && wasOffline && (
        <motion.div
          initial={{ opacity: 0, y: -100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -100 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed top-0 left-0 right-0 z-[9998] safe-top"
        >
          <div 
            className="flex items-center justify-center gap-3 py-3 px-4 backdrop-blur-xl"
            style={{
              background: 'linear-gradient(135deg, hsl(142 76% 36% / 0.9), hsl(142 76% 36% / 0.8))',
              boxShadow: '0 4px 20px hsl(142 76% 36% / 0.3)',
            }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', damping: 10, stiffness: 300 }}
            >
              <Wifi className="w-5 h-5 text-white" />
            </motion.div>
            <span className="font-body text-sm text-white font-medium">
              {t('pwa.backOnline')}
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export const OfflineChip = () => {
  const { isOnline } = useNetworkStatus();
  const { t } = useLanguage();

  if (isOnline) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs"
      style={{
        background: 'hsl(var(--destructive) / 0.15)',
        border: '1px solid hsl(var(--destructive) / 0.3)',
        color: 'hsl(var(--destructive))',
      }}
    >
      <CloudOff className="w-3 h-3" />
      <span className="font-body">{t('pwa.offline')}</span>
    </motion.div>
  );
};
