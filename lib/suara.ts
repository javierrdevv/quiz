'use client';

export type SuaraNama = 'tick' | 'tickUrgent' | 'buzz' | 'correct' | 'reveal' | 'countdown' | 'fanfare' | 'join' | 'start';

let ctx: AudioContext | null = null;
let unlocked = false;

export function unlockAudio() {
  if (typeof window === 'undefined') return;
  if (!ctx) ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  if (ctx.state === 'suspended') ctx.resume().catch(() => {});
  unlocked = true;
}

function tone(
  freq: number,
  start: number,
  dur: number,
  type: OscillatorType = 'sine',
  peak = 0.2
) {
  if (!ctx || !unlocked) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0, ctx.currentTime + start);
  gain.gain.linearRampToValueAtTime(peak, ctx.currentTime + start + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + start + dur);
  osc.connect(gain).connect(ctx.destination);
  osc.start(ctx.currentTime + start);
  osc.stop(ctx.currentTime + start + dur + 0.05);
}

export function suara(nama: SuaraNama) {
  if (!ctx || !unlocked) return;
  switch (nama) {
    case 'tick':
      tone(880, 0, 0.08, 'square', 0.08);
      break;
    case 'tickUrgent':
      tone(1245, 0, 0.1, 'square', 0.1);
      tone(1245, 0.12, 0.1, 'square', 0.1);
      break;
    case 'buzz':
      mainkanFile('/jokowi-lawan.mp3');
      break;
    case 'correct':
      mainkanFile('/click-nice.mp3');
      break;
    case 'reveal':
      tone(392, 0, 0.22, 'triangle', 0.18);
      tone(523, 0.14, 0.3, 'triangle', 0.18);
      break;
    case 'countdown':
      tone(174, 0, 0.5, 'sawtooth', 0.06);
      tone(174, 0.02, 0.5, 'sawtooth', 0.06);
      break;
    case 'fanfare':
      [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.11, 0.16, 'triangle', 0.2));
      tone(1319, 0.44, 0.5, 'triangle', 0.2);
      break;
    case 'join':
      tone(440, 0, 0.08, 'sine', 0.12);
      tone(880, 0.07, 0.12, 'sine', 0.12);
      break;
    case 'start':
      tone(440, 0, 0.09, 'square', 0.12);
      tone(554, 0.08, 0.09, 'square', 0.12);
      tone(659, 0.16, 0.14, 'square', 0.12);
      break;
  }
}

let audioFile: HTMLAudioElement | null = null;
let audioFileUrl = '';

function mainkanFile(url: string) {
  if (!ctx || !unlocked) return;
  if (!audioFile || audioFileUrl !== url) {
    audioFile = new Audio(url);
    audioFileUrl = url;
    audioFile.onerror = () => {
      tone(110, 0, 0.35, 'sawtooth', 0.2);
      tone(92, 0.05, 0.35, 'sawtooth', 0.15);
    };
  }
  audioFile.currentTime = 0;
  audioFile.play().catch(() => {});
}

export function getar(durasi: number | number[]) {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    navigator.vibrate(durasi);
  }
}