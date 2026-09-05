"use client";
import { useEffect, useState, useRef, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAIIntentStore } from '../../store/useAIIntentStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useAudioLipSync } from '../../hooks/useAudioLipSync';
import { liveSSEClient } from '../../services/liveSSEClient';
import { mapBackendVisualType, mapBackendTeacherState, mapInteractivePromptToQuestion } from '../../services/liveSSEClient';
import { toFastAPILearnerProfile } from '../../utils/toFastAPILearnerProfile';
import type { LessonPhase, RepresentationId } from '../../types/orchestration';
import type { TeacherState } from '../../types/teacher';
import type { QuestionProps } from '../../features/assessment/QuestionPanel';

// Same-origin relative path — the Next.js proxy (/api/* -> backend) handles
// routing, so the browser never makes a cross-site request (no CORS issues).
const TTS_PATH = '/api/v1/tts';

function isRealId(id: string | null | undefined): id is string {
  return !!id && !id.startsWith('session_local_');
}

export default function LiveAIEngine() {
  const searchParams = useSearchParams();

  const [sessionId, setSessionId] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    const fromUrl = searchParams.get('sessionId');
    const stored = sessionStorage.getItem('hexagon_session_id');
    const raw = fromUrl || stored;
    return isRealId(raw) ? raw : null;
  });

  const profile = useAuthStore(state => state.profile);
  const tutorGender = profile?.tutorGender || 'female';

  const setRepresentation = useAIIntentStore(state => state.setRepresentation);
  const setLessonPhase = useAIIntentStore(state => state.setLessonPhase);
  const setTeacherState = useAIIntentStore(state => state.setTeacherState);
  const setActiveQuestion = useAIIntentStore(state => state.setActiveQuestion);
  const setScaffoldLevel = useAIIntentStore(state => state.setScaffoldLevel);
  const setVisualTitle = useAIIntentStore(state => state.setVisualTitle);

  const { connectAudioElement, resumeAudio } = useAudioLipSync();
  const [isLiveConnected, setIsLiveConnected] = useState(false);

  // ---- Learn-first quiz gate: hold a question until the teaching message has
  // been delivered long enough to actually be heard, then reveal it. ----
  const lastSpokenRef = useRef('');
  const pendingQuestionRef = useRef<QuestionProps | null>(null);
  const questionTimerRef = useRef<number | null>(null);

  const clearQuestionTimer = () => {
    if (questionTimerRef.current !== null) {
      window.clearTimeout(questionTimerRef.current);
      questionTimerRef.current = null;
    }
  };

  const scheduleQuestion = useCallback((q: QuestionProps) => {
    // If a quiz is already on screen, swap it in immediately (no flicker).
    if (useAIIntentStore.getState().activeQuestion) {
      useAIIntentStore.getState().setActiveQuestion(q);
      return;
    }
    pendingQuestionRef.current = q;
    clearQuestionTimer();
    const delaySec = Math.min(8, Math.max(2.5, 1.5 + lastSpokenRef.current.length / 25));
    questionTimerRef.current = window.setTimeout(() => {
      pendingQuestionRef.current = null;
      useAIIntentStore.getState().setActiveQuestion(q);
    }, delaySec * 1000);
  }, []);

  useEffect(() => () => clearQuestionTimer(), []);

  // Unlock the shared AudioContext on the first user gesture so TTS + lip-sync
  // are allowed by the browser autoplay policy.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const unlock = () => {
      resumeAudio();
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
    };
    window.addEventListener('pointerdown', unlock);
    window.addEventListener('keydown', unlock);
    return () => {
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
    };
  }, [resumeAudio]);

  // Ensure a real backend session exists before the stage becomes interactive.
  useEffect(() => {
    if (sessionId) return;

    let cancelled = false;
    liveSSEClient.createSession(
      toFastAPILearnerProfile(profile, useAIIntentStore.getState().activeTopic)
    ).then(id => {
      if (!cancelled && isRealId(id)) setSessionId(id);
    });

    return () => {
      cancelled = true;
    };
  }, [sessionId, profile]);

  // Backfill the last teaching turn from session history so a reloaded page
  // immediately shows the current lesson content.
  useEffect(() => {
    if (!sessionId || !isRealId(sessionId)) return;
    let cancelled = false;

    liveSSEClient.getSession(sessionId).then(session => {
      if (cancelled || !session) return;
      const history = session.history || [];
      if (!history.length) return;
      const last = history[history.length - 1];
      if (session.current_topic) useAIIntentStore.getState().setActiveTopic(session.current_topic);
      const intent = last?.visual_intent;
      if (intent) {
        const repr = mapBackendVisualType(intent.type);
        if (repr) setRepresentation(repr);
        if (intent.payload) setVisualTitle(String(intent.payload));
      }
      if (last?.spoken_text) {
        // Backfill shows history with no live audio — idle pose, caption stays
        setTeacherState('listening', String(last.spoken_text));
        lastSpokenRef.current = String(last.spoken_text);
      }
      if (last?.interactive_prompt) {
        const q = mapInteractivePromptToQuestion(last.interactive_prompt);
        if (q) scheduleQuestion(q);
      }
    }).catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [sessionId, setRepresentation, setVisualTitle, setTeacherState, setActiveQuestion, scheduleQuestion]);

  // Live SSE Backend Stream Connection
  useEffect(() => {
    if (!sessionId || !isRealId(sessionId)) return;

    const disconnect = liveSSEClient.connectStream(sessionId, {
      onConnected: () => {
        setIsLiveConnected(true);
      },
      onTeachingTurn: (turn) => {
        if (turn.phase) setLessonPhase(turn.phase);
        if (turn.teacher_state) {
          setTeacherState(turn.teacher_state, turn.message);
        }
        if (turn.message) {
          lastSpokenRef.current = turn.message;
        }
        if (turn.question === null || turn.question === undefined) {
          pendingQuestionRef.current = null;
          clearQuestionTimer();
          setActiveQuestion(null);
        } else {
          scheduleQuestion(turn.question);
        }

        // Dynamic TTS through the same-origin proxy
        if (turn.message && !turn.audio_url && !turn.audio_base64) {
          resumeAudio();
          const audioUrl = `${TTS_PATH}?text=${encodeURIComponent(turn.message)}&gender=${tutorGender}`;
          const audioEl = new Audio(audioUrl);
          audioEl.crossOrigin = 'anonymous';
          connectAudioElement(audioEl);
          audioEl.addEventListener('play', () => setTeacherState('speaking', turn.message));
          audioEl.addEventListener('ended', () => setTeacherState('listening', turn.message));
          audioEl.play().catch(e => {
            console.warn("[LiveAIEngine] Audio autoplay deferred:", e);
            setTeacherState('listening', turn.message);
          });
        }
      },
      onVisualIntent: (intent) => {
        if (intent.representation) setRepresentation(intent.representation);
        if (intent.scaffold_level) setScaffoldLevel(intent.scaffold_level);
        if (intent.payload) setVisualTitle(intent.payload);
      },
      onAudioReady: (audioEl) => {
        connectAudioElement(audioEl);
        audioEl.addEventListener('ended', () => setTeacherState('listening', ''));
      },
      onError: () => {
        setIsLiveConnected(false);
      }
    });

    return () => {
      disconnect();
    };
  }, [sessionId, setLessonPhase, setTeacherState, setActiveQuestion, setRepresentation, setScaffoldLevel, connectAudioElement, tutorGender, setVisualTitle]);

  return null;
}