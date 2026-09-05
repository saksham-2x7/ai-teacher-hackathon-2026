"use client";
import { motion } from 'framer-motion';
import { BookOpen, TrendingUp, PlayCircle } from 'lucide-react';
import Link from 'next/link';

const COURSES = [
  { title: "Neural Networks - Complete Course", subject: "Computer Science", progress: 34, time: "~1h 20m left", color: "bg-blue-500/20 text-blue-400", border: "border-blue-500/20", href: "/lesson/neural-networks-1" },
  { title: "Quantum Mechanics Fundamentals", subject: "Physics", progress: 72, time: "~30m left", color: "bg-purple-500/20 text-purple-400", border: "border-purple-500/20", href: "/lesson/quantum-1" },
  { title: "World War II: Global Conflict", subject: "History", progress: 12, time: "~3h 10m left", color: "bg-amber-500/20 text-amber-400", border: "border-amber-500/20", href: "/lesson/history-1" },
];

export default function LearningPage() {
  return (
    <div className="max-w-6xl mx-auto p-8 pt-12 space-y-12">
      <header className="mb-12">
        <h1 className="text-3xl font-semibold text-hexagon-text-primary mb-2">My Learning</h1>
        <p className="text-hexagon-text-secondary">Pick up where you left off.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {COURSES.map((course, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={course.title}
          >
            <Link href={course.href} className="block group h-full">
              <div className={`bg-hexagon-surface border ${course.border} rounded-2xl p-6 h-full flex flex-col transition-all duration-200 hover:border-hexagon-accent/40 hover:-translate-y-1 shadow-sm`}>
                <span className={`px-2.5 py-1 ${course.color} w-fit text-xs font-medium rounded-full mb-4`}>{course.subject}</span>
                <h3 className="text-lg font-semibold text-hexagon-text-primary mb-4 leading-snug flex-1">{course.title}</h3>
                
                <div className="space-y-3 mt-auto">
                  <div className="w-full bg-hexagon-border rounded-full h-1.5 overflow-hidden">
                    <div className="bg-hexagon-accent h-full rounded-full" style={{ width: `${course.progress}%` }} />
                  </div>
                  <div className="flex items-center justify-between text-xs text-hexagon-text-secondary">
                    <span>{course.progress}% Complete</span>
                    <span className="flex items-center gap-1"><PlayCircle className="w-3 h-3" /> Resume</span>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
