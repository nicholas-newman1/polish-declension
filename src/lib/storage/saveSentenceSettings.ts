import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import type { SentenceDirectionSettings, TranslationDirection } from '../../types/sentences';
import { getUserId } from './helpers';
import { getSentenceSettingsDocPath } from './loadSentenceSettings';

export default async function saveSentenceSettings(
  settings: SentenceDirectionSettings,
  direction: TranslationDirection
): Promise<void> {
  const userId = getUserId();
  if (!userId) return;

  const docRef = doc(db, 'users', userId, 'data', getSentenceSettingsDocPath(direction));
  await setDoc(docRef, settings);
}
