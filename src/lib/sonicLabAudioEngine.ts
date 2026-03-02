import { toast } from '@/hooks/use-toast';

interface SonicLabAudioEngine {
  context: AudioContext;
  frequencyGain: GainNode;
  atmosphereGain: GainNode;
  analyser: AnalyserNode;
}

let engine: SonicLabAudioEngine | null = null;

function createAudioContext(): AudioContext {
  return new (window.AudioContext ||
    (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
}

export function getSonicLabAudioEngine(): SonicLabAudioEngine {
  if (engine) return engine;

  const context = createAudioContext();
  const frequencyGain = context.createGain();
  const atmosphereGain = context.createGain();
  const analyser = context.createAnalyser();

  frequencyGain.gain.setValueAtTime(0.3, context.currentTime);
  atmosphereGain.gain.setValueAtTime(0.2, context.currentTime);
  analyser.fftSize = 256;

  frequencyGain.connect(analyser);
  analyser.connect(context.destination);
  atmosphereGain.connect(context.destination);

  engine = {
    context,
    frequencyGain,
    atmosphereGain,
    analyser,
  };

  return engine;
}

export async function resumeSonicLabAudioContext(showToast = true): Promise<boolean> {
  try {
    const { context } = getSonicLabAudioEngine();
    if (context.state === 'suspended') {
      await context.resume();
    }
    return true;
  } catch (error) {
    if (showToast) {
      toast({
        title: 'Tap to unlock sound',
        description: 'Tap an atmosphere button again to enable audio.',
      });
    }
    console.error('Failed to resume Sonic Lab audio context:', error);
    return false;
  }
}

export function resetSonicLabAudioEngineGains() {
  const { context, frequencyGain, atmosphereGain } = getSonicLabAudioEngine();
  frequencyGain.gain.setValueAtTime(0.3, context.currentTime);
  atmosphereGain.gain.setValueAtTime(0.2, context.currentTime);
}
