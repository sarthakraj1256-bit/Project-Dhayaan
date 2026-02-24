import { motion } from 'framer-motion';
import { Download, Share, Plus, Check, Smartphone, Monitor, Chrome } from 'lucide-react';
import { Link } from 'react-router-dom';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';

const Install = () => {
  const { isInstallable, isInstalled, isIOS, isAndroid, isStandalone, install } = usePWAInstall();
  const { trigger } = useHapticFeedback();

  const handleInstall = async () => {
    trigger('button');
    const success = await install();
    if (success) {
      trigger('success');
    }
  };

  // Already installed
  if (isInstalled || isStandalone) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full text-center"
        >
          <div 
            className="w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, hsl(var(--gold) / 0.2), hsl(var(--gold) / 0.1))',
              border: '1px solid hsl(var(--gold) / 0.3)',
            }}
          >
            <Check className="w-10 h-10 text-gold" />
          </div>
          
          <h1 className="font-display text-3xl text-foreground mb-3">
            Already Installed!
          </h1>
          <p className="text-muted-foreground mb-6">
            Dhyaan is already installed on your device. Enjoy your spiritual journey.
          </p>
          
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-body text-sm font-medium transition-all duration-200 hover:scale-[1.02]"
            style={{
              background: 'linear-gradient(135deg, hsl(var(--gold)), hsl(var(--gold-dark)))',
              color: 'hsl(var(--void))',
            }}
          >
            Return Home
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl border-b border-white/5">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="font-display text-xl text-gold">
            Dhyaan
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto"
        >
          {/* Hero */}
          <div className="text-center mb-12">
            <div 
              className="w-24 h-24 mx-auto mb-6 rounded-3xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, hsl(var(--gold) / 0.3), hsl(var(--gold) / 0.1))',
                border: '1px solid hsl(var(--gold) / 0.3)',
                boxShadow: '0 8px 32px hsl(var(--gold) / 0.2)',
              }}
            >
              <span className="text-4xl">🕉️</span>
            </div>
            
            <h1 className="font-display text-4xl md:text-5xl text-foreground mb-4">
              Install Dhyaan
            </h1>
            <p className="text-lg text-muted-foreground max-w-md mx-auto">
              Add Dhyaan to your home screen for instant access to temple darshan, meditation, and spiritual practices.
            </p>
          </div>

          {/* Benefits */}
          <div className="grid md:grid-cols-3 gap-4 mb-12">
            {[
              { icon: '⚡', title: 'Instant Access', desc: 'Launch from home screen' },
              { icon: '📴', title: 'Works Offline', desc: 'Meditate anywhere' },
              { icon: '🔔', title: 'Notifications', desc: 'Never miss aarati times' },
            ].map((benefit, i) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="p-4 rounded-xl text-center"
                style={{
                  background: 'hsl(var(--void-light) / 0.5)',
                  border: '1px solid hsl(var(--gold) / 0.1)',
                }}
              >
                <span className="text-3xl mb-2 block">{benefit.icon}</span>
                <h3 className="font-display text-foreground mb-1">{benefit.title}</h3>
                <p className="text-sm text-muted-foreground">{benefit.desc}</p>
              </motion.div>
            ))}
          </div>

          {/* Install Instructions */}
          <div 
            className="rounded-2xl p-6 md:p-8"
            style={{
              background: 'linear-gradient(135deg, hsl(var(--void-light) / 0.8), hsl(var(--void) / 0.6))',
              border: '1px solid hsl(var(--gold) / 0.2)',
            }}
          >
            {/* Native install button for Android/Chrome */}
            {isInstallable && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mb-8 text-center"
              >
                <button
                  onClick={handleInstall}
                  className="inline-flex items-center gap-3 px-8 py-4 rounded-xl font-display text-lg font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                  style={{
                    background: 'linear-gradient(135deg, hsl(var(--gold)), hsl(var(--gold-dark)))',
                    color: 'hsl(var(--void))',
                    boxShadow: '0 8px 32px hsl(var(--gold) / 0.3)',
                  }}
                >
                  <Download className="w-6 h-6" />
                  Install Now
                </button>
                <p className="text-sm text-muted-foreground mt-3">
                  Click to add Dhyaan to your device
                </p>
              </motion.div>
            )}

            {/* iOS Instructions */}
            {isIOS && (
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <Smartphone className="w-6 h-6 text-gold" />
                  <h2 className="font-display text-xl text-foreground">
                    Install on iPhone/iPad
                  </h2>
                </div>
                
                <div className="space-y-4">
                  <Step number={1} icon={<Share className="w-5 h-5" />}>
                    Tap the <strong className="text-foreground">Share</strong> button in Safari's toolbar
                  </Step>
                  <Step number={2} icon={<Plus className="w-5 h-5" />}>
                    Scroll down and tap <strong className="text-foreground">Add to Home Screen</strong>
                  </Step>
                  <Step number={3} icon={<Check className="w-5 h-5" />}>
                    Tap <strong className="text-foreground">Add</strong> in the top right corner
                  </Step>
                </div>
              </div>
            )}

            {/* Android Instructions (fallback) */}
            {isAndroid && !isInstallable && (
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <Smartphone className="w-6 h-6 text-gold" />
                  <h2 className="font-display text-xl text-foreground">
                    Install on Android
                  </h2>
                </div>
                
                <div className="space-y-4">
                  <Step number={1} icon={<Chrome className="w-5 h-5" />}>
                    Open Chrome browser menu (three dots)
                  </Step>
                  <Step number={2} icon={<Plus className="w-5 h-5" />}>
                    Tap <strong className="text-foreground">Add to Home screen</strong>
                  </Step>
                  <Step number={3} icon={<Check className="w-5 h-5" />}>
                    Tap <strong className="text-foreground">Add</strong> to confirm
                  </Step>
                </div>
              </div>
            )}

            {/* Desktop Instructions */}
            {!isIOS && !isAndroid && !isInstallable && (
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <Monitor className="w-6 h-6 text-gold" />
                  <h2 className="font-display text-xl text-foreground">
                    Install on Desktop
                  </h2>
                </div>
                
                <div className="space-y-4">
                  <Step number={1} icon={<Chrome className="w-5 h-5" />}>
                    Look for the install icon in your browser's address bar
                  </Step>
                  <Step number={2} icon={<Download className="w-5 h-5" />}>
                    Click <strong className="text-foreground">Install</strong> when prompted
                  </Step>
                  <Step number={3} icon={<Check className="w-5 h-5" />}>
                    Dhyaan will open as a standalone app
                  </Step>
                </div>
              </div>
            )}
          </div>

          {/* Back link */}
          <div className="text-center mt-8">
            <Link
              to="/"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              ← Back to Home
            </Link>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

const Step = ({ number, icon, children }: { number: number; icon: React.ReactNode; children: React.ReactNode }) => (
  <div className="flex items-start gap-4">
    <div 
      className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
      style={{
        background: 'hsl(var(--gold) / 0.1)',
        border: '1px solid hsl(var(--gold) / 0.3)',
      }}
    >
      <span className="text-gold">{icon}</span>
    </div>
    <div className="flex-1 pt-2">
      <p className="text-muted-foreground">{children}</p>
    </div>
  </div>
);

export default Install;
