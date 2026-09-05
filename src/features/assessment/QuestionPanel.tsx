'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
    <div className="w-full brut-card bg-white p-5">
      <div className="flex items-start justify-between gap-3 mb-4">
        <h3 className="text-lg font-black text-black leading-snug">{question.prompt}</h3>
        <span className="brut-tag shrink-0" style={{ background: '#00E9FF' }}>Question</span>
      </div>

      <div className="flex flex-col gap-2.5">
        {question.type === 'multiple_choice' && question.options?.map((opt, i) => (
          <button
            key={i}
            disabled={status !== 'unanswered'}
            onClick={() => setSelected(i)}
            className={`text-left px-4 py-3 rounded-lg border-2 border-black font-semibold transition-all ${
              selected === i
                ? 'bg-black text-white'
                : 'bg-white text-black hover:bg-[#EDEAE0]'
            } ${status !== 'unanswered' ? 'opacity-70 cursor-default' : 'cursor-pointer'}`}
          >
            {opt}
          </button>
        ))}

        {question.type === 'hypothesis' && (
          <textarea
            disabled={status !== 'unanswered'}
            value={textAnswer}
            onChange={e => setTextAnswer(e.target.value)}
            placeholder="State your hypothesis..."
            className="w-full h-28 brut-input p-4 text-sm font-bold resize-none"
          />
        )}
      </div>

      <AnimatePresence mode="wait">
        {status === 'unanswered' && (
          <motion.div key="submit" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-4 flex justify-end">
            <button
              disabled={(question.type === 'multiple_choice' && selected === null) || (question.type === 'hypothesis' && !textAnswer.trim())}
              onClick={handleSubmit}
              className="brut-btn brut-primary px-6 py-2.5 text-sm"
            >
              Submit
            </button>
          </motion.div>
        )}

        {status === 'checking' && (
          <motion.div key="checking" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 flex justify-center py-2">
            <div className="w-5 h-5 border-2 border-black border-t-[#00FF9D] rounded-full animate-spin" />
          </motion.div>
        )}

        {status === 'correct' && (
          <motion.div key="correct" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-4 p-4 rounded-lg border-2 border-black bg-[#00FF9D]">
            <div className="flex items-center gap-2 font-black mb-1">
              <Check size={18} /> Correct
            </div>
            {question.explanation && <p className="text-sm font-semibold text-black/80">{question.explanation}</p>}
          </motion.div>
        )}

        {status === 'incorrect' && (
          <motion.div key="incorrect" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-4">
            <div className="p-4 rounded-lg border-2 border-black bg-[#FF4D4D] mb-3">
              <div className="flex items-center gap-2 font-black mb-1">
                <X size={18} /> Needs review
              </div>
              <p className="text-sm font-semibold text-black/80 leading-relaxed">
                Not quite — let&apos;s revisit the idea and try again.
              </p>
            </div>
            <div className="flex justify-between items-center">
              <button className="brut-btn brut-secondary px-4 py-2 text-xs flex items-center gap-1.5">
                <Lightbulb size={14} /> Hint
              </button>
              <button onClick={handleRetry} className="brut-btn brut-ink px-4 py-2 text-xs flex items-center gap-1.5">
                <RefreshCw size={14} /> Try again
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}