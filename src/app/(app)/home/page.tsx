"use client";
import { motion } from "framer-motion";
import { Play, Sparkles, Clock, Flame, Target, TrendingUp, BookOpen, ArrowRight, Mic } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import DocumentUploader from "../../../components/home/DocumentUploader";
import { useAuthStore } from "@/store/useAuthStore";

const EXAMPLE_PROMPTS = [
  "Teach me how neural networks learn",
  "Explain quantum entanglement simply",
  "Help me prepare for a React interview",
  "Teach me photosynthesis step by step",
  "Explain the Fourier transform intuitively",
];

const RECENT_COURSES = [
  { title: "Neural Networks - Complete Course", subject: "Computer Science", progress: 34, time: "~1h 20m left", href: "/lesson/neural-networks-1", color: "bg-blue-500/20 text-blue-400", border: "border-blue-500/20" },
  { title: "Quantum Mechanics Fundamentals", subject: "Physics", progress: 72, time: "~30m left", href: "/lesson/quantum-1", color: "bg-purple-500/20 text-purple-400", border: "border-purple-500/20" },
];

const RECOMMENDATIONS = [
  { title: "Backpropagation in depth", reason: "Based on your recent struggle" },
  { title: "Newton's First Law", reason: "Because you started physics" }
];

export default function HomePage() {
  const router = useRouter();
  const { profile } = useAuthStore();
  const [query, setQuery] = useState("");
  const [promptIdx, setPromptIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const h = new Date().getHours();
    let g = 'Good evening';
    if (h < 12) g = 'Good morning';
    else if (h < 17) g = 'Good afternoon';
    setTimeout(() => setGreeting(g), 0);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setPromptIdx(i => (i + 1) % EXAMPLE_PROMPTS.length), 3000);
    return () => clearInterval(timer);
  }, []);

  const handleStart = () => {
    if (query.trim()) {
      router.push(`/lesson/neural-networks-1?topic=${encodeURIComponent(query)}`);
    } else {
      router.push("/lesson/neural-networks-1");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleStart();
  };

  return (
    <div className="max-w-6xl mx-auto p-8 pt-12 space-y-12">
      <header className="space-y-1">
        <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-4xl font-semibold tracking-tight text-hexagon-text-primary">
          {greeting || 'Hello'}, {profile?.name || "there"}.
        </motion.h1>
        <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-hexagon-text-secondary text-lg">
          {profile?.streakDays ? `${profile.streakDays} day streak — keep it going.` : "What would you like to learn today?"}
        </motion.p>
      </header>

      {profile && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="grid grid-cols-4 gap-4">
          {[
            { label: "Study Streak", value: `${profile.streakDays} days`, icon: Flame, color: "text-orange-400" },
            { label: "Total Time", value: `${Math.round(profile.totalStudyMinutes / 60)}h ${profile.totalStudyMinutes % 60}m`, icon: Clock, color: "text-blue-400" },
            { label: "Lessons Done", value: "23", icon: BookOpen, color: "text-hexagon-accent" },
            { label: "Daily Goal", value: `${profile.dailyGoalMinutes} min`, icon: Target, color: "text-purple-400" },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-hexagon-surface border border-hexagon-border rounded-xl p-4">
              <div className={`${color} mb-2`}><Icon className="w-4 h-4" /></div>
              <p className="text-hexagon-text-primary text-lg font-semibold">{value}</p>
              <p className="text-hexagon-text-secondary text-xs">{label}</p>
            </div>
          ))}
        </motion.div>
      )}

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-hexagon-accent/10 to-transparent rounded-2xl blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
        <div className="relative bg-hexagon-surface border border-hexagon-border group-focus-within:border-hexagon-accent/40 rounded-2xl p-2 flex items-center backdrop-blur-xl shadow-lg transition-colors">
          <div className="pl-4 pr-3 text-hexagon-accent"><Sparkles className="w-5 h-5" /></div>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={EXAMPLE_PROMPTS[promptIdx]}
            className="flex-1 bg-transparent border-none outline-none py-4 text-base text-hexagon-text-primary placeholder:text-hexagon-text-secondary/40"
          />
          <div className="flex items-center gap-2 pr-2">
            <button className="p-3 rounded-xl text-hexagon-text-secondary hover:text-hexagon-text-primary hover:bg-hexagon-surface-hover transition-colors" title="Voice input">
              <Mic className="w-5 h-5" />
            </button>
            <button onClick={handleStart} className="px-5 py-3 bg-hexagon-accent text-black font-semibold rounded-xl hover:bg-hexagon-accent/90 transition-colors flex items-center gap-2 text-sm">
              Start <Play className="w-4 h-4 fill-black" />
            </button>
          </div>
        </div>
      </motion.div>
      
      <DocumentUploader />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-hexagon-text-primary">Continue Learning</h2>
          <Link href="/learning" className="text-sm text-hexagon-accent hover:underline flex items-center gap-1">View all <ArrowRight className="w-3.5 h-3.5" /></Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {RECENT_COURSES.map(course => (
            <Link key={course.title} href={course.href} className="block group">
              <div className={`bg-hexagon-surface border ${course.border} rounded-2xl p-6 transition-all duration-200 hover:border-hexagon-accent/40 hover:-translate-y-1 shadow-sm`}>
                <span className={`px-2.5 py-1 ${course.color} text-xs font-medium rounded-full`}>{course.subject}</span>
                <h3 className="text-sm font-semibold text-hexagon-text-primary mt-4 mb-5 leading-snug line-clamp-2">{course.title}</h3>
                <div className="space-y-3">
                  <div className="w-full bg-hexagon-border rounded-full h-1.5 overflow-hidden">
                    <div className="bg-hexagon-accent h-full rounded-full" style={{ width: `${course.progress}%` }} />
                  </div>
                  <div className="flex items-center justify-between text-xs text-hexagon-text-secondary">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {course.time}</span>
                    <span>{course.progress}%</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="space-y-5">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-hexagon-accent" />
          <h2 className="text-xl font-semibold text-hexagon-text-primary">Recommended for You</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {RECOMMENDATIONS.map(rec => (
            <Link key={rec.title} href={`/lesson/neural-networks-1?topic=${encodeURIComponent(rec.title)}`} className="flex items-center justify-between bg-hexagon-surface border border-hexagon-border rounded-xl p-5 hover:border-hexagon-accent/30 hover:bg-hexagon-surface-hover transition-all group">
              <div>
                <p className="font-medium text-hexagon-text-primary text-sm">{rec.title}</p>
                <p className="text-xs text-hexagon-text-secondary mt-1">{rec.reason}</p>
              </div>
              <ArrowRight className="w-4 h-4 text-hexagon-text-secondary group-hover:text-hexagon-accent group-hover:translate-x-1 transition-all flex-shrink-0" />
            </Link>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
