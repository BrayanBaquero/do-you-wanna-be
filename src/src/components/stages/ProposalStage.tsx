import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { Heart, Sparkles, AlertCircle } from 'lucide-react';
import { GameSettings } from '../../types';
import { sound } from '../../utils/audio';

interface ProposalStageProps {
  settings: GameSettings;
  onAccept: () => void;
}

const DODGE_MESSAGES = [
  '¿Seguro/a? Piénsalo bien... 😏',
  '¡Ups, este botón es tímido y se escapa!',
  'Esa opción está deshabilitada por el destino ❤️',
  '¡El botón de SÍ se ve mil veces mejor!',
  '¡Vamos, sabes que quieres decir que sí! 🥰',
  '¡Error 404: El "No" no existe aquí!',
  '¡No te dejaré escapar tan fácil! 🤭',
  'Científicamente comprobado: ¡Debes decir que SÍ!',
];

export const ProposalStage: React.FC<ProposalStageProps> = ({ settings, onAccept }) => {
  const [dodgeCount, setDodgeCount] = useState(0);
  const [noPosition, setNoPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [dodgeMessage, setDodgeMessage] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Derive the question label
  const getQuestionText = () => {
    switch (settings.questionType) {
      case 'novia':
        return '¿Quieres ser mi novia?';
      case 'novio':
        return '¿Quieres ser mi novio?';
      case 'pareja':
        return '¿Quieres ser mi pareja?';
      case 'custom':
        return settings.customQuestion || '¿Quieres ser mi novia?';
      default:
        return '¿Quieres ser mi novia?';
    }
  };

  const moveNoButton = () => {
    sound.playDodge();
    setDodgeCount((prev) => prev + 1);

    // Pick random message
    const msg = DODGE_MESSAGES[dodgeCount % DODGE_MESSAGES.length];
    setDodgeMessage(msg);

    // Compute safe random coordinate within arena bounds
    const container = containerRef.current;
    if (container) {
      const rect = container.getBoundingClientRect();
      const maxX = Math.max(60, (rect.width / 2) - 60);
      const maxY = Math.max(40, (rect.height / 2) - 40);

      const randomX = (Math.random() - 0.5) * maxX * 1.6;
      const randomY = (Math.random() - 0.5) * maxY * 1.6;

      setNoPosition({ x: randomX, y: randomY });
    } else {
      // Fallback relative jumps
      const randomX = (Math.random() * 200) - 100;
      const randomY = (Math.random() * 120) - 60;
      setNoPosition({ x: randomX, y: randomY });
    }
  };

  const handleYesClick = () => {
    sound.playCelebration();
    onAccept();
  };

  // Grow "Yes" button with each dodge
  const yesScale = Math.min(1.4, 1 + dodgeCount * 0.06);

  return (
    <div className="relative z-10 flex flex-col items-center justify-center min-h-[76vh] px-4 py-3 max-w-xl mx-auto text-center">
      {/* Letter Envelope Card */}
      <motion.div
        ref={containerRef}
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ duration: 0.5, type: 'spring' }}
        className="relative w-full bg-gradient-to-b from-amber-50/90 via-white/95 to-rose-50/90 backdrop-blur-md rounded-3xl border-2 border-rose-200/90 p-6 sm:p-8 shadow-2xl shadow-rose-200/50 overflow-hidden"
      >
        {/* Decorative corner florals/stamps */}
        <div className="absolute top-3 left-3 text-xs font-mono text-rose-300 select-none">
          № 01/INF
        </div>
        <div className="absolute top-3 right-3 flex items-center gap-1 text-xs font-semibold text-rose-600 bg-rose-100/80 px-2.5 py-1 rounded-full border border-rose-200">
          <Sparkles className="w-3 h-3 text-rose-500" />
          <span>Pregunta Oficial</span>
        </div>

        {/* Wax seal heart icon */}
        <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-gradient-to-tr from-rose-600 to-red-500 flex items-center justify-center shadow-lg shadow-rose-400/50 border-2 border-rose-200">
          <Heart className="w-7 h-7 fill-white text-white animate-pulse" />
        </div>

        {/* Names Header */}
        <div className="space-y-1 mb-4">
          <p className="text-xs uppercase tracking-widest text-rose-500 font-bold">
            Para la persona más especial
          </p>
          <h2 className="text-2xl sm:text-3xl font-black text-rose-950">
            {settings.partnerName}
          </h2>
        </div>

        {/* Dedication Text */}
        <div className="bg-white/80 border border-rose-100 rounded-2xl p-4 mb-6 shadow-xs text-xs sm:text-sm text-rose-900/90 leading-relaxed italic text-left max-w-md mx-auto">
          "{settings.customReason ||
            'Después de compartir tantas sonrisas, momentos y miradas, supe que no hay nadie con quien preferiría caminar en esta vida. Eres mi persona favorita, mi felicidad y mi mayor ilusión.'}"
          <div className="text-right not-italic font-bold text-rose-600 mt-2">
            — Con todo mi amor, {settings.proposerName}
          </div>
        </div>

        {/* The Big Question */}
        <div className="my-6">
          <motion.h3
            animate={{ scale: [1, 1.03, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="text-2xl sm:text-3xl md:text-4xl font-black text-rose-600 tracking-tight"
          >
            {getQuestionText()}
          </motion.h3>
        </div>

        {/* Dodge Message Banner */}
        <div className="h-7 mb-4 flex items-center justify-center">
          {dodgeMessage && (
            <motion.div
              key={dodgeCount}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-xs font-bold text-rose-600 bg-rose-100/90 px-3 py-1 rounded-full border border-rose-200 shadow-xs"
            >
              {dodgeMessage}
            </motion.div>
          )}
        </div>

        {/* The Interactive Buttons Arena */}
        <div className="relative flex items-center justify-center gap-4 sm:gap-6 min-h-[90px]">
          {/* YES BUTTON */}
          <motion.button
            id="btn-proposal-yes"
            onClick={handleYesClick}
            style={{ transform: `scale(${yesScale})` }}
            className="group flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-rose-500 to-pink-500 text-white font-extrabold text-base sm:text-lg shadow-xl shadow-rose-300 hover:shadow-2xl active:scale-95 transition-all cursor-pointer z-10"
          >
            <Heart className="w-5 h-5 fill-white group-hover:scale-125 transition-transform" />
            <span>¡SÍ, ACEPTO!</span>
            <Sparkles className="w-4 h-4 fill-white" />
          </motion.button>

          {/* PLAYFUL ESCAPING NO BUTTON */}
          <motion.button
            id="btn-proposal-no"
            onMouseEnter={moveNoButton}
            onTouchStart={moveNoButton}
            onClick={moveNoButton}
            animate={{
              x: noPosition.x,
              y: noPosition.y,
            }}
            transition={{ type: 'spring', stiffness: 350, damping: 20 }}
            className="px-5 py-2.5 rounded-xl bg-gray-200/90 hover:bg-gray-300 text-gray-700 text-xs sm:text-sm font-semibold border border-gray-300/80 shadow-sm cursor-pointer select-none transition-colors"
          >
            No
          </motion.button>
        </div>

        {dodgeCount > 3 && (
          <p className="text-[11px] text-rose-400 mt-4">
            (Pst... ¿ya viste que el botón de SÍ es irresistible?)
          </p>
        )}
      </motion.div>
    </div>
  );
};
