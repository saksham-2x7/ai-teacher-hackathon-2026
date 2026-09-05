'use client';
import { useEffect } from 'react';
import LessonShell from '../../../components/shell/LessonShell';
import PolymorphicOrchestrator from '../../../components/orchestrator/PolymorphicOrchestrator';
import { useAIIntentStore } from '../../../store/useAIIntentStore';

const KNOWN_TOPICS: Record<string, string> = {
  'electricity-1': 'Electricity & Circuits',
  'electricity-circuits': 'Electricity & Circuits',
  'photosynthesis-1': 'Photosynthesis',
  'photosynthesis': 'Photosynthesis',
  'demo-123': 'Photosynthesis',
  'newton-1': 'Newton\'s Laws of Motion',
  'newtons-laws-of-motion': 'Newton\'s Laws of Motion'
};

function inferTopic(id: string): string {
  if (KNOWN_TOPICS[id]) return KNOWN_TOPICS[id];
  const pretty = id
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
  return pretty || 'Photosynthesis';
}

export default function LessonPage({ params }: { params: Promise<{ id: string }> }) {
  const setActiveTopic = useAIIntentStore(s => s.setActiveTopic);

  useEffect(() => {
    let cancelled = false;
    params.then(({ id }) => {
      if (!cancelled) setActiveTopic(inferTopic(id));
    });
    return () => {
      cancelled = true;
    };
  }, [params, setActiveTopic]);

  return (
    <LessonShell>
      <PolymorphicOrchestrator />
    </LessonShell>
  );
}