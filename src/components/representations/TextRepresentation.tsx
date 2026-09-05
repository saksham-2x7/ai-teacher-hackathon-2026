'use client';
import { RepresentationProps } from '../../types/orchestration';
import { motion } from 'framer-motion';
import { BookOpen } from 'lucide-react';

export default function TextRepresentation({ context: _context }: RepresentationProps) {
  return (
    <div className="w-full h-full flex items-center justify-center bg-background text-foreground p-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl w-full"
      >
        <div className="flex items-center gap-3 text-primary mb-6">
          <BookOpen size={24} />
          <span className="font-mono text-sm tracking-widest uppercase">Theory & Concepts</span>
        </div>
        
        <h2 className="text-4xl font-bold mb-6 tracking-tight">Understanding Hexagonal Architecture</h2>
        
        <div className="prose prose-invert prose-lg max-w-none">
          <p className="text-muted-foreground leading-relaxed mb-6">
            Hexagonal architecture, also known as the ports and adapters architecture, is a pattern designed to create loosely coupled application components.
          </p>
          <div className="bg-card border border-white/5 rounded-2xl p-8 shadow-2xl mb-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
            <h3 className="text-xl font-semibold mb-4 text-white relative z-10">The Core Principle</h3>
            <p className="text-white/70 leading-relaxed relative z-10">
              The application core receives inputs and produces outputs exclusively through interfaces (ports). 
              Technology-specific implementations (adapters) translate external interactions into a format the core understands.
            </p>
          </div>
          <p className="text-muted-foreground leading-relaxed">
            By isolating the core logic from external dependencies like databases or web frameworks, 
            the application becomes highly testable, maintainable, and adaptable to new technologies.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
