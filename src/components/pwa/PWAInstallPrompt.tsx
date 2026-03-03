import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Share, Plus, Smartphone } from 'lucide-react';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';
import { useLanguage } from '@/contexts/LanguageContext';

export const PWAInstallPrompt = () => {
  const { isInstallable, isIOS, install, dismiss } = usePWAInstall();
  const { trigger } = useHapticFeedback();
  const { t } = useLanguage();

  const handleInstall = async () => {
    trigger('button');
    const success = await install();
    if (success) {
      trigger('success');
    }
  };

  const handleDismiss = () => {
    trigger('light');
    dismiss();
  };

  if (isIOS && !window.matchMedia('(display-mode: standalone)').matches) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          className="fixed bottom-4 left-4 right-4 z-[60] md:left-auto md:right-6 md:max-w-sm"
        >
        <div 
            className="rounded-2xl p-4 backdrop-blur-xl"
            style={{
              background: 'linear-gradient(135deg, hsl(var(--void-light) / 0.95), hsl(var(--void) / 0.9))',
              border: '1px solid hsl(var(--gold) / 0.3)',
              boxShadow: '0 8px 32px hsl(var(--gold) / 0.15)',
            }}
          >
            <button 
              onClick={handleDismiss}
              className="absolute top-3 right-3 p-1 rounded-full hover:bg-white/10 transition-colors"
              aria-label={t('common.close')}
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>

            <div className="flex items-start gap-3">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{
                  background: 'linear-gradient(135deg, hsl(var(--gold) / 0.2), hsl(var(--gold) / 0.1))',
                  border: '1px solid hsl(var(--gold) / 0.3)',
                }}
              >
                <Smartphone className="w-6 h-6 text-gold" />
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="font-display text-lg text-foreground mb-1">
                  {t('pwa.installDhyaan')}
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                  {t('pwa.addHomeScreen')}
                </p>
                
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Share className="w-4 h-4 text-gold" />
                    <span>{t('pwa.tapShare')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Plus className="w-4 h-4 text-gold" />
                    <span>{t('pwa.selectAddHome')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    );
  }

  if (!isInstallable) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        className="fixed bottom-4 left-4 right-4 z-[60] md:left-auto md:right-6 md:max-w-sm"
      >
        <div 
          className="rounded-2xl p-4 backdrop-blur-xl"
          style={{
            background: 'linear-gradient(135deg, hsl(var(--void-light) / 0.95), hsl(var(--void) / 0.9))',
            border: '1px solid hsl(var(--gold) / 0.3)',
            boxShadow: '0 8px 32px hsl(var(--gold) / 0.15)',
          }}
        >
          <button 
            onClick={handleDismiss}
            className="absolute top-3 right-3 p-1 rounded-full hover:bg-white/10 transition-colors"
            aria-label={t('common.close')}
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>

          <div className="flex items-start gap-3">
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{
                background: 'linear-gradient(135deg, hsl(var(--gold) / 0.2), hsl(var(--gold) / 0.1))',
                border: '1px solid hsl(var(--gold) / 0.3)',
              }}
            >
              <Download className="w-6 h-6 text-gold" />
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-display text-lg text-foreground mb-1">
                {t('pwa.installDhyaan')}
              </h3>
              <p className="text-sm text-muted-foreground mb-3">
                {t('pwa.quickAccess')}
              </p>
              
              <div className="flex gap-2">
                <button
                  onClick={handleInstall}
                  className="flex-1 px-4 py-2 rounded-lg font-body text-sm font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                  style={{
                    background: 'linear-gradient(135deg, hsl(var(--gold)), hsl(var(--gold-dark)))',
                    color: 'hsl(var(--void))',
                  }}
                >
                  {t('pwa.installApp')}
                </button>
                <button
                  onClick={handleDismiss}
                  className="px-4 py-2 rounded-lg font-body text-sm text-muted-foreground hover:bg-white/5 transition-colors"
                >
                  {t('pwa.notNow')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
