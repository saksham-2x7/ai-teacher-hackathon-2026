"use client";
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Clock, ArrowRight, CheckCircle2, XCircle, Award, RotateCcw, Brain, ShieldAlert, Sparkles } from 'lucide-react';
import Link from 'next/link';
import BackButton from "@/components/ui/BackButton";

interface Question {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  topic: string;
}

const EXAM_QUESTIONS: Question[] = [
  {
    id: 1,
    question: "What does the battery do in a simple circuit?",
    options: [
      "It provides the voltage that pushes current around the circuit",
      "It slows the current down",
      "It turns the bulb on only in daylight",
      "It measures how fast electrons move"
    ],
    correctIndex: 0,
    explanation: "The battery provides the voltage (the 'push') that drives current around the circuit.",
    topic: "Circuits"
  },
  {
    id: 2,
    question: "If resistance increases while the battery stays the same, what happens to the current?",
    options: [
      "The current stays the same",
      "The current increases",
      "The current decreases",
      "The current stops permanently"
    ],
    correctIndex: 2,
    explanation: "Remember Ohm's Law: current = voltage ÷ resistance. Bigger resistance means a smaller current.",
    topic: "Ohm's Law"
  },
  {
    id: 3,
    question: "According to Ohm's Law, what does current (I) equal?",
    options: [
      "Voltage ÷ Resistance",
      "Resistance ÷ Voltage",
      "Voltage × Resistance",
      "Resistance − Voltage"
    ],
    correctIndex: 0,
    explanation: "I = V ÷ R. Voltage (V) divided by resistance (R).",
    topic: "Ohm's Law"
  },
  {
    id: 4,
    question: "What is the unit used to measure electric current?",
    options: [
      "Volts (V)",
      "Ohms (Ω)",
      "Amperes (A)",
      "Watts (W)"
    ],
    correctIndex: 2,
    explanation: "Current is measured in amperes (amps). Voltage is measured in volts and resistance in ohms.",
    topic: "Current"
  },
  {
    id: 5,
    question: "Two bulbs are wired in series and one burns out. What happens to the other bulb?",
    options: [
      "It stays bright",
      "It goes out too",
      "It gets brighter",
      "Nothing changes"
    ],
    correctIndex: 1,
    explanation: "In a series circuit, current has only one path. Break the loop and no current flows at all.",
    topic: "Circuits"
  }
];

