"use client";
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, AlertTriangle, CheckCircle2, XCircle, ArrowRight, Brain, Sparkles, RefreshCw, Zap } from 'lucide-react';
import Link from 'next/link';
import BackButton from "@/components/ui/BackButton";

interface WeakConcept {
  id: string;
  name: string;
  category: string;
  score: number;
  missedReason: string;
  remedy: string;
  drillQuestion: string;
  drillOptions: string[];
  correctIndex: number;
  explanation: string;
}

const WEAK_CONCEPTS: WeakConcept[] = [
  {
    id: "ohm-law",
    name: "Ohm's Law & Finding Resistance",
    category: "Physics",
    score: 45,
    missedReason: "Mixed up what current, voltage, and resistance each do in a circuit.",
    remedy: "Use a simple memory hook: V = I × R, or 'Volts push, Ohms resist, Amps flow'.",
    drillQuestion: "A circuit uses a 5 V battery and a 2 Ω resistor. How much current flows?",
    drillOptions: [
      "10 A",
      "7 A",
      "2.5 A",
      "0.4 A"
    ],
    correctIndex: 2,
    explanation: "I = V ÷ R = 5 ÷ 2 = 2.5 A. A smaller resistance lets more current flow.",
  },
  {
    id: "photosynthesis",
    name: "Photosynthesis — Light & Dark Reactions",
    category: "Science",
    score: 52,
    missedReason: "Got the order of the light and dark reactions backwards.",
    remedy: "Remember the order: light reactions capture sunlight first, then the dark reactions use that energy to build sugar.",
    drillQuestion: "Where do the 'dark' reactions of photosynthesis get their energy?",
    drillOptions: [
      "Directly from sunlight at night",
      "From ATP and NADPH made in the light reactions",
      "From a battery in the leaf",
      "From breaking down glucose"
    ],
    correctIndex: 1,
    explanation: "The dark reactions (Calvin cycle) don't need light directly — they use the ATP and NADPH produced by the light reactions.",
  },
  {
    id: "fractions",
    name: "Adding Fractions with Different Denominators",
    category: "Mathematics",
    score: 61,
    missedReason: "Sometimes added the denominators as well as the numerators.",
    remedy: "Always find a common denominator first — then add only the top numbers.",
    drillQuestion: "What is 1/3 + 1/4?",
    drillOptions: [
      "2/7",
      "2/12",
      "7/12",
      "1/12"
    ],
    correctIndex: 2,
    explanation: "Convert to twelfths: 4/12 + 3/12 = 7/12. You never add the bottom numbers.",
  }
];

