import React, { useState, useEffect } from 'react';
import { X, Upload, Plus, Trash2, Check, Image as ImageIcon, Sparkles, ShieldCheck, Loader2, RotateCcw } from 'lucide-react';
import { PhotoMemory } from '../types';
import { sound } from '../utils/audio';
import { compressImageFile } from '../utils/storage';
import { DEFAULT_PHOTOS } from '../data/defaultPhotos';

interface PhotoEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  photos: PhotoMemory[];
  onSave: (updatedPhotos: PhotoMemory[]) => void;
}

export const PhotoEditorModal: React.FC<PhotoEditorModalProps> = ({
  isOpen,
  onClose,
  photos,
  onSave,
}) => {
  const [items, setItems] = useState<PhotoMemory[]>(photos);
  const [activeTab, setActiveTab] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [saveSuccessNotice, setSaveSuccessNotice] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setItems(photos && photos.length > 0 ? photos : DEFAULT_PHOTOS);
      setActiveTab(0);
      setSaveSuccessNotice(null);
    }
  }, [isOpen, photos]);

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsProcessing(true);
      // Automatically compress image client-side to fit comfortably in Firestore
      const { dataUrl, originalSizeKb, compressedSizeKb } = await compressImageFile(file, 850, 0.72);

      sound.playShutter();
      setItems((prev) =>
        prev.map((item, i) => (i === index ? { ...item, url: dataUrl } : item))
      );
      setSaveSuccessNotice(`Foto optimizada (${originalSizeKb} KB ➔ ${compressedSizeKb} KB)`);
      setTimeout(() => setSaveSuccessNotice(null), 4000);
    } catch (err) {
      alert('Hubo un inconveniente al procesar la fotografía. Intenta con otra imagen JPG o PNG.');
    } finally {
      setIsProcessing(false);
      // Reset input value so same file can be re-selected if needed
      e.target.value = '';
    }
  };

  const handleUpdateField = (index: number, field: keyof PhotoMemory, value: string) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  const handleAddPhoto = () => {
    if (items.length >= 12) {
      alert('Puedes agregar hasta 12 fotos para el álbum de recuerdos.');
      return;
    }
    sound.playPop();
    const newPhoto: PhotoMemory = {
      id: `custom-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      url: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=800&q=80',
      title: `Nuestro Momento #${items.length + 1}`,
      dateOrLocation: 'Un día inolvidable',
      note: 'Escribe aquí lo que sentiste o una anécdota especial de este momento.',
      isRevealed: false,
      heartsCount: 0,
    };
    setItems((prev) => [...prev, newPhoto]);
    setActiveTab(items.length);
  };

  const handleRemovePhoto = (index: number) => {
    if (items.length <= 2) {
      alert('Se recomiendan al menos 2 fotos para la dinámica del álbum.');
      return;
    }
    sound.playPop();
    const filtered = items.filter((_, i) => i !== index);
    setItems(filtered);
    setActiveTab((prev) => Math.min(prev, filtered.length - 1));
  };

  const handleResetToDefault = () => {
    if (window.confirm('¿Deseas restaurar las fotos de muestra iniciales (7 fotos)?')) {
      sound.playPop();
      setItems(DEFAULT_PHOTOS);
      setActiveTab(0);
    }
  };

  const handleSave = () => {
    sound.playChime();
    onSave(items);
    onClose();
  };

  const currentItem = items[activeTab] || items[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div
        className="relative w-full max-w-2xl bg-white rounded-3xl p-5 sm:p-6 shadow-2xl border border-rose-200 max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-rose-100">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-rose-100 text-rose-600 rounded-2xl">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-gray-900">Personalizar Nuestras Fotos</h2>
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  Sincronización en la Nube
                </span>
              </div>
              <p className="text-xs text-gray-500">
                Sube tus fotos reales. Se guardan en la nube para que se vean en cualquier dispositivo.
              </p>
            </div>
          </div>
          <button
            id="btn-close-photo-modal"
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notice Banner if picture compressed */}
        {saveSuccessNotice && (
          <div className="mt-2 py-1.5 px-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center gap-1.5 animate-fadeIn">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>{saveSuccessNotice}</span>
          </div>
        )}

        {/* Photos tabs / thumbnail selector */}
        <div className="flex items-center gap-2 overflow-x-auto py-3 shrink-0 scrollbar-none">
          {items.map((photo, idx) => (
            <button
              key={photo.id || idx}
              onClick={() => {
                sound.playPop();
                setActiveTab(idx);
              }}
              className={`relative flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 border transition cursor-pointer ${
                activeTab === idx
                  ? 'border-rose-500 bg-rose-50 text-rose-700 shadow-xs'
                  : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              <img
                src={photo.url}
                alt={photo.title}
                className="w-5 h-5 rounded-md object-cover"
                referrerPolicy="no-referrer"
              />
              <span className="max-w-[100px] truncate">{photo.title || `Foto ${idx + 1}`}</span>
            </button>
          ))}

          {items.length < 12 && (
            <button
              id="btn-add-photo-tab"
              onClick={handleAddPhoto}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-dashed border-rose-300 shrink-0 transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Añadir</span>
            </button>
          )}
        </div>

        {/* Active Photo Editing Workspace */}
        {currentItem && (
          <div className="flex-1 overflow-y-auto space-y-4 py-2 pr-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
              {/* Image Preview & Upload control */}
              <div className="flex flex-col items-center">
                <div className="relative w-full aspect-square max-w-[220px] rounded-2xl overflow-hidden border-2 border-rose-200 shadow-md bg-rose-50 group">
                  <img
                    src={currentItem.url}
                    alt={currentItem.title}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <label
                    htmlFor={`file-input-${activeTab}`}
                    className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-xs font-semibold cursor-pointer transition-opacity backdrop-blur-xs p-2 text-center"
                  >
                    <Upload className="w-6 h-6 mb-1" />
                    <span>Cambiar imagen</span>
                    <span className="text-[10px] text-gray-200 mt-0.5">JPG, PNG, WebP</span>
                  </label>
                  <input
                    id={`file-input-${activeTab}`}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, activeTab)}
                    className="hidden"
                    disabled={isProcessing}
                  />

                  {/* Processing indicator */}
                  {isProcessing && (
                    <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white text-xs font-semibold">
                      <Loader2 className="w-6 h-6 animate-spin mb-1 text-rose-400" />
                      <span>Optimizando foto...</span>
                    </div>
                  )}
                </div>

                <label
                  htmlFor={`file-input-${activeTab}`}
                  className="mt-2.5 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold border border-rose-200 transition cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Subir foto desde tu dispositivo</span>
                </label>
              </div>

              {/* Text Fields */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Título o momento:
                  </label>
                  <input
                    type="text"
                    value={currentItem.title}
                    onChange={(e) => handleUpdateField(activeTab, 'title', e.target.value)}
                    placeholder="Ej: Nuestro primer café, Viaje a la playa..."
                    className="w-full px-3 py-2 text-xs rounded-xl border border-rose-200 focus:outline-none focus:ring-2 focus:ring-rose-400"
                    maxLength={35}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Lugar o fecha simbólica:
                  </label>
                  <input
                    type="text"
                    value={currentItem.dateOrLocation || ''}
                    onChange={(e) => handleUpdateField(activeTab, 'dateOrLocation', e.target.value)}
                    placeholder="Ej: Parque Central, 14 de Febrero..."
                    className="w-full px-3 py-2 text-xs rounded-xl border border-rose-200 focus:outline-none focus:ring-2 focus:ring-rose-400"
                    maxLength={35}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Nota o anécdota de amor (al reverso):
                  </label>
                  <textarea
                    rows={3}
                    value={currentItem.note}
                    onChange={(e) => handleUpdateField(activeTab, 'note', e.target.value)}
                    placeholder="Lo que sentiste en ese momento o lo mucho que amas su sonrisa..."
                    className="w-full px-3 py-2 text-xs rounded-xl border border-rose-200 focus:outline-none focus:ring-2 focus:ring-rose-400 resize-none"
                    maxLength={160}
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  {items.length > 2 ? (
                    <button
                      type="button"
                      onClick={() => handleRemovePhoto(activeTab)}
                      className="flex items-center gap-1 text-[11px] font-semibold text-red-500 hover:text-red-700 transition cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Eliminar esta foto</span>
                    </button>
                  ) : <div />}

                  <button
                    type="button"
                    onClick={handleResetToDefault}
                    className="flex items-center gap-1 text-[11px] font-semibold text-gray-400 hover:text-gray-600 transition cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Restaurar fotos de muestra</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Actions */}
        <div className="pt-3 border-t border-rose-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>{items.length} fotos sincronizadas en la nube</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              id="btn-save-custom-photos"
              onClick={handleSave}
              className="flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 rounded-xl shadow-md transition cursor-pointer active:scale-95"
            >
              <Check className="w-4 h-4" />
              <span>Guardar Fotos</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
