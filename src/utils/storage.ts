import {
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
  deleteDoc,
  onSnapshot,
  writeBatch,
} from 'firebase/firestore';
import { db } from './firebase';
import { GameSettings, PhotoMemory } from '../types';

const DB_NAME = 'AmorNoviazgoDB';
const DB_VERSION = 1;
const STORE_NAME = 'app_state';
const LOCAL_STORAGE_KEY = 'propuesta_noviazgo_settings_v2';
const DEFAULT_DOC_ID = 'main_proposal';

// In-memory & session flag to prevent infinite backoff retries when quota is reached
let isQuotaExceededSession = false;
try {
  if (typeof window !== 'undefined') {
    const quotaItem = sessionStorage.getItem('firestore_quota_exceeded');
    if (quotaItem) {
      const parsed = JSON.parse(quotaItem);
      if (Date.now() - (parsed.time || 0) < 12 * 60 * 60 * 1000) {
        isQuotaExceededSession = true;
      }
    }
  }
} catch {}

export function isQuotaLimitReached(): boolean {
  return isQuotaExceededSession;
}

export function markQuotaExceeded(): void {
  isQuotaExceededSession = true;
  try {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('firestore_quota_exceeded', JSON.stringify({ time: Date.now() }));
    }
  } catch {}
}

export interface PersistResult {
  success: boolean;
  quotaExceeded?: boolean;
  error?: string;
}

// Helper to get active proposal ID from URL search params (?p=xyz) or fallback to main_proposal
export function getProposalIdFromUrl(): string {
  if (typeof window === 'undefined') return DEFAULT_DOC_ID;
  const params = new URLSearchParams(window.location.search);
  const p = params.get('p');
  return p && p.trim() ? p.trim() : DEFAULT_DOC_ID;
}

// Open or initialize IndexedDB as local offline cache
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB no disponible'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const idb = (event.target as IDBOpenDBRequest).result;
      if (!idb.objectStoreNames.contains(STORE_NAME)) {
        idb.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error || new Error('Error al abrir IndexedDB'));
    };
  });
}

// Client-side image compression using HTML5 Canvas
// Generates compact, crystal-clear Web-ready images that fit perfectly in Firestore
export function compressImageFile(
  file: File,
  maxDimension = 850,
  quality = 0.72
): Promise<{ dataUrl: string; originalSizeKb: number; compressedSizeKb: number }> {
  return new Promise((resolve, reject) => {
    const originalSizeKb = Math.round(file.size / 1024);
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Resize down proportionally if larger than maxDimension
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          reject(new Error('No se pudo inicializar canvas 2D'));
          return;
        }

        // Draw and compress to clean JPEG
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        const compressedSizeKb = Math.round((dataUrl.length * (3 / 4)) / 1024);

        resolve({
          dataUrl,
          originalSizeKb,
          compressedSizeKb,
        });
      };

      img.onerror = () => reject(new Error('No se pudo procesar la imagen seleccionada'));
      img.src = e.target?.result as string;
    };

    reader.onerror = () => reject(new Error('Error al leer el archivo'));
    reader.readAsDataURL(file);
  });
}

