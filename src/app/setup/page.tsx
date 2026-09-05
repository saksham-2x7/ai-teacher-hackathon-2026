'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Clock, Upload, X, CheckCircle, Loader2, FileText, Hexagon, ArrowRight, Home } from 'lucide-react';
import { LearnerProfile } from '../../types/learner';
import { toFastAPILearnerProfile } from "@/utils/toFastAPILearnerProfile";
import { liveSSEClient } from "@/services/liveSSEClient";
import { useAIIntentStore } from "@/store/useAIIntentStore";
import Link from 'next/link';

const TOPIC_SUGGESTIONS = [
  'Photosynthesis',
  'Electricity & Circuits',
  'Newton\'s Laws of Motion',
  'Chemical Reactions',
  'Solar System & Planets',
  'Fractions & Percentages',
  'World War 2',
  'Computer Programming Basics'
];

const TIME_OPTIONS = [10, 15, 20, 30, 45];

function topicSlug(topic: string): string {
  const s = topic.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  return s || 'lesson';
}

export default function SetupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setActiveTopic = useAIIntentStore(s => s.setActiveTopic);

  const [topic, setTopic] = useState('');
  const [minutes, setMinutes] = useState<number | null>(20);
  const [materialFile, setMaterialFile] = useState<{ name: string; fileId: string } | null>(null);
  const [materialState, setMaterialState] = useState<'idle' | 'uploading' | 'processing' | 'ready' | 'error'>('idle');
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isStarting, setIsStarting] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => {
    const q = searchParams?.get('topic');
    if (q) setTopic(q);
  }, [searchParams]);

  const processFile = async (selectedFile: File) => {
    setMaterialState('uploading');
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('student_id', 'demo_student');

      const res = await fetch('/api/v1/materials/upload', { method: 'POST', body: formData });
      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      const fileId = data.file_id;
      setMaterialFile({ name: selectedFile.name, fileId });

      setMaterialState('processing');
      const poll = setInterval(async () => {
        try {
          const statusRes = await fetch(`/api/v1/materials/${fileId}`);
          if (statusRes.ok) {
            const statusData = await statusRes.json();
            if (statusData.status === 'ready' || statusData.status === 'READY') {
              clearInterval(poll);
              setMaterialState('ready');
            } else if (statusData.status === 'processing' || statusData.status === 'PROCESSING') {
              setMaterialState('processing');
            }
          }
        } catch { /* ignore */ }
      }, 1000);
    } catch (err) {
      console.error(err);
      setMaterialState('error');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files?.[0]) processFile(e.dataTransfer.files[0]);
  };

  const startLesson = async () => {
    if (isStarting) return;
    setIsStarting(true);
    const resolvedTopic = topic.trim() || 'Photosynthesis';
    setActiveTopic(resolvedTopic);

    const profile: LearnerProfile = {
      topic: resolvedTopic,
      depthLevel: 3,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      learningStyle: 'visual' as any,
      hasMaterials: !!materialFile,
    };

    const fastApiPayload = toFastAPILearnerProfile(
      { ...profile, level: 'intermediate', tutorGender: 'female', dailyGoalMinutes: minutes || 20 },
      resolvedTopic
    );

    let sessionId = `session_${Date.now()}`;
    try {
      sessionId = await liveSSEClient.createSession({
        ...fastApiPayload,
        material_id: materialFile?.fileId || null
      });
    } catch (e) {
      console.warn("Session initiation error:", e);
    }

    router.push(`/lesson/${topicSlug(resolvedTopic)}?sessionId=${encodeURIComponent(sessionId)}`);
  };

  if (!mounted) return null;

  const materialStatusText =
    materialState === 'uploading' ? 'Reading material...' :
    materialState === 'processing' ? 'Building concept map...' :
    materialState === 'ready' ? 'INDEXED — lesson will use it' : '';

  return (
    <div className="min-h-screen brut-bg flex flex-col items-center justify-center px-6 py-10 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none opacity-[0.05]" style={{ backgroundImage: 'url("/noise.svg")' }} />

      <Link href="/home" className="absolute top-6 left-6 z-20 brut-btn brut-secondary px-4 py-2 text-xs flex items-center gap-1.5">
        <Home className="w-4 h-4" /> HOME
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-xl relative z-10"
      >
        <div className="flex items-center gap-3 mb-4">
          <span className="w-10 h-10 brut-card brut-hex flex items-center justify-center rotate-45">
            <Hexagon className="w-5 h-5 -rotate-45 text-black" />
          </span>
          <h1 className="text-4xl font-black tracking-tighter text-black">NEW LESSON</h1>
        </div>

        <div className="brut-card p-6 space-y-6">
          {/* TOPIC */}
          <div className="space-y-3">
            <label className="brut-tag">What do you want to learn?</label>
            <input
              type="text"
              autoFocus
              value={topic}
              onChange={e => setTopic(e.target.value)}
              placeholder="e.g. Photons, the Vietnam War, Algebra..."
              className="brut-input w-full px-5 py-4 text-lg font-bold"
            />
            <div className="flex flex-wrap gap-2">
              {TOPIC_SUGGESTIONS.map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setTopic(s)}
                  className={`brut-chip px-3 py-1.5 text-xs ${topic === s ? 'brut-chip-on' : ''}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* MATERIAL (optional) */}
          <div className="space-y-3">
            <label className="brut-tag">Notes? (optional)</label>
            {!materialFile && materialState !== 'error' && (
              <div
                className="border-[3px] border-dashed border-black rounded-xl p-6 text-center cursor-pointer bg-white"
                onDragEnter={e => { e.preventDefault(); }}
                onDragOver={e => { e.preventDefault(); }}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept=".pdf,.docx,.txt,.pptx"
                  onChange={e => { if (e.target.files?.[0]) processFile(e.target.files[0]); }}
                />
                <Upload className="w-8 h-8 mx-auto mb-2 text-black" />
                <p className="text-sm font-bold text-black">Drop a PDF / DOCX / TXT / PPTX to ground your lesson.</p>
              </div>
            )}

            {materialFile && materialState !== 'error' && (
              <div className="flex items-center gap-3 border-[3px] border-black rounded-xl p-4 bg-white shadow-[4px_4px_0_#000]">
                <FileText className="w-6 h-6 text-black shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-black truncate">{materialFile.name}</p>
                  <p className="text-[11px] font-mono uppercase tracking-wider text-black/60">{materialStatusText}</p>
                </div>
                {materialState === 'ready'
                  ? <CheckCircle className="w-6 h-6 text-black shrink-0" />
                  : <Loader2 className="w-6 h-6 text-black animate-spin shrink-0" />}
                <button type="button" onClick={() => { setMaterialFile(null); setMaterialState('idle'); }} className="text-black/60 hover:text-black p-1">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {materialState === 'error' && (
              <div className="flex items-center justify-between border-[3px] border-black rounded-xl p-4 bg-white shadow-[4px_4px_0_#000]">
                <span className="text-sm font-bold text-black">Upload failed.</span>
                <button type="button" onClick={() => setMaterialState('idle')} className="brut-chip px-3 py-1 text-xs">Try again</button>
              </div>
            )}
          </div>

          {/* TIME */}
          <div className="space-y-3">
            <label className="brut-tag">How much time?</label>
            <div className="grid grid-cols-5 gap-2">
              {TIME_OPTIONS.map(m => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMinutes(m)}
                  className={`brut-chip flex flex-col items-center gap-0.5 py-3 rounded-xl ${minutes === m ? 'brut-chip-on' : ''}`}
                >
                  <Clock className="w-4 h-4" />
                  <span className="text-sm font-black">{m}</span>
                  <span className="text-[9px] font-mono uppercase">min</span>
                </button>
              ))}
            </div>
          </div>

          {/* START */}
          <button
            onClick={startLesson}
            disabled={isStarting}
            className="brut-btn brut-primary w-full py-5 text-xl flex items-center justify-center gap-3"
          >
            {isStarting ? (
              <span className="flex items-center gap-3"><Loader2 className="w-5 h-5 animate-spin" /> Preparing your teacher...</span>
            ) : (
              <span className="flex items-center gap-3">START LESSON <ArrowRight className="w-6 h-6" /></span>
            )}
          </button>
          {topic.trim() && (
            <p className="text-center text-[11px] font-mono uppercase tracking-widest text-black/60">
              Teaching: {topic.trim()} · {minutes || 20} min{materialFile?.fileId ? ' · grounded on your notes' : ''}
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
}