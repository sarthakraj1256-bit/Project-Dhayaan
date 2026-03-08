/**
 * Procedural atmosphere sound generator using Web Audio API.
 * Each atmosphere is synthesized in real-time — zero network requests, instant playback.
 */

export interface AtmosphereNodes {
  nodes: AudioNode[];
  stop: () => void;
}

type AtmosphereFactory = (ctx: AudioContext, dest: AudioNode) => AtmosphereNodes;

/* ── Utility: white noise buffer ── */
function createNoiseBuffer(ctx: AudioContext, seconds = 2): AudioBuffer {
  const length = ctx.sampleRate * seconds;
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1;
  return buffer;
}

/* ── Utility: noise source (looping) ── */
function createNoiseSource(ctx: AudioContext): AudioBufferSourceNode {
  const src = ctx.createBufferSource();
  src.buffer = createNoiseBuffer(ctx, 2);
  src.loop = true;
  src.start();
  return src;
}

/* ── Utility: LFO ── */
function createLFO(ctx: AudioContext, freq: number, amount: number, target: AudioParam) {
  const lfo = ctx.createOscillator();
  const gain = ctx.createGain();
  lfo.frequency.value = freq;
  gain.gain.value = amount;
  lfo.connect(gain);
  gain.connect(target);
  lfo.start();
  return lfo;
}

/* ══════════════════════════════════════════════════════
   ATMOSPHERE FACTORIES
   ══════════════════════════════════════════════════════ */

const gentleRain: AtmosphereFactory = (ctx, dest) => {
  const noise = createNoiseSource(ctx);
  const hp = ctx.createBiquadFilter();
  hp.type = 'highpass'; hp.frequency.value = 800;
  const lp = ctx.createBiquadFilter();
  lp.type = 'lowpass'; lp.frequency.value = 5000;
  const gain = ctx.createGain();
  gain.gain.value = 0.4;
  // Subtle modulation for realism
  const lfo = createLFO(ctx, 0.15, 0.08, gain.gain);
  noise.connect(hp); hp.connect(lp); lp.connect(gain); gain.connect(dest);
  return { nodes: [noise, lfo], stop: () => { noise.stop(); lfo.stop(); } };
};

const riverFlow: AtmosphereFactory = (ctx, dest) => {
  const noise = createNoiseSource(ctx);
  const bp = ctx.createBiquadFilter();
  bp.type = 'bandpass'; bp.frequency.value = 600; bp.Q.value = 0.5;
  const gain = ctx.createGain();
  gain.gain.value = 0.35;
  const lfo = createLFO(ctx, 0.3, 150, bp.frequency);
  const lfo2 = createLFO(ctx, 0.08, 0.1, gain.gain);
  noise.connect(bp); bp.connect(gain); gain.connect(dest);
  return { nodes: [noise, lfo, lfo2], stop: () => { noise.stop(); lfo.stop(); lfo2.stop(); } };
};

const templeBells: AtmosphereFactory = (ctx, dest) => {
  const nodes: OscillatorNode[] = [];
  let stopped = false;
  const master = ctx.createGain();
  master.gain.value = 0.25;
  master.connect(dest);

  function ringBell() {
    if (stopped) return;
    const freqs = [523, 659, 784, 1047];
    const freq = freqs[Math.floor(Math.random() * freqs.length)];
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    g.gain.setValueAtTime(0.5, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 3);
    osc.connect(g); g.connect(master);
    osc.start(); osc.stop(ctx.currentTime + 3.5);
    nodes.push(osc);
    // Add harmonic
    const h = ctx.createOscillator();
    const hg = ctx.createGain();
    h.type = 'sine'; h.frequency.value = freq * 2.5;
    hg.gain.setValueAtTime(0.15, ctx.currentTime);
    hg.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2);
    h.connect(hg); hg.connect(master);
    h.start(); h.stop(ctx.currentTime + 2.5);
    nodes.push(h);
    setTimeout(ringBell, 2500 + Math.random() * 3000);
  }
  ringBell();
  return { nodes: [], stop: () => { stopped = true; nodes.forEach(n => { try { n.stop(); } catch {} }); } };
};

