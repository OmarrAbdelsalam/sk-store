/**
 * Plays a pleasant "ding" notification sound using Web Audio API.
 * No external file needed.
 */
export function playOrderSound() {
  if (typeof window === 'undefined') return;

  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();

    const playTone = (freq: number, startTime: number, duration: number, gain: number) => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);

      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(gain, startTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

      osc.start(startTime);
      osc.stop(startTime + duration);
    };

    const now = ctx.currentTime;
    // Three ascending tones — pleasant cash register style
    playTone(523.25, now,        0.3, 0.4); // C5
    playTone(659.25, now + 0.15, 0.3, 0.4); // E5
    playTone(783.99, now + 0.30, 0.5, 0.5); // G5
  } catch (e) {
    // Silently fail if audio context not available
  }
}
