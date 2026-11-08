import { useSyncExternalStore } from 'react';

/**
 * Faint synthesised click sounds (no audio files to download).
 * Played when a button is pressed and when it pops back up. Visitors can mute it from the navbar.
 */

const KEY = 'sound';
let ctx: AudioContext | null = null;
let muted = (() => {
  try {
    return localStorage.getItem(KEY) === 'off';
  } catch {
    return false;
  }
})();

const listeners = new Set<() => void>();
const subscribe = (cb: () => void) => {
  listeners.add(cb);
  return () => listeners.delete(cb);
};

export function isMuted() {
  return muted;
}

export function setMuted(value: boolean) {
  muted = value;
  try {
    localStorage.setItem(KEY, value ? 'off' : 'on');
  } catch {
    /* ignore */
  }
  listeners.forEach((l) => l());
}

export function useSoundOn(): boolean {
  return !useSyncExternalStore(subscribe, () => muted, () => false);
}

function getCtx(): AudioContext | null {
  if (ctx) return ctx;
  const AC = window.AudioContext || (window as any).webkitAudioContext;
  if (!AC) return null;
  try {
    ctx = new AC();
  } catch {
    ctx = null;
  }
  return ctx;
}

/** Call from a user gesture so browsers allow audio to start. */
export function unlockAudio() {
  if (muted) return;
  const c = getCtx();
  if (c && c.state === 'suspended') c.resume().catch(() => undefined);
}

function blip(freqFrom: number, freqTo: number, ms: number, peak: number) {
  if (muted) return;
  const c = getCtx();
  if (!c || c.state !== 'running') return;
  const t = c.currentTime;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(freqFrom, t);
  osc.frequency.exponentialRampToValueAtTime(freqTo, t + ms / 1000);
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(peak, t + 0.004);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + ms / 1000);
  osc.connect(gain).connect(c.destination);
  osc.start(t);
  osc.stop(t + ms / 1000 + 0.02);
}

/** Soft low "tock" as the button goes down. */
export const playPress = () => blip(520, 150, 70, 0.07);
/** Lighter "tick" as it pops back up. */
export const playPop = () => blip(1100, 640, 55, 0.035);