const forestAmbience: AtmosphereFactory = (ctx, dest) => {
  // Wind through trees (filtered noise)
  const noise = createNoiseSource(ctx);
  const bp = ctx.createBiquadFilter();
  bp.type = 'bandpass'; bp.frequency.value = 400; bp.Q.value = 0.3;
  const g1 = ctx.createGain();
  g1.gain.value = 0.2;
  const lfo = createLFO(ctx, 0.12, 100, bp.frequency);
  noise.connect(bp); bp.connect(g1); g1.connect(dest);

  // Bird chirps
  let stopped = false;
  const birdNodes: OscillatorNode[] = [];
  function chirp() {
    if (stopped) return;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'sine';
    const base = 2000 + Math.random() * 2000;
    osc.frequency.setValueAtTime(base, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(base + 400, ctx.currentTime + 0.05);
    osc.frequency.linearRampToValueAtTime(base - 200, ctx.currentTime + 0.1);
    g.gain.setValueAtTime(0.08, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
    osc.connect(g); g.connect(dest);
    osc.start(); osc.stop(ctx.currentTime + 0.2);
    birdNodes.push(osc);
    setTimeout(chirp, 1000 + Math.random() * 4000);
  }
  chirp();
  return { nodes: [noise, lfo], stop: () => { stopped = true; noise.stop(); lfo.stop(); birdNodes.forEach(n => { try { n.stop(); } catch {} }); } };
};

const windChimes: AtmosphereFactory = (ctx, dest) => {
  let stopped = false;
  const chimeNodes: OscillatorNode[] = [];
  const master = ctx.createGain();
  master.gain.value = 0.2;
  master.connect(dest);

  // Background breeze
  const noise = createNoiseSource(ctx);
  const bp = ctx.createBiquadFilter();
  bp.type = 'bandpass'; bp.frequency.value = 300; bp.Q.value = 0.4;
  const bg = ctx.createGain();
  bg.gain.value = 0.08;
  const lfo = createLFO(ctx, 0.1, 80, bp.frequency);
  noise.connect(bp); bp.connect(bg); bg.connect(dest);

  function chime() {
    if (stopped) return;
    const notes = [1175, 1319, 1568, 1760, 2093, 2349];
    const freq = notes[Math.floor(Math.random() * notes.length)];
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    g.gain.setValueAtTime(0.3, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2.5);
    osc.connect(g); g.connect(master);
    osc.start(); osc.stop(ctx.currentTime + 3);
    chimeNodes.push(osc);
    setTimeout(chime, 800 + Math.random() * 2500);
  }
  chime();
  return { nodes: [noise, lfo], stop: () => { stopped = true; noise.stop(); lfo.stop(); chimeNodes.forEach(n => { try { n.stop(); } catch {} }); } };
};

const oceanWaves: AtmosphereFactory = (ctx, dest) => {
  const noise = createNoiseSource(ctx);
  const lp = ctx.createBiquadFilter();
  lp.type = 'lowpass'; lp.frequency.value = 800;
  const gain = ctx.createGain();
  gain.gain.value = 0.35;
  // Slow swell
  const lfo = createLFO(ctx, 0.08, 0.2, gain.gain);
  const lfo2 = createLFO(ctx, 0.05, 300, lp.frequency);
  noise.connect(lp); lp.connect(gain); gain.connect(dest);
  return { nodes: [noise, lfo, lfo2], stop: () => { noise.stop(); lfo.stop(); lfo2.stop(); } };
};

const thunderstorm: AtmosphereFactory = (ctx, dest) => {
  // Heavy rain
  const noise = createNoiseSource(ctx);
  const hp = ctx.createBiquadFilter();
  hp.type = 'highpass'; hp.frequency.value = 600;
  const lp = ctx.createBiquadFilter();
  lp.type = 'lowpass'; lp.frequency.value = 6000;
  const rg = ctx.createGain();
  rg.gain.value = 0.4;
  noise.connect(hp); hp.connect(lp); lp.connect(rg); rg.connect(dest);

  // Thunder rumbles
  let stopped = false;
  const thunderNodes: OscillatorNode[] = [];
  function thunder() {
    if (stopped) return;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.value = 40 + Math.random() * 30;
    const lp2 = ctx.createBiquadFilter();
    lp2.type = 'lowpass'; lp2.frequency.value = 150;
    g.gain.setValueAtTime(0.5, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 3);
    osc.connect(lp2); lp2.connect(g); g.connect(dest);
    osc.start(); osc.stop(ctx.currentTime + 3.5);
    thunderNodes.push(osc);
    setTimeout(thunder, 5000 + Math.random() * 10000);
  }
  setTimeout(thunder, 2000);
  return { nodes: [noise], stop: () => { stopped = true; noise.stop(); thunderNodes.forEach(n => { try { n.stop(); } catch {} }); } };
};

const nightCrickets: AtmosphereFactory = (ctx, dest) => {
  let stopped = false;
  const cricketNodes: OscillatorNode[] = [];
  const master = ctx.createGain();
  master.gain.value = 0.15;
  master.connect(dest);

  // Background night ambience
  const noise = createNoiseSource(ctx);
  const bp = ctx.createBiquadFilter();
  bp.type = 'bandpass'; bp.frequency.value = 200; bp.Q.value = 0.5;
  const bg = ctx.createGain();
  bg.gain.value = 0.06;
  noise.connect(bp); bp.connect(bg); bg.connect(dest);

  function cricket() {
    if (stopped) return;
    const freq = 4000 + Math.random() * 1500;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    // Rapid on/off chirp pattern
    const now = ctx.currentTime;
    for (let i = 0; i < 6; i++) {
      g.gain.setValueAtTime(0.3, now + i * 0.06);
      g.gain.setValueAtTime(0, now + i * 0.06 + 0.03);
    }
    g.gain.setValueAtTime(0, now + 0.36);
    osc.connect(g); g.connect(master);
    osc.start(); osc.stop(now + 0.4);
    cricketNodes.push(osc);
    setTimeout(cricket, 300 + Math.random() * 1200);
  }
  cricket();
  // Second cricket at different timing
  setTimeout(() => { if (!stopped) cricket(); }, 500);
  return { nodes: [noise], stop: () => { stopped = true; noise.stop(); cricketNodes.forEach(n => { try { n.stop(); } catch {} }); } };
};

const himalayanWind: AtmosphereFactory = (ctx, dest) => {
  const noise = createNoiseSource(ctx);
  const bp = ctx.createBiquadFilter();
  bp.type = 'bandpass'; bp.frequency.value = 350; bp.Q.value = 0.8;
  const gain = ctx.createGain();
  gain.gain.value = 0.35;
  const lfo = createLFO(ctx, 0.06, 0.2, gain.gain);
  const lfo2 = createLFO(ctx, 0.04, 200, bp.frequency);
  noise.connect(bp); bp.connect(gain); gain.connect(dest);
  return { nodes: [noise, lfo, lfo2], stop: () => { noise.stop(); lfo.stop(); lfo2.stop(); } };
};

const meditationOm: AtmosphereFactory = (ctx, dest) => {
  const master = ctx.createGain();
  master.gain.value = 0.25;
  master.connect(dest);
  const oscs: OscillatorNode[] = [];
  // Layered OM harmonics at 136.1 Hz (Earth OM)
  const harmonics = [136.1, 272.2, 408.3, 544.4];
  const volumes = [0.4, 0.25, 0.15, 0.08];
  harmonics.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    g.gain.value = volumes[i];
    // Gentle vibrato
    const vib = createLFO(ctx, 0.2 + i * 0.1, 1.5, osc.frequency);
    oscs.push(osc, vib as unknown as OscillatorNode);
    osc.connect(g); g.connect(master);
    osc.start();
  });
  // Breathy noise layer
  const noise = createNoiseSource(ctx);
  const bp = ctx.createBiquadFilter();
  bp.type = 'bandpass'; bp.frequency.value = 300; bp.Q.value = 2;
  const ng = ctx.createGain();
  ng.gain.value = 0.04;
  noise.connect(bp); bp.connect(ng); ng.connect(master);
  oscs.push(noise as unknown as OscillatorNode);
  return { nodes: [], stop: () => { oscs.forEach(o => { try { o.stop(); } catch {} }); noise.stop(); } };
};

