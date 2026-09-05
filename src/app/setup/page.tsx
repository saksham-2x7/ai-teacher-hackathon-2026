'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, BrainCircuit, Waves, UploadCloud, ChevronRight } from 'lucide-react';
import { LearnerProfile } from '../../types/learner';
import { toFastAPILearnerProfile } from "@/utils/toFastAPILearnerProfile";
import { liveSSEClient } from "@/services/liveSSEClient";

export default function SetupPage() {
  const router = useRouter();
  const [topic, setTopic] = useState('');
  const [depth, setDepth] = useState(3);
  const [learningStyle, setLearningStyle] = useState('visual');
  const [hasMaterials, setHasMaterials] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsInitializing(true);
    const profile: LearnerProfile = {
      topic,
      depthLevel: depth,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      learningStyle: learningStyle as any,
      hasMaterials,
    };
    
    // Convert new UI variables to match what the transformer expects
    // depth 1-5 maps to beginner/intermediate/advanced
    const mappedLevel = depth <= 2 ? 'beginner' : depth >= 4 ? 'advanced' : 'intermediate';
    
    const fastApiPayload = toFastAPILearnerProfile(
      { ...profile, level: mappedLevel, tutorGender: 'female', dailyGoalMinutes: 20 },
      topic || "Neural Networks"
    );

    let sessionId = `session_${Date.now()}`;
    try {
      sessionId = await liveSSEClient.createSession(fastApiPayload);
    } catch (e) {
      console.warn("Session initiation error:", e);
    }

    // Cinematic planning transition
    setTimeout(() => {
      router.push(`/lesson/plan-generation?topic=${encodeURIComponent(topic || "Neural Networks")}&sessionId=${encodeURIComponent(sessionId)}`);
    }, 1500);
  };

  const spring = { type: "spring", stiffness: 300, damping: 30 };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#030303] text-white flex items-center justify-center font-sans overflow-hidden relative selection:bg-purple-500/30">
      
      {/* Ambient noise & grid layer */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: 'url("https://grainy-gradients.vercel.app/noise.svg")' }} />
      <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)]" />

      {/* Dynamic Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-purple-600/20 blur-[120px] rounded-full pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 40, filter: 'blur(10px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md relative z-10 p-6"
      >
        <div className="relative group">
          {/* Outer Glass Bezel */}
          <div className="absolute -inset-px bg-gradient-to-b from-white/20 to-white/0 rounded-[32px] p-px opacity-50" />
          
          <div className="relative bg-[#07090E]/80 backdrop-blur-3xl border border-white/10 rounded-[32px] p-8 shadow-2xl">
            <div className="flex justify-center mb-8">
              <div className="p-3 bg-white/5 rounded-2xl border border-white/10 shadow-inner">
                <Sparkles className="w-6 h-6 text-purple-400" />
              </div>
            </div>
            
            <h1 className="text-2xl font-semibold text-center tracking-tight mb-2">Initialize Learner</h1>
            <p className="text-gray-500 text-center text-sm mb-8">Configure your polymorphic AI tutor environment</p>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Core Topic */}
              <div className="space-y-3">
                <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-[0.2em] ml-1">Learning Target</label>
                <div className="relative group/input">
                  <input 
                    type="text" 
                    required
                    value={topic}
                    onChange={e => setTopic(e.target.value)}
                    placeholder="e.g. Backpropagation..."
                    className="w-full bg-[#030303] border border-white/10 rounded-2xl py-4 px-5 text-sm outline-none focus:border-purple-500/50 focus:bg-[#0A0A0A] transition-all placeholder-gray-700 shadow-inner"
                  />
                </div>
              </div>

              {/* Depth Slider */}
              <div className="space-y-3">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-[0.2em]">Ontological Depth</label>
                  <span className="text-[10px] text-purple-400 font-mono bg-purple-500/10 px-2 py-0.5 rounded">Level {depth}</span>
                </div>
                <input 
                  type="range" 
                  min="1" 
                  max="5" 
                  value={depth}
                  onChange={(e) => setDepth(Number(e.target.value))}
                  className="w-full accent-purple-500 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-gray-600 font-medium px-1 uppercase tracking-wider">
                  <span>Layman</span>
                  <span>Academic</span>
                </div>
              </div>

              {/* Learning Style */}
              <div className="space-y-3">
                <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-[0.2em] ml-1">Learning Matrix</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: 'visual', icon: Waves, label: 'Visual' },
                    { id: 'analytical', icon: BrainCircuit, label: 'Analytical' }
                  ].map((style) => {
                    const isSelected = learningStyle === style.id;
                    return (
                      <button
                        key={style.id}
                        type="button"
                        onClick={() => setLearningStyle(style.id)}
                        className={`relative flex flex-col items-center justify-center p-4 rounded-2xl border transition-all duration-300 ${isSelected ? 'border-purple-500/50 bg-purple-500/10 text-white' : 'border-white/5 bg-white/[0.02] text-gray-500 hover:bg-white/[0.04] hover:text-gray-300'}`}
                      >
                        <style.icon className={`w-5 h-5 mb-2 ${isSelected ? 'text-purple-400' : 'opacity-60'}`} />
                        <span className="text-xs font-medium tracking-wide">{style.label}</span>
                        {isSelected && (
                          <motion.div 
                            layoutId="style-active" 
                            className="absolute inset-0 rounded-2xl border border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.2)]" 
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            transition={spring as any} 
                          />
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Submit Button */}
              <button 
                type="submit" 
                disabled={isInitializing}
                className="group relative w-full overflow-hidden rounded-2xl bg-white text-black font-semibold text-sm tracking-wide h-14 transition-transform active:scale-[0.98]"
              >
                <div className="absolute inset-0 flex items-center justify-center gap-2">
                  {isInitializing ? (
                    <motion.div 
                      initial={{ opacity: 0 }} 
                      animate={{ opacity: 1 }}
                      className="flex items-center gap-2"
                    >
                      <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                      <span>Syncing Neural Mesh...</span>
                    </motion.div>
                  ) : (
                    <>
                      <span>DEPLOY TEACHER</span>
                      <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </div>
              </button>
            </form>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
