"use client";

import { useEffect, useRef, useCallback } from 'react';

export interface PhonemeWeights {
  volume: number;     // Normalized 0.0 - 1.0
  openness: number;   // Low frequencies (vowels, mouthOpen, viseme_AA)
  rounded: number;    // Mid frequencies (formants, viseme_O, viseme_U)
  consonant: number;  // High frequencies (sibilance, viseme_I, viseme_SS)
}

// Global AudioContext singleton to prevent multi-instance audio lockup
let sharedAudioContext: AudioContext | null = null;
let sharedAnalyser: AnalyserNode | null = null;
let sharedDataArray: Uint8Array | null = null;
let sharedConnectedSource: AudioNode | null = null;

function getOrCreateAudioContext(): { ctx: AudioContext; analyser: AnalyserNode; dataArray: Uint8Array } {
  if (typeof window === 'undefined') {
    throw new Error('AudioContext is only available in browser environments');
  }

  if (!sharedAudioContext || sharedAudioContext.state === 'closed') {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    sharedAudioContext = new AudioCtx();
    sharedAnalyser = sharedAudioContext.createAnalyser();
    sharedAnalyser.fftSize = 64; // 32 frequency bins: lightweight & high-speed for 60fps reads
    sharedAnalyser.smoothingTimeConstant = 0.45; // Natural speech momentum
    sharedDataArray = new Uint8Array(sharedAnalyser.frequencyBinCount);
  }

  if (sharedAudioContext.state === 'suspended') {
    sharedAudioContext.resume().catch(() => {});
  }

  return {
    ctx: sharedAudioContext,
    analyser: sharedAnalyser!,
    dataArray: sharedDataArray!,
  };
}

