export type RepresentationId = 'webgl' | 'node' | 'graph' | 'timeline' | 'diagram' | 'manipulation' | 'text' | 'code';
export type LessonPhase = 'Explain' | 'Hypothesize' | 'Construct' | 'Observe' | 'Resolve' | 'Question' | 'Evaluate';

export interface AIIntentState {
  activeRepresentation: RepresentationId;
  lessonPhase: LessonPhase;
  focusTargetId: string | null;
  scaffoldLevel: number;
}

export interface RepresentationMetadata {
  id: RepresentationId;
  name: string;
  description: string;
  capabilities: string[];
}

export interface RepresentationProps {
  context: AIIntentState;
}
