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
    if (settings.customAudioUrl && settings.backgroundMusicEnabled !== false) {
      sound.playMusic();
    }
    onStart();
  };

  return (
    <div className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-12 flex-grow flex items-center">
      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-14 items-center">
        {/* Visual Side (Variation 3) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="relative aspect-square max-w-[280px] sm:max-w-[360px] mx-auto md:max-w-none w-full bg-neutral-900/[0.04] border border-neutral-900/[0.08] rounded-3xl flex items-center justify-center p-8 shadow-inner"
        >
          <span className="text-7xl sm:text-8xl md:text-9xl select-none filter drop-shadow-sm">
            💖
          </span>
          <div className="absolute -top-3 -right-3 text-3xl sm:text-4xl select-none animate-pulse">
            ✨
          </div>
          <div className="absolute -bottom-2 -left-2 text-2xl sm:text-3xl select-none opacity-80">
            🌸
          </div>
        </motion.div>

        {/* Content Side (Variation 3) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.6 }}
          className="flex flex-col items-start text-left max-w-lg mx-auto md:mx-0"
        >
          <div className="label-caps mb-2 text-amber-800/80 font-semibold tracking-widest flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-700" />
            <span>Misión Especial de Amor</span>
          </div>

          <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl text-neutral-900 leading-[0.95] mb-4 tracking-tight">
            ¡Hola, <br />
            <span className="italic text-[#d4a373] font-normal">{settings.partnerName}</span>!
          </h2>

          <p className="font-serif text-base sm:text-lg lg:text-xl text-neutral-600/90 leading-relaxed mb-7 max-w-md">
            He preparado este pequeño juego interactivo con mucho cariño. Para descubrir la sorpresa que te espera al final, deberás superar 4 pequeños desafíos.
          </p>

          <button
            id="btn-start-game"
            type="button"
            onClick={handleStartClick}
            className="group inline-flex items-center gap-3 px-8 py-4 bg-neutral-900 text-[#fdfcf9] hover:bg-neutral-800 border border-neutral-900 font-mono text-sm sm:text-base uppercase tracking-widest transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer active:scale-[0.98]"
          >
            <span>Comenzar el Juego</span>
            <span className="text-lg group-hover:scale-110 transition-transform">💌</span>
          </button>

          <div className="label-caps mt-6 opacity-60 flex items-center gap-2">
            <Music className="w-3.5 h-3.5 text-neutral-600" />
            <span>Sonido recomendado para mayor diversión</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