export function useAudioLipSync() {
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const testOscillatorRef = useRef<OscillatorNode | null>(null);

  const initContextOnUserGesture = useCallback(() => {
    if (typeof window !== 'undefined') {
      try {
        const { ctx, analyser, dataArray } = getOrCreateAudioContext();
        audioContextRef.current = ctx;
        analyserRef.current = analyser;
        dataArrayRef.current = dataArray;
      } catch (e) {
        console.warn('AudioContext initialization deferred:', e);
      }
    }
  }, []);

  /**
   * Get raw normalized volume (0.0 to 1.0)
   * Designed to be called inside the useFrame loop without triggering React re-renders.
   */
  const getVolume = useCallback((): number => {
    const analyser = analyserRef.current || sharedAnalyser;
    const dataArray = dataArrayRef.current || sharedDataArray;
    if (!analyser || !dataArray) return 0;

    // @ts-expect-error : strict dom lib mismatch
    analyser.getByteFrequencyData(dataArray);

    let sum = 0;
    const len = dataArray.length;
    for (let i = 0; i < len; i++) {
      sum += dataArray[i];
    }

    const average = sum / len;
    // Normalize 0..255 to 0.0..1.0 with noise gate
    const normalized = average / 255;
    return normalized > 0.02 ? Math.min(normalized * 2.2, 1.0) : 0;
  }, []);

  /**
   * Advanced multi-band speech formant analysis
   * Extracts phoneme features: openness (vowels), rounded (O/U), consonant (sibilants/teeth)
   */
  const getPhonemeWeights = useCallback((): PhonemeWeights => {
    const analyser = analyserRef.current || sharedAnalyser;
    const dataArray = dataArrayRef.current || sharedDataArray;
    if (!analyser || !dataArray) {
      return { volume: 0, openness: 0, rounded: 0, consonant: 0 };
    }

    // @ts-expect-error : strict dom lib mismatch
    analyser.getByteFrequencyData(dataArray);

    // Frequency bands (with fftSize = 64, sampling ~44.1kHz -> ~689Hz per bin)
    // Bin 0-3: 0 - 2.5kHz (Low / Vowel fundamental & Formant 1: A, E, O open jaw)
    // Bin 4-10: 2.5kHz - 7kHz (Mid Formants: lip rounding, tongue position)
    // Bin 11-31: 7kHz - 22kHz (High sibilants: S, T, CH, F consonants)
    let lowSum = 0;
    let midSum = 0;
    let highSum = 0;
    let totalSum = 0;

    for (let i = 0; i < 4; i++) lowSum += dataArray[i];
    for (let i = 4; i < 11; i++) midSum += dataArray[i];
    for (let i = 11; i < 32; i++) highSum += dataArray[i];
    totalSum = lowSum + midSum + highSum;

    const volume = Math.min((totalSum / (32 * 255)) * 2.5, 1.0);
    const openness = Math.min((lowSum / (4 * 255)) * 2.2, 1.0);
    const rounded = Math.min((midSum / (7 * 255)) * 2.0, 1.0);
    const consonant = Math.min((highSum / (21 * 255)) * 2.5, 1.0);

    // Noise gate threshold
    if (volume < 0.02) {
      return { volume: 0, openness: 0, rounded: 0, consonant: 0 };
    }

    return { volume, openness, rounded, consonant };
  }, []);

  /**
   * Connect an HTML Audio or Video element directly into the analyser
   */
  const connectAudioElement = useCallback((element: HTMLMediaElement) => {
    try {
      const { ctx, analyser } = getOrCreateAudioContext();
      if (sharedConnectedSource) {
        try { sharedConnectedSource.disconnect(); } catch {}
      }
      const source = ctx.createMediaElementSource(element);
      source.connect(analyser);
      analyser.connect(ctx.destination);
      sharedConnectedSource = source;
    } catch (err) {
      console.warn('AudioElement connection info:', err);
    }
  }, []);

  /**
   * Connect a live microphone or WebRTC MediaStream
   */
  const connectMediaStream = useCallback((stream: MediaStream) => {
    try {
      const { ctx, analyser } = getOrCreateAudioContext();
      const source = ctx.createMediaStreamSource(stream);
      source.connect(analyser);
    } catch (err) {
      console.warn('Failed to connect MediaStream to AudioLipSync:', err);
    }
  }, []);

  const activeBufferSourceRef = useRef<AudioBufferSourceNode | null>(null);

  /**
   * Play an in-memory AudioBuffer
   */
  const playAudioBuffer = useCallback((buffer: AudioBuffer, onEnded?: () => void) => {
    const { ctx, analyser } = getOrCreateAudioContext();
    
    // BUG FIX: Prevent buffer overlap by stopping previous audio
    if (activeBufferSourceRef.current) {
      try {
        activeBufferSourceRef.current.stop();
        activeBufferSourceRef.current.disconnect();
      } catch (e) {}
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(analyser);
    analyser.connect(ctx.destination);
    source.onended = () => {
      if (onEnded) onEnded();
      if (activeBufferSourceRef.current === source) activeBufferSourceRef.current = null;
    };
    source.start(0);
    
    activeBufferSourceRef.current = source;
    return source;
  }, []);

  /**
   * Play a procedural synthesized sweeping tone to verify lip-sync
   */
  const playTestSpeech = useCallback((durationSeconds: number = 3) => {
    const { ctx, analyser } = getOrCreateAudioContext();

    if (testOscillatorRef.current) {
      try { testOscillatorRef.current.stop(); } catch {}
    }

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(220, ctx.currentTime + durationSeconds * 0.5);
    osc.frequency.linearRampToValueAtTime(130, ctx.currentTime + durationSeconds);

    // Amplitude modulation to simulate syllables
    const step = 0.22;
    for (let t = 0; t < durationSeconds; t += step) {
      gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + t + 0.04);
      gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + t + step);
    }

    osc.connect(gain);
    gain.connect(analyser);
    gain.connect(ctx.destination);
    
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + durationSeconds);
    testOscillatorRef.current = osc;
  }, []);

  const stopAudio = useCallback(() => {
    if (activeBufferSourceRef.current) {
      try {
        activeBufferSourceRef.current.stop();
        activeBufferSourceRef.current.disconnect();
      } catch (e) {}
      activeBufferSourceRef.current = null;
    }
  }, []);

  return {
    getVolume,
    getPhonemeWeights,
    connectAudioElement,
    connectMediaStream,
    playAudioBuffer,
    playTestSpeech,
    stopAudio,
    resumeAudio: initContextOnUserGesture,
    getAudioContext: () => audioContextRef.current || sharedAudioContext,
  };
}