const tibetanBowl: AtmosphereFactory = (ctx, dest) => {
  let stopped = false;
  const bowlNodes: OscillatorNode[] = [];
  const master = ctx.createGain();
  master.gain.value = 0.3;
  master.connect(dest);

  function strike() {
    if (stopped) return;
    const base = 200 + Math.random() * 100;
    [1, 2.71, 4.55, 6.4].forEach((ratio, i) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = base * ratio;
      const vol = [0.4, 0.2, 0.1, 0.05][i];
      g.gain.setValueAtTime(vol, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 5);
      osc.connect(g); g.connect(master);
      osc.start(); osc.stop(ctx.currentTime + 5.5);
      bowlNodes.push(osc);
    });
    setTimeout(strike, 4000 + Math.random() * 4000);
  }
  strike();
  return { nodes: [], stop: () => { stopped = true; bowlNodes.forEach(n => { try { n.stop(); } catch {} }); } };
};

const krishnaFlute: AtmosphereFactory = (ctx, dest) => {
  let stopped = false;
  const fluteNodes: OscillatorNode[] = [];
  const master = ctx.createGain();
  master.gain.value = 0.2;
  master.connect(dest);

  // Pentatonic scale notes (Indian raga feel)
  const notes = [523, 587, 659, 784, 880, 1047, 880, 784, 659, 587];
  let noteIdx = 0;

  function playNote() {
    if (stopped) return;
    const freq = notes[noteIdx % notes.length];
    noteIdx++;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    // Vibrato
    const vib = ctx.createOscillator();
    const vg = ctx.createGain();
    vib.frequency.value = 5; vg.gain.value = 8;
    vib.connect(vg); vg.connect(osc.frequency);
    vib.start();
    // Envelope
    const dur = 0.8 + Math.random() * 0.6;
    g.gain.setValueAtTime(0, ctx.currentTime);
    g.gain.linearRampToValueAtTime(0.35, ctx.currentTime + 0.1);
    g.gain.setValueAtTime(0.35, ctx.currentTime + dur - 0.2);
    g.gain.linearRampToValueAtTime(0, ctx.currentTime + dur);
    // Breathy layer
    const noise = createNoiseSource(ctx);
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass'; bp.frequency.value = freq; bp.Q.value = 10;
    const ng = ctx.createGain();
    ng.gain.setValueAtTime(0, ctx.currentTime);
    ng.gain.linearRampToValueAtTime(0.04, ctx.currentTime + 0.1);
    ng.gain.linearRampToValueAtTime(0, ctx.currentTime + dur);
    noise.connect(bp); bp.connect(ng); ng.connect(master);

    osc.connect(g); g.connect(master);
    osc.start(); osc.stop(ctx.currentTime + dur + 0.1);
    vib.stop(ctx.currentTime + dur + 0.1);
    noise.stop(ctx.currentTime + dur + 0.1);
    fluteNodes.push(osc);
    setTimeout(playNote, (dur + 0.3 + Math.random() * 0.5) * 1000);
  }
  playNote();
  return { nodes: [], stop: () => { stopped = true; fluteNodes.forEach(n => { try { n.stop(); } catch {} }); } };
};

