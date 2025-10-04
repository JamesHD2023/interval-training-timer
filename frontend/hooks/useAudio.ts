import { useRef, useCallback, useEffect } from "react";

export function useAudio() {
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioBufferRef = useRef<AudioBuffer | null>(null);

  const getAudioContext = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContextRef.current;
  };

  useEffect(() => {
    const ctx = getAudioContext();
    const sampleRate = ctx.sampleRate;
    const duration = 0.5;
    const buffer = ctx.createBuffer(1, sampleRate * duration, sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < buffer.length; i++) {
      const t = i / sampleRate;
      const fade = Math.max(0, 1 - t / duration);
      data[i] = Math.sin(2 * Math.PI * 880 * t) * fade;
    }
    
    audioBufferRef.current = buffer;
  }, []);

  const playBeep = useCallback(() => {
    try {
      const ctx = getAudioContext();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.frequency.value = 880;
      oscillator.type = "square";

      gainNode.gain.setValueAtTime(1.0, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.5);

      if ("vibrate" in navigator) {
        navigator.vibrate(200);
      }
    } catch (err) {
      console.error("Audio error:", err);
    }
  }, []);

  const playDoubleBeep = useCallback(() => {
    playBeep();
    setTimeout(() => playBeep(), 300);
  }, [playBeep]);

  const playCompletionSound = useCallback(() => {
    const ctx = getAudioContext();
    
    const playTone = (frequency: number, startTime: number, duration: number) => {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.frequency.value = frequency;
      oscillator.type = "square";

      gainNode.gain.setValueAtTime(1.0, startTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

      oscillator.start(startTime);
      oscillator.stop(startTime + duration);
    };

    const now = ctx.currentTime;
    playTone(523, now, 0.25);
    playTone(659, now + 0.3, 0.25);
    playTone(784, now + 0.6, 0.6);

    if ("vibrate" in navigator) {
      navigator.vibrate([200, 100, 200, 100, 400]);
    }
  }, []);

  const speak = useCallback((text: string) => {
    try {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.95;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;
        utterance.lang = "en-US";
        window.speechSynthesis.speak(utterance);
      }
    } catch (err) {
      console.error("Speech error:", err);
    }
  }, []);

  return { playBeep, playDoubleBeep, playCompletionSound, speak };
}
