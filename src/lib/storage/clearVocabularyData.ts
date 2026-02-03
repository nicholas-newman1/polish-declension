import { doc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import type { TranslationDirection } from '../../types/common';
import { getUserId, getVocabularyDocPath } from './helpers';

export default async function clearVocabularyData(direction: TranslationDirection): Promise<void> {
  const userId = getUserId();
  if (!userId) return;

  try {
    await deleteDoc(doc(db, 'users', userId, 'data', getVocabularyDocPath(direction)));
  } catch (e) {
    console.error('Failed to clear vocabulary data:', e);
  }
}
