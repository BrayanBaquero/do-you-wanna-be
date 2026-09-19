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
  )}&bgcolor=fdfcf9&color=1a1a1a&margin=2`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div
        className="relative w-full max-w-md bg-[#fdfcf9] rounded-2xl p-6 shadow-2xl border border-neutral-900/20 max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          id="btn-close-share-modal"
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-neutral-700 rounded-full hover:bg-neutral-100 transition-colors cursor-pointer"
          aria-label="Cerrar modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="flex items-center gap-2.5 mb-3 pb-3 border-b border-neutral-900/10">
          <div className="p-2 bg-neutral-900 text-amber-200 rounded-xl">
            <Share2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-display italic text-xl font-semibold text-neutral-900">Compartir Experiencia</h2>
            <p className="font-serif text-xs text-neutral-500">Enlace listo para abrir en cualquier dispositivo</p>
          </div>
        </div>

        {/* Sync Status Badge */}
        <div className="bg-neutral-900/5 border border-neutral-900/10 rounded-xl p-3 mb-4 flex items-center gap-2.5">
          <ShieldCheck className="w-4 h-4 text-neutral-700 shrink-0" />
          <p className="font-serif text-xs text-neutral-700 leading-snug">
            <strong className="font-sans font-semibold text-neutral-900">Sincronización en la nube:</strong> Tus fotos, nombres y preguntas están guardados permanentemente. Puedes abrir el enlace desde cualquier celular.
          </p>
        </div>

        {/* QR Code section */}
        <div className="flex flex-col items-center bg-white border border-neutral-900/10 rounded-xl p-4 mb-4">
          <p className="font-mono text-xs uppercase tracking-wider text-neutral-800 mb-2 flex items-center gap-1.5">
            <Smartphone className="w-3.5 h-3.5 text-neutral-600" />
            <span>Escanear con celular</span>
          </p>
          <div className="p-2 bg-[#fdfcf9] rounded-xl shadow-2xs border border-neutral-900/10">
            <img
              src={qrCodeUrl}
              alt="Código QR de la propuesta"
              className="w-36 h-36 rounded-lg object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
          <p className="font-serif italic text-xs text-neutral-500 mt-2 text-center">
            Apunta con la cámara de su teléfono para iniciar la aventura.
          </p>
        </div>

        {/* URL Box */}
        <div className="space-y-1.5 mb-4">
          <label className="block font-mono text-[10px] uppercase tracking-wider text-neutral-700">
            Enlace directo:
          </label>
          <div className="flex items-center gap-1.5">
            <input
              type="text"
              readOnly
              value={currentUrl}
              className="w-full px-3 py-2 font-mono text-xs rounded-lg border border-neutral-300 bg-white text-neutral-800 focus:outline-none select-all"
            />
            <button
              id="btn-copy-share-url"
              type="button"
              onClick={handleCopy}
              className={`px-3 py-2 font-mono text-xs uppercase tracking-wider font-semibold rounded-lg transition cursor-pointer flex items-center gap-1 shrink-0 border ${
                copied
                  ? 'bg-neutral-900 text-[#fdfcf9] border-neutral-900'
                  : 'bg-white text-neutral-800 border-neutral-300 hover:bg-neutral-50 active:scale-95'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Copiado</span>
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
        <div className="flex items-center justify-between pt-3 border-t border-neutral-900/10">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 font-mono text-xs uppercase tracking-wider text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition cursor-pointer"
          >
            Cerrar
          </button>

          <button
            id="btn-trigger-native-share"
            type="button"
            onClick={handleNativeShare}
            className="flex items-center gap-1.5 px-4 py-2 font-mono text-xs uppercase tracking-widest text-[#fdfcf9] bg-neutral-900 hover:bg-neutral-800 rounded-lg shadow-sm transition cursor-pointer active:scale-95 border border-neutral-900"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Enviar Enlace</span>
          </button>
        </div>
      </div>
    </div>
  );
};
