import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { Sparkles, Heart, ArrowRight, RotateCw, CheckCircle2, Camera, Image as ImageIcon, ZoomIn, X } from 'lucide-react';
import { PhotoMemory } from '../../types';
import { sound } from '../../utils/audio';

interface PhotosStageProps {
  photos: PhotoMemory[];
  onNext: () => void;
  partnerName: string;
  onOpenPhotoEditor: () => void;
}

export const PhotosStage: React.FC<PhotosStageProps> = ({
  photos,
  onNext,
  partnerName,
  onOpenPhotoEditor,
}) => {
  // Track which photos are revealed (by id)
  const [revealedIds, setRevealedIds] = useState<Set<string>>(new Set());
  // Track which photos are flipped to the back (by id)
  const [flippedIds, setFlippedIds] = useState<Set<string>>(new Set());
  // Track total love reactions
  const [reactions, setReactions] = useState<{ [id: string]: number }>({});
  // Floating heart particles when reacting
  const [floatingHearts, setFloatingHearts] = useState<{ id: number; photoId: string }[]>([]);
  // Zoomed photo modal
  const [zoomedPhoto, setZoomedPhoto] = useState<PhotoMemory | null>(null);

  const totalPhotos = photos.length;
  const revealedCount = revealedIds.size;
  const isAllRevealed = revealedCount >= totalPhotos;

  // Reveal a photo
  const handleReveal = (photo: PhotoMemory, e: React.MouseEvent) => {
    e.stopPropagation();
    sound.playShutter();
    setRevealedIds((prev) => new Set(prev).add(photo.id));

    // Little confetti pop on reveal
    confetti({
      particleCount: 35,
      spread: 60,
      origin: { y: 0.7, x: 0.5 },
      colors: ['#fb7185', '#fda4af', '#f43f5e', '#fef08a'],
    });
  };

  // Flip card between photo and handwritten note
  const handleFlip = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    sound.playFlip();
    setFlippedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Send love reaction
  const handleHeartReaction = (photoId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const currentHeartCount = reactions[photoId] || 0;
    sound.playPop(1 + Math.min(0.8, currentHeartCount * 0.1));

    setReactions((prev) => ({
      ...prev,
      [photoId]: (prev[photoId] || 0) + 1,
    }));

    // Spawn floating heart
    const heartKey = Date.now();
    setFloatingHearts((prev) => [...prev, { id: heartKey, photoId }]);
    setTimeout(() => {
      setFloatingHearts((prev) => prev.filter((h) => h.id !== heartKey));
    }, 1000);
  };

  const totalReactions = Object.values(reactions).reduce((acc, val) => acc + val, 0);

  const handleRevealAll = () => {
    sound.playShutter();
    const allIds = new Set(photos.map((p) => p.id));
    setRevealedIds(allIds);
    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.6, x: 0.5 },
      colors: ['#fb7185', '#fda4af', '#f43f5e', '#fef08a'],
    });
  };

  return (
    <div className="relative z-10 flex flex-col items-center justify-between min-h-[74vh] px-3 sm:px-6 py-4 max-w-5xl mx-auto text-center w-full">
      {/* Header Info */}
      <div className="w-full max-w-2xl mx-auto">
        <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
          <div className="label-caps tracking-widest text-amber-800/80 font-semibold flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-700" />
            <span>Capítulo III • Desafío 3 de 4</span>
          </div>

          <div className="flex items-center gap-2">
            {!isAllRevealed && (
              <button
                id="btn-reveal-all-photos"
                type="button"
                onClick={handleRevealAll}
                className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider px-3 py-1 bg-white hover:bg-neutral-50 text-neutral-800 border border-neutral-300 transition cursor-pointer shadow-2xs"
                title="Revelar todas las fotos a la vez"
              >
                <span>Revelar todas</span>
                <Sparkles className="w-3 h-3 text-amber-600" />
              </button>
            )}
          </div>
        </div>

        <h2 className="font-display italic text-2xl sm:text-3xl lg:text-4xl font-semibold text-neutral-900 leading-tight">
          Nuestros Recuerdos Inolvidables
        </h2>
        <p className="font-serif text-sm sm:text-base text-neutral-600 mt-1.5 max-w-lg mx-auto">
          Toca cada fotografía polaroid para revelarla, dale la vuelta para leer su mensaje secreto y déjale mucho amor.
        </p>

        {/* Progress & Heart Meter Bar */}
        <div className="mt-3 flex items-center justify-center flex-wrap gap-2.5 sm:gap-3 text-xs font-mono">
          <div className="flex items-center gap-1.5 bg-neutral-900/5 px-3 py-1 rounded-full border border-neutral-900/10 text-neutral-800">
            <Camera className="w-3.5 h-3.5 text-neutral-700" />
            <span>REVELADAS: {revealedCount} / {totalPhotos}</span>
          </div>

          <div className="flex items-center gap-1.5 bg-neutral-900/5 px-3 py-1 rounded-full border border-neutral-900/10 text-neutral-800">
            <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
            <span>AMOR: {totalReactions}</span>
          </div>
        </div>
      </div>

      {/* Interactive Polaroid Grid */}
      <div className="w-full my-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6 justify-items-center">
        {photos.map((photo, index) => {
          const isRevealed = revealedIds.has(photo.id);
          const isFlipped = flippedIds.has(photo.id);
          const heartCount = reactions[photo.id] || 0;

          // Gentle playful rotation angles for vintage polaroid charm
          const rotations = [-1.5, 1.5, -1, 2, -1.8, 1.2, -2, 1.8, -1.2, 1.5];
          const rotationAngle = rotations[index % rotations.length];

          return (
            <div
              key={photo.id}
              className="relative w-full max-w-[240px] perspective-1000"
              style={{ minHeight: '330px' }}
            >
              {/* Polaroid Frame */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08, duration: 0.4 }}
                style={{
                  transform: `rotate(${rotationAngle}deg)`,
                }}
                className="w-full h-full"
              >
                <div
                  className={`w-full h-full bg-[#fdfcf9] rounded-xl p-3 pb-4 shadow-sm border border-neutral-900/15 transition-all duration-300 flex flex-col justify-between select-none relative ${
                    isRevealed ? 'hover:shadow-md hover:scale-[1.02]' : ''
                  }`}
                >
                  {/* Washi tape effect at the top */}
                  <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-16 h-4 bg-[#e8dfcf] border-t border-b border-neutral-300/60 rotate-1 shadow-2xs z-20" />

                  {/* CARD CONTENT */}
                  {!isRevealed ? (
                    /* UNREVEALED MYSTERY STATE */
                    <div
                      id={`polaroid-mystery-${photo.id}`}
                      onClick={(e) => handleReveal(photo, e)}
                      className="w-full h-56 rounded-lg bg-neutral-900/[0.03] border border-dashed border-neutral-900/20 flex flex-col items-center justify-center p-4 text-center cursor-pointer group hover:bg-neutral-900/[0.06] transition-colors"
                    >
                      <div className="w-12 h-12 rounded-full bg-white text-neutral-800 border border-neutral-900/10 flex items-center justify-center shadow-xs mb-2 group-hover:scale-105 transition-transform">
                        <Camera className="w-5 h-5 text-neutral-700" />
                      </div>
                      <span className="font-mono text-xs font-semibold text-neutral-900">
                        {photo.title || `Recuerdo #${index + 1}`}
                      </span>
                      <span className="font-mono text-[10px] text-neutral-600 uppercase tracking-wider mt-1.5 bg-white px-2 py-0.5 rounded-full border border-neutral-200 shadow-2xs">
                        Tocar para revelar ✨
                      </span>
                    </div>
                  ) : (
                    /* REVEALED CARD (FRONT OR BACK) */
                    <div className="w-full flex-1 flex flex-col justify-between">
                      <AnimatePresence mode="wait">
                        {!isFlipped ? (
                          /* FRONT OF POLAROID */
                          <motion.div
                            key="front"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col"
                          >
                            <div className="relative w-full h-44 sm:h-48 rounded-md overflow-hidden bg-neutral-100 border border-neutral-900/10 group">
                              <img
                                src={photo.url}
                                alt={photo.title}
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                              />

                              {/* Zoom button */}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setZoomedPhoto(photo);
                                }}
                                className="absolute top-2 right-2 p-1.5 rounded-md bg-neutral-900/60 hover:bg-neutral-900 text-white backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                title="Ver en grande"
                              >
                                <ZoomIn className="w-3.5 h-3.5" />
                              </button>

                              {/* Location tag badge */}
                              {photo.dateOrLocation && (
                                <div className="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded bg-neutral-900/70 text-white font-mono text-[9px] uppercase tracking-wider backdrop-blur-xs max-w-[90%] truncate">
                                  📍 {photo.dateOrLocation}
                                </div>
                              )}
                            </div>

                            {/* Caption text */}
                            <div className="pt-2 text-left">
                              <h4 className="font-display italic text-sm font-semibold text-neutral-900 tracking-tight truncate">
                                {photo.title}
                              </h4>
                            </div>
                          </motion.div>
                        ) : (
                          /* BACK OF POLAROID (HANDWRITTEN LOVE NOTE) */
                          <motion.div
                            key="back"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="w-full h-44 sm:h-48 rounded-md bg-[#faf7ef] border border-neutral-900/10 p-3 flex flex-col justify-between text-left overflow-y-auto"
                          >
                            <div>
                              <div className="flex items-center justify-between text-[9px] text-neutral-500 font-mono uppercase tracking-widest border-b border-neutral-900/10 pb-1 mb-1.5">
                                <span>DE: MI CORAZÓN</span>
                                <span>PARA: {partnerName}</span>
                              </div>
                              <p className="font-serif italic text-xs text-neutral-800 leading-relaxed">
                                "{photo.note || 'Un recuerdo lleno de magia a tu lado...'}"
                              </p>
                            </div>

                            <div className="font-mono text-[9px] text-right uppercase tracking-wider text-neutral-500 pt-1">
                              Siempre en mi corazón ❤️
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Polaroid Interactive Controls */}
                      <div className="pt-2.5 mt-1 border-t border-neutral-900/10 flex items-center justify-between">
                        {/* Flip Button */}
                        <button
                          id={`btn-flip-${photo.id}`}
                          type="button"
                          onClick={(e) => handleFlip(photo.id, e)}
                          className="flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider text-neutral-600 hover:text-neutral-900 px-2 py-1 rounded hover:bg-neutral-100 transition cursor-pointer"
                          title={isFlipped ? 'Ver la foto' : 'Leer la nota secreta'}
                        >
                          <RotateCw className="w-3 h-3 text-neutral-500" />
                          <span>{isFlipped ? 'Foto' : 'Nota'}</span>
                        </button>

                        {/* Love reaction button with floating counter */}
                        <div className="relative">
                          <button
                            id={`btn-heart-${photo.id}`}
                            type="button"
                            onClick={(e) => handleHeartReaction(photo.id, e)}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-neutral-900/5 hover:bg-neutral-900/10 text-neutral-800 font-mono text-[11px] font-medium transition active:scale-90 cursor-pointer border border-neutral-900/10"
                            title="Darle amor a esta foto"
                          >
                            <Heart className={`w-3 h-3 ${heartCount > 0 ? 'fill-rose-500 text-rose-500' : 'text-neutral-500'}`} />
                            <span>{heartCount > 0 ? heartCount : '+1'}</span>
                          </button>

                          {/* Floating hearts animation */}
                          {floatingHearts
                            .filter((h) => h.photoId === photo.id)
                            .map((h) => (
                              <motion.span
                                key={h.id}
                                initial={{ y: 0, opacity: 1, scale: 0.8 }}
                                animate={{ y: -35, opacity: 0, scale: 1.4 }}
                                transition={{ duration: 0.8 }}
                                className="absolute -top-3 left-2 pointer-events-none text-xs"
                              >
                                💖
                              </motion.span>
                            ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Mystery label on bottom if not revealed */}
                  {!isRevealed && (
                    <div className="pt-2 text-center font-mono text-[9px] uppercase tracking-widest text-neutral-400">
                      Tocar recuadro
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          );
        })}
      </div>

      {/* Completion Banner & Next Stage Navigation */}
      <div className="w-full flex flex-col items-center justify-center pb-2">
        {isAllRevealed ? (
          <motion.div
            initial={{ y: 15, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            className="w-full max-w-md bg-[#fdfcf9] backdrop-blur-md rounded-2xl border border-neutral-900/15 p-5 shadow-md flex flex-col items-center gap-3"
          >
            <div className="flex items-center gap-2 text-neutral-900 font-display italic text-lg sm:text-xl">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>¡Has descubierto todos nuestros momentos!</span>
            </div>

            <button
              id="btn-next-to-chest"
              type="button"
              onClick={() => {
                sound.playChime();
                onNext();
              }}
              className="group inline-flex items-center gap-2.5 px-8 py-3.5 bg-neutral-900 text-[#fdfcf9] hover:bg-neutral-800 border border-neutral-900 font-mono text-xs sm:text-sm uppercase tracking-widest transition-all duration-200 shadow-sm cursor-pointer active:scale-[0.98]"
            >
              <span>Continuar al Cofre Secreto</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        ) : (
          <p className="font-mono text-xs text-neutral-500 tracking-wider bg-white/90 px-4 py-1.5 rounded-full border border-neutral-200 shadow-2xs">
            Revela todas las fotos ({revealedCount}/{totalPhotos}) para abrir el siguiente desafío 🎁
          </p>
        )}
      </div>

      {/* Fullscreen Lightbox Zoom Modal */}
      {zoomedPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
          onClick={() => setZoomedPhoto(null)}
        >
          <div
            className="relative max-w-xl w-full bg-[#fdfcf9] rounded-2xl p-4 shadow-2xl overflow-hidden text-left border border-neutral-900/20"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setZoomedPhoto(null)}
              className="absolute top-3 right-3 p-2 text-neutral-600 hover:text-neutral-950 rounded-full bg-neutral-100 hover:bg-neutral-200 z-10 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-full aspect-4/3 rounded-lg overflow-hidden bg-neutral-950">
              <img
                src={zoomedPhoto.url}
                alt={zoomedPhoto.title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="pt-3.5 px-1">
              <h3 className="font-display italic text-xl font-semibold text-neutral-900">{zoomedPhoto.title}</h3>
              {zoomedPhoto.dateOrLocation && (
                <p className="font-mono text-xs uppercase tracking-wider text-neutral-500 mt-0.5">📍 {zoomedPhoto.dateOrLocation}</p>
              )}
              <p className="font-serif italic text-sm text-neutral-700 mt-2.5 bg-neutral-900/5 p-3 rounded-xl border border-neutral-900/10">
                "{zoomedPhoto.note}"
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
