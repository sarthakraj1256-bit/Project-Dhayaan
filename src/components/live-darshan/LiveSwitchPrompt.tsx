import { motion, AnimatePresence } from 'framer-motion';
import { Radio, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LiveSwitchPromptProps {
  show: boolean;
  templeName: string;
  onSwitch: () => void;
  onDismiss: () => void;
}

const LiveSwitchPrompt = ({ show, templeName, onSwitch, onDismiss }: LiveSwitchPromptProps) => {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -20, opacity: 0 }}
          className="absolute top-4 left-4 right-4 z-20"
        >
          <div className="bg-destructive/90 backdrop-blur-md border border-destructive/50 rounded-xl p-4 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                  <Radio className="w-5 h-5 text-white animate-pulse" />
                </div>
                <div>
                  <h4 className="font-semibold text-white">🔴 Live Aarti Started!</h4>
                  <p className="text-sm text-white/80 mt-0.5">
                    Live stream from {templeName} is now available
                  </p>
                </div>
              </div>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={onDismiss}
                className="text-white/70 hover:text-white hover:bg-white/10 -mt-1 -mr-1"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="flex gap-2 mt-4">
              <Button
                onClick={onSwitch}
                className="flex-1 bg-white text-destructive hover:bg-white/90 font-semibold"
              >
                Switch to Live
              </Button>
              <Button
                variant="ghost"
                onClick={onDismiss}
                className="text-white/80 hover:text-white hover:bg-white/10"
              >
                Continue Watching
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LiveSwitchPrompt;
