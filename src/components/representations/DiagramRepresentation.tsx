'use client';
import { RepresentationProps } from '../../types/orchestration';
import { motion } from 'framer-motion';

export default function DiagramRepresentation({ context: _context }: RepresentationProps) {
  return (
    <div className="w-full h-full flex items-center justify-center bg-background p-12">
      <div className="relative w-full max-w-4xl h-96 border border-white/10 rounded-2xl bg-card overflow-hidden p-8 flex items-center justify-between">
        
        {/* Input */}
        <motion.div initial={{ x: -50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="flex flex-col items-center gap-2">
          <div className="w-24 h-24 rounded-xl bg-blue-500/20 border border-blue-500/50 flex items-center justify-center text-blue-400 font-mono">
            Input [X]
          </div>
        </motion.div>
        
        {/* Arrow */}
        <div className="h-0.5 flex-1 bg-gradient-to-r from-blue-500/50 via-primary/50 to-primary/50 mx-4 relative">
          <motion.div 
            className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-[0_0_10px_white]"
            animate={{ left: ['0%', '100%'] }}
            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
          />
        </div>

        {/* Core Logic */}
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center gap-2 z-10">
          <div className="w-48 h-48 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center text-primary font-bold shadow-[0_0_30px_rgba(0,255,157,0.2)]">
            f(X) = WX + b
          </div>
        </motion.div>

        {/* Arrow */}
        <div className="h-0.5 flex-1 bg-gradient-to-r from-primary/50 via-purple-500/50 to-purple-500/50 mx-4 relative">
          <motion.div 
            className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-[0_0_10px_white]"
            animate={{ left: ['0%', '100%'] }}
            transition={{ repeat: Infinity, duration: 2, delay: 1, ease: "linear" }}
          />
        </div>

        {/* Output */}
        <motion.div initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="flex flex-col items-center gap-2">
          <div className="w-24 h-24 rounded-xl bg-purple-500/20 border border-purple-500/50 flex items-center justify-center text-purple-400 font-mono">
            Output [Y]
          </div>
        </motion.div>

      </div>
    </div>
  );
}
