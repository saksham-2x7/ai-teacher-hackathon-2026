'use client';
import { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LessonHUD from './LessonHUD';
import AITeacherPiP from '../teacher/AITeacherPiP';
import LiveAIEngine from './LiveAIEngine';
import QuestionPanel from '../../features/assessment/QuestionPanel';
import { useAIIntentStore } from '../../store/useAIIntentStore';
import { useShallow } from 'zustand/react/shallow';

export default function LessonShell({ children }: { children: ReactNode }) {
  const { activeQuestion } = useAIIntentStore(
    useShallow(state => ({
      activeQuestion: state.activeQuestion
    }))
  );

  return (
    <div className="flex h-screen w-full bg-[#030409] text-white overflow-hidden font-sans relative selection:bg-indigo-500/30">
      {/* Deep Space Background / Noise */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.02] mix-blend-overlay"></div>
        <div className="absolute top-0 inset-x-0 h-[500px] bg-gradient-to-b from-indigo-900/10 to-transparent blur-3xl opacity-50" />
      </div>

      <LessonHUD />
      <main className="absolute inset-0 z-10">
        {children}
      </main>
      
      {/* Assessment Overlay */}
      <AnimatePresence>
        {activeQuestion && (
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="absolute left-10 top-1/2 -translate-y-1/2 z-30"
          >
            <QuestionPanel question={activeQuestion} />
          </motion.div>
        )}
      </AnimatePresence>

      <AITeacherPiP />
      <LiveAIEngine />
    </div>
  );
}
