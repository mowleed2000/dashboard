"use client";

import confetti from "canvas-confetti";

// Web Audio API synthesizer for clean, zero-file sound effects
class SoundController {
  private ctx: AudioContext | null = null;
  private soundEffectsEnabled = true;

  constructor() {
    // AudioContext will be initialized on first user interaction
  }

  private getContext(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public setSoundEffectsEnabled(enabled: boolean) {
    this.soundEffectsEnabled = enabled;
  }

  // Tasteful cha-ching / cash chime for confirmed sales
  public playSaleChime() {
    if (!this.soundEffectsEnabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = "sine";
      osc1.frequency.setValueAtTime(987.77, now); // B5
      osc1.frequency.exponentialRampToValueAtTime(1318.51, now + 0.12); // E6

      osc2.type = "triangle";
      osc2.frequency.setValueAtTime(1318.51, now + 0.08);
      osc2.frequency.exponentialRampToValueAtTime(1975.53, now + 0.28); // B6

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now + 0.08);
      osc1.stop(now + 0.3);
      osc2.stop(now + 0.45);
    } catch (e) {
      console.warn("Audio play failed:", e);
    }
  }

  // Gentle checkmark click sound for task completion
  public playTaskComplete() {
    if (!this.soundEffectsEnabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.1); // E5

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.2);
    } catch (e) {
      console.warn("Audio play failed:", e);
    }
  }

  // Milestone fanfare
  public playMilestone() {
    if (!this.soundEffectsEnabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const notes = [440, 554.37, 659.25, 880]; // A4, C#5, E5, A5
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.15, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.3);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.3);
      });
    } catch (e) {
      console.warn("Audio play failed:", e);
    }
  }

  // Trigger celebration visual particles
  public triggerConfetti() {
    try {
      confetti({
        particleCount: 45,
        spread: 60,
        origin: { y: 0.8 },
        colors: ["#E98569", "#E8BC57", "#769B83", "#7796C9"],
        disableForReducedMotion: true,
      });
    } catch (e) {
      // Ignore if confetti not supported
    }
  }
}

export const soundFx = new SoundController();
