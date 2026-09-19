// Web Audio API synthesizer for crisp, charming game sound effects

class SoundManager {
  private ctx: AudioContext | null = null;
  public isMuted: boolean = false;
  public isUserPaused: boolean = false;
  private bgAudio: HTMLAudioElement | null = null;
  private bgVolume: number = 0.5;
  private currentAudioSrc: string | null = null;
  private musicEnabled: boolean = true;
  private hasInteracted: boolean = false;
  private listeners: Set<() => void> = new Set();

  constructor() {
    if (typeof window !== 'undefined') {
      this.ensureAudioElement();

      const onUserInteraction = () => {
        this.hasInteracted = true;
        if (this.ctx && this.ctx.state === 'suspended') {
          this.ctx.resume().catch(() => {});
        }
        // Only attempt to start on ambient interaction if the user did NOT pause it
        if (!this.isUserPaused && this.bgAudio && this.currentAudioSrc && this.musicEnabled && !this.isMuted) {
          if (this.bgAudio.paused) {
            this.bgAudio.play().then(() => this.notifyChange()).catch(() => {});
          }
        }
      };

      // Standard user activation listeners (avoid pointerdown to prevent racing with button click events)
      window.addEventListener('click', onUserInteraction, { passive: true });
      window.addEventListener('touchstart', onUserInteraction, { passive: true });
      window.addEventListener('keydown', onUserInteraction, { passive: true });
    }
  }

  private ensureAudioElement(): HTMLAudioElement | null {
    if (typeof window === 'undefined') return null;
    if (!this.bgAudio) {
      this.bgAudio = new Audio();
      this.bgAudio.loop = true;
      this.bgAudio.preload = 'auto';
      (this.bgAudio as any).playsInline = true;

      this.bgAudio.addEventListener('play', () => this.notifyChange());
      this.bgAudio.addEventListener('pause', () => this.notifyChange());
      this.bgAudio.addEventListener('ended', () => this.notifyChange());
      this.bgAudio.addEventListener('error', (e) => {
        console.warn('Error en elemento de audio de fondo:', e);
        this.notifyChange();
      });
    }
    return this.bgAudio;
  }

  // Subscribe to playback status changes
  public subscribe(cb: () => void): () => void {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }

  private notifyChange() {
    this.listeners.forEach((cb) => {
      try { cb(); } catch {}
    });
  }

  // Configure background music source, volume and state
  setMusicSource(url: string | null | undefined, volume = 0.5, enabled = true) {
    this.bgVolume = Math.max(0, Math.min(1, volume));
    this.musicEnabled = enabled;

    const audio = this.ensureAudioElement();
    if (!audio) return;

    if (!url || !enabled) {
      audio.pause();
      this.currentAudioSrc = null;
      this.notifyChange();
      return;
    }

    audio.volume = this.isMuted ? 0 : this.bgVolume;

    if (this.currentAudioSrc !== url) {
      this.currentAudioSrc = url;
      audio.src = url;
    }

    if (!this.isMuted && this.musicEnabled) {
      this.playMusic();
    }
  }

  setMusicVolume(volume: number) {
    this.bgVolume = Math.max(0, Math.min(1, volume));
    if (this.bgAudio) {
      this.bgAudio.volume = this.isMuted ? 0 : this.bgVolume;
    }
  }

  setMusicEnabled(enabled: boolean) {
    this.musicEnabled = enabled;
    if (!enabled && this.bgAudio) {
      this.bgAudio.pause();
    } else if (enabled && this.bgAudio && this.currentAudioSrc && !this.isMuted) {
      this.playMusic();
    }
    this.notifyChange();
  }

