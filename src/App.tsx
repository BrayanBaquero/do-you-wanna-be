/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { GameStage, GameSettings, ColorPalette, PhotoMemory } from './types';
import { BackgroundHearts } from './components/BackgroundHearts';
import { Header } from './components/Header';
import { SettingsModal } from './components/SettingsModal';
import { PhotoEditorModal } from './components/PhotoEditorModal';
import { PaletteModal } from './components/PaletteModal';
import { ShareModal } from './components/ShareModal';
import { IntroStage } from './components/stages/IntroStage';
import { HeartsStage } from './components/stages/HeartsStage';
import { TriviaStage } from './components/stages/TriviaStage';
import { PhotosStage } from './components/stages/PhotosStage';
import { ChestStage } from './components/stages/ChestStage';
import { ProposalStage } from './components/stages/ProposalStage';
import { SuccessStage } from './components/stages/SuccessStage';
import { DEFAULT_PHOTOS } from './data/defaultPhotos';
import { persistSettings, retrieveSettings, subscribeToProposalChanges } from './utils/storage';
import { sound } from './utils/audio';

const STORAGE_KEY_FALLBACK = 'propuesta_noviazgo_settings_v2';

const DEFAULT_SETTINGS: GameSettings = {
  partnerName: 'Mi Persona Favorita',
  proposerName: 'Tu Admirador/a',
  questionType: 'novia',
  customQuestion: '¿Quieres ser mi novia?',
  customReason: 'Eres la casualidad más bonita que me ha pasado en la vida.',
  photos: DEFAULT_PHOTOS,
  palette: 'rose',
  customAudioVolume: 0.5,
  backgroundMusicEnabled: true,
};

function resolvePhotos(savedPhotos?: PhotoMemory[]): PhotoMemory[] {
  if (!savedPhotos || savedPhotos.length === 0) {
    return DEFAULT_PHOTOS;
  }
  // If user only had the 4 initial sample photos (photo-1 to photo-4), seamlessly append the new 3 photos
  const isAllDefaultSample = savedPhotos.every((p) => p.id.startsWith('photo-'));
  if (isAllDefaultSample && savedPhotos.length < DEFAULT_PHOTOS.length) {
    const existingIds = new Set(savedPhotos.map((p) => p.id));
    const missingDefaults = DEFAULT_PHOTOS.filter((p) => !existingIds.has(p.id));
    return [...savedPhotos, ...missingDefaults];
  }
  return savedPhotos;
}

