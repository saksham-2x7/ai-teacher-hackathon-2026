"use client";
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Brain, Star, Flame, Clock, Award, ArrowUpRight, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from '@/store/useAuthStore';

interface Concept {
  name: string;
  category: string;
  score: number;
  status: 'mastered' | 'strong' | 'review';
  lastStudied: string;
}

const ALL_CONCEPTS: Concept[] = [
  { name: "Activation Functions (ReLU, Sigmoid)", category: "Neural Networks", score: 95, status: 'mastered', lastStudied: "2 hours ago" },
  { name: "Newton's First Law of Motion", category: "Physics", score: 92, status: 'mastered', lastStudied: "Yesterday" },
  { name: "Backpropagation & Chain Rule", category: "Neural Networks", score: 88, status: 'strong', lastStudied: "Today" },
  { name: "Quantum Superposition & Qubits", category: "Quantum Physics", score: 84, status: 'strong', lastStudied: "3 days ago" },
  { name: "Loss Functions & Cross-Entropy", category: "Neural Networks", score: 76, status: 'strong', lastStudied: "2 days ago" },
  { name: "Gradient Descent & Learning Rate", category: "Optimization", score: 45, status: 'review', lastStudied: "Today" },
  { name: "Convolutional Filters & Strides", category: "Computer Vision", score: 52, status: 'review', lastStudied: "Yesterday" },
  { name: "Eigenvalues & Eigenvectors", category: "Mathematics", score: 58, status: 'review', lastStudied: "4 days ago" },
];

const WEEKLY_ACTIVITY = [
  { day: "Mon", minutes: 45, goalMet: true },
  { day: "Tue", minutes: 30, goalMet: true },
  { day: "Wed", minutes: 60, goalMet: true },
  { day: "Thu", minutes: 20, goalMet: false },
  { day: "Fri", minutes: 50, goalMet: true },
  { day: "Sat", minutes: 75, goalMet: true },
  { day: "Sun", minutes: 40, goalMet: true },
];

