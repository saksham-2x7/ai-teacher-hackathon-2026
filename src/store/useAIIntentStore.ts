import { create } from 'zustand';
import { AIIntentState, LessonPhase, RepresentationId } from '../types/orchestration';
import { TeacherState } from '../types/teacher';
import { QuestionProps } from '../features/assessment/QuestionPanel';

interface AIIntentStore extends AIIntentState {
  teacherState: TeacherState;
  teacherMessage: string;
  activeQuestion: QuestionProps | null;
  activeTopic: string;
  visualTitle: string;
  setRepresentation: (id: RepresentationId) => void;
  setLessonPhase: (phase: LessonPhase) => void;
  setScaffoldLevel: (level: number) => void;
  setTeacherState: (state: TeacherState, message: string) => void;
  setActiveQuestion: (question: QuestionProps | null) => void;
  setActiveTopic: (topic: string) => void;
  setVisualTitle: (title: string) => void;
}

export const useAIIntentStore = create<AIIntentStore>((set) => ({
  activeRepresentation: 'text',
  lessonPhase: 'Explain',
  focusTargetId: null,
  scaffoldLevel: 3, // High scaffolding
  teacherState: 'idle',
  teacherMessage: '',
  activeQuestion: null,
  activeTopic: 'Photosynthesis',
  visualTitle: '',

  setRepresentation: (id) => set({ activeRepresentation: id }),
  setLessonPhase: (phase) => set({ lessonPhase: phase }),
  setScaffoldLevel: (level) => set({ scaffoldLevel: level }),
  setTeacherState: (state, message) => set({ teacherState: state, teacherMessage: message }),
  setActiveQuestion: (question) => set({ activeQuestion: question }),
  setActiveTopic: (topic) => set({ activeTopic: topic }),
  setVisualTitle: (title) => set({ visualTitle: title }),
}));
