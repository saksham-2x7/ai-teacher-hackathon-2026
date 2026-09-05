'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Target, TrendingUp, AlertCircle, BookOpen } from 'lucide-react';
import { Progress } from '../ui/progress';

interface MasteryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MasteryDrawer({ isOpen, onClose }: MasteryDrawerProps) {
  const topics = [
    { name: 'Electricity & Circuits', score: 0, status: 'Starting' },
    { name: 'Photosynthesis', score: 0, status: 'Starting' },
    { name: "Ohm's Law", score: 0, status: 'Starting' },
    { name: 'Adding Fractions', score: 0, status: 'Starting' }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 pointer-events-auto"
          />
          <motion.div 
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-[450px] bg-card/90 backdrop-blur-3xl border-l border-hexagon-border z-50 p-8 overflow-y-auto pointer-events-auto shadow-2xl flex flex-col gap-8"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold tracking-tight">My Learning Map</h2>
              <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Overall Score */}
            <div className="bg-primary/10 border border-primary/20 rounded-2xl p-6 flex items-center justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-hexagon-accent/20 blur-[40px] rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none" />
              <div>
                <div className="text-sm font-mono text-hexagon-accent uppercase tracking-widest mb-1">Overall Score</div>
                <div className="text-4xl font-light">0<span className="text-xl text-hexagon-accent/60">%</span></div>
              </div>
              <Target size={48} className="text-hexagon-accent/30" />
            </div>

            {/* Topic Breakdown */}
            <div>
              <h3 className="text-sm font-mono uppercase tracking-widest text-muted-foreground mb-4">Topic Breakdown</h3>
              <div className="flex flex-col gap-4">
                {topics.map((t, i) => (
                  <div key={i} className="flex flex-col gap-2">
                    <div className="flex justify-between items-end">
                      <span className="font-medium">{t.name}</span>
                      <span className={`text-xs font-mono px-2 py-0.5 rounded-full ${
                        t.status === 'Needs Work' ? 'bg-destructive/20 text-destructive' : 
                        t.status === 'Mastered' ? 'bg-hexagon-accent/20 text-hexagon-accent' : 
                        'bg-white/10 text-hexagon-text-hexagon-accent/70'
                      }`}>
                        {t.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <Progress value={t.score} className={`flex-1 h-1.5 ${t.status === 'Needs Work' ? '[&>div]:bg-destructive' : ''}`} />
                      <span className="text-xs font-mono w-8 text-right text-hexagon-text-hexagon-accent/50">{t.score}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Recommendation */}
            <div className="bg-hexagon-surface border border-hexagon-border rounded-2xl p-6">
              <div className="flex items-center gap-2 text-sm font-mono uppercase tracking-widest text-hexagon-text-hexagon-accent/70 mb-4">
                <TrendingUp size={16} /> AI Recommendation
              </div>
              <p className="text-sm text-hexagon-text-hexagon-accent/80 leading-relaxed mb-4">
                You are working on <span className="text-destructive font-medium">Ohm's Law</span>. The teacher will slow the pace a little and use more hands-on, visual examples while you build this up.
              </p>
              <div className="flex items-center gap-3 text-xs bg-black/40 p-3 rounded-xl border border-white/5">
                <AlertCircle size={14} className="text-yellow-500" />
                <span className="text-hexagon-text-hexagon-accent/60">Extra help is on — the teacher will break steps down more.</span>
              </div>
            </div>

            {/* Source Grounding */}
            <div className="bg-hexagon-surface border border-hexagon-border rounded-2xl p-6">
              <div className="flex items-center gap-2 text-sm font-mono uppercase tracking-widest text-hexagon-text-hexagon-accent/70 mb-4">
                <BookOpen size={16} /> Source Grounding
              </div>
              <p className="text-sm text-hexagon-text-hexagon-accent/80 leading-relaxed">
                Currently reviewing from: <br/>
                <span className="font-medium text-hexagon-text-hexagon-accent">Physics: Electricity & Circuits (Lesson 1)</span>
              </p>
            </div>

          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
