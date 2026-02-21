// Web Audio API sound effects generator
let audioCtx = null;
let masterGain = null;
let muted = false;

export function initAudio() {
  try {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    masterGain = audioCtx.createGain();
    masterGain.gain.value = 0.3;
    masterGain.connect(audioCtx.destination);
  } catch (e) {
    console.warn('Web Audio API not available');
  }
}

export function resumeAudio() {
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
}

export function toggleMute() {
  muted = !muted;
  if (masterGain) {
    masterGain.gain.value = muted ? 0 : 0.3;
  }
  return muted;
}

function playTone(freq, duration, type = 'square', volume = 0.3, slide = 0) {
  if (!audioCtx || muted) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
  if (slide) {
    osc.frequency.linearRampToValueAtTime(freq + slide, audioCtx.currentTime + duration);
  }
  gain.gain.setValueAtTime(volume * 0.3, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
  osc.connect(gain);
  gain.connect(masterGain);
  osc.start(audioCtx.currentTime);
  osc.stop(audioCtx.currentTime + duration);
}

function playNoise(duration, volume = 0.2) {
  if (!audioCtx || muted) return;
  const bufferSize = audioCtx.sampleRate * duration;
  const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  const source = audioCtx.createBufferSource();
  source.buffer = buffer;
  const gain = audioCtx.createGain();
  gain.gain.setValueAtTime(volume * 0.3, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
  source.connect(gain);
  gain.connect(masterGain);
  source.start();
}

export function sfxJump() {
  playTone(300, 0.15, 'square', 0.3, 400);
}

export function sfxRainbow() {
  playTone(500, 0.1, 'sine', 0.25, 300);
  setTimeout(() => playTone(700, 0.1, 'sine', 0.2, 200), 50);
  setTimeout(() => playTone(900, 0.15, 'sine', 0.15, 100), 100);
}

export function sfxEnemyHit() {
  playTone(200, 0.15, 'square', 0.3, -100);
  playNoise(0.1, 0.15);
}

export function sfxEnemyDie() {
  playTone(600, 0.1, 'square', 0.3, -400);
  setTimeout(() => playTone(400, 0.15, 'square', 0.25, -200), 80);
}

export function sfxCollectItem() {
  playTone(800, 0.08, 'sine', 0.3);
  setTimeout(() => playTone(1200, 0.12, 'sine', 0.25), 60);
}

export function sfxCollectDiamond() {
  playTone(600, 0.08, 'sine', 0.3);
  setTimeout(() => playTone(900, 0.08, 'sine', 0.3), 70);
  setTimeout(() => playTone(1200, 0.15, 'sine', 0.3), 140);
}

export function sfxPlayerHit() {
  playTone(200, 0.2, 'sawtooth', 0.4, -150);
  playNoise(0.2, 0.3);
}

export function sfxPlayerDie() {
  playTone(400, 0.1, 'square', 0.3, -300);
  setTimeout(() => playTone(300, 0.1, 'square', 0.3, -200), 100);
  setTimeout(() => playTone(200, 0.15, 'square', 0.3, -100), 200);
  setTimeout(() => playTone(100, 0.3, 'square', 0.3, -50), 300);
}

export function sfxLevelClear() {
  const notes = [523, 659, 784, 1047]; // C E G C
  notes.forEach((note, i) => {
    setTimeout(() => playTone(note, 0.2, 'sine', 0.3), i * 120);
  });
}

export function sfxGameOver() {
  const notes = [400, 350, 300, 250, 200];
  notes.forEach((note, i) => {
    setTimeout(() => playTone(note, 0.25, 'square', 0.25), i * 200);
  });
}

export function sfxWaterWarning() {
  playTone(440, 0.15, 'square', 0.2);
  setTimeout(() => playTone(440, 0.15, 'square', 0.2), 200);
}

export function sfxPowerup() {
  const notes = [400, 500, 600, 800];
  notes.forEach((note, i) => {
    setTimeout(() => playTone(note, 0.12, 'sine', 0.25), i * 60);
  });
}

export function sfxMenuSelect() {
  playTone(600, 0.08, 'square', 0.2, 200);
}

export function sfxDeny() {
  playTone(150, 0.12, 'square', 0.25);
  setTimeout(() => playTone(120, 0.15, 'square', 0.2), 100);
}

export function sfxSplash() {
  playNoise(0.15, 0.25);
  playTone(150, 0.2, 'sine', 0.15, -50);
}

export function sfxRainbowCrumble() {
  playNoise(0.1, 0.15);
  playTone(300, 0.1, 'square', 0.15, -200);
}
