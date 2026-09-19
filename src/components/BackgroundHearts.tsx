import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { ColorPalette } from '../types';
import { PALETTES } from '../data/palettes';

interface Particle {
  id: number;
  x: number;
  size: number;
  duration: number;
  delay: number;
  opacity: number;
}

interface BackgroundHeartsProps {
  palette?: ColorPalette;
}

export const BackgroundHearts: React.FC<BackgroundHeartsProps> = ({ palette = 'rose' }) => {
  const currentPalette = PALETTES.find((p) => p.id === palette) || PALETTES[0];

  const particles = useMemo(() => {
    const list: Particle[] = [];
    for (let i = 0; i < 22; i++) {
      list.push({
        id: i,
        x: Math.random() * 100,
        size: Math.floor(Math.random() * 20) + 14,
        duration: Math.random() * 10 + 12,
        delay: Math.random() * 8,
        opacity: Math.random() * 0.4 + 0.15,
      });
    }
    return list;
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute select-none"
          style={{
            left: `${p.x}%`,
            bottom: '-10%',
            fontSize: `${p.size}px`,
            opacity: p.opacity,
          }}
          animate={{
            y: ['0vh', '-120vh'],
            x: [0, Math.sin(p.id) * 40, 0],
            rotate: [0, 45, -45, 0],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: 'linear',
          }}
        >
          {currentPalette.heartSymbol}
        </motion.div>
      ))}

      {/* Ambient soft glow gradients using CSS variables from active theme */}
      <div
        className="absolute -top-32 -left-32 w-96 h-96 rounded-full blur-3xl transition-colors duration-700"
        style={{ backgroundColor: 'var(--ambient-light-1, rgba(254, 205, 211, 0.45))' }}
      />
      <div
        className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full blur-3xl transition-colors duration-700"
        style={{ backgroundColor: 'var(--ambient-light-2, rgba(251, 113, 133, 0.35))' }}
      />
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-3xl transition-colors duration-700"
        style={{ backgroundColor: 'var(--ambient-light-3, rgba(244, 63, 94, 0.25))' }}
      />
    </div>
  );
};
