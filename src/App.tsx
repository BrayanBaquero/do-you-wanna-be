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
import { IntroStage } from './components/stages/IntroStage';
import { HeartsStage } from './components/stages/HeartsStage';
import { TriviaStage } from './components/stages/TriviaStage';
import { PhotosStage } from './components/stages/PhotosStage';
import { ChestStage } from './components/stages/ChestStage';
import { ProposalStage } from './components/stages/ProposalStage';
import { SuccessStage } from './components/stages/SuccessStage';
import { DEFAULT_PHOTOS } from './data/defaultPhotos';
import { persistSettings, retrieveSettings } from './utils/storage';
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
  const [isMuted, setIsMuted] = useState(false);

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

  // Asynchronously load rich persisted data from IndexedDB on startup
  useEffect(() => {
    let isMounted = true;
    retrieveSettings()
      .then((loaded) => {
        if (isMounted && loaded) {
          setSettings((prev) => ({
            ...prev,
            ...loaded,
            palette: loaded.palette || prev.palette || 'rose',
            photos: resolvePhotos(loaded.photos),
          }));
        }
      })
      .catch((err) => {
        console.warn('Error al recuperar desde IndexedDB:', err);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  // Sync active theme to html tag for global CSS custom property scoping
  useEffect(() => {
    const currentTheme = settings.palette || 'rose';
    document.documentElement.setAttribute('data-theme', currentTheme);
  }, [settings.palette]);

  const handleSaveSettings = (newSettings: GameSettings) => {
    setSettings(newSettings);
    // Persist securely to IndexedDB and fallback to localStorage
    persistSettings(newSettings).catch((err) => {
      console.warn('No se pudo persistir ajustes:', err);
    });
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
      sound.isMuted = next;
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
        onReset={handleReset}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
      />

      {/* Main Interactive Stage Container */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-2 sm:p-4">
        {stage === 'intro' && (
          <IntroStage
            settings={settings}
            onStart={() => setStage('hearts')}
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

      {/* Subtle Footer */}
      <footer className="relative z-20 py-2.5 text-center text-[11px] text-rose-500/80 select-none">
        Hecho con amor y dedicación 💕
      </footer>
    </div>
  );
}
