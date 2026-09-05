'use client';

import { motion } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { Environment, OrbitControls } from '@react-three/drei';
import ProceduralAvatar from './ProceduralAvatar';
import { useEffect, useState } from 'react';
import { Mic, MicOff, Maximize2, Minimize2, MessageSquare } from 'lucide-react';
import { useAIIntentStore } from '../../store/useAIIntentStore';
import { speechSynthesizer } from '../../services/speechSynthesizer';

export default function AITeacherPiP() {
  const [heights, setHeights] = useState([20, 40, 60, 40, 20]);
  const [isMuted, setIsMuted] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showCaptions, setShowCaptions] = useState(true);

  const lessonPhase = useAIIntentStore(state => state.lessonPhase);
  const teacherState = useAIIntentStore(state => state.teacherState);
  const captionText = useAIIntentStore(state => state.teacherMessage);

  useEffect(() => {
    speechSynthesizer.setMuted(isMuted);
  }, [isMuted]);

  useEffect(() => {
    const interval = setInterval(() => {
      setHeights(prev =>
        prev.map(() => (isMuted || teacherState !== 'speaking' ? 10 : Math.random() * 80 + 20))
      );
    }, 150);
    return () => clearInterval(interval);
  }, [isMuted, teacherState]);

  return (
    <div className="w-full flex flex-col gap-3">
      {/* Captions — clamped so the avatar card below always stays visible */}
      {showCaptions && captionText && (
        <div className="shrink-0 rounded-xl border-[3px] border-black bg-white p-4 shadow-[5px_5px_0_#000]">
          <div className="w-full h-1.5 bg-[#00FF9D] mb-3" />
          <p className="text-black text-sm leading-relaxed font-bold line-clamp-5">
            “{captionText}”
          </p>
        </div>
      )}

      {/* Avatar card — pinned, stays on screen no matter the caption length */}
      <div
        className="w-full rounded-xl border-[3px] border-black shadow-[7px_7px_0_#000] bg-white overflow-hidden flex flex-col shrink-0 mt-auto"
        style={{ height: isExpanded ? 400 : 260 }}
      >
        <div className="bg-black flex flex-col w-full h-full relative">
          {/* Controls row */}
          <div className="absolute top-2 right-2 flex gap-1.5 z-20">
            <button
              onClick={() => setShowCaptions(!showCaptions)}
              className={`w-8 h-8 rounded-md border-2 border-black flex items-center justify-center ${showCaptions ? 'bg-black text-white' : 'bg-white text-black'}`}
              aria-label="Toggle Captions"
            >
              <MessageSquare size={14} />
            </button>
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="w-8 h-8 rounded-md border-2 border-black bg-white flex items-center justify-center text-black"
              aria-label="Mute"
            >
              {isMuted ? <MicOff size={14} /> : <Mic size={14} />}
            </button>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-8 h-8 rounded-md border-2 border-black bg-white flex items-center justify-center text-black"
              aria-label="Expand"
            >
              {isExpanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
            </button>
          </div>

          {/* Phase pill */}
          <div className="absolute top-2 left-2 z-20 flex items-center gap-2 bg-white px-3 py-1 rounded-md border-2 border-black shadow-[2px_2px_0_#000]">
            <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${teacherState === 'speaking' ? 'bg-[#00FF9D]' : 'bg-black'}`} />
            <span className="text-[10px] font-black text-black uppercase tracking-widest">{lessonPhase}</span>
          </div>

          {/* 3D scene */}
          <div className="flex-1 relative overflow-hidden">
            <Canvas camera={{ position: [0, 1.55, 1.15], fov: 38 }}>
              <ambientLight intensity={0.9} />
              <directionalLight position={[2, 3, 2]} intensity={1.5} />
              <directionalLight position={[-2, 1, -1]} intensity={0.8} color="#00FF9D" />
              <Environment files="/potsdamer_platz_1k.hdr" />
              <ProceduralAvatar />
              <OrbitControls enableZoom={false} enablePan={false} target={[0, 1.5, 0]} />
            </Canvas>
          </div>

          {/* Waveform */}
          <div className="h-9 border-t-2 border-black flex items-center justify-center gap-1.5 px-4 bg-[#111111]">
            {heights.map((h, i) => (
              <motion.div
                key={i}
                className={`w-1 rounded-full ${teacherState === 'speaking' ? 'bg-[#00FF9D]' : 'bg-white/40'}`}
                animate={{ height: `${h}%` }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}