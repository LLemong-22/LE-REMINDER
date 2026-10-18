// Lightweight Web Audio API Synthesizer for LE-REMINDER Cryo-HUD SFX
// Zero audio files, zero network requests, instant playback, zero memory footprint.

type MuteListener = (muted: boolean) => void;

class CryoSoundEngine {
	private ctx: AudioContext | null = null;
	private muted = false;
	private listeners: Set<MuteListener> = new Set();
	private lastTickTime = 0;

	constructor() {
		if (typeof window !== "undefined") {
			try {
				const saved = localStorage.getItem("le-reminder-sfx-muted");
				if (saved !== null) {
					this.muted = saved === "true";
				}
			} catch {
				// Local storage disabled or SSR
			}
		}
	}

	private getContext(): AudioContext | null {
		if (typeof window === "undefined") return null;
		if (!this.ctx) {
			const AudioContextClass =
				window.AudioContext ||
				(window as unknown as { webkitAudioContext: typeof AudioContext })
					.webkitAudioContext;
			if (AudioContextClass) {
				this.ctx = new AudioContextClass();
			}
		}
		if (this.ctx && this.ctx.state === "suspended") {
			this.ctx.resume().catch(() => {});
		}
		return this.ctx;
	}

	public isMuted(): boolean {
		return this.muted;
	}

	public setMuted(muted: boolean) {
		this.muted = muted;
		if (typeof window !== "undefined") {
			try {
				localStorage.setItem("le-reminder-sfx-muted", String(muted));
			} catch {
				// Ignored
			}
		}
		for (const listener of this.listeners) {
			listener(this.muted);
		}
	}

	public toggleMute(): boolean {
		this.setMuted(!this.muted);
		return this.muted;
	}

	public subscribe(listener: MuteListener): () => void {
		this.listeners.add(listener);
		return () => {
			this.listeners.delete(listener);
		};
	}

	/**
	 * Subtle high-frequency crystalline glass tick (sine/triangle burst at 3200Hz)
	 * Throttled to max 1 per 40ms to avoid audio overload on rapid mouse sweeps.
	 */
	public playTick() {
		if (this.muted) return;
		const now = performance.now();
		if (now - this.lastTickTime < 45) return;
		this.lastTickTime = now;

		const ctx = this.getContext();
		if (!ctx) return;

		try {
			const t = ctx.currentTime;
			const osc = ctx.createOscillator();
			const gain = ctx.createGain();

			osc.type = "sine";
			osc.frequency.setValueAtTime(3200, t);
			osc.frequency.exponentialRampToValueAtTime(3600, t + 0.025);

			gain.gain.setValueAtTime(0.028, t);
			gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.028);

			osc.connect(gain);
			gain.connect(ctx.destination);

			osc.start(t);
			osc.stop(t + 0.03);
		} catch {
			// Ignore audio context errors
		}
	}

	/**
	 * Satisfying futuristic chord + crisp ice-chime harmonic
	 * (523Hz -> 784Hz -> 1046Hz -> 1568Hz / C5-G5-C6-G6) when completing a task.
	 */
	public playShatterComplete() {
		if (this.muted) return;
		const ctx = this.getContext();
		if (!ctx) return;

		try {
			const frequencies = [523.25, 783.99, 1046.5, 1567.98];
			const t = ctx.currentTime;

			frequencies.forEach((freq, idx) => {
				const osc = ctx.createOscillator();
				const gain = ctx.createGain();

				const noteStart = t + idx * 0.045;
				const noteDuration = 0.45;

				osc.type = idx % 2 === 0 ? "sine" : "triangle";
				osc.frequency.setValueAtTime(freq, noteStart);
				// Subtle icy glide upwards
				osc.frequency.exponentialRampToValueAtTime(
					freq * 1.02,
					noteStart + noteDuration,
				);

				const peakGain = 0.045 / (idx + 1);
				gain.gain.setValueAtTime(0.0001, noteStart);
				gain.gain.linearRampToValueAtTime(peakGain, noteStart + 0.015);
				gain.gain.exponentialRampToValueAtTime(
					0.0001,
					noteStart + noteDuration,
				);

				osc.connect(gain);
				gain.connect(ctx.destination);

				osc.start(noteStart);
				osc.stop(noteStart + noteDuration);
			});
		} catch {
			// Ignore audio context errors
		}
	}

	/**
	 * Deep resonant sub-hum + high crystal shimmer when clicking THE-CORE or replaying [V] intro
	 */
	public playReactorPulse() {
		if (this.muted) return;
		const ctx = this.getContext();
		if (!ctx) return;

		try {
			const t = ctx.currentTime;

			// 1. Sub-bass resonant hum (60Hz -> 85Hz)
			const subOsc = ctx.createOscillator();
			const subGain = ctx.createGain();
			subOsc.type = "sine";
			subOsc.frequency.setValueAtTime(60, t);
			subOsc.frequency.exponentialRampToValueAtTime(85, t + 0.35);
			subOsc.frequency.exponentialRampToValueAtTime(45, t + 0.65);

			subGain.gain.setValueAtTime(0.001, t);
			subGain.gain.linearRampToValueAtTime(0.09, t + 0.08);
			subGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.65);

			subOsc.connect(subGain);
			subGain.connect(ctx.destination);
			subOsc.start(t);
			subOsc.stop(t + 0.66);

			// 2. High crystalline shimmer
			const chimeOsc = ctx.createOscillator();
			const chimeGain = ctx.createGain();
			chimeOsc.type = "triangle";
			chimeOsc.frequency.setValueAtTime(2400, t);
			chimeOsc.frequency.exponentialRampToValueAtTime(1800, t + 0.4);

			chimeGain.gain.setValueAtTime(0.001, t);
			chimeGain.gain.linearRampToValueAtTime(0.035, t + 0.04);
			chimeGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.45);

			chimeOsc.connect(chimeGain);
			chimeGain.connect(ctx.destination);
			chimeOsc.start(t);
			chimeOsc.stop(t + 0.46);
		} catch {
			// Ignore audio context errors
		}
	}
}

export const cryoSound = new CryoSoundEngine();