export default function ProgressPage() {
  const { profile } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'all' | 'mastered' | 'review'>('all');
  const [selectedDay, setSelectedDay] = useState<number>(6); // Sunday

  const filteredConcepts = ALL_CONCEPTS.filter(c => {
    if (activeTab === 'all') return true;
    if (activeTab === 'mastered') return c.status === 'mastered' || c.status === 'strong';
    return c.status === 'review';
  });

  const totalStudyHours = Math.round((profile?.totalStudyMinutes || 320) / 60);
  const totalStudyMinutesRem = (profile?.totalStudyMinutes || 320) % 60;
  const masteryPercentage = 78;
  const circumference = 2 * Math.PI * 54;
  const strokeDashoffset = circumference - (masteryPercentage / 100) * circumference;

  return (
    <div className="max-w-6xl mx-auto p-8 pt-12 space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-hexagon-text-primary">Cognitive Progress</h1>
          <p className="text-hexagon-text-secondary text-sm mt-1">Real-time mastery tracking and adaptive learning analytics.</p>
        </div>

        <div className="flex items-center gap-3">
          <Link 
            href="/revision"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 hover:bg-orange-500/20 text-xs font-semibold transition-colors"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            Review Weak Concepts (3)
          </Link>
          <Link 
            href="/exam"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-hexagon-accent text-black font-semibold text-xs hover:bg-hexagon-accent/90 transition-colors shadow-lg shadow-hexagon-accent/10"
          >
            <Target className="w-3.5 h-3.5" />
            Take Practice Exam
          </Link>
        </div>
      </div>

      {/* Top Telemetry Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Overall Mastery", value: `${masteryPercentage}%`, sub: "+4% this week", icon: Brain, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
          { label: "Current Streak", value: `${profile?.streakDays || 7} Days`, sub: "Personal best: 14", icon: Flame, color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" },
          { label: "Total Study Time", value: `${totalStudyHours}h ${totalStudyMinutesRem}m`, sub: "Daily target: 30m", icon: Clock, color: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/20" },
          { label: "Mastered Concepts", value: "42", sub: "Out of 54 total", icon: Award, color: "text-indigo-400", bg: "bg-indigo-500/10", border: "border-indigo-500/20" },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div 
              initial={{ opacity: 0, y: 15 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: i * 0.08 }}
              key={stat.label} 
              className={`bg-hexagon-surface border ${stat.border} p-5 rounded-2xl flex flex-col justify-between backdrop-blur-md relative overflow-hidden group hover:border-hexagon-accent/40 transition-all`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-hexagon-text-secondary">{stat.label}</span>
                <div className={`w-8 h-8 ${stat.bg} ${stat.color} rounded-lg flex items-center justify-center`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div>
                <p className="text-2xl font-bold tracking-tight text-hexagon-text-primary">{stat.value}</p>
                <p className="text-[11px] text-hexagon-text-secondary mt-1">{stat.sub}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Mastery Dial + Weekly Activity Graph */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Radial Mastery Gauge */}
        <div className="bg-hexagon-surface border border-hexagon-border rounded-2xl p-6 flex flex-col items-center justify-center text-center relative overflow-hidden backdrop-blur-md">
          <div className="w-full flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-hexagon-text-primary">Cognitive Readiness</h2>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 font-mono">ADAPTIVE</span>
          </div>

          <div className="relative w-44 h-44 my-2 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 128 128">
              <circle
                cx="64"
                cy="64"
                r="54"
                stroke="currentColor"
                strokeWidth="10"
                className="text-white/5"
                fill="none"
              />
              <circle
                cx="64"
                cy="64"
                r="54"
                stroke="url(#masteryGrad)"
                strokeWidth="10"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="none"
                className="transition-all duration-1000 ease-out"
              />
              <defs>
                <linearGradient id="masteryGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#05f292" />
                  <stop offset="100%" stopColor="#6366f1" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-4xl font-black tracking-tight text-hexagon-text-primary">{masteryPercentage}%</span>
              <span className="text-[10px] uppercase font-semibold text-hexagon-text-secondary tracking-wider">Proficient</span>
            </div>
          </div>

          <p className="text-xs text-hexagon-text-secondary mt-2 max-w-xs leading-relaxed">
            High retention in <strong className="text-hexagon-text-primary">Neural Networks</strong>. Revisit <strong className="text-orange-400">Gradient Descent</strong> to elevate to 85%+.
          </p>
        </div>

        {/* Weekly Activity Bar Chart */}
        <div className="lg:col-span-2 bg-hexagon-surface border border-hexagon-border rounded-2xl p-6 backdrop-blur-md flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-hexagon-text-primary">Study Consistency (Last 7 Days)</h2>
              <p className="text-xs text-hexagon-text-secondary mt-0.5">Click any day bar to inspect study duration</p>
            </div>
            <div className="text-right">
              <span className="text-xs font-mono font-bold text-hexagon-accent">
                {WEEKLY_ACTIVITY[selectedDay].minutes} mins
              </span>
              <span className="text-[10px] text-gray-400 block">{WEEKLY_ACTIVITY[selectedDay].day} Session</span>
            </div>
          </div>

          {/* Bar Visualization */}
          <div className="flex items-end justify-between gap-3 h-40 pt-4 px-2">
            {WEEKLY_ACTIVITY.map((item, idx) => {
              const isSelected = selectedDay === idx;
              const heightPct = Math.min(100, Math.round((item.minutes / 80) * 100));
              return (
                <div 
                  key={item.day}
                  onClick={() => setSelectedDay(idx)}
                  className="flex-1 flex flex-col items-center gap-2 group cursor-pointer"
                >
                  <div className="w-full flex-1 flex items-end justify-center">
                    <motion.div 
                      initial={{ height: 0 }}
                      animate={{ height: `${heightPct}%` }}
                      transition={{ duration: 0.6, delay: idx * 0.05 }}
                      className={`w-full max-w-[32px] rounded-t-lg transition-all ${
                        isSelected 
                          ? 'bg-hexagon-accent shadow-[0_0_15px_rgba(5,242,146,0.35)]' 
                          : item.goalMet 
                            ? 'bg-hexagon-accent/30 group-hover:bg-hexagon-accent/50' 
                            : 'bg-hexagon-border group-hover:bg-hexagon-border/80'
                      }`}
                    />
                  </div>
                  <span className={`text-[11px] font-medium transition-colors ${isSelected ? 'text-hexagon-accent font-bold' : 'text-hexagon-text-secondary'}`}>
                    {item.day}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-hexagon-border text-xs text-hexagon-text-secondary mt-2">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-hexagon-accent" /> Active Goal Met (30m+)
            </span>
            <span className="font-mono">320 / 350 min weekly goal</span>
          </div>
        </div>
      </div>

      {/* Concept Breakdown Table & Filters */}
      <div className="bg-hexagon-surface border border-hexagon-border rounded-2xl p-6 backdrop-blur-md space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-hexagon-text-primary">Subject Mastery Matrix</h2>
            <p className="text-xs text-hexagon-text-secondary">Granular breakdown of cognitive recall across topics.</p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center bg-background/80 border border-hexagon-border p-1 rounded-xl gap-1 self-start">
            {(['all', 'mastered', 'review'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${
                  activeTab === tab 
                    ? 'bg-hexagon-accent text-black shadow-sm' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {tab === 'review' ? 'Needs Work' : tab}
              </button>
            ))}
          </div>
        </div>

        {/* Matrix Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AnimatePresence mode="popLayout">
            {filteredConcepts.map(c => {
              const isReview = c.status === 'review';
              return (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  key={c.name}
                  className="bg-background/60 border border-hexagon-border/70 p-4 rounded-xl flex flex-col justify-between hover:border-hexagon-border transition-all"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <span className="text-[10px] text-hexagon-text-secondary font-mono tracking-wider uppercase block mb-1">
                        {c.category}
                      </span>
                      <h4 className="text-sm font-semibold text-hexagon-text-primary leading-snug">{c.name}</h4>
                    </div>
                    <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full ${
                      isReview ? 'bg-red-500/15 text-red-400 border border-red-500/25' : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25'
                    }`}>
                      {c.score}%
                    </span>
                  </div>

                  <div className="space-y-2 mt-3">
                    <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-700 ${isReview ? 'bg-red-400' : 'bg-hexagon-accent'}`}
                        style={{ width: `${c.score}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-gray-400">
                      <span>Studied {c.lastStudied}</span>
                      <Link 
                        href={`/tutor`}
                        className="text-hexagon-accent hover:underline flex items-center gap-0.5 font-medium"
                      >
                        Ask Tutor <ArrowUpRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