export default function App() {
  const [stage, setStage] = useState<GameStage>('intro');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isPhotoEditorOpen, setIsPhotoEditorOpen] = useState(false);
  const [isPaletteModalOpen, setIsPaletteModalOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isCloudSynced, setIsCloudSynced] = useState(true);
  const [cloudToast, setCloudToast] = useState<{ message: string; type: 'info' | 'success' | 'error' } | null>(null);

  const [settings, setSettings] = useState<GameSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_FALLBACK);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...DEFAULT_SETTINGS,
          ...parsed,
          palette: parsed.palette || 'rose',
          photos: resolvePhotos(parsed.photos),
        };
      }
    } catch {}
    return DEFAULT_SETTINGS;
  });

  // Load persisted data from Cloud Firestore (and IndexedDB cache) on startup
  useEffect(() => {
    let isMounted = true;
    retrieveSettings()
      .then(async (loaded) => {
        if (!isMounted) return;
        if (loaded && (loaded.customAudioUrl || loaded.photos?.length || loaded.partnerName !== DEFAULT_SETTINGS.partnerName || loaded.customReason || loaded.palette)) {
          setSettings((prev) => ({
            ...prev,
            ...loaded,
            palette: loaded.palette || prev.palette || 'rose',
            photos: resolvePhotos(loaded.photos),
          }));
          setIsCloudSynced(true);
        } else {
          // If cloud has no customized document yet, check if this browser has local settings
          // If so, automatically seed and upload them to Firestore so they are visible on GitHub!
          try {
            const saved = localStorage.getItem(STORAGE_KEY_FALLBACK);
            if (saved) {
              const parsed = JSON.parse(saved);
              if (parsed && (parsed.partnerName !== DEFAULT_SETTINGS.partnerName || parsed.customReason || parsed.photos?.length)) {
                console.log('Sincronizando automáticamente ajustes locales con la nube...');
                await persistSettings(parsed);
                setIsCloudSynced(true);
              }
            }
          } catch {}
        }
      })
      .catch((err) => {
        console.warn('Error al recuperar desde Firestore/IndexedDB:', err);
      });

    // Real-time synchronization across devices (if someone updates the proposal from another device)
    const unsubscribe = subscribeToProposalChanges((liveData) => {
      if (isMounted && liveData) {
        setSettings((prev) => ({
          ...prev,
          ...liveData,
          palette: liveData.palette || prev.palette || 'rose',
          photos: resolvePhotos(liveData.photos),
        }));
        setIsCloudSynced(true);
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  // Sync active theme to html tag for global CSS custom property scoping
  useEffect(() => {
    const currentTheme = settings.palette || 'rose';
    document.documentElement.setAttribute('data-theme', currentTheme);
  }, [settings.palette]);

  // Synchronize background music with active settings
  useEffect(() => {
    if (settings.backgroundMusicEnabled && settings.customAudioUrl) {
      sound.setMusicSource(settings.customAudioUrl, settings.customAudioVolume ?? 0.5, true);
    } else {
      sound.setMusicSource(null, settings.customAudioVolume ?? 0.5, false);
    }
  }, [settings.customAudioUrl, settings.customAudioVolume, settings.backgroundMusicEnabled]);

  const handleSaveSettings = async (newSettings: GameSettings) => {
    setSettings(newSettings);
    setCloudToast({ message: 'Guardando en la nube...', type: 'info' });

    try {
      const result = await persistSettings(newSettings);
      if (result.success) {
        setIsCloudSynced(true);
        setCloudToast({ message: '¡Guardado en la nube! Se verá en cualquier celular y en GitHub.', type: 'success' });
      } else {
        setCloudToast({ message: 'Guardado localmente. Revisando conexión a la nube...', type: 'info' });
      }
    } catch {
      setCloudToast({ message: 'Guardado localmente en tu dispositivo.', type: 'info' });
    }

    setTimeout(() => {
      setCloudToast(null);
    }, 4000);
  };

  const handlePaletteSelect = (newPalette: ColorPalette) => {
    const updated: GameSettings = {
      ...settings,
      palette: newPalette,
    };
    handleSaveSettings(updated);
  };

  const handleToggleMute = () => {
    setIsMuted((prev) => {
      const next = !prev;
      sound.setMuted(next);
      return next;
    });
  };

  const handleReset = () => {
    sound.playChime();
    setStage('intro');
  };

  return (
    <div
      data-theme={settings.palette || 'rose'}
      style={{ background: 'var(--theme-bg-gradient, linear-gradient(to bottom, #fff1f2, #ffe4e6 70%, #fef2f2))' }}
      className="relative min-h-screen w-full text-gray-900 font-sans flex flex-col justify-between selection:bg-rose-200 selection:text-rose-900 overflow-x-hidden transition-colors duration-500"
    >
      {/* Dynamic Animated Ambient Hearts matching active palette */}
      <BackgroundHearts palette={settings.palette || 'rose'} />

      {/* Top Application Bar with Navigation & Settings */}
      <Header
        currentStage={stage}
        settings={settings}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenPalette={() => setIsPaletteModalOpen(true)}
        onOpenShare={() => setIsShareOpen(true)}
        onReset={handleReset}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        isCloudSynced={isCloudSynced}
      />

      {/* Main Interactive Stage Container */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-2 sm:p-4">
        {stage === 'intro' && (
          <IntroStage
            settings={settings}
            onStart={() => {
              sound.playMusic();
              setStage('hearts');
            }}
            onOpenSettings={() => setIsSettingsOpen(true)}
          />
        )}

        {stage === 'hearts' && (
          <HeartsStage
            partnerName={settings.partnerName}
            onNext={() => setStage('trivia')}
          />
        )}

        {stage === 'trivia' && (
          <TriviaStage
            partnerName={settings.partnerName}
            onNext={() => setStage('photos')}
          />
        )}

        {stage === 'photos' && (
          <PhotosStage
            photos={settings.photos || DEFAULT_PHOTOS}
            partnerName={settings.partnerName}
            onNext={() => setStage('chest')}
            onOpenPhotoEditor={() => setIsPhotoEditorOpen(true)}
          />
        )}

        {stage === 'chest' && (
          <ChestStage
            partnerName={settings.partnerName}
            onNext={() => setStage('proposal')}
          />
        )}

        {stage === 'proposal' && (
          <ProposalStage
            settings={settings}
            onAccept={() => setStage('success')}
          />
        )}

        {stage === 'success' && (
          <SuccessStage
            settings={settings}
            onRestart={handleReset}
          />
        )}
      </main>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSave={handleSaveSettings}
        onOpenPhotoEditor={() => setIsPhotoEditorOpen(true)}
      />

      {/* Photo Editor Modal */}
      <PhotoEditorModal
        isOpen={isPhotoEditorOpen}
        onClose={() => setIsPhotoEditorOpen(false)}
        photos={settings.photos || DEFAULT_PHOTOS}
        onSave={(updatedPhotos) => {
          handleSaveSettings({
            ...settings,
            photos: updatedPhotos,
          });
        }}
      />

      {/* Palette Selection Modal */}
      <PaletteModal
        isOpen={isPaletteModalOpen}
        onClose={() => setIsPaletteModalOpen(false)}
        activePalette={settings.palette || 'rose'}
        onSelectPalette={handlePaletteSelect}
      />

      {/* Share with Partner Modal */}
      <ShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        partnerName={settings.partnerName}
      />

      {/* Cloud Sync Toast Notification */}
      {cloudToast && (
        <div
          className={`fixed bottom-12 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl shadow-xl border text-xs font-semibold flex items-center gap-2 animate-fadeIn transition-all ${
            cloudToast.type === 'success'
              ? 'bg-emerald-600 text-white border-emerald-500 shadow-emerald-900/20'
              : 'bg-gray-900 text-white border-gray-800 shadow-black/30'
          }`}
        >
          <span>{cloudToast.type === 'success' ? '☁️' : '⏳'}</span>
          <span>{cloudToast.message}</span>
        </div>
      )}

      {/* Subtle Footer */}
      <footer className="relative z-20 py-2.5 text-center text-[11px] text-rose-500/80 select-none">
        Hecho con amor y dedicación 💕
      </footer>
    </div>
  );
}
