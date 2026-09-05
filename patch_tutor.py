import os

code = """
"use client";
import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import { Mic, Send, ArrowLeft, Maximize2, Minimize2 } from 'lucide-react';

import { useAuthStore } from '@/store/useAuthStore';
import { useAIIntentStore } from '@/store/useAIIntentStore';
import { useAudioLipSync } from '@/hooks/useAudioLipSync';
import LiveAIEngine from '../../../components/shell/LiveAIEngine';
import ProceduralAvatar from '../../../components/teacher/ProceduralAvatar';
import { NeuralNetworkBoard } from '../../../components/teacher/NeuralNetworkBoard';

type StageMode = 'CONVERSATION' | 'LECTURE';

// Smooth Camera Controller for 3D Scene
function CameraDirector({ mode }: { mode: StageMode }) {
  useFrame((state) => {
    // In Lecture mode (PiP), zoom out slightly so the avatar fits well in the circle
    const targetZ = mode === 'LECTURE' ? 5 : 3.5;
    const targetY = mode === 'LECTURE' ? 0.5 : 1.2;
    state.camera.position.lerp(new THREE.Vector3(0, targetY, targetZ), 0.05);
    state.camera.lookAt(0, 1.2, 0);
  });
  return null;
}

export default function TutorPage() {
  const router = useRouter();
  const { profile } = useAuthStore();
  const { teacherState, teacherMessage } = useAIIntentStore();
  
  const [mode, setMode] = useState<StageMode>('CONVERSATION');
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [weight, setWeight] = useState(1.0);
  
  const isMale = profile?.tutorGender === 'male';
  
  const { stopAudio, getAudioContext } = useAudioLipSync();

  // Instant Mute / Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAudio();
    };
  }, [stopAudio]);

  const toggleRecording = async () => {
    if (!isRecording) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        setIsRecording(true);
      } catch (e) {
        console.error("Mic access denied", e);
      }
    } else {
      setIsRecording(false);
    }
  };

  const handleSend = async (textOverride?: string) => {
    const userText = textOverride || input;
    if (!userText.trim()) return;
    
    setInput('');
    const sessionId = sessionStorage.getItem('hexagon_session_id');
    
    if (sessionId) {
      try {
        await fetch(`/api/v1/sessions/${sessionId}/interact`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ student_input: userText })
        });
      } catch (e) {
        console.error('Failed to send interaction to backend:', e);
      }
    }
  };

  return (
    <div className="relative w-full h-full bg-[#09090b] text-white overflow-hidden flex flex-col font-sans">
      <LiveAIEngine />

      {/* TOP NAV HEADER */}
      <header className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between p-6 pointer-events-auto">
        <button 
          onClick={() => router.push('/home')}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-black/20 backdrop-blur-md border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-all shadow-lg"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      </header>

      {/* MAIN SPATIAL STAGE */}
      <div className="relative flex-1 w-full h-full overflow-hidden">
        
        {/* 3D AVATAR CANVAS */}
        <motion.div
          layout
          initial={false}
          className={`absolute overflow-hidden z-10 transition-shadow duration-500 ${
            mode === 'CONVERSATION' 
              ? 'inset-0' 
              : 'bottom-36 right-8 w-64 h-64 rounded-full shadow-2xl border-2 border-white/10 cursor-pointer hover:border-white/30 bg-[#0f1115]'
          }`}
          onClick={() => { if (mode === 'LECTURE') setMode('CONVERSATION'); }}
          transition={{ type: 'spring', stiffness: 200, damping: 25 }}
        >
          <Canvas
            shadows
            gl={{ antialias: true, alpha: true, toneMapping: THREE.ACESFilmicToneMapping }}
            camera={{ fov: 35, near: 0.1, far: 100 }}
            className="w-full h-full bg-transparent"
          >
            <CameraDirector mode={mode} />
            <ambientLight intensity={isMale ? 0.9 : 1.1} />
            <directionalLight position={[-1, 2, 3]} intensity={1.5} castShadow shadow-mapSize={[1024, 1024]} shadow-bias={-0.001} />
            <spotLight position={[2, 4, -2]} intensity={2} angle={0.6} penumbra={1} castShadow />
            <Environment preset="studio" environmentIntensity={isMale ? 0.7 : 0.9} />
            <ContactShadows opacity={0.6} scale={10} blur={2.5} far={4} color="#000000" position={[0, -0.01, 0]} />
            
            <ProceduralAvatar 
              gender={isMale ? 'male' : 'female'}
              isSpeaking={teacherState === 'speaking' || teacherState === 'teaching'}
            />
            
            {mode === 'CONVERSATION' && (
              <OrbitControls 
                enableDamping 
                minDistance={2}
                maxDistance={10}
                maxPolarAngle={Math.PI / 1.8}
              />
            )}
          </Canvas>
          {mode === 'LECTURE' && (
             <div className="absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/20 transition-colors pointer-events-none rounded-full">
                <Maximize2 className="w-8 h-8 text-white opacity-0 hover:opacity-100 transition-opacity drop-shadow-md" />
             </div>
          )}
        </motion.div>

        {/* INTERACTIVE LECTURE BOARD */}
        <motion.div
          layout
          initial={false}
          className={`absolute overflow-hidden shadow-2xl border border-white/10 bg-[#09090b] backdrop-blur-3xl z-0 transition-opacity duration-500 ${
            mode === 'CONVERSATION'
              ? 'top-8 right-8 w-80 h-48 rounded-2xl opacity-50 hover:opacity-100 cursor-pointer z-20'
              : 'inset-x-8 top-8 bottom-36 rounded-[2rem] opacity-100'
          }`}
          onClick={() => { if (mode === 'CONVERSATION') setMode('LECTURE'); }}
          transition={{ type: 'spring', stiffness: 200, damping: 25 }}
        >
          <div className="w-full h-full p-2 relative">
            <NeuralNetworkBoard 
              demoState="evaluate_answer" 
              weightValue={weight} 
              onWeightChange={setWeight} 
            />
            {mode === 'CONVERSATION' && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 hover:bg-black/20 transition-colors pointer-events-none rounded-2xl">
                <Maximize2 className="w-6 h-6 text-white drop-shadow-md" />
              </div>
            )}
            {mode === 'LECTURE' && (
              <button 
                onClick={(e) => { e.stopPropagation(); setMode('CONVERSATION'); }}
                className="absolute top-4 right-4 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors border border-white/10"
              >
                <Minimize2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </motion.div>
        
      </div>

      {/* UNIFIED CONTROL DOCK */}
      <div className="absolute bottom-6 inset-x-0 mx-auto max-w-2xl px-4 pointer-events-auto z-50">
        <div className="bg-[#0f1115]/80 backdrop-blur-2xl border border-white/10 rounded-3xl p-4 shadow-2xl flex flex-col gap-4">
          
          {/* Transcriptions / State */}
          <div className="px-2 min-h-8 flex items-center">
            {teacherState !== 'idle' ? (
              <div className="flex items-center gap-3 w-full">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.5)] shrink-0" />
                <p className="text-sm font-medium text-white/90 line-clamp-2 leading-relaxed">
                  {teacherMessage || 'Processing...'}
                </p>
              </div>
            ) : (
              <div className="flex items-center gap-3 w-full opacity-60">
                <div className="w-2.5 h-2.5 rounded-full bg-white/20 shrink-0" />
                <p className="text-sm italic text-white/70">
                  Ready. Ask a question or use a Socratic chip.
                </p>
              </div>
            )}
          </div>
          
          {/* Socratic Action Chips */}
          <div className="flex items-center gap-2 px-1 overflow-x-auto no-scrollbar">
             {['Explain simpler', 'Give an example', 'Check my understanding'].map(chip => (
                <button 
                   key={chip}
                   onClick={() => handleSend(chip)}
                   className="px-4 py-1.5 rounded-full border border-white/10 bg-white/5 hover:bg-white/15 text-xs font-medium text-gray-300 hover:text-white whitespace-nowrap transition-colors"
                >
                  {chip}
                </button>
             ))}
          </div>

          {/* Input Row */}
          <div className="relative flex items-center">
            <button 
              onClick={toggleRecording} 
              className={`absolute left-2 p-2.5 rounded-full transition-all ${
                isRecording 
                  ? 'bg-red-500/20 text-red-500 border border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.2)]' 
                  : 'hover:bg-white/10 text-gray-400 hover:text-white'
              }`}
            >
              <Mic className="w-4 h-4" />
            </button>
            
            <input 
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder="Message your AI Tutor..."
              className="w-full bg-black/50 border border-white/10 rounded-2xl py-3.5 pl-14 pr-14 text-sm text-white outline-none focus:border-emerald-500/50 focus:bg-black/70 transition-all placeholder-white/30"
            />
            
            <button 
              onClick={() => handleSend()} 
              disabled={!input.trim()}
              className="absolute right-2 p-2.5 rounded-full bg-white/10 text-white hover:bg-white/20 disabled:opacity-30 disabled:hover:bg-white/10 transition-all"
            >
              <Send className="w-4 h-4 ml-[-2px] mt-[1px]" />
            </button>
          </div>
          
        </div>
      </div>
      
    </div>
  );
}
"""

with open("src/app/(app)/tutor/page.tsx", "w") as f:
    f.write(code)

print("Overwritten src/app/(app)/tutor/page.tsx")
