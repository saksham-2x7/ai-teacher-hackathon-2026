'use client';
import { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LessonHUD, { LessonChatFooter } from './LessonHUD';
import AITeacherPiP from '../teacher/AITeacherPiP';
import LiveAIEngine from './LiveAIEngine';
import QuestionPanel from '../../features/assessment/QuestionPanel';
import { useAIIntentStore } from '../../store/useAIIntentStore';
import { useShallow } from 'zustand/react/shallow';

export default function LessonShell({ children }: { children: ReactNode }) {
  const activeQuestion = useAIIntentStore(
    useShallow(state => state.activeQuestion)
  );

  return (
    <div className="h-screen w-full flex flex-col overflow-hidden brut-bg font-sans">
      {/* Header (in flow, no absolute overlay) */}
      <LessonHUD />

      {/* Body: stage left + avatar rail right */}
      <div data-slot="main" className="flex-1 min-h-0 flex flex-row gap-4 px-4 pb-4">
        {/* Stage */}
        <div className="flex-1 min-w-0 flex flex-col min-h-0 gap-4">
          <div data-slot="stage" className="flex-1 min-h-0 relative overflow-hidden rounded-xl border-[3px] border-black shadow-[6px_6px_0_#000] bg-black">
            {children}
          </div>

          {/* Question dock — sits below the stage, never overlaps */}
          <AnimatePresence>
            {activeQuestion && (
              <motion.div
                key="question-dock"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 12 }}
                className="shrink-0"
              >
                <QuestionPanel question={activeQuestion} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Avatar rail */}
        <div data-slot="rail" className="w-80 xl:w-96 shrink-0 min-h-0 flex flex-col overflow-y-auto">
          <AITeacherPiP />
        </div>
      </div>

      {/* Chat footer at the very bottom */}
      <LessonChatFooter />

      <LiveAIEngine />
    </div>
  );
}