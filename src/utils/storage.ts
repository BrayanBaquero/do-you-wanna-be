import { GameSettings, PhotoMemory } from '../types';

const DB_NAME = 'AmorNoviazgoDB';
const DB_VERSION = 1;
const STORE_NAME = 'app_state';
const LOCAL_STORAGE_KEY = 'propuesta_noviazgo_settings_v2';

// Open or initialize IndexedDB
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB no disponible'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
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
  maxDimension = 1200,
  quality = 0.82
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

// Save complete settings (including photos) to IndexedDB and fallback to localStorage
export async function persistSettings(settings: GameSettings): Promise<void> {
  // 1. Try to persist to IndexedDB (virtually unlimited quota for images)
  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(settings, 'current_settings');
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('IndexedDB no pudo guardar, usando localStorage como respaldo:', err);
  }

  // 2. Also save to localStorage as a fast synchronous cache
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(settings));
  } catch (e) {
    // If photos are too large for localStorage, store metadata in localStorage without heavy photos
    try {
      const lightSettings = {
        ...settings,
        photos: settings.photos.map((p) => ({
          ...p,
          // If url is not an external URL, just keep a placeholder in localStorage while IndexedDB has the full image
          url: p.url.startsWith('data:') ? '' : p.url,
        })),
      };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(lightSettings));
    } catch {}
  }
}

// Load settings from IndexedDB (or fallback to localStorage)
export async function retrieveSettings(): Promise<GameSettings | null> {
  // 1. First try to load from IndexedDB
  try {
    const db = await openDB();
    const result = await new Promise<GameSettings | null>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get('current_settings');
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });

    if (result && result.photos && result.photos.length > 0) {
      return result;
    }
  } catch (err) {
    console.warn('IndexedDB no disponible para lectura, consultando localStorage:', err);
  }

  // 2. Fallback to localStorage v2
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {}

  // 3. Fallback to older localStorage v1
  try {
    const rawV1 = localStorage.getItem('propuesta_noviazgo_settings_v1');
    if (rawV1) {
      return JSON.parse(rawV1);
    }
  } catch {}

  return null;
}
