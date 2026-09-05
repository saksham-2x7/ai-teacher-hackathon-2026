'use client';
import { RepresentationProps } from '../../types/orchestration';
import { motion } from 'framer-motion';
import { Code2, Terminal } from 'lucide-react';
import { useState } from 'react';

const SNIPPET = `def resistance(voltage, current):
    """Ohm's Law: R = V / I"""
    return round(voltage / current, 2)

# A 5 V battery pushes 2 A through the bulb:
print(resistance(5, 2))   # -> 2.5 ohms`;

const OUTPUT_LINES = ['>>> ', '>>> def resistance(voltage, current):', '...     return voltage / current', '>>> ', '>>> print(resistance(5, 2))', '2.5', '>>> '];

export default function CodeRepresentation({ context: _context }: RepresentationProps) {
  const [ran, setRan] = useState(false);
  const [lineIdx, setLineIdx] = useState(0);

  function run() {
    setRan(false);
    setLineIdx(0);
    OUTPUT_LINES.forEach((_, i) => {
      setTimeout(() => {
        setLineIdx(i + 1);
        if (i === OUTPUT_LINES.length - 1) setRan(true);
      }, i * 260);
    });
  }

  return (
    <div className="w-full h-full flex items-center justify-center bg-hexagon-dark p-8">
      <div className="w-full max-w-3xl flex flex-col gap-4">
        <div className="rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
          <div className="h-11 bg-white/5 border-b border-white/10 flex items-center px-4 gap-2">
            <Code2 size={15} className="text-white/40" />
            <span className="text-sm font-mono text-white/50">ohms_law.py</span>
          </div>
          <pre className="p-5 font-mono text-sm leading-relaxed overflow-x-auto">
            <code className="text-gray-300">
              {SNIPPET.split('\n').map((line, i) => (
                <div key={i} className="flex gap-4">
                  <span className="text-gray-600 select-none">{(i + 1).toString().padStart(2, ' ')}</span>
                  <span
                    dangerouslySetInnerHTML={{
                      __html: line
                        .replace(/^(def|return|print)/g, '<span class="text-purple-300">$&</span>')
                        .replace(/"\"|'/g, '<span class="text-amber-300">$&</span>')
                        .replace(/#.*$/g, '<span class="text-gray-500">$&</span>')
                        .replace(/\b(voltage|current)\b/g, '<span class="text-sky-300">$&</span>'),
                    }}
                  />
                </div>
              ))}
            </code>
          </pre>
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/60 overflow-hidden">
          <div className="h-9 bg-white/5 border-b border-white/10 flex items-center px-4 gap-2">
            <Terminal size={13} className="text-white/40" />
            <span className="text-xs font-mono text-white/40">python ohms_law.py</span>
          </div>
          <div className="p-4 font-mono text-sm text-emerald-300/90 min-h-[140px]">
            {OUTPUT_LINES.slice(0, lineIdx).map((line, i) => (
              <div key={i} className="whitespace-pre-wrap">{line || '\u00A0'}</div>
            ))}
            {ran && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="inline-block w-2.5 h-4 bg-emerald-300/80 animate-pulse" />
            )}
          </div>
          <div className="px-4 pb-4 flex justify-end">
            {!ran ? (
              <button
                onClick={run}
                className="bg-hexagon-accent text-black px-5 py-2 rounded-xl text-sm font-semibold hover:bg-hexagon-accent/90 transition-colors"
              >
                Run the script
              </button>
            ) : (
              <span className="text-xs text-white/40 px-2 py-2">resistance = 5 ÷ 2 = 2.5 ohms</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}