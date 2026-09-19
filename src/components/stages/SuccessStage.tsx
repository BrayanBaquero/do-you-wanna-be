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
    <div className="relative z-10 flex flex-col items-center justify-center min-h-[76vh] px-4 py-5 max-w-2xl mx-auto text-center">
      {/* Animated Victory Header */}
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', duration: 0.7 }}
        className="mb-4"
      >
        <div className="label-caps tracking-widest text-amber-800/80 font-semibold mb-2 flex items-center justify-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-700" />
          <span>Epílogo • Para Siempre</span>
        </div>
        <h2 className="font-display italic text-3xl sm:text-4xl lg:text-5xl font-semibold text-neutral-900 leading-tight">
          ¡Oficialmente Juntos! 🎉
        </h2>
        <p className="font-serif text-sm sm:text-base text-neutral-600 mt-1.5">
          Comienza el capítulo más hermoso de nuestra historia
        </p>
      </motion.div>

      {/* Official Certificate Card */}
      <motion.div
        ref={certificateRef}
        id="relationship-certificate"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="relative w-full bg-[#fdfcf9] rounded-2xl border border-neutral-900/20 p-5 sm:p-8 shadow-lg my-3 text-center print:border-black print:p-8"
      >
        {/* Fine inner border for archival quality */}
        <div className="border border-neutral-900/10 p-4 sm:p-6 rounded-xl">
          {/* Certificate Seal */}
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="w-12 h-12 rounded-full bg-neutral-900 text-amber-200 flex items-center justify-center shadow-sm border border-neutral-800">
              <Award className="w-6 h-6" />
            </div>
          </div>

          <div className="font-mono text-[10px] tracking-widest text-neutral-500 uppercase mb-1.5">
            № 01/ETERNIDAD • DECRETO OFICIAL DE AMOR
          </div>
          <h3 className="font-display italic text-2xl sm:text-3xl font-semibold text-neutral-900 tracking-tight mb-4">
            Compromiso de Amor y Noviazgo
          </h3>

          <div className="font-serif text-sm sm:text-base text-neutral-700 leading-relaxed max-w-lg mx-auto space-y-3">
            <p>
              Por medio del presente documento, se certifica con inmensa alegría que:
            </p>

            <div className="py-2.5 px-6 bg-neutral-900/5 rounded-full border border-neutral-900/10 inline-flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-neutral-900 font-display italic text-lg sm:text-xl font-semibold">
              <span className="text-neutral-950">{settings.partnerName}</span>
              <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
              <span className="text-neutral-950">{settings.proposerName}</span>
            </div>

            <p className="font-serif italic text-sm text-neutral-600">
              Han aceptado formalmente compartir sus días, sus risas, sus proyectos y caminar juntos con paciencia, ternura y complicidad eterna.
            </p>
          </div>

          {/* Miniature Polaroid Memories Ribbon */}
          {settings.photos && settings.photos.length > 0 && (
            <div className="my-5 flex flex-wrap items-center justify-center gap-2 sm:gap-2.5 py-1 max-w-lg mx-auto">
              {settings.photos.slice(0, 7).map((p, idx) => {
                const angles = [-2, 2, -1.5, 2.5, -1, 1.8, -2];
                return (
                  <div
                    key={p.id || idx}
                    className="w-12 h-15 sm:w-14 sm:h-17 bg-[#fdfcf9] p-1 rounded-sm shadow-2xs border border-neutral-900/15 transition-transform hover:scale-110"
                    style={{ transform: `rotate(${angles[idx % angles.length]}deg)` }}
                    title={p.title}
                  >
                    <img
                      src={p.url}
                      alt={p.title}
                      className="w-full h-9 sm:h-11 object-cover rounded-xs"
                      referrerPolicy="no-referrer"
                    />
                    <p className="font-mono text-[7px] text-neutral-600 truncate mt-0.5 text-center font-medium">
                      {p.title}
                    </p>
                  </div>
                );
              })}
            </div>
          )}

          {/* Date and Signature Row */}
          <div className="mt-6 pt-5 border-t border-neutral-900/10 grid grid-cols-2 gap-4 text-xs">
            <div className="flex flex-col items-center">
              <div className="font-display italic text-base sm:text-lg text-neutral-900 font-semibold border-b border-neutral-400 pb-1 w-28 sm:w-36 text-center">
                {settings.partnerName}
              </div>
              <span className="font-mono text-[9px] text-neutral-500 mt-1 uppercase tracking-widest">Firma de Aceptación</span>
            </div>

            <div className="flex flex-col items-center">
              <div className="font-display italic text-base sm:text-lg text-neutral-900 font-semibold border-b border-neutral-400 pb-1 w-28 sm:w-36 text-center">
                {settings.proposerName}
              </div>
              <span className="font-mono text-[9px] text-neutral-500 mt-1 uppercase tracking-widest">Firma de Promesa</span>
            </div>
          </div>

          {/* Issue Date & Stamp */}
          <div className="mt-5 flex items-center justify-between text-xs font-mono text-neutral-600 pt-2 border-t border-neutral-900/5">
            <span>FECHA: <strong>{todayFormatted}</strong></span>
            <span className="font-mono text-[9px] uppercase tracking-widest text-[#fdfcf9] bg-neutral-900 px-2.5 py-1 rounded-full border border-neutral-800">
              ✓ Validez Eterna
            </span>
          </div>
        </div>
      </motion.div>

      {/* Post-game Actions */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 mt-4 w-full max-w-lg"
      >
        <button
          id="btn-fire-more-confetti"
          type="button"
          onClick={fireConfetti}
          className="group inline-flex items-center gap-1.5 px-5 py-3 bg-neutral-900 text-[#fdfcf9] hover:bg-neutral-800 border border-neutral-900 font-mono text-xs uppercase tracking-widest shadow-xs transition active:scale-95 cursor-pointer"
        >
          <PartyPopper className="w-4 h-4 text-amber-300" />
          <span>¡Más Confeti!</span>
        </button>

        <button
          id="btn-print-certificate"
          type="button"
          onClick={handlePrint}
          className="inline-flex items-center gap-1.5 px-4 py-3 bg-white hover:bg-neutral-50 text-neutral-800 border border-neutral-300 font-mono text-xs uppercase tracking-widest shadow-2xs transition active:scale-95 cursor-pointer"
        >
          <Printer className="w-4 h-4 text-neutral-600" />
          <span>Imprimir</span>
        </button>

        <button
          id="btn-share-certificate"
          type="button"
          onClick={handleShare}
          className="inline-flex items-center gap-1.5 px-4 py-3 bg-white hover:bg-neutral-50 text-neutral-800 border border-neutral-300 font-mono text-xs uppercase tracking-widest shadow-2xs transition active:scale-95 cursor-pointer"
        >
          <Share2 className="w-4 h-4 text-neutral-600" />
          <span>Compartir</span>
        </button>

        <button
          id="btn-play-again"
          type="button"
          onClick={onRestart}
          className="inline-flex items-center gap-1 font-mono text-xs uppercase tracking-wider text-neutral-500 hover:text-neutral-900 px-3 py-2 transition cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Jugar de nuevo</span>
        </button>
      </motion.div>
    </div>
  );
};
