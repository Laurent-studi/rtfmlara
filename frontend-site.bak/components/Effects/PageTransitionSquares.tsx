"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

interface PageTransitionSquaresProps {
  isVisible: boolean;
  onComplete?: () => void;
}

const NUM_SQUARES = 100;

export default function PageTransitionSquares({ isVisible, onComplete }: PageTransitionSquaresProps) {
  const [squares, setSquares] = useState<number[]>([]);

  useEffect(() => {
    const temp = Array.from({ length: NUM_SQUARES }, (_, i) => i);
    setSquares(temp);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-50 grid grid-cols-10 grid-rows-10"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onAnimationComplete={onComplete}
        >
          {squares.map((i) => (
            <motion.div
              key={i}
              className="w-full h-full bg-primary dark:bg-secondary"
              initial={{ opacity: 1 }}
              animate={{ opacity: 0 }}
              transition={{
                delay: Math.random() * 0.7,
                duration: 0.4,
                ease: 'easeOut',
              }}
            />
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
} 