  playMusic(): Promise<boolean> {
    this.hasInteracted = true;
    this.isUserPaused = false;
    const audio = this.ensureAudioElement();
    if (!audio || !this.currentAudioSrc || this.isMuted || !this.musicEnabled) {
      return Promise.resolve(false);
    }

    audio.volume = this.isMuted ? 0 : this.bgVolume;

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      return playPromise
        .then(() => {
          this.notifyChange();
          return true;
        })
        .catch((err) => {
          console.log('Esperando interacción para reproducir música de fondo:', err);
          return false;
        });
    }
    this.notifyChange();
    return Promise.resolve(true);
  }

  pauseMusic(byUser = true) {
    if (byUser) {
      this.isUserPaused = true;
    }
    if (this.bgAudio) {
      this.bgAudio.pause();
      this.notifyChange();
    }
  }

  toggleMusic(): boolean {
    if (this.isPlayingMusic) {
      this.pauseMusic(true);
      return false;
    } else {
      this.playMusic();
      return true;
    }
  }

  get isPlayingMusic(): boolean {
    return Boolean(this.bgAudio && !this.bgAudio.paused && !this.isMuted);
  }

  get hasMusicTrack(): boolean {
    return Boolean(this.currentAudioSrc && this.musicEnabled);
  }

  setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.bgAudio) {
      if (this.isMuted) {
        this.bgAudio.volume = 0;
        this.bgAudio.pause();
      } else {
        this.bgAudio.volume = this.bgVolume;
        if (this.currentAudioSrc && this.musicEnabled) {
          this.playMusic();
        }
      }
    }
    this.notifyChange();
  }

  private getContext(): AudioContext | null {
    if (this.isMuted) return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  // Play a soft bubble pop or heart collection chime
  playPop(pitchMultiplier = 1) {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      const baseFreq = 523.25 * pitchMultiplier; // C5
      osc.frequency.setValueAtTime(baseFreq, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, ctx.currentTime + 0.12);

      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch {
      // Audio autoplay policy fallback
    }
  }

  // Play a sweet harmonic chime (e.g. for trivia answer / right selection)
  playChime() {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const notes = [587.33, 739.99, 880.00]; // D5, F#5, A5 (D major triad)
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);

        gain.gain.setValueAtTime(0.15, ctx.currentTime + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.08 + 0.4);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + idx * 0.08);
        osc.stop(ctx.currentTime + idx * 0.08 + 0.45);
      });
    } catch {}
  }

  // Play a cute "boing / dodge" sound when clicking "No"
  playDodge() {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(180, ctx.currentTime + 0.1);
      osc.frequency.linearRampToValueAtTime(260, ctx.currentTime + 0.2);

      gain.gain.setValueAtTime(0.18, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.23);
    } catch {}
  }

  // Play camera shutter sound effect for photos
  playShutter() {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      // First click
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(800, ctx.currentTime);
      osc1.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.04);
      gain1.gain.setValueAtTime(0.2, ctx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(ctx.currentTime);
      osc1.stop(ctx.currentTime + 0.05);

      // Second release click
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(1200, ctx.currentTime + 0.06);
      osc2.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.12);
      gain2.gain.setValueAtTime(0.2, ctx.currentTime + 0.06);
      gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.13);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(ctx.currentTime + 0.06);
      osc2.stop(ctx.currentTime + 0.14);
    } catch {}
  }

  // Play card flip swoosh
  playFlip() {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(350, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(700, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.1);
    } catch {}
  }

  // Play magical chest unlock sound
  playMagicUnlock() {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const freqs = [440, 554.37, 659.25, 880, 1108.73, 1318.51];
      freqs.forEach((f, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, ctx.currentTime + i * 0.06);

        gain.gain.setValueAtTime(0.15, ctx.currentTime + i * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.06 + 0.35);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + i * 0.06);
        osc.stop(ctx.currentTime + i * 0.06 + 0.4);
      });
    } catch {}
  }

  // Play celebration fanfare when answering "SÍ"
  playCelebration() {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      // Romantic triumphant arpeggio sequence
      const melody = [
        { f: 523.25, d: 0.15, t: 0 },       // C5
        { f: 659.25, d: 0.15, t: 0.15 },    // E5
        { f: 783.99, d: 0.15, t: 0.30 },    // G5
        { f: 1046.50, d: 0.35, t: 0.45 },   // C6
        { f: 880.00, d: 0.18, t: 0.80 },    // A5
        { f: 1046.50, d: 0.6, t: 1.0 },     // C6 long
      ];

      melody.forEach(({ f, d, t }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, ctx.currentTime + t);

        gain.gain.setValueAtTime(0.25, ctx.currentTime + t);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + t + d);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + t);
        osc.stop(ctx.currentTime + t + d + 0.05);
      });
    } catch {}
  }
}

export const sound = new SoundManager();
