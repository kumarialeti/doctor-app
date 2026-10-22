// Web Audio API Ringtone Synthesizer
let audioCtx = null;
let ringInterval = null;

export const playRingtone = () => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    
    // Stop any existing instance
    stopRingtone();

    audioCtx = new AudioContext();

    const playChime = () => {
      if (!audioCtx || audioCtx.state === "closed") return;
      
      const now = audioCtx.currentTime;
      const osc1 = audioCtx.createOscillator();
      const osc2 = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      osc1.type = "sine";
      osc2.type = "sine";
      osc1.frequency.setValueAtTime(523.25, now); // C5 note
      osc2.frequency.setValueAtTime(659.25, now); // E5 note

      // Gentle melodic swell and fade
      gainNode.gain.setValueAtTime(0.001, now);
      gainNode.gain.linearRampToValueAtTime(0.08, now + 0.1);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 1.4);

      osc1.connect(gainNode);
      osc2.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 1.5);
      osc2.stop(now + 1.5);
    };

    playChime();
    ringInterval = setInterval(playChime, 2200);
  } catch (err) {
    console.log("Ringtone error", err);
  }
};

export const stopRingtone = () => {
  if (ringInterval) {
    clearInterval(ringInterval);
    ringInterval = null;
  }
  if (audioCtx && audioCtx.state !== "closed") {
    try {
      audioCtx.close();
    } catch (e) {}
    audioCtx = null;
  }
};
