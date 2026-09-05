'use client';
import { RepresentationProps } from '../../types/orchestration';
import { motion } from 'framer-motion';
import { BookOpen, Lightbulb, Sparkles } from 'lucide-react';

export default function TextRepresentation({ context }: RepresentationProps) {
  const scaffold = context.scaffoldLevel ?? 3;
  const topic = context.topic || 'this topic';
  const title = context.visualTitle || `Understanding ${topic}`;
  const speech = context.teacherMessage;

  const sentences = speech
    ? speech.split(/(?<=[.!?])\s+/).filter(Boolean).slice(0, 5)
    : [];

  const points = sentences.length >= 2 ? sentences : [
    `We start by unpacking what ${topic} is really about.`,
    `Step by step, we connect the core ideas together.`,
    `Then we see ${topic} in action with a concrete example.`,
    `Finally, you check what you have learned with a quick question.`,
  ];

  return (
    <div className="w-full h-full flex items-center justify-center bg-hexagon-dark text-foreground p-8 overflow-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl w-full">
        <div className="flex items-center gap-3 text-hexagon-accent mb-6">
          <BookOpen size={22} />
          <span className="font-mono text-sm tracking-widest uppercase">Learning Together</span>
        </div>

        <h2 className="text-3xl font-bold mb-5 tracking-tight text-white">{title}</h2>

        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 space-y-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-hexagon-accent" /> Step by step
          </h3>
          {points.map((point, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.12 }}
              className="flex gap-3 items-start"
            >
              <span className="w-6 h-6 shrink-0 rounded-full bg-hexagon-accent/15 text-hexagon-accent text-xs font-bold flex items-center justify-center mt-0.5">
                {i + 1}
              </span>
              <p className="text-white/75 leading-relaxed">{point}</p>
            </motion.div>
          ))}
        </div>

        {scaffold >= 4 && (
          <div className="mt-6 flex gap-2 items-start rounded-2xl border border-amber-400/30 bg-amber-400/5 p-4 text-sm text-amber-200/90">
            <Lightbulb className="w-4 h-4 shrink-0 mt-0.5 text-amber-300" />
            <span>
              Tip: repeat each idea in your own words before moving on. If a step feels unclear, ask me and we go again.
            </span>
          </div>
        )}
      </motion.div>
    </div>
  );
}