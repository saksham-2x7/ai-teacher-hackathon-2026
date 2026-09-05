'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function CustomCursor() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const updateMousePosition = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', updateMousePosition);

    return () => {
      window.removeEventListener('mousemove', updateMousePosition);
    };
  }, []);

  return (
    <motion.div
      className="fixed top-0 left-0 w-6 h-6 border border-hexagon-accent rounded-full pointer-events-none z-[9999] mix-blend-difference flex items-center justify-center"
      animate={{ x: mousePosition.x - 12, y: mousePosition.y - 12 }}
      transition={{ type: 'spring', stiffness: 500, damping: 28 }}
    >
      <div className="w-[2px] h-[2px] bg-hexagon-accent rounded-full" />
    </motion.div>
  );
}

