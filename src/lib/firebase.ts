import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  initializeFirestore, 
  persistentLocalCache, 
  persistentMultipleTabManager 
} from 'firebase/firestore';
import firebaseConfigData from '../../firebase-applet-config.json';

const app = getApps().length === 0 ? initializeApp(firebaseConfigData) : getApp();

let dbInstance;
try {
  dbInstance = initializeFirestore(app, {
    localCache: persistentLocalCache({
      tabManager: persistentMultipleTabManager()
    })
  });
} catch {
  dbInstance = getFirestore(app);
}

export const db = dbInstance;
export { app };
