import React, { useState } from 'react';
import { X, Heart, Sparkles, Check, Camera, Palette } from 'lucide-react';
import { GameSettings, ColorPalette } from '../types';
import { PALETTES } from '../data/palettes';
import { sound } from '../utils/audio';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: GameSettings;
  onSave: (newSettings: GameSettings) => void;
  onOpenPhotoEditor?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSave,
  onOpenPhotoEditor,
}) => {
  const [partnerName, setPartnerName] = useState(settings.partnerName);
  const [proposerName, setProposerName] = useState(settings.proposerName);
  const [questionType, setQuestionType] = useState(settings.questionType);
  const [customQuestion, setCustomQuestion] = useState(settings.customQuestion);
  const [customReason, setCustomReason] = useState(settings.customReason);
  const [palette, setPalette] = useState<ColorPalette>(settings.palette || 'rose');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playChime();
    onSave({
      partnerName: partnerName.trim() || 'Mi Amor',
      proposerName: proposerName.trim() || 'Yo',
      questionType,
      customQuestion: customQuestion.trim() || '¿Quieres ser mi pareja?',
      customReason: customReason.trim(),
      photos: settings.photos,
      palette,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
      <div 
        className="relative w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-rose-100 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          id="btn-close-settings"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
          aria-label="Cerrar modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 bg-rose-100 text-rose-600 rounded-2xl">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Personalizar Propuesta</h2>
            <p className="text-xs text-gray-500">Configura nombres, colores y detalles</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Paleta de Colores */}
          <div>
            <label className="flex items-center gap-1.5 font-bold text-gray-800 mb-2">
              <Palette className="w-3.5 h-3.5 text-rose-500" />
              <span>Paleta de Colores y Estilo:</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {PALETTES.map((p) => {
                const isSelected = palette === p.id;
                return (
                  <button
                    type="button"
                    key={p.id}
                    onClick={() => {
                      sound.playPop();
                      setPalette(p.id);
                    }}
                    className={`flex items-center gap-2 p-2 rounded-xl border text-left transition cursor-pointer ${
                      isSelected
                        ? 'border-rose-500 bg-rose-50/80 shadow-xs'
                        : 'border-gray-200 bg-white hover:border-rose-200 hover:bg-gray-50'
                    }`}
                  >
                    <span
                      className="w-5 h-5 rounded-full flex items-center justify-center text-xs shrink-0 shadow-2xs"
                      style={{ backgroundColor: `${p.previewColor}30`, border: `2px solid ${p.previewColor}` }}
                    >
                      {p.emoji}
                    </span>
                    <div className="truncate flex-1">
                      <p className="font-bold text-gray-900 truncate">{p.name.split(' ')[0]}</p>
                      <p className="text-[10px] text-gray-500 truncate">{p.badgeText}</p>
                    </div>
                    {isSelected && (
                      <Check className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label htmlFor="input-partner-name" className="block font-semibold text-gray-700 mb-1">
              Nombre de tu pareja (o apodo cariñoso):
            </label>
            <input
              id="input-partner-name"
              type="text"
              value={partnerName}
              onChange={(e) => setPartnerName(e.target.value)}
              placeholder="Ej: Sofía, Mi Vida, Gordita..."
              className="w-full px-3.5 py-2 rounded-xl border border-rose-200 focus:outline-none focus:ring-2 focus:ring-rose-400"
              maxLength={30}
            />
          </div>

          <div>
            <label htmlFor="input-proposer-name" className="block font-semibold text-gray-700 mb-1">
              Tu nombre o firma:
            </label>
            <input
              id="input-proposer-name"
              type="text"
              value={proposerName}
              onChange={(e) => setProposerName(e.target.value)}
              placeholder="Ej: Mateo, Tu Príncipe..."
              className="w-full px-3.5 py-2 rounded-xl border border-rose-200 focus:outline-none focus:ring-2 focus:ring-rose-400"
              maxLength={30}
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1.5">
              Tipo de pregunta final:
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setQuestionType('novia');
                  setCustomQuestion('¿Quieres ser mi novia?');
                }}
                className={`py-2 px-3 rounded-xl border font-medium transition cursor-pointer text-center ${
                  questionType === 'novia'
                    ? 'border-rose-500 bg-rose-50 text-rose-700 shadow-xs'
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                👰 Novia
              </button>
              <button
                type="button"
                onClick={() => {
                  setQuestionType('novio');
                  setCustomQuestion('¿Quieres ser mi novio?');
                }}
                className={`py-2 px-3 rounded-xl border font-medium transition cursor-pointer text-center ${
                  questionType === 'novio'
                    ? 'border-rose-500 bg-rose-50 text-rose-700 shadow-xs'
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                🤵 Novio
              </button>
              <button
                type="button"
                onClick={() => {
                  setQuestionType('pareja');
                  setCustomQuestion('¿Quieres ser mi pareja?');
                }}
                className={`py-2 px-3 rounded-xl border font-medium transition cursor-pointer text-center ${
                  questionType === 'pareja'
                    ? 'border-rose-500 bg-rose-50 text-rose-700 shadow-xs'
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                💞 Pareja
              </button>
              <button
                type="button"
                onClick={() => setQuestionType('custom')}
                className={`py-2 px-3 rounded-xl border font-medium transition cursor-pointer text-center ${
                  questionType === 'custom'
                    ? 'border-rose-500 bg-rose-50 text-rose-700 shadow-xs'
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                ✍️ Personalizado
              </button>
            </div>
          </div>

          {questionType === 'custom' && (
            <div>
              <label htmlFor="input-custom-question" className="block font-semibold text-gray-700 mb-1">
                Escribe tu pregunta especial:
              </label>
              <input
                id="input-custom-question"
                type="text"
                value={customQuestion}
                onChange={(e) => setCustomQuestion(e.target.value)}
                placeholder="¿Quieres dar este gran paso juntos?"
                className="w-full px-3.5 py-2 rounded-xl border border-rose-200 focus:outline-none focus:ring-2 focus:ring-rose-400"
                maxLength={60}
              />
            </div>
          )}

          <div>
            <label htmlFor="input-custom-reason" className="block font-semibold text-gray-700 mb-1">
              Mensaje o dedicatoria inicial (opcional):
            </label>
            <textarea
              id="input-custom-reason"
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              placeholder="Ej: Desde el día que te conocí supe que eras la persona más especial del mundo..."
              rows={3}
              className="w-full px-3.5 py-2 rounded-xl border border-rose-200 focus:outline-none focus:ring-2 focus:ring-rose-400 resize-none"
              maxLength={200}
            />
          </div>

          {/* Photos Management Shortcut */}
          <div className="bg-rose-50/70 border border-rose-200/80 rounded-2xl p-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-rose-200/70 text-rose-700 rounded-xl">
                <Camera className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-rose-950">Álbum de Recuerdos</p>
                <p className="text-[11px] text-rose-600">{settings.photos?.length || 7} fotografías guardadas</p>
              </div>
            </div>
            {onOpenPhotoEditor && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenPhotoEditor();
                }}
                className="px-3 py-1.5 rounded-xl bg-white text-rose-700 text-xs font-bold border border-rose-200 hover:bg-rose-50 shadow-2xs transition cursor-pointer"
              >
                Subir Fotos 📸
              </button>
            )}
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              id="btn-save-settings"
              className="flex items-center gap-1.5 px-5 py-2.5 text-xs font-semibold text-white bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 rounded-xl shadow-md hover:shadow-lg transition cursor-pointer active:scale-95"
            >
              <Check className="w-4 h-4" />
              Guardar y Continuar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
