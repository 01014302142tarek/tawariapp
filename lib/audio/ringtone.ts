"use client";

/**
 * Universal Web Audio API Ringtone & Chime Engine
 * - Zero external dependencies or network assets (100% offline, zero latency)
 * - Modern melodic telephone ringtone with harmonic overtones
 * - Automatic AudioContext unlock on first user gesture
 * - Device vibration support on supported Android/mobile browsers
 */

let globalAudioCtx: AudioContext | null = null;
let ringtoneLoopTimeout: NodeJS.Timeout | null = null;
let isRingingState = false;

// AudioContext singleton with fallback for Safari/WebKit
function getAudioContext(): AudioContext | null {
    if (typeof window === "undefined") return null;

    if (!globalAudioCtx) {
        const AudioContextClass =
            window.AudioContext ||
            (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioContextClass) {
            globalAudioCtx = new AudioContextClass();
        }
    }

    if (globalAudioCtx && globalAudioCtx.state === "suspended") {
        globalAudioCtx.resume().catch(() => {});
    }

    return globalAudioCtx;
}

/**
 * Unlocks the browser AudioContext on the first user interaction.
 * Browsers block autoplay until the user interacts with the page.
 */
export function unlockAudio(): Promise<boolean> {
    return new Promise((resolve) => {
        if (typeof window === "undefined") {
            resolve(false);
            return;
        }

        const ctx = getAudioContext();
        if (!ctx) {
            resolve(false);
            return;
        }

        if (ctx.state === "running") {
            resolve(true);
            return;
        }

        ctx.resume()
            .then(() => resolve(true))
            .catch(() => resolve(false));
    });
}

// Auto-unlock on window click or touch
if (typeof window !== "undefined") {
    const handleFirstGesture = () => {
        unlockAudio();
        window.removeEventListener("click", handleFirstGesture);
        window.removeEventListener("touchstart", handleFirstGesture);
        window.removeEventListener("keydown", handleFirstGesture);
    };

    window.addEventListener("click", handleFirstGesture, { passive: true });
    window.addEventListener("touchstart", handleFirstGesture, { passive: true });
    window.addEventListener("keydown", handleFirstGesture, { passive: true });
}

/**
 * Synthesizes a melodic telephone chord pulse
 */
function playToneBurst(
    ctx: AudioContext,
    freq1: number,
    freq2: number,
    startTime: number,
    duration: number,
    volume = 0.35
) {
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc1.type = "sine";
    osc2.type = "triangle";

    osc1.frequency.setValueAtTime(freq1, startTime);
    osc2.frequency.setValueAtTime(freq2, startTime);

    // ADSR Envelope: Fast attack, sweet decay
    gainNode.gain.setValueAtTime(0.001, startTime);
    gainNode.gain.exponentialRampToValueAtTime(volume, startTime + 0.04);
    gainNode.gain.exponentialRampToValueAtTime(volume * 0.7, startTime + duration * 0.6);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc1.start(startTime);
    osc2.start(startTime);

    osc1.stop(startTime + duration);
    osc2.stop(startTime + duration);
}

/**
 * Plays a single incoming call ring sequence:
 * Double melodic ring tone (Ding-Ding ... Ding-Ding)
 */
function playRingSequence(ctx: AudioContext) {
    const now = ctx.currentTime;

    // Burst 1 (High chord)
    playToneBurst(ctx, 523.25, 659.25, now, 0.45, 0.35); // C5 + E5
    // Burst 2 (Harmonic answer)
    playToneBurst(ctx, 587.33, 783.99, now + 0.5, 0.5, 0.35); // D5 + G5

    // Vibration pattern on mobile: [vibrate, pause, vibrate, pause]
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
        try {
            navigator.vibrate([350, 150, 350, 150]);
        } catch {
            // Ignore vibration error on restricted environments
        }
    }
}

/**
 * Starts the continuous incoming call ringtone.
 * Repeats every 2.4 seconds until stopped.
 */
export function playIncomingCallRingtone(): boolean {
    if (isRingingState) return true;

    const ctx = getAudioContext();
    if (!ctx) return false;

    isRingingState = true;

    // Ensure audio context is running
    if (ctx.state === "suspended") {
        ctx.resume().catch(() => {});
    }

    const ringLoop = () => {
        if (!isRingingState) return;
        try {
            playRingSequence(ctx);
        } catch (e) {
            console.warn("[Ringtone] Playback error:", e);
        }
        ringtoneLoopTimeout = setTimeout(ringLoop, 2400);
    };

    ringLoop();
    return true;
}

/**
 * Stops the continuous incoming call ringtone.
 */
export function stopIncomingCallRingtone() {
    isRingingState = false;
    if (ringtoneLoopTimeout) {
        clearTimeout(ringtoneLoopTimeout);
        ringtoneLoopTimeout = null;
    }

    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
        try {
            navigator.vibrate(0); // Cancel vibration
        } catch {
            // Ignore
        }
    }
}

/**
 * Returns whether the ringtone is currently playing.
 */
export function isRingtonePlaying(): boolean {
    return isRingingState;
}

/**
 * Plays a short, pleasant notification chime (Tri-tone glass chime)
 * Used for appointment confirmations, turn arrival alerts, etc.
 */
export function playNotificationChime() {
    const ctx = getAudioContext();
    if (!ctx) return;

    if (ctx.state === "suspended") {
        ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;
    // Pleasant 3-note ascending chime (G5 -> B5 -> D6)
    playToneBurst(ctx, 783.99, 783.99, now, 0.15, 0.25);
    playToneBurst(ctx, 987.77, 987.77, now + 0.12, 0.15, 0.25);
    playToneBurst(ctx, 1174.66, 1174.66, now + 0.24, 0.35, 0.3);

    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
        try {
            navigator.vibrate(150);
        } catch {
            // Ignore
        }
    }
}
