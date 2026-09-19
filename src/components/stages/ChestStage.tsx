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
    <div className="relative z-10 flex flex-col items-center justify-between min-h-[72vh] px-4 py-3 max-w-xl mx-auto text-center">
      {/* Stage Header */}
      <div className="w-full">
        <span className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full bg-rose-100 text-rose-700 mb-1.5 border border-rose-200">
          <Sparkles className="w-3.5 h-3.5 text-rose-500" />
          Desafío 4 de 4: El Cofre del Destino
        </span>
        <h2 className="text-xl sm:text-2xl font-black text-rose-950">
          Desbloquea el secreto mejor guardado
        </h2>
        <p className="text-xs sm:text-sm text-rose-700/80 mt-1">
          Toca las 3 llaves doradas para abrir el cofre
        </p>
      </div>

      {/* Interactive Chest and Keys */}
      <div className="w-full my-3 flex flex-col items-center">
        {/* Chest Illustration */}
        <motion.div
          animate={isAllUnlocked ? { y: [-2, 2, -2] } : { scale: [1, 1.02, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="relative my-2"
        >
          <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-3xl bg-gradient-to-b from-amber-400 via-amber-500 to-amber-700 p-3 shadow-2xl border-4 border-amber-200 flex flex-col items-center justify-center text-white relative overflow-hidden">
            {/* Chest Glow */}
            <div className="absolute inset-0 bg-white/10 backdrop-blur-xs" />
            
            {isAllUnlocked ? (
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex flex-col items-center z-10"
              >
                <div className="w-16 h-16 bg-rose-500 text-white rounded-2xl flex items-center justify-center shadow-lg animate-bounce">
                  <Mail className="w-9 h-9" />
                </div>
                <span className="text-xs font-bold text-amber-100 mt-2 bg-amber-900/40 px-2.5 py-0.5 rounded-full">
                  ¡Cofre Abierto!
                </span>
              </motion.div>
            ) : (
              <div className="flex flex-col items-center z-10">
                <span className="text-5xl sm:text-6xl select-none mb-1">🎁</span>
                <span className="text-xs font-semibold text-amber-100 bg-amber-900/40 px-3 py-1 rounded-full">
                  {3 - unlockedCount} candados restantes
                </span>
              </div>
            )}
          </div>

          {/* Sparkles */}
          {isAllUnlocked && (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
              className="absolute -top-3 -right-3 text-2xl select-none"
            >
              ✨
            </motion.div>
          )}
        </motion.div>

        {/* The 3 Keys buttons */}
        {!isAllUnlocked ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 w-full max-w-md mt-4">
            {locks.map((item) => (
              <button
                key={item.id}
                id={`btn-unlock-key-${item.id}`}
                disabled={item.isUnlocked}
                onClick={() => handleUnlock(item.id)}
                className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  item.isUnlocked
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-800 shadow-sm opacity-80'
                    : 'bg-white hover:bg-amber-50 border-amber-200 text-amber-900 shadow-md hover:scale-105 active:scale-95'
                }`}
              >
                {item.isUnlocked ? (
                  <Unlock className="w-5 h-5 text-emerald-600" />
                ) : (
                  <Key className="w-5 h-5 text-amber-600 animate-pulse" />
                )}
                <span className="text-xs font-bold">{item.label}</span>
                <span className="text-[10px] text-gray-500">
                  {item.isUnlocked ? 'Desbloqueada ✅' : 'Tocar para activar'}
                </span>
              </button>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 flex flex-col items-center"
          >
            <p className="text-sm font-semibold text-rose-900 mb-3">
              {partnerName}, las 3 llaves han revelado el mensaje final...
            </p>
            <button
              id="btn-open-proposal-envelope"
              onClick={() => {
                sound.playChime();
                onNext();
              }}
              className="flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 text-white font-bold text-base shadow-xl shadow-rose-300/80 hover:shadow-2xl hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              <Mail className="w-5 h-5" />
              <span>Abrir la Carta de Amor</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </div>

      <div className="pb-2">
        <p className="text-xs text-rose-500 italic">
          ¡Estamos a solo un paso de lo más importante!
        </p>
      </div>
    </div>
  );
};
