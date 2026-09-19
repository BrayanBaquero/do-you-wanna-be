import React, { useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';
import { Heart, Sparkles, Award, Share2, Printer, PartyPopper, RotateCcw } from 'lucide-react';
import { GameSettings } from '../../types';
import { sound } from '../../utils/audio';

interface SuccessStageProps {
  settings: GameSettings;
  onRestart: () => void;
}

export const SuccessStage: React.FC<SuccessStageProps> = ({ settings, onRestart }) => {
  const certificateRef = useRef<HTMLDivElement>(null);

  const fireConfetti = () => {
    sound.playPop(1.5);
    // Left burst
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6, x: 0.2 },
      colors: ['#f43f5e', '#ec4899', '#f59e0b', '#fb7185', '#fda4af'],
    });
    // Right burst
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6, x: 0.8 },
      colors: ['#f43f5e', '#ec4899', '#f59e0b', '#fb7185', '#fda4af'],
    });
  };

  useEffect(() => {
    // Initial big burst
    fireConfetti();
    const timer = setTimeout(() => {
      fireConfetti();
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  // Format today's date in Spanish
  const todayFormatted = new Intl.DateTimeFormat('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    sound.playChime();
    const textToShare = `¡Dije que SÍ! 💖 Oficialmente somos novios. ${settings.partnerName} & ${settings.proposerName}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: '¡Somos Oficialmente Novios!',
          text: textToShare,
          url: window.location.href,
        });
      } catch {
        // Fallback to clipboard
        navigator.clipboard.writeText(textToShare);
      }
    } else {
      navigator.clipboard.writeText(textToShare);
      alert('¡Mensaje de victoria copiado al portapapeles!');
    }
  };

  return (
    <div className="relative z-10 flex flex-col items-center justify-center min-h-[76vh] px-4 py-4 max-w-2xl mx-auto text-center">
      {/* Animated Victory Header */}
      <motion.div
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', duration: 0.7 }}
        className="mb-4"
      >
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-rose-300 mb-2">
          <PartyPopper className="w-4 h-4" />
          <span>¡DIJO QUE SÍ!</span>
          <Sparkles className="w-4 h-4" />
        </div>
        <h2 className="text-3xl sm:text-4xl font-black text-rose-950">
          ¡Oficialmente Novios! 🎉
        </h2>
        <p className="text-xs sm:text-sm text-rose-800/90 mt-1">
          Comienza el capítulo más lindo de nuestra historia
        </p>
      </motion.div>

      {/* Official Certificate Card */}
      <motion.div
        ref={certificateRef}
        id="relationship-certificate"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="relative w-full bg-gradient-to-b from-amber-50/95 via-white/98 to-rose-50/95 rounded-3xl border-4 border-double border-amber-300/80 p-6 sm:p-8 shadow-2xl shadow-rose-200/60 my-3 text-center print:border-black print:p-8"
      >
        {/* Certificate Seal & Ribbons */}
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-400 to-amber-500 flex items-center justify-center text-white shadow-md border-2 border-amber-200">
            <Award className="w-7 h-7" />
          </div>
        </div>

        <div className="text-[11px] font-mono tracking-widest text-amber-700/80 uppercase mb-1">
          Certificado Oficial e Inquebrantable
        </div>
        <h3 className="text-xl sm:text-2xl font-black text-rose-950 tracking-tight mb-4">
          Decreto de Amor y Noviazgo
        </h3>

        <div className="text-xs sm:text-sm text-rose-900/90 leading-relaxed max-w-lg mx-auto space-y-3">
          <p>
            Por medio del presente documento interactivo, se certifica con total felicidad que:
          </p>

          <div className="py-2.5 px-4 bg-rose-50/80 rounded-2xl border border-rose-200/80 inline-flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-rose-900 font-bold text-sm sm:text-base">
            <span className="text-rose-600">{settings.partnerName}</span>
            <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
            <span className="text-rose-600">{settings.proposerName}</span>
          </div>

          <p className="text-xs sm:text-sm text-rose-800 italic">
            Han aceptado formalmente compartir sus días, sus risas, sus abrazos y apoyarse mutuamente en cada momento, iniciando formalmente su noviazgo.
          </p>
        </div>

        {/* Miniature Polaroid Memories Ribbon */}
        {settings.photos && settings.photos.length > 0 && (
          <div className="my-3 flex flex-wrap items-center justify-center gap-2 sm:gap-2.5 py-1 max-w-lg mx-auto">
            {settings.photos.slice(0, 7).map((p, idx) => {
              const angles = [-3, 2, -2, 3, -1.5, 2.5, -2];
              return (
                <div
                  key={p.id || idx}
                  className="w-11 h-14 sm:w-13 sm:h-16 bg-white p-1 rounded-lg shadow-xs border border-amber-200/90 transition-transform hover:scale-110"
                  style={{ transform: `rotate(${angles[idx % angles.length]}deg)` }}
                  title={p.title}
                >
                  <img
                    src={p.url}
                    alt={p.title}
                    className="w-full h-8 sm:h-10 object-cover rounded-xs"
                    referrerPolicy="no-referrer"
                  />
                  <p className="text-[7px] text-gray-700 truncate mt-0.5 text-center font-medium">
                    {p.title}
                  </p>
                </div>
              );
            })}
          </div>
        )}

        {/* Date and Signature Row */}
        <div className="mt-6 pt-4 border-t border-amber-200/80 grid grid-cols-2 gap-4 text-xs">
          <div className="flex flex-col items-center">
            <div className="font-serif italic text-sm sm:text-base text-rose-700 font-bold border-b border-rose-300 pb-1 w-28 sm:w-36 text-center">
              {settings.partnerName}
            </div>
            <span className="text-[10px] text-gray-500 mt-1 uppercase tracking-wider">Firma de Aceptación</span>
          </div>

          <div className="flex flex-col items-center">
            <div className="font-serif italic text-sm sm:text-base text-rose-700 font-bold border-b border-rose-300 pb-1 w-28 sm:w-36 text-center">
              {settings.proposerName}
            </div>
            <span className="text-[10px] text-gray-500 mt-1 uppercase tracking-wider">Firma de Promesa</span>
          </div>
        </div>

        {/* Issue Date & Stamp */}
        <div className="mt-5 flex items-center justify-between text-[11px] text-rose-600/80 pt-2">
          <span>📅 Fecha: <strong>{todayFormatted}</strong></span>
          <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            ✓ 100% Válido para Siempre
          </span>
        </div>
      </motion.div>

      {/* Post-game Actions */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 mt-3 w-full max-w-md"
      >
        <button
          id="btn-fire-more-confetti"
          onClick={fireConfetti}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-lg active:scale-95 transition cursor-pointer"
        >
          <PartyPopper className="w-4 h-4" />
          <span>¡Más Confeti!</span>
        </button>

        <button
          id="btn-print-certificate"
          onClick={handlePrint}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white text-rose-700 border border-rose-200 text-xs sm:text-sm font-semibold shadow-xs hover:bg-rose-50 active:scale-95 transition cursor-pointer"
        >
          <Printer className="w-4 h-4 text-rose-500" />
          <span>Guardar / Imprimir</span>
        </button>

        <button
          id="btn-share-certificate"
          onClick={handleShare}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white text-rose-700 border border-rose-200 text-xs sm:text-sm font-semibold shadow-xs hover:bg-rose-50 active:scale-95 transition cursor-pointer"
        >
          <Share2 className="w-4 h-4 text-rose-500" />
          <span>Compartir</span>
        </button>

        <button
          id="btn-play-again"
          onClick={onRestart}
          className="flex items-center gap-1 text-xs text-rose-600 hover:text-rose-800 px-3 py-2 rounded-xl transition cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Jugar de nuevo</span>
        </button>
      </motion.div>
    </div>
  );
};
