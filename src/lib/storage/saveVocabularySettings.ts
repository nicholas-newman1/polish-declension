import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import type { VocabularySettings } from '../../types/vocabulary';
import { getUserId } from './helpers';

export default async function saveVocabularySettings(
  settings: VocabularySettings
): Promise<void> {
  const userId = getUserId();
  if (!userId) return;

  const docRef = doc(db, 'users', userId, 'data', 'vocabularySettings');
  await setDoc(docRef, settings);
}

