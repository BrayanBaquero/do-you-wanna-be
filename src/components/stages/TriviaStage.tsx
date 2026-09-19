import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, ArrowRight, Check, Flame } from 'lucide-react';
import { sound } from '../../utils/audio';

interface TriviaStageProps {
  onNext: () => void;
  partnerName: string;
}

interface Question {
  title: string;
  options: {
    text: string;
    reaction: string;
  }[];
}

const QUESTIONS: Question[] = [
  {
    title: '¿Qué pasa mágicamente cuando estamos juntos?',
    options: [
      { text: 'El tiempo vuela como si fueran 5 minutos', reaction: '¡Totalmente! Las horas pasan en un parpadeo.' },
      { text: 'Nos reímos de cualquier tontería y somos felices', reaction: '¡Exacto! Nuestras risas son lo más lindo del día.' },
      { text: 'Todo se vuelve más brillante y alegre', reaction: '¡Siii! Tu energía cambia cualquier día nublado.' },
    ],
  },
  {
    title: '¿Cuál es nuestro plan ideal juntos?',
    options: [
      { text: 'Comer algo delicioso y ver series o películas abrazados', reaction: '¡Un clásico insuperable! Plan 10/10.' },
      { text: 'Caminar sin rumbo mientras hablamos de la vida', reaction: '¡Adoro escuchar todo lo que piensas y sueñas!' },
      { text: 'Cualquier lugar del universo mientras sea contigo', reaction: '¡Aww! No importa dónde, sino con quién.' },
    ],
  },
  {
    title: '¿Qué probabilidad hay de que seamos un gran equipo?',
    options: [
      { text: '100% indiscutible y comprobado', reaction: '¡La ciencia y el corazón lo confirman!' },
      { text: 'Infinito por ciento', reaction: '¡No cabe en ninguna calculadora!' },
      { text: 'La mejor pareja que haya existido', reaction: '¡Totalmente de acuerdo sin dudas!' },
    ],
  },
];

export const TriviaStage: React.FC<TriviaStageProps> = ({ onNext, partnerName }) => {
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedReaction, setSelectedReaction] = useState<string | null>(null);
  const [answeredCount, setAnsweredCount] = useState(0);

  const currentQ = QUESTIONS[currentQIndex];
  const isFinished = answeredCount >= QUESTIONS.length;

  const handleSelectOption = (reaction: string) => {
    sound.playChime();
    setSelectedReaction(reaction);

    setTimeout(() => {
      if (currentQIndex + 1 < QUESTIONS.length) {
        setCurrentQIndex((prev) => prev + 1);
        setSelectedReaction(null);
        setAnsweredCount((prev) => prev + 1);
      } else {
        setAnsweredCount(QUESTIONS.length);
      }
    }, 2800);
  };

  return (
    <div className="relative z-10 flex flex-col items-center justify-between min-h-[72vh] px-4 py-3 max-w-xl mx-auto text-center">
      {/* Stage Header */}
      <div className="w-full">
        <div className="label-caps mb-1.5 tracking-widest text-amber-800/80 font-semibold flex items-center justify-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-700" />
          <span>Capítulo II • Desafío 2 de 4</span>
        </div>
        <h2 className="font-display italic text-2xl sm:text-3xl lg:text-4xl font-semibold text-neutral-900 leading-tight">
          ¿Qué tan compatibles somos?
        </h2>
        <p className="font-serif text-sm sm:text-base text-neutral-600 mt-1">
          Pregunta {Math.min(currentQIndex + 1, QUESTIONS.length)} de {QUESTIONS.length}
        </p>

        {/* Compatibility progress indicator */}
        <div className="mt-3 flex items-center justify-center gap-2">
          <Flame className="w-4 h-4 text-amber-600 fill-amber-600" />
          <span className="font-mono text-xs font-semibold text-neutral-700">
            Nivel de Química: {Math.min(100, Math.round(((answeredCount + (selectedReaction ? 1 : 0)) / QUESTIONS.length) * 100))}%
          </span>
        </div>
      </div>

      {/* Main Question Card or Final Result */}
      <div className="w-full my-4">
        {!isFinished ? (
          <motion.div
            key={currentQIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-white/90 backdrop-blur-md rounded-3xl border border-neutral-900/10 p-5 sm:p-6 shadow-sm text-left"
          >
            <h3 className="font-display italic text-lg sm:text-xl text-neutral-900 mb-4 text-center">
              "{currentQ.title}"
            </h3>

            <div className="space-y-2.5">
              {currentQ.options.map((option, idx) => (
                <button
                  key={idx}
                  id={`btn-trivia-option-${currentQIndex}-${idx}`}
                  disabled={selectedReaction !== null}
                  onClick={() => handleSelectOption(option.reaction)}
                  className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-start gap-3 cursor-pointer ${
                    selectedReaction === option.reaction
                      ? 'border-neutral-900 bg-neutral-900 text-white font-medium shadow-sm'
                      : 'border-neutral-200/80 bg-white/90 hover:bg-neutral-50 hover:border-neutral-400 text-neutral-800 shadow-2xs active:scale-[0.99]'
                  }`}
                >
                  <span className={`w-6 h-6 rounded-full text-xs flex items-center justify-center font-mono shrink-0 mt-0.5 ${
                    selectedReaction === option.reaction ? 'bg-white text-neutral-900' : 'bg-neutral-100 text-neutral-700'
                  }`}>
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span className="font-serif text-sm sm:text-base leading-snug">{option.text}</span>
                </button>
              ))}
            </div>

            {/* Reaction popup */}
            <AnimatePresence>
              {selectedReaction && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-3 bg-neutral-900 text-[#fdfcf9] font-serif text-xs sm:text-sm font-medium rounded-xl text-center shadow-md border border-neutral-800"
                >
                  ✨ {selectedReaction}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white/95 backdrop-blur-md rounded-3xl border border-neutral-900/10 p-6 shadow-sm"
          >
            <div className="w-16 h-16 bg-neutral-900/5 text-neutral-800 rounded-full flex items-center justify-center mx-auto mb-3 border border-neutral-900/10">
              <span className="text-3xl">💘</span>
            </div>
            <h3 className="font-display italic text-2xl sm:text-3xl font-semibold text-neutral-900">
              ¡100% Compatibilidad Absoluta!
            </h3>
            <p className="font-serif text-base text-neutral-600 mt-2 max-w-sm mx-auto leading-relaxed">
              Los astros, la química y el destino no se equivocan: {partnerName} y tú son la combinación más perfecta.
            </p>

            <div className="mt-6">
              <button
                id="btn-next-to-photos"
                type="button"
                onClick={() => {
                  sound.playChime();
                  onNext();
                }}
                className="group inline-flex items-center gap-2.5 px-7 py-3.5 bg-neutral-900 text-[#fdfcf9] hover:bg-neutral-800 border border-neutral-900 font-mono text-xs sm:text-sm uppercase tracking-widest transition-all duration-200 shadow-sm cursor-pointer active:scale-[0.98]"
              >
                <span>Ver Nuestro Álbum de Fotos</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </motion.div>
        )}
      </div>

      <div className="pb-2">
        <p className="text-xs text-rose-500 italic">
          Cada respuesta demuestra lo especial que es este vínculo ✨
        </p>
      </div>
    </div>
  );
};
