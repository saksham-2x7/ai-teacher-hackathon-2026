'use client';
import { RepresentationProps } from '../../types/orchestration';
import { motion } from 'framer-motion';

export default function GraphRepresentation({ context: _context }: RepresentationProps) {
  // Your practice progress over the last 10 days (100 = mastery target)
  const points = [
    { day: 1, pct: 12 },
    { day: 2, pct: 24 },
    { day: 3, pct: 31 },
    { day: 4, pct: 48 },
    { day: 5, pct: 52 },
    { day: 6, pct: 61 },
    { day: 7, pct: 74 },
    { day: 8, pct: 70 },
    { day: 9, pct: 85 },
    { day: 10, pct: 90 },
  ];

  const maxPct = 100;
  const toCoord = (pct: number, idx: number) => ({
    x: idx * (100 / (points.length - 1)),
    y: maxPct - pct,
  });

  const pathData = `M ${points.map((p, i) => `${toCoord(p.pct, i).x},${toCoord(p.pct, i).y}`).join(' L ')}`;
  const goalY = maxPct - 90;

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-hexagon-dark p-8">
      <div className="max-w-3xl w-full">
        <h3 className="text-2xl font-bold mb-1 text-center text-white">Your Practice Progress</h3>
        <p className="text-center text-white/50 text-sm mb-6">How well you know the topic, day by day</p>

        <div className="relative w-full aspect-[2/1] border-l-2 border-b-2 border-white/20 pl-2">
          <svg className="w-full h-full overflow-visible" viewBox="-5 -8 110 110" preserveAspectRatio="none">
            {/* Goal line */}
            <line x1="0" y1={goalY} x2="100" y2={goalY} stroke="rgba(0,255,157,0.35)" strokeWidth="0.5" strokeDasharray="3 3" />
            <text x="88" y={goalY - 2} fill="rgba(0,255,157,0.6)" fontSize="4">mastery</text>

            <motion.path
              d={pathData}
              fill="none"
              stroke="var(--color-primary)"
              strokeWidth="1.5"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 2, ease: 'easeInOut' }}
              style={{ filter: 'drop-shadow(0px 0px 8px rgba(0,255,157,0.5))' }}
            />

            {points.map((p, i) => {
              const c = toCoord(p.pct, i);
              return (
                <motion.circle
                  key={p.day}
                  cx={c.x}
                  cy={c.y}
                  r="1.5"
                  fill="#00FF9D"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.05 * i }}
                >
                  <title>{`Day ${p.day}: ${p.pct}%`}</title>
                </motion.circle>
              );
            })}
          </svg>

          <div className="absolute -left-14 top-1/2 -translate-y-1/2 -rotate-90 text-sm font-mono text-white/40">Knowledge %</div>
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-sm font-mono text-white/40">Day</div>
        </div>
      </div>
    </div>
  );
}