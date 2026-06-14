// DBZ Sound Engine — Web Audio API synthesized sounds

let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  // Resume if suspended (browser autoplay policy)
  if (audioCtx.state === "suspended") audioCtx.resume();
  return audioCtx;
}

// Call once on first user interaction to unlock audio on iOS/Chrome
export function unlockAudio() {
  getCtx();
}

// ─── Utility: schedule a simple oscillator burst ───────────────────────────
function osc(
  ctx: AudioContext,
  type: OscillatorType,
  freq: number,
  startTime: number,
  duration: number,
  gainPeak: number,
  dest: AudioNode
) {
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, startTime);
  g.gain.setValueAtTime(0, startTime);
  g.gain.linearRampToValueAtTime(gainPeak, startTime + 0.01);
  g.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
  o.connect(g);
  g.connect(dest);
  o.start(startTime);
  o.stop(startTime + duration + 0.05);
}

// ─── 1. PUNCH / SMACK — chore checkbox ─────────────────────────────────────
export function playPunch() {
  const ctx = getCtx();
  const master = ctx.createGain();
  master.gain.value = 0.5;
  master.connect(ctx.destination);
  const now = ctx.currentTime;

  // Noise burst for the smack body
  const bufLen = ctx.sampleRate * 0.08;
  const noiseBuffer = ctx.createBuffer(1, bufLen, ctx.sampleRate);
  const data = noiseBuffer.getChannelData(0);
  for (let i = 0; i < bufLen; i++) data[i] = (Math.random() * 2 - 1);
  const noise = ctx.createBufferSource();
  noise.buffer = noiseBuffer;
  const noiseFilter = ctx.createBiquadFilter();
  noiseFilter.type = "bandpass";
  noiseFilter.frequency.value = 800;
  noiseFilter.Q.value = 0.8;
  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(1, now);
  noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
  noise.connect(noiseFilter);
  noiseFilter.connect(noiseGain);
  noiseGain.connect(master);
  noise.start(now);

  // Low thump
  osc(ctx, "sine", 120, now, 0.12, 0.8, master);
  osc(ctx, "sine", 60, now + 0.01, 0.1, 0.5, master);

  // Crack transient
  osc(ctx, "square", 400, now, 0.03, 0.3, master);
}

// ─── 2. POWER-UP — Dragon Ball earned ──────────────────────────────────────
export function playPowerUp() {
  const ctx = getCtx();
  const master = ctx.createGain();
  master.gain.value = 0.4;
  master.connect(ctx.destination);
  const now = ctx.currentTime;

  // Rising energy sweep — multiple harmonics
  const freqs = [110, 220, 330, 440, 660];
  freqs.forEach((f, i) => {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = i % 2 === 0 ? "sawtooth" : "sine";
    o.frequency.setValueAtTime(f * 0.5, now);
    o.frequency.exponentialRampToValueAtTime(f * 3, now + 1.2);
    g.gain.setValueAtTime(0, now);
    g.gain.linearRampToValueAtTime(0.15, now + 0.1);
    g.gain.linearRampToValueAtTime(0.08, now + 0.8);
    g.gain.exponentialRampToValueAtTime(0.001, now + 1.4);
    o.connect(g);
    g.connect(master);
    o.start(now + i * 0.04);
    o.stop(now + 1.5);
  });

  // High shimmer
  osc(ctx, "sine", 2200, now + 0.6, 0.6, 0.25, master);
  osc(ctx, "sine", 3300, now + 0.8, 0.5, 0.2, master);

  // Noise crackle (ki energy)
  const bufLen = ctx.sampleRate * 0.3;
  const nb = ctx.createBuffer(1, bufLen, ctx.sampleRate);
  const d = nb.getChannelData(0);
  for (let i = 0; i < bufLen; i++) d[i] = (Math.random() * 2 - 1) * 0.3;
  const ns = ctx.createBufferSource();
  ns.buffer = nb;
  const nf = ctx.createBiquadFilter();
  nf.type = "highpass";
  nf.frequency.value = 3000;
  const ng = ctx.createGain();
  ng.gain.setValueAtTime(0.6, now);
  ng.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
  ns.connect(nf); nf.connect(ng); ng.connect(master);
  ns.start(now);
}

// ─── 3. KAMEHAMEHA / SHENRON SUMMON ─────────────────────────────────────────
export function playKamehameha() {
  const ctx = getCtx();
  const master = ctx.createGain();
  master.gain.value = 0.45;
  master.connect(ctx.destination);
  const now = ctx.currentTime;

  // Deep rumble build-up
  [40, 60, 80].forEach((f, i) => {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = "sine";
    o.frequency.setValueAtTime(f, now + i * 0.1);
    o.frequency.exponentialRampToValueAtTime(f * 1.5, now + 1.5);
    g.gain.setValueAtTime(0, now + i * 0.1);
    g.gain.linearRampToValueAtTime(0.3, now + 0.5);
    g.gain.linearRampToValueAtTime(0.6, now + 1.5);
    g.gain.exponentialRampToValueAtTime(0.001, now + 3.5);
    o.connect(g); g.connect(master);
    o.start(now); o.stop(now + 3.6);
  });

  // Energy beam — mid-range roar
  [200, 400, 600, 900].forEach((f, i) => {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = i % 2 === 0 ? "sawtooth" : "square";
    o.frequency.setValueAtTime(f * 0.3, now + 0.8);
    o.frequency.exponentialRampToValueAtTime(f * 2.5, now + 2.0);
    o.frequency.exponentialRampToValueAtTime(f * 4, now + 3.2);
    g.gain.setValueAtTime(0, now + 0.8);
    g.gain.linearRampToValueAtTime(0.12, now + 1.2);
    g.gain.linearRampToValueAtTime(0.18, now + 2.5);
    g.gain.exponentialRampToValueAtTime(0.001, now + 3.5);
    o.connect(g); g.connect(master);
    o.start(now + 0.8); o.stop(now + 3.6);
  });

  // Explosive release at peak
  osc(ctx, "sine", 55, now + 2.8, 0.8, 0.9, master);
  osc(ctx, "sine", 110, now + 2.8, 0.7, 0.6, master);
  osc(ctx, "sawtooth", 880, now + 2.8, 0.5, 0.4, master);

  // Noise burst for the explosion
  const bufLen = ctx.sampleRate * 1.2;
  const nb = ctx.createBuffer(1, bufLen, ctx.sampleRate);
  const d = nb.getChannelData(0);
  for (let i = 0; i < bufLen; i++) d[i] = (Math.random() * 2 - 1);
  const ns = ctx.createBufferSource();
  ns.buffer = nb;
  const nf = ctx.createBiquadFilter();
  nf.type = "lowpass";
  nf.frequency.value = 1200;
  const ng = ctx.createGain();
  ng.gain.setValueAtTime(0, now + 2.6);
  ng.gain.linearRampToValueAtTime(0.7, now + 2.85);
  ng.gain.exponentialRampToValueAtTime(0.001, now + 3.8);
  ns.connect(nf); nf.connect(ng); ng.connect(master);
  ns.start(now + 2.6);
}


