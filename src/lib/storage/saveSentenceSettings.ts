import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import type { SentenceDirectionSettings } from '../../types/sentences';
import type { TranslationDirection } from '../../types/common';
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