// Save complete settings to Cloud Firestore AND local storage/IndexedDB
// Optimized to write everything in a single document whenever possible to conserve quota
export async function persistSettings(
  settings: GameSettings,
  proposalId = getProposalIdFromUrl()
): Promise<PersistResult> {
  const timestamp = Date.now();

  const isSmallAudio = Boolean(settings.customAudioUrl && settings.customAudioUrl.length < 350000);

  const mainPayload = {
    partnerName: settings.partnerName || 'Mi Persona Favorita',
    proposerName: settings.proposerName || 'Tu Admirador/a',
    questionType: settings.questionType || 'novia',
    customQuestion: settings.customQuestion || '¿Quieres ser mi novia?',
    customReason: settings.customReason || '',
    palette: settings.palette || 'rose',
    photos: settings.photos || [],
    photoCount: settings.photos?.length || 0,
    customAudioName: settings.customAudioName || '',
    customAudioVolume: settings.customAudioVolume ?? 0.5,
    backgroundMusicEnabled: settings.backgroundMusicEnabled !== false,
    hasCustomAudio: Boolean(settings.customAudioUrl),
    customAudioUrl: isSmallAudio ? (settings.customAudioUrl || '') : '',
    updatedAt: timestamp,
  };

  let cloudSuccess = false;
  let quotaExceededFlag = false;
  let cloudErrorMsg: string | undefined;

  // 1. Persist to Cloud Firestore (if quota not exceeded)
  if (isQuotaLimitReached()) {
    quotaExceededFlag = true;
    cloudErrorMsg = 'Cuota diaria de Firestore superada. Los datos se guardan con seguridad de forma local.';
  } else {
    try {
      const proposalRef = doc(db, 'proposals', proposalId);
      // Single write for atomic, quota-friendly storage
      await setDoc(proposalRef, mainPayload, { merge: true });
      cloudSuccess = true;
    } catch (cloudErr: any) {
      const isQuota =
        cloudErr?.code === 'resource-exhausted' ||
        String(cloudErr?.message || '').includes('Quota exceeded') ||
        String(cloudErr?.message || '').includes('resource-exhausted');

      if (isQuota) {
        markQuotaExceeded();
        quotaExceededFlag = true;
        cloudErrorMsg = 'Cuota diaria de Firestore superada.';
        console.warn('Límite de cuota gratuita alcanzado en Firestore. Pasando a almacenamiento local seguro.');
      } else {
        cloudErrorMsg = cloudErr?.message || String(cloudErr);
        console.warn('Aviso al guardar en Cloud Firestore (usando respaldo local):', cloudErr?.message || cloudErr);
      }
    }
  }

  // 2. Persist to local IndexedDB (instant offline load)
  const fullLocalPayload = {
    ...settings,
    updatedAt: timestamp,
  };

  try {
    const localDb = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = localDb.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(fullLocalPayload, `settings_${proposalId}`);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('IndexedDB no pudo guardar:', err);
  }

  // 3. Fallback cache to localStorage
  try {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_${proposalId}`, JSON.stringify(fullLocalPayload));
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(fullLocalPayload));
  } catch {
    try {
      // If local storage is full, save metadata only
      const lightSettings = {
        ...fullLocalPayload,
        photos: fullLocalPayload.photos.map((p) => ({
          ...p,
          url: p.url.startsWith('data:') ? '' : p.url,
        })),
      };
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_${proposalId}`, JSON.stringify(lightSettings));
    } catch {}
  }

  return {
    success: cloudSuccess,
    quotaExceeded: quotaExceededFlag || isQuotaLimitReached(),
    error: cloudErrorMsg,
  };
}