const sacredMantra: AtmosphereFactory = (ctx, dest) => {
  const master = ctx.createGain();
  master.gain.value = 0.2;
  master.connect(dest);
  const oscs: OscillatorNode[] = [];

  // Deep chanting harmonics cycling between two notes
  let stopped = false;
  function chant() {
    if (stopped) return;
    const bases = [130.81, 146.83, 130.81]; // C3, D3, C3
    bases.forEach((base, bi) => {
      setTimeout(() => {
        if (stopped) return;
        [1, 2, 3, 5].forEach((h, i) => {
          const osc = ctx.createOscillator();
          const g = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.value = base * h;
          const vol = [0.3, 0.15, 0.08, 0.04][i];
          g.gain.setValueAtTime(0, ctx.currentTime);
          g.gain.linearRampToValueAtTime(vol, ctx.currentTime + 0.5);
          g.gain.setValueAtTime(vol, ctx.currentTime + 2);
          g.gain.linearRampToValueAtTime(0, ctx.currentTime + 2.5);
          osc.connect(g); g.connect(master);
          osc.start(); osc.stop(ctx.currentTime + 3);
          oscs.push(osc);
        });
      }, bi * 2800);
    });
    setTimeout(chant, 8500);
  }
  chant();
  return { nodes: [], stop: () => { stopped = true; oscs.forEach(o => { try { o.stop(); } catch {} }); } };
};

