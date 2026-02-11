import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import type { AspectPairsSettings } from '../../types/aspectPairs';
import { DEFAULT_ASPECT_PAIRS_SETTINGS } from '../../types/aspectPairs';
import { getUserId } from './helpers';

export default async function loadAspectPairsSettings(): Promise<AspectPairsSettings> {
  const userId = getUserId();
  if (!userId) return DEFAULT_ASPECT_PAIRS_SETTINGS;

  try {
    const docRef = doc(db, 'users', userId, 'data', 'aspectPairsSettings');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { ...DEFAULT_ASPECT_PAIRS_SETTINGS, ...(docSnap.data() as AspectPairsSettings) };
    }
  } catch (e) {
    console.error('Failed to load aspect pairs settings:', e);
  }
  return DEFAULT_ASPECT_PAIRS_SETTINGS;
}
