import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import type { AspectPairsSettings } from '../../types/aspectPairs';
import { getUserId } from './helpers';

export default async function saveAspectPairsSettings(
  settings: AspectPairsSettings
): Promise<void> {
  const userId = getUserId();
  if (!userId) return;

  const docRef = doc(db, 'users', userId, 'data', 'aspectPairsSettings');
  await setDoc(docRef, settings);
}
