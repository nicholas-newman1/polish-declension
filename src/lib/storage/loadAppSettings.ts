import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import type { AppSettings } from '../../types/appSettings';
import { DEFAULT_APP_SETTINGS } from '../../types/appSettings';
import { getUserId } from './helpers';

export default async function loadAppSettings(): Promise<AppSettings> {
  const userId = getUserId();
  if (!userId) return DEFAULT_APP_SETTINGS;

  try {
    const docRef = doc(db, 'users', userId, 'data', 'appSettings');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { ...DEFAULT_APP_SETTINGS, ...(docSnap.data() as AppSettings) };
    }
  } catch (e) {
    console.error('Failed to load app settings:', e);
  }
  return DEFAULT_APP_SETTINGS;
}
