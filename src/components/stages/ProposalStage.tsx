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
        className="relative w-full bg-[#fdfcf9] backdrop-blur-md rounded-3xl border border-neutral-900/15 p-6 sm:p-9 shadow-xl overflow-hidden"
      >
        {/* Decorative stamp & label */}
        <div className="flex items-center justify-between border-b border-neutral-900/10 pb-3 mb-5">
          <div className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 select-none">
            № 01/INF • ARCHIVO OFICIAL
          </div>
          <div className="label-caps tracking-widest text-amber-800 font-semibold flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-amber-700" />
            <span>Capítulo Final</span>
          </div>
        </div>

        {/* Wax seal heart icon */}
        <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-neutral-900 text-amber-200 flex items-center justify-center shadow-md border border-neutral-800">
          <Heart className="w-6 h-6 fill-current animate-pulse" />
        </div>

        {/* Names Header */}
        <div className="space-y-1 mb-4">
          <p className="label-caps text-neutral-500 tracking-widest text-[11px]">
            Para la persona más especial
          </p>
          <h2 className="font-display italic text-3xl sm:text-4xl lg:text-5xl font-semibold text-neutral-900 tracking-tight">
            {settings.partnerName}
          </h2>
        </div>

        {/* Dedication Text */}
        <div className="bg-neutral-900/[0.03] border border-neutral-900/10 rounded-2xl p-5 mb-6 text-sm sm:text-base font-serif text-neutral-700 leading-relaxed text-left max-w-md mx-auto">
          "{settings.customReason ||
            'Después de compartir tantas sonrisas, momentos y miradas, supe que no hay nadie con quien preferiría caminar en esta vida. Eres mi persona favorita, mi felicidad y mi mayor ilusión.'}"
          <div className="text-right font-mono text-xs uppercase tracking-wider text-neutral-500 mt-3">
            — Con todo mi amor, {settings.proposerName}
          </div>
        </div>

        {/* The Big Question */}
        <div className="my-6">
          <motion.h3
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
            className="font-display italic text-3xl sm:text-4xl lg:text-5xl font-semibold text-neutral-900 tracking-tight leading-tight"
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
              className="font-mono text-xs text-neutral-800 bg-neutral-900/5 px-3 py-1 rounded-full border border-neutral-900/10 shadow-2xs"
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
            type="button"
            onClick={handleYesClick}
            style={{ transform: `scale(${yesScale})` }}
            className="group flex items-center gap-2.5 px-8 py-4 bg-neutral-900 text-[#fdfcf9] hover:bg-neutral-800 font-mono text-sm sm:text-base uppercase tracking-widest shadow-md transition-all cursor-pointer z-10 border border-neutral-900 active:scale-95"
          >
            <Heart className="w-5 h-5 fill-current text-rose-300 group-hover:scale-125 transition-transform" />
            <span>¡SÍ, ACEPTO!</span>
            <Sparkles className="w-4 h-4 text-amber-300" />
          </motion.button>

          {/* PLAYFUL ESCAPING NO BUTTON */}
          <motion.button
            id="btn-proposal-no"
            type="button"
            onMouseEnter={moveNoButton}
            onTouchStart={moveNoButton}
            onClick={moveNoButton}
            animate={{
              x: noPosition.x,
              y: noPosition.y,
            }}
            transition={{ type: 'spring', stiffness: 350, damping: 20 }}
            className="px-5 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-mono text-xs uppercase tracking-wider border border-neutral-300 cursor-pointer select-none transition-colors"
          >
            No
          </motion.button>
        </div>

        {dodgeCount > 3 && (
          <p className="font-mono text-[11px] text-neutral-500 mt-4 tracking-wide">
            (Pst... ¿ya viste que el botón de SÍ es irresistible?)
          </p>
        )}
      </motion.div>
    </div>
  );
};
