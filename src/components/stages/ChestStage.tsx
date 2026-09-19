import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Key, Lock, Unlock, Mail, ArrowRight } from 'lucide-react';
import { sound } from '../../utils/audio';

interface ChestStageProps {
  onNext: () => void;
  partnerName: string;
}

interface ChestLock {
  id: number;
  label: string;
  isUnlocked: boolean;
}

export const ChestStage: React.FC<ChestStageProps> = ({ onNext, partnerName }) => {
  const [locks, setLocks] = useState<ChestLock[]>([
    { id: 1, label: 'Llave del Cariño', isUnlocked: false },
    { id: 2, label: 'Llave de la Confianza', isUnlocked: false },
    { id: 3, label: 'Llave de Nuestro Futuro', isUnlocked: false },
  ]);

  const unlockedCount = locks.filter((l) => l.isUnlocked).length;
  const isAllUnlocked = unlockedCount === locks.length;

  const handleUnlock = (id: number) => {
    sound.playPop(1 + id * 0.2);
    setLocks((prev) =>
      prev.map((l) => (l.id === id ? { ...l, isUnlocked: true } : l))
    );

    if (unlockedCount + 1 === locks.length) {
      setTimeout(() => {
        sound.playMagicUnlock();
      }, 350);
    }
  };

  return (
    <div className="relative z-10 flex flex-col items-center justify-between min-h-[72vh] px-4 py-4 max-w-xl mx-auto text-center">
      {/* Stage Header */}
      <div className="w-full">
        <div className="label-caps mb-1.5 tracking-widest text-amber-800/80 font-semibold flex items-center justify-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-700" />
          <span>Capítulo IV • Desafío 4 de 4</span>
        </div>
        <h2 className="font-display italic text-2xl sm:text-3xl lg:text-4xl font-semibold text-neutral-900 leading-tight">
          El Cofre de las Tres Llaves
        </h2>
        <p className="font-serif text-sm sm:text-base text-neutral-600 mt-1">
          Toca las 3 llaves para desbloquear el secreto final
        </p>
      </div>

      {/* Interactive Chest and Keys */}
      <div className="w-full my-4 flex flex-col items-center">
        {/* Chest Illustration */}
        <motion.div
          animate={isAllUnlocked ? { y: [-2, 2, -2] } : { scale: [1, 1.01, 1] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
          className="relative my-2"
        >
          <div className="w-40 h-40 sm:w-48 sm:h-48 rounded-2xl bg-[#1c1917] p-4 shadow-xl border-2 border-[#c5a059]/50 flex flex-col items-center justify-center text-white relative overflow-hidden">
            {/* Inner subtle texture */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-white/5 pointer-events-none" />
            
            {isAllUnlocked ? (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex flex-col items-center z-10"
              >
                <div className="w-16 h-16 bg-[#fdfcf9] text-neutral-900 rounded-xl flex items-center justify-center shadow-lg border border-[#c5a059]/40 mb-2">
                  <Mail className="w-8 h-8 text-[#d4a373]" />
                </div>
                <span className="font-mono text-[10px] uppercase tracking-widest text-amber-200/90 bg-white/10 px-3 py-1 rounded-full border border-white/10">
                  ¡Cofre Abierto!
                </span>
              </motion.div>
            ) : (
              <div className="flex flex-col items-center z-10">
                <span className="text-5xl sm:text-6xl select-none mb-2 filter drop-shadow-sm">🗝️</span>
                <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-300 bg-white/10 px-3 py-1 rounded-full border border-white/10">
                  {3 - unlockedCount} llaves pendientes
                </span>
              </div>
            )}
          </div>

          {/* Subtle Sparkle */}
          {isAllUnlocked && (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
              className="absolute -top-3 -right-3 text-2xl select-none"
            >
              ✨
            </motion.div>
          )}
        </motion.div>

        {/* The 3 Keys buttons */}
        {!isAllUnlocked ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-lg mt-5">
            {locks.map((item) => (
              <button
                key={item.id}
                id={`btn-unlock-key-${item.id}`}
                type="button"
                disabled={item.isUnlocked}
                onClick={() => handleUnlock(item.id)}
                className={`p-3.5 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  item.isUnlocked
                    ? 'bg-neutral-900/5 border-neutral-900/10 text-neutral-400 opacity-70 shadow-none'
                    : 'bg-[#fdfcf9] hover:bg-neutral-50 border-neutral-900/15 text-neutral-900 shadow-2xs hover:scale-[1.02] active:scale-[0.98]'
                }`}
              >
                {item.isUnlocked ? (
                  <Unlock className="w-5 h-5 text-neutral-400" />
                ) : (
                  <Key className="w-5 h-5 text-[#d4a373] animate-pulse" />
                )}
                <span className="font-serif italic text-sm font-semibold">{item.label}</span>
                <span className="font-mono text-[9px] uppercase tracking-widest text-neutral-500">
                  {item.isUnlocked ? 'Desbloqueada ✓' : 'Girar Llave'}
                </span>
              </button>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 flex flex-col items-center"
          >
            <p className="font-serif italic text-base sm:text-lg text-neutral-800 mb-4 max-w-sm">
              "{partnerName}, las tres llaves han liberado la carta más importante..."
            </p>
            <button
              id="btn-open-proposal-envelope"
              type="button"
              onClick={() => {
                sound.playChime();
                onNext();
              }}
              className="group inline-flex items-center gap-3 px-8 py-4 bg-neutral-900 text-[#fdfcf9] hover:bg-neutral-800 border border-neutral-900 font-mono text-xs sm:text-sm uppercase tracking-widest transition-all duration-200 shadow-md cursor-pointer active:scale-[0.98]"
            >
              <Mail className="w-4 h-4 text-amber-200" />
              <span>Abrir la Carta de Amor</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        )}
      </div>

      <div className="pb-2">
        <p className="font-mono text-xs text-neutral-500 tracking-wider">
          El destino aguarda en la siguiente página...
        </p>
      </div>
    </div>
  );
};
