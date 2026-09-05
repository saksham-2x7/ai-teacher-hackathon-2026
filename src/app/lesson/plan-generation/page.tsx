"use client";
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAIIntentStore } from '../../../store/useAIIntentStore';
import { Suspense } from 'react';
import BackButton from '../../../components/ui/BackButton';

function topicSlug(topic: string): string {
  const base = (topic || 'lesson')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return base || 'lesson';
}

function PlanGenerationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setLessonPhase = useAIIntentStore(state => state.setLessonPhase);

  const [loadingText, setLoadingText] = useState('Analyzing learning goals...');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const states = [
      'Looking at what you want to learn...',
      'Picking the best way to teach it...',
      'Warming up your AI Teacher...',
      'Writing your lesson plan...'
    ];

    let current = 0;
    const textInterval = setInterval(() => {
      if (current < states.length) {
        setLoadingText(states[current]);
        current++;
      }
    }, 1200);

    const progInterval = setInterval(() => {
      setProgress(p => Math.min(p + 3, 100));
    }, 140);

    return () => {
      clearInterval(textInterval);
      clearInterval(progInterval);
    };
  }, []);

  useEffect(() => {
    if (progress !== 100) return;
    setLessonPhase('Explain');
    const topic = searchParams.get('topic') || 'Photosynthesis';
    const sessionId = searchParams.get('sessionId') || '';
    const query = sessionId ? `?sessionId=${encodeURIComponent(sessionId)}` : '';
    router.push(`/lesson/${topicSlug(topic)}${query}`);
  }, [progress, router, setLessonPhase, searchParams]);

  return (
    <div className="flex flex-col items-center max-w-md w-full gap-8">
        <div className="relative w-32 h-32 flex items-center justify-center">
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
          <h2 className="text-xl font-semibold text-hexagon-text-primary tracking-wide">Preparing Your Lesson</h2>
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
      <BackButton className="absolute top-6 left-6 z-20" href="/home" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-hexagon-accent/5 rounded-full blur-[120px] pointer-events-none" />

      <Suspense fallback={
        <div className="text-hexagon-accent font-mono animate-pulse">Loading...</div>
      }>
        <PlanGenerationContent />
      </Suspense>
    </div>
  );
}