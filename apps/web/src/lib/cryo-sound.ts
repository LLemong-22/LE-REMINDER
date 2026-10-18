// Lightweight Web Audio API Synthesizer for LE-REMINDER Cryo-HUD SFX
// Zero external files, ultra-soft low-gain warmth, completely silent on hovers.

type MuteListener = (muted: boolean) => void;

class CryoSoundEngine {
	private ctx: AudioContext | null = null;
	private muted = false;
	private listeners: Set<MuteListener> = new Set();

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
	 * Permanently silent on hover per UI/UX guidelines
	 */
	public playTick() {
		// Silent - hover sounds permanently removed
	}

	/**
	 * Warm, low-frequency muffled glass thud/chime (280Hz -> 440Hz soft sine wave with fast decay)
	 * Only triggers on intentional task completion or reactor click. Max gain soft 0.022.
	 */
	public playShatterComplete() {
		if (this.muted) return;
		const ctx = this.getContext();
		if (!ctx) return;

		try {
			const t = ctx.currentTime;
			const osc = ctx.createOscillator();
			const gain = ctx.createGain();

			osc.type = "sine";
			osc.frequency.setValueAtTime(280, t);
			osc.frequency.exponentialRampToValueAtTime(440, t + 0.12);

			gain.gain.setValueAtTime(0.001, t);
			gain.gain.linearRampToValueAtTime(0.022, t + 0.015);
			gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.28);

			osc.connect(gain);
			gain.connect(ctx.destination);

			osc.start(t);
			osc.stop(t + 0.3);
		} catch {
			// Ignore audio context errors
		}
	}

	/**
	 * Warm, deep resonant sub-hum when clicking THE-CORE or replaying [V] intro (55Hz -> 80Hz)
	 * Max gain 0.025 with smooth exponential decay.
	 */
	public playReactorPulse() {
		if (this.muted) return;
		const ctx = this.getContext();
		if (!ctx) return;

		try {
			const t = ctx.currentTime;
			const osc = ctx.createOscillator();
			const gain = ctx.createGain();

			osc.type = "sine";
			osc.frequency.setValueAtTime(55, t);
			osc.frequency.exponentialRampToValueAtTime(80, t + 0.22);
			osc.frequency.exponentialRampToValueAtTime(45, t + 0.48);

			gain.gain.setValueAtTime(0.001, t);
			gain.gain.linearRampToValueAtTime(0.025, t + 0.04);
			gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);

			osc.connect(gain);
			gain.connect(ctx.destination);

			osc.start(t);
			osc.stop(t + 0.52);
		} catch {
			// Ignore audio context errors
		}
	}
}

export const cryoSound = new CryoSoundEngine();