// Load settings from Cloud Firestore with IndexedDB/localStorage fallback
export async function retrieveSettings(proposalId = getProposalIdFromUrl()): Promise<GameSettings | null> {
  // 1. First attempt to load from Cloud Firestore if quota is not reached
  if (!isQuotaLimitReached()) {
    try {
      const proposalRef = doc(db, 'proposals', proposalId);
      const snap = await getDoc(proposalRef);

      if (snap.exists()) {
        const mainData = snap.data() as Partial<GameSettings>;

        let fetchedPhotos: PhotoMemory[] = [];
        if (Array.isArray(mainData.photos) && mainData.photos.length > 0) {
          fetchedPhotos = mainData.photos;
        } else {
          try {
            // Check subcollection for legacy data
            const photosColRef = collection(db, 'proposals', proposalId, 'photos');
            const photosSnap = await getDocs(photosColRef);
            if (!photosSnap.empty) {
              fetchedPhotos = photosSnap.docs
                .map((d) => d.data() as PhotoMemory & { order?: number })
                .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                .map(({ order, ...rest }) => rest as PhotoMemory);
            }
          } catch {}
        }

        // Fetch audio
        let customAudioUrl = (mainData as any).customAudioUrl || '';
        if (!customAudioUrl && (mainData as any).hasCustomAudio) {
          try {
            const audioChunksCol = collection(db, 'proposals', proposalId, 'audio_chunks');
            const audioSnap = await getDocs(audioChunksCol);
            if (!audioSnap.empty) {
              const chunks = audioSnap.docs.map((d) => d.data() as { index: number; data: string });
              chunks.sort((a, b) => a.index - b.index);
              customAudioUrl = chunks.map((c) => c.data).join('');
            }
          } catch {}
        }

        const combined: GameSettings = {
          partnerName: mainData.partnerName || 'Mi Persona Favorita',
          proposerName: mainData.proposerName || 'Tu Admirador/a',
          questionType: mainData.questionType || 'novia',
          customQuestion: mainData.customQuestion || '¿Quieres ser mi novia?',
          customReason: mainData.customReason || '',
          palette: mainData.palette || 'rose',
          photos: fetchedPhotos.length > 0 ? fetchedPhotos : (mainData.photos || []),
          customAudioUrl: customAudioUrl || undefined,
          customAudioName: (mainData as any).customAudioName || undefined,
          customAudioVolume: (mainData as any).customAudioVolume ?? 0.5,
          backgroundMusicEnabled: (mainData as any).backgroundMusicEnabled !== false,
        };

        // Cache to IndexedDB
        try {
          const localDb = await openDB();
          const tx = localDb.transaction(STORE_NAME, 'readwrite');
          tx.objectStore(STORE_NAME).put(combined, `settings_${proposalId}`);
        } catch {}

        return combined;
      }
    } catch (cloudErr: any) {
      if (
        cloudErr?.code === 'resource-exhausted' ||
        String(cloudErr?.message || '').includes('Quota exceeded') ||
        String(cloudErr?.message || '').includes('resource-exhausted')
      ) {
        markQuotaExceeded();
      }
      console.warn('Aviso: Usando almacenamiento local:', cloudErr?.message || cloudErr);
    }
  }

  // 2. Fallback to IndexedDB
  try {
    const localDb = await openDB();
    const result = await new Promise<GameSettings | null>((resolve, reject) => {
      const tx = localDb.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(`settings_${proposalId}`);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });

    if (result) {
      return result;
    }

    // Try fallback key
    const defaultResult = await new Promise<GameSettings | null>((resolve) => {
      const tx = localDb.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get('current_settings');
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => resolve(null);
    });
    if (defaultResult) {
      return defaultResult;
    }
  } catch (err) {
    console.warn('IndexedDB no disponible para lectura:', err);
  }

  // 3. Fallback to localStorage
  try {
    const rawProposal = localStorage.getItem(`${LOCAL_STORAGE_KEY}_${proposalId}`);
    if (rawProposal) {
      return JSON.parse(rawProposal);
    }
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {}

  return null;
}

// Real-time listener for live sync across devices
export function subscribeToProposalChanges(
  onUpdate: (data: GameSettings) => void,
  proposalId = getProposalIdFromUrl()
): () => void {
  if (isQuotaLimitReached()) {
    return () => {};
  }
  try {
    const proposalRef = doc(db, 'proposals', proposalId);
    return onSnapshot(
      proposalRef,
      async (snapshot) => {
        if (snapshot.exists()) {
          const mainData = snapshot.data() as Partial<GameSettings>;
          let photos: PhotoMemory[] = [];
          if (Array.isArray(mainData.photos) && mainData.photos.length > 0) {
            photos = mainData.photos;
          } else {
            try {
              const photosColRef = collection(db, 'proposals', proposalId, 'photos');
              const photosSnap = await getDocs(photosColRef);
              if (!photosSnap.empty) {
                photos = photosSnap.docs
                  .map((d) => d.data() as PhotoMemory & { order?: number })
                  .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                  .map(({ order, ...rest }) => rest as PhotoMemory);
              }
            } catch {}
          }

          onUpdate({
            partnerName: mainData.partnerName || 'Mi Persona Favorita',
            proposerName: mainData.proposerName || 'Tu Admirador/a',
            questionType: mainData.questionType || 'novia',
            customQuestion: mainData.customQuestion || '¿Quieres ser mi novia?',
            customReason: mainData.customReason || '',
            palette: mainData.palette || 'rose',
            photos: photos,
            customAudioUrl: (mainData as any).customAudioUrl,
            customAudioName: (mainData as any).customAudioName,
            customAudioVolume: (mainData as any).customAudioVolume ?? 0.5,
            backgroundMusicEnabled: (mainData as any).backgroundMusicEnabled !== false,
          });
        }
      },
      (error) => {
        if (
          error?.code === 'resource-exhausted' ||
          String(error?.message || '').includes('Quota exceeded')
        ) {
          markQuotaExceeded();
        }
        console.warn('Aviso en suscripción en tiempo real de Firestore:', error?.message || error);
      }
    );
  } catch (err) {
    console.warn('No se pudo establecer listener en tiempo real:', err);
    return () => {};
  }
}
