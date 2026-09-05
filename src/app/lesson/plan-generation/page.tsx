"use client";
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAIIntentStore } from '../../../store/useAIIntentStore';
import { Suspense } from 'react';

function PlanGenerationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setLessonPhase = useAIIntentStore(state => state.setLessonPhase);
  const setRepresentation = useAIIntentStore(state => state.setRepresentation);
  
  const [loadingText, setLoadingText] = useState('Analyzing learning goals...');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Sequence of loading states
    const states = [
      'Constructing knowledge graph...',
      'Assembling polymporphic representations...',
      'Initializing AI Teacher personality...',
      'Generating tailored lesson plan...'
    ];
    
    let current = 0;
    const textInterval = setInterval(() => {
      if (current < states.length) {
        setLoadingText(states[current]);
        current++;
      }
    }, 1500);

    const progInterval = setInterval(() => {
      setProgress(p => Math.min(p + 2, 100));
    }, 100);

    const totalTimer = setTimeout(() => {
      setLessonPhase('Explain');
      setRepresentation('webgl');
      const sessionId = searchParams.get('sessionId') || '';
      router.push(`/lesson/demo-123${sessionId ? `?sessionId=${encodeURIComponent(sessionId)}` : ''}`);
    }, 5500);

    return () => {
      clearInterval(textInterval);
      clearInterval(progInterval);
      clearTimeout(totalTimer);
    };
  }, [router, setLessonPhase, setRepresentation]);

  return (
    <div className="flex flex-col items-center max-w-md w-full gap-8">
        <div className="relative w-32 h-32 flex items-center justify-center">
          {/* Hexagon Spinner */}
          <motion.div 
            className="absolute inset-0 border-t-2 border-hexagon-accent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
          />
          <motion.div 
            className="absolute inset-4 border-b-2 border-white/50 rounded-full"
            animate={{ rotate: -360 }}
            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
          />
          <span className="font-mono text-hexagon-accent text-xl font-bold">{progress}%</span>
        </div>

        <div className="text-center space-y-2">
          <h2 className="text-xl font-semibold text-hexagon-text-primary tracking-wide">Building Your Experience</h2>
          <p className="text-sm text-hexagon-text-secondary font-mono h-6">{loadingText}</p>
        </div>

        <div className="w-full h-1 bg-hexagon-surface overflow-hidden rounded-full">
          <motion.div 
            className="h-full bg-hexagon-accent"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
  );
}

export default function PlanGenerationPage() {
  return (
    <div className="min-h-screen bg-hexagon-dark flex items-center justify-center p-6 relative overflow-hidden">
      {/* Cinematic Background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-hexagon-accent/5 rounded-full blur-[120px] pointer-events-none" />
      
      <Suspense fallback={
        <div className="text-hexagon-accent font-mono animate-pulse">Loading...</div>
      }>
        <PlanGenerationContent />
      </Suspense>
    </div>
  );
}
