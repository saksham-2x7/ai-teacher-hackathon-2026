'use client';
import { RepresentationProps } from '../../types/orchestration';
import { useMemo, useState } from 'react';
import { CheckCircle2, RotateCcw, Sparkles } from 'lucide-react';

const STEPS = [
  { id: 'a', label: 'The plant takes in water and carbon dioxide' },
  { id: 'b', label: 'Chlorophyll catches sunlight energy' },
  { id: 'c', label: 'Light energy splits water into hydrogen and oxygen' },
  { id: 'd', label: 'Hydrogen joins carbon dioxide to make glucose' },
  { id: 'e', label: 'Oxygen is released through the leaves' },
];

const ORDER = ['a', 'b', 'c', 'd', 'e'];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function ManipulationRepresentation({ context: _context }: RepresentationProps) {
  const [shuffled] = useState(() => shuffle(STEPS));
  const [selected, setSelected] = useState<string[]>([]);
  const [checked, setChecked] = useState(false);

  const answers = useMemo<Record<string, number>>(() => ({ a: 0, b: 1, c: 2, d: 3, e: 4 }), []);

  const isCorrect = checked && selected.every((id, i) => answers[id as keyof typeof answers] === i) && selected.length === ORDER.length;

  function choose(stepId: string) {
    if (checked) return;
    setSelected((prev) => {
      if (prev.includes(stepId)) return prev.filter((id) => id !== stepId);
      if (prev.length >= ORDER.length) return prev;
      return [...prev, stepId];
    });
  }

  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-6 p-8 overflow-auto bg-hexagon-dark">
      <div className="text-center">
        <h3 className="text-white text-lg font-semibold flex items-center justify-center gap-2">
          <Sparkles className="w-5 h-5 text-emerald-400" />
          Photosynthesis — put the steps in order
        </h3>
        <p className="text-white/50 text-sm mt-1">Tap each step in the order they happen. Tap again to take it back.</p>
      </div>

      <div className="flex flex-wrap justify-center gap-2 max-w-3xl">
        {selected.map((id, idx) => {
          const step = STEPS.find((s) => s.id === id)!;
          return (
            <button
              key={id}
              onClick={() => choose(id)}
              className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition-all ${
                checked && idx === answers[step.id]
                  ? 'border-emerald-400/60 bg-emerald-400/10 text-emerald-300'
                  : checked
                    ? 'border-rose-400/50 bg-rose-400/10 text-rose-300'
                    : 'border-emerald-400/40 bg-emerald-400/10 text-white hover:bg-emerald-400/20'
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-emerald-400/20 text-emerald-300 flex items-center justify-center text-xs font-bold">
                {idx + 1}
              </span>
              {step.label}
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap justify-center gap-2 max-w-3xl">
        {shuffled.map((step) => {
          const used = selected.includes(step.id);
          return (
            <button
              key={step.id}
              onClick={() => choose(step.id)}
              disabled={used}
              className={`rounded-xl border px-4 py-2 text-sm font-medium transition-all ${
                used
                  ? 'border-white/5 bg-white/[0.03] text-white/25 cursor-not-allowed'
                  : 'border-white/15 bg-white/[0.05] text-white/80 hover:bg-white/10 hover:border-white/30'
              }`}
            >
              {step.label}
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-3">
        {checked && (
          <span className={`flex items-center gap-2 text-sm font-semibold ${isCorrect ? 'text-emerald-300' : 'text-amber-300'}`}>
            <CheckCircle2 className="w-4 h-4" />
            {isCorrect ? 'Nice work — that is exactly right!' : 'Almost — check steps 1 to 3 again.'}
          </span>
        )}
        <button
          onClick={() => setChecked(true)}
          disabled={selected.length !== ORDER.length || checked}
          className="bg-emerald-400 text-black px-5 py-2 rounded-xl text-sm font-semibold hover:bg-emerald-300 transition-colors disabled:opacity-40"
        >
          Check my answer
        </button>
        <button
          onClick={() => {
            setSelected([]);
            setChecked(false);
          }}
          className="flex items-center gap-2 text-white/60 hover:text-white px-3 py-2 text-sm transition-colors"
        >
          <RotateCcw className="w-4 h-4" /> Start over
        </button>
      </div>
    </div>
  );
}