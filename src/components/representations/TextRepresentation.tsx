'use client';
import { RepresentationProps } from '../../types/orchestration';
import { motion } from 'framer-motion';

export default function TextRepresentation({ context }: RepresentationProps) {
  const topic = context.topic || 'this topic';
  const title = context.visualTitle || `Understanding ${topic}`;
  const speech = context.teacherMessage;

  const sentences = speech
    ? speech.split(/(?<=[.!?])\s+/).filter(Boolean).slice(0, 6)
    : [];

  return (
    <div className="w-full h-full flex items-center justify-center bg-black p-6 overflow-auto">
      <motion.div
        key={title}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="w-full max-w-2xl rounded-xl border-[3px] border-white bg-white shadow-[7px_7px_0_#fff] p-6"
      >
        <div className="flex items-center gap-2 mb-4">
          <span className="brut-tag uppercase tracking-widest" style={{ background: '#00E9FF' }}>{topic}</span>
          <span className="brut-tag uppercase tracking-widest" style={{ background: '#00FF9D' }}>Learning</span>
        </div>

        <h2 className="text-2xl font-black text-black tracking-tight mb-4 leading-tight">{title}</h2>

        {speech ? (
          <div className="space-y-3">
            {sentences.length > 0 ? (
              sentences.map((sentence, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex gap-3 items-start"
                >
                  <span className="w-6 h-6 shrink-0 rounded-md border-2 border-black bg-black text-white text-xs font-black flex items-center justify-center mt-0.5">
                    {i + 1}
                  </span>
                  <p className="text-black font-semibold leading-relaxed text-[15px]">{sentence}</p>
                </motion.div>
              ))
            ) : (
              <p className="text-black font-semibold leading-relaxed text-[15px]">{speech}</p>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-3 rounded-lg border-2 border-black bg-white px-4 py-4">
            <span className="flex gap-1">
              <span className="w-2 h-2 bg-black rounded-full animate-bounce" />
              <span className="w-2 h-2 bg-black rounded-full animate-bounce [animation-delay:100ms]" />
              <span className="w-2 h-2 bg-black rounded-full animate-bounce [animation-delay:200ms]" />
            </span>
            <span className="font-mono text-xs font-black uppercase tracking-widest text-black/60">
              teacher is writing…
            </span>
          </div>
        )}
      </motion.div>
    </div>
  );
}