export default function RevisionPage() {
  const [drillAnswers, setDrillAnswers] = useState<Record<string, number>>({});
  const [activeDrillId, setActiveDrillId] = useState<string | null>(null);
  const [boostedScores, setBoostedScores] = useState<Record<string, number>>({});

  const handleSelectDrillOption = (conceptId: string, optIdx: number, correctIdx: number) => {
    if (drillAnswers[conceptId] !== undefined) return;
    setDrillAnswers(prev => ({ ...prev, [conceptId]: optIdx }));
    if (optIdx === correctIdx) {
      setBoostedScores(prev => ({
        ...prev,
        [conceptId]: Math.min(100, (WEAK_CONCEPTS.find(c => c.id === conceptId)?.score || 50) + 25)
      }));
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-8 pt-12 space-y-10">
      <BackButton className="mb-2" />
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono uppercase tracking-wider text-orange-400 bg-orange-500/10 px-3 py-1 rounded-full border border-orange-500/20">
            Personal Revision Plan
          </span>
          <h1 className="text-3xl font-bold text-hexagon-text-primary mt-2">Revision Corner</h1>
          <p className="text-hexagon-text-secondary text-sm mt-1">
            Revisit the topics you found tricky with short questions and clear explanations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link 
            href="/flashcards"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20 text-xs font-semibold transition-colors"
          >
            <BookOpen className="w-3.5 h-3.5" />
            9 Cards Due
          </Link>
          <Link 
            href="/tutor"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-hexagon-accent text-black font-semibold text-xs hover:bg-hexagon-accent/90 transition-colors shadow-lg shadow-hexagon-accent/10"
          >
            <Brain className="w-3.5 h-3.5" />
            Ask Your AI Teacher
          </Link>
        </div>
      </div>

      {/* Weak Concepts Interactive List */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 text-orange-400" />
            <h2 className="text-lg font-bold text-hexagon-text-primary">Tricky Topics ({WEAK_CONCEPTS.length})</h2>
          </div>
          <span className="text-xs text-gray-400">Answer a quick question to bump up your score</span>
        </div>

        <div className="space-y-4">
          {WEAK_CONCEPTS.map((concept) => {
            const isDrillOpen = activeDrillId === concept.id;
            const currentScore = boostedScores[concept.id] !== undefined ? boostedScores[concept.id] : concept.score;
            const hasAnswered = drillAnswers[concept.id] !== undefined;
            const chosenAnswer = drillAnswers[concept.id];
            const isCorrect = chosenAnswer === concept.correctIndex;

            return (
              <motion.div 
                key={concept.id}
                layout
                className="bg-hexagon-surface border border-hexagon-border rounded-2xl p-6 backdrop-blur-md space-y-5 transition-colors hover:border-hexagon-border/90"
              >
                {/* Concept Summary Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-white/5 text-gray-400">
                        {concept.category}
                      </span>
                      <h3 className="text-base font-bold text-white">{concept.name}</h3>
                    </div>
                    <p className="text-xs text-orange-400/90 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-orange-400 shrink-0" />
                      {concept.missedReason}
                    </p>
                  </div>

                  {/* Score & Action */}
                  <div className="flex items-center gap-4 self-end sm:self-center">
                    <div className="text-right">
                      <div className="flex items-center gap-1.5 justify-end">
                        <span className={`text-base font-mono font-bold ${currentScore >= 70 ? 'text-emerald-400' : 'text-orange-400'}`}>
                          {currentScore}%
                        </span>
                        {boostedScores[concept.id] && (
                          <span className="text-[10px] text-emerald-400 font-bold font-mono">(+25%)</span>
                        )}
                      </div>
                      <span className="text-[10px] text-gray-400 block">Score</span>
                    </div>

                    <button
                      onClick={() => setActiveDrillId(isDrillOpen ? null : concept.id)}
                      className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                        isDrillOpen 
                          ? 'bg-white/10 text-white' 
                          : 'bg-hexagon-accent/15 text-hexagon-accent border border-hexagon-accent/25 hover:bg-hexagon-accent/25'
                      }`}
                    >
                      <Zap className="w-3.5 h-3.5" />
                      {isDrillOpen ? 'Close Question' : 'Try a Question'}
                    </button>
                  </div>
                </div>

                {/* Interactive Practice Drill Drawer */}
                <AnimatePresence>
                  {isDrillOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="pt-4 border-t border-white/5 space-y-4"
                    >
                      <div className="bg-background/80 border border-hexagon-border p-4 rounded-xl space-y-3">
                        <div className="flex items-center justify-between text-xs text-gray-400">
                          <span className="font-semibold text-white flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-hexagon-accent" />
                            Quick Check Question
                          </span>
                          <span>Pick the best answer</span>
                        </div>

                        <p className="text-sm font-medium text-white leading-relaxed">
                          {concept.drillQuestion}
                        </p>

                        <div className="space-y-2 pt-1">
                          {concept.drillOptions.map((opt, optIdx) => {
                            let btnStyle = "bg-white/5 border-white/10 text-gray-300 hover:border-hexagon-accent/40";
                            if (hasAnswered) {
                              if (optIdx === concept.correctIndex) {
                                btnStyle = "bg-emerald-500/20 border-emerald-500 text-emerald-300 font-medium";
                              } else if (optIdx === chosenAnswer) {
                                btnStyle = "bg-red-500/20 border-red-500 text-red-300";
                              } else {
                                btnStyle = "opacity-40 bg-white/5 border-transparent text-gray-500";
                              }
                            }

                            return (
                              <button
                                key={optIdx}
                                disabled={hasAnswered}
                                onClick={() => handleSelectDrillOption(concept.id, optIdx, concept.correctIndex)}
                                className={`w-full text-left p-3 rounded-lg border text-xs transition-all flex items-center justify-between ${btnStyle}`}
                              >
                                <span>{opt}</span>
                                {hasAnswered && optIdx === concept.correctIndex && (
                                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                                )}
                                {hasAnswered && optIdx === chosenAnswer && optIdx !== concept.correctIndex && (
                                  <XCircle className="w-4 h-4 text-red-400 shrink-0" />
                                )}
                              </button>
                            );
                          })}
                        </div>

                        {hasAnswered && (
                          <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className={`p-3 rounded-lg text-xs leading-relaxed ${
                              isCorrect ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20' : 'bg-red-500/10 text-red-300 border border-red-500/20'
                            }`}
                          >
                            <p className="font-semibold mb-0.5">{isCorrect ? '✓ Nice work! Score +25%' : '✗ Not quite — here is why'}</p>
                            <p className="text-gray-300 text-[11px]">{concept.explanation}</p>
                          </motion.div>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-xs text-gray-400 pt-1">
                        <span>AI Teacher Tip: <strong className="text-gray-200">{concept.remedy}</strong></span>
                        <Link 
                          href="/tutor"
                          className="text-hexagon-accent hover:underline flex items-center gap-1 font-semibold"
                        >
                          Ask your AI Teacher <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

