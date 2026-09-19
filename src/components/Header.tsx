import React from 'react';
import { Volume2, VolumeX, Sparkles, RotateCcw, Palette, Share2 } from 'lucide-react';
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

const STAGES_ORDER: { id: GameStage; label: string; step: number }[] = [
  { id: 'intro', label: 'Inicio', step: 0 },
  { id: 'hearts', label: 'Corazones', step: 1 },
  { id: 'trivia', label: 'Test del Destino', step: 2 },
  { id: 'photos', label: 'Nuestras Fotos', step: 3 },
  { id: 'chest', label: 'El Cofre', step: 4 },
  { id: 'proposal', label: 'La Pregunta', step: 5 },
  { id: 'success', label: '¡Para Siempre!', step: 6 },
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
  const currentStep = STAGES_ORDER.find((s) => s.id === currentStage)?.step ?? 0;
  const partnerGreeting = settings.partnerName ? `Para: ${settings.partnerName}` : 'Una sorpresa especial';
  const activePalette = PALETTES.find((p) => p.id === settings.palette) || PALETTES[0];

  return (
    <header className="relative z-20 w-full max-w-4xl mx-auto px-4 pt-4 pb-2 flex flex-col gap-2.5">
      <div className="flex items-center justify-between">
        {/* Brand / Title */}
        <div className="flex items-center gap-2">
          <span className="text-2xl animate-pulse">💌</span>
          <div>
            <h1 className="text-sm md:text-base font-bold text-rose-900 tracking-tight flex items-center gap-1.5 flex-wrap">
              <span>Nuestra Historia</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 font-medium">
                {partnerGreeting}
              </span>
              <span
                title="Sincronizado permanentemente en la nube con Firebase"
                className="inline-flex items-center text-xs px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 select-none"
              >
                <span>☁️</span>
              </span>
            </h1>
            <p className="text-[11px] text-rose-500 font-medium">Un juego con mucho amor</p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Quick Palette Switcher button */}
          <button
            id="btn-palette-toggle"
            onClick={onOpenPalette}
            className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-xl bg-white/90 hover:bg-rose-50 text-rose-700 border border-rose-200 shadow-xs transition-all active:scale-95 cursor-pointer"
            title="Cambiar paleta de colores"
          >
            <Palette className="w-3.5 h-3.5 text-rose-500" />
            <span className="text-xs">{activePalette.emoji}</span>
          </button>

          <button
            id="btn-settings-toggle"
            onClick={onOpenSettings}
            className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-xl bg-white/90 hover:bg-rose-50 text-rose-700 border border-rose-200 shadow-xs transition-all active:scale-95 cursor-pointer"
            title="Personalizar nombres y mensaje"
          >
            <Sparkles className="w-3.5 h-3.5 text-rose-500" />
          </button>

          {onOpenShare && (
            <button
              id="btn-share-toggle"
              onClick={onOpenShare}
              className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-medium shadow-xs transition-all active:scale-95 cursor-pointer"
              title="Compartir enlace para abrir en otro celular o dispositivo"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Compartir</span>
            </button>
          )}

          <button
            id="btn-sound-toggle"
            onClick={() => {
              onToggleMute();
              if (isMuted) {
                sound.playPop();
              }
            }}
            className="p-1.5 rounded-xl bg-white/90 hover:bg-rose-50 text-rose-700 border border-rose-200 shadow-xs transition-all active:scale-95 cursor-pointer"
            title={isMuted ? 'Activar sonido' : 'Silenciar sonido'}
            aria-label="Toggle sonido"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-rose-600" />}
          </button>

          {currentStage !== 'intro' && (
            <button
              id="btn-restart-game"
              onClick={onReset}
              className="p-1.5 rounded-xl bg-white/90 hover:bg-rose-50 text-rose-600 border border-rose-200 shadow-xs transition-all active:scale-95 cursor-pointer"
              title="Reiniciar juego"
              aria-label="Reiniciar juego"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Progress Bar (visible during active stages) */}
      {currentStage !== 'intro' && (
        <div className="w-full bg-rose-100/80 rounded-full h-2 p-0.5 overflow-hidden shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-rose-400 to-pink-500 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, (currentStep / 5) * 100)}%` }}
          />
        </div>
      )}
    </header>
  );
};
