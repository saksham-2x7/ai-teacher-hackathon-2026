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
let gestureResumeInstalled = false;

/**
 * Autoplay-policy killer: the TTS turns resolve AFTER the click (fetch + SSE
 * round-trips), so a resume() called then is no longer a user gesture and the
 * AudioContext stays suspended forever -> analyser reads zeros -> no lip-sync.
 * Install one-shot global gesture listeners that resume the context the
 * instant the user touches/keys/clicks anywhere.
 */
function installGestureResume() {
  if (typeof window === 'undefined' || gestureResumeInstalled) return;
  gestureResumeInstalled = true;
  const resume = () => {
    if (sharedAudioContext && sharedAudioContext.state === 'suspended') {
      sharedAudioContext.resume().catch(() => {});
    }
  };
  ['pointerdown', 'pointerup', 'touchend', 'keydown', 'mousedown'].forEach((t) => {
    window.addEventListener(t, resume, { passive: true });
  });
}

function getOrCreateAudioContext(): { ctx: AudioContext; analyser: AnalyserNode; dataArray: Uint8Array } {
  if (typeof window === 'undefined') {
    throw new Error('AudioContext is only available in browser environments');
  }

  installGestureResume();

  if (!sharedAudioContext || sharedAudioContext.state === 'closed') {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    sharedAudioContext = new AudioCtx();
    sharedAnalyser = sharedAudioContext.createAnalyser();
    sharedAnalyser.fftSize = 256; // 128 frequency bins: fine-grained speech formants for believable lip-sync
    sharedAnalyser.smoothingTimeConstant = 0.55; // Natural speech momentum
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

    // Frequency bands (fftSize = 256, ~44.1kHz -> ~172Hz per bin, 128 bins total)
    // Bin 0-5:   0 - 1.0kHz  (Low / Vowel fundamental & Formant 1: A, E, O open jaw)
    // Bin 6-20:  1.0 - 3.6kHz (Mid Formants 2-3: lip rounding, tongue position)
    // Bin 21-127: 3.6 - 22kHz  (High sibilants: S, T, CH, F consonants)
    const len = dataArray.length;
    const lowEnd = Math.min(6, len);
    const midEnd = Math.min(21, len);

    let lowSum = 0;
    let midSum = 0;
    let highSum = 0;

    for (let i = 0; i < lowEnd; i++) lowSum += dataArray[i];
    for (let i = lowEnd; i < midEnd; i++) midSum += dataArray[i];
    for (let i = midEnd; i < len; i++) highSum += dataArray[i];
    const totalSum = lowSum + midSum + highSum;

    const volume = Math.min((totalSum / (len * 255)) * 3.0, 1.0);
    const openness = Math.min((lowSum / (lowEnd * 255)) * 2.4, 1.0);
    const rounded = Math.min((midSum / ((midEnd - lowEnd) * 255)) * 2.2, 1.0);
    const consonant = Math.min((highSum / ((len - midEnd) * 255)) * 3.0, 1.0);

    // Noise gate threshold
    if (volume < 0.02) {
      return { volume: 0, openness: 0, rounded: 0, consonant: 0 };
    }

    return { volume, openness, rounded, consonant };
  }, []);

  /**
   * Connect an HTML Audio or Video element directly into the analyser.
   * createMediaElementSource may only be called ONCE per element — reuse a
   * cached source so repeated connects never throw before audio starts.
   */
  const connectAudioElement = useCallback((element: HTMLMediaElement) => {
    try {
      const { ctx, analyser } = getOrCreateAudioContext();
      type SourceElement = HTMLMediaElement & { __lipSyncSource?: MediaElementAudioSourceNode };
      const cached = (element as SourceElement).__lipSyncSource;
      const source: MediaElementAudioSourceNode =
        cached && cached.context === ctx ? cached : ctx.createMediaElementSource(element);
      (element as SourceElement).__lipSyncSource = source;
      if (sharedConnectedSource && sharedConnectedSource !== source) {
        try { sharedConnectedSource.disconnect(); } catch {}
      }
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
