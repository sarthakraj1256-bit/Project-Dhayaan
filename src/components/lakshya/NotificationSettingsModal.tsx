import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bell, BellOff, Settings, TestTube, Clock, Heart } from 'lucide-react';
import { useGardenNotifications } from '@/hooks/useGardenNotifications';

interface NotificationSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationSettingsModal = ({ isOpen, onClose }: NotificationSettingsModalProps) => {
  const {
    permission,
    settings,
    isSupported,
    toggleNotifications,
    updateSettings,
    sendTestNotification,
  } = useGardenNotifications();

  const [localThreshold, setLocalThreshold] = useState(settings.healthThreshold);
  const [localInterval, setLocalInterval] = useState(settings.checkInterval);

  if (!isOpen) return null;

  const handleSaveSettings = () => {
    updateSettings({
      healthThreshold: localThreshold,
      checkInterval: localInterval,
    });
    onClose();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-gradient-to-br from-[#1a1a2e] to-[#16213e] rounded-2xl max-w-md w-full overflow-hidden border border-white/10"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-amber-400" />
              <h2 className="font-display text-lg text-foreground">Notification Settings</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>

          {/* Content */}
          <div className="p-4 space-y-6">
            {!isSupported ? (
              <div className="text-center py-8">
                <BellOff className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">
                  Notifications are not supported in this browser.
                </p>
              </div>
            ) : (
              <>
                {/* Enable/Disable Toggle */}
                <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-3">
                    {settings.enabled ? (
                      <Bell className="w-5 h-5 text-amber-400" />
                    ) : (
                      <BellOff className="w-5 h-5 text-muted-foreground" />
                    )}
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        Plant Care Reminders
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Get notified when plants need water
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={toggleNotifications}
                    className={`
                      relative w-12 h-6 rounded-full transition-colors
                      ${settings.enabled ? 'bg-amber-500' : 'bg-white/20'}
                    `}
                  >
                    <motion.div
                      animate={{ x: settings.enabled ? 24 : 2 }}
                      className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-md"
                    />
                  </button>
                </div>

                {/* Permission Status */}
                {permission === 'denied' && (
                  <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30">
                    <p className="text-xs text-red-400">
                      ⚠️ Notifications are blocked. Please enable them in your browser settings.
                    </p>
                  </div>
                )}

                {/* Settings (only show if enabled) */}
                {settings.enabled && permission === 'granted' && (
                  <div className="space-y-4">
                    {/* Health Threshold */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-foreground">
                        <Heart className="w-4 h-4 text-rose-400" />
                        <span>Health Threshold</span>
                        <span className="ml-auto text-amber-400">{localThreshold}%</span>
                      </div>
                      <input
                        type="range"
                        min="20"
                        max="80"
                        step="10"
                        value={localThreshold}
                        onChange={(e) => setLocalThreshold(Number(e.target.value))}
                        className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer accent-amber-500"
                      />
                      <p className="text-xs text-muted-foreground">
                        Notify when plant health drops below {localThreshold}%
                      </p>
                    </div>

                    {/* Check Interval */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-foreground">
                        <Clock className="w-4 h-4 text-cyan-400" />
                        <span>Check Interval</span>
                        <span className="ml-auto text-amber-400">{localInterval} min</span>
                      </div>
                      <input
                        type="range"
                        min="5"
                        max="60"
                        step="5"
                        value={localInterval}
                        onChange={(e) => setLocalInterval(Number(e.target.value))}
                        className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer accent-amber-500"
                      />
                      <p className="text-xs text-muted-foreground">
                        Check plant health every {localInterval} minutes
                      </p>
                    </div>

                    {/* Test Notification */}
                    <button
                      onClick={sendTestNotification}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
                    >
                      <TestTube className="w-4 h-4 text-cyan-400" />
                      <span className="text-sm text-foreground">Send Test Notification</span>
                    </button>
                  </div>
                )}

                {/* Tips */}
                <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                  <p className="text-xs text-muted-foreground">
                    💡 <span className="text-foreground">Tip:</span> Keep this tab open in the background to receive notifications. For best results, add Dhyaan to your home screen!
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          {settings.enabled && permission === 'granted' && (
            <div className="p-4 border-t border-white/10">
              <button
                onClick={handleSaveSettings}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 border border-amber-500/30 text-amber-400 transition-all"
              >
                Save Settings
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default NotificationSettingsModal;
