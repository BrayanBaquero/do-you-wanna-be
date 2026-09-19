import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Sparkles, RotateCcw, Palette, Share2, Music } from 'lucide-react';
import { GameStage, GameSettings } from '../types';
import { PALETTES } from '../data/palettes';
import { sound } from '../utils/audio';

interface HeaderProps {
  currentStage: GameStage;
  settings: GameSettings;
  onOpenSettings: () => void;
  onOpenPalette: () => void;
  onOpenShare?: () => void;
  onReset: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  isCloudSynced?: boolean;
}

const STAGES_ORDER: { id: GameStage; label: string; chapter: string; step: number }[] = [
  { id: 'intro', label: 'Prólogo', chapter: 'Capítulo I', step: 0 },
  { id: 'hearts', label: 'Corazones', chapter: 'Capítulo I', step: 1 },
  { id: 'trivia', label: 'Test del Destino', chapter: 'Capítulo II', step: 2 },
  { id: 'photos', label: 'Nuestras Fotos', chapter: 'Capítulo III', step: 3 },
  { id: 'chest', label: 'El Cofre', chapter: 'Capítulo IV', step: 4 },
  { id: 'proposal', label: 'La Pregunta', chapter: 'Clímax', step: 5 },
  { id: 'success', label: 'Para Siempre', chapter: 'Epílogo', step: 6 },
];

export const Header: React.FC<HeaderProps> = ({
  currentStage,
  settings,
  onOpenSettings,
  onOpenPalette,
  onOpenShare,
  onReset,
  isMuted,
  onToggleMute,
  isCloudSynced = true,
}) => {
  const currentInfo = STAGES_ORDER.find((s) => s.id === currentStage) || STAGES_ORDER[0];
  const currentStep = currentInfo.step;
  const partnerGreeting = settings.partnerName ? `Para: ${settings.partnerName}` : 'Para Ti';
  const activePalette = PALETTES.find((p) => p.id === settings.palette) || PALETTES[0];

  const [isPlayingMusic, setIsPlayingMusic] = useState<boolean>(sound.isPlayingMusic);

  useEffect(() => {
    setIsPlayingMusic(sound.isPlayingMusic);
    const unsub = sound.subscribe(() => {
      setIsPlayingMusic(sound.isPlayingMusic);
    });
    return unsub;
  }, []);

  return (
    <header className="relative z-20 w-full max-w-5xl mx-auto px-4 sm:px-6 pt-5 pb-3 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-4">
        {/* Editorial Left Header */}
        <div className="max-w-md">
          <div className="label-caps mb-1 tracking-widest text-[10px] sm:text-xs">
            {currentInfo.chapter} • {currentInfo.label}
          </div>
          <h1 className="font-display italic text-2xl sm:text-3xl font-semibold text-neutral-900 tracking-tight leading-none mb-1.5">
            Nuestra Historia
          </h1>
          <div className="inline-flex items-center gap-1.5 font-mono text-[11px] sm:text-xs px-2.5 py-0.5 rounded-full bg-neutral-900/5 text-neutral-800 border border-neutral-900/10 select-none">
            <span>{partnerGreeting}</span>
            {isCloudSynced && (
              <span title="Sincronizado en la nube" className="text-[10px] opacity-75">
                ☁️
              </span>
            )}
          </div>
        </div>

        {/* Editorial Toolbar */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Palette button */}
          <button
            id="btn-palette-toggle"
            type="button"
            onClick={onOpenPalette}
            className="btn-circle text-base sm:text-lg"
            title="Cambiar paleta de color"
          >
            <span>{activePalette.emoji}</span>
          </button>

          {/* Settings button */}
          <button
            id="btn-settings-toggle"
            type="button"
            onClick={onOpenSettings}
            className="btn-circle text-neutral-700"
            title="Personalizar propuesta"
          >
            <Sparkles className="w-4 h-4" />
          </button>

          {/* Share Pill Button */}
          {onOpenShare && (
            <button
              id="btn-share-toggle"
              type="button"
              onClick={onOpenShare}
              className="btn-pill-editorial shadow-xs"
              title="Compartir enlace"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Compartir</span>
            </button>
          )}

          {/* Background Music Toggle */}
          {Boolean(settings.customAudioUrl && settings.backgroundMusicEnabled !== false) && (
            <button
              id="btn-music-toggle"
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                sound.toggleMusic();
              }}
              className={`btn-circle ${
                isPlayingMusic
                  ? 'bg-neutral-900 text-amber-200 border-neutral-900 ring-2 ring-amber-300/40'
                  : 'text-neutral-700'
              }`}
              title={isPlayingMusic ? 'Pausar música de fondo' : 'Reproducir música de fondo'}
              aria-label="Toggle música de fondo"
            >
              <Music className={`w-4 h-4 ${isPlayingMusic ? 'animate-bounce' : ''}`} />
            </button>
          )}

          {/* Sound FX Toggle */}
          <button
            id="btn-sound-toggle"
            type="button"
            onClick={() => {
              onToggleMute();
              if (isMuted) {
                sound.playPop();
              }
            }}
            className="btn-circle text-neutral-700"
            title={isMuted ? 'Activar sonido' : 'Silenciar'}
            aria-label="Toggle sonido"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-neutral-400" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Restart Button */}
          {currentStage !== 'intro' && (
            <button
              id="btn-restart-game"
              type="button"
              onClick={onReset}
              className="btn-circle text-neutral-600"
              title="Volver al inicio"
              aria-label="Reiniciar juego"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Editorial Progress Line (visible during active stages) */}
      {currentStage !== 'intro' && (
        <div className="w-full bg-neutral-900/10 h-1 rounded-full overflow-hidden">
          <div
            className="h-full bg-neutral-900 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, (currentStep / 5) * 100)}%` }}
          />
        </div>
      )}
    </header>
  );
};
