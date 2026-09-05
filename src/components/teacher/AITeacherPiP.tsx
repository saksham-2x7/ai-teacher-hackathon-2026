'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { Environment, OrbitControls } from '@react-three/drei';
import ProceduralAvatar from './ProceduralAvatar';
import { useEffect, useState, useRef } from 'react';
import { Mic, MicOff, Maximize2, Minimize2, MessageSquare } from 'lucide-react';
import { useAIIntentStore } from '../../store/useAIIntentStore';
import { speechSynthesizer } from '../../services/speechSynthesizer';

export default function AITeacherPiP() {
  const [heights, setHeights] = useState([20, 40, 60, 40, 20]);
  const [isMuted, setIsMuted] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showCaptions, setShowCaptions] = useState(true);
  
  const containerRef = useRef<HTMLDivElement>(null);
  
  const lessonPhase = useAIIntentStore(state => state.lessonPhase);
  const teacherState = useAIIntentStore(state => state.teacherState);
  const captionText = useAIIntentStore(state => state.teacherMessage);

  useEffect(() => {
    speechSynthesizer.setMuted(isMuted);
  }, [isMuted]);

  // Audio Waveform Animation
  useEffect(() => {
    const interval = setInterval(() => {
      setHeights((prev) => 
        prev.map(() => isMuted || teacherState !== 'speaking' ? 10 : Math.random() * 80 + 20)
      );
    }, 150);
    return () => clearInterval(interval);
  }, [isMuted, teacherState]);

  const getPresenceStyles = () => {
    switch (teacherState) {
      case 'speaking':
      case 'teaching':
        return {
          bg: 'from-hexagon-accent/20 to-hexagon-accent/5',
          core: 'bg-hexagon-accent shadow-[0_0_20px_rgba(0,255,157,0.8)] scale-110',
          speed: 3
        };
      case 'listening':
        return {
          bg: 'from-blue-500/20 to-purple-500/10',
          core: 'bg-blue-400 shadow-[0_0_15px_rgba(96,165,250,0.6)] scale-90',
          speed: 8
        };
      case 'thinking':
        return {
          bg: 'from-amber-500/20 to-orange-500/10',
          core: 'bg-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.6)] scale-100',
          speed: 5
        };
      default:
        return {
          bg: 'from-white/10 to-transparent',
          core: 'bg-white/50 scale-100',
          speed: 10
        };
    }
  };

  const presence = getPresenceStyles();

  return (
    <div className="absolute bottom-8 right-8 z-50 flex flex-col items-end gap-4 pointer-events-none">
      
      {/* Captions */}
      <AnimatePresence>
        {showCaptions && captionText && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="max-w-[420px] bg-hexagon-surface/90 backdrop-blur-2xl border border-hexagon-border rounded-2xl p-5 shadow-2xl pointer-events-auto relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-hexagon-accent to-transparent opacity-50" />
            <p className="text-hexagon-text-primary text-sm leading-relaxed font-medium">
              &quot;{captionText}&quot;
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main PiP Container */}
      <motion.div 
        ref={containerRef}
        initial={{ opacity: 0, y: 20 }}
        animate={{ 
          opacity: 1, 
          y: 0,
          width: isExpanded ? 400 : 288,
          height: isExpanded ? 300 : 192
        }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        className="rounded-3xl shadow-[0_30px_60px_rgba(0,0,0,0.6)] border border-white/5 bg-[#0A0C14]/80 backdrop-blur-3xl flex flex-col pointer-events-auto relative group p-[1px]"
      >
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/10 via-transparent to-white/5 pointer-events-none" />

        <div className="bg-black/60 rounded-[23px] overflow-hidden flex flex-col w-full h-full relative z-10">
          <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

          <div className="absolute top-3 right-3 flex gap-2 z-20">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowCaptions(!showCaptions)}
            className={`w-8 h-8 rounded-full border flex items-center justify-center transition-colors ${showCaptions ? 'bg-hexagon-accent/20 border-hexagon-accent/50 text-hexagon-accent' : 'bg-black/40 border-hexagon-border text-hexagon-text-secondary hover:text-hexagon-text-primary'}`}
            aria-label="Toggle Captions"
          >
            <MessageSquare size={14} />
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsMuted(!isMuted)}
            className="w-8 h-8 rounded-full bg-black/40 border border-hexagon-border flex items-center justify-center text-hexagon-text-secondary transition-colors hover:text-hexagon-text-primary hover:bg-white/10"
          >
            {isMuted ? <MicOff size={14} /> : <Mic size={14} />}
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-8 h-8 rounded-full bg-black/40 border border-hexagon-border flex items-center justify-center text-hexagon-text-secondary transition-colors hover:text-hexagon-text-primary hover:bg-white/10"
          >
            {isExpanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </motion.button>
        </div>

        <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-hexagon-border">
          <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${teacherState === 'speaking' ? 'bg-hexagon-accent' : 'bg-hexagon-text-secondary'}`} />
          <span className="text-[10px] font-mono text-hexagon-text-secondary uppercase tracking-widest">{lessonPhase}</span>
        </div>

        <div className="flex-1 relative flex items-center justify-center bg-black/20 overflow-hidden">
          <div className="absolute inset-0 w-full h-full">
            <Canvas camera={{ position: [0, 1.55, 1.15], fov: 38 }}>
              <ambientLight intensity={0.9} />
              <directionalLight position={[2, 3, 2]} intensity={1.5} />
              <directionalLight position={[-2, 1, -1]} intensity={0.8} color="#00FF9D" />
              <Environment files="/potsdamer_platz_1k.hdr" />
              <ProceduralAvatar />
              <OrbitControls enableZoom={false} enablePan={false} target={[0, 1.50, 0]} />
            </Canvas>
          </div>
          <div className="absolute inset-0 pointer-events-none rounded-t-3xl shadow-[inset_0_0_50px_rgba(0,0,0,0.8)]" />
        </div>
        
        {/* Audio Waveform Indicator */}
        <div className="h-10 border-t border-hexagon-border flex items-center justify-center gap-1.5 px-4 bg-black/40">
          {heights.map((h, i) => (
            <motion.div
              key={i}
              className={`w-1 rounded-full ${teacherState === 'speaking' ? 'bg-hexagon-accent' : 'bg-hexagon-text-secondary/50'}`}
              animate={{ height: `${h}%` }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            />
          ))}
        </div>
        </div>
      </motion.div>
    </div>
  );
}
