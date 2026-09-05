import { CreateSessionPayload } from '../utils/toFastAPILearnerProfile';
import { LessonPhase, RepresentationId } from '../types/orchestration';
import { TeacherState } from '../types/teacher';
import { QuestionProps } from '../features/assessment/QuestionPanel';
import { speechSynthesizer } from './speechSynthesizer';

const BACKEND_URL = (process.env.NEXT_PUBLIC_BACKEND_URL || '').replace(/\/+$/, '');

// Dev's Next proxy buffers text/event-stream for browser connections, so the
// SSE client talks to the backend directly and relies on its "*" CORS config.
const STREAM_BASE = BACKEND_URL || 'http://127.0.0.1:8000';

// Maps the backend's pedagogic visual-intent type onto the representation
// available in the frontend registry.
const VISUAL_TYPE_TO_REPRESENTATION: Record<string, RepresentationId> = {
  text: 'text',
  equation: 'text',
  diagram_ref: 'diagram',
  diagram: 'diagram',
  code: 'code',
  timeline: 'timeline',
};

// Maps backend TeachingState enum values onto the frontend teacher personality states.
const TEACHER_STATE_MAP: Record<string, TeacherState> = {
  IDLE: 'idle',
  LISTENING: 'listening',
  THINKING: 'thinking',
  TEACHING: 'teaching',
  CORRECTING: 'correcting',
  CELEBRATING: 'celebrating',
  PAUSED: 'paused',
  'WAIT_FOR_ANSWER': 'waiting',
  'AWAITING_STUDENT_INPUT': 'waiting'
};

export function mapBackendTeacherState(raw: string | null | undefined): TeacherState {
  return TEACHER_STATE_MAP[String(raw ?? '').toUpperCase()] || 'speaking';
}

export function mapBackendVisualType(type: string | null | undefined): RepresentationId | undefined {
  if (!type) return undefined;
  const repr = VISUAL_TYPE_TO_REPRESENTATION[type];
  return repr || (type as RepresentationId);
}

export function mapInteractivePromptToQuestion(prompt: unknown): QuestionProps | null {
  if (!prompt || typeof prompt !== 'object') return null;
  const p = prompt as { prompt_type?: string; question_text?: string; options?: string[] };
  if (!p.question_text) return null;

  const isMcq = p.prompt_type === 'mcq';
  return {
    id: `q_${Date.now()}`,
    type: isMcq ? 'multiple_choice' : 'hypothesis',
    prompt: p.question_text,
    options: isMcq ? p.options || [] : undefined
  };
}

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
  payload?: string;
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
  public async createSession(profilePayload: CreateSessionPayload): Promise<string> {
    const endpoint = `${BACKEND_URL}/api/v1/sessions`;

    // Optional user-supplied API key, sent as a header so the backend can use
    // it instead of the shared server key for this session.
    let apiKey = '';
    if (typeof window !== 'undefined') {
      try {
        const raw = window.localStorage.getItem('hexagon-config');
        if (raw) apiKey = JSON.parse(raw)?.state?.geminiApiKey || '';
      } catch {
        apiKey = '';
      }
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(apiKey ? { 'X-API-Key': apiKey } : {})
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
   * Fetch the full session (including turn history) so a freshly loaded page
   * can re-render the last teacher turn without waiting for a new streamed one.
   */
  public async getSession(sessionId: string): Promise<Record<string, any> | null> {
    try {
      const res = await fetch(`${STREAM_BASE}/api/v1/sessions/${encodeURIComponent(sessionId)}`);
      if (!res.ok) return null;
      return res.json();
    } catch {
      return null;
    }
  }

  /**
   * Connect to live Server-Sent Events stream:
   * http://localhost:8000/api/v1/sessions/{session_id}/stream
   */
  public connectStream(sessionId: string, callbacks: SSECallbacks): () => void {
    if (typeof window === 'undefined') return () => {};

    this.disconnect();

    const streamUrl = `${STREAM_BASE}/api/v1/sessions/${encodeURIComponent(sessionId)}/stream`;
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
      const explicitRepresentation = intentData.representation || intentData.representation_id;
      const representation: RepresentationId | undefined =
        explicitRepresentation ||
        VISUAL_TYPE_TO_REPRESENTATION[intentData.type || (data.visual_intent && data.visual_intent.type)];

      callbacks.onVisualIntent?.({
        representation,
        scaffold_level: intentData.scaffold_level,
        focus_target_id: intentData.focus_target_id,
        payload: intentData.payload || intentData.title
      });
    }

    // 2. Handle Teaching Turn — backend streams TeachingTurn bodies with
    //    "spoken_text", a "visual_intent" and "state" at the top level.
    const turnData =
      data.teaching_turn || data.turn || (typeof data.spoken_text === 'string' ? data : data.message ? data : null);
    if (turnData) {
      const turn: BackendTeachingTurn = {
        phase: turnData.phase,
        message: turnData.message || turnData.spoken_text || '',
        teacher_state: mapBackendTeacherState(turnData.teacher_state || turnData.state),
        question: turnData.question || mapInteractivePromptToQuestion(turnData.interactive_prompt),
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
