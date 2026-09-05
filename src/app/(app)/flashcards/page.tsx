"use client";
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, RotateCcw, Layers, ArrowRight, ArrowLeft, Brain, Sparkles, Award, Clock } from 'lucide-react';
import Link from 'next/link';

interface Flashcard {
  id: number;
  front: string;
  back: string;
  hint?: string;
  topic: string;
}

interface Deck {
  id: string;
  title: string;
  subject: string;
  cardCount: number;
  dueCount: number;
  masteryPct: number;
  cards: Flashcard[];
}

const DECKS: Deck[] = [
  {
    id: "nn-core",
    title: "Neural Networks & Deep Learning",
    subject: "Computer Science",
    cardCount: 5,
    dueCount: 5,
    masteryPct: 78,
    cards: [
      { 
        id: 1, 
        front: "What is a Neuron (Perceptron) in a Neural Network?", 
        back: "The fundamental computational unit that receives weighted inputs, adds a bias term, and passes the sum through an activation function: a = σ(∑ w_i x_i + b).",
        hint: "Think of an assembly station with inputs and an activation threshold.",
        topic: "Architecture"
      },
      { 
        id: 2, 
        front: "What does the Backpropagation algorithm compute?", 
        back: "The partial derivatives of the loss function with respect to every weight and bias in the network (∂L/∂W) using the chain rule backwards.",
        hint: "Calculus chain rule moving from output back to input.",
        topic: "Learning"
      },
      { 
        id: 3, 
        front: "What is the primary role of an Activation Function?", 
        back: "To inject non-linearity into the network, enabling it to approximate arbitrary non-linear functions (Universal Approximation Theorem).",
        hint: "Without it, deep networks collapse into a single linear matrix.",
        topic: "Activations"
      },
      { 
        id: 4, 
        front: "Why does ReLU help prevent Vanishing Gradients?", 
        back: "For positive inputs (x > 0), the gradient of ReLU is a constant 1.0, which prevents the exponential decay of gradient signals across deep layers.",
        hint: "Compare its constant slope to Sigmoid's maximum 0.25 slope.",
        topic: "Activations"
      },
      { 
        id: 5, 
        front: "What is the difference between Batch, Mini-Batch, and Stochastic Gradient Descent?", 
        back: "Batch uses the entire dataset per update; Stochastic uses 1 single sample; Mini-Batch balances GPU parallelization and gradient noise by using small subsets (e.g. 32–256).",
        hint: "Think about the sample size used to calculate the gradient step.",
        topic: "Optimization"
      }
    ]
  },
  {
    id: "optimization",
    title: "Loss Functions & Optimization",
    subject: "Machine Learning",
    cardCount: 4,
    dueCount: 4,
    masteryPct: 62,
    cards: [
      {
        id: 6,
        front: "What does Cross-Entropy Loss measure?",
        back: "The divergence between the predicted probability distribution and the true one-hot ground-truth distribution: L = -∑ y_i log(p_i).",
        hint: "Information theory and log-likelihood.",
        topic: "Loss Functions"
      },
      {
        id: 7,
        front: "What is the role of Momentum in Gradient Descent?",
        back: "It dampens oscillations in steep directions and accelerates movement along persistent directions by adding a fraction of the previous update vector.",
        hint: "A heavy ball rolling down a hilly terrain.",
        topic: "Optimizers"
      },
      {
        id: 8,
        front: "What is Overfitting and how is it detected?",
        back: "When a model memorizes noise in the training set; detected when Training Loss continues to fall while Validation Loss begins to rise.",
        hint: "Discrepancy between training and validation error curves.",
        topic: "Generalization"
      },
      {
        id: 9,
        front: "What is the purpose of L2 Regularization (Weight Decay)?",
        back: "Adds a penalty proportional to the squared magnitude of the weights (λ/2·||W||²) to the loss, discouraging complex, peaky weights.",
        hint: "Penalizing large weight coefficients.",
        topic: "Regularization"
      }
    ]
  }
];

