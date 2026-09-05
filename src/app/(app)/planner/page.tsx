"use client";
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, CheckCircle2, Circle, Plus, ArrowRight, Sparkles, Brain, Flame, Trash2 } from 'lucide-react';
import Link from 'next/link';

interface StudyPlanItem {
  id: string;
  day: string;
  goal: string;
  topic: string;
  time: string;
  minutes: number;
  done: boolean;
  priority: 'high' | 'medium' | 'normal';
}

const INITIAL_PLAN: StudyPlanItem[] = [
  { id: '1', day: "Monday", goal: "Neural Networks Architecture & Perceptrons", topic: "AI & ML", time: "25m", minutes: 25, done: true, priority: 'high' },
  { id: '2', day: "Tuesday", goal: "Multivariate Calculus & Backpropagation Chain Rule", topic: "Mathematics", time: "35m", minutes: 35, done: true, priority: 'high' },
  { id: '3', day: "Wednesday (Today)", goal: "Activation Functions & Vanishing Gradient Remediation", topic: "Deep Learning", time: "30m", minutes: 30, done: false, priority: 'high' },
  { id: '4', day: "Thursday", goal: "Convolutional Filters, Strides & Spatial Pooling", topic: "Computer Vision", time: "40m", minutes: 40, done: false, priority: 'medium' },
  { id: '5', day: "Friday", goal: "Weekly Concept Consolidation & Flashcard Drill", topic: "Revision", time: "20m", minutes: 20, done: false, priority: 'normal' },
  { id: '6', day: "Saturday", goal: "Exam Arena: 15-Minute Timed Simulation", topic: "Assessment", time: "15m", minutes: 15, done: false, priority: 'high' },
];

