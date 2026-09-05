import { FastAPILearnerProfile } from '../utils/toFastAPILearnerProfile';
import { LessonPhase, RepresentationId } from '../types/orchestration';
import { TeacherState } from '../types/teacher';
import { QuestionProps } from '../features/assessment/QuestionPanel';
import { speechSynthesizer } from './speechSynthesizer';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || '';

export interface BackendTeachingTurn {
  phase?: LessonPhase;
  message: string;
  teacher_state?: TeacherState;
  question?: QuestionProps | null;
  audio_url?: string;
  audio_base64?: string;
}

export interface BackendVisualIntent {
  representation?: RepresentationId;
  scaffold_level?: number;
  focus_target_id?: string | null;
}

export interface SSECallbacks {
  onTeachingTurn?: (turn: BackendTeachingTurn) => void;
  onVisualIntent?: (intent: BackendVisualIntent) => void;
  onAudioReady?: (audioElement: HTMLAudioElement) => void;
  onError?: (err: Error) => void;
  onConnected?: () => void;
}

class LiveSSEManager {
  private eventSource: EventSource | null = null;
  private audioElement: HTMLAudioElement | null = null;
  private isConnected: boolean = false;

  /**
   * Register or initiate an educator session with FastAPI backend.
   */
  public async createSession(profilePayload: FastAPILearnerProfile): Promise<string> {
    const endpoint = `${BACKEND_URL}/api/v1/sessions`;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(profilePayload),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        const sessionId = data.session_id || data.id || `session_${Date.now()}`;
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('hexagon_session_id', sessionId);
        }
        return sessionId;
      }
    } catch (e) {
      console.warn('Backend session endpoint unavailable, activating resilient local session:', e);
    }

    // Resilient fallback ID for uninterrupted demo
    const fallbackId = `session_local_${Date.now()}`;
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('hexagon_session_id', fallbackId);
    }
    return fallbackId;
  }

  /**
   * Connect to live Server-Sent Events stream:
   * http://localhost:8000/api/v1/sessions/{session_id}/stream
   */
  public connectStream(sessionId: string, callbacks: SSECallbacks): () => void {
    if (typeof window === 'undefined') return () => {};

    this.disconnect();

    const streamUrl = `${BACKEND_URL}/api/v1/sessions/${encodeURIComponent(sessionId)}/stream`;
    console.log(`[SSE] Connecting to live educator stream: ${streamUrl}`);

    try {
      const es = new EventSource(streamUrl);
      this.eventSource = es;

      es.onopen = () => {
        this.isConnected = true;
        console.log('[SSE] Live backend connection established.');
        callbacks.onConnected?.();
      };

      es.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleIncomingChunk(data, callbacks);
        } catch (err) {
          console.warn('[SSE] Raw text payload received:', event.data);
          if (event.data && typeof event.data === 'string') {
            callbacks.onTeachingTurn?.({
              message: event.data,
              teacher_state: 'speaking'
            });
          }
        }
      };

      // Custom event types if dispatched by FastAPI SSE
      es.addEventListener('teaching_turn', (e: MessageEvent) => {
        try {
          const turn = JSON.parse(e.data);
          this.handleIncomingChunk({ turn }, callbacks);
        } catch (err) {
          console.error('[SSE] Failed to parse teaching_turn:', err);
        }
      });

      es.addEventListener('visual_intent', (e: MessageEvent) => {
        try {
          const intent = JSON.parse(e.data);
          this.handleIncomingChunk({ intent }, callbacks);
        } catch (err) {
          console.error('[SSE] Failed to parse visual_intent:', err);
        }
      });

      es.onerror = (e) => {
        console.warn('[SSE] EventSource connection state change/error:', e);
        this.isConnected = false;
        callbacks.onError?.(new Error('SSE connection closed or backend offline'));
      };
    } catch (e) {
      console.warn('[SSE] Could not initialize EventSource:', e);
      callbacks.onError?.(e as Error);
    }

    return () => this.disconnect();
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private handleIncomingChunk(data: any, callbacks: SSECallbacks) {
    // 1. Handle Visual Intent
    const intentData = data.visual_intent || data.intent;
    if (intentData) {
      callbacks.onVisualIntent?.({
        representation: intentData.representation || intentData.representation_id,
        scaffold_level: intentData.scaffold_level,
        focus_target_id: intentData.focus_target_id
      });
    }

    // 2. Handle Teaching Turn
    const turnData = data.teaching_turn || data.turn || (data.message ? data : null);
    if (turnData) {
      const turn: BackendTeachingTurn = {
        phase: turnData.phase,
        message: turnData.message || '',
        teacher_state: turnData.teacher_state || turnData.state || 'speaking',
        question: turnData.question || null,
        audio_url: turnData.audio_url,
        audio_base64: turnData.audio_base64
      };

      callbacks.onTeachingTurn?.(turn);

      // 3. Audio Routing & Lip-Sync Ingestion
      if (turn.audio_url || turn.audio_base64) {
        this.playBackendAudio(turn.audio_url || turn.audio_base64!, callbacks);
      }
    }
  }

  private playBackendAudio(src: string, callbacks: SSECallbacks) {
    if (typeof window === 'undefined') return;

    if (!this.audioElement) {
      this.audioElement = new Audio();
      this.audioElement.crossOrigin = 'anonymous';
    }

    const audio = this.audioElement;
    audio.src = src.startsWith('data:') || src.startsWith('http') 
      ? src 
      : `data:audio/mp3;base64,${src}`;

    callbacks.onAudioReady?.(audio);
    audio.play().catch(e => console.warn('[SSE] Audio autoplay deferred until user interaction:', e));
  }

  public disconnect() {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement.src = '';
    }
    this.isConnected = false;
  }

  public getIsConnected(): boolean {
    return this.isConnected;
  }
}

export const liveSSEClient = new LiveSSEManager();
