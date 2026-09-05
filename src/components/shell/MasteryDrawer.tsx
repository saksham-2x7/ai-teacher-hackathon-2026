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
    { name: 'Forward Propagation', score: 92, status: 'Mastered' },
    { name: 'Activation Functions', score: 78, status: 'Proficient' },
    { name: 'Backpropagation', score: 48, status: 'Weak' },
    { name: 'Gradient Descent', score: 60, status: 'Learning' }
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
              <h2 className="text-2xl font-bold tracking-tight">Mastery Map</h2>
              <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Overall Score */}
            <div className="bg-primary/10 border border-primary/20 rounded-2xl p-6 flex items-center justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-hexagon-accent/20 blur-[40px] rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none" />
              <div>
                <div className="text-sm font-mono text-hexagon-accent uppercase tracking-widest mb-1">Global Mastery</div>
                <div className="text-4xl font-light">69<span className="text-xl text-hexagon-accent/60">%</span></div>
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
                        t.status === 'Weak' ? 'bg-destructive/20 text-destructive' : 
                        t.status === 'Mastered' ? 'bg-hexagon-accent/20 text-hexagon-accent' : 
                        'bg-white/10 text-hexagon-text-hexagon-accent/70'
                      }`}>
                        {t.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <Progress value={t.score} className={`flex-1 h-1.5 ${t.status === 'Weak' ? '[&>div]:bg-destructive' : ''}`} />
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
                You are struggling with <span className="text-destructive font-medium">Backpropagation</span>. The system has automatically reduced the pacing and will rely more on visual 3D simulation rather than pure mathematical graphs for this segment.
              </p>
              <div className="flex items-center gap-3 text-xs bg-black/40 p-3 rounded-xl border border-white/5">
                <AlertCircle size={14} className="text-yellow-500" />
                <span className="text-hexagon-text-hexagon-accent/60">Scaffolding level increased to High.</span>
              </div>
            </div>

            {/* Source Grounding */}
            <div className="bg-hexagon-surface border border-hexagon-border rounded-2xl p-6">
              <div className="flex items-center gap-2 text-sm font-mono uppercase tracking-widest text-hexagon-text-hexagon-accent/70 mb-4">
                <BookOpen size={16} /> Source Grounding
              </div>
              <p className="text-sm text-hexagon-text-hexagon-accent/80 leading-relaxed">
                Currently learning from: <br/>
                <span className="font-medium text-hexagon-text-hexagon-accent">CS231n_Lecture4_Backprop.pdf</span> (Page 14)
              </p>
            </div>

          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
