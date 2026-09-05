"use client";

import React from "react";
import { motion } from "framer-motion";
import { 
  Activity, 
  Cpu, 
  Eye, 
  Sparkles, 
  Volume2, 
  Layers, 
  Maximize2, 
  User 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUniverseStore } from "@/store/useUniverseStore";
import { PedagogicalPhase, CameraMode } from "@/schemas/universe";

const PHASES: PedagogicalPhase[] = [
  "understand",
  "plan",
  "explain",
  "demonstrate",
  "question",
  "evaluate",
  "adapt",
];

export function UniverseOverlay({ children }: { children?: React.ReactNode }) {
  const {
    activePhase,
    cameraMode,
    cognitiveLoad,
    audioIntensity,
    fps,
    setActivePhase,
    setCameraMode,
    setAudioIntensity,
  } = useUniverseStore();

  return (
    <div className="relative z-10 w-full min-h-screen pointer-events-none flex flex-col justify-between p-6 md:p-8 font-sans selection:bg-hexagon-accent selection:text-black">
      {/* Top Header HUD: Telemetry & Status Array */}
      <header className="w-full flex items-center justify-between gap-4">
        {/* Brand & System Node */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="pointer-events-auto flex items-center gap-3 bg-[#0a0e14]/70 backdrop-blur-2xl border border-white/10 px-4 py-2.5 rounded-2xl shadow-2xl"
        >
          <div className="relative flex items-center justify-center">
            <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping absolute opacity-60" />
            <div className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold tracking-[0.2em] text-white uppercase">
                HEXAGON UNIVERSE
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                v2.0
              </span>
            </div>
            <p className="text-[10px] text-gray-400 font-mono">Dual-Layer Neural Mesh Engine</p>
          </div>
        </motion.div>

        {/* Global Telemetry Dock */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="pointer-events-auto flex items-center gap-4 bg-[#0a0e14]/70 backdrop-blur-2xl border border-white/10 px-4 py-2 rounded-2xl shadow-2xl"
        >
          {/* FPS Gauge */}
          <div className="flex items-center gap-1.5 text-[11px] font-mono text-gray-300">
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            <span>{fps} FPS</span>
          </div>

          <div className="h-4 w-px bg-white/10" />

          {/* Cognitive Load Tracker */}
          <div className="flex items-center gap-2">
            <Cpu className="w-3.5 h-3.5 text-purple-400" />
            <div className="flex flex-col">
              <span className="text-[9px] font-mono text-gray-400 leading-none">COGNITIVE</span>
              <span className="text-[11px] font-mono text-white font-medium">{cognitiveLoad}%</span>
            </div>
          </div>

          <div className="h-4 w-px bg-white/10" />

          {/* Audio Simulator Trigger */}
          <button
            onClick={() => setAudioIntensity(audioIntensity > 0 ? 0 : 0.8)}
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-mono transition-all",
              audioIntensity > 0
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.2)]"
                : "bg-white/5 text-gray-400 hover:text-white border border-white/5"
            )}
            title="Toggle Voice Reactivity Pulse"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>{audioIntensity > 0 ? "VOICE ACTIVE" : "VOICE IDLE"}</span>
          </button>
        </motion.div>
      </header>

      {/* Center Interactive Slot (Injects page or custom DOM content) */}
      <main className="w-full flex-1 flex items-center justify-center my-6">
        {children}
      </main>

      {/* Bottom Floating Navigation & Phase Dock */}
      <footer className="w-full flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Pedagogical Phase Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="pointer-events-auto flex items-center gap-1.5 bg-[#0a0e14]/80 backdrop-blur-2xl border border-white/10 p-1.5 rounded-2xl shadow-2xl overflow-x-auto max-w-full"
        >
          {PHASES.map((phase) => {
            const isActive = activePhase === phase;
            return (
              <button
                key={phase}
                onClick={() => setActivePhase(phase)}
                className={cn(
                  "relative px-3 py-1.5 rounded-xl text-xs font-medium uppercase tracking-wider transition-all duration-300",
                  isActive
                    ? "text-black font-semibold"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="active-phase-pill"
                    className="absolute inset-0 bg-cyan-400 rounded-xl shadow-[0_0_15px_rgba(34,211,238,0.4)]"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{phase}</span>
              </button>
            );
          })}
        </motion.div>

        {/* 3D Camera Modes Selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="pointer-events-auto flex items-center gap-1.5 bg-[#0a0e14]/80 backdrop-blur-2xl border border-white/10 p-1.5 rounded-2xl shadow-2xl"
        >
          {(
            [
              { id: "portrait", label: "Face", icon: User },
              { id: "classroom", label: "Educator", icon: Eye },
              { id: "cinematic", label: "Macro", icon: Maximize2 },
            ] as { id: CameraMode; label: string; icon: React.ComponentType<{ className?: string }> }[]
          ).map((item) => {
            const isCurrent = cameraMode === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCameraMode(item.id)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all",
                  isCurrent
                    ? "bg-white/15 text-white border border-white/20 shadow-inner"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                )}
              >
                <item.icon className="w-3.5 h-3.5 text-cyan-400" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </motion.div>
      </footer>
    </div>
  );
}
