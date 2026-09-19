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
    <div className="relative z-10 flex flex-col items-center justify-between min-h-[74vh] px-3 sm:px-4 py-3 max-w-5xl mx-auto text-center w-full">
      {/* Header Info */}
      <div className="w-full">
        <div className="flex items-center justify-between flex-wrap gap-2 mb-1.5">
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full bg-rose-100 text-rose-700 border border-rose-200">
            <Sparkles className="w-3.5 h-3.5 text-rose-500" />
            Desafío 3 de 4: Álbum de Recuerdos Mágicos ({totalPhotos} fotografías)
          </span>

          <div className="flex items-center gap-2">
            {!isAllRevealed && (
              <button
                id="btn-reveal-all-photos"
                onClick={handleRevealAll}
                className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition cursor-pointer"
                title="Revelar todas las fotos a la vez"
              >
                <span>Revelar todas</span>
                <Sparkles className="w-3 h-3 text-rose-500" />
              </button>
            )}
          </div>
        </div>

        <h2 className="text-xl sm:text-2xl font-black text-rose-950">
          Nuestros Momentos Inolvidables
        </h2>
        <p className="text-xs sm:text-sm text-rose-700/80 mt-1 max-w-lg mx-auto">
          Toca cada fotografía polaroid para revelarla, dale la vuelta para leer el mensaje secreto y déjale mucho amor ❤️
        </p>

        {/* Progress & Heart Meter Bar */}
        <div className="mt-3 flex items-center justify-center flex-wrap gap-3 sm:gap-4 text-xs font-bold text-rose-800">
          <div className="flex items-center gap-1.5 bg-white/80 px-3 py-1 rounded-full border border-rose-200 shadow-xs">
            <Camera className="w-3.5 h-3.5 text-rose-500" />
            <span>Reveladas: {revealedCount} / {totalPhotos}</span>
          </div>

          <div className="flex items-center gap-1.5 bg-white/80 px-3 py-1 rounded-full border border-rose-200 shadow-xs">
            <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
            <span>Amor entregado: {totalReactions}</span>
          </div>
        </div>
      </div>

      {/* Interactive Polaroid Grid */}
      <div className="w-full my-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 justify-items-center">
        {photos.map((photo, index) => {
          const isRevealed = revealedIds.has(photo.id);
          const isFlipped = flippedIds.has(photo.id);
          const heartCount = reactions[photo.id] || 0;

          // Gentle playful rotation angles for vintage polaroid charm
          const rotations = [-2, 2, -1.5, 2.5, -1, 1.8, -2.2, 1.5, -1.2, 2.2];
          const rotationAngle = rotations[index % rotations.length];

          return (
            <div
              key={photo.id}
              className="relative w-full max-w-[240px] perspective-1000"
              style={{ minHeight: '320px' }}
            >
              {/* Polaroid Frame */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.4 }}
                style={{
                  transform: `rotate(${rotationAngle}deg)`,
                }}
                className="w-full h-full"
              >
                <div
                  className={`w-full h-full bg-white rounded-2xl p-3 pb-4 shadow-lg border border-gray-200/80 transition-all duration-500 flex flex-col justify-between select-none relative ${
                    isRevealed ? 'hover:shadow-xl hover:scale-102' : ''
                  }`}
                >
                  {/* Adhesive tape effect at the top */}
                  <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-16 h-5 bg-amber-100/90 border-t border-b border-amber-200/80 rotate-1 shadow-2xs z-20" />

                  {/* CARD CONTENT */}
                  {!isRevealed ? (
                    /* UNREVEALED MYSTERY STATE */
                    <div
                      id={`polaroid-mystery-${photo.id}`}
                      onClick={(e) => handleReveal(photo, e)}
                      className="w-full h-56 rounded-xl bg-gradient-to-tr from-rose-100 via-pink-100 to-rose-200 border-2 border-dashed border-rose-300 flex flex-col items-center justify-center p-4 text-center cursor-pointer group hover:bg-rose-100 transition-colors"
                    >
                      <div className="w-14 h-14 rounded-full bg-white text-rose-500 flex items-center justify-center shadow-md mb-2 group-hover:scale-110 transition-transform">
                        <Camera className="w-7 h-7" />
                      </div>
                      <span className="text-xs font-bold text-rose-800">
                        {photo.title || `Recuerdo #${index + 1}`}
                      </span>
                      <span className="text-[11px] text-rose-500 font-semibold mt-1 bg-white/80 px-2 py-0.5 rounded-full shadow-2xs animate-pulse">
                        Toca para revelar ✨
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
                            <div className="relative w-full h-44 sm:h-48 rounded-lg overflow-hidden bg-gray-100 border border-gray-100 group">
                              <img
                                src={photo.url}
                                alt={photo.title}
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                              />

                              {/* Zoom button */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setZoomedPhoto(photo);
                                }}
                                className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/40 hover:bg-black/60 text-white backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity"
                                title="Ver en grande"
                              >
                                <ZoomIn className="w-4 h-4" />
                              </button>

                              {/* Location tag badge */}
                              {photo.dateOrLocation && (
                                <div className="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded-md bg-black/50 text-white text-[10px] font-medium backdrop-blur-xs max-w-[90%] truncate">
                                  📍 {photo.dateOrLocation}
                                </div>
                              )}
                            </div>

                            {/* Caption text */}
                            <div className="pt-2 text-left">
                              <h4 className="text-xs font-black text-gray-900 tracking-tight truncate">
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
                            className="w-full h-44 sm:h-48 rounded-lg bg-amber-50/90 border border-amber-200/80 p-3 flex flex-col justify-between text-left overflow-y-auto"
                          >
                            <div>
                              <div className="flex items-center justify-between text-[10px] text-amber-700 font-mono border-b border-amber-200 pb-1 mb-1.5">
                                <span>PARA: {partnerName}</span>
                                <span>💌 NOTA SECRETA</span>
                              </div>
                              <p className="text-xs text-amber-950 font-serif italic leading-relaxed">
                                "{photo.note || 'Un recuerdo lleno de magia a tu lado...'}"
                              </p>
                            </div>

                            <div className="text-[10px] text-right font-bold text-rose-600 pt-1">
                              Siempre en mi corazón ❤️
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Polaroid Interactive Controls */}
                      <div className="pt-2.5 mt-1 border-t border-gray-100 flex items-center justify-between">
                        {/* Flip Button */}
                        <button
                          id={`btn-flip-${photo.id}`}
                          onClick={(e) => handleFlip(photo.id, e)}
                          className="flex items-center gap-1 text-[11px] font-semibold text-gray-600 hover:text-rose-600 px-2 py-1 rounded-lg hover:bg-rose-50 transition cursor-pointer"
                          title={isFlipped ? 'Ver la foto' : 'Leer la nota secreta'}
                        >
                          <RotateCw className="w-3 h-3 text-rose-500" />
                          <span>{isFlipped ? 'Ver Foto' : 'Leer Nota'}</span>
                        </button>

                        {/* Love reaction button with floating counter */}
                        <div className="relative">
                          <button
                            id={`btn-heart-${photo.id}`}
                            onClick={(e) => handleHeartReaction(photo.id, e)}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold transition active:scale-90 cursor-pointer shadow-2xs border border-rose-200/70"
                            title="Darle amor a esta foto"
                          >
                            <Heart className={`w-3.5 h-3.5 ${heartCount > 0 ? 'fill-rose-500 text-rose-500' : 'text-rose-500'}`} />
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
                    <div className="pt-2 text-center text-[10px] font-medium text-rose-400">
                      Toca el recuadro para abrir
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
            className="w-full max-w-md bg-white/95 backdrop-blur-md rounded-2xl border border-rose-200 p-4 shadow-xl flex flex-col items-center gap-3"
          >
            <div className="flex items-center gap-2 text-rose-900 font-bold text-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
              <span>¡Has descubierto todos nuestros momentos juntos!</span>
            </div>

            <button
              id="btn-next-to-chest"
              onClick={() => {
                sound.playChime();
                onNext();
              }}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-600 text-white font-bold text-sm shadow-lg shadow-rose-300 hover:shadow-xl hover:-translate-y-0.5 active:scale-95 transition-all cursor-pointer"
            >
              <span>Continuar al Cofre Secreto</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        ) : (
          <p className="text-xs text-rose-500 italic bg-white/80 px-3.5 py-1.5 rounded-full border border-rose-200/80 shadow-2xs">
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
            className="relative max-w-xl w-full bg-white rounded-3xl p-4 shadow-2xl overflow-hidden text-left"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setZoomedPhoto(null)}
              className="absolute top-3 right-3 p-2 text-gray-500 hover:text-gray-800 rounded-full bg-gray-100 hover:bg-gray-200 z-10 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-full aspect-4/3 rounded-2xl overflow-hidden bg-black/5">
              <img
                src={zoomedPhoto.url}
                alt={zoomedPhoto.title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="pt-3 px-1">
              <h3 className="text-base font-bold text-gray-900">{zoomedPhoto.title}</h3>
              {zoomedPhoto.dateOrLocation && (
                <p className="text-xs text-rose-600 font-medium">📍 {zoomedPhoto.dateOrLocation}</p>
              )}
              <p className="text-xs text-gray-600 italic mt-2 bg-rose-50/60 p-2.5 rounded-xl border border-rose-100">
                "{zoomedPhoto.note}"
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
