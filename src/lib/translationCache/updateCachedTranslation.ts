import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import getCacheKey from './getCacheKey';

const COLLECTION = 'wordTranslations';

export default async function updateCachedTranslation(
  word: string,
  translation: string,
  context?: string
): Promise<void> {
  const cacheKey = getCacheKey(word, context);
  const docRef = doc(db, COLLECTION, cacheKey);
  await setDoc(docRef, {
    translation,
    updatedAt: serverTimestamp(),
  });
}

