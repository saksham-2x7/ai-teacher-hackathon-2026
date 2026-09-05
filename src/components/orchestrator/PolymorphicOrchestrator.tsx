'use client';
import { Suspense, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAIIntentStore } from '../../store/useAIIntentStore';
import { getRepresentation } from '../../lib/registry/RepresentationRegistry';
import { useShallow } from 'zustand/react/shallow';

export default function PolymorphicOrchestrator() {
  const context = useAIIntentStore(
    useShallow(state => ({
      activeRepresentation: state.activeRepresentation,
      lessonPhase: state.lessonPhase,
      focusTargetId: state.focusTargetId,
      scaffoldLevel: state.scaffoldLevel
    }))
  );

  const Representation = useMemo(() => {
    const entry = getRepresentation(context.activeRepresentation);
    return entry?.component;
  }, [context.activeRepresentation]);

  if (!Representation) {
    return (
      <div className="w-full h-full flex items-center justify-center text-red-500 font-mono">
        Error: Unknown Representation &apos;{context.activeRepresentation}&apos;
      </div>
    );
  }

  return (
    <div className="absolute inset-0 z-10 w-full h-full flex items-center justify-center overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={context.activeRepresentation}
          initial={{ opacity: 0, scale: 0.98, filter: 'blur(10px)' }}
          animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
          exit={{ opacity: 0, scale: 1.02, filter: 'blur(10px)' }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="w-full h-full relative flex items-center justify-center"
        >
          <Suspense fallback={
            <div className="flex flex-col items-center justify-center text-primary/50 font-mono">
              <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
              Initializing {context.activeRepresentation}...
            </div>
          }>
            <Representation context={context} />
          </Suspense>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
