import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';
import { sound } from '../../utils/audio';

interface HeartsStageProps {
  onNext: () => void;
  partnerName: string;
}

interface HeartItem {
  id: number;
  reason: string;
  emoji: string;
  x: number;
  y: number;
  color: string;
}

const REASONS: { reason: string; emoji: string; color: string }[] = [
  { reason: 'Tu hermosa sonrisa que alegra mi día', emoji: '✨', color: 'from-rose-400 to-pink-500' },
  { reason: 'Tus abrazos que curan todo', emoji: '🤗', color: 'from-pink-400 to-rose-500' },
  { reason: 'Nuestras risas y complicidad única', emoji: '😂', color: 'from-amber-400 to-rose-400' },
  { reason: 'La paz y calidez que siento a tu lado', emoji: '🤍', color: 'from-rose-300 to-pink-400' },
  { reason: 'Que contigo el mundo es mil veces más bonito', emoji: '🌎', color: 'from-red-400 to-rose-500' },
  { reason: 'Tus ocurrencias que me enamoran a diario', emoji: '🥰', color: 'from-pink-500 to-rose-600' },
];

export const HeartsStage: React.FC<HeartsStageProps> = ({ onNext, partnerName }) => {
  const [collectedCount, setCollectedCount] = useState<number>(0);
  const [activeReasons, setActiveReasons] = useState<string[]>([]);
  const [isComplete, setIsComplete] = useState<boolean>(false);
  const targetCount = 5;

  // Track hearts available on screen
  const [hearts, setHearts] = useState<HeartItem[]>([
    { id: 1, ...REASONS[0], x: 20, y: 25 },
    { id: 2, ...REASONS[1], x: 75, y: 30 },
    { id: 3, ...REASONS[2], x: 45, y: 55 },
    { id: 4, ...REASONS[3], x: 18, y: 70 },
    { id: 5, ...REASONS[4], x: 78, y: 72 },
    { id: 6, ...REASONS[5], x: 50, y: 18 },
  ]);

  const handleHeartClick = (heart: HeartItem) => {
    sound.playPop(1 + collectedCount * 0.15);
    setCollectedCount((prev) => Math.min(targetCount, prev + 1));
    setActiveReasons((prev) => [heart.reason, ...prev]);

    // Remove clicked heart
    setHearts((prev) => prev.filter((h) => h.id !== heart.id));

    if (collectedCount + 1 >= targetCount) {
      setTimeout(() => {
        setIsComplete(true);
        sound.playChime();
      }, 2800);
    }
  };

  return (
    <div className="relative z-10 flex flex-col items-center justify-between min-h-[72vh] px-4 py-3 max-w-xl mx-auto text-center">
      {/* Header Info */}
      <div className="w-full">
        <div className="label-caps mb-1.5 tracking-widest text-amber-800/80 font-semibold flex items-center justify-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-700" />
          <span>Capítulo I • Desafío 1 de 4</span>
        </div>
        <h2 className="font-display italic text-2xl sm:text-3xl lg:text-4xl font-semibold text-neutral-900 leading-tight">
          Atrapa 5 razones por las que eres tan especial
        </h2>
        <p className="font-serif text-sm sm:text-base text-neutral-600 mt-1">
          Toca los corazones flotantes para descubrir lo que guardan dentro
        </p>

        {/* Counter bar */}
        <div className="mt-3 flex items-center justify-center gap-3">
          <div className="w-48 bg-neutral-900/10 rounded-full h-2 p-0.5 overflow-hidden border border-neutral-900/10">
            <motion.div
              className="h-full bg-neutral-900 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(collectedCount / targetCount) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <span className="font-mono text-xs font-medium text-neutral-700">
            {collectedCount} / {targetCount} ❤️
          </span>
        </div>
      </div>

      {/* Interactive Arena */}
      <div className="relative w-full h-72 sm:h-80 bg-white/70 backdrop-blur-md rounded-3xl border border-rose-200/90 shadow-lg my-4 overflow-hidden flex items-center justify-center">
        {/* Playful Floating Hearts */}
        <AnimatePresence>
          {hearts.map((h) => (
            <motion.button
              key={h.id}
              id={`heart-item-${h.id}`}
              onClick={() => handleHeartClick(h)}
              initial={{ scale: 0, opacity: 0 }}
              animate={{
                scale: [1, 1.12, 1],
                opacity: 1,
                y: [0, -8, 0],
              }}
              exit={{ scale: 1.5, opacity: 0 }}
              transition={{
                scale: { duration: 1.8, repeat: Infinity, ease: 'easeInOut' },
                y: { duration: 2.2, repeat: Infinity, ease: 'easeInOut', delay: h.id * 0.2 },
              }}
              style={{
                position: 'absolute',
                left: `${h.x}%`,
                top: `${h.y}%`,
                transform: 'translate(-50%, -50%)',
              }}
              className={`p-3 sm:p-3.5 rounded-2xl bg-gradient-to-tr ${h.color} text-white shadow-md shadow-rose-300/50 hover:shadow-xl hover:scale-125 active:scale-95 transition-transform cursor-pointer select-none`}
            >
              <Heart className="w-6 h-6 sm:w-7 sm:h-7 fill-white drop-shadow-sm" />
            </motion.button>
          ))}
        </AnimatePresence>

        {/* Latest revealed reason banner */}
        <div className="absolute bottom-3 left-3 right-3 pointer-events-none">
          <AnimatePresence mode="wait">
            {activeReasons.length > 0 && !isComplete && (
              <motion.div
                key={activeReasons[0]}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-rose-500 text-white text-xs sm:text-sm font-medium py-2 px-3 rounded-xl shadow-md mx-auto max-w-sm"
              >
                💌 "{activeReasons[0]}"
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Success completion overlay */}
        {isComplete && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center justify-center p-6 bg-white/95 rounded-2xl border border-rose-300 shadow-xl max-w-sm mx-4"
          >
            <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mb-2 animate-bounce">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-rose-950">
              ¡Desafío completado!
            </h3>
            <p className="text-xs text-rose-700/90 mt-1">
              {partnerName}, eres increíble y cada razón es 100% real.
            </p>
          </motion.div>
        )}
      </div>

      {/* Footer Navigation */}
      <div className="w-full flex justify-center pb-2">
        {isComplete ? (
          <motion.button
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            id="btn-next-to-trivia"
            onClick={() => {
              sound.playChime();
              onNext();
            }}
            className="group inline-flex items-center gap-2.5 px-7 py-3.5 bg-neutral-900 text-[#fdfcf9] hover:bg-neutral-800 border border-neutral-900 font-mono text-xs sm:text-sm uppercase tracking-widest transition-all duration-200 shadow-sm cursor-pointer active:scale-[0.98]"
          >
            <span>Siguiente Desafío: Test del Destino</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </motion.button>
        ) : (
          <p className="font-mono text-xs text-neutral-500 tracking-wider">
            Quedan {targetCount - collectedCount} corazones por atrapar...
          </p>
        )}
      </div>
    </div>
  );
};
