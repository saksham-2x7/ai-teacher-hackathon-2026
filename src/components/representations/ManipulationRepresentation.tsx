'use client';
import { RepresentationProps } from '../../types/orchestration';
import { motion } from 'framer-motion';
import { useState } from 'react';

export default function ManipulationRepresentation({ context: _context }: RepresentationProps) {
  const [pieces] = useState([
    { id: '1', label: 'Input Layer', x: -200, y: -100 },
    { id: '2', label: 'Hidden Layer', x: -200, y: 0 },
    { id: '3', label: 'Output Layer', x: -200, y: 100 },
  ]);

  return (
    <div className="w-full h-full bg-background relative overflow-hidden flex items-center justify-center">
      
      {/* Target Zone */}
      <div className="absolute right-32 top-1/2 -translate-y-1/2 w-64 h-96 border-2 border-dashed border-white/20 rounded-2xl flex flex-col items-center justify-center bg-white/5">
        <span className="text-muted-foreground font-mono uppercase tracking-widest text-sm">Assembly Zone</span>
      </div>

      {/* Draggable Pieces */}
      {pieces.map((piece) => (
        <motion.div
          key={piece.id}
          drag
          dragMomentum={false}
          initial={{ x: piece.x, y: piece.y }}
          className="absolute left-1/2 top-1/2 w-40 p-4 bg-card border border-primary/50 rounded-xl cursor-grab active:cursor-grabbing shadow-lg z-20 flex items-center justify-center text-primary font-medium"
        >
          {piece.label}
        </motion.div>
      ))}

      {/* Instructions */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 text-center">
        <p className="text-white/70 font-mono text-sm tracking-widest uppercase">Drag layers to the assembly zone to form a network</p>
      </div>
    </div>
  );
}
