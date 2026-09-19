import React from 'react';
import { motion } from 'motion/react';
import { Heart, Play, Sparkles, Music } from 'lucide-react';
import { GameSettings } from '../../types';
import { sound } from '../../utils/audio';

interface IntroStageProps {
  settings: GameSettings;
  onStart: () => void;
  onOpenSettings: () => void;
}

export const IntroStage: React.FC<IntroStageProps> = ({
  settings,
  onStart,
  onOpenSettings,
}) => {
  const handleStartClick = () => {
    sound.playChime();
    onStart();
  };

  return (
    <div className="relative z-10 flex flex-col items-center justify-center min-h-[72vh] px-4 text-center max-w-lg mx-auto">
      {/* Animated Floating Emblem */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ duration: 0.6, type: 'spring' }}
        className="relative mb-6"
      >
        <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-gradient-to-tr from-rose-500 via-pink-400 to-red-400 flex items-center justify-center shadow-xl shadow-rose-200/80 border-4 border-white transform hover:rotate-3 transition duration-300">
          <span className="text-5xl sm:text-6xl animate-bounce select-none">💖</span>
        </div>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
          className="absolute -top-3 -right-3 text-amber-400 text-xl"
        >
          ✨
        </motion.div>
        <motion.div
          animate={{ y: [-4, 4, -4] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -bottom-2 -left-2 text-rose-400 text-lg"
        >
          🌸
        </motion.div>
      </motion.div>

      {/* Main Greeting */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="space-y-3 mb-8"
      >
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-100/90 text-rose-700 border border-rose-200">
          <Sparkles className="w-3.5 h-3.5 text-rose-500" />
          Misión Especial de Amor
        </span>

        <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-rose-950 tracking-tight">
          ¡Hola, <span className="text-rose-600 underline decoration-wavy decoration-rose-300">{settings.partnerName}</span>!
        </h1>

        <p className="text-sm sm:text-base text-rose-800/80 max-w-md mx-auto leading-relaxed">
          He preparado este pequeño juego interactivo con mucho cariño. Para descubrir la sorpresa que te espera al final, deberás superar 4 pequeños desafíos.
        </p>

        {settings.customReason && (
          <div className="bg-rose-50/80 border border-rose-200/80 rounded-2xl p-3.5 text-xs sm:text-sm text-rose-800 italic max-w-sm mx-auto shadow-sm">
            "{settings.customReason}"
          </div>
        )}
      </motion.div>

      {/* Interactive Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.5 }}
        className="flex flex-col items-center gap-3 w-full max-w-xs"
      >
        <button
          id="btn-start-game"
          onClick={handleStartClick}
          className="w-full group flex items-center justify-center gap-2.5 px-6 py-4 rounded-2xl bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 text-white font-bold text-base shadow-lg shadow-rose-300/60 hover:shadow-xl hover:shadow-rose-400/60 hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
        >
          <Play className="w-5 h-5 fill-white" />
          <span>Comenzar el Juego</span>
          <Heart className="w-4 h-4 fill-white text-white group-hover:scale-125 transition-transform" />
        </button>

        <div className="flex items-center justify-center gap-2 text-xs text-rose-500 pt-1">
          <Music className="w-3.5 h-3.5" />
          <span>Sonido recomendado para mayor diversión</span>
        </div>
      </motion.div>
    </div>
  );
};
