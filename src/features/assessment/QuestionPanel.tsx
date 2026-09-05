'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../../components/ui/button';
import { useSemanticDispatcher } from '../../lib/api/useSemanticDispatcher';
import { Check, X, RefreshCw, Lightbulb } from 'lucide-react';

export type QuestionType = 'multiple_choice' | 'hypothesis';

export interface QuestionProps {
  id: string;
  type: QuestionType;
  prompt: string;
  options?: string[];
  correctOption?: number;
  explanation?: string;
  onComplete?: (success: boolean) => void;
}

export default function QuestionPanel({ question }: { question: QuestionProps }) {
  const { dispatchAction } = useSemanticDispatcher();
  const [selected, setSelected] = useState<number | null>(null);
  const [textAnswer, setTextAnswer] = useState('');
  const [status, setStatus] = useState<'unanswered' | 'checking' | 'correct' | 'incorrect'>('unanswered');

  const handleSubmit = () => {
    setStatus('checking');
    setTimeout(() => {
      if (question.type === 'multiple_choice') {
        const isCorrect = selected === question.correctOption;
        setStatus(isCorrect ? 'correct' : 'incorrect');
        dispatchAction({ type: 'answer_submitted', answer: selected?.toString() || '' });
        if (question.onComplete) question.onComplete(isCorrect);
      } else {
        setStatus('correct');
        dispatchAction({ type: 'hypothesis_submitted', hypothesis: textAnswer });
        if (question.onComplete) question.onComplete(true);
      }
    }, 600);
  };

  const handleRetry = () => {
    setStatus('unanswered');
    setSelected(null);
  };

  return (
    <div className="bg-card/90 backdrop-blur-3xl border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl relative overflow-hidden">
      {/* Decorative Glow */}
      <div className={`absolute -top-20 -right-20 w-40 h-40 rounded-full blur-[60px] opacity-20 pointer-events-none transition-colors duration-1000 ${status === 'correct' ? 'bg-primary' : status === 'incorrect' ? 'bg-destructive' : 'bg-secondary'}`} />

      <h3 className="text-lg font-medium mb-6 relative z-10">{question.prompt}</h3>
      
      <div className="flex flex-col gap-3 relative z-10">
        {question.type === 'multiple_choice' && question.options?.map((opt, i) => (
          <button
            key={i}
            disabled={status !== 'unanswered'}
            onClick={() => setSelected(i)}
            className={`text-left px-4 py-3 rounded-xl border transition-all ${
              selected === i 
                ? 'border-primary bg-primary/10 text-white' 
                : 'border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:border-white/20'
            } ${status !== 'unanswered' ? 'opacity-80 cursor-default' : 'cursor-pointer'}`}
          >
            {opt}
          </button>
        ))}

        {question.type === 'hypothesis' && (
          <textarea 
            disabled={status !== 'unanswered'}
            value={textAnswer}
            onChange={(e) => setTextAnswer(e.target.value)}
            placeholder="State your hypothesis..."
            className="w-full h-32 bg-input/50 border border-white/10 rounded-xl p-4 text-sm resize-none focus:outline-none focus:border-primary disabled:opacity-50 transition-colors"
          />
        )}
      </div>

      <AnimatePresence mode="wait">
        {status === 'unanswered' && (
          <motion.div key="submit" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-6 flex justify-end">
            <Button disabled={(question.type === 'multiple_choice' && selected === null) || (question.type === 'hypothesis' && !textAnswer.trim())} onClick={handleSubmit}>
              Submit
            </Button>
          </motion.div>
        )}

        {status === 'checking' && (
          <motion.div key="checking" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 flex justify-center py-2">
            <div className="w-5 h-5 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
          </motion.div>
        )}

        {status === 'correct' && (
          <motion.div key="correct" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 p-4 rounded-xl bg-primary/10 border border-primary/20">
            <div className="flex items-center gap-2 text-primary font-medium mb-2">
              <Check size={18} /> Correct
            </div>
            {question.explanation && <p className="text-sm text-primary/80">{question.explanation}</p>}
          </motion.div>
        )}

        {status === 'incorrect' && (
          <motion.div key="incorrect" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6">
            <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 mb-4">
              <div className="flex items-center gap-2 text-destructive font-medium mb-2">
                <X size={18} /> Needs Review
              </div>
              <p className="text-sm text-destructive/80 leading-relaxed">
                Your answer suggests you might be confusing the direction of the propagation. Let&apos;s test your idea in the simulation.
              </p>
            </div>
            <div className="flex justify-between items-center">
              <Button variant="ghost" size="sm" className="text-muted-foreground">
                <Lightbulb size={14} className="mr-2" /> Hint
              </Button>
              <Button variant="outline" size="sm" onClick={handleRetry}>
                <RefreshCw size={14} className="mr-2" /> Try Again
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
