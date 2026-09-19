import React from 'react';
import { X, Palette, Check, Sparkles } from 'lucide-react';
import { ColorPalette } from '../types';
import { PALETTES } from '../data/palettes';
import { sound } from '../utils/audio';

interface PaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  activePalette: ColorPalette;
  onSelectPalette: (palette: ColorPalette) => void;
}

export const PaletteModal: React.FC<PaletteModalProps> = ({
  isOpen,
  onClose,
  activePalette,
  onSelectPalette,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div
        className="relative w-full max-w-md bg-white rounded-3xl p-5 sm:p-6 shadow-2xl border border-rose-200 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-rose-100">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-rose-100 text-rose-600 rounded-2xl">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Paleta de Colores</h2>
              <p className="text-xs text-gray-500">Elige el ambiente romántico que más te guste</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Palettes List */}
        <div className="py-4 space-y-2.5 overflow-y-auto">
          {PALETTES.map((p) => {
            const isSelected = activePalette === p.id;
            return (
              <button
                key={p.id}
                onClick={() => {
                  sound.playPop();
                  onSelectPalette(p.id);
                }}
                className={`w-full text-left p-3.5 rounded-2xl border-2 transition-all flex items-center justify-between cursor-pointer ${
                  isSelected
                    ? 'border-rose-500 bg-rose-50/70 shadow-sm'
                    : 'border-gray-200/80 bg-white hover:border-rose-300 hover:bg-gray-50/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Color Swatch Circle */}
                  <div
                    className="w-10 h-10 rounded-2xl flex items-center justify-center text-lg shadow-xs shrink-0"
                    style={{ backgroundColor: `${p.previewColor}20`, border: `2px solid ${p.previewColor}` }}
                  >
                    <span>{p.emoji}</span>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs sm:text-sm font-bold text-gray-900">{p.name}</span>
                      <span className="text-xs">{p.heartSymbol}</span>
                    </div>
                    <p className="text-[11px] text-gray-500">{p.subtitle}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {/* Mini Palette Dots */}
                  <div className="flex -space-x-1">
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-white shadow-2xs"
                      style={{ backgroundColor: p.previewColor }}
                    />
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-white shadow-2xs opacity-75"
                      style={{ backgroundColor: p.previewColor }}
                    />
                  </div>

                  {isSelected ? (
                    <div className="w-6 h-6 rounded-full bg-rose-500 text-white flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5 stroke-3" />
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-full border-2 border-gray-300 shrink-0" />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-rose-100 flex items-center justify-between text-xs text-gray-500">
          <span className="flex items-center gap-1 text-[11px]">
            <Sparkles className="w-3.5 h-3.5 text-rose-500" />
            Se aplica instantáneamente a todo el juego
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 text-white font-semibold shadow-xs hover:shadow-md transition cursor-pointer"
          >
            Listo
          </button>
        </div>
      </div>
    </div>
  );
};
