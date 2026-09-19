import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';
import { GameSettings, PhotoMemory } from '../types';

const DB_NAME = 'AmorNoviazgoDB';
const DB_VERSION = 1;
const STORE_NAME = 'app_state';
const LOCAL_STORAGE_KEY = 'propuesta_noviazgo_settings_v2';
const DEFAULT_DOC_ID = 'main_proposal';

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
export function compressImageFile(
  file: File,
  maxDimension = 1000,
  quality = 0.78
): Promise<{ dataUrl: string; originalSizeKb: number; compressedSizeKb: number }> {
  return new Promise((resolve, reject) => {
    const originalSizeKb = Math.round(file.size / 1024);
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Resize down if larger than maxDimension
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

        // Draw and compress to JPEG
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        // Estimate size in KB from base64
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
export async function persistSettings(settings: GameSettings, proposalId = getProposalIdFromUrl()): Promise<void> {
  const timestamp = Date.now();
  const payload = {
    ...settings,
    updatedAt: timestamp,
  };

  // 1. Persist to Cloud Firestore so it syncs across all devices
  try {
    const proposalRef = doc(db, 'proposals', proposalId);
    await setDoc(proposalRef, payload, { merge: true });

    // Also update global default document if this is the main proposal
    if (proposalId === DEFAULT_DOC_ID) {
      const appSettingsRef = doc(db, 'app_settings', 'default');
      await setDoc(appSettingsRef, payload, { merge: true });
    }
  } catch (cloudErr) {
    console.warn('Advertencia: Firestore no pudo guardar en la nube (offline o error):', cloudErr);
  }

  // 2. Persist to local IndexedDB (instant offline availability)
  try {
    const localDb = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = localDb.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(payload, `settings_${proposalId}`);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('IndexedDB no pudo guardar, usando localStorage como respaldo:', err);
  }

  // 3. Fallback cache to localStorage
  try {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_${proposalId}`, JSON.stringify(payload));
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(payload));
  } catch {
    try {
      const lightSettings = {
        ...payload,
        photos: payload.photos.map((p) => ({
          ...p,
          url: p.url.startsWith('data:') ? '' : p.url,
        })),
      };
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_${proposalId}`, JSON.stringify(lightSettings));
    } catch {}
  }
}

// Load settings from Cloud Firestore with IndexedDB/localStorage fallback
export async function retrieveSettings(proposalId = getProposalIdFromUrl()): Promise<GameSettings | null> {
  // 1. First attempt to load directly from Cloud Firestore (cross-device sync)
  try {
    const proposalRef = doc(db, 'proposals', proposalId);
    const snap = await getDoc(proposalRef);

    if (snap.exists()) {
      const cloudData = snap.data() as GameSettings;
      if (cloudData && cloudData.photos) {
        // Cache to IndexedDB for offline instant launches
        try {
          const localDb = await openDB();
          const tx = localDb.transaction(STORE_NAME, 'readwrite');
          tx.objectStore(STORE_NAME).put(cloudData, `settings_${proposalId}`);
        } catch {}
        return cloudData;
      }
    }

    // If main_proposal was requested and not found yet, check app_settings/default
    if (proposalId === DEFAULT_DOC_ID) {
      const appRef = doc(db, 'app_settings', 'default');
      const appSnap = await getDoc(appRef);
      if (appSnap.exists()) {
        const cloudData = appSnap.data() as GameSettings;
        if (cloudData && cloudData.photos) {
          return cloudData;
        }
      }
    }
  } catch (cloudErr) {
    console.warn('Aviso: No se pudo consultar Firestore directamente, usando almacenamiento local:', cloudErr);
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

    if (result && result.photos && result.photos.length > 0) {
      return result;
    }

    // Try default key
    const defaultResult = await new Promise<GameSettings | null>((resolve) => {
      const tx = localDb.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get('current_settings');
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => resolve(null);
    });
    if (defaultResult && defaultResult.photos && defaultResult.photos.length > 0) {
      return defaultResult;
    }
  } catch (err) {
    console.warn('IndexedDB no disponible para lectura, consultando localStorage:', err);
  }

  // 3. Fallback to localStorage v2
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
  try {
    const proposalRef = doc(db, 'proposals', proposalId);
    return onSnapshot(
      proposalRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data() as GameSettings;
          if (data && data.photos) {
            onUpdate(data);
          }
        }
      },
      (error) => {
        console.warn('Error en la suscripción en tiempo real de Firestore:', error);
      }
    );
  } catch (err) {
    console.warn('No se pudo establecer listener en tiempo real:', err);
    return () => {};
  }
}
