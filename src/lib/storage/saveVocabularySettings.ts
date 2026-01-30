import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import type { VocabularyDirectionSettings, TranslationDirection } from '../../types/vocabulary';
import { getUserId } from './helpers';
import { getVocabularySettingsDocPath } from './loadVocabularySettings';

export default async function saveVocabularySettings(
  settings: VocabularyDirectionSettings,
  direction: TranslationDirection
): Promise<void> {
  const userId = getUserId();
  if (!userId) return;

  const docRef = doc(db, 'users', userId, 'data', getVocabularySettingsDocPath(direction));
  await setDoc(docRef, settings);
}
