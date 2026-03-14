import { useCallback } from "react";

function isSoundEnabled(): boolean {
  return localStorage.getItem("biju_sound_enabled") !== "false";
}

function createAudioContext(): AudioContext | null {
  try {
    const AC =
      window.AudioContext ||
      (window as Window & { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!AC) return null;
    return new AC();
  } catch {
    return null;
  }
}

function playTone(
  ctx: AudioContext,
  freq: number,
  startTime: number,
  duration: number,
  gainVal = 0.3,
) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.type = "sine";
  osc.frequency.setValueAtTime(freq, startTime);
  gain.gain.setValueAtTime(gainVal, startTime);
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
  osc.start(startTime);
  osc.stop(startTime + duration + 0.01);
}

export function useSound() {
  const playClick = useCallback(() => {
    if (!isSoundEnabled()) return;
    const ctx = createAudioContext();
    if (!ctx) return;
    playTone(ctx, 800, ctx.currentTime, 0.08, 0.2);
    setTimeout(() => ctx.close(), 300);
  }, []);

  const playSuccess = useCallback(() => {
    if (!isSoundEnabled()) return;
    const ctx = createAudioContext();
    if (!ctx) return;
    const t = ctx.currentTime;
    playTone(ctx, 600, t, 0.12, 0.25);
    playTone(ctx, 900, t + 0.13, 0.12, 0.25);
    setTimeout(() => ctx.close(), 600);
  }, []);

  const playCelebration = useCallback(() => {
    if (!isSoundEnabled()) return;
    const ctx = createAudioContext();
    if (!ctx) return;
    const t = ctx.currentTime;
    // Triumphant ascending chord sequence
    const notes = [523, 659, 784, 1047, 784, 1047, 1319];
    notes.forEach((freq, i) => {
      playTone(ctx, freq, t + i * 0.12, 0.18, 0.3);
    });
    setTimeout(() => ctx.close(), 2000);
  }, []);

  return { playClick, playSuccess, playCelebration };
}
