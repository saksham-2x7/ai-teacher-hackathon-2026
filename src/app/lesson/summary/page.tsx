'use client';
import { motion } from 'framer-motion';
import { CheckCircle, ArrowRight, Zap, Target, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { Button } from '../../../components/ui/button';
import { Progress } from '../../../components/ui/progress';

export default function LessonSummaryPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[150px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, type: 'spring' }}
        className="max-w-3xl w-full bg-card/80 backdrop-blur-3xl border border-white/10 rounded-3xl p-12 shadow-2xl relative z-10"
      >
        <div className="flex flex-col items-center text-center mb-12">
          <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mb-6 border border-primary/50 shadow-[0_0_30px_rgba(0,255,157,0.3)]">
            <CheckCircle className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-4xl font-bold mb-4 tracking-tight">Lesson Complete</h1>
          <p className="text-muted-foreground text-lg max-w-lg">
            You successfully completed the module on <span className="text-white font-medium">Neural Network Weight Updates</span>.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center">
            <Target className="text-primary mb-3" size={24} />
            <div className="text-3xl font-bold font-mono text-white mb-1">85%</div>
            <div className="text-xs text-white/50 uppercase tracking-widest font-mono">Mastery</div>
          </div>
          
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center">
            <Zap className="text-yellow-500 mb-3" size={24} />
            <div className="text-3xl font-bold font-mono text-white mb-1">High</div>
            <div className="text-xs text-white/50 uppercase tracking-widest font-mono">Confidence</div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center">
            <BookOpen className="text-blue-500 mb-3" size={24} />
            <div className="text-3xl font-bold font-mono text-white mb-1">4</div>
            <div className="text-xs text-white/50 uppercase tracking-widest font-mono">Concepts</div>
          </div>
        </div>

        <div className="mb-12">
          <h3 className="text-lg font-medium mb-4">Areas to Review</h3>
          <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 flex items-center gap-4">
            <Progress value={48} className="w-32 h-1.5 [&>div]:bg-destructive" />
            <span className="font-medium flex-1">Backpropagation chain rule</span>
            <Button variant="outline" size="sm" className="border-destructive/30 hover:bg-destructive/20 text-destructive">
              Review Module
            </Button>
          </div>
        </div>

        <div className="flex justify-center">
          <Link href="/">
            <Button size="lg" className="rounded-full px-8 text-md font-bold tracking-widest uppercase">
              Return Home <ArrowRight className="ml-2" size={18} />
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
