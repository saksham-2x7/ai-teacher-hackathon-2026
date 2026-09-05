'use client';
import { RepresentationProps } from '../../types/orchestration';
import { motion } from 'framer-motion';

export default function GraphRepresentation({ context: _context }: RepresentationProps) {
  // Mock Data for Loss Curve
  const points = Array.from({ length: 50 }, (_, i) => ({
    x: i * (100 / 50),
    y: Math.max(10, 90 * Math.exp(-0.1 * i) + Math.sin(i) * 5)
  }));

  const pathData = `M ${points.map(p => `${p.x},${p.y}`).join(' L ')}`;

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-background p-12">
      <div className="max-w-3xl w-full">
        <h3 className="text-2xl font-bold mb-8 text-center">Training Loss Over Time</h3>
        <div className="relative w-full aspect-[2/1] border-l-2 border-b-2 border-white/20 p-4">
          <svg className="w-full h-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
            <motion.path
              d={pathData}
              fill="none"
              stroke="var(--color-primary)"
              strokeWidth="1.5"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 2, ease: "easeInOut" }}
              style={{ filter: 'drop-shadow(0px 0px 8px rgba(0,255,157,0.5))' }}
            />
          </svg>
          {/* Axis Labels */}
          <div className="absolute -left-12 top-1/2 -translate-y-1/2 -rotate-90 text-sm font-mono text-muted-foreground">Loss</div>
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-sm font-mono text-muted-foreground">Epochs</div>
        </div>
      </div>
    </div>
  );
}