export default function FlashcardsPage() {
  const [activeDeckId, setActiveDeckId] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [ratings, setRatings] = useState<Record<number, string>>({});

  const activeDeck = DECKS.find(d => d.id === activeDeckId);

  const handleStartDeck = (deckId: string) => {
    setActiveDeckId(deckId);
    setCurrentIndex(0);
    setFlipped(false);
    setCompleted(false);
    setRatings({});
  };

  const handleRate = (rating: 'again' | 'hard' | 'good' | 'easy') => {
    setRatings(prev => ({ ...prev, [currentIndex]: rating }));
    setFlipped(false);

    if (activeDeck && currentIndex < activeDeck.cards.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setCompleted(true);
    }
  };

  // 1. DECKS OVERVIEW SCREEN
  if (!activeDeck) {
    return (
      <div className="max-w-5xl mx-auto p-8 pt-12 space-y-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-hexagon-accent bg-hexagon-accent/15 px-3 py-1 rounded-full border border-hexagon-accent/25">
              Spaced Repetition System
            </span>
            <h1 className="text-3xl font-bold text-hexagon-text-primary mt-2">Flashcard Decks</h1>
            <p className="text-hexagon-text-secondary text-sm mt-1">
              Active recall calibrated with adaptive Leitner intervals.
            </p>
          </div>

          <button 
            onClick={() => handleStartDeck(DECKS[0].id)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-hexagon-accent text-black font-semibold text-xs hover:bg-hexagon-accent/90 transition-colors shadow-lg shadow-hexagon-accent/10 self-start sm:self-auto"
          >
            <Layers className="w-4 h-4" />
            Study All Due Cards (9)
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {DECKS.map((deck) => (
            <motion.div
              key={deck.id}
              whileHover={{ y: -3 }}
              className="bg-hexagon-surface border border-hexagon-border p-6 rounded-2xl backdrop-blur-md flex flex-col justify-between space-y-6 hover:border-hexagon-accent/40 transition-all shadow-md"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-mono text-gray-400 uppercase tracking-wider">{deck.subject}</span>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-orange-500/15 text-orange-400 border border-orange-500/25">
                    {deck.dueCount} Due Today
                  </span>
                </div>
                <h2 className="text-lg font-bold text-white mb-1">{deck.title}</h2>
                <p className="text-xs text-hexagon-text-secondary">{deck.cardCount} conceptual mastery flashcards</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-gray-400">Mastery</span>
                    <span className="text-hexagon-accent font-bold">{deck.masteryPct}%</span>
                  </div>
                  <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-hexagon-accent h-full rounded-full" style={{ width: `${deck.masteryPct}%` }} />
                  </div>
                </div>

                <button
                  onClick={() => handleStartDeck(deck.id)}
                  className="w-full py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-hexagon-accent hover:text-black font-semibold text-xs text-white transition-all flex items-center justify-center gap-2"
                >
                  Start Deck Session <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  // 2. SESSION COMPLETED SCREEN
  if (completed) {
    return (
      <div className="max-w-xl mx-auto p-8 pt-16 flex flex-col items-center text-center space-y-6">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center text-emerald-400 shadow-2xl shadow-emerald-500/20"
        >
          <Award className="w-10 h-10" />
        </motion.div>

        <div>
          <h2 className="text-2xl font-bold text-hexagon-text-primary">Deck Completed!</h2>
          <p className="text-hexagon-text-secondary text-sm mt-1">
            You reviewed all {activeDeck.cards.length} cards in <strong className="text-white">{activeDeck.title}</strong>.
          </p>
        </div>

        <div className="w-full bg-hexagon-surface border border-hexagon-border p-5 rounded-2xl backdrop-blur-md grid grid-cols-2 gap-4 text-center">
          <div>
            <span className="text-xs text-gray-400">Memory Retention</span>
            <p className="text-2xl font-black text-hexagon-accent mt-1">+12%</p>
          </div>
          <div>
            <span className="text-xs text-gray-400">Next Review</span>
            <p className="text-2xl font-black text-white mt-1">Tomorrow</p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full">
          <button
            onClick={() => handleStartDeck(activeDeck.id)}
            className="flex-1 py-3 rounded-xl border border-hexagon-border hover:bg-white/5 font-semibold text-xs text-white transition-colors flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Review Again
          </button>
          <button
            onClick={() => setActiveDeckId(null)}
            className="flex-1 py-3 rounded-xl bg-hexagon-accent text-black font-semibold text-xs hover:bg-hexagon-accent/90 transition-colors"
          >
            Back to All Decks
          </button>
        </div>
      </div>
    );
  }

  // 3. ACTIVE FLASHCARD STUDY MODE
  const card = activeDeck.cards[currentIndex];

  return (
    <div className="max-w-3xl mx-auto p-8 pt-10 flex flex-col items-center space-y-6">
      {/* Top Header */}
      <div className="w-full flex items-center justify-between">
        <button
          onClick={() => setActiveDeckId(null)}
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Exit Deck
        </button>

        <span className="text-xs font-mono font-bold text-hexagon-accent bg-hexagon-accent/15 px-3 py-1 rounded-full border border-hexagon-accent/25">
          Card {currentIndex + 1} of {activeDeck.cards.length}
        </span>

        <span className="text-xs text-gray-400 font-mono hidden sm:inline">{card.topic}</span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
        <div 
          className="bg-hexagon-accent h-full transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / activeDeck.cards.length) * 100}%` }}
        />
      </div>

      {/* 3D Flip Card */}
      <div 
        className="w-full h-80 relative cursor-pointer perspective-1000 select-none group mt-2"
        onClick={() => setFlipped(!flipped)}
      >
        <motion.div
          className="w-full h-full absolute inset-0 [transform-style:preserve-3d]"
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          {/* Front Face */}
          <div className="absolute inset-0 bg-[#07090E] border border-white/10 rounded-3xl p-8 flex flex-col justify-between [backface-visibility:hidden] shadow-2xl group-hover:border-purple-500/40 transition-colors">
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span className="font-mono uppercase text-[10px] bg-white/5 px-2 py-0.5 rounded text-gray-300">Question</span>
              <span className="text-[11px] text-purple-400 font-medium">Click to flip ↻</span>
            </div>
            <h2 className="text-2xl font-bold text-center text-white px-4 leading-snug">
              {card.front}
            </h2>
            <div className="text-center text-xs text-gray-500 font-mono">
              {card.hint && <span>Hint: {card.hint}</span>}
            </div>
          </div>
          
          {/* Back Face */}
          <div 
            className="absolute inset-0 bg-[#07090E] border border-emerald-500/40 rounded-3xl p-8 flex flex-col justify-between [backface-visibility:hidden] shadow-2xl"
            style={{ transform: 'rotateY(180deg)' }}
          >
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span className="font-mono uppercase text-[10px] bg-hexagon-accent/20 text-hexagon-accent px-2 py-0.5 rounded font-bold">Answer & Derivation</span>
              <span className="text-[11px] text-gray-400 font-medium">Click to flip ↻</span>
            </div>
            <p className="text-lg font-medium text-center text-hexagon-text-primary px-4 leading-relaxed">
              {card.back}
            </p>
            <div className="text-center text-[11px] text-emerald-400 font-mono">
              Rate your recall below to set next interval
            </div>
          </div>
        </motion.div>
      </div>

      {/* SRS Rating Buttons (Always visible or prominent after flip) */}
      <div className="w-full pt-4 space-y-2">
        <p className="text-center text-xs text-gray-400 font-medium">
          {flipped ? "Rate your recall ease:" : "Flip card to reveal answer and rate memory"}
        </p>
        <div className="grid grid-cols-4 gap-2 sm:gap-3">
          <button 
            onClick={() => handleRate('again')} 
            className="bg-red-500/10 text-red-400 border border-red-500/20 py-3 rounded-xl font-semibold text-xs flex flex-col items-center gap-1 hover:bg-red-500/20 transition-all active:scale-[0.98]"
          >
            <X className="w-4 h-4" />
            <span>Again</span>
            <span className="text-[10px] text-gray-500 font-mono">&lt; 10m</span>
          </button>
          
          <button 
            onClick={() => handleRate('hard')} 
            className="bg-amber-500/10 text-amber-400 border border-amber-500/20 py-3 rounded-xl font-semibold text-xs flex flex-col items-center gap-1 hover:bg-amber-500/20 transition-all active:scale-[0.98]"
          >
            <Clock className="w-4 h-4" />
            <span>Hard</span>
            <span className="text-[10px] text-gray-500 font-mono">1 day</span>
          </button>

          <button 
            onClick={() => handleRate('good')} 
            className="bg-white/5 text-white border border-white/10 py-3 rounded-xl font-semibold text-xs flex flex-col items-center gap-1 hover:bg-white/10 transition-all active:scale-[0.98]"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Good</span>
            <span className="text-[10px] text-gray-500 font-mono">3 days</span>
          </button>

          <button 
            onClick={() => handleRate('easy')} 
            className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 py-3 rounded-xl font-semibold text-xs flex flex-col items-center gap-1 hover:bg-emerald-500/25 transition-all active:scale-[0.98]"
          >
            <Check className="w-4 h-4" />
            <span>Easy</span>
            <span className="text-[10px] text-gray-500 font-mono">7 days</span>
          </button>
        </div>
      </div>
    </div>
  );
}

