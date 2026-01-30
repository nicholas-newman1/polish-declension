import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import type { ConjugationDirectionSettings, TranslationDirection } from '../../types/conjugation';
import { getUserId } from './helpers';

function getConjugationSettingsDocPath(direction: TranslationDirection): string {
  return direction === 'pl-to-en' ? 'conjugationSettings-pl-en' : 'conjugationSettings-en-pl';
}

export default async function saveConjugationSettings(
  settings: ConjugationDirectionSettings,
  direction: TranslationDirection
): Promise<void> {
  const userId = getUserId();
  if (!userId) return;

  const docRef = doc(db, 'users', userId, 'data', getConjugationSettingsDocPath(direction));
  await setDoc(docRef, settings);
}