export default function ExamPage() {
  const [examState, setExamState] = useState<'intro' | 'active' | 'complete'>('intro');
  const [subject, setSubject] = useState("Physics: Electricity & Circuits");
  const [difficulty, setDifficulty] = useState("Adaptive");
  const [targetDurationMinutes, setTargetDurationMinutes] = useState(15);
  
  // Active exam state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [showExplanation, setShowExplanation] = useState(false);
  const [timeLeft, setTimeLeft] = useState(targetDurationMinutes * 60);

  // Timer countdown
  useEffect(() => {
    if (examState !== 'active') return;
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setExamState('complete');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [examState]);

  const handleStartExam = () => {
    setTimeLeft(targetDurationMinutes * 60);
    setCurrentIndex(0);
    setSelectedAnswers({});
    setShowExplanation(false);
    setExamState('active');
  };

  const handleSelectOption = (optionIndex: number) => {
    if (selectedAnswers[currentIndex] !== undefined) return;
    setSelectedAnswers(prev => ({ ...prev, [currentIndex]: optionIndex }));
    setShowExplanation(true);
  };

  const handleNextQuestion = () => {
    setShowExplanation(false);
    if (currentIndex < EXAM_QUESTIONS.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setExamState('complete');
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const calculateScore = () => {
    let correct = 0;
    EXAM_QUESTIONS.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctIndex) correct++;
    });
    return {
      correct,
      total: EXAM_QUESTIONS.length,
      pct: Math.round((correct / EXAM_QUESTIONS.length) * 100)
    };
  };

  // 1. INTRO / CONFIGURATION SCREEN
  if (examState === 'intro') {
    return (
      <div className="max-w-4xl mx-auto p-8 pt-12 flex flex-col items-center text-center space-y-8">
        <BackButton className="self-start mb-1" />
        <div className="w-20 h-20 bg-red-500/10 border border-red-500/20 text-red-400 rounded-3xl flex items-center justify-center mb-2 shadow-xl shadow-red-500/5">
          <Target className="w-10 h-10" />
        </div>
        
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-red-400 bg-red-500/10 px-3 py-1 rounded-full border border-red-500/20">
            Real-Time Assessment
          </span>
          <h1 className="text-4xl font-bold text-hexagon-text-primary mt-3">Exam Arena</h1>
          <p className="text-hexagon-text-secondary text-base max-w-lg mt-2 mx-auto">
            Practice answering under a time limit. The AI checks your accuracy and speed, then tells you what to review.
          </p>
        </div>
        
        <div className="w-full max-w-md bg-hexagon-surface border border-hexagon-border rounded-2xl p-6 text-left space-y-6 backdrop-blur-md shadow-2xl">
          <div>
            <label className="block text-xs font-semibold text-hexagon-text-secondary uppercase tracking-wider mb-2">
              Select Assessment Topic
            </label>
            <select 
              value={subject} 
              onChange={e => setSubject(e.target.value)}
              className="w-full bg-background border border-hexagon-border rounded-xl px-4 py-3 text-hexagon-text-primary outline-none focus:border-hexagon-accent text-sm"
            >
              <option>Physics: Electricity & Circuits</option>
              <option>Science: Photosynthesis</option>
              <option>Chemistry: Chemical Reactions</option>
            </select>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-hexagon-text-secondary uppercase tracking-wider mb-2">
                Difficulty
              </label>
              <select 
                value={difficulty} 
                onChange={e => setDifficulty(e.target.value)}
                className="w-full bg-background border border-hexagon-border rounded-xl px-4 py-3 text-hexagon-text-primary outline-none focus:border-hexagon-accent text-sm"
              >
                <option>Adaptive</option>
                <option>Harder</option>
                <option>Hardest</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-hexagon-text-secondary uppercase tracking-wider mb-2">
                Time Limit
              </label>
              <select 
                value={targetDurationMinutes} 
                onChange={e => setTargetDurationMinutes(Number(e.target.value))}
                className="w-full bg-background border border-hexagon-border rounded-xl px-4 py-3 text-hexagon-text-primary outline-none focus:border-hexagon-accent text-sm"
              >
                <option value={5}>5 Minutes</option>
                <option value={15}>15 Minutes</option>
                <option value={30}>30 Minutes</option>
              </select>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex items-center gap-3 text-xs text-gray-300">
            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Anti-guess mode enabled: explanations will unlock after each question.</span>
          </div>

          <button 
            onClick={handleStartExam}
            className="w-full bg-red-500 text-white font-semibold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-red-600 transition-all shadow-lg shadow-red-500/20 active:scale-[0.99]"
          >
            Begin Assessment <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  // 2. ACTIVE EXAM SCREEN
  if (examState === 'active') {
    const q = EXAM_QUESTIONS[currentIndex];
    const hasAnswered = selectedAnswers[currentIndex] !== undefined;
    const selected = selectedAnswers[currentIndex];
    const isCorrect = selected === q.correctIndex;

    return (
      <div className="max-w-3xl mx-auto p-8 pt-10 space-y-6">
        <BackButton className="mb-1" href="/home" />
        {/* Top Live Bar */}
        <div className="flex items-center justify-between bg-hexagon-surface border border-hexagon-border px-5 py-3 rounded-2xl backdrop-blur-md">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono font-bold text-hexagon-accent bg-hexagon-accent/15 px-2.5 py-1 rounded-lg border border-hexagon-accent/25">
              Q{currentIndex + 1} / {EXAM_QUESTIONS.length}
            </span>
            <span className="text-xs text-gray-400 font-medium hidden sm:inline">{q.topic}</span>
          </div>

          <div className="flex items-center gap-2 font-mono text-sm font-bold text-red-400 bg-red-500/10 px-3 py-1 rounded-lg border border-red-500/20">
            <Clock className="w-4 h-4 animate-pulse" />
            {formatTime(timeLeft)}
          </div>
        </div>

        {/* Progress Tracker */}
        <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
          <div 
            className="bg-hexagon-accent h-full transition-all duration-300"
            style={{ width: `${((currentIndex + (hasAnswered ? 1 : 0)) / EXAM_QUESTIONS.length) * 100}%` }}
          />
        </div>

        {/* Question Card */}
        <motion.div 
          key={q.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-hexagon-surface border border-hexagon-border p-7 rounded-2xl backdrop-blur-md space-y-6 shadow-xl"
        >
          <h2 className="text-xl font-bold text-hexagon-text-primary leading-relaxed">
            {q.question}
          </h2>

          {/* Options */}
          <div className="space-y-3">
            {q.options.map((opt, optIdx) => {
              let btnStyle = "bg-background/80 border-hexagon-border/80 text-gray-200 hover:border-hexagon-accent/50";
              if (hasAnswered) {
                if (optIdx === q.correctIndex) {
                  btnStyle = "bg-emerald-500/20 border-emerald-500 text-emerald-300 font-semibold";
                } else if (optIdx === selected) {
                  btnStyle = "bg-red-500/20 border-red-500 text-red-300";
                } else {
                  btnStyle = "bg-background/40 border-hexagon-border/40 text-gray-500 opacity-60";
                }
              }

              return (
                <button
                  key={optIdx}
                  disabled={hasAnswered}
                  onClick={() => handleSelectOption(optIdx)}
                  className={`w-full text-left p-4 rounded-xl border text-sm transition-all flex items-start gap-3.5 ${btnStyle}`}
                >
                  <span className="w-6 h-6 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center font-mono text-xs font-bold text-gray-400 shrink-0">
                    {String.fromCharCode(65 + optIdx)}
                  </span>
                  <span className="flex-1 leading-normal">{opt}</span>
                  {hasAnswered && optIdx === q.correctIndex && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  )}
                  {hasAnswered && optIdx === selected && optIdx !== q.correctIndex && (
                    <XCircle className="w-5 h-5 text-red-400 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Answer Explanation */}
          <AnimatePresence>
            {showExplanation && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className={`p-4 rounded-xl border text-xs leading-relaxed space-y-1 ${
                  isCorrect ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300' : 'bg-red-500/10 border-red-500/20 text-red-300'
                }`}
              >
                <div className="font-bold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  {isCorrect ? 'Nice job!' : 'Not quite — here is why:'}
                </div>
                <p className="text-gray-300">{q.explanation}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Next Button */}
          {hasAnswered && (
            <motion.button
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={handleNextQuestion}
              className="w-full bg-hexagon-accent text-black font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 hover:bg-hexagon-accent/90 transition-colors shadow-lg shadow-hexagon-accent/10"
            >
              {currentIndex < EXAM_QUESTIONS.length - 1 ? 'Next Question' : 'Complete Exam'} <ArrowRight className="w-4 h-4" />
            </motion.button>
          )}
        </motion.div>
      </div>
    );
  }

  // 3. COMPLETE / SCORECARD SCREEN
  const score = calculateScore();

  return (
    <div className="max-w-2xl mx-auto p-8 pt-12 space-y-8 text-center">
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-24 h-24 rounded-full bg-hexagon-accent/20 border-2 border-hexagon-accent flex items-center justify-center mx-auto text-hexagon-accent shadow-2xl shadow-hexagon-accent/20"
      >
        <Award className="w-12 h-12" />
      </motion.div>

      <div>
        <h1 className="text-3xl font-extrabold text-hexagon-text-primary">Exam Complete</h1>
        <p className="text-hexagon-text-secondary text-sm mt-1">Here is how you did on {subject}.</p>
      </div>

      {/* Score Summary Card */}
      <div className="bg-hexagon-surface border border-hexagon-border p-6 rounded-2xl backdrop-blur-md grid grid-cols-3 gap-4 text-center">
        <div>
          <p className="text-xs text-hexagon-text-secondary">Accuracy</p>
          <p className="text-3xl font-black text-hexagon-accent mt-1">{score.pct}%</p>
          <p className="text-[10px] text-gray-400 mt-0.5">{score.correct} of {score.total} correct</p>
        </div>
        <div>
          <p className="text-xs text-hexagon-text-secondary">Time Spent</p>
          <p className="text-3xl font-black text-white mt-1">
            {formatTime(targetDurationMinutes * 60 - timeLeft)}
          </p>
          <p className="text-[10px] text-gray-400 mt-0.5">Pacing: 42s / question</p>
        </div>
        <div>
          <p className="text-xs text-hexagon-text-secondary">Your Level</p>
          <p className={`text-3xl font-black mt-1 ${score.pct >= 80 ? 'text-emerald-400' : score.pct >= 60 ? 'text-amber-400' : 'text-red-400'}`}>
            {score.pct >= 80 ? 'Ready' : score.pct >= 60 ? 'Good' : 'Review'}
          </p>
          <p className="text-[10px] text-gray-400 mt-0.5">Recommended next step</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-3 justify-center">
        <button
          onClick={handleStartExam}
          className="w-full sm:w-auto px-6 py-3 rounded-xl border border-hexagon-border hover:bg-white/5 font-semibold text-sm text-white flex items-center justify-center gap-2 transition-colors"
        >
          <RotateCcw className="w-4 h-4" /> Retake Exam
        </button>
        <Link
          href="/revision"
          className="w-full sm:w-auto px-6 py-3 rounded-xl bg-orange-500/20 border border-orange-500/30 text-orange-400 hover:bg-orange-500/30 font-semibold text-sm flex items-center justify-center gap-2 transition-colors"
        >
          Target Weak Concepts <ArrowRight className="w-4 h-4" />
        </Link>
        <Link
          href="/tutor"
          className="w-full sm:w-auto px-6 py-3 rounded-xl bg-hexagon-accent text-black font-bold text-sm flex items-center justify-center gap-2 hover:bg-hexagon-accent/90 transition-colors shadow-lg shadow-hexagon-accent/15"
        >
          <Brain className="w-4 h-4" /> Discuss with AI Tutor
        </Link>
      </div>
    </div>
  );
}

