import React, { useState, useRef, useEffect } from 'react';
import { X, Heart, Sparkles, Check, Camera, Palette, Music, UploadCloud, Play, Pause, Trash2, Volume2 } from 'lucide-react';
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

  // Background Audio State
  const [customAudioUrl, setCustomAudioUrl] = useState<string | undefined>(settings.customAudioUrl);
  const [customAudioName, setCustomAudioName] = useState<string | undefined>(settings.customAudioName);
  const [customAudioVolume, setCustomAudioVolume] = useState<number>(settings.customAudioVolume ?? 0.5);
  const [backgroundMusicEnabled, setBackgroundMusicEnabled] = useState<boolean>(settings.backgroundMusicEnabled !== false);
  const [isPreviewPlaying, setIsPreviewPlaying] = useState<boolean>(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [isDraggingAudio, setIsDraggingAudio] = useState<boolean>(false);

  const previewAudioRef = useRef<HTMLAudioElement | null>(null);
  const audioInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setPartnerName(settings.partnerName);
    setProposerName(settings.proposerName);
    setQuestionType(settings.questionType);
    setCustomQuestion(settings.customQuestion);
    setCustomReason(settings.customReason);
    setPalette(settings.palette || 'rose');
    setCustomAudioUrl(settings.customAudioUrl);
    setCustomAudioName(settings.customAudioName);
    setCustomAudioVolume(settings.customAudioVolume ?? 0.5);
    setBackgroundMusicEnabled(settings.backgroundMusicEnabled !== false);
  }, [settings]);

  // Clean up audio preview when unmounting or closing
  useEffect(() => {
    return () => {
      if (previewAudioRef.current) {
        previewAudioRef.current.pause();
        previewAudioRef.current = null;
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleModalClose = () => {
    if (previewAudioRef.current) {
      previewAudioRef.current.pause();
      setIsPreviewPlaying(false);
    }
    onClose();
  };

  const handleAudioFile = (file: File) => {
    setAudioError(null);
    if (!file.type.startsWith('audio/') && !file.name.match(/\.(mp3|m4a|wav|ogg|aac|flac)$/i)) {
      setAudioError('Por favor selecciona un archivo de audio válido (.mp3, .m4a, .wav, etc.)');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setAudioError('El archivo supera los 10 MB. Recomendamos uno menor a 8 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (dataUrl) {
        setCustomAudioUrl(dataUrl);
        setCustomAudioName(file.name);
        setBackgroundMusicEnabled(true);
        sound.playPop();

        if (previewAudioRef.current) {
          previewAudioRef.current.pause();
          setIsPreviewPlaying(false);
        }
      }
    };
    reader.onerror = () => {
      setAudioError('No se pudo leer el archivo de audio. Intenta con otro formato.');
    };
    reader.readAsDataURL(file);
  };

  const togglePreview = () => {
    if (!customAudioUrl) return;

    if (!previewAudioRef.current) {
      previewAudioRef.current = new Audio(customAudioUrl);
      previewAudioRef.current.volume = customAudioVolume;
      previewAudioRef.current.onended = () => setIsPreviewPlaying(false);
    } else if (previewAudioRef.current.src !== customAudioUrl) {
      previewAudioRef.current.src = customAudioUrl;
    }

    if (isPreviewPlaying) {
      previewAudioRef.current.pause();
      setIsPreviewPlaying(false);
    } else {
      previewAudioRef.current.volume = customAudioVolume;
      previewAudioRef.current.play()
        .then(() => setIsPreviewPlaying(true))
        .catch(() => setIsPreviewPlaying(false));
    }
  };

  const handleRemoveAudio = () => {
    if (previewAudioRef.current) {
      previewAudioRef.current.pause();
      setIsPreviewPlaying(false);
    }
    setCustomAudioUrl(undefined);
    setCustomAudioName(undefined);
    sound.playPop();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (previewAudioRef.current) {
      previewAudioRef.current.pause();
      setIsPreviewPlaying(false);
    }
    sound.playChime();
    onSave({
      partnerName: partnerName.trim() || 'Mi Amor',
      proposerName: proposerName.trim() || 'Yo',
      questionType,
      customQuestion: customQuestion.trim() || '¿Quieres ser mi pareja?',
      customReason: customReason.trim(),
      photos: settings.photos,
      palette,
      customAudioUrl,
      customAudioName,
      customAudioVolume,
      backgroundMusicEnabled,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div 
        className="relative w-full max-w-md bg-[#fdfcf9] rounded-2xl p-6 shadow-2xl border border-neutral-900/20 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          id="btn-close-settings"
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-neutral-700 rounded-full hover:bg-neutral-100 transition-colors cursor-pointer"
          aria-label="Cerrar modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-neutral-900/10">
          <div className="p-2 bg-neutral-900 text-amber-200 rounded-xl">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-display italic text-xl font-semibold text-neutral-900">Configuración</h2>
            <p className="font-serif text-xs text-neutral-500">Personaliza los nombres, atmósfera y mensaje</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Paleta de Colores */}
          <div>
            <label className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-neutral-700 mb-2">
              <Palette className="w-3.5 h-3.5 text-amber-700" />
              <span>Atmósfera & Estilo:</span>
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
                    className={`flex items-center gap-2 p-2 rounded-lg border text-left transition cursor-pointer ${
                      isSelected
                        ? 'border-neutral-900 bg-neutral-900/5 shadow-xs'
                        : 'border-neutral-200 bg-white hover:border-neutral-300 hover:bg-neutral-50'
                    }`}
                  >
                    <span
                      className="w-5 h-5 rounded-full flex items-center justify-center text-xs shrink-0 shadow-2xs"
                      style={{ backgroundColor: `${p.previewColor}30`, border: `1.5px solid ${p.previewColor}` }}
                    >
                      {p.emoji}
                    </span>
                    <div className="truncate flex-1">
                      <p className="font-display italic font-semibold text-neutral-900 truncate">{p.name.split(' ')[0]}</p>
                      <p className="font-mono text-[9px] uppercase text-neutral-500 truncate">{p.badgeText}</p>
                    </div>
                    {isSelected && (
                      <Check className="w-3.5 h-3.5 text-neutral-900 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label htmlFor="input-partner-name" className="block font-mono text-[10px] uppercase tracking-wider text-neutral-700 mb-1">
              Nombre de tu pareja:
            </label>
            <input
              id="input-partner-name"
              type="text"
              value={partnerName}
              onChange={(e) => setPartnerName(e.target.value)}
              placeholder="Ej: Sofía, Mi Vida..."
              className="w-full px-3.5 py-2 rounded-lg border border-neutral-300 focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 bg-white"
              maxLength={30}
            />
          </div>

          <div>
            <label htmlFor="input-proposer-name" className="block font-mono text-[10px] uppercase tracking-wider text-neutral-700 mb-1">
              Tu nombre o firma:
            </label>
            <input
              id="input-proposer-name"
              type="text"
              value={proposerName}
              onChange={(e) => setProposerName(e.target.value)}
              placeholder="Ej: Mateo, Tu Amor..."
              className="w-full px-3.5 py-2 rounded-lg border border-neutral-300 focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 bg-white"
              maxLength={30}
            />
          </div>

          <div>
            <label className="block font-mono text-[10px] uppercase tracking-wider text-neutral-700 mb-1.5">
              Tipo de pregunta:
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setQuestionType('novia');
                  setCustomQuestion('¿Quieres ser mi novia?');
                }}
                className={`py-2 px-3 rounded-lg border font-mono text-xs uppercase tracking-wider transition cursor-pointer text-center ${
                  questionType === 'novia'
                    ? 'border-neutral-900 bg-neutral-900 text-[#fdfcf9] shadow-xs'
                    : 'border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50'
                }`}
              >
                Novia
              </button>
              <button
                type="button"
                onClick={() => {
                  setQuestionType('novio');
                  setCustomQuestion('¿Quieres ser mi novio?');
                }}
                className={`py-2 px-3 rounded-lg border font-mono text-xs uppercase tracking-wider transition cursor-pointer text-center ${
                  questionType === 'novio'
                    ? 'border-neutral-900 bg-neutral-900 text-[#fdfcf9] shadow-xs'
                    : 'border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50'
                }`}
              >
                Novio
              </button>
              <button
                type="button"
                onClick={() => {
                  setQuestionType('pareja');
                  setCustomQuestion('¿Quieres ser mi pareja?');
                }}
                className={`py-2 px-3 rounded-lg border font-mono text-xs uppercase tracking-wider transition cursor-pointer text-center ${
                  questionType === 'pareja'
                    ? 'border-neutral-900 bg-neutral-900 text-[#fdfcf9] shadow-xs'
                    : 'border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50'
                }`}
              >
                Pareja
              </button>
              <button
                type="button"
                onClick={() => setQuestionType('custom')}
                className={`py-2 px-3 rounded-lg border font-mono text-xs uppercase tracking-wider transition cursor-pointer text-center ${
                  questionType === 'custom'
                    ? 'border-neutral-900 bg-neutral-900 text-[#fdfcf9] shadow-xs'
                    : 'border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50'
                }`}
              >
                Personalizado
              </button>
            </div>
          </div>

          {questionType === 'custom' && (
            <div>
              <label htmlFor="input-custom-question" className="block font-mono text-[10px] uppercase tracking-wider text-neutral-700 mb-1">
                Pregunta especial:
              </label>
              <input
                id="input-custom-question"
                type="text"
                value={customQuestion}
                onChange={(e) => setCustomQuestion(e.target.value)}
                placeholder="¿Quieres dar este gran paso juntos?"
                className="w-full px-3.5 py-2 rounded-lg border border-neutral-300 focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 bg-white"
                maxLength={60}
              />
            </div>
          )}

          <div>
            <label htmlFor="input-custom-reason" className="block font-mono text-[10px] uppercase tracking-wider text-neutral-700 mb-1">
              Mensaje o dedicatoria para el momento final:
            </label>
            <textarea
              id="input-custom-reason"
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              placeholder="Desde el día que te conocí supe que eras la persona más especial del mundo..."
              rows={3}
              className="w-full px-3.5 py-2 rounded-lg border border-neutral-300 focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 bg-white resize-none font-serif"
              maxLength={200}
            />
          </div>

          {/* Sección: Música de Fondo Personalizada */}
          <div className="bg-neutral-900/5 border border-neutral-900/10 rounded-xl p-3.5 space-y-3">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-neutral-800">
                <Music className="w-3.5 h-3.5 text-neutral-700" />
                <span>Música de Fondo:</span>
              </label>

              {customAudioUrl && (
                <label className="flex items-center gap-1.5 cursor-pointer font-mono text-[10px] text-neutral-700 select-none">
                  <input
                    type="checkbox"
                    checked={backgroundMusicEnabled}
                    onChange={(e) => setBackgroundMusicEnabled(e.target.checked)}
                    className="accent-neutral-900 rounded"
                  />
                  <span>Activar</span>
                </label>
              )}
            </div>

            {/* Input nativo de archivo de audio */}
            <input
              ref={audioInputRef}
              type="file"
              accept="audio/mp3,audio/mpeg,audio/wav,audio/m4a,audio/aac,audio/ogg,.mp3,.m4a,.wav,.ogg"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleAudioFile(file);
              }}
            />

            {!customAudioUrl ? (
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDraggingAudio(true);
                }}
                onDragLeave={() => setIsDraggingAudio(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDraggingAudio(false);
                  const file = e.dataTransfer.files?.[0];
                  if (file) handleAudioFile(file);
                }}
                onClick={() => audioInputRef.current?.click()}
                className={`flex flex-col items-center justify-center p-4 border border-dashed rounded-xl cursor-pointer transition-all ${
                  isDraggingAudio
                    ? 'border-neutral-900 bg-neutral-900/10'
                    : 'border-neutral-300 hover:border-neutral-500 bg-white hover:bg-neutral-50'
                }`}
              >
                <div className="p-2 bg-neutral-100 text-neutral-700 rounded-full mb-1">
                  <UploadCloud className="w-4 h-4" />
                </div>
                <p className="font-mono text-[11px] font-semibold text-neutral-800 text-center">
                  Subir canción o melodía
                </p>
                <p className="font-mono text-[9px] text-neutral-500 text-center mt-0.5">
                  MP3, M4A, WAV, AAC (máx 10 MB)
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-lg p-3 border border-neutral-200 shadow-2xs space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <div className="p-1.5 bg-neutral-100 text-neutral-700 rounded-md shrink-0">
                      <Music className="w-3.5 h-3.5" />
                    </div>
                    <div className="truncate">
                      <p className="text-xs font-semibold text-neutral-800 truncate" title={customAudioName}>
                        {customAudioName || 'Audio personalizado'}
                      </p>
                      <p className="font-mono text-[9px] text-emerald-700">✓ Listo para sonar</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={togglePreview}
                      className="flex items-center gap-1 px-2 py-1 rounded-md bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-mono text-[10px] transition cursor-pointer"
                      title={isPreviewPlaying ? 'Pausar muestra' : 'Escuchar muestra'}
                    >
                      {isPreviewPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                      <span>{isPreviewPlaying ? 'Pausar' : 'Probar'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleRemoveAudio}
                      className="p-1 rounded-md text-neutral-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                      title="Eliminar este archivo de audio"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Slider de volumen */}
                <div className="flex items-center gap-2 pt-1 border-t border-neutral-100 text-neutral-600">
                  <Volume2 className="w-3.5 h-3.5 text-neutral-600 shrink-0" />
                  <span className="font-mono text-[10px] shrink-0">Volumen:</span>
                  <input
                    type="range"
                    min="0.1"
                    max="1"
                    step="0.05"
                    value={customAudioVolume}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      setCustomAudioVolume(val);
                      if (previewAudioRef.current) {
                        previewAudioRef.current.volume = val;
                      }
                    }}
                    className="w-full accent-neutral-900 h-1.5 bg-neutral-200 rounded-lg cursor-pointer"
                  />
                  <span className="font-mono text-[10px] text-neutral-500 w-8 text-right">
                    {Math.round(customAudioVolume * 100)}%
                  </span>
                </div>

                <div className="flex justify-end pt-0.5">
                  <button
                    type="button"
                    onClick={() => audioInputRef.current?.click()}
                    className="font-mono text-[10px] text-neutral-600 hover:text-neutral-900 underline cursor-pointer"
                  >
                    Cambiar archivo de audio
                  </button>
                </div>
              </div>
            )}

            {audioError && (
              <p className="font-mono text-[10px] text-red-600 bg-red-50 p-2 rounded border border-red-200">
                {audioError}
              </p>
            )}

            <p className="font-serif italic text-[11px] text-neutral-500 leading-relaxed">
              La canción se reproducirá de fondo durante la experiencia.
            </p>
          </div>

          {/* Photos Management Shortcut */}
          <div className="bg-neutral-900/5 border border-neutral-900/10 rounded-xl p-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-neutral-900 text-amber-200 rounded-lg">
                <Camera className="w-4 h-4" />
              </div>
              <div>
                <p className="font-display italic text-sm font-semibold text-neutral-900">Álbum de Recuerdos</p>
                <p className="font-mono text-[10px] text-neutral-500">{settings.photos?.length || 7} fotos seleccionadas</p>
              </div>
            </div>
            {onOpenPhotoEditor && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenPhotoEditor();
                }}
                className="px-3 py-1.5 rounded-lg bg-white text-neutral-800 font-mono text-[11px] uppercase tracking-wider border border-neutral-300 hover:bg-neutral-50 shadow-2xs transition cursor-pointer"
              >
                Editar Fotos
              </button>
            )}
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-neutral-900/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 font-mono text-xs uppercase tracking-wider text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              id="btn-save-settings"
              className="flex items-center gap-1.5 px-5 py-2.5 font-mono text-xs uppercase tracking-widest text-[#fdfcf9] bg-neutral-900 hover:bg-neutral-800 rounded-lg shadow-sm transition cursor-pointer active:scale-95 border border-neutral-900"
            >
              <Check className="w-4 h-4" />
              <span>Guardar Cambios</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
