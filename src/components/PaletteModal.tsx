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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div
        className="relative w-full max-w-md bg-[#fdfcf9] rounded-2xl p-5 sm:p-6 shadow-2xl border border-neutral-900/20 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-900/10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-neutral-900 text-amber-200 rounded-xl">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display italic text-xl font-semibold text-neutral-900">Paleta de Color</h2>
              <p className="font-serif text-xs text-neutral-500">Selecciona la atmósfera estética</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded-full hover:bg-neutral-100 transition cursor-pointer"
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
                type="button"
                onClick={() => {
                  sound.playPop();
                  onSelectPalette(p.id);
                }}
                className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
                  isSelected
                    ? 'border-neutral-900 bg-neutral-900/5 shadow-xs'
                    : 'border-neutral-200 bg-white hover:border-neutral-400 hover:bg-neutral-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Color Swatch Circle */}
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shadow-2xs shrink-0"
                    style={{ backgroundColor: `${p.previewColor}20`, border: `1.5px solid ${p.previewColor}` }}
                  >
                    <span>{p.emoji}</span>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-display italic text-base font-semibold text-neutral-900">{p.name}</span>
                      <span className="text-xs">{p.heartSymbol}</span>
                    </div>
                    <p className="font-mono text-[10px] uppercase tracking-wider text-neutral-500">{p.subtitle}</p>
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
                    <div className="w-6 h-6 rounded-full bg-neutral-900 text-[#fdfcf9] flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5 stroke-3" />
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-full border border-neutral-300 shrink-0" />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-neutral-900/10 flex items-center justify-between text-xs font-mono text-neutral-500">
          <span className="flex items-center gap-1 text-[10px] uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-amber-700" />
            Aplicado en tiempo real
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-neutral-900 text-[#fdfcf9] font-mono text-xs uppercase tracking-widest hover:bg-neutral-800 transition cursor-pointer border border-neutral-900"
          >
            Listo
          </button>
        </div>
      </div>
    </div>
  );
};
