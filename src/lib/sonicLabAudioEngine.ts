/**
 * Singleton AudioContext shared by both the Frequency oscillator
 * and the Atmosphere buffer player inside Sonic Lab.
 *
 * IMPORTANT: This module must NEVER import React hooks or call
 * functions that trigger React state updates (e.g. toast()).
 * Doing so during React's commit phase corrupts the fiber queue.
 */

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

/**
 * Get (or lazily create) the shared audio engine.
 * Safe to call from effects and callbacks — never call during render.
 */
export function getSonicLabAudioEngine(): SonicLabAudioEngine {
  if (engine) return engine;

  const context = createAudioContext();
  const frequencyGain = context.createGain();
  const atmosphereGain = context.createGain();
  const analyser = context.createAnalyser();

  frequencyGain.gain.setValueAtTime(0.3, context.currentTime);
  atmosphereGain.gain.setValueAtTime(0.2, context.currentTime);
  analyser.fftSize = 256;

  // Frequency → Analyser → Destination (for visualizations)
  frequencyGain.connect(analyser);
  analyser.connect(context.destination);

  // Atmosphere → Destination (independent gain path)
  atmosphereGain.connect(context.destination);

  engine = { context, frequencyGain, atmosphereGain, analyser };
  return engine;
}

/**
 * Resume the AudioContext if suspended.
 * Returns true if playback is now allowed.
 * Does NOT trigger React state updates — callers handle UI feedback.
 */
export async function resumeSonicLabAudioContext(): Promise<boolean> {
  try {
    const { context } = getSonicLabAudioEngine();
    if (context.state === 'suspended') {
      await context.resume();
    }
    return true;
  } catch (error) {
    console.error('Failed to resume Sonic Lab audio context:', error);
    return false;
  }
}

export function resetSonicLabAudioEngineGains() {
  if (!engine) return;
  const { context, frequencyGain, atmosphereGain } = engine;
  frequencyGain.gain.setValueAtTime(0.3, context.currentTime);
  atmosphereGain.gain.setValueAtTime(0.2, context.currentTime);
}

/** Check if engine exists without creating it */
export function hasSonicLabAudioEngine(): boolean {
  return engine !== null;
}
