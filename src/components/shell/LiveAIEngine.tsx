"use client";
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAIIntentStore } from '../../store/useAIIntentStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useAudioLipSync } from '../../hooks/useAudioLipSync';
import { liveSSEClient } from '../../services/liveSSEClient';
import type { LessonPhase, RepresentationId } from '../../types/orchestration';
import type { TeacherState } from '../../types/teacher';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

export default function LiveAIEngine() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('sessionId') || (typeof window !== 'undefined' ? sessionStorage.getItem('hexagon_session_id') : null);

  const profile = useAuthStore(state => state.profile);
  const tutorGender = profile?.tutorGender || 'female';

  const setRepresentation = useAIIntentStore(state => state.setRepresentation);
  const setLessonPhase = useAIIntentStore(state => state.setLessonPhase);
  const setTeacherState = useAIIntentStore(state => state.setTeacherState);
  const setActiveQuestion = useAIIntentStore(state => state.setActiveQuestion);
  const setScaffoldLevel = useAIIntentStore(state => state.setScaffoldLevel);

  const { connectAudioElement } = useAudioLipSync();
  const [isLiveConnected, setIsLiveConnected] = useState(false);

  // Live SSE Backend Stream Connection
  useEffect(() => {
    if (!sessionId) return;

    const disconnect = liveSSEClient.connectStream(sessionId, {
      onConnected: () => {
        setIsLiveConnected(true);
      },
      onTeachingTurn: (turn) => {
        if (turn.phase) setLessonPhase(turn.phase);
        if (turn.teacher_state) {
          setTeacherState(turn.teacher_state, turn.message);
        }
        if (turn.question !== undefined) {
          setActiveQuestion(turn.question);
        }
        
        // Dynamic TTS trigger
        if (turn.message && !turn.audio_url && !turn.audio_base64) {
           const audioUrl = `${BACKEND_URL}/api/v1/tts?text=${encodeURIComponent(turn.message)}&gender=${tutorGender}`;
           const audioEl = new Audio(audioUrl);
           audioEl.crossOrigin = 'anonymous';
           connectAudioElement(audioEl);
           audioEl.play().catch(e => console.warn("[LiveAIEngine] Audio autoplay deferred:", e));
        }
      },
      onVisualIntent: (intent) => {
        if (intent.representation) setRepresentation(intent.representation);
        if (intent.scaffold_level) setScaffoldLevel(intent.scaffold_level);
      },
      onAudioReady: (audioEl) => {
        connectAudioElement(audioEl);
      },
      onError: () => {
        setIsLiveConnected(false);
      }
    });

    return () => {
      disconnect();
    };
  }, [sessionId, setLessonPhase, setTeacherState, setActiveQuestion, setRepresentation, setScaffoldLevel, connectAudioElement, tutorGender]);

  return null;
}