const waterfall: AtmosphereFactory = (ctx, dest) => {
  const noise = createNoiseSource(ctx);
  const lp = ctx.createBiquadFilter();
  lp.type = 'lowpass'; lp.frequency.value = 2000;
  const hp = ctx.createBiquadFilter();
  hp.type = 'highpass'; hp.frequency.value = 200;
  const gain = ctx.createGain();
  gain.gain.value = 0.4;
  const lfo = createLFO(ctx, 0.1, 0.05, gain.gain);
  noise.connect(hp); hp.connect(lp); lp.connect(gain); gain.connect(dest);
  return { nodes: [noise, lfo], stop: () => { noise.stop(); lfo.stop(); } };
};

const fireplace: AtmosphereFactory = (ctx, dest) => {
  // Base crackle
  const noise = createNoiseSource(ctx);
  const hp = ctx.createBiquadFilter();
  hp.type = 'highpass'; hp.frequency.value = 1500;
  const lp = ctx.createBiquadFilter();
  lp.type = 'lowpass'; lp.frequency.value = 8000;
  const g1 = ctx.createGain();
  g1.gain.value = 0.15;
  noise.connect(hp); hp.connect(lp); lp.connect(g1); g1.connect(dest);

  // Low rumble
  const noise2 = createNoiseSource(ctx);
  const lp2 = ctx.createBiquadFilter();
  lp2.type = 'lowpass'; lp2.frequency.value = 200;
  const g2 = ctx.createGain();
  g2.gain.value = 0.12;
  const lfo = createLFO(ctx, 0.2, 0.05, g2.gain);
  noise2.connect(lp2); lp2.connect(g2); g2.connect(dest);

  // Pops
  let stopped = false;
  const popNodes: OscillatorNode[] = [];
  function pop() {
    if (stopped) return;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'square';
    osc.frequency.value = 800 + Math.random() * 2000;
    g.gain.setValueAtTime(0.15, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
    osc.connect(g); g.connect(dest);
    osc.start(); osc.stop(ctx.currentTime + 0.08);
    popNodes.push(osc);
    setTimeout(pop, 200 + Math.random() * 800);
  }
  pop();
  return { nodes: [noise, noise2, lfo], stop: () => { stopped = true; noise.stop(); noise2.stop(); lfo.stop(); popNodes.forEach(n => { try { n.stop(); } catch {} }); } };
};

/* ══════════════════════════════════════════════════════
   REGISTRY
   ══════════════════════════════════════════════════════ */

export const atmosphereFactories: Record<string, AtmosphereFactory> = {
  rain: gentleRain,
  river: riverFlow,
  bells: templeBells,
  forest: forestAmbience,
  chimes: windChimes,
  ocean: oceanWaves,
  thunder: thunderstorm,
  crickets: nightCrickets,
  wind: himalayanWind,
  om: meditationOm,
  bowl: tibetanBowl,
  flute: krishnaFlute,
  mantra: sacredMantra,
  waterfall: waterfall,
  fireplace: fireplace,
};