export default function PlannerPage() {
  const [plan, setPlan] = useState<StudyPlanItem[]>(INITIAL_PLAN);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newGoal, setNewGoal] = useState('');
  const [newDay, setNewDay] = useState('Sunday');
  const [newMinutes, setNewMinutes] = useState(30);

  const toggleDone = (id: string) => {
    setPlan(prev => prev.map(item => item.id === id ? { ...item, done: !item.done } : item));
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoal.trim()) return;
    const newItem: StudyPlanItem = {
      id: Date.now().toString(),
      day: newDay,
      goal: newGoal.trim(),
      topic: "Custom Session",
      time: `${newMinutes}m`,
      minutes: newMinutes,
      done: false,
      priority: 'medium'
    };
    setPlan(prev => [...prev, newItem]);
    setNewGoal('');
    setShowAddModal(false);
  };

  const completedCount = plan.filter(p => p.done).length;
  const totalMinutes = plan.reduce((acc, p) => acc + p.minutes, 0);
  const completedMinutes = plan.filter(p => p.done).reduce((acc, p) => acc + p.minutes, 0);
  const progressPct = Math.round((completedCount / plan.length) * 100);

  return (
    <div className="max-w-4xl mx-auto p-8 pt-12 space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-hexagon-accent bg-hexagon-accent/15 px-3 py-1 rounded-full border border-hexagon-accent/25">
            AI-Calibrated Curriculum
          </span>
          <h1 className="text-3xl font-bold text-hexagon-text-primary mt-2">Adaptive Study Planner</h1>
          <p className="text-hexagon-text-secondary text-sm mt-1">
            Personalized study trajectory dynamically paced around your retention score.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 text-white font-semibold text-xs hover:bg-white/15 transition-colors border border-white/10"
          >
            <Plus className="w-4 h-4" /> Add Milestone
          </button>
          <Link
            href="/tutor"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-hexagon-accent text-black font-semibold text-xs hover:bg-hexagon-accent/90 transition-colors shadow-lg shadow-hexagon-accent/10"
          >
            <Brain className="w-4 h-4" /> Start Today&apos;s Session
          </Link>
        </div>
      </div>

      {/* Weekly Progress Card */}
      <div className="bg-hexagon-surface border border-hexagon-border rounded-2xl p-6 backdrop-blur-md grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-hexagon-accent/15 border border-hexagon-accent/25 flex items-center justify-center text-hexagon-accent shadow-inner">
            <Calendar className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">This Week&apos;s Orbit</h2>
            <p className="text-xs text-hexagon-text-secondary mt-0.5">{completedCount} of {plan.length} sessions completed</p>
          </div>
        </div>

        <div className="space-y-1.5 md:col-span-2">
          <div className="flex justify-between text-xs font-mono">
            <span className="text-gray-400">Weekly Target ({completedMinutes} / {totalMinutes} min)</span>
            <span className="text-hexagon-accent font-bold">{progressPct}% Complete</span>
          </div>
          <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
            <motion.div 
              className="bg-hexagon-accent h-full rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-gray-400 px-1">
          <span>Click checkboxes to update completion status</span>
          <span>Adaptive Pace: 30m / day</span>
        </div>

        <div className="space-y-3">
          {plan.map((item, i) => (
            <motion.div 
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              key={item.id} 
              className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-150 ${
                item.done 
                  ? 'bg-hexagon-surface/50 border-white/5 opacity-70' 
                  : 'bg-hexagon-surface border-hexagon-border hover:border-hexagon-accent/30'
              }`}
            >
              <div className="flex items-center gap-4 min-w-0">
                <button
                  onClick={() => toggleDone(item.id)}
                  className="focus:outline-none shrink-0"
                >
                  {item.done ? (
                    <CheckCircle2 className="w-5 h-5 text-hexagon-accent" />
                  ) : (
                    <Circle className="w-5 h-5 text-gray-500 hover:text-hexagon-accent transition-colors" />
                  )}
                </button>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`font-semibold text-sm truncate ${item.done ? 'line-through text-gray-400' : 'text-white'}`}>
                      {item.goal}
                    </span>
                    <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-white/5 text-gray-400 hidden sm:inline">
                      {item.topic}
                    </span>
                  </div>
                  <p className="text-xs text-hexagon-text-secondary mt-0.5">{item.day}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div className="flex items-center gap-1 text-gray-400 text-xs font-mono">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{item.time}</span>
                </div>
                {!item.done && (
                  <Link
                    href="/tutor"
                    className="p-2 rounded-lg bg-white/5 hover:bg-hexagon-accent hover:text-black text-gray-300 transition-colors"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Add Milestone Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-hexagon-surface border border-hexagon-border p-6 rounded-2xl max-w-md w-full space-y-5 shadow-2xl"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">Add Study Milestone</h3>
                <button 
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-white text-sm"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleAddItem} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-hexagon-text-secondary uppercase mb-1">
                    Learning Goal / Topic
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Transformer Self-Attention Derivation"
                    value={newGoal}
                    onChange={e => setNewGoal(e.target.value)}
                    className="w-full bg-background border border-hexagon-border rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-hexagon-accent"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-hexagon-text-secondary uppercase mb-1">
                      Target Day
                    </label>
                    <select
                      value={newDay}
                      onChange={e => setNewDay(e.target.value)}
                      className="w-full bg-background border border-hexagon-border rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-hexagon-accent"
                    >
                      {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-hexagon-text-secondary uppercase mb-1">
                      Duration
                    </label>
                    <select
                      value={newMinutes}
                      onChange={e => setNewMinutes(Number(e.target.value))}
                      className="w-full bg-background border border-hexagon-border rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-hexagon-accent"
                    >
                      <option value={15}>15 mins</option>
                      <option value={30}>30 mins</option>
                      <option value={45}>45 mins</option>
                      <option value={60}>60 mins</option>
                    </select>
                  </div>
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 py-2.5 rounded-xl border border-hexagon-border text-gray-300 hover:bg-white/5 text-xs font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-hexagon-accent text-black hover:bg-hexagon-accent/90 text-xs font-bold transition-colors shadow-lg shadow-hexagon-accent/10"
                  >
                    Add to Schedule
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

