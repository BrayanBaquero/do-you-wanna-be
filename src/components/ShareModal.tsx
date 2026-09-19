import React, { useState } from 'react';
import { X, Share2, Copy, Check, QrCode, Globe, ShieldCheck, Sparkles, Smartphone } from 'lucide-react';
import { sound } from '../utils/audio';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  partnerName: string;
}

export const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, partnerName }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  const handleCopy = async () => {
    sound.playPop();
    try {
      await navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      // Fallback
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const handleNativeShare = async () => {
    sound.playChime();
    const shareData = {
      title: `Para ti, ${partnerName || 'mi persona favorita'} 💕`,
      text: `Tengo una sorpresa muy especial preparada para ti. Abre este enlace:`,
      url: currentUrl,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {}
    } else {
      handleCopy();
    }
  };

  // QR Code generator URL using public standard API
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
    currentUrl
  )}&bgcolor=fff1f2&color=e11d48&margin=2`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div
        className="relative w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-rose-100 max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          id="btn-close-share-modal"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
          aria-label="Cerrar modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="flex items-center gap-2 mb-3">
          <div className="p-2 bg-rose-100 text-rose-600 rounded-2xl">
            <Share2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Compartir con tu Pareja</h2>
            <p className="text-xs text-gray-500">Sincronizado en la nube para cualquier dispositivo</p>
          </div>
        </div>

        {/* Sync Status Badge */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 mb-4 flex items-center gap-2.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <p className="text-[11px] text-emerald-900 leading-snug">
            <strong>Persistencia en la nube activa:</strong> Tus fotos, nombres y preguntas están guardados permanentemente en Firebase Firestore. Puedes abrir el enlace desde cualquier celular o computadora sin que se borre nada.
          </p>
        </div>

        {/* QR Code section */}
        <div className="flex flex-col items-center bg-rose-50/60 border border-rose-100 rounded-2xl p-4 mb-4">
          <p className="text-xs font-semibold text-rose-900 mb-2 flex items-center gap-1.5">
            <Smartphone className="w-3.5 h-3.5 text-rose-500" />
            <span>Escanear con su celular</span>
          </p>
          <div className="p-2 bg-white rounded-2xl shadow-sm border border-rose-200">
            <img
              src={qrCodeUrl}
              alt="Código QR de la propuesta"
              className="w-36 h-36 rounded-xl object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
          <p className="text-[10px] text-rose-600 mt-2 text-center">
            Pídele que apunte con su cámara para abrir su sorpresa al instante.
          </p>
        </div>

        {/* URL Box */}
        <div className="space-y-1.5 mb-4">
          <label className="block text-xs font-semibold text-gray-700">
            Enlace directo de la propuesta:
          </label>
          <div className="flex items-center gap-1.5">
            <input
              type="text"
              readOnly
              value={currentUrl}
              className="w-full px-3 py-2 text-xs rounded-xl border border-rose-200 bg-gray-50 text-gray-700 focus:outline-none select-all"
            />
            <button
              id="btn-copy-share-url"
              onClick={handleCopy}
              className={`px-3 py-2 text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1 shrink-0 ${
                copied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-rose-500 text-white hover:bg-rose-600 active:scale-95'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>¡Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copiar</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-rose-100">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition cursor-pointer"
          >
            Cerrar
          </button>

          <button
            id="btn-trigger-native-share"
            onClick={handleNativeShare}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 rounded-xl shadow-md transition cursor-pointer active:scale-95"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Enviar por WhatsApp / Mensaje</span>
          </button>
        </div>
      </div>
    </div>
  );
};
