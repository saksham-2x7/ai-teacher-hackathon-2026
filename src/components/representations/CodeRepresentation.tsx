"use client";
import { RepresentationProps } from '../../types/orchestration';
import { motion } from 'framer-motion';
import { Play, Code2, Terminal } from 'lucide-react';
import { useState } from 'react';

export default function CodeRepresentation({ context: _context }: RepresentationProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  
  const snippet = `function optimizeWeights(inputs, targets, weights, learningRate) {
  // 1. Forward Pass
  const predictions = predict(inputs, weights);
  
  // 2. Calculate Error
  const errors = calculateError(predictions, targets);
  
  // 3. Backward Pass (Weight Update)
  for (let i = 0; i < weights.length; i++) {
    const gradient = inputs[i] * errors;
    weights[i] += learningRate * gradient;
  }
  
  return weights;
}`;

  return (
    <div className="w-full h-full flex items-center justify-center bg-background p-12">
      <div className="w-full max-w-4xl grid grid-cols-2 gap-6">
        
        {/* Editor */}
        <div className="bg-[#0d0d0d] border border-white/10 rounded-2xl overflow-hidden flex flex-col shadow-2xl relative">
          <div className="h-12 bg-white/5 border-b border-white/10 flex items-center px-4 gap-2">
            <Code2 size={16} className="text-hexagon-text-secondary" />
            <span className="text-sm font-mono text-hexagon-text-secondary">train.js</span>
          </div>
          <div className="p-4 flex-1 overflow-auto">
            <pre className="font-mono text-sm leading-relaxed">
              <code className="text-gray-300">
                {snippet.split('\n').map((line, i) => (
                  <div key={i} className="flex gap-4">
                    <span className="text-gray-600 select-none">{(i + 1).toString().padStart(2, ' ')}</span>
                    <span dangerouslySetInnerHTML={{
                      __html: line
                        .replace(/function|const|let|for|return/g, '<span class="text-purple-400">$&</span>')
                        .replace(/\/\/.*$/g, '<span class="text-gray-500">$&</span>')
                        .replace(/predict|calculateError/g, '<span class="text-blue-400">$&</span>')
                    }} />
                  </div>
                ))}
              </code>
            </pre>
          </div>
        </div>

        {/* Execution Flow & Output */}
        <div className="space-y-6 flex flex-col">
          <div className="bg-hexagon-surface border border-hexagon-border rounded-2xl p-6 flex-1 relative overflow-hidden">
             <h3 className="text-hexagon-text-primary text-sm font-medium mb-4 flex items-center gap-2">
               <Terminal size={16} /> Execution Flow
             </h3>
             
             <div className="space-y-4 relative z-10">
               <motion.div className="bg-card border border-white/10 rounded-xl p-3" animate={{ borderColor: isPlaying ? 'rgba(0,255,157,0.5)' : 'rgba(255,255,255,0.1)' }}>
                 <p className="text-xs font-mono text-hexagon-text-primary">1. Forward Pass: <span className="text-hexagon-accent">O(n)</span></p>
               </motion.div>
               <motion.div className="bg-card border border-white/10 rounded-xl p-3" animate={{ borderColor: isPlaying ? 'rgba(0,255,157,0.5)' : 'rgba(255,255,255,0.1)' }} transition={{ delay: 0.2 }}>
                 <p className="text-xs font-mono text-hexagon-text-primary">2. Error Calculation</p>
               </motion.div>
               <motion.div className="bg-card border border-white/10 rounded-xl p-3" animate={{ borderColor: isPlaying ? 'rgba(0,255,157,0.5)' : 'rgba(255,255,255,0.1)' }} transition={{ delay: 0.4 }}>
                 <p className="text-xs font-mono text-hexagon-text-primary">3. Gradient Descent Update</p>
               </motion.div>
             </div>

             <div className="absolute bottom-0 left-0 right-0 p-6 pt-12 bg-gradient-to-t from-hexagon-surface to-transparent flex justify-end">
               <button 
                 onClick={() => setIsPlaying(!isPlaying)}
                 className="bg-hexagon-accent text-black px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 hover:bg-hexagon-accent/90 transition-colors"
               >
                 <Play size={14} className="fill-black" /> {isPlaying ? 'Stop' : 'Run Visualization'}
               </button>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
}
