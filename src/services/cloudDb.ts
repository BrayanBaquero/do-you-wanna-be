import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { ProposalConfig, ProposalResponseRecord } from '../types';

const PROPOSAL_DOC_ID = 'main_proposal';
const RESPONSE_DOC_ID = 'main_response';

export async function getCloudConfig(): Promise<ProposalConfig | null> {
  try {
    const docRef = doc(db, 'proposals', PROPOSAL_DOC_ID);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as ProposalConfig;
    }
  } catch (error) {
    console.warn('Error al leer de Firestore:', error);
  }
  return null;
}

export async function saveCloudConfig(config: ProposalConfig): Promise<void> {
  try {
    const docRef = doc(db, 'proposals', PROPOSAL_DOC_ID);
    await setDoc(docRef, {
      ...config,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (error) {
    console.error('Error al guardar en Firestore:', error);
    throw error;
  }
}

export function subscribeToCloudConfig(callback: (config: ProposalConfig | null) => void): () => void {
  try {
    const docRef = doc(db, 'proposals', PROPOSAL_DOC_ID);
    return onSnapshot(docRef, (snap) => {
      if (snap.exists()) {
        callback(snap.data() as ProposalConfig);
      } else {
        callback(null);
      }
    }, (error) => {
      console.warn('Error en la suscripcion a Firestore:', error);
    });
  } catch (error) {
    console.warn('No se pudo suscribir a Firestore:', error);
    return () => {};
  }
}

export async function saveCloudResponseRecord(record: ProposalResponseRecord): Promise<void> {
  try {
    const docRef = doc(db, 'responses', RESPONSE_DOC_ID);
    await setDoc(docRef, record, { merge: true });
  } catch (error) {
    console.error('Error al guardar respuesta en Firestore:', error);
    throw error;
  }
}

export async function getCloudResponseRecord(): Promise<ProposalResponseRecord | null> {
  try {
    const docRef = doc(db, 'responses', RESPONSE_DOC_ID);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as ProposalResponseRecord;
    }
  } catch (error) {
    console.warn('Error al obtener respuesta de Firestore:', error);
  }
  return null;
}
