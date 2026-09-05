'use client';
import { RepresentationProps } from '../../types/orchestration';
import { motion } from 'framer-motion';

export default function TimelineRepresentation({ context: _context }: RepresentationProps) {
  const events = [
    { year: 1752, title: "Franklin's Kite", desc: "Benjamin Franklin shows lightning is electricity." },
    { year: 1800, title: "The First Battery", desc: "Alessandro Volta builds the Voltaic pile — the first battery." },
    { year: 1820, title: "Magnetism Meets Electricity", desc: "Oersted discovers electric current can move a compass needle." },
    { year: 1831, title: "Generators & Motors", desc: "Michael Faraday demonstrates electromagnetic induction." },
    { year: 1879, title: "The Light Bulb", desc: "Edison's lamp brings electric light into everyday homes." },
  ];

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-12 bg-background relative overflow-hidden">
      <div className="absolute top-1/2 left-0 right-0 h-1 bg-white/10 -translate-y-1/2" />
      
      <div className="flex items-center gap-16 relative z-10 w-full max-w-5xl overflow-x-auto hide-scrollbar pb-12">
        {events.map((ev, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="flex flex-col items-center flex-shrink-0 w-64"
          >
            <div className="text-primary font-mono text-xl mb-4 font-bold">{ev.year}</div>
            <div className="w-4 h-4 rounded-full bg-primary mb-6 shadow-[0_0_15px_rgba(0,255,157,0.5)] border-4 border-background" />
            <div className="bg-card border border-white/10 rounded-xl p-4 text-center">
              <h4 className="font-semibold text-white mb-2">{ev.title}</h4>
              <p className="text-xs text-muted-foreground">{ev.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
